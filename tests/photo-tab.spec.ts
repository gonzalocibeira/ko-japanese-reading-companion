import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {randomUUID} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {photoTabExpired,photoTabMoved,photoTabNeedsGesture,screenshotCrop,validPhotoTabSelection,type PhotoTabSession} from '../src/photo-tab-protocol';

const selection={rect:{x:21.4,y:35.2,width:250.2,height:105.4},viewport:{width:960,height:540}};

test('tab selection maps CSS bounds to native screenshot pixels at different zoom levels',()=>{
  expect(validPhotoTabSelection(selection)).toBe(true);
  expect(screenshotCrop(selection,{width:960,height:540})).toEqual({x:21,y:35,width:251,height:106});
  expect(screenshotCrop(selection,{width:1200,height:675})).toEqual({x:26,y:44,width:314,height:132});
  expect(screenshotCrop(selection,{width:1920,height:1080})).toEqual({x:42,y:70,width:502,height:212});
  const full={rect:{x:0,y:0,width:960,height:540},viewport:selection.viewport};
  expect(screenshotCrop(full,{width:1439,height:809})).toEqual({x:0,y:0,width:1439,height:809});
  expect(validPhotoTabSelection({...selection,rect:{...selection.rect,x:-1}})).toBe(false);
  expect(validPhotoTabSelection({...selection,rect:{...selection.rect,width:selection.viewport.width}})).toBe(false);
});

interface Message {type:string;id?:string;tabId?:number;owner?:PhotoTabSession;documentId?:string;[key:string]:unknown}
interface Sender {id:string;url:string;frameId?:number;documentId?:string;tab?:{id:number;windowId:number}}
type Listener=(message:Message,sender:Sender,reply:(value:any)=>void)=>void;

async function harness() {
  let messageListener:Listener=()=>{};
  let activation:(info:{windowId:number;tabId:number})=>void=()=>{};
  let updated:(tabId:number,info:{status?:string;url?:string},tab:{windowId:number})=>void=()=>{};
  let owner:PhotoTabSession|undefined;
  let expectedDocumentId:unknown;
  let active=1,captures=0,moved=false,denied=false;
  let url='https://capture.test/',documentId='initial-document';
  const extension='chrome-extension://fixture/';
  const contentMessages:Message[]=[],privateMessages:Message[]=[];
  const event={addListener:()=>{}};
  let releaseCapture=()=>{};
  const screenshot='data:image/png;base64,fixture';
  const fromContent=(document=documentId):Sender=>({id:'fixture',url,frameId:0,documentId:document,tab:{id:1,windowId:5}});
  const chrome={runtime:{id:'fixture',getURL:(file:string)=>extension+file,ContextType:{OFFSCREEN_DOCUMENT:'offscreen'},getContexts:async()=>[{}],
    onMessage:{addListener:(fn:Listener)=>messageListener=fn},
    sendMessage:async(message:Message)=>{
      privateMessages.push(message);
      if(message.type==='photo-tab-private-register'){owner=message.owner;expectedDocumentId=message.expectedDocumentId;return {ok:true};}
      if(message.type==='photo-tab-private-owner')return {value:message.id===owner?.id?owner:undefined};
      if(message.type==='photo-tab-private-tab-owner')return {value:message.tabId===owner?.tabId?owner:undefined};
      if(message.type==='photo-tab-private-bind') {
        const boundDocument=owner?.documentId ?? expectedDocumentId;
        if(!owner || message.id!==owner.id || message.tabId!==owner.tabId || (boundDocument && boundDocument!==message.documentId))return {error:photoTabExpired};
        owner.documentId=message.documentId;return {value:true};
      }
      if(message.type==='photo-tab-private-close' && owner?.id===message.id)owner=undefined;
      if(message.type==='photo-tab-private-invalidate' && owner?.tabId!==message.exceptTabId)owner=undefined;
      if(message.type==='photo-tab-private-capture')return {value:{width:400,height:600,detections:[]}};
      return {ok:true};
    }},tabs:{onUpdated:{addListener:(fn:typeof updated)=>updated=fn},onRemoved:event,onDetached:event,onActivated:{addListener:(fn:typeof activation)=>activation=fn},
    get:async(tabId:number)=>({active:tabId===active,windowId:5,url}),
    sendMessage:async(_id:number,message:Message,options:{documentId?:string})=>{
      contentMessages.push(message);
      if(options.documentId && options.documentId!==documentId)throw new Error('Document unavailable');
      if(message.type==='photo-tab-overlay-open') {
        const reply=await send({type:'photo-tab-bind',id:message.id},fromContent());
        return {ok:reply?.value===true};
      }
      if(message.type==='photo-tab-overlay-check' && message.requestId && moved)return {ok:false,moved:true};
      return {ok:true};
    },
    captureVisibleTab:async()=>{
      captures++;
      if(denied)throw new Error("Either the '<all_urls>' or 'activeTab' permission is required.");
      return new Promise<string>(resolve=>{releaseCapture=()=>resolve(screenshot);});
    }
  }};
  const output=await build({entryPoints:['src/photo-tab-service.ts'],bundle:true,write:false,platform:'browser',format:'iife'});
  runInNewContext(output.outputFiles[0].text,{chrome,crypto:{randomUUID},URL,URLSearchParams});
  const send=(message:Message,sender:Sender)=>new Promise<any>(resolve=>messageListener(message,sender,resolve));
  const start=()=>send({type:'photo-tab-start',tabId:1},{id:'fixture',url:extension+'popup.html'});
  const mascotStart=()=>send({type:'photo-tab-mascot-start'},fromContent());
  const capture=(requestDocument?:string)=>send({type:'photo-tab-capture',id:owner?.id,requestId:randomUUID(),selection},fromContent(requestDocument));
  const activate=(tabId:number)=>{active=tabId;activation({tabId,windowId:5});};
  const changePage=(newUrl:string,newDocument=documentId)=>{
    url=newUrl;documentId=newDocument;
    updated(1,{status:'loading',url},{windowId:5});
    updated(1,{status:'complete'},{windowId:5});
  };
  return {start,mascotStart,capture,activate,changePage,captureCount:()=>captures,release:()=>releaseCapture(),
    move:()=>{moved=true;},deny:()=>{denied=true;},screenshot,contentMessages,privateMessages};
}

test('capture waits for confirmation and only routes image bytes to the offscreen handler',async()=>{
  const browser=await harness();
  expect(await browser.start()).toEqual({ok:true});
  expect(browser.captureCount()).toBe(0);
  const pending=browser.capture();
  await expect.poll(browser.captureCount).toBe(1);
  browser.release();
  await expect(pending).resolves.toEqual({value:{width:400,height:600,detections:[]}});
  expect(browser.privateMessages.find(message=>message.type==='photo-tab-private-capture')?.screenshot).toBe(browser.screenshot);
  expect(browser.contentMessages.map(message=>message.type)).toEqual(['photo-tab-overlay-open','photo-tab-overlay-check','photo-tab-overlay-check','photo-tab-overlay-captured']);
  expect(browser.contentMessages.every(message=>!('screenshot' in message))).toBe(true);
});

test('switching away and back discards an in-flight screenshot',async()=>{
  const browser=await harness();
  await browser.start();
  const pending=browser.capture();
  await expect.poll(browser.captureCount).toBe(1);
  browser.activate(2);browser.activate(1);browser.release();
  expect(await pending).toHaveProperty('error');
  expect(browser.privateMessages.some(message=>message.type==='photo-tab-private-capture')).toBe(false);
});

test('same-document URL changes retain an in-flight capture',async()=>{
  const browser=await harness();
  await browser.start();
  const pending=browser.capture();
  await expect.poll(browser.captureCount).toBe(1);
  browser.changePage('https://capture.test/?image=preview#selected');browser.release();
  await expect(pending).resolves.toHaveProperty('value');
  expect(browser.privateMessages.some(message=>message.type==='photo-tab-private-close')).toBe(false);
});

test('replacing a document at the same URL discards the in-flight screenshot',async()=>{
  const browser=await harness();
  await browser.start();
  const pending=browser.capture();
  await expect.poll(browser.captureCount).toBe(1);
  browser.changePage('https://capture.test/','replacement-document');browser.release();
  await expect(pending).resolves.toEqual({error:photoTabExpired});
  expect(browser.privateMessages.some(message=>message.type==='photo-tab-private-capture')).toBe(false);
});

test('a viewport shift discards captured bytes while retaining the document session',async()=>{
  const browser=await harness();
  await browser.start();
  const pending=browser.capture();
  await expect.poll(browser.captureCount).toBe(1);
  browser.move();browser.release();
  await expect(pending).resolves.toEqual({error:photoTabMoved});
  expect(browser.privateMessages.some(message=>message.type==='photo-tab-private-close' || message.type==='photo-tab-private-capture')).toBe(false);
});

test('the mascot opens a session and directs permission errors to a trusted browser action',async()=>{
  const browser=await harness();
  expect(await browser.mascotStart()).toEqual({ok:true});
  browser.deny();
  await expect(browser.capture()).resolves.toEqual({error:photoTabNeedsGesture});
});
