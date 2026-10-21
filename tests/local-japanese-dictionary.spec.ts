import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';

test('Japanese importer resolves unique spelling references, preserves sense context, and rejects ambiguous or cyclic aliases',async()=>{
  const root=await mkdtemp(join(tmpdir(),'ko-jp-import-'));
  try {
    const row=(word:string,senses:any[],extra={})=>({word,lang_code:'ja',pos:'noun',senses,...extra});
    const reference=(word:string)=>({glosses:[`${word}の漢字表記。`],form_of:[{word}]});
    const rows=[row('のむ',[{glosses:['液体を','口から取り込む。'],tags:['informal'],raw_tags:['口語']}]),row('飲む',[reference('のむ')]),row('飮む',[reference('飲む')]),
      row('参考形',[{glosses:['液体を取り込むこと。「のむ」の漢字表記。'],form_of:[{word:'のむ'}]}]),
      row('曖昧',[reference('のむ'),reference('別語')]),row('循環甲',[reference('循環乙')]),row('循環乙',[reference('循環甲')]),row('欠落',[reference('存在しない語')]),
      row('未抽出',[{tags:['no-gloss']}]),row('テンプレート',[{glosses:['{{unexpanded}}']}]),
      row('不一致',[{glosses:['別語の漢字表記。'],form_of:[{word:'のむ'}]}]),
      row('橋',[{glosses:['川などを渡る構造物。']}],{forms:[{form:'はし',tags:['transliteration']}]}),
      row('箸',[{glosses:['食事に使う棒。']}],{forms:[{form:'はし',tags:['transliteration']}]}),
      row('か\u3099',[{glosses:['正規化された見出し。']}]),row('English',[{glosses:['Wrong language']}],{lang_code:'en'})];
    const bytes=gzipSync(rows.map(r=>JSON.stringify(r)).join('\n')+'\n'),source=join(root,'source.gz'),metadata=join(root,'snapshot.json');
    await writeFile(source,bytes);await writeFile(metadata,JSON.stringify({sha256:createHash('sha256').update(bytes).digest('hex')}));
    for(const directory of ['a','b'])execFileSync('python3',['scripts/import-jawiktionary.py','--source',source,'--metadata',metadata,'--output',join(root,directory)]);
    const files=await readdir(join(root,'a'));expect(files).toHaveLength(257);
    for(const file of files)expect(await readFile(join(root,'a',file))).toEqual(await readFile(join(root,'b',file)));
    const code=(await build({entryPoints:['src/local-japanese-dictionary.ts'],bundle:true,write:false,format:'iife',globalName:'JP'})).outputFiles[0].text;
    const api=runInNewContext(code+';JP',{Response,DecompressionStream,chrome:{runtime:{getURL:(p:string)=>p}},fetch:async(p:string)=>new Response(await readFile(join(root,'a',p.split('/').at(-1)!)))});
    for(const word of ['のむ','飲む','飮む','参考形'])expect(await api.localJapaneseDefinition(word)).toMatchObject({status:'ok',source:'jawiktionary',title:'のむ',definitions:['液体を 口から取り込む。']});
    for(const word of ['曖昧','循環甲','欠落','未抽出','テンプレート','不一致','English','はし'])expect(await api.localJapaneseDefinition(word)).toBeUndefined();
    expect((await api.localJapaneseDefinition('が')).definitions).toEqual(['正規化された見出し。']);
    const manifest=JSON.parse(await readFile(join(root,'a','manifest.json'),'utf8'));expect(manifest.resolvedSpellings).toBe(3);
    await writeFile(source,gzipSync('changed'));expect(()=>execFileSync('python3',['scripts/import-jawiktionary.py','--source',source,'--metadata',metadata,'--output',join(root,'bad')],{stdio:'pipe'})).toThrow();
  } finally {await rm(root,{recursive:true,force:true});}
});
