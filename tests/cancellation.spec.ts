import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
test('cancelled queued jobs never reach the worker; active cancellation stays isolated by document',async()=>{
  let listener:Function=()=>{},uuid=0;
  const sent:any[]=[],pending=new Map<string,Function>();
  const event={addListener:()=>{}};
  const chrome={
    runtime:{ContextType:{OFFSCREEN_DOCUMENT:'offscreen'},getContexts:async()=>[{}],
      onMessage:{addListener:(fn:Function)=>listener=fn},
      onInstalled:event,onStartup:event,
      sendMessage:(message:any)=>{
        sent.push(message);
        if(message.type==='worker-job')return new Promise(resolve=>pending.set(message.jobId,resolve));
        if(message.type==='worker-cancel'){pending.get(message.jobId)?.({cancelled:true});pending.delete(message.jobId);}
        return Promise.resolve({ok:true});
      }},tabs:{onRemoved:event,onActivated:event,onUpdated:event,query:async()=>[]},
    storage:{onChanged:event}
  };
  runInNewContext(await readFile('dist/background.js','utf8'),{chrome,crypto:{randomUUID:()=>`job-${++uuid}`}});
  const sender=(id:string)=>({tab:{id:1},documentId:id,frameId:0});
  const send=(message:any,document='a')=>new Promise<any>(resolve=>listener(message,sender(document),resolve));
  const a=send({type:'tokenize',requestId:'a',texts:['日本語']});
  await expect.poll(()=>sent.filter(m=>m.type==='worker-job').length).toBe(1);
  const b=send({type:'tokenize',requestId:'b',texts:['図書館']},'b');
  await send({type:'cancel-tokenize',requestId:'b'},'b');
  expect(await b).toEqual({cancelled:true});expect(sent.filter(m=>m.type==='worker-job')).toHaveLength(1);
  await send({type:'cancel-tokenize',requestId:'a'},'other');
  expect(sent.filter(m=>m.type==='worker-cancel')).toHaveLength(0);
  await send({type:'cancel-tokenize',requestId:'a'});
  expect(await a).toEqual({cancelled:true});expect(sent.filter(m=>m.type==='worker-cancel')).toHaveLength(1);
  const fresh=send({type:'tokenize',requestId:'fresh',texts:['病気']});
  await expect.poll(()=>sent.filter(m=>m.type==='worker-job').length).toBe(2);
  const last=sent.filter(m=>m.type==='worker-job').at(-1);pending.get(last.jobId)!({results:[[]]});
  expect(await fresh).toEqual({results:[[]]});
});

test('mascot analysis and replacement never cancel a pending reading or playground request',async()=>{
  let listener:Function=()=>{},uuid=0;const sent:any[]=[],pending=new Map<string,Function>(),event={addListener:()=>{}};
  const chrome={runtime:{ContextType:{OFFSCREEN_DOCUMENT:'offscreen'},getContexts:async()=>[{}],onMessage:{addListener:(fn:Function)=>listener=fn},onInstalled:event,onStartup:event,
    sendMessage:(message:any)=>{sent.push(message);if(message.type==='worker-job')return new Promise(resolve=>pending.set(message.jobId,resolve));if(message.type==='worker-cancel')pending.get(message.jobId)?.({cancelled:true});return Promise.resolve({ok:true});}},tabs:{onRemoved:event,onActivated:event,onUpdated:event,query:async()=>[]},storage:{onChanged:event}};
  runInNewContext(await readFile('dist/background.js','utf8'),{chrome,crypto:{randomUUID:()=>`job-${++uuid}`}});
  const send=(message:any,frame=0)=>new Promise<any>(resolve=>listener(message,{tab:{id:1},documentId:'one',frameId:frame},resolve));
  const reading=send({type:'tokenize',requestId:'reading',texts:['日本語']});await expect.poll(()=>sent.filter(m=>m.type==='worker-job').length).toBe(1);
  const pet=send({type:'tokenize',purpose:'mascot',requestId:'pet',texts:['学校'],includeWords:true});
  const playground=send({type:'tokenize',purpose:'playground',requestId:'play',texts:['食べる']});
  const newer=send({type:'tokenize',purpose:'mascot',requestId:'new',texts:['図書館'],includeWords:true});
  expect(await pet).toEqual({cancelled:true});expect(sent.filter(m=>m.type==='worker-cancel')).toHaveLength(0);
  pending.get(sent[0].jobId)!({results:[[]]});expect(await reading).toEqual({results:[[]]});
  await expect.poll(()=>sent.filter(m=>m.type==='worker-job').length).toBe(2);const second=sent.filter(m=>m.type==='worker-job')[1];expect(second.key).toBe('1:playground');pending.get(second.jobId)!({words:[[]]});expect(await playground).toEqual({words:[[]]});
  await expect.poll(()=>sent.filter(m=>m.type==='worker-job').length).toBe(3);const third=sent.filter(m=>m.type==='worker-job')[2];expect(third.key).toBe('1:mascot');pending.get(third.jobId)!({results:[[]],words:[[]]});expect(await newer).toEqual({results:[[]],words:[[]]});
  expect((await send({type:'tokenize',purpose:'mascot',requestId:'frame',texts:['日本語']},1)).error).toBeTruthy();
  expect((await send({type:'tokenize',purpose:'mascot',requestId:'large',texts:['字'.repeat(1001)]})).error).toBeTruthy();
});
