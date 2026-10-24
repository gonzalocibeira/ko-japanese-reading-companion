import {bundledResourceURL,loadDictionaryShard} from './local-dictionary';
import {localJapaneseDefinition} from './local-japanese-dictionary';
import type {DictionaryEntry,DictionaryHit,GrammarPoint,GrammarSummary,PlaygroundQuery} from './playground-data';
import {hiragana} from './shared';

interface SearchIndex {entries:DictionaryHit[];terms:[string,number][];english:Record<string,number[]>}
let index:Promise<SearchIndex>|undefined;
const normalize=(text:string)=>hiragana(text.normalize('NFKC')).toLocaleLowerCase('en').trim();
async function localJSON<T>(path:string,compressed=false):Promise<T> {
 const response=await fetch(bundledResourceURL(path));
 if(!response.ok || !response.body)throw new Error('Local playground data is unavailable. Try again.');
 return JSON.parse(compressed?await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).text():await response.text());
}
function searchIndex() {return index ??= localJSON<SearchIndex>('dictionaries/jmdict/search.json.gz',true).catch(error=>{index=undefined;throw error;});}
let grammar:Promise<GrammarSummary[]>|undefined;
const points=new Map<string,GrammarPoint>();
function lowerBound(terms:[string,number][],value:string) {let lo=0,hi=terms.length;while(lo<hi){const mid=(lo+hi)>>>1;if(terms[mid][0]<value)lo=mid+1;else hi=mid;}return lo;}
export async function queryPlayground(query:PlaygroundQuery):Promise<unknown> {
 if(query.op==='search') {
  const data=await searchIndex(),q=normalize(query.query);if(!q)return {hits:[],total:0};
  const scores=new Map<number,number>();
  if(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(q)) {
   let start=lowerBound(data.terms,q);
   while(start<data.terms.length && data.terms[start][0].startsWith(q)) {
    const [term,id]=data.terms[start++],score=term===q?(normalize(data.entries[id].headword)===q?0:1):2;
    scores.set(id,Math.min(scores.get(id) ?? Infinity,score));
   }
  } else {
   const tokens=q.match(/[\p{L}\p{N}]+/gu) ?? [];
   let ids:Set<number>|undefined,exactIds:Set<number>|undefined;
   for(const token of tokens) {
    const exact=new Set<number>(data.english[token] ?? []),matches=new Set<number>(exact);
    exactIds=exactIds?new Set([...exactIds].filter(id=>exact.has(id))):exact;
    // Prefix expansion is bounded to the final token and requires two letters.
    if(token===tokens.at(-1) && token.length>=2)for(const key of Object.keys(data.english))if(key.startsWith(token))for(const id of data.english[key])matches.add(id);
    ids=ids?new Set([...ids].filter(id=>matches.has(id))):matches;
   }
   for(const id of ids ?? [])scores.set(id,exactIds?.has(id)?(normalize(data.entries[id].meaning).split(';').some(gloss=>gloss.replace(/\([^)]*\)/g,'').trim()===q)?0:1):2);
  }
  const seen=new Set<string>();
  const ids=[...scores.keys()].sort((a,b)=>scores.get(a)!-scores.get(b)! || Number(data.entries[b].common)-Number(data.entries[a].common) || Number(data.entries[a].id)-Number(data.entries[b].id)).filter(id=>{const key=data.entries[id].id;if(seen.has(key))return false;seen.add(key);return true;});
  return {hits:ids.slice(query.offset,query.offset+30).map(id=>data.entries[id]),total:ids.length};
 }
 if(query.op==='entry') {
  const shard=await loadDictionaryShard<{entries:Record<string,DictionaryEntry>}>('jmdict',query.bucket);
  const entry=shard.entries[query.id];if(!entry)throw new Error('This dictionary entry is unavailable.');return entry;
 }
 if(query.op==='japanese')return await localJapaneseDefinition(query.word) ?? {status:'missing',definitions:[],source:'jawiktionary'};
 if(query.op==='grammar-index')return grammar ??= localJSON<GrammarSummary[]>('grammar/index.json').catch(error=>{grammar=undefined;throw error;});
 if(query.op==='grammar') {
  if(points.has(query.id))return points.get(query.id);
  const point=await localJSON<GrammarPoint>(`grammar/points/${query.id}.json`);points.set(query.id,point);
  while(points.size>24)points.delete(points.keys().next().value!);return point;
 }
 if(query.op==='comparison')return localJSON(`grammar/comparisons/${query.id}.json`);
 throw new Error('Unsupported local playground request.');
}
self.onmessage=async({data})=>{
 try {self.postMessage({id:data.id,value:await queryPlayground(data.query)});}
 catch(error) {self.postMessage({id:data.id,error:error instanceof Error?error.message:'Local playground data is unavailable.'});}
};
