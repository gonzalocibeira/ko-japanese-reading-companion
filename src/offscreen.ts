import {parseWiktionary} from './wiktionary-parser';
const worker = new Worker(chrome.runtime.getURL('tokenizer.js'));
let dataWorker:Worker|undefined,dataSequence=0;
const dataPending=new Map<number,{resolve:(result:unknown)=>void;timer:ReturnType<typeof setTimeout>}>();
function playgroundWorker() {
  if(dataWorker)return dataWorker;
  const current=new Worker(chrome.runtime.getURL('playground-data-worker.js'));dataWorker=current;
  current.onmessage=({data})=>{const job=dataPending.get(data.id);if(!job)return;clearTimeout(job.timer);dataPending.delete(data.id);job.resolve(data);};
  current.onerror=()=>{current.terminate();dataWorker=undefined;for(const job of dataPending.values()){clearTimeout(job.timer);job.resolve({error:'Local playground worker failed. Try again.'});}dataPending.clear();};
  return current;
}
let next = 0;
const pending = new Map<number, {jobId:string; resolve:(result:unknown)=>void}>();
worker.onmessage = event => { pending.get(event.data.id)?.resolve(event.data); pending.delete(event.data.id); };
worker.onerror = () => { for (const {resolve} of pending.values()) resolve({error:'Tokenizer worker failed'}); pending.clear(); };
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  // Only the service worker may dispatch internal jobs. Content scripts must go
  // through background.ts's batch limits and per-document cancellation queue.
  if (sender.id !== chrome.runtime.id || sender.tab || sender.url !== chrome.runtime.getURL('background.js')) return;
  if(message?.type==='playground-data-job') {
    const current=playgroundWorker(),id=++dataSequence;
    const timer=setTimeout(()=>{dataPending.delete(id);respond({error:'Local playground request timed out. Try again.'});},20000);
    dataPending.set(id,{resolve:respond,timer});current.postMessage({id,query:message.query});return true;
  }
  if(message?.type==='dictionary-parse') {
    if(typeof message.html!=='string' || message.html.length>1_000_000 || !['en','ja'].includes(message.language)) {respond({status:'unsupported',definitions:[]});return;}
    respond(parseWiktionary(message.html,message.language));return;
  }
  if (message?.type === 'worker-release') { worker.postMessage(message); return; }
  if (message?.type === 'worker-cancel') {
    for(const [id,job] of pending) if(job.jobId===message.jobId) {
      worker.postMessage({type:'worker-cancel',id});job.resolve({cancelled:true});pending.delete(id);
    }
    respond({ok:true});return;
  }
  if (message?.type !== 'worker-job') return;
  const id = ++next;
  pending.set(id, {jobId:message.jobId,resolve:respond});
  worker.postMessage({id, key:message.key, texts:message.texts,overrides:message.overrides,includeWords:message.includeWords});
  return true;
});
