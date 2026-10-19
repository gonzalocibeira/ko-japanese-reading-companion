import {test,expect,chromium,type Browser} from '@playwright/test';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
let browser:Browser,driver:string;
test.beforeAll(async()=>{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true});
  const compiled=await build({stdin:{contents:`import {Mascot} from './src/mascot';import {mascotPreferences} from './src/mascot-preferences';import {routineSteps,MascotScheduler} from './src/mascot-motion';window.chrome={runtime:{getURL:path=>'https://playback.test/'+path}};const pet=new Mascot({send:async()=>({}),savePosition:async()=>{},overrides:()=>({}),obstacle:()=>undefined});window.h={pet,routineSteps,Scheduler:MascotScheduler,preferences:mascotPreferences};pet.update(mascotPreferences({enabled:true}),false,'playback.test');`,resolveDir:resolve('.')},bundle:true,write:false,format:'iife',platform:'browser'});driver=compiled.outputFiles[0].text;
});
test.afterAll(async()=>{await browser?.close();});
async function setup() {
  const page=await browser.newPage({viewport:{width:1100,height:900}});
  await page.route('https://playback.test/**',async route=>{
    const file=new URL(route.request().url()).pathname;
    if(file.startsWith('/art/ko-kun/') || file.startsWith('/art/fonts/')) {await route.fulfill({body:await readFile(`public${file}`),contentType:file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':file.endsWith('.ttf')?'font/ttf':'image/webp'});}
    else await route.fulfill({contentType:'text/html',body:'<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#eee7d6;font:14px system-ui}</style><h1>Production Kōくん player — browser verification</h1>'});
  });
  await page.goto('https://playback.test/');await page.addScriptTag({content:driver});await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.manifest?.clips.length)).toBe(56);return page;
}
async function movementHarness() {
  const page=await setup();
  await page.evaluate(()=>{
    const h=(window as any).h,p=h.pet;
    h.start=(id:string,size=128,position={x:500,y:600})=>{
      p.suspend();p.settings=h.preferences({enabled:true,size});p.step=undefined;p.image=undefined;p.state='standing';p.position={...position};p.home={...position};
      p.flightHeight=0;p.offsetX=0;p.hoverTime=0;p.journey=undefined;p.motionCancelled=false;p.mirrored=false;
      p.destination=['walk','trot','floating-travel'].includes(id)?{x:position.x+120,y:position.y}:undefined;
      p.queue=h.routineSteps(p.manifest,'standing',id,4800);p.beginStep();p.suspend();
    };
    h.sample=async(elapsed:number)=>{
      p.elapsed=elapsed;p.image=await p.decode(p.step.clip.file);p.move(elapsed);p.painting='';p.draw();
      return {display:p.displayPosition(),ground:{...p.position},height:p.flightHeight,offset:p.offsetX};
    };
    h.next=()=>{p.state=p.step.clip.to;p.beginStep();p.suspend();};
  });
  return page;
}
test('production canvas player renders all 672 frames and mirrored anchors exactly; all routine poses are visible',async()=>{
  test.setTimeout(60000);const page=await setup();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet;p.suspend();
    const expected=document.createElement('canvas');expected.width=expected.height=256;const ctx=expected.getContext('2d')!;
    let comparisons=0;const mismatches:string[]=[];
    for(const clip of p.manifest.clips) {
      const image=await p.decode(clip.file);p.step={clip,duration:clip.durationMs};p.image=image;
      for(const mirror of [false,true])for(let i=0,elapsed=0;i<clip.frameCount;elapsed+=clip.frameDurationsMs[i++]) {
        p.elapsed=elapsed;p.mirrored=mirror;p.painting='';p.draw();
        ctx.clearRect(0,0,256,256);ctx.save();if(mirror) {ctx.translate(256,0);ctx.scale(-1,1);}
        const [x,y,w,height]=clip.frameRectangles[i];ctx.drawImage(image,x,y,w,height,0,0,256,256);ctx.restore();
        const actual=p.context.getImageData(0,0,256,256).data,wanted=ctx.getImageData(0,0,256,256).data;
        if(actual.some((v:number,n:number)=>v!==wanted[n]))mismatches.push(`${clip.id}:${i}:${mirror}`);comparisons++;
      }
    }
    const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(6,176px);gap:6px;margin:12px';
    for(const routine of p.manifest.routines) {
      const clip=p.manifest.clips.find((c:any)=>c.id===routine.clips.find((id:string)=>id.includes('loop'))) ?? p.manifest.clips.find((c:any)=>c.id===routine.clips[0]);
      p.image=await p.decode(clip.file);p.step={clip,duration:clip.durationMs};p.elapsed=clip.durationMs/2;p.mirrored=false;p.painting='';p.draw();
      const cell=document.createElement('div'),canvas=document.createElement('canvas');canvas.width=canvas.height=256;canvas.style.cssText='display:block;width:160px;height:160px';canvas.getContext('2d')!.drawImage(p.canvas,0,0);cell.append(canvas,routine.id);grid.append(cell);
    }
    p.host.hidden=true;document.body.append(grid);return {comparisons,mismatches,cacheSize:p.cache.size};
  });
  expect(result).toEqual({comparisons:1344,mismatches:[],cacheSize:6});await page.screenshot({path:'qa/release-1.3/browser-routines.png'});await page.close();
});
test('real playback travels at scaled speed, immediately animates reading with a bubble, exits after a drop, and handles missing strips',async()=>{
  const page=await setup();
  await page.evaluate(()=>{const h=(window as any).h,p=h.pet;p.suspend();p.position={x:400,y:500};p.destination={x:700,y:500};p.queue=h.routineSteps(p.manifest,'standing','walk',10000);p.step=undefined;p.last=0;p.syncPlayback();});
  await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.step?.clip.id)).toBe('walk-loop');
  const start=await page.evaluate(()=>(window as any).h.pet.position.x);await page.waitForTimeout(600);const end=await page.evaluate(()=>(window as any).h.pet.position.x);expect(end-start).toBeGreaterThan(6);expect(end-start).toBeLessThan(20);
  await page.evaluate(()=>(window as any).h.pet.showWord({surface:'日本語',lemma:'日本語',reading:'にほんご'}));
  await expect.poll(()=>page.evaluate(()=>[...document.fonts].some(f=>f.family==='KoKunDotGothic16' && f.status==='loaded'))).toBe(true);
  const before=await page.evaluate(()=>{const p=(window as any).h.pet;return {elapsed:p.elapsed,x:p.position.x,bubbleX:p.bubble.element.getBoundingClientRect().x};});
  await page.waitForTimeout(300);const after=await page.evaluate(()=>{const p=(window as any).h.pet;return {elapsed:p.elapsed,x:p.position.x,bubbleX:p.bubble.element.getBoundingClientRect().x};});
  expect(after.elapsed).toBeGreaterThan(before.elapsed);expect(after.x).toBe(before.x);expect(after.bubbleX).toBe(before.bubbleX);
  await page.evaluate(()=>{const p=(window as any).h.pet;p.lookup.close();p.restAfterDrop();});
  await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.step?.clip.id)).toBe('read-exit');
  await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.step?.clip.id)).toBe('attentive-idle-loop');
  await page.route('https://playback.test/art/ko-kun/missing.webp',route=>route.abort());
  await page.evaluate(()=>{const p=(window as any).h.pet;p.suspend();p.step=undefined;p.queue=[{clip:{...p.manifest.clips.find((c:any)=>c.id==='walk-loop'),file:'missing.webp'},duration:1200}];p.syncPlayback();});
  await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.painting)).toBe('static');expect(await page.evaluate(()=>(window as any).h.pet.failed)).toBe(true);await page.close();
});

test('pixel dialogue grows with word length, wraps long words, and remains within a narrow viewport',async()=>{
  const page=await setup();
  const show=async(surface:string,reading:string)=>{await page.evaluate(({surface,reading})=>(window as any).h.pet.showWord({surface,lemma:surface,reading}),{surface,reading});};
  await show('猫','ねこ');await expect.poll(()=>page.evaluate(()=>[...document.fonts].some(f=>f.family==='KoKunDotGothic16' && f.status==='loaded'))).toBe(true);
  const small=await page.evaluate(()=>(window as any).h.pet.bubble.element.getBoundingClientRect().width);
  await show('日本語読解学習補助機能','にほんごどっかいがくしゅうほじょきのう');const large=await page.evaluate(()=>(window as any).h.pet.bubble.element.getBoundingClientRect().width);
  expect(small).toBeLessThan(200);expect(large).toBeGreaterThan(small+100);expect(large).toBeLessThanOrEqual(480);
  const clip=await page.evaluate(()=>{const p=(window as any).h.pet,b=p.bubble.element.getBoundingClientRect(),s=p.sprite.getBoundingClientRect(),x=Math.max(0,b.x-6),y=Math.max(0,b.y-6);return {x,y,width:Math.min(innerWidth-x,Math.max(b.right,s.right)-x+6),height:Math.min(innerHeight-y,Math.max(b.bottom,s.bottom)-y+6)};});
  await page.screenshot({path:'qa/release-1.3/pixel-bubble.png',clip});
  await page.setViewportSize({width:320,height:480});await show('国際文化交流研究機関'.repeat(5),'こくさいぶんかこうりゅうけんきゅうきかん'.repeat(5));
  const box=await page.evaluate(()=>{const b=(window as any).h.pet.bubble.element,r=b.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,scroll:b.scrollWidth,client:b.clientWidth,radius:getComputedStyle(b).borderRadius};});
  expect(box.left).toBeGreaterThanOrEqual(0);expect(box.right).toBeLessThanOrEqual(320);expect(box.scroll).toBeLessThanOrEqual(box.client);expect(box.radius).toBe('0px');await page.screenshot({path:'qa/release-1.3/pixel-bubble-narrow.png'});await page.close();
});

test('visibility and fullscreen suspend the companion without accumulating a return jump',async()=>{
  const page=await setup();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
  const before=await page.evaluate(()=>({elapsed:(window as any).h.pet.elapsed,raf:(window as any).h.pet.raf,hidden:(window as any).h.pet.host.hidden}));
  expect(before.raf).toBe(0);expect(before.hidden).toBe(true);await page.waitForTimeout(200);expect(await page.evaluate(()=>(window as any).h.pet.elapsed)).toBe(before.elapsed);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));const button=document.createElement('button');button.textContent='Fullscreen test';button.onclick=()=>void document.documentElement.requestFullscreen();document.body.append(button);});
  await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.host.hidden)).toBe(false);await page.getByRole('button',{name:'Fullscreen test',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.host.hidden)).toBe(true);
  await page.evaluate(()=>document.exitFullscreen());await expect.poll(()=>page.evaluate(()=>(window as any).h.pet.host.hidden)).toBe(false);await page.close();
});

test('all 24 routines move continuously at all three sizes and return through authored exits',async()=>{
  test.setTimeout(60000);const page=await movementHarness();
  await page.setViewportSize({width:1400,height:1000});
  for(const size of [96,128,160]) {
    const result=await page.evaluate(async size=>{
      const h=(window as any).h,p=h.pet,failures:string[]=[],grid=document.createElement('div');
      document.querySelector('#movement-grid')?.remove();grid.id='movement-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(6,220px);gap:8px;margin:12px';
      let previews=0;
      for(const routine of p.manifest.routines) {
        h.start(routine.id,size);let previous:any,preview=false;
        while(p.step) {
          const step=p.step,start=await h.sample(0);
          if(previous && Math.hypot(start.display.x-previous.x,start.display.y-previous.y)>1e-7)failures.push(`${routine.id}:${step.clip.id}:boundary`);
          for(const fraction of [.25,.5,.75,1]) {
            const sample=await h.sample(step.duration*fraction),bounds=p.bounds();
            if(sample.display.x<bounds.left || sample.display.x>bounds.right || sample.display.y<bounds.top || sample.display.y>bounds.bottom)failures.push(`${routine.id}:bounds`);
            if(!preview && fraction===.5 && step.clip.routine===routine.id && ['loop','action'].includes(step.clip.phase)) {
              const cell=document.createElement('div'),stage=document.createElement('div'),canvas=document.createElement('canvas');
              cell.style.cssText='background:#fff9ed;border:1px solid #c9bfa9;padding:8px';stage.style.cssText='position:relative;height:200px;border-bottom:1px dashed #9e947f;margin-bottom:6px';
              canvas.width=canvas.height=256;canvas.getContext('2d')!.drawImage(p.canvas,0,0);
              canvas.style.cssText=`position:absolute;width:${size}px;height:${size}px;left:${100-size*160/256+(sample.display.x-500)}px;top:${200-size*218/256+(sample.display.y-600)}px`;
              stage.append(canvas);cell.append(stage,`${routine.id} · ${size}px`);grid.append(cell);preview=true;previews++;
            }
            previous=sample.display;
          }
          if(!p.queue.length)break;h.next();
        }
        if(p.flightHeight!==0 || p.offsetX!==0)failures.push(`${routine.id}:residual-offset`);
        if(p.position.y!==600)failures.push(`${routine.id}:ground-height`);
        const expected=['walk','trot','floating-travel'].includes(routine.id)?620:routine.id==='ninja'?500+48*size/128:500;
        if(Math.abs(p.position.x-expected)>1e-7)failures.push(`${routine.id}:destination:${p.position.x}`);
      }
      p.host.remove();document.body.append(grid);return {failures,previews};
    },size);
    expect(result).toEqual({failures:[],previews:24});
    await page.screenshot({path:`qa/release-1.3/movement-routines-${size}.png`,fullPage:true});
  }
  await page.close();
});

test('flight lands exactly and a reading starts immediately while settling to the same ground',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet,heights:number[]=[],landings:any[]=[];
    for(const id of ['hover-idle','floating-travel','hover-idle']) {
      // Keep the previous landing as the next flight's ground reference.
      const position=landings.at(-1) ?? {x:500,y:600};h.start(id,128,position);
      await h.sample(0);heights.push((await h.sample(600)).display.y);await h.sample(1200);
      while(p.queue.length) {h.next();await h.sample(p.step.duration);}
      landings.push({...p.position});
    }
    h.start('hover-idle');await h.sample(600);p.showWord({surface:'猫',lemma:'猫',reading:'ねこ'});p.suspend();
    const before=p.bubble.element.getBoundingClientRect().y;await h.sample(900);const after=p.bubble.element.getBoundingClientRect().y;
    return {heights,landings,bubbleFollows:after>before,height:p.flightHeight,ground:p.position.y};
  });
  expect(result).toEqual({heights:[582,582,582],landings:[{x:500,y:600},{x:620,y:600},{x:620,y:600}],bubbleFollows:true,height:2.8125,ground:600});
  await page.close();
});

test('dragging and keyboard placement rebase flight at its visible location without residual movement',async()=>{
  const page=await movementHarness();
  await page.evaluate(async()=>{const h=(window as any).h;h.start('hover-idle');await h.sample(1200);});
  const before=await page.evaluate(()=>{const p=(window as any).h.pet,r=p.sprite.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.move(before.x,before.y);await page.mouse.down();await page.mouse.move(before.x+50,before.y+40);await page.mouse.up();
  const drop=await page.evaluate(async()=>{const h=(window as any).h,p=h.pet;p.suspend();const ground={...p.position},home={...p.home};await h.sample(p.step.duration);while(p.queue.length){h.next();await h.sample(p.step.duration);}return {ground,home,final:p.position,height:p.flightHeight,offset:p.offsetX,awake:p.scheduler.isAwake(performance.now())};});
  expect(drop).toEqual({ground:{x:550,y:604},home:{x:550,y:604},final:{x:550,y:604},height:0,offset:0,awake:false});
  await page.evaluate(async()=>{const h=(window as any).h;h.start('hover-idle');await h.sample(1200);h.pet.sprite.focus();});
  await page.keyboard.press('ArrowRight');
  const keyboard=await page.evaluate(async()=>{const h=(window as any).h,p=h.pet;p.suspend();const ground={...p.position};await h.sample(p.step.duration);while(p.queue.length){h.next();await h.sample(p.step.duration);}return {ground,final:p.position,height:p.flightHeight};});
  expect(keyboard).toEqual({ground:{x:520,y:564},final:{x:520,y:564},height:0});await page.close();
});

test('movement respects viewport and panel changes, print suspension, reduced motion and asset fallback',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet;
    h.start('hover-idle',160,{x:500,y:150});await h.sample(1200);const clipped=p.displayPosition(),top=p.bounds().top;
    h.start('walk');await h.sample(p.step.duration);h.next();await h.sample(p.step.duration/2);
    p.options.obstacle=()=>({left:650});p.place();await h.sample(p.step.duration);h.next();await h.sample(p.step.duration);
    const panel={x:p.position.x,right:p.bounds().right};p.options.obstacle=()=>undefined;
    h.start('hover-idle');await h.sample(600);const before={height:p.flightHeight,elapsed:p.elapsed};
    window.dispatchEvent(new Event('beforeprint'));p.tick(999999);const print={hidden:p.host.hidden,height:p.flightHeight,elapsed:p.elapsed};
    window.dispatchEvent(new Event('afterprint'));p.suspend();
    p.settings=h.preferences({enabled:true,motion:'reduced'});p.syncPlayback();const reduced={height:p.flightHeight,offset:p.offsetX,painting:p.painting,raf:p.raf};
    p.settings=h.preferences({enabled:true});h.start('hover-idle');await h.sample(600);p.failed=true;p.syncPlayback();
    return {clipped,top,panel,before,print,reduced,fallback:{height:p.flightHeight,offset:p.offsetX,painting:p.painting,raf:p.raf}};
  });
  expect(result.clipped.y).toBe(result.top);expect(result.panel.x).toBe(result.panel.right);
  expect(result.print).toEqual({hidden:true,...result.before});
  expect(result.reduced).toEqual({height:0,offset:0,painting:'static',raf:0});expect(result.fallback).toEqual(result.reduced);
  await page.setViewportSize({width:320,height:300});
  const bounds=await page.evaluate(()=>{const p=(window as any).h.pet;p.place();return {position:p.displayPosition(),bounds:p.bounds()};});
  expect(bounds.position.x).toBeLessThanOrEqual(bounds.bounds.right);expect(bounds.position.y).toBeLessThanOrEqual(bounds.bounds.bottom);await page.close();
});

test('the active playback clock carries flight height across phases and freezes during suspension or decoding',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet,stopFrame=()=>{cancelAnimationFrame(p.raf);p.raf=0;};
    h.start('hover-idle');await h.sample(1100);p.last=1000;p.tick(1100);stopFrame();
    const boundary={clip:p.step.clip.id,elapsed:p.elapsed,height:p.flightHeight};
    p.image=await p.decode(p.step.clip.file);p.tick(1200);stopFrame();const before={elapsed:p.elapsed,height:p.flightHeight};
    Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));p.tick(50000);
    const hidden={elapsed:p.elapsed,height:p.flightHeight};
    Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));stopFrame();p.tick(100000);stopFrame();
    const resumed={elapsed:p.elapsed,height:p.flightHeight};
    p.image=undefined;p.tick(100100);stopFrame();const decoding={elapsed:p.elapsed,height:p.flightHeight};
    p.image=await p.decode(p.step.clip.file);p.tick(100200);stopFrame();const advanced={elapsed:p.elapsed,height:p.flightHeight};
    return {boundary,before,hidden,resumed,decoding,advanced};
  });
  expect(result.boundary).toEqual({clip:'hover-idle-loop',elapsed:0,height:36});
  expect(result.before.elapsed).toBe(100);expect(result.before.height).toBeGreaterThan(36);
  expect(result.hidden).toEqual(result.before);expect(result.resumed).toEqual(result.before);expect(result.decoding).toEqual(result.before);
  expect(result.advanced.elapsed).toBe(200);expect(result.advanced.height).toBeGreaterThan(result.before.height);await page.close();
});

test('mirrored physical routines respect local bounds and facing before their first movement',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet;
    h.start('walk');p.destination={x:380,y:600};p.queue=h.routineSteps(p.manifest,'standing','walk',4800);p.beginStep();
    const facing=p.mirrored;await h.sample(0);while(p.queue.length){await h.sample(p.step.duration);h.next();}await h.sample(p.step.duration);
    const walking={...p.position};
    h.start('ninja',128,{x:1000,y:600});await h.sample(p.step.duration);h.next();await h.sample(0);const before=p.position.x;await h.sample(p.step.duration);
    const ninja={before,after:p.position.x,facing:p.mirrored};
    h.start('fan-dance',128,{x:88,y:600});p.mirrored=true;await h.sample(p.step.duration);h.next();await h.sample(p.step.duration/4);
    const fan={display:p.displayPosition(),left:p.bounds().left};
    return {facing,walking,ninja,fan};
  });
  expect(result.facing).toBe(true);expect(result.walking).toEqual({x:380,y:600});
  expect(result.ninja.facing).toBe(true);expect(result.ninja.after).toBe(result.ninja.before-48);
  expect(result.fan.display.x).toBe(result.fan.left);await page.close();
});

test('awake standing and seated rests animate subtly, while sleep holds its pose on a low-frequency timer',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet,results=[];
    for(const id of ['attentive-idle','seated-watch','sleep']) {
      h.start(id);while(!p.step.clip.loop)h.next();p.step.rest=true;p.step.duration=60000;
      await h.sample(0);const first=p.canvas.toDataURL();await h.sample(1000);const later=p.canvas.toDataURL();
      p.last=1000;p.tick(1100);const snapshot={id,changed:first!==later,frame:p.painting,slowTimer:!!p.restTimer,raf:!!p.raf};p.suspend();results.push(snapshot);
    }
    return results;
  });
  expect(result).toEqual([
    {id:'attentive-idle',changed:true,frame:'attentive-idle-loop:5:false:0',slowTimer:false,raf:true},
    {id:'seated-watch',changed:true,frame:'seated-watch-loop:5:false:0',slowTimer:false,raf:true},
    {id:'sleep',changed:false,frame:'sleep-loop:0:false:0',slowTimer:true,raf:false}
  ]);
  await page.close();
});

test('word reading immediately preempts every routine with a visible scroll, preserves its location and finishes one cycle',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet,word={surface:'日本語',lemma:'日本語',reading:'にほんご'},results=[];
    await p.decode('read-loop.webp');
    for(const routine of p.manifest.routines) {
      h.start(routine.id);await h.sample(600);
      const before={display:p.displayPosition(),ground:p.position.y,home:{...p.home}};
      p.showWord(word);p.suspend();
      const immediate={clip:p.step.clip.id,elapsed:p.elapsed,painted:p.painting,display:p.displayPosition(),queued:p.queue.map((s:any)=>s.clip.id)};
      await h.sample(600);const animates=p.painting!=='read-loop:0:false:0';await h.sample(p.step.duration);h.next();const exit=p.step.clip.id;await h.sample(p.step.duration);
      results.push({routine:routine.id,immediate,animates,exit,groundUnchanged:p.position.y===before.ground,homeUnchanged:JSON.stringify(p.home)===JSON.stringify(before.home),positionUnchanged:immediate.display.x===before.display.x && immediate.display.y===before.display.y});
      p.lookup.close();p.suspend();
    }
    return results;
  });
  expect(result).toHaveLength(24);
  for(const r of result) {
    expect(r.immediate.clip,r.routine).toBe('read-loop');expect(r.immediate.elapsed,r.routine).toBe(0);
    expect(r.immediate.painted,r.routine).toBe('read-loop:0:false:0');expect(r.immediate.queued,r.routine).toEqual(['read-exit']);
    expect(r,r.routine).toMatchObject({animates:true,exit:'read-exit',groundUnchanged:true,homeUnchanged:true,positionUnchanged:true});
  }
  await page.close();
});

test('resting and sleeping companions read immediately, further words do not freeze the scroll, and reduced motion stays still',async()=>{
  const page=await movementHarness();
  const result=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet,word={surface:'猫',lemma:'猫',reading:'ねこ'},results=[];
    for(const id of ['attentive-idle','seated-watch','sleep']) {
      h.start(id);while(!p.step.clip.loop)h.next();p.step.rest=true;p.step.duration=60000;await h.sample(1000);
      p.showWord(word);p.suspend();const immediate={first:p.step.clip.id,elapsed:p.elapsed,timer:!!p.restTimer};
      await h.sample(1000);const firstReading=p.canvas.toDataURL();await h.sample(1600);const animates=p.canvas.toDataURL()!==firstReading;
      p.showWord({...word,surface:'犬',lemma:'犬',reading:'いぬ'});p.suspend();const noRestart=p.step.clip.id==='read-loop' && p.elapsed===1600;
      p.lookup.close();p.suspend();await h.sample(p.step.duration);h.next();results.push({id,...immediate,animates,noRestart,exit:p.step.clip.id,bubble:p.bubble.open});
      await h.sample(600);p.showWord(word);p.suspend();if(p.step.clip.id!=='read-loop' || p.elapsed!==0)throw new Error('A reading during exit must start immediately');
    }
    p.settings=h.preferences({enabled:true,motion:'reduced'});p.syncPlayback();p.showWord(word);p.suspend();
    return {results,reduced:{painting:p.painting,bubble:p.bubble.open}};
  });
  expect(result.results).toEqual(['attentive-idle','seated-watch','sleep'].map(id=>({id,first:'read-loop',elapsed:0,timer:false,animates:true,noRestart:true,exit:'read-exit',bubble:false})));
  expect(result.reduced).toEqual({painting:'static',bubble:true});
  await page.evaluate(async()=>{const h=(window as any).h,p=h.pet;h.start('read');while(p.step.clip.id!=='read-loop')h.next();await h.sample(1000);p.showWord({surface:'猫',lemma:'猫',reading:'ねこ'});p.suspend();});
  await page.screenshot({path:'qa/release-1.3/word-reading-reaction.png',clip:{x:400,y:340,width:210,height:290}});await page.close();
});

test('click and keyboard activation wake a resting companion for one minute, then restore ambient timing',async()=>{
  const page=await movementHarness();
  await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet;h.start('seated-watch');p.state='seated';p.step=undefined;p.queue=[];p.scheduler=new h.Scheduler(()=>.2);p.plan();p.beginStep();p.suspend();await h.sample(1000);
  });
  const point=await page.evaluate(()=>{const p=(window as any).h.pet,r=p.sprite.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.click(point.x,point.y);
  const click=await page.evaluate(async()=>{
    const h=(window as any).h,p=h.pet;p.suspend();const remaining=p.scheduler.awakeUntil-performance.now(),clips:string[]=[];
    if(!p.step)p.beginStep();
    while(p.step) {clips.push(p.step.clip.id);await h.sample(p.step.duration);if(!p.queue.length)break;h.next();}
    p.state=p.step.clip.to;p.step=undefined;p.plan();p.beginStep();p.suspend();
    const active={duration:p.step.duration,rest:p.step.rest};
    p.scheduler.awakeUntil=performance.now()-1;p.step=undefined;p.queue=[];p.plan();p.beginStep();p.suspend();
    const ambient=p.queue.find((s:any)=>s.rest) ?? p.step;return {remaining,clips,active,ambient:{duration:ambient.duration,rest:ambient.rest}};
  });
  expect(click.remaining).toBeGreaterThan(59000);expect(click.remaining).toBeLessThanOrEqual(60000);
  expect(click.clips).toEqual(['stand-up','greeting-action']);expect(click.active).toEqual({duration:9600,rest:true});expect(click.ambient).toEqual({duration:14400,rest:true});
  await page.evaluate(()=>(window as any).h.pet.sprite.focus());await page.keyboard.press('Enter');
  expect(await page.evaluate(()=>(window as any).h.pet.scheduler.isAwake(performance.now()))).toBe(true);
  await page.evaluate(()=>{const p=(window as any).h.pet;p.scheduler.awakeUntil=0;p.suspend();});await page.keyboard.press('Space');
  expect(await page.evaluate(()=>(window as any).h.pet.scheduler.isAwake(performance.now()))).toBe(true);
  await page.evaluate(()=>{const h=(window as any).h,p=h.pet;p.scheduler.awakeUntil=0;p.settings=h.preferences({enabled:true,motion:'reduced'});p.syncPlayback();p.sprite.focus();});
  await page.keyboard.press('Enter');
  expect(await page.evaluate(()=>{const p=(window as any).h.pet;return {awake:p.scheduler.isAwake(performance.now()),painting:p.painting,raf:p.raf};})).toEqual({awake:false,painting:'static',raf:0});
  await page.close();
});
