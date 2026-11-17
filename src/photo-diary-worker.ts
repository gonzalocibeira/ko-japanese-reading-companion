import createWebP from '@jsquash/webp/codec/enc/webp_enc.js';
import {defaultOptions} from '@jsquash/webp/meta.js';
import {validDiaryDimensions, type DiaryCrop, type DiaryImage} from './photo-diary-types';

async function encodeWebP(pixels: ImageData): Promise<Blob> {
  const encoder = await createWebP({
    noInitialRun: true,
    locateFile: () => new URL('photo-diary-webp.wasm', self.location.href).href,
  });
  const result = encoder.encode(pixels.data, pixels.width, pixels.height, {
    ...defaultOptions, lossless: 1, exact: 1,
  });
  if (!result) throw new Error('WebP encoding failed.');
  return new Blob([new Uint8Array(result)], {type: 'image/webp'});
}

async function encode(image: Blob, crop: DiaryCrop): Promise<DiaryImage> {
  if (![crop.x, crop.y, crop.width, crop.height].every(Number.isFinite) || crop.width <= 0 || crop.height <= 0) {
    throw new Error('Choose an image region to save.');
  }
  const bitmap = await createImageBitmap(image);
  try {
    const x = Math.max(0, Math.floor(crop.x));
    const y = Math.max(0, Math.floor(crop.y));
    const width = Math.min(bitmap.width, Math.ceil(crop.x + crop.width)) - x;
    const height = Math.min(bitmap.height, Math.ceil(crop.y + crop.height)) - y;
    if (!validDiaryDimensions(width, height)) throw new Error('Choose a smaller crop to save.');
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d', {willReadFrequently: true});
    if (!context) throw new Error('Image processing is unavailable.');
    context.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
    const png = await canvas.convertToBlob({type: 'image/png'});
    if (width > 16383 || height > 16383) return {image: png, width, height};
    try {
      const webp = await encodeWebP(context.getImageData(0, 0, width, height));
      return {image: webp.size < png.size ? webp : png, width, height};
    } catch {
      return {image: png, width, height};
    }
  } finally {
    bitmap.close();
  }
}

const ctx = self as unknown as DedicatedWorkerGlobalScope;
ctx.onmessage = ({data}: MessageEvent<{image: Blob; crop: DiaryCrop}>) => {
  void encode(data.image, data.crop).then(
    result => ctx.postMessage(result),
    error => ctx.postMessage({error: error instanceof Error ? error.message : 'Could not save this crop.'}),
  );
};
