import {playgroundData} from './playground-data';
import {photoLookupStyles,renderPhotoResults} from './photo-lookup';
import {photoTabExpired,photoTabMoved,validPhotoTabSelection,type PhotoTabSelection} from './photo-tab-protocol';
import type {PhotoAnalysis,PhotoRectangle} from './photo-vision';
import {uiTheme} from './ui-theme';
import {photoTabOverlayStyles} from './photo-tab-overlay-style';
import type {ImageInspectionPhase} from './mascot-inspection';

type Send=(message:unknown)=>Promise<any>;
interface PhotoOverlayOptions {
  onCaptureVisibility?:(hidden:boolean)=>void;
  onRestoreMascotFocus?:()=>void;
  onInspectionPhase?:(phase:ImageInspectionPhase|undefined)=>void;
}

function element<K extends keyof HTMLElementTagNameMap>(tag:K,css?:string,text?:string):HTMLElementTagNameMap[K] {
  const node=document.createElement(tag);
  if(css)node.className=css;
  if(text)node.textContent=text;
  return node;
}

function button(text:string,click:()=>void):HTMLButtonElement {
  const node=element('button','',text);
  node.type='button';node.addEventListener('click',click);return node;
}

function place(node:HTMLElement,{x,y,width,height}:PhotoRectangle) {
  Object.assign(node.style,{left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`});
}

function openOverlay(id:string,send:Send,onClose:()=>void,options:PhotoOverlayOptions,fromMascot:boolean) {
  const listeners=new AbortController();
  const {signal}=listeners;
  const previouslyFocused=document.activeElement;
  const host=document.createElement('ko-photo-lookup');
  const shadow=host.attachShadow({mode:'closed'});
  const style=element('style');style.textContent=uiTheme+photoLookupStyles+photoTabOverlayStyles;
  const surface=element('div','photo-tab-surface');
  const rectangle=element('div','photo-tab-rectangle');rectangle.hidden=true;
  const stage=element('div','photo-tab-stage');stage.hidden=true;
  const panel=element('section','photo-tab-panel');panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Photo Lookup');
  const header=element('header');header.append(element('strong','','Photo Lookup'),button('Close',close));
  const body=element('div');
  panel.append(header,body);surface.append(rectangle);shadow.append(style,surface,stage,panel);
  document.documentElement.append(host);

  let currentRect:PhotoRectangle|undefined;
  let drag:{x:number;y:number;pointerId:number}|undefined;
  let result:ReturnType<typeof renderPhotoResults>|undefined;
  let recording:{requestId:string;geometry:string;moved:boolean}|undefined;
  let capturedHidden=false,geometry=pageGeometry();

  function setCaptureHidden(hidden:boolean) {
    if(capturedHidden===hidden)return;
    capturedHidden=hidden;host.hidden=hidden;
    options.onCaptureVisibility?.(hidden);
  }

  function close() {
    if(signal.aborted)return;
    const restore=shadow.activeElement!==null;
    listeners.abort();result?.dispose();setCaptureHidden(false);host.remove();onClose();
    options.onInspectionPhase?.(undefined);
    if(restore && !document.hidden) {
      if(fromMascot && options.onRestoreMascotFocus)options.onRestoreMascotFocus();
      else if(previouslyFocused instanceof HTMLElement)previouslyFocused.focus({preventScroll:true});
    }
    void send({type:'photo-tab-close',id}).catch(()=>{});
  }

  async function ask<T>(type:string,fields:object={}):Promise<T> {
    if(signal.aborted)throw new DOMException('Cancelled','AbortError');
    const reply=await send({type,id,...fields});
    if(signal.aborted)throw new DOMException('Cancelled','AbortError');
    if(!reply || reply.error)throw new Error(reply?.error ?? photoTabExpired);
    return reply.value as T;
  }

  const feedback=element('p','photo-tab-feedback');feedback.setAttribute('role','status');
  const instructions=element('p','','Drag around the part of the page you want to look up.');
  const selectionActions=element('div','photo-tab-actions');
  const useArea=button('Look up selection',()=>void capture());useArea.classList.add('photo-tab-primary');
  const visibleArea=button('Select visible area',()=>setRect({x:0,y:0,width:innerWidth,height:innerHeight}));
  selectionActions.append(visibleArea,useArea);
  const selectAgain=button('Choose another area',()=>showSelection());
  const openPhoto=button('Open Photo Lookup',()=>{
    void ask('photo-tab-standalone').catch(error=>{feedback.textContent=error.message;});
  });

  function setRect(rect:PhotoRectangle|undefined) {
    currentRect=rect;
    rectangle.hidden=!rect;
    if(rect)place(rectangle,rect);
    useArea.disabled=!rect || !validPhotoTabSelection({rect,viewport:{width:innerWidth,height:innerHeight}});
    feedback.textContent=rect && useArea.disabled ? 'Select an area at least 16 by 16 pixels.' : '';
  }

  function showSelection() {
    options.onInspectionPhase?.('aim');
    result?.dispose();result=undefined;stage.replaceChildren();stage.hidden=true;
    surface.hidden=false;panel.classList.remove('is-left');setRect(undefined);
    body.replaceChildren(instructions,selectionActions,feedback);
    visibleArea.focus({preventScroll:true});
  }

  function updateDrag(event:PointerEvent) {
    if(drag?.pointerId!==event.pointerId)return;
    const x=Math.min(innerWidth,Math.max(0,event.clientX));
    const y=Math.min(innerHeight,Math.max(0,event.clientY));
    setRect({x:Math.min(drag.x,x),y:Math.min(drag.y,y),width:Math.abs(drag.x-x),height:Math.abs(drag.y-y)});
  }

  surface.addEventListener('pointerdown',event=>{
    if(event.button!==0 || drag)return;
    event.preventDefault();surface.setPointerCapture(event.pointerId);drag={x:event.clientX,y:event.clientY,pointerId:event.pointerId};
    updateDrag(event);
  },{signal});
  surface.addEventListener('pointermove',updateDrag,{signal});
  surface.addEventListener('pointerup',event=>{
    if(drag?.pointerId!==event.pointerId)return;
    updateDrag(event);drag=undefined;
    if(!useArea.disabled)useArea.focus({preventScroll:true});
  },{signal});
  surface.addEventListener('pointercancel',()=>{drag=undefined;setRect(undefined);},{signal});
  surface.addEventListener('wheel',event=>event.preventDefault(),{passive:false,signal});

  async function capture() {
    const selection:PhotoTabSelection|undefined=currentRect && {rect:currentRect,viewport:{width:innerWidth,height:innerHeight}};
    if(recording || !selection || !validPhotoTabSelection(selection))return;
    const request={requestId:crypto.randomUUID(),geometry:pageGeometry(),moved:false};
    recording=request;
    // Let Chromium paint a clean frame before the worker captures the tab.
    setCaptureHidden(true);
    try {
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
      const analysis=await ask<PhotoAnalysis>('photo-tab-capture',{selection,requestId:request.requestId});
      setCaptureHidden(false);
      if(!signal.aborted)showResults(selection.rect,analysis,request.moved || request.geometry!==pageGeometry());
    } catch(error) {
      if(signal.aborted)return;
      setCaptureHidden(false);
      const message=error instanceof Error?error.message:'Could not look up this area.';
      if(message===photoTabMoved) {
        showSelection();feedback.textContent=message;return;
      }
      feedback.textContent=message;
      options.onInspectionPhase?.(undefined);
      const actions=element('div','photo-tab-actions');actions.append(selectAgain,openPhoto);
      body.replaceChildren(feedback,actions);surface.hidden=true;
      selectAgain.focus({preventScroll:true});
    } finally {recording=undefined;setCaptureHidden(false);}
  }

  function captured(capturedId:string,requestId:string) {
    if(capturedId!==id || signal.aborted || !recording || recording.requestId!==requestId)return;
    surface.hidden=true;
    feedback.textContent='Identifying objects…';
    body.replaceChildren(feedback);
    setCaptureHidden(false);
    options.onInspectionPhase?.('scan');
  }

  function hideMisalignedStage() {
    stage.hidden=true;
    result?.setStageAvailable(false);
    feedback.textContent='The page moved. Use the object list, or choose another area.';
  }

  function showResults(rect:PhotoRectangle,initialAnalysis:PhotoAnalysis,moved:boolean) {
    options.onInspectionPhase?.(initialAnalysis.detections.length?'reveal':'aim');
    surface.hidden=true;stage.hidden=false;place(stage,rect);
    panel.classList.toggle('is-left',rect.x>panel.clientWidth+12 && rect.x+rect.width>innerWidth-panel.clientWidth-12);
    result=renderPhotoResults({data:playgroundData,initialAnalysis,detachStage:true,
      onObjectSelect:()=>options.onInspectionPhase?.('focus'),
      analyze:async (crop,cancel)=>{
        const requestId=crypto.randomUUID();
        const stop=()=>void ask('photo-tab-abort',{requestId}).catch(()=>{});
        if(cancel.aborted)throw new DOMException('Cancelled','AbortError');
        cancel.addEventListener('abort',stop,{once:true});
        options.onInspectionPhase?.('scan');
        try {
          const recrop=await ask<PhotoAnalysis>('photo-tab-analyze',{requestId,crop});
          if(!cancel.aborted)options.onInspectionPhase?.(recrop.detections.length?'reveal':'aim');
          return recrop;
        } catch(error) {
          if(!signal.aborted && !cancel.aborted)options.onInspectionPhase?.('aim');
          throw error;
        }
        finally {cancel.removeEventListener('abort',stop);}
      },
      save:async (crop,hit)=>{await ask('photo-tab-save',{crop,word:{word:hit.headword,reading:hit.reading,meaning:hit.meaning}});},
      dictionary:hit=>{void ask('photo-tab-dictionary',{hit}).catch(error=>{feedback.textContent=error.message;});}
    });
    feedback.textContent='';
    stage.append(result.stage);body.replaceChildren(selectAgain,feedback,result.element);
    if(moved)hideMisalignedStage();
    selectAgain.focus({preventScroll:true});
  }

  function pageGeometry() {
    const view=window.visualViewport;
    return [innerWidth,innerHeight,scrollX,scrollY,view?.width,view?.height,view?.offsetLeft,view?.offsetTop,view?.scale].join('/');
  }

  function viewportChanged(event:Event) {
    const target=event.target;
    const nested=event.isTrusted && event.type==='scroll' && target instanceof Element &&
      target!==host && target!==document.documentElement && target!==document.body && target.getRootNode()!==shadow;
    const next=pageGeometry();
    if(geometry===next && !nested)return;
    geometry=next;
    if(recording) {recording.moved=true;return;}
    if(result) {hideMisalignedStage();return;}
    if(!currentRect)return;
    drag=undefined;setRect(undefined);feedback.textContent=photoTabMoved;
  }

  function check(expectedId:string,requestId?:string) {
    if(expectedId!==id || signal.aborted || document.hidden || !host.isConnected)return {ok:false};
    if(requestId===undefined)return {ok:true};
    if(!recording || requestId!==recording.requestId)return {ok:false};
    if(recording.moved || recording.geometry!==pageGeometry())return {ok:false,moved:true};
    return {ok:true};
  }

  window.addEventListener('keydown',event=>{
    if(event.key==='Escape' && !event.defaultPrevented) {event.preventDefault();close();}
  },{signal});
  window.addEventListener('pagehide',close,{signal});
  window.addEventListener('resize',viewportChanged,{signal});
  window.addEventListener('scroll',viewportChanged,{signal,capture:true});
  for(const type of ['resize','scroll'])window.visualViewport?.addEventListener(type,viewportChanged,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)close();},{signal});
  showSelection();
  return {close,captured,check};
}

export function installPhotoTabOverlay(send:Send,options:PhotoOverlayOptions={}) {
  let active:ReturnType<typeof openOverlay>|undefined;
  let pendingId:string|undefined;
  chrome.runtime.onMessage.addListener((message,sender,respond)=>{
    if(sender.id!==chrome.runtime.id || sender.tab || sender.url!==chrome.runtime.getURL('background.js'))return;
    if(message?.type==='photo-tab-overlay-check') {
      respond(active?.check(message.id,message.requestId) ?? {ok:pendingId===message.id && message.requestId===undefined && !document.hidden});return;
    }
    if(message?.type==='photo-tab-overlay-captured') {active?.captured(message.id,message.requestId);return;}
    if(message?.type!=='photo-tab-overlay-open' || typeof message.id!=='string' || !document.documentElement || document.hidden)return;
    active?.close();
    const id=String(message.id);pendingId=id;
    // The browser supplies the top-frame document ID to the service worker
    // when this message arrives. Do not infer document identity from its URL.
    void send({type:'photo-tab-bind',id}).then(reply=>{
      if(!reply?.value || pendingId!==id || document.hidden) {respond({ok:false});return;}
      active=openOverlay(id,send,()=>{active=undefined;},options,message.fromMascot===true);
      respond({ok:true});
    },()=>respond({ok:false})).finally(()=>{if(pendingId===id)pendingId=undefined;});
    return true;
  });
  return ()=>{pendingId=undefined;active?.close();};
}
