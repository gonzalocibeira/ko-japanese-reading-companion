import {mascotPreferences,type MascotPreferences,type MascotPosition} from './mascot-preferences';
import {MascotScheduler,posePath,routineSteps,nearbyDestination,loopSeamMix,motionProfile,sampleMotion,smoothMotion,travelTiming,travelProgress,type MascotManifest,type MascotStep,type MascotTravelTiming} from './mascot-motion';
import {MascotBubble,mascotBubbleStyles} from './mascot-bubble';
import {MascotLookup} from './mascot-lookup';
import type {MascotTextTarget,MascotWord} from './mascot-target';
const asset=(file:string)=>chrome.runtime.getURL(`art/ko-kun/${file}`);
interface MascotOptions {
  send:(request:unknown)=>Promise<any>;
  savePosition:(position:MascotPosition)=>Promise<unknown>;
  overrides:()=>Record<string,string>;
  target?:(x:number,y:number)=>MascotTextTarget|undefined;
  obstacle:()=>DOMRect|undefined;
}
export class Mascot {
  readonly host=document.createElement('ko-mascot');
  private root=this.host.attachShadow({mode:'closed'});
  private sprite:HTMLButtonElement;
  private canvas:HTMLCanvasElement;
  private context:CanvasRenderingContext2D;
  private bubble:MascotBubble;
  private lookup?:MascotLookup;
  private settings=mascotPreferences(undefined);
  private abort=new AbortController();
  private media=matchMedia('(prefers-reduced-motion: reduce)');
  private manifest?:MascotManifest;
  private loading?:Promise<void>;
  private cache=new Map<string,Promise<HTMLImageElement>>();
  private decoded=new Map<string,HTMLImageElement>();
  private scheduler=new MascotScheduler();
  private step?:MascotStep;
  private queue:MascotStep[]=[];
  private state='standing';
  private elapsed=0;
  private activeTime=0;
  private last=0;
  private raf=0;
  private restTimer=0;
  private image?:HTMLImageElement;
  private failed=false;
  private disposed=false;
  private visible=false;
  private size=128;
  private position={x:0,y:0};
  private home={x:0,y:0};
  private initialized=false;
  private mirrored=false;
  private destination?:MascotPosition;
  private journey?:{routine:string;from:MascotPosition;to:MascotPosition;timing:MascotTravelTiming;progress:number;startProgress:number};
  private flightHeight=0;
  private hoverTime=0;
  private offsetX=0;
  private stepOrigin={height:0,hoverTime:0};
  private stepCreep=0;
  private motionCancelled=false;
  private printing=false;
  private ignoreClick=false;
  private drag?:{pointer:number;x:number;y:number;origin:MascotPosition;moved:boolean};
  private painting='';
  constructor(private options:MascotOptions) {
    this.root.innerHTML=`<style>
:host{all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;contain:strict!important;color-scheme:light!important;display:block!important}
:host([hidden]){display:none!important}*{box-sizing:border-box}.sprite{position:absolute;display:block;margin:0;padding:0;border:0;background:transparent;box-shadow:none;pointer-events:auto;cursor:grab;touch-action:none;user-select:none;line-height:0}.sprite:active{cursor:grabbing}.sprite:focus-visible{outline:2px solid #294c66;outline-offset:2px;border-radius:12px}canvas{width:100%;height:100%;pointer-events:none}
${mascotBubbleStyles}
@media print{:host{display:none!important}}
</style><button class="sprite" type="button" aria-label="Kōくん. Click to wake for a minute. Drag to move, or use arrow keys when focused." title="Click to wake Kōくん for a minute; drag to move him"><canvas width="256" height="256" aria-hidden="true"></canvas></button>`;
    this.sprite=this.root.querySelector('button')!;this.canvas=this.root.querySelector('canvas')!;this.context=this.canvas.getContext('2d')!;
    this.bubble=new MascotBubble(options.send,()=>this.lookup?.close());this.root.append(this.bubble.element);
    const resize=new ResizeObserver(()=>{if(this.bubble.open)this.positionBubble();});resize.observe(this.bubble.element);
    this.abort.signal.addEventListener('abort',()=>resize.disconnect(),{once:true});
    this.sprite.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;e.preventDefault();this.lookup?.close();
      this.ignoreClick=false;
      this.drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,origin:this.displayPosition(),moved:false};this.sprite.setPointerCapture(e.pointerId);this.syncPlayback();
    });
    this.sprite.addEventListener('pointermove',e=>{
      if(!this.drag || this.drag.pointer!==e.pointerId)return;
      const dx=e.clientX-this.drag.x,dy=e.clientY-this.drag.y;
      if(!this.drag.moved && Math.hypot(dx,dy)<=3)return;
      if(!this.drag.moved)this.cancelMovement();this.drag.moved=true;
      this.position={x:this.drag.origin.x+dx,y:this.drag.origin.y+dy};this.place();
    });
    const finish=(e:PointerEvent)=>{
      if(!this.drag || this.drag.pointer!==e.pointerId)return;
      const moved=this.drag.moved;this.drag=undefined;
      this.ignoreClick=moved || e.type!=='pointerup';
      if(this.sprite.hasPointerCapture(e.pointerId))this.sprite.releasePointerCapture(e.pointerId);
      if(moved) {this.restAfterDrop();void options.savePosition(this.normalized()).catch(()=>{this.sprite.title='Position could not be saved. Drag again to retry.';});}
      this.syncPlayback();
    };
    this.sprite.addEventListener('pointerup',finish);this.sprite.addEventListener('pointercancel',finish);this.sprite.addEventListener('lostpointercapture',finish);
    this.sprite.addEventListener('click',e=>{
      if(e.detail && this.ignoreClick) {this.ignoreClick=false;return;}
      this.ignoreClick=false;this.wake();
    });
    this.sprite.addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
      e.preventDefault();e.stopPropagation();this.lookup?.close();
      this.cancelMovement();
      this.position.x+=e.key==='ArrowLeft'?-20:e.key==='ArrowRight'?20:0;this.position.y+=e.key==='ArrowUp'?-20:e.key==='ArrowDown'?20:0;
      this.place();this.restAfterDrop();void options.savePosition(this.normalized()).catch(()=>{});
    });
    const signal=this.abort.signal;
    document.addEventListener('visibilitychange',()=>{this.lookup?.close();this.syncPlayback();},{signal});
    document.addEventListener('fullscreenchange',()=>{this.lookup?.close();this.syncPlayback();},{signal});
    this.media.addEventListener('change',()=>this.syncPlayback(),{signal});
    window.addEventListener('resize',()=>{this.lookup?.close();this.place();},{signal});
    window.visualViewport?.addEventListener('resize',()=>{this.lookup?.close();this.place();},{signal});
    window.visualViewport?.addEventListener('scroll',()=>{this.lookup?.close();this.place();},{signal});
    window.addEventListener('beforeprint',()=>{this.printing=true;this.syncPlayback();},{signal});window.addEventListener('afterprint',()=>{this.printing=false;this.syncPlayback();},{signal});
  }
  ownsNode(node:Node) {return node===this.host || this.host.contains(node);}
  owns(event:Event) {return event.composedPath().includes(this.host);}
  get active() {return this.visible;}
  private get reduced() {return this.settings.motion==='reduced' || this.media.matches;}
  update(settings:MascotPreferences,paused:boolean,hostname:string) {
    const previous=this.settings,old=previous.positions[hostname],next=settings.positions[hostname];
    this.settings=settings;
    if(JSON.stringify(old)!==JSON.stringify(next) || !this.initialized) {this.restore(next);this.initialized=true;}
    this.visible=settings.enabled && !paused;
    if(!this.visible) {
      this.lookup?.destroy();this.lookup=undefined;this.host.remove();this.suspend();this.bubble.hide();return;
    }
    if(!this.host.isConnected)document.documentElement.append(this.host);
    if(!this.lookup)this.lookup=new MascotLookup({send:this.options.send,settings:()=>this.settings,overrides:this.options.overrides,owns:e=>this.owns(e),paused:()=>!this.visible || !!this.drag || document.hidden || !!document.fullscreenElement,target:this.options.target,show:word=>this.showWord(word),close:()=>{this.bubble.hide();this.syncPlayback();}});
    if(previous.trigger!==settings.trigger || previous.definitions!==settings.definitions)this.lookup.close();
    this.place();void this.load();this.syncPlayback();
  }
  readerHover(word:MascotWord,contains?:(x:number,y:number)=>boolean) {this.lookup?.hoverWord(word,contains);}
  readerLeave() {this.lookup?.leave();}
  invalidateLookup() {this.lookup?.close();}
  readerSelection(target:MascotTextTarget) {this.lookup?.selection(target);}
  private showWord(word:MascotWord) {
    this.bubble.show(word,this.settings.definitions);this.positionBubble();
    this.startReading();this.syncPlayback();
  }
  private startReading() {
    if(this.manifest && !this.reduced && !this.failed && (this.step?.clip.routine!=='read' || this.step.clip.phase==='exit')) {
      // Reading takes priority immediately, with the scroll already open.
      // Stop roaming at the visible horizontal position. An airborne character
      // settles while reading, without moving his ground or remembered drop area.
      this.position.x=this.displayPosition().x;this.offsetX=0;this.hoverTime=0;
      this.destination=undefined;this.journey=undefined;this.motionCancelled=false;
      this.state='seated';this.step=undefined;
      this.queue=routineSteps(this.manifest,'seated','read',2400).filter(step=>step.clip.phase!=='entry');
      clearTimeout(this.restTimer);this.restTimer=0;this.last=0;
      this.beginStep();this.draw();
    }
  }
  private bounds() {
    const vv=window.visualViewport,width=vv?.width ?? innerWidth,height=vv?.height ?? innerHeight,left=vv?.offsetLeft ?? 0,top=vv?.offsetTop ?? 0;
    this.size=Math.max(16,Math.min(this.settings.size,width-16,height-16));const scale=this.size/256;
    const bounds={left:left+8+160*scale,right:left+width-8-160*scale,top:top+8+218*scale,bottom:top+height-8-38*scale};
    const obstacle=this.options.obstacle();
    if(obstacle && obstacle.left-16-160*scale>bounds.left)bounds.right=Math.min(bounds.right,obstacle.left-16-160*scale);
    bounds.right=Math.max(bounds.left,bounds.right);bounds.bottom=Math.max(bounds.top,bounds.bottom);return bounds;
  }
  private restore(position?:MascotPosition) {
    this.destination=undefined;this.journey=undefined;this.flightHeight=0;this.offsetX=0;this.motionCancelled=!!this.step;
    const b=this.bounds();this.position={x:b.left+(position?.x ?? 1)*(b.right-b.left),y:b.top+(position?.y ?? 1)*(b.bottom-b.top)};
    this.home={...this.position};
  }
  private normalized():MascotPosition {
    const b=this.bounds();return {x:(this.position.x-b.left)/(b.right-b.left || 1),y:(this.position.y-b.top)/(b.bottom-b.top || 1)};
  }
  private place() {
    const b=this.bounds(),before={...this.position};this.position.x=Math.max(b.left,Math.min(b.right,this.position.x));this.position.y=Math.max(b.top,Math.min(b.bottom,this.position.y));
    if(this.journey) {
      const x=Math.max(b.left,Math.min(b.right,this.journey.to.x));
      if(x!==this.journey.to.x || this.position.x!==before.x || this.position.y!==this.journey.from.y) {
        this.journey.from={...this.position};this.journey.to={x,y:this.position.y};this.journey.startProgress=this.journey.progress;
        this.destination={...this.journey.to};
      }
    }
    const anchor=this.step?.clip.groundAnchor ?? [160,218],scale=this.size/256;
    const displayed=this.displayPosition();
    this.sprite.style.cssText=`width:${this.size}px;height:${this.size}px;left:${displayed.x-(this.mirrored?256-anchor[0]:anchor[0])*scale}px;top:${displayed.y-anchor[1]*scale}px`;
    if(this.bubble.open)this.positionBubble();
  }
  private displayPosition() {
    const b=this.bounds(),scale=this.size/128;
    return {x:Math.max(b.left,Math.min(b.right,this.position.x+this.offsetX*scale)),y:Math.max(b.top,Math.min(b.bottom,this.position.y-this.flightHeight*scale))};
  }
  private positionBubble() {
    const bubble=this.bubble.element,vv=window.visualViewport,left=vv?.offsetLeft ?? 0,top=vv?.offsetTop ?? 0,height=vv?.height ?? innerHeight;
    let width=vv?.width ?? innerWidth;
    const obstacle=this.options.obstacle();
    if(obstacle && obstacle.left-left>180)width=Math.min(width,obstacle.left-left-8);
    const sprite=this.sprite.getBoundingClientRect();
    bubble.style.maxWidth=`${Math.min(480,Math.max(32,width-16))}px`;bubble.style.maxHeight=`${Math.max(32,Math.min(340,height*.55))}px`;
    const box=bubble.getBoundingClientRect(),above=sprite.top-box.height-12>=top+8;
    const displayed=this.displayPosition(),x=Math.max(left+8,Math.min(left+width-box.width-8,displayed.x-box.width/2));
    const y=Math.max(top+8,Math.min(top+height-box.height-8,above?sprite.top-box.height-12:sprite.bottom+12));
    bubble.style.left=`${x}px`;bubble.style.top=`${y}px`;bubble.classList.toggle('below',!above);
    bubble.style.setProperty('--tail-x',`${Math.max(x+18,Math.min(x+box.width-24,displayed.x))}px`);bubble.style.setProperty('--tail-y',`${above?y+box.height-2:y-10}px`);
  }
  private async load() {
    if(this.loading || this.manifest || this.failed)return this.loading;
    this.loading=(async()=>{
      try {
        const response=await fetch(asset('manifest.json'));if(!response.ok)throw new Error('Mascot assets unavailable');
        const manifest=await response.json() as MascotManifest;
        if(!Array.isArray(manifest.clips) || manifest.clips.length!==56 || manifest.clips.some(c=>!/^[-a-z]+\.webp$/.test(c.file) || c.frameRectangles.length!==c.frameCount))throw new Error('Invalid mascot assets');
        if(this.disposed)return;this.manifest=manifest;
        // Keep the immediate reading pose decoded even during unrelated routines.
        void this.decode('read-loop.webp').catch(()=>{});
        if(this.bubble.open)this.startReading();
        this.syncPlayback();
      } catch {this.failed=true;this.syncPlayback();}
    })();return this.loading;
  }
  private decode(file:string) {
    let job=this.cache.get(file);
    if(job) {this.cache.delete(file);this.cache.set(file,job);return job;}
    job=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Mascot image unavailable'));image.src=asset(file);});
    this.cache.set(file,job);
    void job.then(image=>{if(!this.disposed && this.cache.get(file)===job)this.decoded.set(file,image);}).catch(()=>{});
    while(this.cache.size>6) {const oldest=[...this.cache.keys()].find(file=>file!=='read-loop.webp')!;this.cache.delete(oldest);this.decoded.delete(oldest);}
    return job;
  }
  private fallback() {
    const key='static';if(this.painting===key)return;this.painting=key;
    this.destination=undefined;this.journey=undefined;this.flightHeight=0;this.offsetX=0;this.hoverTime=0;
    this.step=undefined;this.queue=[];this.state='standing';this.elapsed=0;this.mirrored=false;this.place();
    void this.decode('static-fallback.png').then(image=>{if(this.painting!==key || this.disposed)return;this.context.clearRect(0,0,256,256);this.context.drawImage(image,0,0,256,256);}).catch(()=>{this.sprite.hidden=true;});
  }
  private cancelMovement() {
    this.position=this.displayPosition();this.flightHeight=0;this.offsetX=0;this.hoverTime=0;
    this.journey=undefined;this.destination=undefined;this.motionCancelled=true;
  }
  private restAfterDrop() {
    this.cancelMovement();this.place();
    this.home={...this.position};
    this.destination=undefined;
    if(!this.manifest)return;
    if(this.step)this.step.duration=Math.min(this.step.duration,Math.max(this.step.clip.durationMs,Math.ceil(this.elapsed/this.step.clip.durationMs)*this.step.clip.durationMs));
    const from=this.step?.clip.to ?? this.state;
    const holdMs=this.scheduler.isAwake(performance.now())?9600:14400;
    this.queue=[...posePath(this.manifest.clips,from,'standing').map(clip=>({clip,duration:clip.durationMs})),...routineSteps(this.manifest,'standing','attentive-idle',holdMs).map(step=>({...step,rest:step.clip.loop,duration:step.clip.loop?holdMs:step.duration}))];
  }
  private wake() {
    if(!this.visible || this.reduced || this.failed || !this.manifest || document.hidden || document.fullscreenElement || this.printing)return;
    this.suspend();this.scheduler.wake(performance.now());this.lookup?.close();
    this.destination=undefined;this.journey=undefined;
    const from=this.step?.clip.to ?? this.state;
    if(this.step?.rest) {this.state=from;this.step=undefined;this.elapsed=0;}
    else if(this.step)this.step.duration=Math.min(this.step.duration,Math.max(this.step.clip.durationMs,Math.ceil(this.elapsed/this.step.clip.durationMs)*this.step.clip.durationMs));
    this.queue=[...posePath(this.manifest.clips,from,'standing').map(clip=>({clip,duration:clip.durationMs})),...routineSteps(this.manifest,'standing','greeting',0)];
    this.syncPlayback();
  }
  private suspend() {cancelAnimationFrame(this.raf);clearTimeout(this.restTimer);this.restTimer=0;this.raf=0;this.last=0;this.lookup?.cancel();}
  private syncPlayback() {
    if(this.disposed)return;
    this.host.hidden=document.hidden || !!document.fullscreenElement || this.printing;
    if(!this.visible || this.host.hidden || this.drag) {this.suspend();if(this.reduced || this.failed || !this.manifest)this.fallback();return;}
    if(this.reduced || this.failed || !this.manifest) {this.suspend();this.fallback();return;}
    if(!this.raf && !this.restTimer)this.raf=requestAnimationFrame(now=>this.tick(now));
  }
  private plan() {
    if(!this.manifest)return;
    const next=this.scheduler.choose(this.activeTime,performance.now()),b=this.bounds();
    this.motionCancelled=false;this.journey=undefined;
    if(['walk','trot','floating-travel'].includes(next.id)) {
      this.destination=nearbyDestination(this.position,this.home,b,this.size/128,next.id==='floating-travel');
      const limit=next.travelLimit! * this.size/128;
      this.destination.x=this.position.x+Math.max(-limit,Math.min(limit,this.destination.x-this.position.x));
    } else this.destination=undefined;
    this.queue=routineSteps(this.manifest,this.state,next.id,next.holdMs);
    if(next.rest)this.queue=this.queue.map(step=>step.clip.loop?{...step,duration:step.clip.routine==='sleep'?next.holdMs:Math.ceil(next.holdMs/step.clip.durationMs)*step.clip.durationMs,rest:true}:step);
  }
  private beginStep(carry=0) {
    if(!this.queue.length)this.plan();
    this.step=this.queue.shift();this.elapsed=carry;this.image=undefined;this.painting='';
    const step=this.step;if(!step)return;
    if(step.clip.phase==='start' && this.destination && !this.motionCancelled) {
      const b=this.bounds(),to={x:Math.max(b.left,Math.min(b.right,this.destination.x)),y:this.position.y};
      const loop=this.queue.find(s=>s.clip.routine===step.clip.routine && s.clip.loop),stop=this.queue.find(s=>s.clip.routine===step.clip.routine && s.clip.phase==='stop');
      if(loop && stop) {
        const timing=travelTiming(Math.abs(to.x-this.position.x),loop.clip.intendedTravelSpeedPxPerSecondAt256*this.size/256,step.duration,loop.clip.durationMs,stop.duration);
        loop.duration=timing.loopMs;this.destination=to;
        this.journey={routine:step.clip.routine,from:{...this.position},to,timing,progress:0,startProgress:0};
      }
      this.mirrored=to.x<this.position.x;
    }
    if(step.clip.routine==='ninja' && step.clip.phase==='entry' && !this.motionCancelled) {
      const b=this.localBounds(),direction=this.mirrored?-1:1;
      if((direction>0?b.right-this.position.x:this.position.x-b.left)<48*this.size/128)this.mirrored=this.position.x>(b.left+b.right)/2;
    }
    this.stepOrigin={height:this.flightHeight,hoverTime:this.hoverTime};
    this.stepCreep=0;
    this.image=this.decoded.get(step.clip.file);
    void this.decode(step.clip.file).then(image=>{if(this.step===step && !this.disposed){this.image=image;this.draw();}}).catch(()=>{this.failed=true;this.syncPlayback();});
    // Decode the following strips before a phase boundary, with a six-strip LRU.
    for(const next of this.queue.slice(0,2))void this.decode(next.clip.file).catch(()=>{});
    this.place();
  }
  private localBounds() {
    const b=this.bounds(),homeX=Math.max(b.left,Math.min(b.right,this.home.x)),radius=180*this.size/128;
    return {...b,left:Math.max(b.left,homeX-radius),right:Math.min(b.right,homeX+radius)};
  }
  private move(elapsed:number) {
    if(!this.step || this.step.rest || this.motionCancelled)return;
    const clip=this.step.clip,direction=this.mirrored?-1:1;
    const hover=motionProfile(clip).kind==='hover';
    if(hover)this.hoverTime=this.stepOrigin.hoverTime+elapsed;
    const motion=sampleMotion(clip,elapsed,this.stepOrigin.height,this.hoverTime);
    if(clip.routine==='read' && this.stepOrigin.height>0)motion.height=this.stepOrigin.height*(1-smoothMotion(elapsed/1200));
    this.flightHeight=motion.height;this.offsetX=motion.offsetX*direction;
    if(clip.id==='land' && elapsed>=clip.durationMs)this.hoverTime=0;
    if(this.journey?.routine===clip.routine) {
      const j=this.journey,progress=travelProgress(j.timing,clip.phase,elapsed);
      const remaining=(progress-j.startProgress)/(1-j.startProgress || 1);
      this.position={x:j.from.x+(j.to.x-j.from.x)*Math.max(0,Math.min(1,remaining)),y:j.from.y};j.progress=progress;
      if(clip.phase==='stop' && elapsed>=this.step.duration) {this.journey=undefined;this.destination=undefined;}
    }
    if(motion.creep) {
      const b=this.localBounds(),left=Math.min(b.left,this.position.x),right=Math.max(b.right,this.position.x);
      this.position.x=Math.max(left,Math.min(right,this.position.x+direction*(motion.creep-this.stepCreep)*this.size/128));this.stepCreep=motion.creep;
    }
    this.place();
  }
  private tick(now:number) {
    this.raf=0;
    if(!this.visible || document.hidden || document.fullscreenElement || this.printing || this.reduced || this.drag || this.failed)return;
    const delta=this.last?Math.min(this.step?.rest && this.step.clip.routine==='sleep'?1000:100,now-this.last):0;this.last=now;this.activeTime+=delta;
    if(!this.step)this.beginStep();
    if(this.step && this.image) {
      this.elapsed+=delta;
      while(this.step && this.image) {
        this.move(Math.min(this.elapsed,this.step.duration));
        if(this.elapsed<this.step.duration)break;
        const carry=this.elapsed-this.step.duration;this.state=this.step.clip.to;this.beginStep(carry);
      }
      this.draw();
    }
    if(this.step?.rest && this.step.clip.routine==='sleep')this.restTimer=window.setTimeout(()=>{this.restTimer=0;this.raf=requestAnimationFrame(time=>this.tick(time));},250);
    else this.raf=requestAnimationFrame(time=>this.tick(time));
  }
  private draw() {
    if(!this.step || !this.image)return;
    const clip=this.step.clip,still=this.step.rest && clip.routine==='sleep';let time=still?0:this.elapsed%clip.durationMs,index=0;
    while(index<clip.frameDurationsMs.length-1 && time>=clip.frameDurationsMs[index])time-=clip.frameDurationsMs[index++];
    const mix=still?0:loopSeamMix(clip,this.elapsed,this.step.duration);
    const key=`${clip.id}:${index}:${this.mirrored}:${Math.round(mix*100)}`;if(this.painting===key)return;this.painting=key;
    const [x,y,w,h]=clip.frameRectangles[index];this.context.clearRect(0,0,256,256);this.context.save();
    if(this.mirrored) {this.context.translate(256,0);this.context.scale(-1,1);}
    this.context.globalAlpha=1-mix;this.context.drawImage(this.image,x,y,w,h,0,0,256,256);
    if(mix) {const [a,b,c,d]=clip.frameRectangles[0];this.context.globalAlpha=mix;this.context.globalCompositeOperation='lighter';this.context.drawImage(this.image,a,b,c,d,0,0,256,256);}
    this.context.restore();
  }
  destroy() {this.disposed=true;this.suspend();this.lookup?.destroy();this.abort.abort();this.host.remove();this.cache.clear();this.decoded.clear();}
}
