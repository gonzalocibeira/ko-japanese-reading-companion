import {uiTheme} from './ui-theme';
import {explorationStyles,type PlaygroundTokenizer} from './exploration';
import {playgroundBrowserStyles,renderPlaygroundBrowser} from './playground-browser';
import {setMimeticLegacyAnimations} from './mimetic-playground';
import type {Word} from './shared';

const style=document.createElement('style');style.textContent=uiTheme+explorationStyles+playgroundBrowserStyles;document.head.append(style);

// A standalone extension page owns its lazy worker. Opening mimetics needs no
// tokenizer, webpage access, reading-view setting, or service-worker channel.
let worker:Worker|undefined,nextId=0;
const pending=new Map<number,{resolve:(words:Word[][])=>void;reject:(error:Error)=>void;cleanup:()=>void}>();
function dictionary() {
  if(worker)return worker;
  const current=new Worker(chrome.runtime.getURL('tokenizer.js'));worker=current;
  current.onmessage=({data})=>{
    const job=pending.get(data.id);if(!job)return;
    pending.delete(data.id);job.cleanup();
    if(data.error || !Array.isArray(data.words) || data.words.some((words:unknown)=>!Array.isArray(words)))job.reject(new Error('Could not analyze this word offline.'));
    else job.resolve(data.words);
  };
  current.onerror=()=>{
    current.terminate();if(worker===current)worker=undefined;
    for(const job of pending.values()){job.cleanup();job.reject(new Error('The local dictionary could not finish. Try again.'));}pending.clear();
  };
  return current;
}
const tokenize:PlaygroundTokenizer=(texts,signal)=>{
  if(signal.aborted)return Promise.reject(new DOMException('Analysis cancelled','AbortError'));
  if(!texts.length || texts.length>4 || texts.some(text=>!text.length || text.length>40))return Promise.reject(new Error('Enter up to four words of 40 characters each.'));
  return new Promise<Word[][]>((resolve,reject)=>{
    const current=dictionary(),id=++nextId;
    const abort=()=>{
      current.postMessage({type:'worker-cancel',id});pending.delete(id);cleanup();reject(new DOMException('Analysis cancelled','AbortError'));
    };
    const cleanup=()=>signal.removeEventListener('abort',abort);
    pending.set(id,{resolve:words=>words.length===texts.length?resolve(words):reject(new Error('Incomplete local analysis.')),reject,cleanup});
    signal.addEventListener('abort',abort,{once:true});
    try{current.postMessage({id,key:'standalone:playground',texts,overrides:{},includeWords:true});}
    catch(error){pending.delete(id);cleanup();reject(error);}
  });
};
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==='local' && changes.showLegacyAnimations)setMimeticLegacyAnimations(changes.showLegacyAnimations.newValue);
});
async function main() {
  try{const state=await chrome.storage.local.get({showLegacyAnimations:false});setMimeticLegacyAnimations(state.showLegacyAnimations);}catch{/* Use the new artwork if settings are temporarily unavailable. */}
  const browser=renderPlaygroundBrowser({tokenize});document.querySelector('#playground-host')!.replaceChildren(browser.element);browser.focus();
  window.addEventListener('pagehide',event=>{
    if(event.persisted)return;
    browser.dispose();worker?.terminate();
    for(const job of pending.values()){job.cleanup();job.reject(new DOMException('Page closed','AbortError'));}pending.clear();
  });
}
void main();
