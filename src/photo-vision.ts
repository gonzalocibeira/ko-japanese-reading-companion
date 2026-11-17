export interface PhotoRectangle {x:number;y:number;width:number;height:number}
export interface PhotoDetection {
 id:string;label:string;score:number;box:PhotoRectangle;
 polygons?:number[][][];
}
export interface PhotoAnalysis {width:number;height:number;detections:PhotoDetection[]}

const maxPhotoBytes=32*1024*1024;
const maxPhotoPixels=40_000_000;
const maxPhotoSide=16_384;

export function photoCrop(rectangle:PhotoRectangle|undefined,width:number,height:number):PhotoRectangle {
 if(!rectangle)return {x:0,y:0,width,height};
 const {x,y,width:w,height:h}=rectangle;
 if(![x,y,w,h].every(Number.isFinite) || w<=0 || h<=0)throw new Error('Choose a visible area of the image.');
 const left=Math.max(0,Math.floor(x)),top=Math.max(0,Math.floor(y));
 const right=Math.min(width,Math.ceil(x+w)),bottom=Math.min(height,Math.ceil(y+h));
 if(right<=left || bottom<=top)throw new Error('Choose a visible area of the image.');
 return {x:left,y:top,width:right-left,height:bottom-top};
}

export async function decodePhoto(source:Blob):Promise<ImageBitmap> {
 if(!(source instanceof Blob) || !source.size || source.size>maxPhotoBytes)throw new Error('Choose an image up to 32 MB.');
 let image:ImageBitmap;
 try {image=await createImageBitmap(source);}
 catch {throw new Error('Kō could not open this image. Try a PNG, JPEG, or WebP file.');}
 if(image.width>maxPhotoSide || image.height>maxPhotoSide || image.width*image.height>maxPhotoPixels) {
  image.close();throw new Error('This image is too large. Choose a smaller image or screenshot.');
 }
 return image;
}

export interface VisionRequest {id:number;source:Blob;crop?:PhotoRectangle}
export interface VisionResponse {id:number;analysis?:PhotoAnalysis;error?:string}

export function createPhotoVision() {
 type Job={resolve:(result:PhotoAnalysis)=>void;reject:(error:Error)=>void;cleanup:()=>void};
 const pending=new Map<number,Job>();
 let worker:Worker|undefined,sequence=0,disposed=false;
 function stop(error:Error) {
  worker?.terminate();worker=undefined;
  for(const job of pending.values()) {job.cleanup();job.reject(error);}
  pending.clear();
 }
 function start() {
  if(worker)return worker;
  const thread=new Worker(chrome.runtime.getURL('photo-vision-worker.js'));
  worker=thread;
  thread.onmessage=({data}:MessageEvent<VisionResponse>)=>{
   if(thread!==worker)return;
   const job=pending.get(data.id);if(!job)return;
   pending.delete(data.id);job.cleanup();
   if(data.analysis)job.resolve(data.analysis);
   else job.reject(new Error(data.error ?? 'Photo Lookup could not finish. Try again.'));
  };
  const failed=()=>{if(thread===worker)stop(new Error('The local image worker stopped. Try again.'));};
  thread.onerror=failed;thread.onmessageerror=failed;
  return thread;
 }
 function analyze(source:Blob,crop?:PhotoRectangle,signal?:AbortSignal):Promise<PhotoAnalysis> {
  if(disposed || signal?.aborted)return Promise.reject(new DOMException('Photo lookup cancelled','AbortError'));
  if(pending.size>=4)return Promise.reject(new Error('Photo Lookup is busy. Try again shortly.'));
  return new Promise((resolve,reject)=>{
   const thread=start(),id=++sequence;
   const abort=()=>{
    thread.postMessage({cancel:id});pending.delete(id);cleanup();
    reject(new DOMException('Photo lookup cancelled','AbortError'));
   };
   const timer=setTimeout(()=>stop(new Error('Local image analysis took too long. Try a smaller crop.')),60_000);
   const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);};
   pending.set(id,{resolve,reject,cleanup});signal?.addEventListener('abort',abort,{once:true});
   try {thread.postMessage({id,source,crop} satisfies VisionRequest);}
   catch(error){pending.delete(id);cleanup();reject(error);}
  });
 }
 return {analyze,dispose:()=>{disposed=true;stop(new DOMException('Photo lookup closed','AbortError'));}};
}
