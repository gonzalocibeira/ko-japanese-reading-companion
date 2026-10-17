import {hiragana,type Word,type AdjectiveBase} from './shared';
export type {AdjectiveBase} from './shared';
export type AdjectiveFamilyId='simple'|'prenominal'|'adverbial'|'linking'|'conditional'|'conditionalTara'|'become'|'make';
export interface AdjectiveState {family:AdjectiveFamilyId;past:boolean;negative:boolean;polite:boolean;spoken:boolean}
export interface AdjectiveVariant extends AdjectiveState {id:string;text:string;reading:string}
export interface AdjectivePlayground {
  start:number;end:number;source:string;sourceReading:string;lemma:string;base:AdjectiveBase;
  forms:AdjectiveVariant[];initial:AdjectiveState;sourceMatches:AdjectiveVariant[];requiresChoice:boolean;
}
const finite=['past','negative','polite'] as const;
export const adjectiveFamilies:readonly {id:AdjectiveFamilyId;label:string;group:string;description:string;controls:readonly ('past'|'negative'|'polite'|'spoken')[]}[]=[
  {id:'simple',label:'Basic predicate',group:'Everyday forms',description:'Describe a quality or state. Nonpast can describe the present or future.',controls:finite},
  {id:'prenominal',label:'Before a noun',group:'Everyday forms',description:'Place this form immediately before a noun. The noun is not supplied here.',controls:[]},
  {id:'adverbial',label:'Modify an action: ～く／～に',group:'Everyday forms',description:'Describe how an action is done. Whether it makes sense depends on the adjective and action.',controls:[]},
  {id:'linking',label:'Connect: ～くて／～で',group:'Everyday forms',description:'Link descriptions, sometimes giving a reason. This does not choose the relationship for your sentence.',controls:[]},
  {id:'conditional',label:'If: ～ければ／～なら',group:'Conditions',description:'Set a condition. な-adjectives use なら; these patterns are not interchangeable in every context.',controls:['negative']},
  {id:'conditionalTara',label:'If or when: ～たら',group:'Conditions',description:'Set a condition or describe when something happens; た does not independently mean past here.',controls:['negative']},
  {id:'become',label:'Become: ～くなる／～になる',group:'Changes of state',description:'Describe becoming this way. Switches change なる, the verb of change.',controls:finite},
  {id:'make',label:'Make: ～くする／～にする',group:'Changes of state',description:'Describe making something this way. Switches change する; participants may need different particles.',controls:finite}
];
const japanese=/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ー]+$/u;
function valid(base:AdjectiveBase) {return japanese.test(base.lemma) && base.lemma.length<=40 && /^[\p{Script=Hiragana}ー]+$/u.test(base.reading) && (base.kind==='na' || base.kind==='i' && base.lemma.endsWith('い') && base.reading.endsWith('い'));}
function stem(value:string,base:AdjectiveBase) {
  if(['いい','よい','良い'].includes(value))return value==='良い'?'良':'よ';
  // Only dictionary-backed compounds with a final いい receive this alternation.
  if(base.goodCompound && value.endsWith('いい'))return value.slice(0,-2)+'よ';
  return value.slice(0,-1);
}
function render(value:string,base:AdjectiveBase,s:AdjectiveState):string {
  const i=base.kind==='i',root=i?stem(value,base):value;
  const adverb=root+(i?'く':'に');
  if(s.family==='prenominal')return value+(i?'':'な');
  if(s.family==='adverbial')return adverb;
  if(s.family==='linking')return root+(i?'くて':'で');
  if(s.family==='conditional')return root+(s.negative?(i?'くなければ':'ではなければ'):(i?'ければ':'なら'));
  if(s.family==='conditionalTara')return root+(s.negative?(i?'くなかったら':'ではなかったら'):(i?'かったら':'だったら'));
  if(s.family==='become' || s.family==='make') {
    const become=s.family==='become';
    const ending=s.polite?(s.negative?(s.past?'ませんでした':'ません'):(s.past?'ました':'ます')):
      s.negative?(s.past?'なかった':'ない'):(s.past?(become?'った':'た'):(become?'る':'る'));
    return adverb+(s.polite?(become?'なり':'し'):s.negative?(become?'なら':'し'):s.past?(become?'な':'し'):(become?'な':'す'))+ending;
  }
  if(i)return (s.negative?root+(s.past?'くなかった':'くない'):s.past?root+'かった':value)+(s.polite?'です':'');
  return root+(s.polite?(s.negative?(s.past?'ではありませんでした':'ではありません'):(s.past?'でした':'です')):(s.negative?(s.past?'ではなかった':'ではない'):(s.past?'だった':'だ')));
}
export function adjectiveConstruction(base:AdjectiveBase,state:AdjectiveState):string {
  const i=base.kind==='i',root=i?stem(base.lemma,base):base.lemma;
  const rules:Record<AdjectiveFamilyId,string>={simple:i?'Keep い in the affirmative nonpast; otherwise replace it with かった, くない, or くなかった. Add です for polite speech.':'Add だ／です; use だった／でした for past, and ではない／ではありません for negatives.',prenominal:i?'Keep the dictionary form before a noun.':'Add な before a noun.',adverbial:i?'Replace final い with く to modify an action.':'Add に to modify an action.',linking:i?'Replace final い with くて to connect descriptions.':'Add で to connect descriptions.',conditional:i?'Replace final い with ければ; for a negative condition use くなければ.':'Add なら; for a negative condition use ではなければ.',conditionalTara:i?'Replace final い with かったら; for a negative condition use くなかったら.':'Add だったら; for a negative condition use ではなかったら.',become:i?'Replace final い with く and add なる. Conjugate なる for tense, negation, and politeness.':'Add に and なる. Conjugate なる for tense, negation, and politeness.',make:i?'Replace final い with く and add する. Conjugate する for tense, negation, and politeness.':'Add に and する. Conjugate する for tense, negation, and politeness.'};
  const irregular=i && (base.reading==='いい' || base.goodCompound) && !['prenominal'].includes(state.family) && !(state.family==='simple' && !state.past && !state.negative);
  return `${base.lemma} → ${render(base.lemma,base,state)}. ${irregular?`いい changes to the よい stem (${root}). `:''}${rules[state.family]}`;
}
export function createAdjectivePlayground(base:AdjectiveBase,source?:{text:string;reading:string;start?:number;end?:number}):AdjectivePlayground {
  if(!valid(base))throw new Error('Unsupported dictionary adjective');
  const forms:AdjectiveVariant[]=[];
  for(const family of adjectiveFamilies)for(const past of family.controls.includes('past')?[false,true]:[false])for(const negative of family.controls.includes('negative')?[false,true]:[false])for(const polite of family.controls.includes('polite')?[false,true]:[false]) {
    const state:AdjectiveState={family:family.id,past,negative,polite,spoken:false};
    forms.push({...state,id:[family.id,+past,+negative,+polite].join(':'),text:render(base.lemma,base,state),reading:render(base.reading,{...base,lemma:base.reading},state)});
  }
  const text=source?.text ?? base.lemma,reading=source?.reading ?? base.reading;
  // Bare な stems and common contracted/alternative negative spellings preserve
  // their exact original while switches generate the canonical forms above.
  const aliases:AdjectiveVariant[]=[];
  for(const form of forms) {
    if(base.kind==='na' && form.text.includes('では'))aliases.push({...form,text:form.text.replace('では','じゃ'),reading:form.reading.replace('では','じゃ')});
    if(base.kind==='i' && form.family==='simple' && form.polite && form.negative)aliases.push({...form,text:stem(base.lemma,base)+(form.past?'くありませんでした':'くありません'),reading:stem(base.reading,base)+(form.past?'くありませんでした':'くありません')});
  }
  const matches=text===base.lemma && reading===base.reading?[forms[0]]:[...forms,...aliases].filter(form=>form.text===text && form.reading===reading);
  if(!matches.length)throw new Error('Unsupported adjective source form');
  // Dictionary and prenominal い forms coincide; use the predicate as the default.
  const initial=matches.find(x=>x.family==='simple') ?? matches[0];
  return {start:source?.start ?? 0,end:source?.end ?? text.length,source:text,sourceReading:reading,lemma:base.lemma,base,forms,initial:{...initial},sourceMatches:matches,requiresChoice:false};
}
function bases(word:Word):AdjectiveBase[] {
  if(word.adjectiveBases?.length)return word.adjectiveBases.filter(valid);
  if(word.pos==='形容詞' && word.posDetail==='自立' && word.lemmaReading)return [{lemma:word.lemma,reading:hiragana(word.lemmaReading),kind:'i' as const,...(word.verbClass==='不変化型' && word.lemma.endsWith('いい')?{goodCompound:true}:{})}].filter(valid) as AdjectiveBase[];
  if(word.pos==='名詞' && word.posDetail==='形容動詞語幹')return [{lemma:word.lemma,reading:hiragana(word.reading),kind:'na' as const}].filter(valid) as AdjectiveBase[];
  return [];
}
export function dictionaryAdjectiveCandidates(input:string,words:Word[]):AdjectiveBase[] {
  if(words.length!==1 || words[0].start!==0 || words[0].end!==input.length)return [];
  return bases(words[0]).filter(base=>base.lemma===input);
}
/** Match only generated complete forms, bounded to 12 tokens/80 characters. */
export function buildAdjectivePlayground(text:string,words:Word[],wordIndex:number):AdjectivePlayground|undefined {
  if(!Number.isInteger(wordIndex) || wordIndex<0 || wordIndex>=words.length)return;
  let best:AdjectivePlayground|undefined;
  for(let start=Math.max(0,wordIndex-11);start<=wordIndex;start++)for(const base of bases(words[start])) {
    const first=words[start];
    if(first.pos==='助動詞')continue;
    // Do not treat auxiliary ない/よい inside a verb construction as independent adjectives.
    const prev=words[start-1];
    if(prev && prev.end===first.start && (prev.pos==='動詞' || prev.pos==='形容詞' || ['て','で'].includes(text.slice(prev.start,prev.end))))continue;
    let reading='';
    for(let end=start;end<Math.min(words.length,start+12);end++) {
      const word=words[end];
      if(word.start<0 || word.end<=word.start || word.end>text.length || word.end-first.start>80 || end>start && words[end-1].end!==word.start)break;
      reading+=hiragana(word.reading);if(end<wordIndex)continue;
      const next=words[end+1],adjacent=next && next.start===word.end;
      // A valid prefix of an unsupported longer auxiliary construction is not a match.
      if(adjacent && (next.pos==='助動詞' || next.pos==='動詞' || next.pos==='形容詞' || ['て','で','ば','たら','なら'].includes(text.slice(next.start,next.end))))continue;
      try {
        const model=createAdjectivePlayground(base,{text:text.slice(first.start,word.end),reading,start:first.start,end:word.end});
        if(adjacent && ['は','も'].includes(text.slice(next.start,next.end)) && ['linking','adverbial'].includes(model.initial.family))continue;
        if(!best || model.start<best.start || model.start===best.start && model.end>best.end)best=model;
      }catch {/* Not a supported complete form. */}
    }
  }
  return best;
}
