import {test,expect} from '@playwright/test';
import kuromoji from 'kuromoji';
import {adjectiveDictionaryBases} from '../src/adjective-dictionary';
import {adjectiveConstruction,adjectiveFamilies,buildAdjectivePlayground,createAdjectivePlayground,dictionaryAdjectiveCandidates,type AdjectiveBase} from '../src/adjective-playground';
import {hiragana,type Word} from '../src/shared';
let tokenizer:kuromoji.Tokenizer<kuromoji.IpadicFeatures>;
test.beforeAll(async()=>{tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'node_modules/kuromoji/dict/'}).build((error,value)=>error?reject(error):resolve(value)));});
function analyze(text:string):Word[] {
  let offset=0;
  return tokenizer.tokenize(text).flatMap(t=>{
    const start=text.indexOf(t.surface_form,offset);offset=start+t.surface_form.length;
    if(!/[\p{L}\p{N}]/u.test(t.surface_form))return [];
    const lemma=t.basic_form==='*'?t.surface_form:t.basic_form;
    return [{start,end:offset,lemma,reading:hiragana(t.reading ?? ''),pos:t.pos,posDetail:t.pos_detail_1,verbClass:t.conjugated_type,verbForm:t.conjugated_form,lemmaReading:hiragana(tokenizer.tokenize(lemma).map(x=>x.reading ?? '').join('')),adjectiveBases:t.word_type==='KNOWN'?adjectiveDictionaryBases(tokenizer,t.pos==='形容詞'?lemma:t.surface_form):[]}];
  });
}
const high:AdjectiveBase={lemma:'高い',reading:'たかい',kind:'i'},quiet:AdjectiveBase={lemma:'静か',reading:'しずか',kind:'na'};
function form(base:AdjectiveBase,family:string,flags:{past?:boolean;negative?:boolean;polite?:boolean}={}) {
  return createAdjectivePlayground(base).forms.find(x=>x.family===family && x.past===!!flags.past && x.negative===!!flags.negative && x.polite===!!flags.polite)!;
}
test('dictionary evidence distinguishes adjective classes and lexical alternatives',()=>{
  for(const [input,kind] of [['高い','i'],['いい','i'],['良い','i'],['かっこいい','i'],['静か','na'],['きれい','na'],['嫌い','na'],['有名','na']]) {
    const bases=dictionaryAdjectiveCandidates(input,analyze(input));expect(bases,input).toEqual(expect.arrayContaining([expect.objectContaining({lemma:input,kind})]));
  }
  for(const input of ['大きな','小さな','学校','食べる','高かった','静かな','高い人','xyzzyい'])expect(dictionaryAdjectiveCandidates(input,analyze(input)),input).toEqual([]);
});
test('canonical adjective matrices use only applicable switches and correct readings',()=>{
  expect(form(high,'simple',{past:true,negative:true,polite:true})).toMatchObject({text:'高くなかったです',reading:'たかくなかったです'});
  expect(form(quiet,'simple',{past:true,negative:true,polite:true})).toMatchObject({text:'静かではありませんでした',reading:'しずかではありませんでした'});
  const expected=[['prenominal','高い','静かな'],['adverbial','高く','静かに'],['linking','高くて','静かで'],['conditional','高ければ','静かなら'],['conditionalTara','高かったら','静かだったら'],['become','高くなる','静かになる'],['make','高くする','静かにする']];
  for(const [family,i,na] of expected){expect(form(high,family).text).toBe(i);expect(form(quiet,family).text).toBe(na);}
  expect(form(high,'conditional',{negative:true}).text).toBe('高くなければ');expect(form(quiet,'conditionalTara',{negative:true}).text).toBe('静かではなかったら');
  expect(form(high,'become',{past:true}).text).toBe('高くなった');expect(form(quiet,'make',{negative:true}).text).toBe('静かにしない');
  expect(form(high,'become',{past:true,negative:true,polite:true}).text).toBe('高くなりませんでした');expect(form(quiet,'make',{past:true,polite:true}).text).toBe('静かにしました');
  for(const base of [high,quiet])for(const variant of createAdjectivePlayground(base).forms) {
    expect(adjectiveConstruction(base,variant)).toContain(variant.text);
    const family=adjectiveFamilies.find(x=>x.id===variant.family)!;
    for(const key of ['past','negative','polite','spoken'] as const)if(!family.controls.includes(key))expect(variant[key]).toBe(false);
  }
});
test('いい and lexical compounds use よ while original nonpast spelling remains intact',()=>{
  for(const [lemma,reading,past,read] of [['いい','いい','よかった','よかった'],['良い','よい','良かった','よかった'],['かっこいい','かっこいい','かっこよかった','かっこよかった'],['格好いい','かっこういい','格好よかった','かっこうよかった']]) {
    const base:AdjectiveBase={lemma,reading,kind:'i',...(lemma.endsWith('いい') && lemma!=='いい'?{goodCompound:true}:{})};expect(form(base,'simple',{past:true})).toMatchObject({text:past,reading:read});expect(createAdjectivePlayground(base).source).toBe(lemma);
  }
});
test('ordinary adjectives ending in いい do not receive the good-compound alternation',()=>{
  for(const [lemma,reading,past] of [['かわいい','かわいい','かわいかった'],['可愛い','かわいい','可愛かった']]) {const base=dictionaryAdjectiveCandidates(lemma,analyze(lemma))[0];expect(base).toBeDefined();expect(form(base,'simple',{past:true}).text).toBe(past);}
});
test('real dictionary inflected phrases recover exact complete spans on every constituent',()=>{
  for(const source of ['高かった','高くなかったです','高くありませんでした','高くて','高ければ','高くなければ','高かったら','高くなかったら','静か','静かな','静かでした','静かではありませんでした','静かじゃなかった','静かなら','静かだったら','静かにする','高くなりました','高くならなかった','静かにしませんでした','きれいだった','嫌いです','かっこよかった']) {
    const text='昨日、'+source+'。',words=analyze(text),indices=words.flatMap((w,i)=>w.start>=3 && w.end<=text.length-1?[i]:[]);
    for(const index of indices){const model=buildAdjectivePlayground(text,words,index);expect(model?.source,source+' token '+index).toBe(source);expect(model?.start).toBe(3);expect(model?.end).toBe(text.length-1);}
  }
});
test('unsupported chains and verb auxiliaries do not expose partial adjective transformations',()=>{
  for(const text of ['高すぎる','高くなりたい','高くても','静かではなく','食べていい','食べない','大きな家']) {
    const words=analyze(text);for(let i=0;i<words.length;i++)expect(buildAdjectivePlayground(text,words,i),text).toBeUndefined();
  }
  expect(buildAdjectivePlayground('高い',analyze('高い'),-1)).toBeUndefined();
});

test('every generated adjective spelling and reading round-trips through the real dictionary',()=>{
  for(const input of ['高い','静か','きれい','いい','かわいい','かっこいい']) {
    const base=dictionaryAdjectiveCandidates(input,analyze(input))[0];
    for(const variant of createAdjectivePlayground(base).forms) {
      const words=analyze(variant.text),model=buildAdjectivePlayground(variant.text,words,0);
      expect(model?.source,input+' → '+variant.text).toBe(variant.text);
      expect(model?.sourceReading,input+' → '+variant.text).toBe(variant.reading);
    }
  }
});
