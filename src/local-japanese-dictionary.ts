import type {DictionaryPage} from './definitions';
import {dictionaryBucket,loadDictionaryShard} from './local-dictionary';
interface Entry {id:string;title:string;pos:string;senses:{text:string;tags:string[];rawTags:string[];topics:string[]}[]}
interface Shard {terms:Record<string,string[]>;entries:Record<string,Entry>}
export async function localJapaneseDefinition(raw:string):Promise<DictionaryPage|undefined> {
  const word=raw.normalize('NFC'),shard=await loadDictionaryShard<Shard>('jawiktionary',dictionaryBucket(word));
  const definitions:string[]=[],entryIds:string[]=[];
  let title:string|undefined;
  for(const id of shard.terms[word] ?? []) {
    const entry=shard.entries[id];if(!entry)continue;
    for(const sense of entry.senses) {
      const text=sense.text.slice(0,600);
      if(text && !definitions.includes(text)) {definitions.push(text);if(!entryIds.includes(id))entryIds.push(id);title ??= entry.title;}
      if(definitions.length===4)break;
    }
    if(definitions.length===4)break;
  }
  return definitions.length?{status:'ok',definitions,title,source:'jawiktionary',entryIds}:undefined;
}
