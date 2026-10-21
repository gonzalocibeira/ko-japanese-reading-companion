import {test,expect,chromium,type BrowserContext,type Page} from '@playwright/test';
import {mkdtemp,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
let context:BrowserContext,profile:string,origin:string;
const fixture='<!doctype html><meta charset="utf-8"><style>body{font:28px/2.8 system-ui;margin:50px;min-height:1500px}p{margin:0}input{font:inherit}</style><p id="word">日本語</p><p id="inline">図<span>書</span>館</p><p id="ruby"><ruby>学校<rt>がっこう</rt></ruby></p><p id="kana">ありがとう</p><p id="other">食べました。</p><input value="秘密"><div id="shadow"></div>';
test.beforeAll(async()=>{
  profile=await mkdtemp(resolve(tmpdir(),'ko-mascot-'));
  const path=resolve('dist');context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true,args:[`--disable-extensions-except=${path}`,`--load-extension=${path}`],viewport:{width:1000,height:800}});
  const worker=context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');origin=`chrome-extension://${new URL(worker.url()).host}`;
  await context.route('https://mascot.test/**',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:fixture}));
});
test.afterAll(async()=>{await context?.close();if(profile)await rm(profile,{recursive:true,force:true});});
test.beforeEach(async()=>{
  await context.serviceWorkers()[0].evaluate(()=>chrome.storage.local.set({enabled:false,excluded:[],readingOverrides:{},readingView:{sites:{}},mascot:{enabled:false}}));
});
test.afterEach(async()=>{for(const page of context.pages())await page.close();await context.unroute('https://*.wiktionary.org/w/api.php*');});
async function settings(patch:Record<string,unknown>) {await context.serviceWorkers()[0].evaluate(values=>chrome.storage.local.set(values),patch);}
async function mascot(patch:Record<string,unknown>) {await context.serviceWorkers()[0].evaluate(async patch=>{const state=await chrome.storage.local.get('mascot');await chrome.storage.local.set({mascot:{...state.mascot,...patch}});},patch);}
async function shadow<T=any>(page:Page,code:string,host='KO-MASCOT'):Promise<T|null> {
  const session=await context.newCDPSession(page);
  try {
    const tree=await session.send('DOM.getDocument',{depth:-1,pierce:true});let id:number|undefined;
    function visit(node:any) {if(node.nodeName===host)id=node.shadowRoots?.[0]?.nodeId;for(const child of [...node.children ?? [],...node.shadowRoots ?? []])visit(child);}
    visit(tree.root);if(!id)return null;
    const object=await session.send('DOM.resolveNode',{nodeId:id});const reply=await session.send('Runtime.callFunctionOn',{objectId:object.object.objectId,functionDeclaration:code,returnByValue:true});
    if(reply.exceptionDetails)throw new Error(reply.exceptionDetails.text);return reply.result.value;
  } finally {await session.detach();}
}
const snapshot=`function(){const b=this.querySelector('.bubble'),s=this.querySelector('.sprite'),r=s.getBoundingClientRect();return {open:!b.hidden,text:b.textContent,reading:b.querySelector('rt')?.textContent,x:r.x,y:r.y,width:r.width,height:r.height,hidden:this.host.hidden,pixels:Array.from(this.querySelector('canvas').getContext('2d').getImageData(0,0,256,256).data).reduce((s,v)=>s+v,0)}}`;
async function openPage() {const page=await context.newPage();await page.goto('https://mascot.test/');return page;}
async function hoverText(page:Page,selector:string) {
  const point=await page.locator(selector).evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const rect=range.getBoundingClientRect();return {x:rect.x+Math.min(12,rect.width/2),y:rect.y+rect.height/2};});
  await page.mouse.move(point.x,point.y);
}

test('off by default makes no asset requests; independent switch, live pause, and subframes have one mascot',async()=>{
  const page=await context.newPage(),assets:string[]=[];page.on('request',r=>{if(r.url().includes('/art/ko-kun/'))assets.push(r.url());});
  await page.goto('https://mascot.test/');await page.waitForTimeout(250);await expect(page.locator('ko-mascot')).toHaveCount(0);expect(assets).toEqual([]);
  await mascot({enabled:true});await expect(page.locator('ko-mascot')).toHaveCount(1);await expect.poll(async()=>(await shadow(page,snapshot))?.pixels).toBeGreaterThan(0);
  await page.evaluate(()=>{const frame=document.createElement('iframe');frame.src='https://mascot.test/frame';document.body.append(frame);});await page.locator('iframe').waitFor();
  await expect(page.frameLocator('iframe').locator('ko-mascot')).toHaveCount(0);
  await settings({excluded:['mascot.test']});await expect(page.locator('ko-mascot')).toHaveCount(0);
  await settings({excluded:[]});await expect(page.locator('ko-mascot')).toHaveCount(1);
  await mascot({enabled:false});await expect(page.locator('ko-mascot')).toHaveCount(0);
});
test('hover resolves inline text, existing ruby, kana, and corrections without changing page content or contacting dictionaries',async()=>{
  const requested:string[]=[];await context.route('https://*.wiktionary.org/w/api.php*',route=>{requested.push(route.request().url());return route.abort();});
  const page=await openPage(),before=await page.locator('body').innerHTML();await mascot({enabled:true,motion:'reduced'});
  for(const [selector,word,reading] of [['#word','日本語','にほんご'],['#inline','図書館','としょかん'],['#ruby','学校','がっこう'],['#kana','ありがとう','ありがとう']]) {
    await hoverText(page,selector);await expect.poll(async()=>(await shadow(page,snapshot))?.text).toContain(word);await expect.poll(async()=>(await shadow(page,snapshot))?.reading).toBe(reading);
    await page.keyboard.press('Escape');
  }
  await settings({readingOverrides:{'日本語':'にっぽんご'}});await hoverText(page,'#word');await expect.poll(async()=>(await shadow(page,snapshot))?.reading).toBe('にっぽんご');
  const after=await page.locator('body').evaluate(body=>{const copy=body.cloneNode(true) as Element;copy.querySelectorAll('ko-mascot').forEach(n=>n.remove());return copy.innerHTML;});
  expect(after).toBe(before);expect(requested).toEqual([]);await page.screenshot({path:'qa/release-1.3/mascot-bubble.png'});
});
test('hover dwell cancels on departure, inputs never trigger, and highlight mode rejects sentences',async()=>{
  const page=await openPage();await mascot({enabled:true});await hoverText(page,'#word');await page.waitForTimeout(200);await page.mouse.move(800,80);await page.waitForTimeout(800);expect((await shadow(page,snapshot))?.open).toBe(false);
  await hoverText(page,'input');await page.waitForTimeout(750);expect((await shadow(page,snapshot))?.open).toBe(false);
  await mascot({trigger:'highlight'});await hoverText(page,'#word');await page.waitForTimeout(750);expect((await shadow(page,snapshot))?.open).toBe(false);
  await page.locator('#word').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const selection=window.getSelection()!;selection.removeAllRanges();selection.addRange(range);});
  await expect.poll(async()=>(await shadow(page,snapshot))?.reading).toBe('にほんご');await page.keyboard.press('Escape');
  await page.locator('#other').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);const selection=window.getSelection()!;selection.removeAllRanges();selection.addRange(range);});await page.waitForTimeout(700);expect((await shadow(page,snapshot))?.open).toBe(false);
});

test('hover bubble stays on the same inline word and closes immediately when the pointer leaves it',async()=>{
  const page=await openPage();await mascot({enabled:true});await hoverText(page,'#inline');await expect.poll(async()=>(await shadow(page,snapshot))?.reading).toBe('としょかん');
  const point=await page.locator('#inline span').evaluate(el=>{const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await page.mouse.move(point.x,point.y);expect((await shadow(page,snapshot))?.open).toBe(true);
  await page.mouse.move(800,50);await expect.poll(async()=>(await shadow(page,snapshot))?.open,{timeout:500}).toBe(false);
  await hoverText(page,'#inline');await expect.poll(async()=>(await shadow(page,snapshot))?.open).toBe(true);
  await page.locator('#inline').evaluate(el=>el.textContent='日');await page.mouse.move(point.x,point.y);await expect.poll(async()=>(await shadow(page,snapshot))?.open,{timeout:500}).toBe(false);
});
test('drag and keyboard reposition persist per site, survive reload, clamp resize, and honor print/reduced motion',async()=>{
  const page=await openPage();await mascot({enabled:true,motion:'reduced'});await expect.poll(async()=>(await shadow(page,snapshot))?.pixels).toBeGreaterThan(0);
  const first=(await shadow(page,snapshot))!;await page.mouse.move(first.x+first.width*.6,first.y+first.height*.6);await page.mouse.down();await page.mouse.move(300,350,{steps:10});await page.mouse.up();
  await expect.poll(()=>context.serviceWorkers()[0].evaluate(async()=>(await chrome.storage.local.get('mascot')).mascot.positions?.['mascot.test']?.x)).toBeLessThan(.6);
  const drop=(await shadow(page,snapshot))!;await page.reload();await expect.poll(async()=>(await shadow(page,snapshot))?.x).toBeCloseTo(drop.x,0);
  await shadow(page,`function(){this.querySelector('.sprite').focus();return true}`);await page.keyboard.press('ArrowRight');await expect.poll(async()=>(await shadow(page,snapshot))?.x).toBeGreaterThan(drop.x);
  const still=(await shadow(page,snapshot))!.pixels;await page.waitForTimeout(250);expect((await shadow(page,snapshot))?.pixels).toBe(still);
  await page.setViewportSize({width:380,height:320});const small=(await shadow(page,snapshot))!;expect(small.x).toBeGreaterThanOrEqual(0);expect(small.x+small.width).toBeLessThanOrEqual(380);
  await page.emulateMedia({media:'print'});await expect(page.locator('ko-mascot')).toBeHidden();await page.emulateMedia({media:'screen',reducedMotion:'reduce'});await expect(page.locator('ko-mascot')).toBeVisible();
});
test('chosen-language definitions use local English lemmas without requests and preserve readings on online failure',async()=>{
  const requested:string[]=[];await context.route('https://*.wiktionary.org/w/api.php*',route=>{requested.push(route.request().url());return route.fulfill({json:{parse:{title:'食べる',text:'<h2>Japanese</h2><h3>Verb</h3><ol><li>to eat<img src="https://bad.test/tracker"><script>alert(1)</script></li></ol>'}}});});
  const page=await openPage();await mascot({enabled:true,definitions:'en'});await hoverText(page,'#other');await expect.poll(async()=>(await shadow(page,snapshot))?.text).toContain('to eat');
  expect(requested).toEqual([]);expect((await shadow(page,snapshot))?.text).toContain('JMdict');
  expect(await shadow(page,`function(){return this.querySelector('.bubble').querySelectorAll('img,script').length}`)).toBe(0);
  await context.unroute('https://*.wiktionary.org/w/api.php*');await context.route('https://*.wiktionary.org/w/api.php*',route=>route.abort());await mascot({definitions:'ja'});await page.mouse.move(800,50);await hoverText(page,'#word');
  await expect.poll(async()=>(await shadow(page,snapshot))?.text).toContain('Definition unavailable');expect((await shadow(page,snapshot))?.reading).toBe('にほんご');
});
test('飲む and its inflected text show offline English definitions in the real companion',async()=>{
  const requested:string[]=[];await context.route('https://*.wiktionary.org/w/api.php*',route=>{requested.push(route.request().url());return route.abort();});
  const page=await openPage();await page.locator('#word').evaluate(el=>{el.textContent='飲む';});await page.locator('#other').evaluate(el=>{el.textContent='飲みました。';});
  await mascot({enabled:true,definitions:'en'});await expect.poll(async()=>(await shadow(page,snapshot))?.pixels).toBeGreaterThan(0);
  for(const selector of ['#word','#other']) {
    await hoverText(page,selector);await expect.poll(async()=>(await shadow(page,snapshot))?.text).toContain('to drink');
    expect((await shadow(page,snapshot))?.text).toContain('JMdict');await page.mouse.move(800,50);
  }
  expect(requested).toEqual([]);
});
test('Google Docs geometry and reading-view word hooks work with their independent settings',async()=>{
  const page=await context.newPage();await page.route('https://docs.google.com/document/d/mascot/edit',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><meta charset="utf-8"><style>body{margin:0}.kix-appview-editor{position:absolute;top:100px;width:900px;height:600px}</style><div class="kix-appview-editor"><svg width="900" height="600"><g data-font-css="24px system-ui"><rect x="40" y="60" width="72" height="28" aria-label="日本語" fill="transparent"/><text x="40" y="82" style="font:24px system-ui">日本語</text></g></svg></div>'}));
  await page.goto('https://docs.google.com/document/d/mascot/edit');await mascot({enabled:true});await expect(page.locator('ko-mascot')).toBeVisible();
  await page.mouse.move(50,175);await expect.poll(async()=>(await shadow(page,snapshot))?.reading).toBe('にほんご');await page.keyboard.press('Escape');
  await settings({enabled:true,readingView:{sites:{'docs.google.com':true},fontSize:20,width:420,spacing:2.8}});
  await expect.poll(()=>shadow(page,`function(){return this.querySelectorAll('.word').length}`,'KO-READING-VIEW')).toBeGreaterThan(0);
  const point=await shadow(page,`function(){const r=this.querySelector('.word').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}}`,'KO-READING-VIEW');
  await page.mouse.move(point.x,point.y);await expect.poll(async()=>(await shadow(page,snapshot))?.reading).toBe('にほんご');
  const pet=(await shadow(page,snapshot))!;expect(pet.x+pet.width).toBeLessThan(point.x-10);
  const bubbleRight=await shadow(page,`function(){return this.querySelector('.bubble').getBoundingClientRect().right}`);
  const panelLeft=await shadow(page,`function(){return this.host.getBoundingClientRect().left}`,'KO-READING-VIEW');expect(bubbleRight).toBeLessThan(panelLeft);
  await page.screenshot({path:'qa/release-1.3/docs-mascot.png'});
  await page.mouse.move(point.x+200,point.y+80);await expect.poll(async()=>(await shadow(page,snapshot))?.open,{timeout:500}).toBe(false);
});
test('popup saves companion settings across reopen',async()=>{
  const page=await openPage();await page.bringToFront();const popup=await context.newPage();await popup.goto(origin+'/popup.html');await popup.locator('#mascot-panel summary').click();
  await expect(popup.locator('#mascot-enabled')).not.toBeChecked();await expect(popup.locator('#mascot-trigger')).toBeDisabled();
  await popup.locator('#mascot-enabled').check();await popup.locator('#mascot-trigger').selectOption('highlight');await popup.locator('#mascot-definitions').selectOption('ja');await popup.locator('#mascot-size').selectOption('160');await popup.locator('#mascot-motion').selectOption('reduced');await popup.reload();await popup.locator('#mascot-panel summary').click();
  await expect(popup.locator('#mascot-enabled')).toBeChecked();await expect(popup.locator('#mascot-trigger')).toHaveValue('highlight');await expect(popup.locator('#mascot-definitions')).toHaveValue('ja');await expect(popup.locator('#mascot-size')).toHaveValue('160');
  await page.bringToFront();await page.screenshot({path:'qa/release-1.3/mascot-large.png'});
});

test('popup at its native preferred size stays readable and scrolls with Kōくん settings expanded',async()=>{
  const page=await context.newPage();await page.setViewportSize({width:380,height:580});await page.goto(origin+'/popup.html');
  await page.locator('#dismiss-update').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
  const collapsed=await page.evaluate(()=>({height:document.body.clientHeight,scroll:document.body.scrollHeight}));expect(collapsed.height).toBe(580);expect(collapsed.scroll).toBeLessThanOrEqual(580);
  await page.locator('#mascot-panel summary').click();await page.locator('#mascot-enabled').check();
  await page.locator('#mascot-motion').scrollIntoViewIfNeeded();await expect(page.locator('#mascot-motion')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(380);
  await page.screenshot({path:'qa/release-1.3/popup-settings.png'});
  await page.locator('footer a').last().scrollIntoViewIfNeeded();await expect(page.locator('footer a').last()).toBeInViewport();
});

test('open-shadow text works under restrictive page CSP, and stale definition replies cannot replace the new word',async()=>{
  let finish:(()=>void)|undefined;
  await context.route('https://*.wiktionary.org/w/api.php*',async route=>{
    const word=new URL(route.request().url()).searchParams.get('page');
    if(word==='学校')await new Promise<void>(resolve=>{finish=resolve;});
    await route.fulfill({json:{parse:{title:word,text:`<h2>日本語</h2><h3>名詞</h3><ol><li>Definition for ${word}</li></ol>`}}});
  });
  const page=await context.newPage();await page.route('https://mascot.test/csp',route=>route.fulfill({contentType:'text/html',headers:{'Content-Security-Policy':"img-src 'none'; connect-src 'none'"},body:fixture}));
  await page.goto('https://mascot.test/csp');await page.locator('#shadow').evaluate(el=>{el.attachShadow({mode:'open'}).innerHTML='<span id="shadow-word">日本語</span>';});
  await mascot({enabled:true,definitions:'ja'});await expect.poll(async()=>(await shadow(page,snapshot))?.pixels).toBeGreaterThan(0);
  await hoverText(page,'#ruby');await expect.poll(()=>!!finish).toBe(true);await hoverText(page,'#shadow-word');await expect.poll(async()=>(await shadow(page,snapshot))?.text).toContain('Definition for 日本語');
  finish!();await page.waitForTimeout(150);expect((await shadow(page,snapshot))?.text).not.toContain('Definition for 学校');
});
