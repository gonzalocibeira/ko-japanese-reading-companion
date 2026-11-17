import {saveDiaryEntry,type DiaryWord} from './photo-diary';
import {createPhotoVision,type PhotoAnalysis,type PhotoRectangle} from './photo-vision';
import {photoTabExpired,screenshotCrop,type PhotoTabSession,type PhotoTabSelection} from './photo-tab-protocol';

interface PhotoSession {
  owner:PhotoTabSession;
  expectedDocumentId?:string;
  source?:Blob;
  vision?:ReturnType<typeof createPhotoVision>;
  request?:{id:string;controller:AbortController};
}

const sessions=new Map<number,PhotoSession>();

function remove(session:PhotoSession) {
  sessions.delete(session.owner.windowId);
  session.request?.controller.abort();
  session.vision?.dispose();
  session.source=undefined;
}

async function cropScreenshot(screenshot:string,selection:PhotoTabSelection):Promise<Blob> {
  const prefix='data:image/png;base64,';
  if(!screenshot.startsWith(prefix))throw new Error('The tab capture could not be decoded.');
  const decoding=decodeScreenshot(screenshot.slice(prefix.length));
  screenshot='';
  const bitmap=await decoding;
  let canvas:OffscreenCanvas;
  try {
    const {x,y,width,height}=screenshotCrop(selection,bitmap);
    canvas=new OffscreenCanvas(width,height);
    const context=canvas.getContext('2d');
    if(!context)throw new Error('The selected area could not be decoded.');
    context.drawImage(bitmap,x,y,width,height,0,0,width,height);
  } finally {bitmap.close();}
  return canvas.convertToBlob({type:'image/png'});
}

function decodeScreenshot(encoded:string) {
  const binary=atob(encoded);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return createImageBitmap(new Blob([bytes],{type:'image/png'}));
}

function startAnalysis(session:PhotoSession,id:string) {
  session.request?.controller.abort();
  const request={id,controller:new AbortController()};
  session.request=request;
  return request;
}

async function analyze(session:PhotoSession,request:NonNullable<PhotoSession['request']>,crop?:PhotoRectangle):Promise<PhotoAnalysis> {
  if(!session.source || request.controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
  session.vision??=createPhotoVision();
  const result=await session.vision.analyze(session.source,crop,request.controller.signal);
  if(request.controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
  return result;
}

async function capture(session:PhotoSession,request:NonNullable<PhotoSession['request']>,view:Promise<Blob>) {
  session.source=undefined;
  const crop=await view;
  if(request.controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
  session.source=crop;
  return analyze(session,request);
}

type PrivateRequest =
  | {type:'photo-tab-private-register';owner:PhotoTabSession;expectedDocumentId?:string}
  | {type:'photo-tab-private-invalidate';windowId?:number;tabId?:number;exceptTabId?:number}
  | {type:'photo-tab-private-tab-owner';windowId:number;tabId:number}
  | {type:'photo-tab-private-bind';id:string;windowId:number;tabId:number;documentId:string}
  | {type:'photo-tab-private-owner'|'photo-tab-private-close';id:string;windowId:number}
  | {type:'photo-tab-private-capture';id:string;windowId:number;requestId:string;screenshot:string;selection:PhotoTabSelection}
  | {type:'photo-tab-private-analyze';id:string;windowId:number;requestId:string;crop?:PhotoRectangle}
  | {type:'photo-tab-private-abort';id:string;windowId:number;requestId:string}
  | {type:'photo-tab-private-save';id:string;windowId:number;crop:PhotoRectangle;word:DiaryWord};

const privateTypes=new Set(['photo-tab-private-register','photo-tab-private-invalidate','photo-tab-private-owner','photo-tab-private-tab-owner','photo-tab-private-bind','photo-tab-private-close',
  'photo-tab-private-capture','photo-tab-private-analyze','photo-tab-private-abort','photo-tab-private-save']);

chrome.runtime.onMessage.addListener((message:PrivateRequest,sender,respond)=>{
  if(!privateTypes.has(message?.type) || sender.id!==chrome.runtime.id || sender.tab || sender.url!==chrome.runtime.getURL('background.js'))return;
  if(message.type==='photo-tab-private-register') {
    const previous=sessions.get(message.owner.windowId);
    if(previous)remove(previous);
    sessions.set(message.owner.windowId,{owner:message.owner,expectedDocumentId:message.expectedDocumentId});respond({ok:true});return;
  }
  if(message.type==='photo-tab-private-invalidate') {
    for(const [windowId,session] of sessions) {
      if((message.windowId===undefined || windowId===message.windowId) &&
        (message.tabId===undefined || session.owner.tabId===message.tabId) && session.owner.tabId!==message.exceptTabId)remove(session);
    }
    respond({ok:true});return;
  }
  const session=sessions.get(message.windowId);
  if(message.type==='photo-tab-private-tab-owner') {
    respond({value:session?.owner.tabId===message.tabId?session.owner:undefined});return;
  }
  if(!session || session.owner.id!==message.id) {respond({error:photoTabExpired});return;}
  if(message.type==='photo-tab-private-bind') {
    const documentId=session.owner.documentId ?? session.expectedDocumentId;
    if(session.owner.tabId!==message.tabId || (documentId && documentId!==message.documentId)) {
      respond({error:photoTabExpired});return;
    }
    session.owner.documentId=message.documentId;
    respond({value:true});return;
  }
  if(message.type==='photo-tab-private-owner') {respond({value:session.owner});return;}
  if(message.type==='photo-tab-private-close') {remove(session);respond({value:true});return;}
  if(message.type==='photo-tab-private-abort') {
    if(message.requestId===session.request?.id)session.request.controller.abort();
    respond({value:true});return;
  }
  if(message.type==='photo-tab-private-save') {
    if(!session.source) {respond({error:photoTabExpired});return;}
    void saveDiaryEntry(session.source,message.crop,message.word).then(()=>respond({value:true}),error=>respond({error:error instanceof Error?error.message:'Could not save to Picture Diary.'}));
    return true;
  }
  if(message.type!=='photo-tab-private-capture' && message.type!=='photo-tab-private-analyze')return;
  const request=startAnalysis(session,message.requestId);
  let job:Promise<PhotoAnalysis>;
  if(message.type==='photo-tab-private-capture') {
    const view=cropScreenshot(message.screenshot,message.selection);
    message.screenshot='';
    job=capture(session,request,view);
  } else job=analyze(session,request,message.crop);
  void job.then(value=>respond({value}),error=>respond({error:error instanceof Error?error.message:'Could not identify objects in this area.'})).finally(()=>{
    if(session.request===request)session.request=undefined;
  });
  return true;
});
