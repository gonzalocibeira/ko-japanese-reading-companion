import type {IpadicFeatures,Tokenizer,ViterbiLattice,ViterbiNode} from 'kuromoji';
import {createVerbPlayground} from './verb-playground';
import {hiragana} from './shared';

const caches=new WeakMap<Tokenizer<IpadicFeatures>,Map<string,IpadicFeatures[]>>();
/** Whole-token dictionary alternatives only; verify commands using the existing generator. */
export function dictionaryCommandAlternatives(tokenizer:Tokenizer<IpadicFeatures>,surface:string,reading:string):IpadicFeatures[] {
  if(!surface || surface.length>40 || !/^[\p{Script=Hiragana}ー]+$/u.test(hiragana(reading)))return [];
  let cache=caches.get(tokenizer);if(!cache){cache=new Map();caches.set(tokenizer,cache);}
  const key=surface+'\0'+hiragana(reading),hit=cache.get(key);if(hit)return hit;
  const lattice=tokenizer.getLattice(surface) as ViterbiLattice & {nodes_end_at:ViterbiNode[][]};
  const alternatives:IpadicFeatures[]=[],seen=new Set<string>();let probes=0;
  for(const nodes of lattice.nodes_end_at)for(const node of nodes ?? []) {
    if(node.type!=='KNOWN' || node.start_pos!==1 || node.surface_form!==surface)continue;
    const features=tokenizer.token_info_dictionary.getFeatures(node.name).split(',');
    if(features[1]!=='動詞' || features[2]!=='自立' || !features[6]?.startsWith('命令') || hiragana(features[8] ?? '')!==hiragana(reading))continue;
    // More than eight candidate entries is outside this conservative recovery budget.
    if(++probes>8)return [];
    const candidate=tokenizer.formatter.formatEntry(Number(node.name),1,node.type,features);
    const dictionary=tokenizer.tokenize(candidate.basic_form);
    if(dictionary.length!==1)continue;
    const base=dictionary[0];
    if(base.word_type!=='KNOWN' || base.pos!=='動詞' || base.pos_detail_1!=='自立' || base.conjugated_form!=='基本形' || base.basic_form!==candidate.basic_form || base.surface_form!==candidate.basic_form || base.conjugated_type!==candidate.conjugated_type || !base.reading || base.reading==='*')continue;
    try {
      const model=createVerbPlayground({lemma:base.basic_form,reading:hiragana(base.reading),verbClass:base.conjugated_type},{text:surface,reading:hiragana(reading)});
      if(model.requiresChoice || model.sourceMatches.some(form=>form.family!=='imperative'))continue;
      const identity=base.basic_form+'\0'+base.conjugated_type+'\0'+hiragana(base.reading);
      if(!seen.has(identity)){seen.add(identity);alternatives.push(candidate);}
    }catch {/* Unsupported dictionary classes and commands retain their original analysis. */}
  }
  cache.set(key,alternatives);if(cache.size>256)cache.delete(cache.keys().next().value!);return alternatives;
}

/** Recover metadata only at an unambiguous text/line/sentence boundary. */
export function recoverContextualCommand(tokenizer:Tokenizer<IpadicFeatures>,text:string,end:number,token:IpadicFeatures):IpadicFeatures {
  if(token.word_type!=='KNOWN' || token.pos!=='動詞' || token.pos_detail_1!=='自立' || token.conjugated_type!=='一段' || !['連用形','未然形'].includes(token.conjugated_form) || !token.basic_form.endsWith('る') || token.surface_form!==token.basic_form.slice(0,-1))return token;
  if(!Number.isInteger(end) || end<token.surface_form.length || end>text.length || text.slice(end-token.surface_form.length,end)!==token.surface_form || !/^[^\S\r\n]*(?:$|[\r\n。．.!?！？])/u.test(text.slice(end)))return token;
  const alternatives=dictionaryCommandAlternatives(tokenizer,token.surface_form,token.reading ?? '');
  return alternatives.length===1?{...token,basic_form:alternatives[0].basic_form,conjugated_type:alternatives[0].conjugated_type,conjugated_form:alternatives[0].conjugated_form}:token;
}
