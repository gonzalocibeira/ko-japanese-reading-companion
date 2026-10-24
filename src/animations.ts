import {uiTheme} from './ui-theme';
import type {MascotClip,MascotManifest,MascotRoutine} from './mascot-motion';

const theme=document.createElement('style');theme.textContent=uiTheme;document.head.append(theme);
const gallery=document.querySelector<HTMLElement>('.gallery')!;
const status=document.querySelector<HTMLElement>('#status')!;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const asset=(file:string)=>chrome.runtime.getURL(`art/ko-kun/${file}`);
type Tile={canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;clips:MascotClip[];images:Map<string,HTMLImageElement>;visible:boolean;elapsed:number;painted:string};
const tiles:Tile[]=[];
let raf=0,last=0;

function paint(tile:Tile) {
  let time=reducedMotion.matches?0:tile.elapsed%tile.clips.reduce((sum,clip)=>sum+clip.durationMs,0);
  let clip=tile.clips[0];
  for(const candidate of tile.clips) {
    clip=candidate;
    if(time<clip.durationMs)break;
    time-=clip.durationMs;
  }
  let frame=0;
  while(frame<clip.frameDurationsMs.length-1 && time>=clip.frameDurationsMs[frame])time-=clip.frameDurationsMs[frame++];
  const image=tile.images.get(clip.file),key=`${clip.id}:${frame}`;
  if(!image?.complete || !image.naturalWidth || tile.painted===key)return;
  const [x,y,w,h]=clip.frameRectangles[frame];
  tile.context.clearRect(0,0,256,256);tile.context.drawImage(image,x,y,w,h,0,0,256,256);tile.painted=key;
}
function tick(now:number) {
  const delta=last?Math.min(now-last,100):0;last=now;
  for(const tile of tiles)if(tile.visible) {tile.elapsed+=delta;paint(tile);}
  raf=requestAnimationFrame(tick);
}
function syncPlayback() {
  cancelAnimationFrame(raf);last=0;
  if(!document.hidden) {
    for(const tile of tiles)if(tile.visible)paint(tile);
    if(!reducedMotion.matches && tiles.some(tile=>tile.visible))raf=requestAnimationFrame(tick);
  }
}
document.addEventListener('visibilitychange',syncPlayback);
reducedMotion.addEventListener('change',syncPlayback);

async function openGallery() {
  const response=await fetch(asset('index.json'));
  if(!response.ok)throw new Error('Gallery unavailable');
  const manifest=await response.json() as MascotManifest;
  const routines=manifest.routines as (MascotRoutine & {name:string})[];
  const assigned=new Set(routines.flatMap(routine=>routine.clips));
  const entries=[...routines.map(routine=>({name:routine.name,clips:routine.clips})),
    ...manifest.clips.filter(clip=>!assigned.has(clip.id)).map(clip=>({name:clip.id.replaceAll('-',' ').replace(/^./,letter=>letter.toUpperCase()),clips:[clip.id]}))];
  const observer=new IntersectionObserver(changes=>{
    for(const change of changes) {
      const tile=tiles.find(tile=>tile.canvas===change.target)!;tile.visible=change.isIntersecting;
      if(tile.visible)for(const clip of tile.clips)if(!tile.images.has(clip.file)) {
        const image=new Image();tile.images.set(clip.file,image);
        image.onload=()=>{tile.painted='';paint(tile);};
        image.onerror=()=>{tile.canvas.closest('figure')!.querySelector('figcaption')!.textContent+=' · unavailable';};
        image.src=asset(clip.file);
      }
    }
    syncPlayback();
  });
  for(const entry of entries) {
    const figure=document.createElement('figure'),canvas=document.createElement('canvas'),caption=document.createElement('figcaption');
    canvas.width=canvas.height=256;canvas.setAttribute('aria-hidden','true');caption.textContent=entry.name;
    figure.append(canvas,caption);gallery.append(figure);
    tiles.push({canvas,context:canvas.getContext('2d')!,clips:entry.clips.map(id=>manifest.clips.find(clip=>clip.id===id)!),images:new Map(),visible:false,elapsed:0,painted:''});
    observer.observe(canvas);
  }
  status.textContent='';
}
void openGallery().catch(()=>{status.textContent='The gallery could not load. Reload this page to try again.';});
