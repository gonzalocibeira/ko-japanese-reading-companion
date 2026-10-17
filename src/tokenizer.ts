import {recoverContextualCommand} from './command-dictionary';
import {adjectiveDictionaryBases} from './adjective-dictionary';
import {readWithOverrides} from './preferences';
import kuromoji from 'kuromoji';
import { align, hiragana, ReadingCache, type Reading, type Word } from './shared';
import {tokenizeVocabulary,vocabularyHeadwords} from './vocabulary';
const caches = new Map<string, ReadingCache>();
const ready = new Promise<kuromoji.Tokenizer<kuromoji.IpadicFeatures>>((resolve, reject) => {
  kuromoji.builder({dicPath: new URL('dict/', self.location.href).href}).build((error, tokenizer) => error ? reject(error) : resolve(tokenizer));
});
const cancelled = new Set<number>();
const known = new Set<number>();
// Only word-detail requests need dictionary-form readings. Bound this extra
// dictionary work and retained data independently from automatic furigana.
const verbReadings = new Map<string,string>();
function lemmaReading(tokenizer:kuromoji.Tokenizer<kuromoji.IpadicFeatures>,lemma:string):string|undefined {
  if(lemma.length>40)return;
  const cached=verbReadings.get(lemma);if(cached)return cached;
  const tokens=tokenizer.tokenize(lemma);
  if(tokens.map(token=>token.surface_form).join('')!==lemma || tokens.some(token=>token.word_type!=='KNOWN' || !token.reading || token.reading==='*'))return;
  const reading=hiragana(tokens.map(token=>token.reading).join(''));
  if(!/^[\p{Script=Hiragana}ー]+$/u.test(reading))return;
  verbReadings.set(lemma,reading);
  if(verbReadings.size>256)verbReadings.delete(verbReadings.keys().next().value!);
  return reading;
}
let chain=Promise.resolve();
self.onmessage = event => {
  if(event.data.type==='worker-cancel') {if(known.has(event.data.id))cancelled.add(event.data.id);return;}
  if(typeof event.data.id==='number')known.add(event.data.id);
  chain=chain.then(()=>run(event.data));
};
async function run(data: any) {
  const {id, key, texts} = data;
  if (data.type === 'worker-release') { for (const name of caches.keys()) if (name.startsWith(`${data.tabId}:`)) caches.delete(name); return; }
  try {
    const tokenizer = await ready;
    let cache = caches.get(key); if (!cache) { cache = new ReadingCache(); caches.set(key, cache); }
    const results: Reading[][]=[];
    const words: Word[][]=[];
    let started=performance.now();
    for(const text of texts as string[]) {
      if(cancelled.has(id))return;
      const headwords=vocabularyHeadwords(text);
      const tokens=data.includeWords?tokenizeVocabulary(tokenizer,text,headwords):undefined;
      if(tokens) {
        let offset=0;const entries:Word[]=[];
        for(const token of tokens) {
          const start=text.indexOf(token.surface_form,offset);if(start<0)continue;
          offset=start+token.surface_form.length;
          if(/[\p{L}\p{N}]/u.test(token.surface_form)) {
            const metadata=recoverContextualCommand(tokenizer,text,offset,token);
            const lemma=metadata.basic_form && metadata.basic_form!=='*'?metadata.basic_form:metadata.surface_form;
            const verb=metadata.pos==='動詞' && metadata.word_type==='KNOWN';
            const adjective=metadata.word_type==='KNOWN' && (metadata.pos==='形容詞' || metadata.pos==='名詞' && metadata.pos_detail_1==='形容動詞語幹');
            const adjectiveBases=metadata.word_type==='KNOWN'?adjectiveDictionaryBases(tokenizer,adjective?lemma:metadata.surface_form):[];
            const inflected=metadata.word_type==='KNOWN' && metadata.conjugated_type && metadata.conjugated_type!=='*';
            entries.push({start,end:offset,lemma,reading:hiragana(metadata.reading ?? ''),pos:metadata.pos,posDetail:metadata.pos_detail_1,
              ...(inflected?{verbClass:metadata.conjugated_type,verbForm:metadata.conjugated_form}:{}),
              ...(adjectiveBases.length?{adjectiveBases}:{}),
              ...(verb || adjective?{lemmaReading:lemmaReading(tokenizer,lemma)}:{})});
          }
        }
        words.push(entries);
      }
      const result=(fragment:string,sourceOffset:number)=>{
      // Include source context: an identical fragment in a name must not reuse
      // the common-noun reading cached for an isolated vocabulary entry.
      const cacheKey=JSON.stringify([text,sourceOffset,fragment]);
      const hit = cache!.get(cacheKey); if (hit) return hit;
      const out: Reading[] = [];
      let offset = 0;
      for (const token of (fragment===text && tokens?tokens:tokenizeVocabulary(tokenizer,fragment,headwords,sourceOffset))) {
        // Locate sequential surfaces rather than relying on code-point positions.
        const start = fragment.indexOf(token.surface_form, offset);
        if (start < 0) continue;
        offset = start + token.surface_form.length;
        const parts=align(token.surface_form, token.reading ?? '');
        if (!parts.length && /[\p{Script=Han}々]/u.test(token.surface_form)) out.push({start,end:offset,reading:''});
        for (const part of parts) out.push({start:start + part.start, end:start + part.end, reading:part.reading});
      }
      cache!.set(cacheKey, out); return out;
      };
      results.push(readWithOverrides(text,data.overrides ?? {},result));
      // Each individual tokenize call is bounded to 2,000 characters. Yield between texts
      // so queued cancellation messages can interrupt the remainder of the batch.
      if(performance.now()-started>=4) {await new Promise<void>(resolve=>setTimeout(resolve,0));started=performance.now();}
    }
    if(cancelled.has(id))return;
    self.postMessage({id, results, ...(data.includeWords?{words}:{})});
  } catch (error) { self.postMessage({id, error:String(error)}); }
  finally {cancelled.delete(id);known.delete(id);}
}
