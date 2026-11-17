import {chromium, expect, test, type Browser} from '@playwright/test';
import {build} from 'esbuild';
import {resolve} from 'node:path';
import type {ImageInspectionPhase} from '../src/mascot-inspection';

let browser: Browser;
let fixture: string;

test.beforeAll(async () => {
  const output = await build({
    stdin: {
      resolveDir: process.cwd(),
      loader: 'ts',
      contents: `
        import {Mascot} from './src/mascot';
        import {mascotPreferences} from './src/mascot-preferences';
        const attach = HTMLElement.prototype.attachShadow;
        let root;
        HTMLElement.prototype.attachShadow = function(options) {
          const shadow = attach.call(this, options);
          if (this.localName === 'ko-mascot') root = shadow;
          return shadow;
        };
        const mascot = new Mascot({send:async()=>{},savePosition:async()=>{},overrides:()=>({}),obstacle:()=>undefined});
        HTMLElement.prototype.attachShadow = attach;
        mascot.update(mascotPreferences({enabled:true}),false,'fixture.test');
        window.animateInspection = phase => mascot.setImageInspection(phase);
        window.toggleCapture = hidden => mascot.setCaptureHidden(hidden);
        window.readInspection = () => {
          const sprite = root.querySelector('.sprite');
          return {
            phase: sprite.dataset.inspection,
            names: sprite.getAnimations({subtree:true}).map(animation=>animation.animationName),
            hidden: mascot.host.hidden,
          };
        };
      `,
    },
    platform: 'browser', bundle: true, write: false,
  });
  fixture = output.outputFiles[0].text;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true,
  });
});

test.afterAll(async () => { await browser?.close(); });

test('image inspection stages have their own motion and respect capture and reduced motion', async () => {
  const page = await browser.newPage();
  try {
    await page.route('https://fixture.test/**', route => {
      const path = new URL(route.request().url()).pathname;
      if (path === '/') return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Inspection fixture</title>'});
      const file = path.split('/').at(-1)!;
      return route.fulfill({path: resolve('public/art/ko-kun', file === 'index.json' ? 'manifest.json' : file)});
    });
    await page.goto('https://fixture.test/');
    await page.evaluate(() => {
      (window as any).chrome.runtime = {getURL: (path:string) => new URL(path, location.href).href};
    });
    await page.addScriptTag({content:fixture});
    const phase = (value?:ImageInspectionPhase) => page.evaluate(value => (window as any).animateInspection(value),value);
    const snapshot = () => page.evaluate(() => (window as any).readInspection());
    await phase('aim');
    expect(await snapshot()).toMatchObject({phase:'aim',names:expect.arrayContaining(['ko-mascot-inspect-loupe'])});
    await page.evaluate(() => (window as any).toggleCapture(true));
    expect(await snapshot()).toMatchObject({phase:'aim',hidden:true});
    await page.evaluate(() => (window as any).toggleCapture(false));
    await phase('scan');
    expect(await snapshot()).toMatchObject({phase:'scan',names:expect.arrayContaining(['ko-mascot-inspect-sweep','ko-mascot-inspect-line'])});
    await phase('reveal');
    expect(await snapshot()).toMatchObject({phase:'reveal',names:expect.arrayContaining(['ko-mascot-inspect-develop','ko-mascot-inspect-sparks'])});
    await phase('focus');
    expect(await snapshot()).toMatchObject({phase:'focus',names:expect.arrayContaining(['ko-mascot-inspect-refocus'])});
    await expect.poll(async () => (await snapshot()).phase).toBe('ready');
    await phase();
    expect(await snapshot()).toMatchObject({phase:'put-away',names:['ko-mascot-inspect-pocket']});
    await expect.poll(async () => (await snapshot()).phase).toBeUndefined();
    await page.emulateMedia({reducedMotion:'reduce'});
    await phase('scan');
    expect(await snapshot()).toMatchObject({phase:'scan',names:[]});
    await phase();
    expect((await snapshot()).phase).toBeUndefined();
  } finally { await page.close(); }
});
