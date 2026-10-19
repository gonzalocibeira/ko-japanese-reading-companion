import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
import {mascotPreferences} from '../src/mascot-preferences';
import {posePath,routineSteps,MascotScheduler,specialRoutines,nearbyDestination,loopSeamMix,motionProfile,sampleMotion,travelTiming,travelProgress,type MascotManifest} from '../src/mascot-motion';
import {wordAt} from '../src/mascot-target';
const manifest: MascotManifest=JSON.parse(readFileSync('public/art/ko-kun/manifest.json','utf8'));

test('every routine connects from every delivered pose and exits without skipping a costume phase',()=>{
  const states=new Set(manifest.clips.flatMap(c=>[c.from,c.to]));
  expect(manifest.routines).toHaveLength(24);expect(manifest.clips).toHaveLength(56);
  for(const state of states)for(const routine of manifest.routines) {
    const steps=routineSteps(manifest,state,routine.id,5000);let current=state;
    for(const {clip,duration} of steps) {
      expect(clip.from,`${state} → ${routine.id} via ${clip.id}`).toBe(current);current=clip.to;
      expect(duration).toBeGreaterThanOrEqual(clip.durationMs);
      expect(clip.frameDurationsMs.reduce((a,b)=>a+b,0)).toBe(clip.durationMs);
      expect(clip.frameRectangles).toHaveLength(12);
    }
    for(const clip of posePath(manifest.clips,current,'standing')) {expect(clip.from).toBe(current);current=clip.to;}
    expect(current).toBe('standing');
  }
  expect(routineSteps(manifest,'samurai-active','read',5000)[0].clip.id).toBe('samurai-exit');
});
test('ambient scheduler favors local walks, separates actions, and rotates rare specials',()=>{
  let seed=17;const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  const scheduler=new MascotScheduler(random),specials:string[]=[];let previousRest=false,lastSpecial=0,time=0,walks=0,ordinary=0,lastSleep=-180000,walksSinceSleep=0;
  for(let i=0;i<1000;i++) {
    const next=scheduler.choose(time);
    expect(!!next.rest).toBe(!previousRest);previousRest=!!next.rest;
    if(next.rest) {
      if(next.id==='sleep') {
        expect(time-lastSleep).toBeGreaterThanOrEqual(180000);expect(walksSinceSleep).toBeGreaterThanOrEqual(3);
        expect(next.holdMs).toBeGreaterThanOrEqual(60000);expect(next.holdMs).toBeLessThanOrEqual(120000);lastSleep=time+next.holdMs;walksSinceSleep=0;
      } else {expect(next.holdMs).toBeGreaterThanOrEqual(12000);expect(next.holdMs).toBeLessThanOrEqual(24000);}
    }
    else if(specialRoutines.includes(next.id)) {expect(time-lastSpecial).toBeGreaterThanOrEqual(300000);lastSpecial=time;specials.push(next.id);expect(next.holdMs).toBe(1200);}
    else {ordinary++;if(next.id==='walk'){walks++;walksSinceSleep++;}}
    if(next.travelLimit)expect(next.travelLimit).toBeLessThanOrEqual(80);
    time+=next.rest?next.holdMs:9600;
  }
  expect(new Set(specials.slice(0,8))).toEqual(new Set(specialRoutines));
  for(let i=1;i<specials.length;i++)expect(specials[i]).not.toBe(specials[i-1]);
  expect(walks/ordinary).toBeGreaterThan(.6);
});
test('sleep requires three minutes of active time and at least three walks, even with sleep-favoring randomness',()=>{
  const scheduler=new MascotScheduler(()=>0);
  for(const now of [0,30000,60000]) {
    expect(scheduler.choose(now).id).not.toBe('sleep');expect(scheduler.choose(now+12000).id).toBe('walk');
  }
  expect(scheduler.choose(179999).id).not.toBe('sleep');scheduler.choose(180000);
  expect(scheduler.choose(190000)).toMatchObject({id:'sleep',rest:true,holdMs:60000});
  expect(scheduler.choose(250000).id).toBe('walk');expect(scheduler.choose(260000).id).not.toBe('sleep');
});
test('click wake lasts one wall-clock minute, refreshes without stacking and preserves rests',()=>{
  const scheduler=new MascotScheduler(()=>.2);
  expect(scheduler.choose(0)).toMatchObject({rest:true,holdMs:14400});
  scheduler.wake(1000);expect(scheduler.isAwake(60999)).toBe(true);expect(scheduler.isAwake(61000)).toBe(false);
  expect(scheduler.choose(1000,1000)).toMatchObject({rest:true,holdMs:9600});
  expect(scheduler.choose(10600,10600)).toMatchObject({id:'walk',travelLimit:96});
  expect(scheduler.choose(15000,15000)).toMatchObject({rest:true,holdMs:9600});
  scheduler.wake(30000);expect(scheduler.isAwake(89999)).toBe(true);expect(scheduler.isAwake(90000)).toBe(false);
  expect(scheduler.choose(15000,90000)).toMatchObject({rest:true,holdMs:14400});
});
test('malformed and legacy preferences stay off and retain only finite bounded site positions',()=>{
  for(const value of [undefined,null,[],false,{enabled:'true'}])expect(mascotPreferences(value).enabled).toBe(false);
  const p=mascotPreferences({enabled:true,size:999,trigger:'click',definitions:'both',motion:'unknown',positions:{'one.test':{x:-2,y:5},'two.test':{x:NaN,y:0},'bad/site':{x:0,y:0}}});
  expect(p).toMatchObject({enabled:true,size:128,trigger:'hover',definitions:'off',motion:'system',positions:{'one.test':{x:0,y:1}}});
  expect(Object.keys(p.positions)).toEqual(['one.test']);
  expect(Object.keys(mascotPreferences({positions:Object.fromEntries(Array.from({length:220},(_,i)=>[`site${i}.test`,{x:0,y:0}]))}).positions)).toHaveLength(200);
});
test('lookup resolves surface and lemma, corrections, kana, unknown readings, and rejects partial selections',()=>{
  const words=[{start:0,end:3,lemma:'食べる',reading:'たべた'}];
  expect(wordAt({text:'食べた',offset:1},words,[{start:0,end:1,reading:'た'}],{})).toEqual({surface:'食べた',lemma:'食べる',reading:'たべた'});
  expect(wordAt({text:'食べた',offset:1},words,[],{'食べた':'くべた'})).toEqual({surface:'食べた',lemma:'食べた',reading:'くべた'});
  expect(wordAt({text:'ありがとう',offset:0},[{start:0,end:5,lemma:'ありがとう',reading:'アリガトウ'}],[],{} )?.reading).toBe('ありがとう');
  expect(wordAt({text:'未知',offset:0},[{start:0,end:2,lemma:'未知',reading:'*'}],[{start:0,end:2,reading:''}],{})?.reading).toBe('');
  expect(wordAt({text:'食べた猫',offset:0,selection:true},words,[],{})).toBeUndefined();
});

test('every activity exits after at most two iterations even when a long hold is requested',()=>{
  for(const routine of manifest.routines.filter(r=>r.kind==='activity')) {
    const steps=routineSteps(manifest,'standing',routine.id,60000);
    for(const step of steps.filter(s=>s.clip.loop))expect(step.duration/step.clip.durationMs,routine.id).toBeLessThanOrEqual(2);
    expect(steps.at(-1)!.clip.phase).toBe('exit');
  }
});
test('nearby journeys explore the drop area and stay reachable after viewport or reading-panel changes',()=>{
  const bounds={left:80,right:920,top:120,bottom:770},home={x:700,y:600};
  for(let i=0;i<=100;i++) {
    const destination=nearbyDestination(home,home,bounds,1,true,()=>i/101);
    expect(Math.abs(destination.x-home.x)).toBeLessThanOrEqual(180);expect(Math.abs(destination.y-home.y)).toBeLessThanOrEqual(80);
    expect(destination.x).toBeGreaterThanOrEqual(bounds.left);expect(destination.x).toBeLessThanOrEqual(bounds.right);
  }
  expect(nearbyDestination({x:400,y:600},{x:900,y:600},{...bounds,right:400},1,false,()=>.5)).toEqual({x:310,y:600});
});
test('loop seam smoothing applies only between repeats and preserves the final exit pose',()=>{
  const clip=manifest.clips.find(c=>c.id==='walk-loop')!;
  expect(loopSeamMix(clip,0,2400)).toBe(0);expect(loopSeamMix(clip,1100,2400)).toBe(0);
  expect(loopSeamMix(clip,1150,2400)).toBeCloseTo(.5);
  expect(loopSeamMix(clip,2350,2400)).toBe(0);
  expect(loopSeamMix(manifest.clips.find(c=>c.id==='walk-stop')!,1150,2400)).toBe(0);
});

test('every airborne routine completes its landing before the next routine, without changing ground height',()=>{
  for(const id of ['hover-idle','floating-travel'])for(const from of ['standing','hovering','floating-travel-travel']) {
    const steps=routineSteps(manifest,from,id,5000);
    expect(steps.at(-1)!.clip.id).toBe('land');expect(steps.at(-1)!.clip.to).toBe('standing');
  }
  for(const floating of [false,true])expect(nearbyDestination({x:500,y:600},{x:500,y:400},{left:80,right:900,top:120,bottom:770},1,floating,()=>.2).y).toBe(600);
  const takeoff=manifest.clips.find(c=>c.id==='take-off')!,land=manifest.clips.find(c=>c.id==='land')!,hover=manifest.clips.find(c=>c.id==='hover-idle-loop')!;
  expect(sampleMotion(takeoff,0).height).toBe(0);expect(sampleMotion(takeoff,600).height).toBe(18);expect(sampleMotion(takeoff,1200).height).toBe(36);
  expect(sampleMotion(hover,0,36,0).height).toBe(36);expect(sampleMotion(hover,600,36,600).height).toBe(38);
  expect(sampleMotion(hover,1800,36,1800).height).toBe(34);expect(sampleMotion(hover,2400,36,2400).height).toBe(36);
  for(const start of [0,18,36,38]) {expect(sampleMotion(land,0,start).height).toBe(start);expect(sampleMotion(land,1200,start).height).toBe(0);}
});

test('physical routines have bounded, continuous motion and quiet routines stay planted',()=>{
  const moving=new Set(['walk','trot','hover-idle','floating-travel','ninja','fan-dance','samurai','straw-hat-adventurer']);
  for(const routine of manifest.routines)for(const id of routine.clips) {
    const clip=manifest.clips.find(c=>c.id===id)!;
    if(!moving.has(routine.id)) {
      expect(motionProfile(clip).kind,routine.id).toBe('grounded');expect(sampleMotion(clip,600)).toEqual({height:0,offsetX:0,creep:0});
    }
    if(['fan-dance','samurai','straw-hat-adventurer'].includes(routine.id)) {
      expect(sampleMotion(clip,0).offsetX).toBe(0);expect(sampleMotion(clip,clip.durationMs).offsetX).toBe(0);
      for(let t=0;t<=clip.durationMs;t+=10)expect(Math.abs(sampleMotion(clip,t).offsetX)).toBeLessThanOrEqual(routine.id==='fan-dance'?6:4);
    }
  }
  const ninja=manifest.clips.find(c=>c.id==='ninja-loop')!;
  expect(sampleMotion(ninja,1200).creep).toBe(24);expect(sampleMotion(ninja,2400).creep).toBe(48);expect(sampleMotion(ninja,60000).creep).toBe(48);
});

test('travel ramps preserve whole loops, endpoints, continuity and the scaled maximum speed',()=>{
  for(const size of [96,128,160])for(const distance of [0,1,12,48,300])for(const speed of [30,40,70]) {
    const maxSpeed=speed*size/256,timing=travelTiming(distance,maxSpeed,1200,1200,1200);
    expect(timing.loopMs%1200).toBe(0);expect(timing.loopMs).toBeGreaterThanOrEqual(1200);
    expect(timing.speed).toBeLessThanOrEqual(maxSpeed+1e-9);
    expect(travelProgress(timing,'start',1200)).toBeCloseTo(travelProgress(timing,'loop',0));
    expect(travelProgress(timing,'loop',timing.loopMs)).toBeCloseTo(travelProgress(timing,'stop',0));
    expect(travelProgress(timing,'stop',1200)).toBe(1);
    for(const [phase,duration] of [['start',1200],['loop',timing.loopMs],['stop',1200]] as const) {
      let previous=travelProgress(timing,phase,0);
      for(let time=10;time<=duration;time+=10) {
        const progress=travelProgress(timing,phase,time);
        expect(progress).toBeGreaterThanOrEqual(previous);expect((progress-previous)*distance/.01).toBeLessThanOrEqual(maxSpeed+1e-7);previous=progress;
      }
    }
  }
});
