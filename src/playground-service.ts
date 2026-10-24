import {ensureOffscreen} from './offscreen-client';
import {lookupOnlineDefinition} from './dictionary';
import type {PlaygroundQuery} from './playground-data';

export function validPlaygroundQuery(query:unknown):query is PlaygroundQuery {
 if(!query || typeof query!=='object')return false;
 const q=query as Record<string,unknown>;
 const word=(s:unknown)=>typeof s==='string' && s.length<=80 && /^[\p{L}\p{M}\p{N}々〆ー・\s'-]+$/u.test(s) && (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(s) || !/\s/u.test(s));
 const id=(s:unknown)=>typeof s==='string' && /^[a-z0-9-]{1,64}$/.test(s);
 switch(q.op) {
  case 'search':return typeof q.query==='string' && q.query.length<=80 && Number.isInteger(q.offset) && Number(q.offset)>=0 && Number(q.offset)<=1_000_000;
  case 'entry':return typeof q.id==='string' && /^\d{1,12}$/.test(q.id) && typeof q.bucket==='string' && /^[a-f0-9]{2}$/.test(q.bucket);
  case 'japanese':return word(q.word);
  case 'online':return word(q.word) && (q.language==='en' || q.language==='ja');
  case 'grammar-index':return true;
  case 'grammar':case 'comparison':return id(q.id);
  default:return false;
 }
}
let active=0;
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
 if(message?.type!=='playground-data')return;
 let url:URL|undefined;try {url=sender.url?new URL(sender.url):undefined;}catch {}
 const standalone=sender.url===chrome.runtime.getURL('playgrounds.html');
 const reading=sender.tab?.id!==undefined && sender.frameId===0 && url && ['http:','https:'].includes(url.protocol);
 if(sender.id!==chrome.runtime.id || (!standalone && !reading) || !validPlaygroundQuery(message.query)) {respond({error:'Invalid playground request'});return;}
 if(active>=8){respond({error:'Playgrounds are busy. Try again.'});return;}
 active++;
 const query=message.query as PlaygroundQuery;
 void (async()=>{
  if(query.op==='online')return {value:await lookupOnlineDefinition(query.language,query.word.trim().normalize('NFC'))};
  await ensureOffscreen();return chrome.runtime.sendMessage({type:'playground-data-job',query});
 })().then(respond,error=>respond({error:String(error)})).finally(()=>active--);
 return true;
});
