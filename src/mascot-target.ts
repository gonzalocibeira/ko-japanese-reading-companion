import type {Reading,Word} from './shared';
import {hiragana} from './shared';
export interface MascotTextTarget {text:string;offset:number;selection?:boolean;rects?:(start:number,end:number)=>DOMRect[]}
export interface MascotWord {surface:string;lemma:string;reading:string}
const japanese=/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆]/u;
const ignored='script,style,noscript,rt,rp,input,textarea,select,[contenteditable]:not([contenteditable="false"]),ko-mascot,ko-overlay,ko-reading-view';
export function resolveWord(target:MascotTextTarget,words:Word[],readings:Reading[],overrides:Record<string,string>):{word:MascotWord;start:number;end:number}|undefined {
  const corrected=Object.entries(overrides).filter(([word])=>target.text.includes(word)).map(([word,reading])=>{
    let start=target.text.indexOf(word);
    while(start>=0) {if(start<=target.offset && start+word.length>target.offset)return {start,end:start+word.length,word,reading};start=target.text.indexOf(word,start+1);}
  }).filter((v):v is NonNullable<typeof v>=>!!v).sort((a,b)=>b.word.length-a.word.length)[0];
  const token=words.find(w=>w.start<=target.offset && w.end>target.offset);
  if(!token && !corrected)return;
  const start=corrected?.start ?? token!.start,end=corrected?.end ?? token!.end;
  const surface=target.text.slice(start,end);
  if(!japanese.test(surface) || surface.length>80)return;
  if(target.selection && (start!==0 || end!==target.text.length))return;
  let reading:string|undefined=corrected?.reading;
  if(reading===undefined) {
    let cursor=start,value='',unknown=false;
    for(const part of readings) {
      if(part.start<cursor || part.end>end)continue;
      value+=target.text.slice(cursor,part.start)+part.reading;cursor=part.end;if(!part.reading)unknown=true;
    }
    value+=target.text.slice(cursor,end);
    reading=!unknown && !/[\p{Script=Han}々〆]/u.test(value)?hiragana(value):token?.reading;
  }
  if(!reading || reading==='*' || !/^[\p{Script=Hiragana}\p{Script=Katakana}ー\s]+$/u.test(reading))reading='';
  return {word:{surface,lemma:corrected?surface:token?.lemma || surface,reading:hiragana(reading)},start,end};
}
export function wordAt(target:MascotTextTarget,words:Word[],readings:Reading[],overrides:Record<string,string>) {return resolveWord(target,words,readings,overrides)?.word;}
function blocked(node:Node) {
  let element=node instanceof Element?node:node.parentElement;
  while(element) {
    if(element.closest(ignored))return true;
    const root=element.getRootNode();element=root instanceof ShadowRoot?root.host:null;
  }
  return false;
}
/** Read a bounded local block, retaining offsets across adjacent inline nodes. */
export function textTarget(node:Node,offset:number):MascotTextTarget|undefined {
  if(!(node instanceof Text) || blocked(node) || !node.parentElement)return;
  let root:Element=node.parentElement;
  while(root.parentElement && ['inline','contents'].includes(getComputedStyle(root).display))root=root.parentElement;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>blocked(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  let text='',position=-1,count=0,current:Node|null;
  const parts:{node:Text;start:number;end:number}[]=[];
  while((current=walker.nextNode()) && ++count<=256) {
    if(current===node)position=text.length+offset;
    const start=text.length;text+=current.textContent ?? '';
    parts.push({node:current as Text,start,end:text.length});
    if(text.length>10000)break;
  }
  if(position<0 || !japanese.test(text))return;
  const start=Math.max(0,position-450),end=Math.min(text.length,start+1000);
  return {text:text.slice(start,end),offset:position-start,rects:(a,b)=>{
    const boxes:DOMRect[]=[];
    for(const part of parts) {
      const from=Math.max(start+a,part.start),to=Math.min(start+b,part.end);
      if(from>=to || !part.node.isConnected)continue;
      if(part.node.data!==text.slice(part.start,part.end))return [];
      const range=document.createRange();range.setStart(part.node,from-part.start);range.setEnd(part.node,to-part.start);boxes.push(...range.getClientRects());
    }
    return boxes;
  }};
}
export function webTarget(x:number,y:number):MascotTextTarget|undefined {
  let element=document.elementFromPoint(x,y);
  const shadows:ShadowRoot[]=[];
  while(element?.shadowRoot) {
    const root=element.shadowRoot;shadows.push(root);
    const inner=root.elementFromPoint(x,y);if(!inner || inner===element)break;element=inner;
  }
  if(!element || blocked(element))return;
  const doc=document as Document & {caretPositionFromPoint?:(x:number,y:number,options?:{shadowRoots:ShadowRoot[]})=>{offsetNode:Node;offset:number}|null;caretRangeFromPoint?:(x:number,y:number)=>Range|null};
  const caret=doc.caretPositionFromPoint?.(x,y,{shadowRoots:shadows}),range=caret?undefined:doc.caretRangeFromPoint?.(x,y);
  const node=caret?.offsetNode ?? range?.startContainer,offset=caret?.offset ?? range?.startOffset;
  if(!(node instanceof Text) || offset===undefined)return;
  // Caret APIs return the nearest text even in whitespace. Require a glyph hit.
  for(const index of [offset,offset-1]) {
    if(index<0 || index>=node.length)continue;
    const r=document.createRange();r.setStart(node,index);r.setEnd(node,index+1);
    if([...r.getClientRects()].some(b=>x>=b.left && x<=b.right && y>=b.top && y<=b.bottom))return textTarget(node,index);
  }
}
export function selectedTarget(selection:Selection|null=window.getSelection()):MascotTextTarget|undefined {
  if(!selection || selection.isCollapsed || selection.rangeCount!==1 || !selection.anchorNode || !selection.focusNode || blocked(selection.anchorNode) || blocked(selection.focusNode))return;
  const text=selectionText(selection);
  if(!text || text.length>80 || /\s/u.test(text) || !japanese.test(text))return;
  return {text,offset:0,selection:true};
}
export function selectionText(selection:Selection) {
  if(!selection.rangeCount)return '';
  const fragment=selection.getRangeAt(0).cloneContents();fragment.querySelectorAll('rt,rp').forEach(node=>node.remove());
  return (fragment.textContent ?? '').trim();
}
