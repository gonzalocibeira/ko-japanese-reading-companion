import {test,expect,chromium,type BrowserContext,type Page} from '@playwright/test';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
let context:BrowserContext,profile:string,origin:string;
test.beforeAll(async()=>{
 profile=await mkdtemp(resolve(tmpdir(),'ko-v14-'));const path=resolve('dist');
 context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true,args:[`--disable-extensions-except=${path}`,`--load-extension=${path}`]});
 const worker=context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');origin=`chrome-extension://${new URL(worker.url()).host}`;
});
test.afterAll(async()=>{await context?.close();if(profile)await rm(profile,{recursive:true,force:true});});
const current=(page:Page)=>page.getByRole('tabpanel').filter({visible:true});

const newFamilies=['state-preparation','purpose-goals','decisions-arrangements','expectation-advice','recent-completion','concession','inference','qualified-denial','unexpected-inclusion','opportunity-window'];

test('all ten new comparison families switch complete sentences and explain activities offline',async()=>{
 const page=await context.newPage(),requests:string[]=[];
 page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});await context.setOffline(true);
 try {
  await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Grammar',exact:true}).click();await page.getByLabel('Grammar level').selectOption('All');
  for(const id of newFamilies){
   const family=JSON.parse(await readFile(`dist/grammar/comparisons/${id}.json`,'utf8')),point=JSON.parse(await readFile(`dist/grammar/points/${family.pointIds[0]}.json`,'utf8'));
   await page.getByLabel('Search grammar').fill(point.pattern);
   await current(page).locator('.tool-result').filter({has:page.getByText(point.pattern,{exact:true})}).filter({has:page.getByText(point.purpose,{exact:true})}).click();
   const section=current(page).getByRole('region',{name:family.title,exact:true}),choices=section.getByRole('group',{name:`Compare: ${family.title}`,exact:true});
   await expect(choices.getByRole('button')).toHaveCount(family.variants.length);
   for(const variant of family.variants){
    await choices.getByRole('button',{name:variant.label,exact:true}).focus();await page.keyboard.press('Space');
    await expect(choices.locator('[aria-pressed=true]')).toHaveText(variant.label);await expect(choices.locator('[aria-pressed=true]')).toHaveCount(1);
    await expect(section.locator('.grammar-translation')).toHaveText(variant.example.translation);await expect(section.locator('.grammar-change')).toHaveText(`What changed? ${variant.change}`);
    await section.locator('.grammar-highlight').first().click();await expect(section.locator('.grammar-lens')).toHaveText(variant.change);
   }
   await section.getByText('Choose the meaning',{exact:true}).click();await section.getByRole('button',{name:family.answers[(family.correct+1)%family.answers.length],exact:true}).click();await expect(section.locator('.grammar-activity [role=status]')).toContainText('Try another interpretation.');
   await section.getByRole('button',{name:family.answers[family.correct],exact:true}).click();await expect(section.locator('.grammar-activity [role=status]')).toHaveText(`Yes. ${family.feedback}`);
   if(id==='state-preparation'){await section.getByRole('heading').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/v14-comparison-expansion.png',fullPage:true});}
   await current(page).getByRole('button',{name:'Results',exact:true}).click();
  }
  expect(requests).toEqual([]);
 }finally{await page.close();}
});

test('three-variant comparison retains keyboard choice, activity, focus and scroll after dictionary return at 280px',async()=>{
 const page=await context.newPage();
 try {
  await page.setViewportSize({width:280,height:850});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Grammar',exact:true}).click();
  await page.getByLabel('Search grammar').fill('te iru');await current(page).locator('.tool-result').filter({has:page.getByText('ている',{exact:true})}).click();
  const section=current(page).locator('.grammar-comparison');await section.getByRole('button',{name:'ておく · advance action',exact:true}).focus();await page.keyboard.press('Enter');
  await section.getByText('Choose the meaning',{exact:true}).click();await section.getByRole('button',{name:'会議室の窓が開けてあります。',exact:true}).click();
  const word=section.getByRole('button',{name:'Look up 窓',exact:true});await word.scrollIntoViewIfNeeded();await word.focus();
  const before=await current(page).locator('.tool-scroll').evaluate(el=>el.scrollTop);await page.keyboard.press('Enter');
  await expect(current(page).getByLabel('Search dictionary')).toHaveValue('窓');await expect(current(page).locator('.tool-result').first()).toBeVisible();await page.getByRole('button',{name:'Return to previous playground'}).click();
  await expect(section.locator('.grammar-switches [aria-pressed=true]')).toHaveText('ておく · advance action');await expect(section.locator('.grammar-activity [role=status]')).toContainText('Yes.');await expect(word).toBeFocused();
  expect(Math.abs(await current(page).locator('.tool-scroll').evaluate(el=>el.scrollTop)-before)).toBeLessThanOrEqual(2);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await section.getByRole('heading').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/v14-comparison-expansion-narrow.png',fullPage:true});
 }finally{await page.close();}
});

test('comparison asset retry works and a late comparison cannot replace a newly opened point',async()=>{
 const page=await context.newPage();await page.addInitScript(()=>{
  const send=chrome.runtime.sendMessage.bind(chrome.runtime);let attempts=0;
  (chrome.runtime as any).sendMessage=(message:any)=>{
   if(message.type!=='playground-data' || message.query.op!=='comparison' || message.query.id!=='state-preparation')return send(message);
   attempts++;
   if(attempts===1)return Promise.resolve({error:'Local comparison is unavailable.'});
   if(attempts===3)return new Promise(resolve=>(window as any).releaseComparison=()=>send(message).then(resolve));
   return send(message);
  };
 });
 try {
  await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Grammar',exact:true}).click();await page.getByLabel('Search grammar').fill('te iru');await current(page).locator('.tool-result').filter({has:page.getByText('ている',{exact:true})}).click();
  await expect(current(page).locator('.tool-error')).toContainText('comparison is unavailable');await current(page).getByRole('button',{name:'Try again',exact:true}).click();await expect(current(page).locator('.grammar-switches button')).toHaveCount(3);
  await current(page).getByRole('button',{name:'Results',exact:true}).click();await current(page).locator('.tool-result').filter({has:page.getByText('ている',{exact:true})}).click();await expect.poll(()=>page.evaluate(()=>typeof (window as any).releaseComparison)).toBe('function');
  await current(page).getByRole('button',{name:'Results',exact:true}).click();await page.getByLabel('Search grammar').fill('dake');await current(page).locator('.tool-result').first().click();await expect(current(page).locator('.grammar-switches button')).toHaveCount(2);
  await page.evaluate(()=>(window as any).releaseComparison());await expect(current(page).locator('.tool-heading')).toHaveText('だけ');await expect(current(page).locator('.grammar-switches button')).toHaveCount(2);await expect(current(page).locator('.grammar-comparison h3')).toContainText('Restrict a choice');
 }finally{await page.close();}
});

test('offline dictionary, all grammar levels, comparison activity and linked returns work in a real extension',async()=>{
 const requests:string[]=[];context.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});await context.setOffline(true);
 const page=await context.newPage();await page.goto(`${origin}/playgrounds.html`);await expect(page.getByRole('tab',{name:'Word forms',exact:true})).toHaveAttribute('aria-selected','true');
 await page.getByRole('tab',{name:'Dictionary',exact:true}).click();await page.getByLabel('Search dictionary').fill('peace');await expect(current(page).locator('.tool-status')).toContainText('entries · offline');
 await current(page).getByRole('button').filter({hasText:'平和'}).first().click();await expect(current(page).locator('.tool-heading')).toHaveText('平和');await expect(current(page).locator('.dictionary-senses')).toContainText('peace');
 await page.getByRole('tab',{name:'Grammar',exact:true}).click();await expect(page.getByLabel('Grammar level')).toHaveValue('N5');await page.getByLabel('Search grammar').fill('dake');await current(page).locator('.tool-result').first().click();
 await current(page).getByRole('button',{name:'しか～ない',exact:true}).click();await expect(current(page).locator('.grammar-change')).toContainText('negative predicate');
 await current(page).getByText('Choose the meaning',{exact:true}).click();await current(page).getByRole('button',{name:'I drink nothing but coffee.',exact:true}).click();await expect(current(page).locator('.grammar-activity')).toContainText('Yes.');
 await current(page).locator('.grammar-comparison').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/v14-sentence-lens.png',fullPage:true});
 await current(page).getByRole('button',{name:'Look up 朝',exact:true}).first().click();await expect(current(page).getByLabel('Search dictionary')).toHaveValue('朝');await current(page).locator('.tool-result').first().click();await expect(current(page).locator('.tool-heading')).toHaveText('朝');await page.getByRole('button',{name:'Return to previous playground'}).click();
 await expect(current(page).locator('.grammar-switches [aria-pressed=true]')).toHaveText('しか～ない');await expect(current(page).locator('.grammar-activity')).toContainText('Yes.');
 await page.getByRole('tab',{name:'Dictionary',exact:true}).click();await expect(page.getByLabel('Search dictionary')).toHaveValue('peace');await expect(current(page).locator('.tool-heading')).toHaveText('平和');
 await page.getByRole('tab',{name:'Grammar',exact:true}).click();await current(page).getByRole('button',{name:'Results',exact:true}).click();await page.getByLabel('Search grammar').fill('');
 for(const level of ['N5','N4','N3','N2','N1']){await page.getByLabel('Grammar level').selectOption(level);await expect(current(page).locator('.tool-status')).toContainText('grammar points · offline');expect(await current(page).locator('.tool-result').count()).toBe(30);}
 expect(requests).toEqual([]);await page.screenshot({path:'test-results/v14-grammar-catalog.png',fullPage:true});await page.close();
});

test('dictionary misses request external data only after the explicit language button',async()=>{
 await context.setOffline(false);const requests:string[]=[];
 await context.route('https://**.wiktionary.org/**',async route=>{requests.push(route.request().url());await route.fulfill({status:404,body:''});});
 const page=await context.newPage();await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Dictionary',exact:true}).click();await page.getByLabel('Search dictionary').fill('ぬぬぬぬぬぬぬ');
 await expect(page.getByRole('button',{name:'Look up English online',exact:true})).toBeVisible();expect(requests).toEqual([]);
 await page.getByRole('button',{name:'Look up English online',exact:true}).click();await expect.poll(()=>requests.length).toBe(1);expect(new URL(requests[0]).searchParams.get('page')).toBe('ぬぬぬぬぬぬぬ');
 await expect(current(page)).toContainText('No Japanese entry was found');await page.close();await context.unroute('https://**.wiktionary.org/**');
});

test('four-tab keyboard navigation and narrow grammar details fit at 280px',async()=>{
 const page=await context.newPage();await page.setViewportSize({width:280,height:850});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`${origin}/playgrounds.html`);
 await page.getByRole('tab',{name:'Word forms',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:'Grammar',exact:true})).toBeFocused();
 await page.getByLabel('Search grammar').fill('dake');await current(page).locator('.tool-result').first().click();await expect(current(page).locator('.tool-detail')).toBeVisible();
 await current(page).locator('.grammar-highlight').first().click();await expect(current(page).locator('.grammar-lens').first()).toContainText('Limit');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/v14-grammar-narrow.png',fullPage:true});await page.keyboard.press('Escape');await expect(current(page).locator('.tool-detail')).toBeHidden();await page.close();
});

test('narrow playground container uses two tab rows inside a desktop viewport',async()=>{
 const page=await context.newPage();await page.setViewportSize({width:1280,height:900});await page.goto(`${origin}/playgrounds.html`);
 await page.locator('.playground-browser').evaluate(el=>{(el as HTMLElement).style.width='320px';});
 const rows=await page.getByRole('tab').evaluateAll(tabs=>tabs.map(tab=>Math.round(tab.getBoundingClientRect().top)));
 expect(new Set(rows).size).toBe(2);await page.getByRole('tab',{name:'Grammar',exact:true}).click();await expect(current(page).locator('.tool-result').first()).toBeVisible();
 expect(await page.locator('.playground-browser').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await page.close();
});

test('dictionary composition waits and late searches cannot replace fresh results',async()=>{
 const page=await context.newPage();
 await page.addInitScript(()=>{
  const send=chrome.runtime.sendMessage.bind(chrome.runtime);(window as any).queries=[];
  (chrome.runtime as any).sendMessage=(message:any)=>{
   if(message.type!=='playground-data')return send(message);
   const q=message.query;(window as any).queries.push(q);
   if(q.op==='search') {
    if(q.query==='old')return new Promise(resolve=>(window as any).oldReply=resolve);
    return Promise.resolve({value:{total:1,hits:[{id:'1',bucket:'00',headword:q.query,reading:'',meaning:`Result for ${q.query}`,pos:[],common:false}]}});
   }
   return Promise.resolve({value:[]});
  };
 });
 await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Dictionary',exact:true}).click();const input=page.getByLabel('Search dictionary');
 await input.fill('old');await expect.poll(()=>page.evaluate(()=>(window as any).queries.length)).toBe(1);
 await input.fill('new');await expect(current(page).locator('.tool-result')).toContainText('Result for new');
 await page.evaluate(()=>(window as any).oldReply({value:{total:0,hits:[]}}));await expect(current(page).locator('.tool-result')).toContainText('Result for new');
 await input.dispatchEvent('compositionstart');await input.fill('日本');await page.waitForTimeout(250);expect(await page.evaluate(()=>(window as any).queries.length)).toBe(2);
 await input.dispatchEvent('compositionend');await expect(current(page).locator('.tool-result')).toContainText('Result for 日本');await expect(input).toBeFocused();await page.close();
});

test('recognized inflections offer verified dictionary forms',async()=>{
 const page=await context.newPage();await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Dictionary',exact:true}).click();
 for(const [surface,lemma] of [['食べました','食べる'],['高かった','高い']]){await page.getByLabel('Search dictionary').fill(surface);await expect(current(page).getByRole('button',{name:`Look up dictionary form: ${lemma}`,exact:true})).toBeVisible();}
 await page.close();
});

test('late hidden dictionary work cannot start analysis in the active Word forms tool',async()=>{
 const page=await context.newPage();await page.addInitScript(()=>{
  const NativeWorker=window.Worker;(window as any).tokenizerStarts=0;
  window.Worker=class extends NativeWorker{constructor(url:string|URL,options?:WorkerOptions){super(url,options);if(String(url).endsWith('/tokenizer.js'))(window as any).tokenizerStarts++;}};
  const send=chrome.runtime.sendMessage.bind(chrome.runtime);
  (chrome.runtime as any).sendMessage=(message:any)=>{
   if(message.type!=='playground-data')return send(message);
   if(message.query.op==='search')return new Promise(resolve=>(window as any).releaseSearch=resolve);
   return Promise.resolve({value:{status:'missing',definitions:[],source:'jawiktionary'}});
  };
 });
 await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Dictionary',exact:true}).click();await page.getByLabel('Search dictionary').fill('食べました');
 await expect.poll(()=>page.evaluate(()=>typeof (window as any).releaseSearch)).toBe('function');await page.getByRole('tab',{name:'Word forms',exact:true}).click();
 await page.evaluate(()=>(window as any).releaseSearch({value:{total:0,hits:[]}}));await page.waitForTimeout(250);expect(await page.evaluate(()=>(window as any).tokenizerStarts)).toBe(0);await page.close();
});

test('unavailable grammar assets offer retry and a failed load is not cached',async()=>{
 const page=await context.newPage();await page.addInitScript(()=>{
  const send=chrome.runtime.sendMessage.bind(chrome.runtime);let attempts=0;
  (chrome.runtime as any).sendMessage=(message:any)=>message.type==='playground-data' && message.query.op==='grammar-index'
   ?Promise.resolve(++attempts===1?{error:'Local grammar data is unavailable. Try again.'}:{value:[]})
   :send(message);
 });
 await page.goto(`${origin}/playgrounds.html`);await page.getByRole('tab',{name:'Grammar',exact:true}).click();await expect(current(page).locator('.tool-error')).toContainText('unavailable');
 await current(page).getByRole('button',{name:'Try again',exact:true}).click();await expect(current(page).locator('.tool-status')).toHaveText('0 grammar points · offline');await page.close();
});
