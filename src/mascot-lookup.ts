import {selectedTarget,webTarget,resolveWord,type MascotTextTarget,type MascotWord} from './mascot-target';
import type {MascotPreferences} from './mascot-preferences';
import type {Reading,Word} from './shared';
export interface MascotLookupOptions {
  send:(request:unknown)=>Promise<any>;
  settings:()=>MascotPreferences;
  overrides:()=>Record<string,string>;
  owns:(event:Event)=>boolean;
  paused:()=>boolean;
  target?:(x:number,y:number)=>MascotTextTarget|undefined;
  show:(word:MascotWord)=>void;
  close:()=>void;
}
export class MascotLookup {
  private abort=new AbortController();
  private timer=0;
  private version=0;
  private request?:string;
  private point?:{x:number;y:number};
  private last='';
  private sourceContains?:(x:number,y:number)=>boolean;
  private cache=new Map<string,{words:Word[];readings:Reading[]}>();
  constructor(private options:MascotLookupOptions) {
    const listen=(name:string,fn:(e:any)=>void)=>document.addEventListener(name,fn,{capture:true,passive:true,signal:this.abort.signal});
    listen('pointermove',(e:PointerEvent)=>{
      if(options.settings().trigger!=='hover')return;
      if(this.sourceContains || this.last) {
        if(this.sourceContains?.(e.clientX,e.clientY) && !options.paused() && !e.buttons)return;
        this.close();
      }
      if(e.composedPath().some(node=>node instanceof Element && node.localName==='ko-reading-view'))return;
      if(options.owns(e) || options.paused()) {this.cancel();return;}
      if(options.settings().trigger!=='hover' || e.buttons || e.pointerType==='touch')return;
      if(this.point && Math.hypot(e.clientX-this.point.x,e.clientY-this.point.y)<4)return;
      this.cancel();this.point={x:e.clientX,y:e.clientY};
      this.timer=window.setTimeout(()=>{
        const target=options.target?options.target(e.clientX,e.clientY):webTarget(e.clientX,e.clientY);
        if(target)void this.analyze(target);
      },600);
    });
    listen('pointerout',(e:PointerEvent)=>{if(!e.relatedTarget || e.relatedTarget instanceof Element && e.relatedTarget.localName==='ko-reading-view')this.leave();});
    listen('pointerdown',(e:PointerEvent)=>{this.cancel();if(!options.owns(e))this.close();});
    listen('scroll',(e:Event)=>{if(!options.owns(e))this.close();});
    listen('keydown',(e:KeyboardEvent)=>{if(e.key==='Escape' || !options.owns(e))this.close();});
    listen('compositionstart',()=>this.close());listen('input',()=>this.close());
    listen('selectionchange',()=>{
      this.selectionChanged(selectedTarget);
    });
  }
  selectionChanged(target:()=>MascotTextTarget|undefined) {
    if(this.options.settings().trigger!=='highlight' || this.options.paused())return;
    this.close();this.timer=window.setTimeout(()=>{const selected=target();if(selected)void this.analyze(selected);},180);
  }
  hoverWord(word:MascotWord,contains?:(x:number,y:number)=>boolean) {
    if(this.options.settings().trigger!=='hover' || this.options.paused())return;
    this.close();this.sourceContains=contains;this.timer=window.setTimeout(()=>this.present(word),600);
  }
  selection(target:MascotTextTarget) {
    if(this.options.settings().trigger!=='highlight' || this.options.paused())return;
    this.cancel();void this.analyze(target);
  }
  private present(word:MascotWord) {
    const key=JSON.stringify(word);if(this.last===key)return;this.last=key;this.options.show(word);
  }
  async analyze(target:MascotTextTarget) {
    this.cancel();const version=this.version,corrections=this.options.overrides();
    const key=JSON.stringify([target.text,corrections]);
    let result=this.cache.get(key);
    if(!result) {
      const request=this.request=crypto.randomUUID();
      try {
        const reply=await this.options.send({type:'tokenize',purpose:'mascot',requestId:request,texts:[target.text],includeWords:true,overrides:corrections});
        if(version!==this.version || !reply?.words?.[0] || !reply?.results?.[0])return;
        result={words:reply.words[0],readings:reply.results[0]};
        this.cache.set(key,result);if(this.cache.size>100)this.cache.delete(this.cache.keys().next().value!);
      } catch {return;} finally {if(this.request===request)this.request=undefined;}
    }
    if(version!==this.version || this.options.paused())return;
    const resolved=resolveWord(target,result.words,result.readings,corrections);
    if(resolved) {
      if(!target.selection && target.rects)this.sourceContains=(x,y)=>target.rects!(resolved.start,resolved.end).some(r=>x>=r.left && x<=r.right && y>=r.top && y<=r.bottom);
      this.present(resolved.word);
    }
  }
  cancel() {
    clearTimeout(this.timer);this.timer=0;this.version++;this.point=undefined;
    if(this.request) {void this.options.send({type:'cancel-tokenize',purpose:'mascot',requestId:this.request}).catch(()=>{});this.request=undefined;}
  }
  leave() {if(this.options.settings().trigger==='hover')this.close();else this.cancel();}
  close() {this.cancel();this.sourceContains=undefined;this.point=undefined;this.last='';this.options.close();}
  destroy() {this.close();this.abort.abort();this.cache.clear();}
}
