import type {DictionaryPage} from './definitions';
interface Spelling {text:string;priority:string[];info:string[]}
interface Reading extends Spelling {restrict:string[];noKanji:boolean}
interface Sense {glosses:string[];spellings:string[];readings:string[];pos:string[];field:string[];misc:string[];dialect:string[];info:string[]}
interface Entry {id:string;spellings:Spelling[];readings:Reading[];senses:Sense[]}
interface Shard {terms:Record<string,string[]>;entries:Record<string,Entry>}
export function dictionaryBucket(term:string) {
  let hash=2166136261;
  for(const char of term)hash=Math.imul(hash ^ char.codePointAt(0)!,16777619)>>>0;
  return (hash & 255).toString(16).padStart(2,'0');
}
const shards=new Map<string,{value:unknown;bytes:number}>();
const loading=new Map<string,Promise<unknown>>();
let retainedBytes=0;
export function bundledResourceURL(path:string):string {
  return typeof chrome==='object' && chrome.runtime?.getURL?chrome.runtime.getURL(path):new URL(path,self.location.href).href;
}
export async function loadDictionaryShard<T>(dictionary:'jmdict'|'jawiktionary',bucket:string):Promise<T> {
  const key=`${dictionary}/${bucket}`;
  const cached=shards.get(key);
  if(cached) {shards.delete(key);shards.set(key,cached);return cached.value as T;}
  let job=loading.get(key);
  if(!job) {
    job=(async()=>{
      const response=await fetch(bundledResourceURL(`dictionaries/${dictionary}/${bucket}.json.gz`));
      if(!response.ok || !response.body)throw new Error('Local dictionary unavailable');
      const text=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text(),value=JSON.parse(text);
      if(!value.terms || !value.entries)throw new Error('Invalid dictionary shard');
      // UTF-16 source size is a conservative cache weight, not a heap measurement.
      const bytes=text.length*2;
      shards.set(key,{value,bytes});retainedBytes+=bytes;
      while(shards.size>16 || retainedBytes>8*1024*1024) {
        const key=shards.keys().next().value!;retainedBytes-=shards.get(key)!.bytes;shards.delete(key);
      }
      return value;
    })().finally(()=>loading.delete(key));
    loading.set(key,job);
  }
  return job as Promise<T>;
}
export async function localDefinition(raw:string):Promise<DictionaryPage|undefined> {
  const word=raw.normalize('NFC'),shard=await loadDictionaryShard<Shard>('jmdict',dictionaryBucket(word));
  const entries=(shard.terms[word] ?? []).map(id=>shard.entries[id]).filter((entry):entry is Entry=>!!entry);
  // Keep exact headwords before reading-only matches, then prefer common entries.
  const rank=(entry:Entry)=>[entry.spellings.some(k=>k.text===word)?0:1,
    entry.spellings.concat(entry.readings).some(k=>k.priority.length)?0:1,Number(entry.id)];
  entries.sort((a,b)=>{const x=rank(a),y=rank(b);return x[0]-y[0] || x[1]-y[1] || x[2]-y[2];});
  const definitions:string[]=[],entryIds:string[]=[];
  for(const entry of entries) {
    const exact=entry.spellings.some(k=>k.text===word);
    const pairs=entry.readings.flatMap(reading=>{
      if(!exact && reading.text!==word)return [];
      const spellings=reading.noKanji?[]:entry.spellings.filter(k=>(!exact || k.text===word) && (!reading.restrict.length || reading.restrict.includes(k.text)));
      if(exact && !spellings.length)return [];
      return spellings.length?spellings.map(k=>({spelling:k.text,reading:reading.text})):[{spelling:'',reading:reading.text}];
    });
    for(const sense of entry.senses) {
      if(!pairs.some(pair=>(!sense.spellings.length || sense.spellings.includes(pair.spelling)) && (!sense.readings.length || sense.readings.includes(pair.reading))))continue;
      const labels=[...sense.field,...sense.misc,...sense.dialect,...sense.info];
      const text=`${labels.length?`(${labels.join('; ')}) `:''}${sense.glosses.join('; ')}`.slice(0,600);
      if(text && !definitions.includes(text)) {definitions.push(text);if(!entryIds.includes(entry.id))entryIds.push(entry.id);}
      if(definitions.length===4)break;
    }
    if(definitions.length===4)break;
  }
  return definitions.length?{status:'ok',definitions,title:word,source:'jmdict',entryIds}:undefined;
}
