import {test,expect,chromium,type Browser,type Page} from '@playwright/test';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
let browser:Browser,source:string;
test.beforeAll(async()=>{
 const bundle=await build({stdin:{contents:"export * from './src/reading-panel';export * from './src/playground-browser';",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'browser',target:'chrome116',format:'iife',globalName:'panelModule',define:{__KO_LOGO_SVG__:JSON.stringify('<svg viewBox="0 0 24 24"></svg>')}});
 source=bundle.outputFiles[0].text;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true});
});
test.afterAll(async()=>{await browser?.close();});
async function setup(page:Page,width=420) {
 await page.setViewportSize({width:1280,height:900});
 await page.setContent('<!doctype html><meta charset="utf-8"><p>日本語のページ</p>');
 await page.exposeFunction('localData',async(q:any)=>{
  if(q.op==='grammar-index')return JSON.parse(await readFile('dist/grammar/index.json','utf8'));
  if(q.op==='grammar' || q.op==='comparison')return JSON.parse(await readFile(`dist/grammar/${q.op==='grammar'?'points':'comparisons'}/${q.id}.json`,'utf8'));
  if(q.op==='search')return {hits:[],total:0};
  throw new Error('Unexpected data request');
 });
 await page.addScriptTag({content:source});
 await page.evaluate(width=>{
  (window as any).chrome={runtime:{sendMessage:async(m:any)=>({value:await (window as any).localData(m.query)})}};
  const attach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(options){return attach.call(this,{...options,mode:'open'});};
  let panel:any;try{panel=new (window as any).panelModule.ReadingPanel(()=>{},async()=>{});}finally{Element.prototype.attachShadow=attach;}
  panel.loading(true,'Loading…');panel.display([],'web',{sites:{},width,fontSize:20,spacing:2.8},{scale:1,contrast:'auto'},100,false);
  (window as any).panel=panel;
 },width);
 await page.getByRole('button',{name:'Playgrounds',exact:true}).click();
 await page.getByRole('tab',{name:'Grammar',exact:true}).click();
 await expect(page.locator('.panel-grammar .tool-result')).toHaveCount(30);
}
const rows=(page:Page)=>page.locator('.panel-grammar .tool-result');
const scroll=(page:Page)=>page.locator('.panel-grammar .tool-scroll');
async function bottom(page:Page){await scroll(page).evaluate(el=>{el.scrollTop=el.scrollHeight;});}

test('panel automatically appends stable rows and restores the selected result and scroll',async()=>{
 const page=await browser.newPage();try {
  await setup(page);await expect(page.getByRole('button',{name:'Show more',exact:true})).toHaveCount(0);
  await rows(page).first().evaluate(el=>{(window as any).firstRow=el;});
  await bottom(page);await expect(rows(page)).toHaveCount(60);
  expect(await rows(page).first().evaluate(el=>el===(window as any).firstRow)).toBe(true);
  const selected=rows(page).nth(45);await selected.scrollIntoViewIfNeeded();
  const top=await scroll(page).evaluate(el=>el.scrollTop);await selected.click();
  await expect(page.getByRole('tab',{name:'Example',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Back to results',exact:true}).click();
  await expect(selected).toBeFocused();expect(await scroll(page).evaluate(el=>el.scrollTop)).toBe(top);
  await bottom(page);await expect(rows(page)).toHaveCount(83);await expect(page.locator('.grammar-list-end')).toHaveText('End of results');
  await page.getByLabel('Search grammar', {exact:true}).fill('dake');await expect(rows(page)).toHaveCount(1);
  expect(await scroll(page).evaluate(el=>el.scrollTop)).toBe(0);
  await page.getByLabel('Search grammar',{exact:true}).fill('no-such-grammar');await expect(rows(page)).toHaveCount(0);await expect(page.locator('.tool-results')).toContainText('No matches');
 }finally{await page.close();}
});

test('focused sections, examples, comparisons, dictionary returns and keyboard navigation retain state',async()=>{
 const page=await browser.newPage();try {
  await setup(page);await page.getByLabel('Search grammar',{exact:true}).fill('dake');await rows(page).first().click();
  await page.getByRole('button',{name:'Next',exact:true}).click();await expect(page.locator('.grammar-example-nav [role=status]')).toHaveText('2 / 3');
  await page.getByRole('tab',{name:'Usage',exact:true}).click();await expect(page.getByRole('heading',{name:'How it is formed'})).toBeVisible();
  await page.getByRole('tab',{name:'Compare',exact:true}).click();
  await page.locator('.grammar-switches button').nth(1).click();await expect(page.locator('.grammar-switches [aria-pressed=true]')).toHaveText('しか～ない');
  await page.locator('.grammar-comparison .grammar-word').first().click();await expect(page.getByRole('button',{name:'← Return to previous playground',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'← Return to previous playground',exact:true}).click();await expect(page.getByRole('tab',{name:'Compare',exact:true})).toHaveAttribute('aria-selected','true');
  await expect(page.locator('.grammar-switches [aria-pressed=true]')).toHaveText('しか～ない');
  await page.getByRole('tab',{name:'Example',exact:true}).click();await expect(page.locator('.grammar-example-nav [role=status]')).toHaveText('2 / 3');
  await page.getByRole('tab',{name:'Example',exact:true}).focus();await page.keyboard.press('ArrowRight');await expect(page.getByRole('tab',{name:'Usage',exact:true})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByLabel('Search grammar',{exact:true})).toBeVisible();
  await page.getByLabel('Playground',{exact:true}).selectOption('verbs');await expect(page.getByRole('tab',{name:'Grammar',exact:true})).toBeVisible();
 }finally{await page.close();}
});

for(const width of [280,320,420,720])test(`actual reading panel grammar fits at ${width}px`,async()=>{
 const page=await browser.newPage();try {
  await setup(page,width);await page.getByLabel('Search grammar',{exact:true}).fill('te iru');await rows(page).filter({has:page.getByText('ている',{exact:true})}).click();
  await page.getByRole('tab',{name:'Compare',exact:true}).click();
  for(const height of [900,500]){
   await page.setViewportSize({width:1280,height});await expect(page.getByRole('tab',{name:'Example',exact:true})).toBeVisible();
   expect(await scroll(page).evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
   await bottom(page);const toolbar=await page.locator('.grammar-detail-toolbar').boundingBox();const box=await scroll(page).boundingBox();expect(toolbar!.y).toBeGreaterThanOrEqual(box!.y-1);
   await page.screenshot({path:`test-results/grammar-panel-${width}-${height}.png`});
  }
 }finally{await page.close();}
});

test('all 847 points load by scrolling, hidden results pause, and filters reset the list',async()=>{
 const page=await browser.newPage();try {
  await setup(page);await page.getByText('Filters · N5 · All meanings',{exact:true}).click();
  await page.getByLabel('Grammar level',{exact:true}).selectOption('All');await expect(rows(page)).toHaveCount(30);
  for(let count=60;count<=847;count+=30){await bottom(page);await expect(rows(page)).toHaveCount(Math.min(count,847));}
  await bottom(page);await expect(rows(page)).toHaveCount(847);await expect(page.locator('.grammar-list-end')).toHaveText('End of results');
  await page.getByLabel('Grammar level',{exact:true}).selectOption('N1');await expect(rows(page)).toHaveCount(30);
  await rows(page).nth(29).click();await page.getByRole('tab',{name:'Example',exact:true}).waitFor();
  await bottom(page);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await expect(rows(page)).toHaveCount(30);
  await page.getByRole('button',{name:'Back to results',exact:true}).click();await bottom(page);await expect(rows(page)).toHaveCount(60);
  await page.getByLabel('Playground',{exact:true}).selectOption('verbs');await expect(page.locator('.panel-grammar .tool-result')).toHaveCount(60);
  await page.getByRole('tab',{name:'Grammar',exact:true}).click();await expect(rows(page)).toHaveCount(60);
 }finally{await page.close();}
});

test('composition defers search and late point responses cannot disturb restored results',async()=>{
 const page=await browser.newPage();try {
  await setup(page);const search=page.getByLabel('Search grammar',{exact:true});
  await search.dispatchEvent('compositionstart');await search.fill('dake');await expect(rows(page)).toHaveCount(30);
  await search.dispatchEvent('compositionend');await expect(rows(page)).toHaveCount(1);
  await page.evaluate(()=>{
   const runtime=(window as any).chrome.runtime,send=runtime.sendMessage;
   runtime.sendMessage=(m:any)=>m.query?.op==='grammar'?new Promise(resolve=>{(window as any).releaseGrammar=async()=>resolve(await send(m));}):send(m);
  });
  await rows(page).first().click();await page.getByRole('button',{name:'Back to results',exact:true}).click();
  await page.evaluate(()=>(window as any).releaseGrammar());await expect(search).toBeVisible();await expect(rows(page).first()).toBeFocused();await expect(page.locator('.grammar-detail-toolbar')).toHaveCount(0);
 }finally{await page.close();}
});

test('tall panels fill automatically, point retry works, and points without comparisons omit Compare',async()=>{
 const page=await browser.newPage(),requests:string[]=[];page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});try {
  await setup(page);await page.setViewportSize({width:1280,height:4000});await expect.poll(()=>rows(page).count()).toBeGreaterThan(30);
  await page.setViewportSize({width:1280,height:900});await page.getByLabel('Search grammar',{exact:true}).fill('ちゃいけない');
  await page.evaluate(()=>{
   const runtime=(window as any).chrome.runtime,send=runtime.sendMessage;let failed=false;
   runtime.sendMessage=(m:any)=>m.query?.op==='grammar' && !failed?(failed=true,Promise.resolve({error:'Local grammar unavailable'})):send(m);
  });
  await rows(page).first().click();await expect(page.locator('.tool-error')).toHaveText('Local grammar unavailable');
  await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.getByRole('tab',{name:'Example',exact:true})).toBeVisible();await expect(page.getByRole('tab',{name:'Compare',exact:true})).toHaveCount(0);
  expect(requests).toEqual([]);
 }finally{await page.close();}
});
