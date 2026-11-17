import {mascotPreferences} from './mascot-preferences';

interface Visit {visible:boolean;greet:boolean}
export interface MascotVisitStatus {visible:boolean;available:boolean;reload:boolean;error?:string}
const key=(tabId:number)=>`mascotVisit:${tabId}`;
// Also awaited by the preference writer, so migration cannot overwrite a new choice.
export const mascotMigration=(async()=>{
  const state=await chrome.storage.local.get(['mascot','mascotOnDemandV1']);
  if(state.mascotOnDemandV1===true)return;
  await chrome.storage.local.set({mascot:{...mascotPreferences(state.mascot),enabled:false},mascotOnDemandV1:true});
})();
const pending=new Map<number,Promise<unknown>>();
function serial<T>(tabId:number,work:()=>Promise<T>):Promise<T> {
  const next=(pending.get(tabId) ?? Promise.resolve()).catch(()=>{}).then(async()=>{await mascotMigration;return work();});
  pending.set(tabId,next);
  void next.finally(()=>{if(pending.get(tabId)===next)pending.delete(tabId);}).catch(()=>{});
  return next;
}
async function visit(tabId:number):Promise<Visit|undefined> {
  const value=(await chrome.storage.session.get(key(tabId)))[key(tabId)] as Partial<Visit>|undefined;
  return value && typeof value.visible==='boolean'?{visible:value.visible,greet:value.greet===true}:undefined;
}
async function status(tabId:number,override?:Visit):Promise<MascotVisitStatus> {
  const tab=await chrome.tabs.get(tabId);
  if(!/^https?:/.test(tab.url ?? ''))return {visible:override?.visible ?? (await visit(tabId))?.visible ?? false,available:false,reload:false,error:'Kōくん cannot appear on this browser-protected page. He can join you on a regular website.'};
  try {
    const reply=await chrome.tabs.sendMessage(tabId,{type:'mascot-render-status'},{frameId:0});
    if(typeof reply?.visible!=='boolean')throw new Error('Old content script');
    return {visible:reply.visible,available:true,reload:false};
  } catch {
    return {visible:override?.visible ?? (await visit(tabId))?.visible ?? false,available:false,reload:true,error:'Reload this tab to bring Kōくん here. Some browser-protected pages cannot show him.'};
  }
}
export function changeMascotVisit(tabId:number,visible?:boolean) {
  return serial(tabId,async()=>{
    const current=await status(tabId);
    const next:Visit={visible:visible ?? !current.visible,greet:false};next.greet=next.visible;
    await chrome.storage.session.set({[key(tabId)]:next});
    try {
      const reply=await chrome.tabs.sendMessage(tabId,{type:'mascot-visit',visible:next.visible,greet:next.greet},{frameId:0});
      if(reply?.ok!==true)throw new Error('Content script unavailable');
      await chrome.storage.session.set({[key(tabId)]:{...next,greet:false}});
    } catch { /* The next document consumes the pending visit when it is ready. */ }
    return status(tabId,next);
  });
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  const fromPage=sender.frameId===0 && sender.tab?.id!==undefined && /^https?:/.test(sender.url ?? '');
  const fromExtension=sender.id===chrome.runtime.id && sender.url?.startsWith(chrome.runtime.getURL(''));
  let job:Promise<unknown>|undefined;
  if(message?.type==='mascot-preferences-ready' && fromExtension)job=mascotMigration.then(()=>({ok:true}));
  else if(message?.type==='mascot-visit-ready' && fromPage) {
    const tabId=sender.tab!.id!;
    job=serial(tabId,async()=>{
      const current=await visit(tabId);
      await chrome.action.setBadgeText({tabId,text:''});
      if(current?.greet)await chrome.storage.session.set({[key(tabId)]:{...current,greet:false}});
      return {visible:current?.visible,greet:current?.greet ?? false};
    });
  } else if(message?.type==='mascot-visit-change' && (fromPage || fromExtension)) {
    const tabId=fromPage?sender.tab!.id:message.tabId;
    if(Number.isInteger(tabId) && tabId>=0 && (message.visible===undefined || typeof message.visible==='boolean'))job=changeMascotVisit(tabId,message.visible);
  } else if(message?.type==='mascot-visit-status' && fromExtension && Number.isInteger(message.tabId)) {
    job=serial(message.tabId,()=>status(message.tabId));
  }
  if(!job)return;
  void job.then(respond,()=>respond({error:'Could not update Kōくん. Try again.'}));return true;
});
chrome.commands.onCommand.addListener((command,tab)=>{
  if(command!=='toggle-mascot')return;
  void (async()=>{
    const target=tab?.id===undefined?(await chrome.tabs.query({active:true,lastFocusedWindow:true}))[0]:tab;
    if(target?.id===undefined)return;
    const result=await changeMascotVisit(target.id);
    await chrome.action.setBadgeText({tabId:target.id,text:result.available?'':'!'});
    if(!result.available)await chrome.action.setTitle({tabId:target.id,title:`Kōくん — ${result.error}`});
  })().catch(()=>{});
});
chrome.tabs.onRemoved.addListener(tabId=>{void serial(tabId,()=>chrome.storage.session.remove(key(tabId))).catch(()=>{});});
