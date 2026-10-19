const {chromium}=require(process.cwd()+'/node_modules/@playwright/test');
const {mkdtemp,rm,writeFile}=require('node:fs/promises');
const {tmpdir}=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const profile=await mkdtemp(path.join(tmpdir(),'ko-gallery-'));
 let context;
 try {
  context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH||'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true,args:[`--disable-extensions-except=${process.cwd()}/dist`,`--load-extension=${process.cwd()}/dist`],viewport:{width:1100,height:1450}});
  const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
  const origin='chrome-extension://'+new URL(worker.url()).host;
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.drawnFiles=new Set();window.frameSamples=new Set();
   const draw=CanvasRenderingContext2D.prototype.drawImage;
   CanvasRenderingContext2D.prototype.drawImage=function(image,...args){
    if(image.src){window.drawnFiles.add(image.src.split('/').pop());window.frameSamples.add(image.src+':'+args[0]);}
    return draw.call(this,image,...args);
   };
  });
  await context.setOffline(true);
  await page.goto(origin+'/about.html');
  for(let i=0;i<4;i++)await page.locator('#version').click();
  assert.equal(new URL(page.url()).pathname,'/about.html');
  await page.locator('#version').click();
  await page.waitForURL('**/animations.html');
  await page.waitForFunction(()=>document.querySelectorAll('figure').length===30);
  await page.waitForFunction(()=>window.drawnFiles.size===56,{},{timeout:15000});
  assert.equal(await page.locator('button,input,select,video,audio').count(),0);
  const coverage=await page.evaluate(()=>({files:window.drawnFiles.size,frames:window.frameSamples.size,labels:[...document.querySelectorAll('figcaption')].map(n=>n.textContent),overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.equal(coverage.overflow,false);assert.ok(coverage.frames>56);
  await page.screenshot({path:'qa/release-1.3/animation-gallery.png',fullPage:true});
  await page.goBack();await page.locator('#version').focus();
  for(let i=0;i<5;i++)await page.keyboard.press('Enter');
  await page.waitForURL('**/animations.html');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.waitForFunction(()=>window.drawnFiles.size===30);
  const before=await page.locator('canvas').first().evaluate(c=>c.toDataURL());
  await page.waitForTimeout(400);
  assert.equal(await page.locator('canvas').first().evaluate(c=>c.toDataURL()),before);
  await page.setViewportSize({width:320,height:650});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  const report={fiveClickTrigger:'passed',keyboardTrigger:'passed',offline:'passed',galleryTiles:30,clipsPlayed:coverage.files,frameSamples:coverage.frames,noControls:'passed',reducedMotion:'passed',mobileOverflow:'none',pageErrors:errors,screenshot:'qa/release-1.3/animation-gallery.png'};
  await writeFile('qa/release-1.3/animation-gallery.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 } finally {await context?.close();await rm(profile,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
