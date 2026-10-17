// Run from repository root after the release build.
const {chromium}=require('@playwright/test');
const {mkdtemp,rm,mkdir,writeFile}=require('node:fs/promises');
const {resolve}=require('node:path');
const {tmpdir}=require('node:os');
(async()=>{
 const profile=await mkdtemp(resolve(tmpdir(),'ko-rc-docs-'));
 const dist=resolve('dist');let context;
 const report={widths:[1280,700,390,320],pages:[],remoteRequests:[],errors:[]};
 try {
  context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH??'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true,args:[`--disable-extensions-except=${dist}`,`--load-extension=${dist}`]});
  const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker');
  const origin=`chrome-extension://${new URL(worker.url()).host}`;
  const page=await context.newPage();
  page.on('request',r=>{if(/^https?:/.test(r.url()))report.remoteRequests.push(r.url());});
  page.on('pageerror',e=>report.errors.push(e.message));
  await context.setOffline(true);
  for(const width of report.widths) {
   await page.setViewportSize({width,height:850});
   for(const path of ['about.html','privacy.html','release-notes.html']) {
    await page.goto(`${origin}/${path}`);
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${path} overflows at ${width}px`);
    if(path==='about.html') {
     await page.getByRole('switch',{name:'Show legacy animations',exact:true}).waitFor({state:'visible'});
     if(!await page.locator('#current-release-notes').evaluate(el=>el.open))throw new Error('Current changelog must open by default');
     if(!await page.locator('#current-release-notes').textContent().then(s=>s.includes('RC1')))throw new Error('RC1 missing');
     if(!await page.locator('#version').textContent().then(s=>s.includes('1.2.0')))throw new Error('Wrong version');
     const href=await page.getByRole('link',{name:'Suggest a feature or improvement'}).getAttribute('href');
     if(!href.startsWith('https://github.com/gonzalocibeira/ko-japanese-reading-companion/issues/new?'))throw new Error('Wrong suggestion URL');
     if(width===1280)await page.screenshot({path:'docs/screenshots/about-1.2-rc1.png',fullPage:true});
    }
    if(path==='privacy.html' && !await page.locator('main').textContent().then(s=>s.includes('update-announcement dismissals')))throw new Error('Privacy storage disclosure missing');
    report.pages.push({path,width,pass:true});
   }
  }
  if(report.remoteRequests.length||report.errors.length)throw new Error('Unexpected network request or page error');
  await writeFile('qa/release-1.2/rc1-docs.json',JSON.stringify(report,null,2)+'\n');
  console.log(`Offline docs pass at all ${report.widths.length} widths; ${report.pages.length} page checks, no overflow, remote requests or errors.`);
 } finally {await context?.close();await rm(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
