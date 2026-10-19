import {test,expect} from '@playwright/test';
import {build} from 'esbuild';
import {runInNewContext} from 'node:vm';
test('dictionary language selection stays backward compatible and rejects malformed requests before fetching',async()=>{
  const compiled=await build({entryPoints:['src/dictionary.ts'],bundle:true,write:false,platform:'browser',format:'iife'});
  let listener:Function=()=>{};const requested:string[]=[];
  const chrome={runtime:{onMessage:{addListener:(fn:Function)=>listener=fn}}};
  const fetch=async(url:URL)=>{requested.push(url.href);return new Response(JSON.stringify({parse:{title:'日本語',text:'<h2>Japanese</h2>'}}));};
  runInNewContext(compiled.outputFiles[0].text,{chrome,fetch,URL,URLSearchParams,AbortSignal,TextDecoder});
  const send=(message:unknown,sender:any={tab:{id:1},frameId:0,url:'https://example.com/'})=>new Promise<any>(resolve=>listener(message,sender,resolve));
  const english=await send({type:'define-word',word:'日本語',language:'en'});expect(Object.keys(english)).toEqual(['en']);expect(requested.map(url=>new URL(url).hostname)).toEqual(['en.wiktionary.org']);
  requested.length=0;const both=await send({type:'define-word',word:'日本語'});expect(Object.keys(both)).toEqual(['en','ja']);expect(requested).toHaveLength(2);
  requested.length=0;
  for(const message of [{type:'define-word',word:'日本語',language:'both'},{type:'define-word',word:'<script>'},{type:'define-word',word:'字'.repeat(81)}])expect((await send(message)).error).toBeTruthy();
  expect((await send({type:'define-word',word:'日本語',language:'ja'},{tab:{id:1},frameId:1,url:'https://example.com/'})).error).toBeTruthy();expect(requested).toEqual([]);
});
