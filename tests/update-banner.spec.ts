import {test,expect,chromium,type BrowserContext} from '@playwright/test';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';

let context:BrowserContext,profile:string,origin:string;
test.beforeAll(async()=>{
  profile=await mkdtemp(resolve(tmpdir(),'ko-updates-'));
  const path=resolve('dist');
  context=await chromium.launchPersistentContext(profile,{
    executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless:true,args:[`--disable-extensions-except=${path}`,`--load-extension=${path}`]
  });
  const worker=context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
  origin=`chrome-extension://${new URL(worker.url()).host}`;
});
test.afterAll(async()=>{await context?.close();if(profile)await rm(profile,{recursive:true,force:true});});

test('release announcement stays dismissed across reopen and browser restart, with a fresh announcement for a later version',async()=>{
  const worker=context.serviceWorkers()[0];
  const version=await worker.evaluate(()=>chrome.runtime.getManifest().version);
  const key=`dismissedUpdate:${version}`;
  // An earlier release's dismissal must not suppress the current announcement.
  await worker.evaluate(()=>chrome.storage.local.set({'dismissedUpdate:0.0.1':true,enabled:false}));
  const popup=await context.newPage(),other=await context.newPage();
  await context.setOffline(true);
  await popup.goto(`${origin}/popup.html`);await other.goto(`${origin}/popup.html`);
  const banner=popup.locator('#update-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(`What’s new in Kō ${version}`);
  await expect(banner).toContainText('Meet Kōくん');
  await popup.screenshot({path:'qa/release-1.3/ko-kun-invitation.png',fullPage:true});
  await banner.getByRole('button',{name:'Try Kōくん',exact:true}).click();
  await expect(popup.locator('#mascot-panel')).toHaveAttribute('open','');
  await expect(popup.locator('#mascot-enabled')).toBeFocused();
  await expect(popup.locator('#mascot-enabled')).not.toBeChecked();
  await expect(banner).toBeVisible();
  // Following the changelog doesn't count as dismissing it.
  const opened=context.waitForEvent('page');
  await popup.getByRole('link',{name:'Read the changelog',exact:true}).click();
  const about=await opened;
  await expect(about.locator('#current-release-notes .release-body')).toBeVisible();
  await expect(about.locator('#current-release-notes')).toContainText('Kōくん');
  const feature=about.getByRole('link',{name:'Suggest a feature or improvement'});
  const url=new URL((await feature.getAttribute('href'))!);
  expect(url.origin+url.pathname).toBe('https://github.com/gonzalocibeira/ko-japanese-reading-companion/issues/new');
  expect(url.searchParams.get('title')).toBe('Feature request: ');
  await about.getByRole('link',{name:'Full release history (offline)'}).click();
  await expect(about.locator('main')).toContainText('1.0.0');
  await popup.reload();await expect(banner).toBeVisible();
  await expect(popup.locator('#enabled')).not.toBeChecked();
  await banner.getByRole('button',{name:'Dismiss update announcement'}).click();
  await expect(banner).toBeHidden();await expect(other.locator('#update-banner')).toBeHidden();
  expect(await worker.evaluate(async key=>(await chrome.storage.local.get(key))[key],key)).toBe(true);
  await popup.reload();await expect(banner).toBeHidden();
  await context.setOffline(false);await context.close();
  const path=resolve('dist');
  context=await chromium.launchPersistentContext(profile,{
    executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless:true,args:[`--disable-extensions-except=${path}`,`--load-extension=${path}`]
  });
  const reopened=await context.newPage();await reopened.goto(`${origin}/popup.html`);
  await expect(reopened.locator('#enabled')).not.toBeChecked();
  await expect(reopened.locator('#update-banner')).toBeHidden();
});

test('failed dismissal can be retried without hiding the announcement or disrupting preferences',async()=>{
  const worker=context.serviceWorkers()[0];
  await worker.evaluate(async()=>chrome.storage.local.remove(`dismissedUpdate:${chrome.runtime.getManifest().version}`));
  const popup=await context.newPage();
  await popup.addInitScript(()=>{
    const set=chrome.storage.local.set.bind(chrome.storage.local);
    chrome.storage.local.set=((values:Record<string,unknown>)=>{
      if(Object.keys(values).some(key=>key.startsWith('dismissedUpdate:')))return Promise.reject(new Error('Storage failed'));
      return set(values);
    }) as typeof chrome.storage.local.set;
  });
  await popup.goto(`${origin}/popup.html`);
  const banner=popup.locator('#update-banner');await expect(banner).toBeVisible();
  const close=banner.getByRole('button',{name:'Dismiss update announcement'});
  await close.click();await expect(banner).toBeVisible();
  await expect(banner.getByRole('status')).toHaveText('Could not save dismissal. Try again.');
  await expect(close).toBeEnabled();
  await popup.locator('#enabled').check();
  await expect.poll(()=>worker.evaluate(async()=>(await chrome.storage.local.get('enabled')).enabled)).toBe(true);
  await popup.close();
  const retry=await context.newPage();await retry.goto(`${origin}/popup.html`);
  await retry.getByRole('button',{name:'Dismiss update announcement'}).click();
  await expect(retry.locator('#update-banner')).toBeHidden();
});
