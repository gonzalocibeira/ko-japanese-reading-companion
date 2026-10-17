import type {IpadicFeatures,Tokenizer,ViterbiLattice,ViterbiNode} from 'kuromoji';
import {hiragana,type AdjectiveBase} from './shared';
const caches=new WeakMap<Tokenizer<IpadicFeatures>,Map<string,AdjectiveBase[]>>();
/** Read whole-word lexical alternatives from the bundled dictionary, not suffix guesses. */
export function adjectiveDictionaryBases(tokenizer:Tokenizer<IpadicFeatures>,input:string):AdjectiveBase[] {
  if(!input || input.length>40)return [];
  let cache=caches.get(tokenizer);if(!cache){cache=new Map();caches.set(tokenizer,cache);}
  const hit=cache.get(input);if(hit)return hit;
  const lattice=tokenizer.getLattice(input) as ViterbiLattice & {nodes_end_at:ViterbiNode[][]};
  const result:AdjectiveBase[]=[];
  for(const nodes of lattice.nodes_end_at)for(const node of nodes ?? []) {
    if(node.type!=='KNOWN' || node.start_pos!==1 || node.surface_form!==input)continue;
    const f=tokenizer.token_info_dictionary.getFeatures(node.name).split(',');
    const adjective=f[1]==='形容詞' && f[2]==='自立';
    // An inflected adjective may lose the best-path analysis to an adverb
    // (notably よく). Its whole-word dictionary alternative still proves the base.
    if(adjective && f[6]!=='基本形' && f[7] && f[7]!==input && f[7].length<=40) {
      const lexical=tokenizer.tokenize(f[7]);
      if(lexical.length===1 && lexical[0].word_type==='KNOWN' && lexical[0].pos==='形容詞' && lexical[0].pos_detail_1==='自立' && lexical[0].basic_form===f[7] && lexical[0].reading && lexical[0].reading!=='*') {
        const base:AdjectiveBase={lemma:f[7],reading:hiragana(lexical[0].reading),kind:'i',...(lexical[0].conjugated_type==='不変化型' && f[7].endsWith('いい')?{goodCompound:true}:{})};
        if(!result.some(x=>x.lemma===base.lemma && x.kind===base.kind && x.reading===base.reading))result.push(base);
      }
    }
    const i=adjective && f[6]==='基本形';
    const na=f[1]==='名詞' && f[2]==='形容動詞語幹';
    if((!i && !na) || !f[8] || f[8]==='*')continue;
    const base:AdjectiveBase={lemma:input,reading:hiragana(f[8]),kind:i?'i':'na',...(i && f[5]==='不変化型' && input.endsWith('いい')?{goodCompound:true}:{})};
    if(!result.some(x=>x.lemma===base.lemma && x.kind===base.kind && x.reading===base.reading))result.push(base);
  }
  cache.set(input,result);if(cache.size>256)cache.delete(cache.keys().next().value!);return result;
}
