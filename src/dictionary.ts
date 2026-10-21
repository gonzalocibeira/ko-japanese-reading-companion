import type {DictionaryPage,DictionaryReply,DefinitionLanguage} from './definitions';
import type {ParsedDefinition} from './wiktionary-parser';
import {localDefinition} from './local-dictionary';
import {ensureOffscreen} from './offscreen-client';
const pending=new Map<string,Promise<DictionaryPage>>();
const cache=new Map<string,{page:DictionaryPage;expires:number}>();
const failure=(reason:'network'|'structure'|'busy'):DictionaryPage=>({status:'error',definitions:[],source:'wiktionary',reason});

async function onlineDefinition(language:DefinitionLanguage,word:string):Promise<DictionaryPage> {
  const signal=AbortSignal.timeout(8000);
  const run=async():Promise<DictionaryPage>=>{
    const visited=new Set<string>();let title=word;
    for(let hop=0;hop<=2;hop++) {
      if(signal.aborted)throw new Error('Dictionary timeout');
      if(visited.has(title))return failure('structure');visited.add(title);
      const url=new URL(`https://${language}.wiktionary.org/w/api.php`);
      url.search=new URLSearchParams({action:'parse',page:title,prop:'text',format:'json',formatversion:'2',redirects:'1',disableeditsection:'1'}).toString();
      const response=await fetch(url,{credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',signal});
      if(!response.ok)return response.status===404?{status:'missing',definitions:[],source:'wiktionary',title}:failure('network');
      const reader=response.body?.getReader();if(!reader)return failure('network');
      const chunks:Uint8Array[]=[];let size=0;
      for(;;) {
        const {value,done}=await reader.read();if(done)break;
        size+=value.byteLength;if(size>1_000_000) {await reader.cancel();return failure('structure');}
        chunks.push(value);
      }
      const bytes=new Uint8Array(size);let offset=0;
      for(const chunk of chunks) {bytes.set(chunk,offset);offset+=chunk.byteLength;}
      const data=JSON.parse(new TextDecoder().decode(bytes));
      if(data.error)return data.error.code==='missingtitle'?{status:'missing',definitions:[],source:'wiktionary',title}:failure('network');
      if(typeof data.parse?.text!=='string')return failure('structure');
      const resolved=typeof data.parse.title==='string'?data.parse.title:title;
      await ensureOffscreen();if(signal.aborted)throw new Error('Dictionary timeout');
      const parsed:ParsedDefinition=await chrome.runtime.sendMessage({type:'dictionary-parse',html:data.parse.text,language});
      if(parsed?.status==='ok' && Array.isArray(parsed.definitions) && parsed.definitions.length)return {status:'ok',definitions:parsed.definitions,title:resolved,source:'wiktionary'};
      if(parsed?.status==='missing')return {status:'missing',definitions:[],title:resolved,source:'wiktionary'};
      if(parsed?.status!=='reference' || typeof parsed.target!=='string' || !/^[\p{L}\p{M}\p{N}々〆ー・\s'-]{1,80}$/u.test(parsed.target))return failure('structure');
      if(visited.has(resolved) && resolved!==title)return failure('structure');
      visited.add(resolved);title=parsed.target;
    }
    return failure('structure');
  };
  // The deadline includes offscreen creation and parsing, not only HTTP fetches.
  let abort:()=>void=()=>{};
  try {
    return await Promise.race([run(),new Promise<DictionaryPage>(resolve=>{
      abort=()=>resolve(failure('network'));signal.addEventListener('abort',abort,{once:true});
    })]);
  } catch {return failure('network');}
  finally {signal.removeEventListener('abort',abort);}
}

export function lookupDefinition(language:DefinitionLanguage,word:string):Promise<DictionaryPage> {
  const key=JSON.stringify([word,language]),stored=cache.get(key);
  if(stored && stored.expires>Date.now()) {
    cache.delete(key);cache.set(key,stored);return Promise.resolve(stored.page);
  }
  cache.delete(key);
  const active=pending.get(key);if(active)return active;
  if(pending.size>=8)return Promise.resolve(failure('busy'));
  const job=(async()=>{
    let page:DictionaryPage|undefined;
    if(language==='en') {
      try {page=await localDefinition(word);}catch { /* A broken local asset must not prevent online lookup. */ }
    }
    page ??= await onlineDefinition(language,word);
    if(page.status!=='error') {
      cache.set(key,{page,expires:page.status==='missing'?Date.now()+5*60_000:Infinity});
      while(cache.size>256)cache.delete(cache.keys().next().value!);
    }
    return page;
  })().finally(()=>pending.delete(key));
  pending.set(key,job);return job;
}

chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message?.type!=='define-word')return;
  let url:URL|undefined;try {url=sender.url?new URL(sender.url):undefined;}catch { /* Validate below. */ }
  if(sender.tab?.id===undefined || sender.frameId!==0 || !url || !['http:','https:'].includes(url.protocol) || typeof message.word!=='string' || !/^[\p{L}\p{M}\p{N}々〆ー・\s'-]{1,80}$/u.test(message.word) || !message.word.trim()) {
    respond({error:'Invalid dictionary request'});return;
  }
  if(message.language!==undefined && message.language!=='en' && message.language!=='ja') {respond({error:'Invalid dictionary language'});return;}
  const word=message.word.trim().normalize('NFC'),languages:DefinitionLanguage[]=message.language?[message.language]:['en','ja'];
  void Promise.all(languages.map(async language=>[language,await lookupDefinition(language,word)] as const)).then(entries=>respond(Object.fromEntries(entries) as Partial<DictionaryReply>));
  return true;
});
