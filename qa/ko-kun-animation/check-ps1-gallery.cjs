// Run from repository root; exercises the delivered offline review artifact.
const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const {resolve}=require('node:path');
const {pathToFileURL}=require('node:url');
const {writeFile}=require('node:fs/promises');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:1000}});
 const errors=[],remoteRequests=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url()))remoteRequests.push(r.url());});
 try {
  await page.goto(pathToFileURL(resolve('qa/ko-kun-animation/ps1-review.html')).href);
  await page.locator('#pauseAll').click();
  assert.equal(await page.locator('#cards article').count(),24);
  assert.equal(await page.locator('#transitions article').count(),6);
  await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode()));});
  const broken=await page.locator('img').evaluateAll(images=>images.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));
  assert.deepEqual(broken,[]);
  let phases=0,inspectedFrames=0;
  for(const card of await page.locator('#cards article,#transitions article').all()) {
   const phase=card.locator('.phase');
   const ids=await phase.locator('option').evaluateAll(options=>options.map(o=>o.value).filter(v=>v!=='all'));
   for(const id of ids) {
    await phase.selectOption(id);phases++;
    for(const n of [0,5,11]) {
     await card.locator('.scrub').evaluate((input,n)=>{input.value=String(n);input.dispatchEvent(new Event('input',{bubbles:true}));},n);
     await card.locator('.stage img').evaluate(i=>i.decode());
     assert.match(await card.locator('.readout').textContent(),new RegExp(`frame ${n+1}/12`));inspectedFrames++;
    }
   }
   await phase.selectOption('all');await card.locator('.size').selectOption('128');
   await card.locator('.mirror').check();
   assert.match(await card.locator('.stage img').evaluate(i=>getComputedStyle(i).transform),/-1/);
   await card.locator('.mirror').uncheck();
  }
  assert.equal(phases,56);assert.equal(inspectedFrames,168);
  for(const background of ['light','dark','green','checker']) {
   await page.locator(`[data-bg="${background}"]`).click();
   assert.equal(await page.locator(`.stage.${background}`).count(),33);
  }
  const first=page.locator('#cards article').first();
  await first.locator('.phase').selectOption('attentive-idle-loop');
  await first.locator('.scrub').evaluate(i=>{i.value='0';i.dispatchEvent(new Event('input',{bubbles:true}));});
  await first.locator('.play').click();
  await page.waitForTimeout(450);
  assert.notEqual(await first.locator('.scrub').inputValue(),'0');
  await page.locator('#pauseAll').click();
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:'qa/ko-kun-animation/ps1/browser-gallery.png'});
  assert.deepEqual(errors,[]);assert.deepEqual(remoteRequests,[]);
  const report={status:'pass',routines:24,transitions:6,clipsStepped:phases,framesStepped:inspectedFrames,allLocalImagesDecoded:true,mirroredCards:30,previewSize:128,backgrounds:4,playPause:'pass',pageErrors:errors,remoteRequests};
  await writeFile('qa/ko-kun-animation/ps1/browser-audit.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
