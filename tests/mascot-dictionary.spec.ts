import {test,expect,chromium,type Browser} from '@playwright/test';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {performance} from 'node:perf_hooks';
let browser:Browser,compiled:string,parser:string,englishFixture:string,japaneseFixture:string;
test.beforeAll(async()=>{
  [englishFixture,japaneseFixture]=await Promise.all(['en','ja'].map(language=>readFile(`tests/fixtures/dictionary/${language}-nomu-spelling.html`,'utf8')));
  compiled=(await build({entryPoints:['src/dictionary.ts'],bundle:true,write:false,platform:'browser',format:'iife',globalName:'Dictionary'})).outputFiles[0].text;
  parser=(await build({entryPoints:['src/wiktionary-parser.ts'],bundle:true,write:false,platform:'browser',format:'iife',globalName:'Parser'})).outputFiles[0].text;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true});
});
test.afterAll(async()=>{await browser?.close();});
const ordinary=(language:string,text='A useful definition.')=>`<h2>${language==='ja'?'日本語':'Japanese'}</h2><h3>${language==='ja'?'動詞':'Verb'}</h3><ol><li>${text}</li></ol>`;
const englishReference=(target='のむ')=>`<h2>Japanese</h2><table class="wikitable ja-see"><tbody><tr><td>For pronunciation and definitions of 飲む – see the following entry.</td></tr><tr><td>【<span lang="ja"><a href="/wiki/${encodeURIComponent(target)}#Japanese">${target}</a></span>】<dl><dd>[verb] to drink</dd></dl></td></tr></tbody></table><h3>References</h3>`;
async function harness(options:{brokenLocal?:boolean;deadline?:number;respond?:(word:string,language:string)=>any;parseDelay?:boolean}={}) {
  const page=await browser.newPage();await page.addScriptTag({content:parser});
  let listener:Function=()=>{},now=0,offscreen=false,created=0;const requests:string[]=[],localLoads:string[]=[];
  class Clock extends Date {static now(){return now;}}
  const chrome={runtime:{getURL:(path:string)=>`chrome-extension://test/${path}`,onMessage:{addListener:(fn:Function)=>listener=fn},ContextType:{OFFSCREEN_DOCUMENT:'OFFSCREEN_DOCUMENT'},
    getContexts:async()=>offscreen?[{}]:[],sendMessage:async(message:any)=>{
      if(options.parseDelay)return new Promise(()=>{});
      return page.evaluate(({html,language})=>(window as any).Parser.parseWiktionary(html,language),message);
    }},offscreen:{Reason:{WORKERS:'WORKERS',DOM_PARSER:'DOM_PARSER'},createDocument:async()=>{created++;offscreen=true;}}};
  const fetch=async(input:string|URL,init?:RequestInit)=>{
    const url=new URL(input);
    if(url.protocol==='chrome-extension:') {
      localLoads.push(url.pathname);if(options.brokenLocal)throw new Error('Missing shard');
      return new Response(await readFile('dist'+url.pathname));
    }
    expect(init).toMatchObject({credentials:'omit',referrerPolicy:'no-referrer',redirect:'error'});
    const language=url.hostname.split('.')[0],word=url.searchParams.get('page')!;requests.push(`${language}:${word}`);
    const result=options.respond?.(word,language) ?? {parse:{title:word,text:ordinary(language)}};
    if(result instanceof Error)throw result;
    if(result instanceof Response)return result;
    return new Response(JSON.stringify(result));
  };
  const api=runInNewContext(compiled+';Dictionary',{chrome,fetch,URL,URLSearchParams,AbortSignal:options.deadline?{timeout:()=>AbortSignal.timeout(options.deadline)}:AbortSignal,TextDecoder,Response,DecompressionStream,Date:Clock});
  const send=(message:unknown,sender:any={tab:{id:1},frameId:0,url:'https://example.com/'})=>new Promise<any>(resolve=>listener(message,sender,resolve));
  return {send,lookup:api.lookupDefinition as (language:string,word:string)=>Promise<any>,requests,localLoads,tick:(ms:number)=>now+=ms,created:()=>created,close:()=>page.close()};
}

test('language selection remains compatible and invalid requests perform no I/O',async()=>{
  const h=await harness();try {
    const word='未収録の辞書試験語';
    expect(Object.keys(await h.send({type:'define-word',word,language:'en'}))).toEqual(['en']);expect(h.requests).toEqual([`en:${word}`]);
    expect(Object.keys(await h.send({type:'define-word',word}))).toEqual(['en','ja']);expect(h.requests).toEqual([`en:${word}`,`ja:${word}`]);
    const before=[h.requests.length,h.localLoads.length];
    for(const message of [{type:'define-word',word:'日本語',language:'both'},{type:'define-word',word:'<script>'},{type:'define-word',word:'字'.repeat(81)},{type:'define-word',word:' '}])expect((await h.send(message)).error).toBeTruthy();
    for(const sender of [{tab:{id:1},frameId:1,url:'https://example.com/'},{frameId:0,url:'https://example.com/'},{tab:{id:1},frameId:0,url:'file:///secret'},{tab:{id:1},frameId:0,url:'bad'}])expect((await h.send({type:'define-word',word:'日本語'},sender)).error).toBeTruthy();
    expect([h.requests.length,h.localLoads.length]).toEqual(before);
  } finally {await h.close();}
});

test('complete bundled dictionary serves common spellings and kana offline; warm lookups share results',async()=>{
  const h=await harness({respond:()=>new Error('Offline')});try {
    const timings=[];
    for(const [word,meaning] of [['飲む','to drink'],['のむ','to drink'],['食べる','to eat'],['学校','school'],['ありがとう','thank you']]) {
      const start=performance.now();const result=await h.lookup('en',word);const cold=performance.now()-start;
      expect(result).toMatchObject({status:'ok',source:'jmdict',title:word});expect(result.definitions.join(' ')).toContain(meaning);
      const warmStart=performance.now();expect(await h.lookup('en',word)).toEqual(result);timings.push({word,coldMs:+cold.toFixed(2),warmMs:+(performance.now()-warmStart).toFixed(2)});
    }
    expect(h.requests).toEqual([]);expect(h.created()).toBe(0);expect(h.localLoads).toHaveLength(5);
    console.log('Local dictionary timings (Node harness, filesystem fetch):',JSON.stringify(timings));
    const loads=h.localLoads.length;await Promise.all(Array.from({length:5},()=>h.lookup('en','海賊')));expect(h.localLoads.length-loads).toBeLessThanOrEqual(1);
  } finally {await h.close();}
});

test('English and Japanese 飲む resolve recognized spelling-reference pages to のむ',async()=>{
  const h=await harness({brokenLocal:true,respond:(word,language)=>({parse:{title:word,text:word==='飲む'?(language==='en'?englishFixture:japaneseFixture):ordinary(language,language==='en'?'to drink':'液体を口に入れる。')}})});
  try {
    const result=await h.send({type:'define-word',word:'飲む'});
    expect(result.en).toMatchObject({status:'ok',title:'のむ',source:'wiktionary',definitions:['to drink']});
    expect(result.ja).toMatchObject({status:'ok',title:'のむ',definitions:['液体を口に入れる。']});
    expect(h.requests.sort()).toEqual(['en:のむ','en:飲む','ja:のむ','ja:飲む'].sort());expect(h.created()).toBe(1);
  } finally {await h.close();}
});

test('parser removes unsafe markup and excludes other languages, nested examples and references',async()=>{
  const h=await harness({brokenLocal:true,respond:()=>({parse:{title:'resolved',text:'<h2>Chinese</h2><h3>Noun</h3><ol><li>Wrong</li></ol><div class="mw-heading"><h2>Japanese</h2></div><h3>Noun<span class="mw-editsection">edit</span></h3><ol><li>Safe &amp; useful<img src="https://bad.test"><script>alert(1)</script><dl><dd>Hidden</dd></dl><ul><li>Hidden</li></ul><ol><li>Nested</li></ol></li></ol><h4>References</h4><ol><li>Wrong reference</li></ol><h2>Korean</h2><h3>Noun</h3><ol><li>Wrong</li></ol>'}})});
  try {expect(await h.lookup('en','未収録試験語')).toMatchObject({status:'ok',title:'resolved',definitions:['Safe & useful']});}
  finally {await h.close();}
});

test('ambiguous, external, cyclic and excessively long references are retryable structure failures',async()=>{
  for(const scenario of ['ambiguous','external','cycle','long','unknown']) {
    const h=await harness({brokenLocal:true,respond:(word)=>({parse:{title:word,text:scenario==='ambiguous'?englishReference('甲')+englishReference('乙'):scenario==='external'?englishReference().replace('/wiki/','https://attacker.test/wiki/'):scenario==='cycle'?englishReference(word==='甲'?'乙':'甲'):scenario==='long'?englishReference(word+'甲'):'<h2>Japanese</h2><h3>Unrecognized layout</h3><p>Has meanings.</p>'}})});
    try {
      expect(await h.lookup('en','甲')).toMatchObject({status:'error',reason:'structure'});
      const count=h.requests.length;expect(count).toBeLessThanOrEqual(3);
      await h.lookup('en','甲');expect(h.requests.length).toBe(count*2);
    } finally {await h.close();}
  }
});

test('genuine misses expire after five minutes and transient failures are never cached',async()=>{
  let missing=true,fail=true;
  const h=await harness({brokenLocal:true,respond:(word)=>word==='欠落語'?(missing?{error:{code:'missingtitle'}}:{parse:{title:word,text:ordinary('en')}}):(fail?new Response('',{status:429}):{parse:{title:word,text:ordinary('en')}})});
  try {
    expect((await h.lookup('en','欠落語')).status).toBe('missing');missing=false;
    expect((await h.lookup('en','欠落語')).status).toBe('missing');expect(h.requests).toHaveLength(1);
    h.tick(300001);expect((await h.lookup('en','欠落語')).status).toBe('ok');
    expect((await h.lookup('en','失敗語')).status).toBe('error');fail=false;
    expect((await h.lookup('en','失敗語')).status).toBe('ok');expect(h.requests).toHaveLength(4);
  } finally {await h.close();}
});

test('a single deadline covers offscreen parsing and oversized replies are rejected',async()=>{
  const h=await harness({brokenLocal:true,deadline:50,parseDelay:true});
  try {expect(await h.lookup('en','遅延語')).toMatchObject({status:'error',reason:'network'});}finally{await h.close();}
  const huge=await harness({brokenLocal:true,respond:()=>new Response('x'.repeat(1_000_001))});
  try {expect(await huge.lookup('en','巨大語')).toMatchObject({status:'error',reason:'structure'});}finally{await huge.close();}
});

test('pending lookups deduplicate, concurrency is bounded, and shared results evict at 256 entries',async()=>{
  const h=await harness({brokenLocal:true,deadline:500,parseDelay:true});
  try {
    const jobs=Array.from({length:8},(_,index)=>h.lookup('en',`繁忙${index}`));
    const same=h.lookup('en','繁忙0');
    expect(await h.lookup('en','別語')).toMatchObject({status:'error',reason:'busy'});
    await Promise.all([...jobs,same]);expect(h.requests).toHaveLength(8);
  } finally {await h.close();}
  const bounded=await harness({respond:()=>({error:{code:'missingtitle'}})});
  try {
    for(let i=0;i<257;i++)await bounded.lookup('ja',`欠落${i}`);
    expect(bounded.requests).toHaveLength(257);await bounded.lookup('ja','欠落0');expect(bounded.requests).toHaveLength(258);
  } finally {await bounded.close();}
});
