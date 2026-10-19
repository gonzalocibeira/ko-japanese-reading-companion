export interface MascotClip {
  id:string;file:string;routine:string;phase:string;from:string;to:string;loop:boolean;
  frameCount:number;frameRectangles:number[][];frameDurationsMs:number[];durationMs:number;
  bodyAnchor:number[];groundAnchor:number[];mirrorSupported:boolean;
  intendedTravelSpeedPxPerSecondAt256:number;
}
export interface MascotRoutine {id:string;kind:string;pose:string;clips:string[]}
export interface MascotManifest {clips:MascotClip[];routines:MascotRoutine[];staticFallback:string}
export interface MascotStep {clip:MascotClip;duration:number;rest?:boolean}
export interface MascotChoice {id:string;holdMs:number;rest?:boolean;travelLimit?:number}
export const specialRoutines=['samurai','ninja','spirit-magic','straw-hat-adventurer','fishing','bamboo-flute','tea-break','fan-dance'];
/** Only actual pose transitions and exits may connect two unrelated routines. */
export function posePath(clips:MascotClip[],from:string,to:string):MascotClip[] {
  const pending:{state:string;path:MascotClip[]}[]=[{state:from,path:[]}],seen=new Set([from]);
  while(pending.length) {
    const {state,path}=pending.shift()!;
    if(state===to)return path;
    for(const clip of clips) {
      if(clip.loop || clip.from!==state || seen.has(clip.to) || !(clip.routine==='transition' || ['exit','stop'].includes(clip.phase)))continue;
      seen.add(clip.to);pending.push({state:clip.to,path:[...path,clip]});
    }
  }
  throw new Error(`No mascot pose transition: ${from} → ${to}`);
}
export function routineSteps(manifest:MascotManifest,from:string,id:string,holdMs:number):MascotStep[] {
  const routine=manifest.routines.find(r=>r.id===id);
  if(!routine)throw new Error('Unknown mascot routine');
  const clips=routine.clips.map(id=>manifest.clips.find(c=>c.id===id)!);
  if(clips.some(c=>!c))throw new Error('Missing mascot clip');
  const steps=[...posePath(manifest.clips,from,clips[0].from),...clips].map(clip=>({clip,duration:clip.loop?clip.durationMs*Math.max(1,Math.min(routine.kind==='activity'?2:Infinity,Math.ceil(holdMs/clip.durationMs))):clip.durationMs}));
  if(!clips.some(c=>c.loop)) {
    const end=clips.at(-1)!.to,id=end==='seated'?'seated-watch-loop':end==='standing'?'attentive-idle-loop':undefined;
    const idle=manifest.clips.find(c=>c.id===id);if(idle && holdMs>0)steps.push({clip:idle,duration:Math.ceil(holdMs/idle.durationMs)*idle.durationMs});
  }
  if(id==='hover-idle' || id==='floating-travel')steps.push(...posePath(manifest.clips,clips.at(-1)!.to,'standing').map(clip=>({clip,duration:clip.durationMs})));
  return steps;
}
/** Ambient intervals use active-tab time; the click boost expires after a wall-clock minute. */
export class MascotScheduler {
  private nextSpecial:number;
  private bag:string[]=[];
  private previous='';
  private needsRest=true;
  private awakeUntil=0;
  private wasAwake=false;
  private sleepAfter:number;
  private walksSinceSleep=0;
  constructor(private random:()=>number=Math.random,now=0) {this.nextSpecial=now+this.delay();this.sleepAfter=now+180_000;}
  private delay() {return 300_000+this.random()*300_000;}
  isAwake(wallNow:number) {return wallNow<this.awakeUntil;}
  wake(wallNow:number) {this.awakeUntil=wallNow+60_000;this.wasAwake=true;this.needsRest=true;}
  choose(now:number,wallNow=now):MascotChoice {
    const awake=this.isAwake(wallNow);
    if(awake)this.sleepAfter=Math.max(this.sleepAfter,now+180_000);
    if(this.wasAwake && !awake)this.needsRest=true;
    this.wasAwake=awake;
    if(this.needsRest) {
      this.needsRest=false;
      const n=this.random();
      const sleep=!awake && now>=this.sleepAfter && this.walksSinceSleep>=3 && n<.12;
      const holdMs=sleep?60_000+this.random()*60_000:awake?8_000+this.random()*8_000:12_000+this.random()*12_000;
      if(sleep) {this.walksSinceSleep=0;this.sleepAfter=now+holdMs+180_000;}
      return {id:sleep?'sleep':awake || n>=.5?'attentive-idle':'seated-watch',holdMs,rest:true};
    }
    this.needsRest=true;
    if(now>=this.nextSpecial) {
      this.nextSpecial=now+this.delay();
      if(!this.bag.length) {
        this.bag=[...specialRoutines];
        for(let i=this.bag.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.bag[i],this.bag[j]]=[this.bag[j],this.bag[i]];}
        if(this.bag.at(-1)===this.previous)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1)!,this.bag[0]];
      }
      this.previous=this.bag.pop()!;return {id:this.previous,holdMs:awake?2400:1200};
    }
    const n=this.random();
    if(this.walksSinceSleep<3 || n<(awake ? .7 : .65)) {
      this.walksSinceSleep++;
      return {id:awake && this.random()<.12?'trot':'walk',holdMs:1200,travelLimit:awake?96:80};
    }
    if(n<(awake ? .78 : .72))return {id:'floating-travel',holdMs:1200,travelLimit:awake?72:48};
    const ordinary=awake?['read','write','think','groom','stretch','tail-play','meditate','hover-idle','greeting','insight']:['think','groom','stretch','tail-play','read','write','insight'];
    return {id:ordinary[Math.floor(this.random()*ordinary.length)],holdMs:awake?2400:1200};
  }
}
export interface RoamingBounds {left:number;right:number;top:number;bottom:number}
/** Pick a reachable local spot around the last drop, rather than a distant edge. */
export function nearbyDestination(position:{x:number;y:number},home:{x:number;y:number},bounds:RoamingBounds,scale:number,_floating:boolean,random:()=>number=Math.random) {
  const homeX=Math.max(bounds.left,Math.min(bounds.right,home.x));
  const left=Math.max(bounds.left,homeX-180*scale),right=Math.min(bounds.right,homeX+180*scale);
  let x=left+random()*Math.max(0,right-left);
  if(Math.abs(x-position.x)<48*scale)x=position.x-(left+right)/2>0?left:right;
  const y=Math.max(bounds.top,Math.min(bounds.bottom,position.y));
  return {x:Math.max(bounds.left,Math.min(bounds.right,x)),y};
}
export type MascotMotionProfile =
  | {kind:'grounded'} | {kind:'take-off';height:number} | {kind:'land'}
  | {kind:'hover';height:number;bob:number;period:number}
  | {kind:'creep';distance:number} | {kind:'step';distance:number}
  | {kind:'lunge';distance:number;start:number;peak:number;end:number};
/** Distances use the default 128 px character size; artwork remains untouched. */
export function motionProfile(clip:MascotClip):MascotMotionProfile {
  if(clip.id==='take-off')return {kind:'take-off',height:36};
  if(clip.id==='land')return {kind:'land'};
  if(clip.from==='hovering' || clip.from==='floating-travel-travel')return {kind:'hover',height:36,bob:2,period:2400};
  if(clip.phase==='loop') {
    if(clip.routine==='ninja')return {kind:'creep',distance:24};
    if(clip.routine==='fan-dance')return {kind:'step',distance:6};
    if(clip.routine==='samurai')return {kind:'lunge',distance:4,start:.25,peak:.58,end:.92};
    if(clip.routine==='straw-hat-adventurer')return {kind:'lunge',distance:4,start:4/12,peak:7/12,end:11/12};
  }
  return {kind:'grounded'};
}
const unit=(value:number)=>Math.max(0,Math.min(1,value));
export const smoothMotion=(value:number)=>{const p=unit(value);return p*p*(3-2*p);};
export interface MascotMotion {height:number;offsetX:number;creep:number}
/** Pure clip sampling, including an unbroken hover clock across clip boundaries. */
export function sampleMotion(clip:MascotClip,elapsed:number,startHeight=0,hoverTime=0):MascotMotion {
  const profile=motionProfile(clip),p=unit(elapsed/clip.durationMs),cycle=(Math.max(0,elapsed)%clip.durationMs)/clip.durationMs;
  const result={height:0,offsetX:0,creep:0};
  switch(profile.kind) {
    case 'take-off':result.height=startHeight+(profile.height-startHeight)*smoothMotion(p);break;
    case 'land':result.height=startHeight*(1-smoothMotion(p));break;
    case 'hover':result.height=profile.height+profile.bob*Math.sin(2*Math.PI*hoverTime/profile.period);break;
    case 'creep':result.creep=profile.distance*Math.min(2,Math.max(0,elapsed/clip.durationMs));break;
    case 'step':result.offsetX=profile.distance*Math.sin(Math.PI*cycle)**2;break;
    case 'lunge':result.offsetX=profile.distance*(cycle<profile.peak?smoothMotion((cycle-profile.start)/(profile.peak-profile.start)):1-smoothMotion((cycle-profile.peak)/(profile.end-profile.peak)));break;
  }
  return result;
}
export interface MascotTravelTiming {startMs:number;loopMs:number;stopMs:number;speed:number;distance:number}
/** Whole loop counts and integrated ramps guarantee the authored speed is never exceeded. */
export function travelTiming(distance:number,maxSpeed:number,startMs:number,loopMs:number,stopMs:number):MascotTravelTiming {
  const loops=Math.max(1,Math.ceil((distance/maxSpeed*1000-(startMs+stopMs)/2)/loopMs));
  const duration=loops*loopMs;
  return {startMs,loopMs:duration,stopMs,speed:distance/((startMs+stopMs)/2000+duration/1000),distance};
}
export function travelProgress(timing:MascotTravelTiming,phase:string,elapsed:number) {
  if(!timing.distance || (phase==='stop' && elapsed>=timing.stopMs))return 1;
  const integral=(p:number)=>p*p*p-p*p*p*p/2;
  const start=timing.startMs/1000,loop=timing.loopMs/1000,stop=timing.stopMs/1000;
  let seconds=0;
  if(phase==='start')seconds=start*integral(unit(elapsed/timing.startMs));
  if(phase==='loop')seconds=start/2+loop*unit(elapsed/timing.loopMs);
  if(phase==='stop') {const p=unit(elapsed/timing.stopMs);seconds=start/2+loop+stop*(p-integral(p));}
  return unit(seconds*timing.speed/timing.distance);
}
/** Blend only a repeated loop's closing seam; preserve authored exit poses. */
export function loopSeamMix(clip:MascotClip,elapsed:number,duration:number) {
  const cycle=Math.floor(elapsed/clip.durationMs),time=elapsed%clip.durationMs;
  if(!clip.loop || (cycle+1)*clip.durationMs>=duration)return 0;
  const last=clip.frameDurationsMs.at(-1)!;
  const progress=Math.max(0,(time-(clip.durationMs-last))/last);
  return progress*progress*(3-2*progress);
}
