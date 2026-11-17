import {ensureOffscreen} from './offscreen-client';
import {photoTabExpired,photoTabMoved,photoTabNeedsGesture,photoTabUnavailable,validPhotoRectangle,validPhotoTabSelection,type PhotoTabOwner,type PhotoTabSession} from './photo-tab-protocol';

const tabTypes=new Set(['photo-tab-capture','photo-tab-analyze','photo-tab-abort','photo-tab-save','photo-tab-dictionary','photo-tab-standalone','photo-tab-bind','photo-tab-close']);
const inFlight=new Map<number,{tabId:number;id:string;cancelled:boolean}>();
const screenshotLimit=48*1024*1024;
const popupUrl=chrome.runtime.getURL('popup.html');

function clearCaptures(filter:{windowId?:number;tabId?:number;exceptTabId?:number}) {
  for(const [windowId,capture] of inFlight) {
    if((filter.windowId===undefined || windowId===filter.windowId) && (filter.tabId===undefined || capture.tabId===filter.tabId) && capture.tabId!==filter.exceptTabId)capture.cancelled=true;
  }
  void chrome.runtime.sendMessage({type:'photo-tab-private-invalidate',...filter}).catch(()=>{});
}

chrome.tabs.onActivated.addListener(({windowId,tabId})=>clearCaptures({windowId,exceptTabId:tabId}));
chrome.tabs.onUpdated.addListener((tabId,change,tab)=>{
  // SPA history changes and internal navigation can update the URL while the
  // original content script is still active. Let the document ID decide.
  if(change.status==='complete')void closeAfterNavigation(tabId,tab.windowId);
});
chrome.tabs.onRemoved.addListener(tabId=>clearCaptures({tabId}));
chrome.tabs.onDetached.addListener(tabId=>clearCaptures({tabId}));

function isIdentifier(value:unknown):value is string {
  return typeof value==='string' && /^[a-f0-9-]{36}$/i.test(value);
}

function validText(value:unknown,limit:number):value is string {
  return typeof value==='string' && value.trim().length>0 && value.length<=limit;
}

export async function startPhotoTabLookup(tabId:number,documentId?:string) {
  const tab=await chrome.tabs.get(tabId);
  if(!tab.active || !tab.url || !/^https?:\/\//i.test(tab.url))return {error:photoTabUnavailable};
  const owner:PhotoTabSession={id:crypto.randomUUID(),tabId,windowId:tab.windowId};
  await ensureOffscreen();
  const registered=await chrome.runtime.sendMessage({type:'photo-tab-private-register',owner,expectedDocumentId:documentId});
  if(!registered?.ok)return {error:photoTabUnavailable};
  try {
    const current=await chrome.tabs.get(tabId);
    if(!current.active || current.windowId!==owner.windowId)throw new Error(photoTabExpired);
    const options=documentId?{documentId}:{frameId:0};
    const reply=await chrome.tabs.sendMessage(tabId,{type:'photo-tab-overlay-open',id:owner.id,fromMascot:!!documentId},options);
    if(reply?.ok)return {ok:true};
  } catch { /* A protected page or a page that has changed cannot show the overlay. */ }
  await close(owner);
  return {error:photoTabUnavailable};
}

function close(owner:Pick<PhotoTabOwner,'id'|'windowId'>) {
  const job=inFlight.get(owner.windowId);
  if(job?.id===owner.id)job.cancelled=true;
  return chrome.runtime.sendMessage({type:'photo-tab-private-close',...owner}).catch(()=>{});
}

async function documentError(owner:PhotoTabOwner,requestId?:string) {
  try {
    const reply=await chrome.tabs.sendMessage(owner.tabId,{type:'photo-tab-overlay-check',id:owner.id,requestId},{documentId:owner.documentId});
    return reply?.ok ? undefined : reply?.moved ? photoTabMoved : photoTabExpired;
  } catch {return photoTabExpired;}
}

async function closeAfterNavigation(tabId:number,windowId:number) {
  const reply=await chrome.runtime.sendMessage({type:'photo-tab-private-tab-owner',tabId,windowId}).catch(()=>undefined);
  const owner=reply?.value as PhotoTabOwner|undefined;
  if(owner?.documentId && await documentError(owner))await close(owner);
}

async function getOwner(id:string,sender:chrome.runtime.MessageSender) {
  if(sender.frameId!==0 || sender.tab?.id===undefined || !sender.documentId)return undefined;
  const reply=await chrome.runtime.sendMessage({type:'photo-tab-private-owner',id,windowId:sender.tab.windowId}).catch(()=>undefined);
  const owner=reply?.value as PhotoTabOwner|undefined;
  return owner?.tabId===sender.tab.id && owner.documentId===sender.documentId ? owner : undefined;
}

async function capture(owner:PhotoTabOwner,requestId:string,selection:unknown) {
  if(!validPhotoTabSelection(selection))return {error:'Choose an area at least 16 by 16 pixels within this tab.'};
  const pending=inFlight.get(owner.windowId);
  if(pending)return {error:'A capture is already running in this window. Try again.'};
  const job={tabId:owner.tabId,id:owner.id,cancelled:false};
  inFlight.set(owner.windowId,job);
  try {
    const verify=async()=>{
      const current=await chrome.tabs.get(owner.tabId);
      if(job.cancelled || !current.active || current.windowId!==owner.windowId)return photoTabExpired;
      return documentError(owner,requestId);
    };
    const before=await verify();
    if(before || job.cancelled)return {error:before ?? photoTabExpired};
    let screenshot:string;
    try {screenshot=await chrome.tabs.captureVisibleTab(owner.windowId,{format:'png'});}
    catch(error) {
      if(/activeTab|permission/i.test(String(error)))return {error:photoTabNeedsGesture};
      throw error;
    }
    const after=await verify();
    if(after || job.cancelled)return {error:after ?? photoTabExpired};
    if(screenshot.length>screenshotLimit)return {error:'This tab capture is too large. Paste a smaller image into Photo Lookup.'};
    void chrome.tabs.sendMessage(owner.tabId,{type:'photo-tab-overlay-captured',id:owner.id,requestId},{documentId:owner.documentId}).catch(()=>{});
    const request=chrome.runtime.sendMessage({type:'photo-tab-private-capture',id:owner.id,windowId:owner.windowId,requestId,screenshot,selection});
    screenshot='';
    const result=await request;
    return job.cancelled ? {error:photoTabExpired} : result;
  } finally {
    if(inFlight.get(owner.windowId)===job)inFlight.delete(owner.windowId);
  }
}

type TabRequest={type:string;id:string;requestId?:unknown;selection?:unknown;crop?:unknown;
  word?:{word?:unknown;reading?:unknown;meaning?:unknown};
  hit?:{id?:unknown;bucket?:unknown;headword?:unknown;reading?:unknown}};

async function run(message:TabRequest,sender:chrome.runtime.MessageSender) {
  if(message.type==='photo-tab-bind') {
    const {id:tabId,windowId}=sender.tab!;
    const tab=await chrome.tabs.get(tabId!);
    if(!tab.active || tab.windowId!==windowId)return {error:photoTabExpired};
    return chrome.runtime.sendMessage({type:'photo-tab-private-bind',id:message.id,tabId,windowId,documentId:sender.documentId});
  }
  const owner=await getOwner(message.id,sender);
  if(!owner)return {error:photoTabExpired};
  if(message.type==='photo-tab-close') {
    return close(owner);
  }
  const {id,windowId}=owner;
  if(message.type==='photo-tab-standalone') {
    await chrome.tabs.create({url:chrome.runtime.getURL('playgrounds.html?tool=photo'),windowId});
    return {value:true};
  }
  if(message.type==='photo-tab-dictionary') {
    const hit=message.hit;
    if(!hit || typeof hit.id!=='string' || !/^\d{1,12}$/.test(hit.id) || typeof hit.bucket!=='string' || !/^[a-f0-9]{2}$/.test(hit.bucket) ||
      !validText(hit.headword,80) || !validText(hit.reading,80))return {error:'This Dictionary entry is unavailable.'};
    const url=new URL(chrome.runtime.getURL('playgrounds.html'));
    url.search=new URLSearchParams({dictionaryId:hit.id,dictionaryBucket:hit.bucket,dictionaryWord:hit.headword,dictionaryReading:hit.reading}).toString();
    await chrome.tabs.create({url:url.href,windowId});
    return {value:true};
  }
  if(message.type==='photo-tab-save') {
    const {crop,word}=message;
    if(!validPhotoRectangle(crop) || !word || !validText(word.word,100) || !validText(word.reading,100) || !validText(word.meaning,500))return {error:'This selection is unavailable for saving.'};
    return chrome.runtime.sendMessage({type:'photo-tab-private-save',id,windowId,crop,word});
  }
  if(!isIdentifier(message.requestId))return {error:photoTabExpired};
  const requestId=message.requestId;
  if(message.type==='photo-tab-capture')return capture(owner,requestId,message.selection);
  if(message.type==='photo-tab-abort')return chrome.runtime.sendMessage({type:'photo-tab-private-abort',id,windowId,requestId});
  const crop=message.crop;
  if(crop!==undefined && !validPhotoRectangle(crop))return {error:'The selected crop is invalid.'};
  return chrome.runtime.sendMessage({type:'photo-tab-private-analyze',id,windowId,requestId,crop});
}

chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(sender.id!==chrome.runtime.id)return;
  if(message?.type==='photo-tab-start') {
    if(sender.tab || sender.url!==popupUrl || !Number.isSafeInteger(message.tabId) || message.tabId<0)return;
    void startPhotoTabLookup(message.tabId).then(respond,()=>respond({error:photoTabUnavailable}));
    return true;
  }
  if(sender.frameId!==0 || sender.tab?.id===undefined || !sender.documentId)return;
  if(sender.documentLifecycle && sender.documentLifecycle!=='active' && message?.type!=='photo-tab-close')return;
  if(message?.type==='photo-tab-mascot-start') {
    void startPhotoTabLookup(sender.tab.id,sender.documentId).then(respond,()=>respond({error:photoTabUnavailable}));
    return true;
  }
  if(!tabTypes.has(message?.type) || !isIdentifier(message.id))return;
  void run(message,sender).then(respond,()=>respond({error:message.type==='photo-tab-capture' ? photoTabUnavailable : 'Photo Lookup could not finish. Try again.'}));
  return true;
});
