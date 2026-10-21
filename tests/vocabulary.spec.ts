import {test,expect} from '@playwright/test';
import kuromoji from 'kuromoji';
import {joinNounCompounds,tokenizeVocabulary,vocabularyHeadwords,type CompoundLexicon} from '../src/vocabulary';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {resolveWord} from '../src/mascot-target';
import {readWithOverrides} from '../src/preferences';
import {align} from '../src/shared';

let tokenizer:kuromoji.Tokenizer<kuromoji.IpadicFeatures>;
let compounds:CompoundLexicon;
test.beforeAll(async()=>{
  tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'dist/dict/'}).build((error,value)=>error?reject(error):resolve(value)));
  compounds=JSON.parse(gunzipSync(readFileSync('dist/dictionaries/jmdict/compounds.json.gz')).toString('utf8'));
});

test('dictionary compounds select the full noun from every kanji, including in sentences',()=>{
  for(const [surface,reading] of [['近代化','きんだいか'],['国際化','こくさいか'],['少子高齢化','しょうしこうれいか'],['経済成長','けいざいせいちょう']]) {
    for(const text of [surface,`${surface}が進む。`,`${surface}する`,`${surface}された`,`${surface} = example`]) {
      const tokens=joinNounCompounds(tokenizeVocabulary(tokenizer,text),text,compounds);
      expect(tokens[0].surface_form,text).toBe(surface);
      expect(tokens[0].basic_form,text).toBe(surface);
      expect(tokens[0].reading,text).toBe(reading.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60)));
      const word={start:0,end:surface.length,lemma:tokens[0].basic_form,reading,pos:tokens[0].pos};
      for(let offset=0;offset<surface.length;offset++)expect(resolveWord({text,offset},[word],[{start:0,end:surface.length,reading}],{})?.word).toEqual({surface,lemma:surface,reading});
    }
  }
});

test('compound joining preserves names, gaps, grammar and unverified noun sequences',()=>{
  for(const text of ['出口太郎','東京都','佐藤さん','近代 化','近代\n化','近代の化学','猫犬','近代化学']) {
    const original=tokenizeVocabulary(tokenizer,text);
    expect(joinNounCompounds(original,text,compounds),text).toEqual(original);
  }
  const original=tokenizeVocabulary(tokenizer,'近代化');
  expect(joinNounCompounds(original,'近代化',{})).toEqual(original);
  expect(joinNounCompounds(original,'近代化',{'近代化':['まちがい']})).toEqual(original);
});

test('bundled dictionary prefers common nouns for isolated vocabulary and translation lines',()=>{
  expect(tokenizer.tokenize('出口 = salida')[0].reading).toBe('イデグチ');
  for(const text of ['出口',' 出口 ','出口 = salida','出口＝salida','出口: exit','出口：sortie','\t出口 = saída\t']) {
    const token=tokenizeVocabulary(tokenizer,text).find(t=>t.surface_form==='出口')!;
    expect(token.reading,text).toBe('デグチ');
    expect(token.pos_detail_1,text).toBe('一般');
    expect(align(token.surface_form,token.reading!)).toEqual([{start:0,end:2,reading:'でぐち'}]);
  }
  // Exercise the same dictionary-driven rule on another surname/common noun.
  expect(tokenizer.tokenize('河原')[0].reading).toBe('カワハラ');
  expect(tokenizeVocabulary(tokenizer,'河原 = riverbank')[0].reading).toBe('カワラ');
});

test('sentences, names, Japanese glosses and words without a noun alternative keep dictionary analysis',()=>{
  for(const text of ['出口はどこですか。','出口さん','出口太郎','出口氏は先生です。','出口 = 出口さんの名前','出口 = 123','佐藤','佐藤 = Sato','日本語','食べる','<出口>']) {
    expect(tokenizeVocabulary(tokenizer,text),text).toEqual(tokenizer.tokenize(text));
  }
});

test('multiline vocabulary rules use exact source spans and preserve adjacent names',()=>{
  const text='  出口 = salida\r\n出口さん\n出口はどこですか。\n出口：exit';
  expect(tokenizeVocabulary(tokenizer,text).filter(t=>t.surface_form==='出口').map(t=>t.reading)).toEqual(['デグチ','イデグチ','デグチ','デグチ']);
});

test('saved corrections take precedence without losing vocabulary or name context',()=>{
  function readings(text:string,overrides:Record<string,string>) {
    const headwords=vocabularyHeadwords(text);
    return readWithOverrides(text,overrides,(fragment,sourceOffset)=>{
      let offset=0;
      return tokenizeVocabulary(tokenizer,fragment,headwords,sourceOffset).flatMap(token=>{
        const start=fragment.indexOf(token.surface_form,offset);offset=start+token.surface_form.length;
        return align(token.surface_form,token.reading ?? '').map(part=>({...part,start:start+part.start,end:start+part.end}));
      });
    });
  }
  expect(readings('出口 = salida',{'出口':'いでぐち'})).toEqual([{start:0,end:2,reading:'いでぐち'}]);
  expect(readings('出口太郎',{'太郎':'たろう'})).toEqual([{start:0,end:2,reading:'いでぐち'},{start:2,end:4,reading:'たろう'}]);
  expect(readings('日本語\n出口 = salida',{'日本語':'にっぽんご'})).toEqual([{start:0,end:3,reading:'にっぽんご'},{start:4,end:6,reading:'でぐち'}]);
});
