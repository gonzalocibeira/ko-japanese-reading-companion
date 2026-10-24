import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {readFile,readdir} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {createHash} from 'node:crypto';

async function harness() {
 const code=(await build({entryPoints:['src/playground-data-worker.ts'],bundle:true,write:false,format:'iife',globalName:'Data'})).outputFiles[0].text;
 const paths:string[]=[];
 const api=runInNewContext(code+';Data',{self:{},Response,DecompressionStream,chrome:{runtime:{getURL:(path:string)=>path}},fetch:async(path:string)=>{paths.push(path);if(!path.startsWith('dictionaries/') && !path.startsWith('grammar/'))throw new Error('External request');return new Response(await readFile(`dist/${path}`));}});
 return {query:api.queryPlayground,paths};
}

test('bundled search finds spellings, readings, English tokens, prefixes and stable pages',async()=>{
 const h=await harness();
 const exact=await h.query({op:'search',query:'食べる',offset:0});expect(exact.hits[0].headword).toBe('食べる');
 const kana=await h.query({op:'search',query:'タベル',offset:0});expect(kana.hits.some((x:any)=>x.id===exact.hits[0].id)).toBe(true);
 const english=await h.query({op:'search',query:'peace',offset:0});expect(english.hits.some((x:any)=>x.headword==='平和')).toBe(true);
 expect((await h.query({op:'search',query:'cat',offset:0})).hits[0].headword).toBe('猫');
 const restricted=await h.query({op:'search',query:'相引き',offset:0});expect(restricted.hits.find((x:any)=>x.id==='2691930')?.meaning).not.toContain('bench');
 const prefix=await h.query({op:'search',query:'食べ',offset:0});expect(prefix.total).toBeGreaterThan(1);
 const a=await h.query({op:'search',query:'water',offset:0}),b=await h.query({op:'search',query:'water',offset:30});expect(a.hits).toHaveLength(30);expect(b.hits).toHaveLength(30);expect(new Set([...a.hits,...b.hits].map((x:any)=>x.id)).size).toBe(60);
 expect((await h.query({op:'search',query:'zzzzzznotaword',offset:0})).total).toBe(0);
 expect(h.paths.filter(p=>!p.startsWith('dictionaries/'))).toEqual([]);
});

test('entry details retain homographs, spelling/reading restrictions and sense metadata',async()=>{
 const h=await harness(),search=await h.query({op:'search',query:'はし',offset:0});
 expect(search.hits.length).toBeGreaterThan(2);expect(new Set(search.hits.map((x:any)=>x.id)).size).toBe(search.hits.length);
 const hit=search.hits.find((x:any)=>x.headword==='橋');expect(hit).toBeTruthy();
 const entry=await h.query({op:'entry',id:hit.id,bucket:hit.bucket});expect(entry.readings.some((x:any)=>x.text==='はし')).toBe(true);expect(entry.senses[0]).toHaveProperty('spellings');expect(entry.senses[0]).toHaveProperty('pos');expect(entry.senses[0]).toHaveProperty('misc');
});

test('all coverage refs resolve to complete grammar and eighteen reachable comparison activities',async()=>{
 const coverage=JSON.parse(await readFile('dist/grammar/coverage.json','utf8')),index=JSON.parse(await readFile('dist/grammar/index.json','utf8'));
 expect(coverage.entries).toHaveLength(848);expect(index).toHaveLength(847);const ids=new Set(index.map((x:any)=>x.id));
 expect(index.find((point:any)=>point.id==='n5-029').groups).toEqual(['time','comparison']);
 for(const reference of coverage.entries)expect(ids.has(reference.pointId),reference.reference).toBe(true);
 for(const summary of index) {
  const point=JSON.parse(await readFile(`dist/grammar/points/${summary.id}.json`,'utf8'));expect(point.examples).toHaveLength(3);expect(point.formation.length).toBeGreaterThan(0);
  for(const example of point.examples) {
   expect(example.segments.some((s:any)=>s.role)).toBe(true);expect(example.segments.map((s:any)=>s.text).join('')).not.toMatch(/[\[\]]/);expect(example.translation).toBeTruthy();expect(example.note).toBeTruthy();
   for(const segment of example.segments)if(segment.reading)expect(segment.reading).not.toMatch(/[\p{Script=Han}]/u);
  }
  for(const id of point.related)expect(ids.has(id)).toBe(true);
 }
 const h=await harness(),names=await readdir('dist/grammar/comparisons');expect(names).toHaveLength(18);
 const families:any[]=[];
 for(const name of names){
  const c=await h.query({op:'comparison',id:name.replace('.json','')});families.push(c);
  expect(c.answers[c.correct]).toBeTruthy();expect(c.variants.length).toBeGreaterThan(1);
  for(const pointId of c.pointIds){const point=index.find((p:any)=>p.id===pointId);expect(point?.comparisons).toContain(c.id);}
  for(const variant of c.variants){
   expect(variant.label).toBeTruthy();expect(variant.change).toBeTruthy();expect(variant.example.translation).toBeTruthy();expect(variant.example.note).toBeTruthy();
   expect(variant.example.segments.some((s:any)=>s.role)).toBe(true);expect(variant.example.segments.map((s:any)=>s.text).join('')).not.toMatch(/[\[\]]/);
   for(const segment of variant.example.segments)if(segment.reading)expect(segment.reading).not.toMatch(/[\p{Script=Han}]/u);
  }
 }
 for(const point of index)for(const id of point.comparisons)expect(families.find(f=>f.id===id)?.pointIds).toContain(point.id);
 const metadata=JSON.parse(await readFile('dist/grammar/index-metadata.json','utf8'));
 expect(metadata.comparisons).toBe(18);expect(metadata.comparisonExamples).toBe(families.reduce((sum,f)=>sum+f.variants.length,0));
 // The digest follows authoring order and covers comparison-only content changes.
 const code=(await build({entryPoints:['data/grammar/comparisons.mjs'],bundle:true,write:false,format:'iife',globalName:'Content'})).outputFiles[0].text;
 const authored=runInNewContext(code+';Content.default');
 const ordered=authored.map((family:any)=>families.find(f=>f.id===family.id));
 expect(metadata.comparisonSha256).toBe(createHash('sha256').update(JSON.stringify(ordered)).digest('hex'));
 expect(h.paths.every(path=>path.startsWith('grammar/'))).toBe(true);
 for(const [id,reading] of [['n4-001','あいだ'],['n4-002','あいだに']]){
  const point=await h.query({op:'grammar',id});for(const example of point.examples)expect(example.segments.find((s:any)=>s.role)?.reading).toBe(reading);
 }
 expect(families.find(f=>f.id==='opportunity-window').variants[1].example.segments.find((s:any)=>s.text==='間に').reading).toBe('あいだに');
});

test('comparison authoring rejects duplicate asset IDs, broken links, bad spans and invalid activities',async()=>{
 const code=(await build({entryPoints:['scripts/grammar-comparisons.mjs'],bundle:true,write:false,format:'iife',globalName:'Validation'})).outputFiles[0].text;
 const validate=runInNewContext(code+';Validation.validateGrammarComparisons');
 const source=JSON.parse(await readFile('dist/grammar/comparisons/only.json','utf8'));
 const family={...source,variants:source.variants.map((v:any)=>({...v,example:{text:v.example.segments.map((s:any)=>s.role?`[${s.text}]`:s.text).join(''),translation:v.example.translation,note:v.example.note}}))};
 const points=new Set(family.pointIds);expect(()=>validate([family],points)).not.toThrow();
 expect(()=>validate([family,family],points)).toThrow(/duplicate ID/);
 expect(()=>validate([{...family,id:'../escape'}],points)).toThrow(/ID/);
 expect(()=>validate([{...family,pointIds:['missing']}],points)).toThrow(/point links/);
 expect(()=>validate([{...family,correct:0.5}],points)).toThrow(/activity/);
 expect(()=>validate([{...family,correct:family.answers.length}],points)).toThrow(/activity/);
 expect(()=>validate([{...family,variants:[{...family.variants[0],example:{...family.variants[0].example,text:'[unterminated'}},family.variants[1]]}],points)).toThrow(/spans/);
 expect(()=>validate([{...family,variants:[{...family.variants[0],example:{...family.variants[0].example,readings:{missing:'かな'}}},family.variants[1]]}],points)).toThrow(/reading/);
 // Shared points are allowed: all families must remain navigable from that point.
 expect(()=>validate([family,{...family,id:'second-family'}],points)).not.toThrow();
});

test('playground request validation bounds queries and prevents paths or arbitrary online text',async()=>{
 const source=(await build({entryPoints:['src/playground-service.ts'],bundle:true,write:false,format:'iife',globalName:'Service'})).outputFiles[0].text;
 const listeners:Function[]=[];const chrome={runtime:{id:'x',getURL:(s:string)=>`chrome-extension://x/${s}`,onMessage:{addListener:(fn:Function)=>listeners.push(fn)}}};
 const api=runInNewContext(source+';Service',{chrome});
 for(const q of [{op:'grammar',id:'../../secret'},{op:'entry',id:'1',bucket:'../x'},{op:'search',query:'x'.repeat(81),offset:0},{op:'search',query:'x',offset:-1},{op:'online',word:'an English sentence',language:'en'},{op:'online',word:'日本',language:'xx'}])expect(api.validPlaygroundQuery(q)).toBe(false);
 for(const q of [{op:'search',query:'peace',offset:0},{op:'grammar',id:'n1-001'},{op:'online',word:'平和',language:'en'},{op:'japanese',word:'AI'}])expect(api.validPlaygroundQuery(q)).toBe(true);
 const handler=listeners.at(-1)!;for(const sender of [{id:'other',url:'chrome-extension://x/playgrounds.html'},{id:'x',url:'chrome-extension://x/popup.html'},{id:'x',tab:{id:1},frameId:1,url:'https://example.com'}]){let response:any;handler({type:'playground-data',query:{op:'grammar-index'}},sender,(r:any)=>response=r);expect(response.error).toBe('Invalid playground request');}
});
