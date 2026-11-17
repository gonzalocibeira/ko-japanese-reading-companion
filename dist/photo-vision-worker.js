"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/photo-vision.ts
  function photoCrop(rectangle, width, height) {
    if (!rectangle) return { x: 0, y: 0, width, height };
    const { x, y, width: w, height: h } = rectangle;
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) throw new Error("Choose a visible area of the image.");
    const left = Math.max(0, Math.floor(x)), top = Math.max(0, Math.floor(y));
    const right = Math.min(width, Math.ceil(x + w)), bottom = Math.min(height, Math.ceil(y + h));
    if (right <= left || bottom <= top) throw new Error("Choose a visible area of the image.");
    return { x: left, y: top, width: right - left, height: bottom - top };
  }
  async function decodePhoto(source) {
    if (!(source instanceof Blob) || !source.size || source.size > maxPhotoBytes) throw new Error("Choose an image up to 32 MB.");
    let image;
    try {
      image = await createImageBitmap(source);
    } catch {
      throw new Error("K\u014D could not open this image. Try a PNG, JPEG, or WebP file.");
    }
    if (image.width > maxPhotoSide || image.height > maxPhotoSide || image.width * image.height > maxPhotoPixels) {
      image.close();
      throw new Error("This image is too large. Choose a smaller image or screenshot.");
    }
    return image;
  }
  var maxPhotoBytes, maxPhotoPixels, maxPhotoSide;
  var init_photo_vision = __esm({
    "src/photo-vision.ts"() {
      "use strict";
      maxPhotoBytes = 32 * 1024 * 1024;
      maxPhotoPixels = 4e7;
      maxPhotoSide = 16384;
    }
  });

  // src/photo-vision-worker.ts
  var require_photo_vision_worker = __commonJS({
    "src/photo-vision-worker.ts"() {
      init_photo_vision();
      var thread = self;
      var encoder = new TextEncoder();
      var options = encoder.encode(JSON.stringify({ sections: ["objects"], fields: ["bbox", "score", "mask"], mask_format: "polygons", max_objects: 30 }) + "\0");
      var language = encoder.encode("en\0");
      var resultCapacity = 512 * 1024;
      var runtime;
      function malloc(engine, length) {
        const pointer = engine._malloc(length);
        if (!pointer) throw new Error("This image needs more memory. Try a smaller crop.");
        return pointer;
      }
      async function loadRuntime() {
        const base = new URL("vision/", thread.location.href);
        if (!thread.createCactus) thread.importScripts(new URL("cactus.js", base).href);
        if (!thread.createCactus) throw new Error("The bundled Mirage runtime could not start.");
        const [wasm, response] = await Promise.all([fetch(new URL("cactus.wasm", base)), fetch(new URL("mirage.cact", base))]);
        if (!wasm.ok || !response.ok) throw new Error("The bundled Mirage runtime or model is unavailable.");
        const engine = await thread.createCactus({ wasmBinary: await wasm.arrayBuffer() });
        const model = new Uint8Array(await response.arrayBuffer()), pointer = malloc(engine, model.length);
        try {
          engine.HEAPU8.set(model, pointer);
          if (engine._cactus_load(pointer, BigInt(model.length)) < 0 || !(engine._cactus_models() & 4)) throw new Error("The bundled Mirage model could not load.");
        } finally {
          engine._free(pointer);
        }
        return engine;
      }
      function getRuntime() {
        return runtime ??= loadRuntime().catch((error) => {
          runtime = void 0;
          throw error;
        });
      }
      function objects(raw, region) {
        const scene = JSON.parse(raw);
        if (typeof scene !== "object" || !scene || !("objects" in scene) || !Array.isArray(scene.objects)) throw new Error("Mirage could not read this image. Try a smaller crop.");
        const scale = (value, length) => Math.min(1e3, Math.max(0, value)) * length / 1e3;
        const x = (value) => region.x + scale(value, region.width);
        const y = (value) => region.y + scale(value, region.height);
        const detections = [];
        for (const [index, item] of scene.objects.slice(0, 30).entries()) {
          if (!item || typeof item.name !== "string" || !Number.isFinite(item.score) || !Array.isArray(item.bbox) || item.bbox.length !== 4 || !item.bbox.every(Number.isFinite)) continue;
          const label = item.name.replace(/[\u0000-\u001f\u007f-\u009f]/gu, " ").trim().slice(0, 80);
          const [left, top, right, bottom] = item.bbox;
          const box = { x: x(left), y: y(top), width: x(right) - x(left), height: y(bottom) - y(top) };
          if (!label || box.width <= 0 || box.height <= 0) continue;
          const polygons = [];
          for (const outline of Array.isArray(item.mask) ? item.mask.slice(0, 24) : []) {
            if (!Array.isArray(outline) || outline.length < 6 || outline.length > 4096 || outline.length % 2 || !outline.every(Number.isFinite)) continue;
            const points = [];
            for (let i = 0; i < outline.length; i += 2) points.push([x(outline[i]), y(outline[i + 1])]);
            polygons.push(points);
          }
          detections.push({ id: String(index), label, score: Math.min(1, Math.max(0, item.score)), box, ...polygons.length ? { polygons } : {} });
        }
        return detections;
      }
      function describe(engine, rgba, width, height, region) {
        const pixelBytes = width * height * 3;
        const buffer = malloc(engine, pixelBytes + options.length + language.length + resultCapacity);
        const optionsPtr = buffer + pixelBytes, languagePtr = optionsPtr + options.length, resultPtr = languagePtr + language.length;
        try {
          const heap = engine.HEAPU8;
          for (let source = 0, target = buffer; source < rgba.length; source += 4, target += 3) {
            heap[target] = rgba[source];
            heap[target + 1] = rgba[source + 1];
            heap[target + 2] = rgba[source + 2];
          }
          heap.set(options, optionsPtr);
          heap.set(language, languagePtr);
          if (engine._cactus_describe(buffer, width, height, optionsPtr, languagePtr, 0, resultPtr, resultCapacity) < 0) throw new Error("Mirage could not read this image. Try a smaller crop.");
          return objects(engine.UTF8ToString(resultPtr, resultCapacity), region);
        } finally {
          engine._free(buffer);
        }
      }
      async function analyze(job, isStale) {
        const image = await decodePhoto(job.source);
        try {
          const region = photoCrop(job.crop, image.width, image.height);
          const engine = await getRuntime();
          if (isStale()) throw new DOMException("Photo lookup cancelled", "AbortError");
          const ratio = Math.min(1, 1024 / Math.max(region.width, region.height));
          const width = Math.max(1, Math.round(region.width * ratio)), height = Math.max(1, Math.round(region.height * ratio));
          const canvas = new OffscreenCanvas(width, height), context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
          if (!context) throw new Error("This browser could not prepare the image.");
          context.fillStyle = "white";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, width, height);
          const detections = describe(engine, context.getImageData(0, 0, width, height).data, width, height, region);
          return { width: image.width, height: image.height, detections };
        } finally {
          image.close();
        }
      }
      var queued = /* @__PURE__ */ new Map();
      var current;
      var cancelled = false;
      function reply(value) {
        thread.postMessage(value);
      }
      async function work() {
        if (current) return;
        for (const [id, job] of queued) {
          queued.delete(id);
          current = job;
          cancelled = false;
          try {
            const analysis = await analyze(job, () => cancelled);
            if (!cancelled) reply({ id, analysis });
          } catch (error) {
            if (!cancelled) reply({ id, error: error instanceof Error ? error.message : "Photo Lookup could not finish." });
          } finally {
            current = void 0;
          }
        }
      }
      thread.onmessage = ({ data }) => {
        if ("cancel" in data) {
          queued.delete(data.cancel);
          if (current?.id === data.cancel) cancelled = true;
          return;
        }
        if (queued.size >= 4) {
          reply({ id: data.id, error: "Photo Lookup is busy. Try again shortly." });
          return;
        }
        queued.set(data.id, data);
        void work();
      };
    }
  });
  require_photo_vision_worker();
})();
//# sourceMappingURL=photo-vision-worker.js.map
