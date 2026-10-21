import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {mkdtemp,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';

test('importer preserves dictionary restrictions and metadata, is deterministic, and rejects changed snapshots',async()=>{
  const root=await mkdtemp(join(tmpdir(),'ko-jmdict-import-'));
  try {
    const xml=`<?xml version="1.0"?><!DOCTYPE JMdict [<!ENTITY n "noun">]><JMdict>
      <entry><ent_seq>1</ent_seq><k_ele><keb>甲</keb><ke_pri>ichi1</ke_pri></k_ele><k_ele><keb>乙</keb></k_ele>
      <r_ele><reb>こう</reb><re_restr>甲</re_restr><re_inf>rare reading</re_inf><re_pri>news1</re_pri></r_ele>
      <r_ele><reb>おつ</reb><re_restr>乙</re_restr></r_ele>
      <sense><stagk>甲</stagk><pos>&n;</pos><misc>archaic</misc><gloss>first sense</gloss></sense>
      <sense><stagk>乙</stagk><stagr>おつ</stagr><field>science</field><dial>regional</dial><s_inf>usage note</s_inf><gloss>second sense</gloss><gloss xml:lang="ger">Not English</gloss></sense>
      <sense><stagk>甲</stagk><stagr>おつ</stagr><gloss>invalid pairing</gloss></sense></entry>
      <entry><ent_seq>2</ent_seq><r_ele><reb>こう</reb><re_nokanji/></r_ele><sense><gloss>kana homograph</gloss></sense></entry>
      <entry><ent_seq>3</ent_seq><k_ele><keb>合</keb></k_ele><r_ele><reb>こう</reb><re_nokanji/></r_ele><sense><stagk>合</stagk><gloss>must not match no-kanji reading</gloss></sense><sense><gloss>kana only</gloss></sense></entry>
      <entry><ent_seq>4</ent_seq><r_ele><reb>か\u3099</reb></r_ele><sense><gloss>normalized kana</gloss></sense></entry>
      </JMdict>`;
    const source=join(root,'source.gz'),metadata=join(root,'snapshot.json');const bytes=gzipSync(xml);
    await writeFile(source,bytes);await writeFile(metadata,JSON.stringify({sha256:createHash('sha256').update(bytes).digest('hex'),retrieved:'2026-10-21'}));
    for(const name of ['a','b'])execFileSync('python3',['scripts/import-jmdict.py','--source',source,'--metadata',metadata,'--output',join(root,name)]);
    const names=await readdir(join(root,'a'));expect(names).toHaveLength(257);
    for(const name of names)expect(await readFile(join(root,'a',name))).toEqual(await readFile(join(root,'b',name)));
    const compiled=(await build({entryPoints:['src/local-dictionary.ts'],bundle:true,write:false,format:'iife',globalName:'Local'})).outputFiles[0].text;
    const loads:string[]=[];
    const api=runInNewContext(compiled+';Local',{Response,DecompressionStream,chrome:{runtime:{getURL:(path:string)=>path}},fetch:async(path:string)=>{loads.push(path);return new Response(await readFile(join(root,'a',path.split('/').at(-1)!)));}});
    const first=await api.localDefinition('甲');expect(first.definitions).toEqual(['(archaic) first sense']);
    expect((await api.localDefinition('乙')).definitions).toEqual(['(science; regional; usage note) second sense']);
    const kana=await api.localDefinition('こう');expect(kana.definitions).toEqual(['(archaic) first sense','kana homograph','kana only']);
    expect(await api.localDefinition('合')).toBeUndefined();
    expect((await api.localDefinition('が')).definitions).toEqual(['normalized kana']);
    expect((await api.localDefinition('か\u3099')).definitions).toEqual(['normalized kana']);
    const shard=JSON.parse(gunzipSync(await readFile(join(root,'a',`${api.dictionaryBucket('甲')}.json.gz`))).toString('utf8'));
    expect(shard.entries['1'].readings[0]).toMatchObject({restrict:['甲'],priority:['news1'],info:['rare reading']});
    expect(shard.entries['1'].senses[1].pos).toEqual(['noun']);
    const bucketTerms=new Map<string,string>();
    for(let i=0;bucketTerms.size<17;i++){const word=`試験${i}`;bucketTerms.set(api.dictionaryBucket(word),word);}
    const words=[...bucketTerms.values()];for(const word of words)await api.localDefinition(word);
    const count=loads.length;await api.localDefinition(words[0]);expect(loads.length).toBe(count+1);
    await writeFile(source,gzipSync(xml+' '));
    expect(()=>execFileSync('python3',['scripts/import-jmdict.py','--source',source,'--metadata',metadata,'--output',join(root,'bad')],{stdio:'pipe'})).toThrow();
  } finally {await rm(root,{recursive:true,force:true});}
});
