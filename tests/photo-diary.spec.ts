import {chromium, expect, test, type BrowserContext, type Page} from '@playwright/test';
import {build} from 'esbuild';
import {copyFile, mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

async function makeExtension(directory: string) {
  await mkdir(directory);
  await Promise.all([
    writeFile(join(directory, 'manifest.json'), JSON.stringify({
      manifest_version: 3, name: 'Kō Picture Diary Test', version: '1.0.0',
      content_security_policy: {extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; worker-src 'self'"},
      background: {service_worker: 'background.js'},
    })),
    writeFile(join(directory, 'background.js'), 'chrome.runtime.onInstalled.addListener(() => {});'),
    writeFile(join(directory, 'diary.html'), '<!doctype html><meta charset="utf-8"><script type="module" src="diary.js"></script>'),
    copyFile('node_modules/@jsquash/webp/codec/enc/webp_enc.wasm', join(directory, 'photo-diary-webp.wasm')),
    build({
      stdin: {
        contents: `
          import * as diary from './src/photo-diary';
          import {exportDiary, importDiary} from './src/photo-diary-backup';
          import {renderPictureDiary} from './src/photo-diary-ui';
          globalThis.diary = {...diary, exportDiary, importDiary};
          const view = renderPictureDiary();
          document.body.append(view.element);
          globalThis.refreshDiary = view.refresh;
          void view.refresh();
        `,
        resolveDir: resolve('.'),
      },
      outfile: join(directory, 'diary.js'), bundle: true, platform: 'browser', format: 'esm', target: 'chrome116',
    }),
    build({
      entryPoints: ['src/photo-diary-worker.ts'], outfile: join(directory, 'photo-diary-worker.js'),
      bundle: true, platform: 'browser', format: 'esm', target: 'chrome116',
    }),
  ]);
}

async function openExtension(profile: string, directory: string) {
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    headless: true, args: [`--disable-extensions-except=${directory}`, `--load-extension=${directory}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    await context.setOffline(true);
    const page = await context.newPage();
    await page.goto(`chrome-extension://${new URL(worker.url()).host}/diary.html`);
    await page.getByRole('searchbox', {name: 'Search Picture Diary'}).waitFor();
    return {context, page};
  } catch (error) {
    await context.close();
    throw error;
  }
}

function readRecords(page: Page) {
  return page.evaluate(async () => {
    const entries = await (window as any).diary.listDiaryEntries();
    return Promise.all(entries.map(async ({image, ...entry}: any) => ({
      ...entry, type: image.type,
      hash: Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await image.arrayBuffer()))),
    })));
  });
}

test('lossless crops survive a fresh-profile ZIP restore, repeat import, and storage rollback', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ko-photo-diary-'));
  const directory = join(root, 'extension');
  let source: BrowserContext | undefined;
  let destination: BrowserContext | undefined;
  try {
    await makeExtension(directory);
    const first = await openExtension(join(root, 'source'), directory);
    source = first.context;
    const exportInfo = await first.page.evaluate(async () => {
      const diary = (window as any).diary;
      const original = new OffscreenCanvas(180, 120);
      const context = original.getContext('2d')!;
      context.fillStyle = '#043c79';
      context.fillRect(0, 0, 180, 120);
      context.clearRect(20, 20, 100, 110);
      context.fillStyle = '#ff4c0088';
      context.fillRect(55, 30, 100, 90);
      const image = await original.convertToBlob({type: 'image/png'});
      const crop = {x: 10, y: 12, width: 168, height: 104};
      const first = await diary.saveDiaryEntry(image, crop, {word: '傘', reading: 'かさ', meaning: 'umbrella'});
      const wideImage = new OffscreenCanvas(17000, 1);
      const wideContext = wideImage.getContext('2d')!;
      wideContext.fillStyle = '#003971';
      wideContext.fillRect(0, 0, 17000, 1);
      await diary.saveDiaryEntry(await wideImage.convertToBlob({type: 'image/png'}),
        {x: 0, y: 0, width: 17000, height: 1}, {word: '本', reading: 'ほん', meaning: 'book'});
      const expected = new OffscreenCanvas(crop.width, crop.height).getContext('2d')!;
      const sourcePixels = await createImageBitmap(image);
      expected.drawImage(sourcePixels, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      sourcePixels.close();
      const decoded = await createImageBitmap(first.image);
      const actual = new OffscreenCanvas(decoded.width, decoded.height).getContext('2d')!;
      actual.drawImage(decoded, 0, 0);
      const pixels = actual.getImageData(0, 0, crop.width, crop.height).data;
      const expectedPixels = expected.getImageData(0, 0, crop.width, crop.height).data;
      const result = {
        type: first.image.type,
        width: decoded.width,
        height: decoded.height,
        exact: pixels.every((value, index) => value === expectedPixels[index]),
        archive: [...new Uint8Array(await (await diary.exportDiary()).arrayBuffer())],
      };
      decoded.close();
      return result;
    });
    expect(exportInfo).toMatchObject({type: 'image/webp', width: 168, height: 104, exact: true});
    const originalRecords = await readRecords(first.page);
    expect(originalRecords.map(entry => entry.word)).toEqual(['本', '傘']);
    expect(originalRecords[0]).toMatchObject({type: 'image/png', width: 17000, height: 1});
    const second = await openExtension(join(root, 'destination'), directory);
    destination = second.context;
    const importResults = await second.page.evaluate(async bytes => {
      const diary = (window as any).diary;
      const array = Uint8Array.from(bytes);
      const archive = new Blob([array], {type: 'application/zip'});
      const add = IDBObjectStore.prototype.add;
      let additions = 0;
      let quota = false;
      IDBObjectStore.prototype.add = function(...args) {
        if (++additions === 2) throw new DOMException('Test browser storage is full.', 'QuotaExceededError');
        return add.apply(this, args);
      };
      try {
        await diary.importDiary(archive);
      } catch (error) {
        quota = error instanceof DOMException && error.name === 'QuotaExceededError';
      } finally {
        IDBObjectStore.prototype.add = add;
      }
      const afterQuota = (await diary.listDiaryEntries()).length;
      const first = await diary.importDiary(archive);
      const repeated = await diary.importDiary(archive);
      // The first file's header follows the first 30 bytes and filename. Mutate
      // its image payload while preserving the central directory checksum.
      const header = new DataView(array.buffer);
      array[30 + header.getUint16(26, true) + header.getUint16(28, true)] ^= 0xff;
      const corruptedRejected = await diary.importDiary(new Blob([array])).then(() => false, () => true);
      await (window as any).refreshDiary();
      return {quota, afterQuota, first, repeated, corruptedRejected};
    }, exportInfo.archive);
    expect(importResults).toEqual({
      quota: true, afterQuota: 0, first: {added: 2, skipped: 0}, repeated: {added: 0, skipped: 2}, corruptedRejected: true,
    });
    expect(await readRecords(second.page)).toEqual(originalRecords);
    await second.page.getByRole('searchbox').fill('カサ');
    await expect(second.page.getByRole('listitem')).toHaveCount(1);
    await expect(second.page.getByRole('img', {name: 'umbrella'})).toBeVisible();
    await second.page.getByRole('button', {name: 'Delete 傘'}).click();
    await expect(second.page.getByRole('status')).toContainText('Removed 傘');
    await destination.close();
    const reopened = await openExtension(join(root, 'destination'), directory);
    destination = reopened.context;
    expect(await readRecords(reopened.page)).toEqual(originalRecords.filter(entry => entry.word === '本'));
  } finally {
    await destination?.close();
    await source?.close();
    await rm(root, {recursive: true, force: true});
  }
});
