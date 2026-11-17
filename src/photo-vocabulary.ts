import type {DictionaryHit,PlaygroundDataProvider} from './playground-data';

interface PreferredWord {query:string;glosses?:string[];display?:string}

// The first English gloss is often figurative or a different sense. Common
// objects use verified JMdict forms and constrain ambiguous entries to that sense.
const preferred:Record<string,PreferredWord[]>={
  umbrella:[{query:'傘'}],
  book:[{query:'本'}],
  notebook:[{query:'ノート'}],
  bottle:[{query:'瓶'},{query:'ボトル'}],
  'water bottle':[{query:'水筒',glosses:['water bottle','canteen']},{query:'ペットボトル',glosses:['plastic bottle','pet bottle']}],
  'plastic bottle':[{query:'ペットボトル',glosses:['plastic bottle','pet bottle']}],
  cup:[{query:'カップ'},{query:'コップ',glosses:['glass','tumbler'],display:'コップ'}],
  mug:[{query:'マグカップ'}],
  cat:[{query:'猫'}],
  dog:[{query:'犬'}],
  rabbit:[{query:'兎'}],
  table:[{query:'テーブル'}],
  chair:[{query:'椅子'}],
  plant:[{query:'植物'}],
  lamp:[{query:'ランプ'}],
  pen:[{query:'ペン'}],
  pencil:[{query:'鉛筆'}],
  keyboard:[{query:'キーボード'}],
  mouse:[{query:'マウス'},{query:'鼠'}],
  'computer mouse':[{query:'マウス',glosses:['(computer) mouse']}],
  apple:[{query:'林檎',display:'りんご'}],
  ball:[{query:'ボール'}],
  photograph:[{query:'写真'}],
  photo:[{query:'写真'}],
  plate:[{query:'皿'}],
  'rice bowl':[{query:'茶碗'}],
  mountain:[{query:'山'}],
  tree:[{query:'木'}],
  tower:[{query:'塔'}],
  building:[{query:'建物'}],
  sign:[{query:'看板'},{query:'標識'}],
  fence:[{query:'柵'}],
  'stop sign':[{query:'一時停止標識'},{query:'標識',glosses:['sign','marker']}],
};

export function normalizePhotoLabel(label:string):string {
  return label.normalize('NFKC').toLowerCase().replace(/[‐‑–—-]/g,' ').replace(/\s+/g,' ').trim();
}

export function singularPhotoLabel(label:string):string {
  if(label.endsWith('ies'))return label.slice(0,-3)+'y';
  if(/(?:[sxz]|ch|sh)es$/.test(label))return label.slice(0,-2);
  if(/[^sui]s$/.test(label))return label.slice(0,-1);
  return label;
}

function stripQualifiers(gloss:string):string {
  while(/\([^()]*\)/.test(gloss))gloss=gloss.replace(/\([^()]*\)/g,'');
  return normalizePhotoLabel(gloss).replace(/^(?:a|an|the) /,'');
}

function noun(hit:DictionaryHit) {
  return hit.pos.some(pos=>pos.startsWith('noun (common)'));
}

function matchingGloss(hit:DictionaryHit,labels:string[]):string|undefined {
  return hit.meaning.split(';').map(gloss=>gloss.trim()).find(gloss=>labels.includes(normalizePhotoLabel(gloss)) || labels.includes(stripQualifiers(gloss)));
}

export async function photoVocabulary(data:PlaygroundDataProvider,rawLabel:string,signal:AbortSignal):Promise<DictionaryHit[]> {
  const label=normalizePhotoLabel(rawLabel);
  if(!label || label.length>80)return [];
  const labels=[...new Set([label,singularPhotoLabel(label)])];
  const guesses=labels.flatMap(value=>Object.hasOwn(preferred,value)?preferred[value]:[]);
  const fixed:DictionaryHit[]=[];
  for(const {query,glosses,display} of guesses) {
    const {hits}=await data({op:'search',query,offset:0},signal);
    const exact=hits.find(hit=>(hit.headword===query || hit.reading===query) && noun(hit) && matchingGloss(hit,glosses ?? labels));
    if(exact)fixed.push({...exact,headword:display ?? exact.headword,meaning:matchingGloss(exact,glosses ?? labels)!});
  }
  if(fixed.length)return fixed;

  for(const query of labels) {
    const {hits}=await data({op:'search',query,offset:0},signal);
    const exact=hits.flatMap(hit=>{
      if(!noun(hit))return [];
      const meaning=matchingGloss(hit,labels);
      return meaning?[{hit:{...hit,meaning},first:hit.meaning.startsWith(meaning)}]:[];
    });
    const first=exact.filter(candidate=>candidate.first);
    const pool=first.length?first:exact;
    const common=pool.filter(candidate=>candidate.hit.common);
    if(pool.length)return (common.length?common:pool).slice(0,4).map(candidate=>candidate.hit);
  }
  return [];
}
