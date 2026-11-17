import {decodePhoto,photoCrop,type PhotoAnalysis,type PhotoDetection,type PhotoRectangle,type VisionRequest,type VisionResponse} from './photo-vision';

interface Cactus {
 HEAPU8:Uint8Array;
 _malloc(length:number):number;
 _free(pointer:number):void;
 _cactus_load(pointer:number,length:bigint):number;
 _cactus_models():number;
 _cactus_describe(pixels:number,width:number,height:number,options:number,language:number,keywords:number,out:number,capacity:number):number;
 UTF8ToString(pointer:number,capacity?:number):string;
}

const thread=self as unknown as DedicatedWorkerGlobalScope & {
 createCactus?: (options:{wasmBinary:ArrayBuffer})=>Promise<Cactus>;
};
const encoder=new TextEncoder();
const options=encoder.encode(JSON.stringify({sections:['objects'],fields:['bbox','score','mask'],mask_format:'polygons',max_objects:30})+'\0');
const language=encoder.encode('en\0');
const resultCapacity=512*1024;
let runtime:Promise<Cactus>|undefined;

function malloc(engine:Cactus,length:number) {
 const pointer=engine._malloc(length);
 if(!pointer)throw new Error('This image needs more memory. Try a smaller crop.');
 return pointer;
}

async function loadRuntime() {
 const base=new URL('vision/',thread.location.href);
 if(!thread.createCactus)thread.importScripts(new URL('cactus.js',base).href);
 if(!thread.createCactus)throw new Error('The bundled Mirage runtime could not start.');
 const [wasm,response]=await Promise.all([fetch(new URL('cactus.wasm',base)),fetch(new URL('mirage.cact',base))]);
 if(!wasm.ok || !response.ok)throw new Error('The bundled Mirage runtime or model is unavailable.');
 const engine=await thread.createCactus({wasmBinary:await wasm.arrayBuffer()});
 const model=new Uint8Array(await response.arrayBuffer()),pointer=malloc(engine,model.length);
 try {
  engine.HEAPU8.set(model,pointer);
  if(engine._cactus_load(pointer,BigInt(model.length))<0 || !(engine._cactus_models()&4))throw new Error('The bundled Mirage model could not load.');
 } finally {engine._free(pointer);}
 return engine;
}

function getRuntime() {
 return runtime ??= loadRuntime().catch(error=>{runtime=undefined;throw error;});
}

function objects(raw:string,region:PhotoRectangle):PhotoDetection[] {
 const scene:unknown=JSON.parse(raw);
 if(typeof scene!=='object' || !scene || !('objects' in scene) || !Array.isArray(scene.objects))throw new Error('Mirage could not read this image. Try a smaller crop.');
 const scale=(value:number,length:number)=>Math.min(1000,Math.max(0,value))*length/1000;
 const x=(value:number)=>region.x+scale(value,region.width);
 const y=(value:number)=>region.y+scale(value,region.height);
 const detections:PhotoDetection[]=[];
 for(const [index,item] of scene.objects.slice(0,30).entries()) {
  if(!item || typeof item.name!=='string' || !Number.isFinite(item.score) || !Array.isArray(item.bbox) || item.bbox.length!==4 || !item.bbox.every(Number.isFinite))continue;
  const label=item.name.replace(/[\u0000-\u001f\u007f-\u009f]/gu,' ').trim().slice(0,80);
  const [left,top,right,bottom]=item.bbox;
  const box={x:x(left),y:y(top),width:x(right)-x(left),height:y(bottom)-y(top)};
  if(!label || box.width<=0 || box.height<=0)continue;
  const polygons:number[][][]=[];
  for(const outline of Array.isArray(item.mask)?item.mask.slice(0,24):[]) {
   if(!Array.isArray(outline) || outline.length<6 || outline.length>4096 || outline.length%2 || !outline.every(Number.isFinite))continue;
   const points:number[][]=[];
   for(let i=0;i<outline.length;i+=2)points.push([x(outline[i]),y(outline[i+1])]);
   polygons.push(points);
  }
  // Mirage can reuse its entity ID for multiple physical instances.
  detections.push({id:String(index),label,score:Math.min(1,Math.max(0,item.score)),box,...(polygons.length?{polygons}:{})});
 }
 return detections;
}

function describe(engine:Cactus,rgba:Uint8ClampedArray,width:number,height:number,region:PhotoRectangle) {
 const pixelBytes=width*height*3;
 const buffer=malloc(engine,pixelBytes+options.length+language.length+resultCapacity);
 const optionsPtr=buffer+pixelBytes,languagePtr=optionsPtr+options.length,resultPtr=languagePtr+language.length;
 try {
  const heap=engine.HEAPU8;
  for(let source=0,target=buffer;source<rgba.length;source+=4,target+=3) {
   heap[target]=rgba[source];heap[target+1]=rgba[source+1];heap[target+2]=rgba[source+2];
  }
  heap.set(options,optionsPtr);heap.set(language,languagePtr);
  if(engine._cactus_describe(buffer,width,height,optionsPtr,languagePtr,0,resultPtr,resultCapacity)<0)throw new Error('Mirage could not read this image. Try a smaller crop.');
  return objects(engine.UTF8ToString(resultPtr,resultCapacity),region);
 } finally {engine._free(buffer);}
}

async function analyze(job:VisionRequest,isStale:()=>boolean):Promise<PhotoAnalysis> {
 const image=await decodePhoto(job.source);
 try {
  const region=photoCrop(job.crop,image.width,image.height);
  const engine=await getRuntime();
  if(isStale())throw new DOMException('Photo lookup cancelled','AbortError');
  const ratio=Math.min(1,1024/Math.max(region.width,region.height));
  const width=Math.max(1,Math.round(region.width*ratio)),height=Math.max(1,Math.round(region.height*ratio));
  const canvas=new OffscreenCanvas(width,height),context=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
  if(!context)throw new Error('This browser could not prepare the image.');
  context.fillStyle='white';context.fillRect(0,0,width,height);
  context.drawImage(image,region.x,region.y,region.width,region.height,0,0,width,height);
  const detections=describe(engine,context.getImageData(0,0,width,height).data,width,height,region);
  return {width:image.width,height:image.height,detections};
 } finally {image.close();}
}

const queued=new Map<number,VisionRequest>();
let current:VisionRequest|undefined,cancelled=false;
function reply(value:VisionResponse) {thread.postMessage(value);}
async function work() {
 if(current)return;
 for(const [id,job] of queued) {
  queued.delete(id);current=job;cancelled=false;
  try {const analysis=await analyze(job,()=>cancelled);if(!cancelled)reply({id,analysis});}
  catch(error) {if(!cancelled)reply({id,error:error instanceof Error?error.message:'Photo Lookup could not finish.'});}
  finally {current=undefined;}
 }
}
thread.onmessage=({data}:MessageEvent<VisionRequest|{cancel:number}>)=>{
 if('cancel' in data) {queued.delete(data.cancel);if(current?.id===data.cancel)cancelled=true;return;}
 if(queued.size>=4) {reply({id:data.id,error:'Photo Lookup is busy. Try again shortly.'});return;}
 queued.set(data.id,data);void work();
};
