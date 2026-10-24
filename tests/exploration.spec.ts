import {test,expect,chromium,type BrowserContext,type Page} from '@playwright/test';
import {resolve} from 'node:path';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createServer,type Server} from 'node:http';
import {mimeticEntries} from '../src/mimetic-data';

let context:BrowserContext,profile:string,server:Server,base:string;
const requests:string[]=[];
const text=['本を読んでいませんでした。','ボールがころころ転がった。','パンが食べられる。','子どもに食べさせました。','川が流れる。','雨がザーザー降る。','胸がどきどきする。','本を読める。','パンを食べちゃった。'];
const fixture=`<!doctype html><meta charset="utf-8"><style>body{font:24px/2.8 system-ui;margin:48px}p{margin:0}</style><main>${text.map((line,i)=>`<p id="line-${i}">${line}</p>`).join('')}</main>`;

test.beforeAll(async()=>{
  server=createServer((req,res)=>{
    res.setHeader('Content-Type','text/html; charset=utf-8');
    if(req.url==='/strict')res.setHeader('Content-Security-Policy',"default-src 'self'; style-src 'unsafe-inline'; img-src 'self'");
    res.end(fixture);
  });
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
  profile=await mkdtemp(resolve(tmpdir(),'ko-exploration-'));
  const path=resolve('dist');
  context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true,args:[`--disable-extensions-except=${path}`,`--load-extension=${path}`],viewport:{width:1000,height:850}});
  const worker=context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  await worker.evaluate(async()=>chrome.storage.local.set({enabled:true,excluded:[],readingOverrides:{},readingView:{sites:{'127.0.0.1':true,'docs.google.com':true},spacing:2.8,fontSize:20,width:420}}));
  await context.route('https://*.wiktionary.org/w/api.php*',route=>{requests.push(route.request().url());return route.abort();});
});
test.afterAll(async()=>{await context?.close();await new Promise<void>(resolve=>server?.close(()=>resolve()));if(profile)await rm(profile,{recursive:true,force:true});});
test.beforeEach(()=>{requests.length=0;});

async function reader(page:Page,fn:string) {
  const session=await context.newCDPSession(page);
  try {
    const tree=await session.send('DOM.getDocument',{depth:-1,pierce:true});let shadow:number|undefined;
    const visit=(node:any)=>{if(node.nodeName==='KO-READING-VIEW')shadow=node.shadowRoots?.[0]?.nodeId;for(const child of [...(node.children??[]),...(node.shadowRoots??[])])visit(child);};visit(tree.root);
    if(!shadow)return null;
    const object=await session.send('DOM.resolveNode',{nodeId:shadow});
    const result=await session.send('Runtime.callFunctionOn',{objectId:object.object.objectId,functionDeclaration:fn,returnByValue:true});
    if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value;
  } finally {await session.detach();}
}
async function open(page:Page,surface:string) {
  await expect.poll(()=>reader(page,`function(){return !!this.querySelector('[data-surface="${surface}"]')}`),{timeout:30000}).toBe(true);
  await reader(page,`function(){this.querySelector('[data-surface="${surface}"]').click();this.querySelector('.explore-toggle')?.click()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.definition-body')?.getAttribute('aria-busy')}`)).toBe('false');
}

test('About defaults to new animations, persists legacy choice, and updates open cards offline',async()=>{
  const worker=context.serviceWorkers()[0];
  await worker.evaluate(()=>chrome.storage.local.remove('showLegacyAnimations'));
  const extension=new URL(worker.url()).host;
  const page=await context.newPage(),about=await context.newPage();
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(base);await open(page,'ころころ');
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.mimetic-art')?.dataset.style}`)).toBe('woodblock');
    const url=await reader(page,`function(){return this.querySelector('.mimetic-frames').style.backgroundImage.slice(5,-2)}`);
    // The packaged image is accessible from a real webpage, not only extension UI.
    expect(await page.evaluate(async url=>{const image=new Image();image.src=url;await image.decode();return [image.naturalWidth,image.naturalHeight];},url)).toEqual([4608,192]);
    await about.goto(`chrome-extension://${extension}/about.html`);
    const toggle=about.getByRole('switch',{name:'Show legacy animations',exact:true});
    await expect(toggle).toBeEnabled();await expect(toggle).not.toBeChecked();
    await context.setOffline(true);
    await toggle.check();
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.mimetic-art')?.tagName}`)).toBe('svg');
    expect(await reader(page,`function(){return this.querySelector('.mimetic-term')?.textContent}`)).toBe('ころころ');
    await about.reload();await expect(toggle).toBeEnabled();await expect(toggle).toBeChecked();
    await toggle.uncheck();
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.mimetic-art')?.dataset.style}`)).toBe('woodblock');
    expect(await reader(page,`function(){return this.querySelector('.mimetic-term')?.textContent}`)).toBe('ころころ');
    await about.reload();await expect(toggle).toBeEnabled();await expect(toggle).not.toBeChecked();
    await about.setViewportSize({width:320,height:850});
    expect(await about.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await context.setOffline(false);await worker.evaluate(()=>chrome.storage.local.remove('showLegacyAnimations'));
    await page.close();await about.close();
  }
});

test('new mimetic images also load on pages with restrictive image CSP',async()=>{
  const page=await context.newPage();
  try {
    await page.goto(base+'/strict');await open(page,'ころころ');
    const url=await reader(page,`function(){return this.querySelector('.mimetic-frames').style.backgroundImage.slice(5,-2)}`);
    expect(await page.evaluate(async url=>{const image=new Image();image.src=url;await image.decode();return [image.naturalWidth,image.naturalHeight];},url)).toEqual([4608,192]);
  } finally {await page.close();}
});

test('every new mimetic animation ships locally and decodes offline',async()=>{
  const extension=new URL(context.serviceWorkers()[0].url()).host;
  const about=await context.newPage();
  try {
    await about.goto(`chrome-extension://${extension}/about.html`);await context.setOffline(true);
    const paths=mimeticEntries.flatMap(entry=>[0,1].map(index=>`art/mimetics/${entry.id}-${index}.webp`));
    const sizes=await about.evaluate(async paths=>Promise.all(paths.map(async path=>{
      const image=new Image();image.src=chrome.runtime.getURL(path);await image.decode();return [image.naturalWidth,image.naturalHeight];
    })),paths);
    expect(sizes).toHaveLength(90);expect(sizes.every(([w,h])=>w===4608&&h===192)).toBe(true);
  } finally {await context.setOffline(false);await about.close();}
});
const plainResult=`function(){const node=this.querySelector('.verb-japanese')?.cloneNode(true);node?.querySelectorAll('rt').forEach(rt=>rt.remove());return node?.textContent}`;

test('verb controls explore the full chain locally, preserve source, reset, and survive unchanged redraws',async()=>{
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(base);const before=await page.locator('main').innerHTML();
    await open(page,'読ん');
    expect(requests.map(url=>new URL(url).searchParams.get('page'))).toEqual([]);
    const wordRequests=requests.slice();
    expect(await reader(page,`function(){return this.querySelector('.explore-toggle').textContent}`)).toBe('Try word forms');
    await expect.poll(()=>reader(page,plainResult)).toBe('読んでいませんでした');
    expect(await reader(page,`function(){return Array.from(this.querySelectorAll('.verb-controls input'),input=>input.checked)}`)).toEqual([true,true,true,false]);
    await reader(page,`function(){this.querySelectorAll('.verb-controls input')[2].click()}`);
    expect(await reader(page,plainResult)).toBe('読んでいなかった');
    expect(await reader(page,`function(){return this.querySelector('.verb-japanese mark')?.textContent}`)).toBeTruthy();
    await reader(page,`function(){this.querySelector('.verb-reset').click()}`);
    expect(await reader(page,plainResult)).toBe('読んでいませんでした');
    await reader(page,`function(){this.querySelectorAll('.verb-controls input')[1].focus()}`);await page.keyboard.press('Space');
    expect(await reader(page,plainResult)).toBe('読んでいました');
    await page.evaluate(()=>document.dispatchEvent(new Event('scroll')));await page.waitForTimeout(700);
    expect(await reader(page,plainResult)).toBe('読んでいました');
    expect(await page.locator('main').innerHTML()).toBe(before);expect(requests).toEqual(wordRequests);expect(errors).toEqual([]);
    await page.keyboard.press('Escape');
    expect(await reader(page,`function(){return this.querySelector('.definition').hidden}`)).toBe(true);
    expect(await reader(page,`function(){return this.activeElement?.dataset.surface}`)).toBe('読ん');
  } finally {await page.close();}
});

test('all local tools work offline and an edit clears the old exploration',async()=>{
  const page=await context.newPage();
  try {
    await page.goto(base);await open(page,'ころころ');
    expect(await reader(page,`function(){return this.querySelector('.explore-toggle').textContent}`)).toBe('Open playgrounds');
    await context.setOffline(true);
    expect(await reader(page,`function(){return !!this.querySelector('.mimetic-playground')}`)).toBe(true);
    await open(page,'食べ');
    expect(await reader(page,`function(){return this.querySelector('.explore-toggle').textContent}`)).toBe('Try word forms');
    await reader(page,`function(){Array.from(this.querySelectorAll('.explore-tools button')).find(button=>button.textContent==='Meaning Forks')?.click()}`);
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.meaning-forks')?.textContent}`)).toContain('Potential');
    expect(await reader(page,`function(){return this.querySelector('.explore-source rt')?.textContent}`)).toBe('た');
    await reader(page,`function(){this.querySelectorAll('[data-surface="食べ"]')[1].click();this.querySelector('.explore-toggle').click()}`);
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.definition-body')?.getAttribute('aria-busy')}`)).toBe('false');
    const wordRequests=requests.slice();
    await reader(page,`function(){Array.from(this.querySelectorAll('.explore-tools button')).find(button=>button.textContent==='Meaning Forks')?.click()}`);
    expect(await reader(page,`function(){return this.querySelector('.meaning-traits')?.textContent}`)).toBe('Past form · Affirmative form · Polite ending');
    expect(await reader(page,`function(){return this.querySelector('.explore-source')?.textContent}`)).toContain('させました');
    await page.locator('#line-2').evaluate(el=>{el.textContent='学校へ行く。';});
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.definition').hidden}`)).toBe(true);
    expect(await reader(page,`function(){return this.querySelector('.explore-panel')}`)).toBeNull();
    expect(requests).toEqual(wordRequests);
    const saved=await context.serviceWorkers()[0].evaluate(async()=>chrome.storage.local.get(null));
    expect(Object.keys(saved).sort()).toEqual(['enabled','excluded','readingOverrides','readingView']);
  } finally {await context.setOffline(false);await page.close();}
});

async function browse(page:Page) {
  await expect.poll(()=>reader(page,`function(){return !!this.querySelector('.word')}`),{timeout:30000}).toBe(true);
  await reader(page,`function(){this.querySelector('.playgrounds-open').click()}`);
  await expect.poll(()=>reader(page,`function(){return !!this.querySelector('.playground-browser')}`)).toBe(true);
}

async function enterVerb(page:Page,value='食べる') {
  await reader(page,`function(){const input=this.querySelector('.playground-verb-input input');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}));this.querySelector('.playground-verb-input').requestSubmit()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelectorAll('.playground-confirmation button').length}`)).toBeGreaterThan(0);
  await reader(page,`function(){this.querySelector('.playground-confirmation button').click()}`);
}

test('local browser checks an arbitrary verb offline through the real worker and exposes expanded forms',async()=>{
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(base);const before=await page.locator('main').innerHTML();await browse(page);await context.setOffline(true);
    expect(await reader(page,`function(){return this.querySelectorAll('.playground-entry').length}`)).toBe(0);
    await reader(page,`function(){const input=this.querySelector('.playground-verb-input input');input.value='食べる';input.dispatchEvent(new Event('input',{bubbles:true}));this.querySelector('.playground-verb-input').requestSubmit()}`);
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-confirmation')?.textContent}`)).toContain('Ichidan');
    await reader(page,`function(){this.querySelector('.playground-confirmation button').click()}`);
    await reader(page,`function(){const select=this.querySelector('.verb-family');select.value='potential';select.dispatchEvent(new Event('change',{bubbles:true}))}`);
    expect(await reader(page,plainResult)).toBe('食べられる');
    await reader(page,`function(){this.querySelector('[data-control="past"]').click();this.querySelector('[data-control="negative"]').click()}`);
    expect(await reader(page,plainResult)).toBe('食べられなかった');
    await reader(page,`function(){this.querySelector('.verb-reset').click()}`);expect(await reader(page,plainResult)).toBe('食べる');
    await page.keyboard.press('Escape');
    expect(await reader(page,`function(){return this.querySelector('.playground-catalog').hidden}`)).toBe(false);
    await page.keyboard.press('Escape');
    expect(await reader(page,`function(){return this.querySelector('.definition').hidden}`)).toBe(true);
    expect(await reader(page,`function(){return this.activeElement?.className}`)).toBe('playgrounds-open');
    expect(await page.locator('main').innerHTML()).toBe(before);expect(requests).toEqual([]);expect(errors).toEqual([]);
  } finally {await context.setOffline(false);await page.close();}
});

test('mimetic catalog, new page expressions, and attested rain alias stay local',async()=>{
  const page=await context.newPage();
  try {
    await page.goto(base);await open(page,'ザーザー');
    const wordRequests=requests.slice();
    expect(await reader(page,`function(){return this.querySelector('.mimetic-term')?.textContent}`)).toBe('ざあざあ');
    await browse(page);
    await reader(page,`function(){Array.from(this.querySelectorAll('[role="tab"]')).find(button=>button.textContent==='Mimetics').click()}`);
    expect(await reader(page,`function(){return this.querySelectorAll('.playground-entry').length}`)).toBe(90);
    await reader(page,`function(){const input=this.querySelector('.playground-search');input.value='ﾋﾝﾔﾘ';input.dispatchEvent(new Event('input',{bubbles:true}))}`);
    expect(await reader(page,`function(){return this.querySelectorAll('.playground-entry').length}`)).toBe(1);
    await reader(page,`function(){this.querySelector('.playground-entry').click()}`);
    expect(await reader(page,`function(){return this.querySelector('.mimetic-term')?.textContent}`)).toBe('ひんやり');
    await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:760});
    expect(await reader(page,`function(){const panel=this.querySelector('.definition');return panel.scrollWidth<=panel.clientWidth}`)).toBe(true);
    await page.screenshot({path:test.info().outputPath('playground-browser-integrated.png')});
    expect(requests).toEqual(wordRequests);
  } finally {await page.close();}
});

test('typed fused potential offers a verified base choice and a page edit dismisses browsing',async()=>{
  const page=await context.newPage();
  try {
    await page.goto(base);await browse(page);
    await reader(page,`function(){const input=this.querySelector('.playground-verb-input input');input.value='読める';input.dispatchEvent(new Event('input',{bubbles:true}));this.querySelector('.playground-verb-input').requestSubmit()}`);
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-confirmation')?.textContent}`)).toContain('Potential of 読む');
    await reader(page,`function(){Array.from(this.querySelectorAll('.playground-confirmation button')).find(button=>button.textContent.includes('Potential of 読む')).click()}`);
    expect(await reader(page,plainResult)).toBe('読める');
    await reader(page,`function(){this.querySelector('[data-control="past"]').click()}`);expect(await reader(page,plainResult)).toBe('読めた');
    await page.locator('#line-0').evaluate(el=>{el.textContent='学校へ行く。';});
    await expect.poll(()=>reader(page,`function(){return this.querySelector('.definition').hidden}`)).toBe(true);
    expect(await reader(page,`function(){return this.querySelector('.playground-browser')}`)).toBeNull();
    const saved=await context.serviceWorkers()[0].evaluate(async()=>chrome.storage.local.get(null));
    expect(Object.keys(saved).sort()).toEqual(['enabled','excluded','readingOverrides','readingView']);
  } finally {await page.close();}
});

test('exploration fits a narrow panel, honors reduced motion, and keeps manual corrections authoritative',async()=>{
  const page=await context.newPage();
  try {
    await page.goto(base);await open(page,'ころころ');
    await reader(page,`function(){this.querySelectorAll('.mimetic-choice')[1].click()}`);
    expect(await reader(page,`function(){return this.querySelector('.mimetic-term')?.textContent}`)).toBe('ごろごろ');
    await page.screenshot({path:test.info().outputPath('mimetic-integrated.png')});
    await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:320,height:760});
    expect(await reader(page,`function(){const panel=this.querySelector('.definition');return panel.scrollWidth<=panel.clientWidth}`)).toBe(true);
    expect(await reader(page,`function(){return this.querySelectorAll('.explore-panel .mimetic-art').length}`)).toBeGreaterThan(0);
    await context.serviceWorkers()[0].evaluate(async()=>chrome.storage.local.set({readingOverrides:{'読んでいませんでした':'よんでいませんでした'}}));
    await open(page,'読んでいませんでした');
    expect(await reader(page,`function(){return this.querySelector('.explore-toggle')}`)).toBeNull();
  } finally {
    await context.serviceWorkers()[0].evaluate(async()=>chrome.storage.local.set({readingOverrides:{}}));await page.close();
  }
});

test('Docs fixture carries morphology into local tools without changing its source geometry',async()=>{
  const page=await context.newPage();
  try {
    const url='https://docs.google.com/document/d/exploration/edit';
    await page.route(url,route=>route.fulfill({contentType:'text/html',body:`<!doctype html><meta charset="utf-8"><style>body{margin:0}.kix-appview-editor{position:absolute;top:100px;width:900px;height:650px}</style><div class="kix-appview-editor"><svg width="900" height="600">${text.map((line,i)=>`<g data-font-css="24px system-ui"><rect x="40" y="${60+i*60}" width="${line.length*24}" height="28" aria-label="${line}" fill="transparent"/></g>`).join('')}</svg></div>`}));
    await page.goto(url);const before=await page.locator('.kix-appview-editor').innerHTML();
    await open(page,'読ん');await expect.poll(()=>reader(page,plainResult)).toBe('読んでいませんでした');
    const wordRequests=requests.slice();
    await reader(page,`function(){this.querySelectorAll('.verb-controls input')[0].click()}`);
    expect(await reader(page,plainResult)).toBe('読んでいません');
    expect(await page.locator('.kix-appview-editor').innerHTML()).toBe(before);expect(requests).toEqual(wordRequests);
  } finally {await page.close();}
});

test('Grammar and Dictionary share the real Reading-view transport without external requests',async()=>{
 const page=await context.newPage();
 try {
  await page.setViewportSize({width:1280,height:900});await page.goto(base);await browse(page);
  await reader(page,`function(){this.host.style.setProperty('--reader-width','320px');Array.from(this.querySelectorAll('[role=tab]')).find(b=>b.textContent==='Grammar').click()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .tool-status')?.textContent}`)).toContain('grammar points · offline');
  await reader(page,`function(){const input=this.querySelector('.playground-workspace:not([hidden]) input');input.value='dake';input.dispatchEvent(new Event('input'));this.querySelector('.playground-workspace:not([hidden]) .tool-result').click()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .tool-heading')?.textContent}`)).toBe('だけ');
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .grammar-switches')?.children.length}`)).toBe(2);
  await reader(page,`function(){this.querySelector('.playground-workspace:not([hidden]) .grammar-switches').children[1].click();this.querySelector('.playground-workspace:not([hidden]) .grammar-word').click()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) input')?.value}`)).toBe('朝');
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .tool-results')?.textContent}`)).toContain('morning');
  await reader(page,`function(){this.querySelector('.playground-route-back').click()}`);
  expect(await reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .grammar-switches [aria-pressed=true]').textContent}`)).toBe('しか～ない');
  expect(requests).toEqual([]);await page.screenshot({path:test.info().outputPath('grammar-reading-panel.png')});
  await reader(page,`function(){const root=this.querySelector('.playground-workspace:not([hidden])');root.querySelector('.tool-back').click();const input=root.querySelector('input');input.value='te iru';input.dispatchEvent(new Event('input'));Array.from(root.querySelectorAll('.tool-result')).find(b=>b.querySelector('.tool-pattern').textContent==='ている').click()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .grammar-switches')?.children.length}`)).toBe(3);
  await reader(page,`function(){const root=this.querySelector('.playground-workspace:not([hidden])');root.querySelector('.grammar-switches').children[2].click();root.querySelector('.grammar-activity summary').click();root.querySelectorAll('.grammar-activity button')[1].click();root.querySelector('.grammar-comparison [aria-label="Look up 窓"]').click()}`);
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) input')?.value}`)).toBe('窓');
  await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .tool-results')?.textContent}`)).toContain('window');
  await reader(page,`function(){this.querySelector('.playground-route-back').click()}`);
  expect(await reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .grammar-switches [aria-pressed=true]').textContent}`)).toBe('ておく · advance action');
  expect(await reader(page,`function(){return this.querySelector('.playground-workspace:not([hidden]) .grammar-activity [role=status]').textContent}`)).toContain('Yes.');
  expect(await reader(page,`function(){const root=this.querySelector('.playground-browser');return root.scrollWidth<=root.clientWidth}`)).toBe(true);
  expect(requests).toEqual([]);await page.screenshot({path:test.info().outputPath('comparison-expansion-reading-panel.png')});
 }finally{await page.close();}
});

for(const [width,height] of [[280,760],[320,600],[420,760],[720,850]] as const) {
  test(`playground workspace at ${width}px has readable controls, one scroller, and reliable back navigation`,async()=>{
    const page=await context.newPage();
    try {
      await page.setViewportSize({width:Math.max(width+48,900),height});
      await page.goto(base);await browse(page);
      await reader(page,`function(){this.host.style.setProperty('--reader-width','${width}px')}`);
      await page.screenshot({path:test.info().outputPath(`catalog-${width}.png`)});
      await enterVerb(page);
      const layout=await reader(page,`function(){
        const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
        const region=this.querySelector('.definition'),scroller=this.querySelector('.playground-scroll');
        return {width:this.host.getBoundingClientRect().width,region:rect(region),header:rect(this.querySelector('.header')),scroll:rect(scroller),
          catalog:getComputedStyle(this.querySelector('.playground-catalog')).display,reading:getComputedStyle(this.querySelector('.content')).display,
          horizontal:scroller.scrollWidth>scroller.clientWidth,scrollers:Array.from(this.querySelectorAll('.playground-scroll,.tool-scroll')).filter(node=>node.getClientRects().length).length,
          controls:Array.from(this.querySelectorAll('.verb-controls label'),label=>{
            const range=document.createRange();range.selectNodeContents(label.lastChild);
            const input=label.querySelector('input');return {label:label.textContent,width:rect(input).width,height:rect(label).height,lines:range.getClientRects().length};
          }),result:rect(this.querySelector('.verb-output'))};
      }`);
      expect(layout.width).toBe(width);expect(layout.catalog).toBe('none');expect(layout.reading).toBe('none');expect(layout.horizontal).toBe(false);
      expect(layout.region.top).toBe(layout.header.bottom);expect(layout.region.bottom).toBeGreaterThan(height-20);
      expect(layout.scrollers).toBe(1);expect(layout.controls.map((c:any)=>c.label)).toEqual(['Past','Negative','Polite']);
      for(const control of layout.controls){expect(control.width).toBe(16);expect(control.height).toBeGreaterThanOrEqual(36);expect(control.lines).toBe(1);}
      // The result is reachable in the same scroll region, without moving a nested card.
      await reader(page,`function(){this.querySelector('.verb-family').value='teIru';this.querySelector('.verb-family').dispatchEvent(new Event('change'));this.querySelector('.verb-output').scrollIntoView({block:'nearest'})}`);
      expect(await reader(page,`function(){const result=this.querySelector('.verb-output').getBoundingClientRect(),scroll=this.querySelector('.playground-scroll').getBoundingClientRect();return result.top>=scroll.top-1 && result.bottom<=scroll.bottom+1}`)).toBe(true);
      expect(await reader(page,`function(){return Array.from(this.querySelectorAll('.verb-controls label'),label=>{const range=document.createRange();range.selectNodeContents(label.lastChild);return range.getClientRects().length})}`)).toEqual([1,1,1,1]);
      await reader(page,`function(){this.querySelector('.playground-scroll').scrollTop=0}`);
      await page.screenshot({path:test.info().outputPath(`verb-${width}.png`)});
      await page.keyboard.press('Escape');
      expect(await reader(page,`function(){return this.activeElement===this.querySelector('.playground-verb-input input')}`)).toBe(true);
      await reader(page,`function(){Array.from(this.querySelectorAll('[role=tab]')).find(button=>button.textContent==='Mimetics').click();const scroll=this.querySelector('.legacy-playground:not([hidden]) .playground-scroll');scroll.scrollTop=180;this.querySelectorAll('.playground-entry')[10].focus({preventScroll:true});this.querySelectorAll('.playground-entry')[10].click()}`);
      await page.keyboard.press('Escape');
      expect(await reader(page,`function(){return this.querySelector('.legacy-playground:not([hidden]) .playground-scroll').scrollTop}`)).toBe(180);
      await reader(page,`function(){Array.from(this.querySelectorAll('[role=tab]')).find(button=>button.textContent==='Mimetics').click();this.querySelector('.playground-entry').click()}`);
      expect(await reader(page,`function(){const scroll=this.querySelector('.legacy-playground:not([hidden]) .playground-scroll'),art=this.querySelector('.mimetic-art');return scroll.scrollWidth<=scroll.clientWidth && art.getBoundingClientRect().width<=scroll.clientWidth}`)).toBe(true);
      await page.screenshot({path:test.info().outputPath(`mimetic-${width}.png`)});
      await page.keyboard.press('Escape');await page.keyboard.press('Escape');
      expect(await reader(page,`function(){return this.activeElement?.className}`)).toBe('playgrounds-open');
      expect(await reader(page,`function(){return getComputedStyle(this.querySelector('.content')).display}`)).not.toBe('none');
    } finally {await page.close();}
  });
}

test('browser preserves reading scroll and has no clipped or overlapping controls at a short zoom-sized viewport',async()=>{
  const page=await context.newPage();
  try {
    await page.setViewportSize({width:460,height:500});await page.goto(base);
    await expect.poll(()=>reader(page,`function(){return this.querySelectorAll('.word').length}`),{timeout:30000}).toBeGreaterThan(0);
    const scroll=await reader(page,`function(){this.querySelector('.content').scrollTop=80;return this.querySelector('.content').scrollTop}`);
    await browse(page);await enterVerb(page);
    await page.screenshot({path:test.info().outputPath('verb-short.png')});
    await reader(page,`function(){this.querySelector('.playgrounds-open').click()}`);
    expect(await reader(page,`function(){return this.querySelector('.content').scrollTop}`)).toBe(scroll);
    expect(await reader(page,`function(){const header=this.querySelector('.header');return header.scrollWidth<=header.clientWidth}`)).toBe(true);
  } finally {await page.close();}
});

for(const [width,height] of [[280,500],[420,760],[720,850]] as const) {
  test(`adjectives work inline and through the real offline worker at ${width}px`,async()=>{
    const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    try {
      await page.setViewportSize({width:1000,height});await page.goto(base);
      await page.locator('main').evaluate(el=>{el.innerHTML='<p id="adjectives">部屋は静かではありませんでした。値段は高くなかったです。きれいな花。嫌いです。かっこよかった。</p>';});
      await context.serviceWorkers()[0].evaluate(async width=>chrome.storage.local.set({readingView:{sites:{'127.0.0.1':true,'docs.google.com':true},spacing:2.8,fontSize:20,width}}),width);
      await open(page,'静か');const before=await page.locator('main').innerHTML(),wordRequests=requests.slice();
      expect(await reader(page,`function(){return this.querySelector('.explore-toggle').textContent}`)).toBe('Try word forms');
      expect(await reader(page,plainResult)).toBe('静かではありませんでした');
      expect(await reader(page,`function(){return this.querySelector('.definition-body').hidden}`)).toBe(false);
      await reader(page,`function(){this.querySelector('[data-control="negative"]').click()}`);expect(await reader(page,plainResult)).toBe('静かでした');
      await reader(page,`function(){this.querySelector('.verb-reset').click()}`);expect(await reader(page,plainResult)).toBe('静かではありませんでした');
      expect(requests).toEqual(wordRequests);await browse(page);await context.setOffline(true);
      await reader(page,`function(){const input=this.querySelector('.playground-verb-input input');input.value='高い';input.dispatchEvent(new Event('input'));this.querySelector('.playground-verb-input').requestSubmit()}`);
      await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-confirmation').textContent}`)).toContain('い-adjective');
      if(width===420)await page.screenshot({path:test.info().outputPath('word-forms-input-1.2.png')});
      await reader(page,`function(){this.querySelector('.playground-confirmation button').click();this.querySelector('[data-control="past"]').click();this.querySelector('[data-control="negative"]').click()}`);
      expect(await reader(page,plainResult)).toBe('高くなかった');
      expect(await reader(page,`function(){return this.querySelector('.form-construction').textContent}`)).toContain('高い → 高くなかった');
      expect(await reader(page,`function(){const scroll=this.querySelector('.playground-scroll');return scroll.scrollWidth<=scroll.clientWidth}`)).toBe(true);
      await page.screenshot({path:test.info().outputPath(`adjective-${width}-1.2.png`)});
      await reader(page,`function(){this.querySelector('.playground-back').click();const input=this.querySelector('.playground-verb-input input');input.value='きれい';input.dispatchEvent(new Event('input'));this.querySelector('.playground-verb-input').requestSubmit()}`);
      await expect.poll(()=>reader(page,`function(){return this.querySelector('.playground-confirmation').textContent}`)).toContain('な-adjective');
      await reader(page,`function(){this.querySelector('.playground-confirmation button').click();const select=this.querySelector('.verb-family');select.value='make';select.dispatchEvent(new Event('change'));this.querySelector('[data-control="polite"]').click()}`);
      expect(await reader(page,plainResult)).toBe('きれいにします');
      await reader(page,`function(){Array.from(this.querySelectorAll('[role="tab"]')).find(b=>b.textContent==='Mimetics').click();const search=this.querySelector('.playground-search');search.value='ぱくぱく';search.dispatchEvent(new Event('input'));this.querySelector('.playground-entry').click()}`);
      expect(await reader(page,`function(){return this.querySelector('.mimetic-term').textContent}`)).toBe('ぱくぱく');
      if(width===420)await page.screenshot({path:test.info().outputPath('mimetics-eating-1.2.png')});
      expect(await page.locator('main').innerHTML()).toBe(before);expect(requests).toEqual(wordRequests);expect(errors).toEqual([]);
    } finally {await context.setOffline(false);await page.close();}
  });
}

test('overlapping adjective corrections suppress exploration and page edits dismiss it',async()=>{
  const page=await context.newPage();
  try {
    await page.goto(base);await page.locator('main').evaluate(el=>{el.textContent='高かった。';});await open(page,'高かっ');
    expect(await reader(page,plainResult)).toBe('高かった');
    await page.locator('main').evaluate(el=>{el.textContent='新しい。';});await expect.poll(()=>reader(page,`function(){return this.querySelector('.definition').hidden}`)).toBe(true);
    await context.serviceWorkers()[0].evaluate(async()=>chrome.storage.local.set({readingOverrides:{'高かった':'たかかった'}}));
    await page.locator('main').evaluate(el=>{el.textContent='高かった。';});await open(page,'高かった');
    expect(await reader(page,`function(){return this.querySelector('.explore-toggle')}`)).toBeNull();
  } finally {await context.serviceWorkers()[0].evaluate(async()=>chrome.storage.local.set({readingOverrides:{}}));await page.close();}
});

for(const [command,lemma,reading] of [['受け取れ','受け取る','うけとれ'],['知れ','知る','しれ']]) {
  test(`contextual ${command} initializes Direct command and uses the recovered lemma for definitions`,async()=>{
    for(const ending of ['', '\n次へ進む。', '。次へ進む。', '！', '?']) {
      const page=await context.newPage();
      try {
        const source='痛みを'+command+ending;
        await page.route(base+'/command',route=>route.fulfill({contentType:'text/html;charset=utf-8',body:'<!doctype html><meta charset="utf-8"><style>body{font:24px/3 system-ui;margin:40px}main{white-space:pre-line}</style><main>'+source+'</main>'}));
        const requestStart=requests.length;await page.goto(base+'/command');const before=await page.locator('main').innerHTML();await open(page,command);
        expect(await reader(page,`function(){return this.querySelector('.explore-toggle').textContent}`)).toBe('Try word forms');
        expect(await reader(page,`function(){return this.querySelector('.pronunciation').textContent}`)).toContain('辞書形: '+lemma);
        expect(requests.slice(requestStart).map(url=>new URL(url).searchParams.get('page'))).toEqual([]);
        expect(requests.slice(requestStart).every(url=>new URL(url).hostname==='ja.wiktionary.org')).toBe(true);
        expect(await reader(page,`function(){return this.querySelector('.definition-body').textContent}`)).toContain('JMdict');
        expect(await reader(page,`function(){const s=this.querySelector('.verb-family');return [s.value,s.selectedOptions[0].textContent]}`)).toEqual(['imperative','Direct command']);
        expect(await reader(page,plainResult)).toBe(command);
        expect(await reader(page,`function(){return this.querySelector('[data-surface="${command}"]').dataset.reading}`)).toBe(reading);
        await reader(page,`function(){const s=this.querySelector('.verb-family');s.value='simple';s.dispatchEvent(new Event('change'))}`);
        expect(await reader(page,plainResult)).toBe(lemma);
        await reader(page,`function(){this.querySelector('.verb-reset').click()}`);
        expect(await reader(page,plainResult)).toBe(command);
        expect(await reader(page,`function(){return this.querySelector('.verb-family').value}`)).toBe('imperative');
        expect(await page.locator('main').innerHTML()).toBe(before);
      }finally{await page.close();}
    }
  });
}
