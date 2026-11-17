"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/wiktionary-parser.ts
  function parseWiktionary(html, language) {
    const template = document.createElement("template");
    template.innerHTML = html;
    const clean = (element, preserveTables = false) => {
      const copy = element.cloneNode(true);
      copy.querySelectorAll("script,style,iframe,img,video,audio,svg,ul,ol,dl,rt,rp,.mw-editsection,.reference,.citation-whole,.quotation,.h-usage-example" + (preserveTables ? "" : ",table")).forEach((node) => node.remove());
      return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
    };
    let japanese = false, seenJapanese = false, partOfSpeech = false, spelling = false;
    const definitions = [], targets = /* @__PURE__ */ new Set();
    let invalidReference = false;
    const reference = (link) => {
      const href = link.getAttribute("href");
      try {
        const url = new URL(href ?? "", `https://${language}.wiktionary.org`);
        if (!href || url.origin !== `https://${language}.wiktionary.org` || !url.pathname.startsWith("/wiki/") || url.search) throw new Error("Invalid reference");
        const target = decodeURIComponent(url.pathname.slice(6)).replace(/_/g, " ").trim().normalize("NFC");
        if (!/^[\p{L}\p{M}\p{N}々〆ー・\s'-]{1,80}$/u.test(target)) throw new Error("Invalid target");
        targets.add(target);
      } catch {
        invalidReference = true;
      }
    };
    for (const element of template.content.querySelectorAll("h2,h3,h4,h5,h6,ol,table.ja-see")) {
      if (element.parentElement?.closest("table,dl,.toc")) continue;
      if (element.tagName === "H2") {
        japanese = clean(element) === (language === "en" ? "Japanese" : "\u65E5\u672C\u8A9E");
        seenJapanese ||= japanese;
        partOfSpeech = false;
        spelling = false;
        continue;
      }
      if (!japanese) continue;
      if (element.matches("table.ja-see")) {
        const text = clean(element, true), names = [...text.matchAll(/[【〖]([^】〗]+)[】〗]/gu)].map((m) => m[1].trim());
        if (!names.length) invalidReference = true;
        for (const name of names) {
          const links = [...element.querySelectorAll("a[href]")].filter((a) => clean(a) === name);
          if (!links.length) invalidReference = true;
          for (const link of links) reference(link);
        }
        continue;
      }
      if (element.tagName !== "OL") {
        const heading = clean(element);
        spelling = language === "ja" && /^(和語の漢字表記|漢字表記|異表記|別表記)(?:\s|$)/u.test(heading);
        if (!/^語義(?:\s|$)/u.test(heading)) partOfSpeech = /^(Noun|Proper noun|Verb|Adjective|Adverb|Pronoun|Particle|Conjunction|Interjection|Prefix|Suffix|Counter|Numeral|Determiner|Phrase|Proverb|Idiom|Affix|名詞|固有名詞|動詞|形容詞|形容動詞|副詞|代名詞|助詞|接続詞|感動詞|接頭辞|接尾辞|助数詞|数詞|連体詞|成句|熟語|ことわざ|熟字訓|語素)(?:\s|[:：0-9０-９]|$)/u.test(heading);
        continue;
      }
      if (element.parentElement?.closest("ol,ul")) continue;
      for (const item of element.children) {
        if (item.tagName !== "LI") continue;
        if (spelling) {
          const link = item.querySelector("b a[href],strong a[href]");
          if (link && clean(item) === `${clean(link)}\u306E\u6F22\u5B57\u8868\u8A18\u3002`) reference(link);
          else invalidReference = true;
        } else if (partOfSpeech) {
          const value = clean(item).slice(0, 600);
          if (value && !definitions.includes(value) && definitions.length < 4) definitions.push(value);
        }
      }
    }
    if (definitions.length) return { status: "ok", definitions };
    if (!invalidReference && targets.size === 1) return { status: "reference", definitions: [], target: [...targets][0] };
    return { status: seenJapanese ? "unsupported" : "missing", definitions: [] };
  }
  var init_wiktionary_parser = __esm({
    "src/wiktionary-parser.ts"() {
      "use strict";
    }
  });

  // src/photo-diary.ts
  function validDiaryWord(value) {
    const valid = (text, limit) => typeof text === "string" && text.trim().length > 0 && text.length <= limit;
    return valid(value.word, 256) && valid(value.reading, 256) && valid(value.meaning, 1024);
  }
  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      let blocked = false;
      request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: "id" });
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        blocked = true;
        reject(new Error("Close other Picture Diary tabs and try again."));
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => request.result.close();
        if (blocked) request.result.close();
        else resolve(request.result);
      };
    });
  }
  async function transaction(mode, operation) {
    const db = await openDatabase();
    try {
      const transaction2 = db.transaction(storeName, mode);
      const finished = new Promise((resolve, reject) => {
        transaction2.oncomplete = () => resolve();
        transaction2.onabort = () => reject(transaction2.error ?? new Error("Picture Diary storage was interrupted."));
      });
      try {
        const [value] = await Promise.all([operation(transaction2.objectStore(storeName)), finished]);
        return value;
      } catch (error) {
        try {
          transaction2.abort();
        } catch {
        }
        await finished.catch(() => {
        });
        throw error;
      }
    } finally {
      db.close();
    }
  }
  function requestValue(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  function encodeCrop(image, crop) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(chrome.runtime.getURL("photo-diary-worker.js"), { type: "module" });
      const timer = setTimeout(() => {
        worker.terminate();
        reject(new Error("The crop took too long to save. Try a smaller crop."));
      }, 3e4);
      const cleanup = () => {
        clearTimeout(timer);
        worker.terminate();
      };
      worker.onmessage = ({ data }) => {
        cleanup();
        if ("error" in data) reject(new Error(data.error));
        else resolve(data);
      };
      worker.onerror = () => {
        cleanup();
        reject(new Error("Could not save the image crop. Try again."));
      };
      try {
        worker.postMessage({ image, crop });
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }
  async function saveDiaryEntry(image, crop, word) {
    if (!validDiaryWord(word)) throw new Error("Choose a Japanese word before saving.");
    const encoded = await encodeCrop(image, crop);
    const entry = {
      ...encoded,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      word: word.word.trim(),
      reading: word.reading.trim(),
      meaning: word.meaning.trim()
    };
    await transaction("readwrite", async (store) => requestValue(store.add(entry)));
    return entry;
  }
  var databaseName, storeName;
  var init_photo_diary = __esm({
    "src/photo-diary.ts"() {
      "use strict";
      databaseName = "ko-picture-diary";
      storeName = "entries";
    }
  });

  // src/photo-vision.ts
  function createPhotoVision() {
    const pending = /* @__PURE__ */ new Map();
    let worker, sequence = 0, disposed = false;
    function stop(error) {
      worker?.terminate();
      worker = void 0;
      for (const job of pending.values()) {
        job.cleanup();
        job.reject(error);
      }
      pending.clear();
    }
    function start() {
      if (worker) return worker;
      const thread = new Worker(chrome.runtime.getURL("photo-vision-worker.js"));
      worker = thread;
      thread.onmessage = ({ data }) => {
        if (thread !== worker) return;
        const job = pending.get(data.id);
        if (!job) return;
        pending.delete(data.id);
        job.cleanup();
        if (data.analysis) job.resolve(data.analysis);
        else job.reject(new Error(data.error ?? "Photo Lookup could not finish. Try again."));
      };
      const failed = () => {
        if (thread === worker) stop(new Error("The local image worker stopped. Try again."));
      };
      thread.onerror = failed;
      thread.onmessageerror = failed;
      return thread;
    }
    function analyze(source, crop, signal) {
      if (disposed || signal?.aborted) return Promise.reject(new DOMException("Photo lookup cancelled", "AbortError"));
      if (pending.size >= 4) return Promise.reject(new Error("Photo Lookup is busy. Try again shortly."));
      return new Promise((resolve, reject) => {
        const thread = start(), id = ++sequence;
        const abort = () => {
          thread.postMessage({ cancel: id });
          pending.delete(id);
          cleanup();
          reject(new DOMException("Photo lookup cancelled", "AbortError"));
        };
        const timer = setTimeout(() => stop(new Error("Local image analysis took too long. Try a smaller crop.")), 6e4);
        const cleanup = () => {
          clearTimeout(timer);
          signal?.removeEventListener("abort", abort);
        };
        pending.set(id, { resolve, reject, cleanup });
        signal?.addEventListener("abort", abort, { once: true });
        try {
          thread.postMessage({ id, source, crop });
        } catch (error) {
          pending.delete(id);
          cleanup();
          reject(error);
        }
      });
    }
    return { analyze, dispose: () => {
      disposed = true;
      stop(new DOMException("Photo lookup closed", "AbortError"));
    } };
  }
  var maxPhotoBytes;
  var init_photo_vision = __esm({
    "src/photo-vision.ts"() {
      "use strict";
      maxPhotoBytes = 32 * 1024 * 1024;
    }
  });

  // src/photo-tab-protocol.ts
  function screenshotCrop(selection, bitmap) {
    const { rect, viewport } = selection;
    const xScale = bitmap.width / viewport.width, yScale = bitmap.height / viewport.height;
    const x = Math.floor(rect.x * xScale), y = Math.floor(rect.y * yScale);
    const right = Math.min(bitmap.width, Math.ceil((rect.x + rect.width) * xScale));
    const bottom = Math.min(bitmap.height, Math.ceil((rect.y + rect.height) * yScale));
    return { x, y, width: right - x, height: bottom - y };
  }
  var photoTabExpired;
  var init_photo_tab_protocol = __esm({
    "src/photo-tab-protocol.ts"() {
      "use strict";
      photoTabExpired = "The selected area is no longer available. Choose it again from the toolbar.";
    }
  });

  // src/photo-tab-offscreen.ts
  var require_photo_tab_offscreen = __commonJS({
    "src/photo-tab-offscreen.ts"() {
      "use strict";
      init_photo_diary();
      init_photo_vision();
      init_photo_tab_protocol();
      var sessions = /* @__PURE__ */ new Map();
      function remove(session) {
        sessions.delete(session.owner.windowId);
        session.request?.controller.abort();
        session.vision?.dispose();
        session.source = void 0;
      }
      async function cropScreenshot(screenshot, selection) {
        const prefix = "data:image/png;base64,";
        if (!screenshot.startsWith(prefix)) throw new Error("The tab capture could not be decoded.");
        const decoding = decodeScreenshot(screenshot.slice(prefix.length));
        screenshot = "";
        const bitmap = await decoding;
        let canvas;
        try {
          const { x, y, width, height } = screenshotCrop(selection, bitmap);
          canvas = new OffscreenCanvas(width, height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("The selected area could not be decoded.");
          context.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
        } finally {
          bitmap.close();
        }
        return canvas.convertToBlob({ type: "image/png" });
      }
      function decodeScreenshot(encoded) {
        const binary = atob(encoded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return createImageBitmap(new Blob([bytes], { type: "image/png" }));
      }
      function startAnalysis(session, id) {
        session.request?.controller.abort();
        const request = { id, controller: new AbortController() };
        session.request = request;
        return request;
      }
      async function analyze(session, request, crop) {
        if (!session.source || request.controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
        session.vision ??= createPhotoVision();
        const result = await session.vision.analyze(session.source, crop, request.controller.signal);
        if (request.controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
        return result;
      }
      async function capture(session, request, view) {
        session.source = void 0;
        const crop = await view;
        if (request.controller.signal.aborted) throw new DOMException("Cancelled", "AbortError");
        session.source = crop;
        return analyze(session, request);
      }
      var privateTypes = /* @__PURE__ */ new Set([
        "photo-tab-private-register",
        "photo-tab-private-invalidate",
        "photo-tab-private-owner",
        "photo-tab-private-tab-owner",
        "photo-tab-private-bind",
        "photo-tab-private-close",
        "photo-tab-private-capture",
        "photo-tab-private-analyze",
        "photo-tab-private-abort",
        "photo-tab-private-save"
      ]);
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (!privateTypes.has(message?.type) || sender.id !== chrome.runtime.id || sender.tab || sender.url !== chrome.runtime.getURL("background.js")) return;
        if (message.type === "photo-tab-private-register") {
          const previous = sessions.get(message.owner.windowId);
          if (previous) remove(previous);
          sessions.set(message.owner.windowId, { owner: message.owner, expectedDocumentId: message.expectedDocumentId });
          respond({ ok: true });
          return;
        }
        if (message.type === "photo-tab-private-invalidate") {
          for (const [windowId, session2] of sessions) {
            if ((message.windowId === void 0 || windowId === message.windowId) && (message.tabId === void 0 || session2.owner.tabId === message.tabId) && session2.owner.tabId !== message.exceptTabId) remove(session2);
          }
          respond({ ok: true });
          return;
        }
        const session = sessions.get(message.windowId);
        if (message.type === "photo-tab-private-tab-owner") {
          respond({ value: session?.owner.tabId === message.tabId ? session.owner : void 0 });
          return;
        }
        if (!session || session.owner.id !== message.id) {
          respond({ error: photoTabExpired });
          return;
        }
        if (message.type === "photo-tab-private-bind") {
          const documentId = session.owner.documentId ?? session.expectedDocumentId;
          if (session.owner.tabId !== message.tabId || documentId && documentId !== message.documentId) {
            respond({ error: photoTabExpired });
            return;
          }
          session.owner.documentId = message.documentId;
          respond({ value: true });
          return;
        }
        if (message.type === "photo-tab-private-owner") {
          respond({ value: session.owner });
          return;
        }
        if (message.type === "photo-tab-private-close") {
          remove(session);
          respond({ value: true });
          return;
        }
        if (message.type === "photo-tab-private-abort") {
          if (message.requestId === session.request?.id) session.request.controller.abort();
          respond({ value: true });
          return;
        }
        if (message.type === "photo-tab-private-save") {
          if (!session.source) {
            respond({ error: photoTabExpired });
            return;
          }
          void saveDiaryEntry(session.source, message.crop, message.word).then(() => respond({ value: true }), (error) => respond({ error: error instanceof Error ? error.message : "Could not save to Picture Diary." }));
          return true;
        }
        if (message.type !== "photo-tab-private-capture" && message.type !== "photo-tab-private-analyze") return;
        const request = startAnalysis(session, message.requestId);
        let job;
        if (message.type === "photo-tab-private-capture") {
          const view = cropScreenshot(message.screenshot, message.selection);
          message.screenshot = "";
          job = capture(session, request, view);
        } else job = analyze(session, request, message.crop);
        void job.then((value) => respond({ value }), (error) => respond({ error: error instanceof Error ? error.message : "Could not identify objects in this area." })).finally(() => {
          if (session.request === request) session.request = void 0;
        });
        return true;
      });
    }
  });

  // src/offscreen.ts
  var require_offscreen = __commonJS({
    "src/offscreen.ts"() {
      init_wiktionary_parser();
      var import_photo_tab_offscreen = __toESM(require_photo_tab_offscreen());
      var worker = new Worker(chrome.runtime.getURL("tokenizer.js"));
      var dataWorker;
      var dataSequence = 0;
      var dataPending = /* @__PURE__ */ new Map();
      function playgroundWorker() {
        if (dataWorker) return dataWorker;
        const current = new Worker(chrome.runtime.getURL("playground-data-worker.js"));
        dataWorker = current;
        current.onmessage = ({ data }) => {
          const job = dataPending.get(data.id);
          if (!job) return;
          clearTimeout(job.timer);
          dataPending.delete(data.id);
          job.resolve(data);
        };
        current.onerror = () => {
          current.terminate();
          dataWorker = void 0;
          for (const job of dataPending.values()) {
            clearTimeout(job.timer);
            job.resolve({ error: "Local playground worker failed. Try again." });
          }
          dataPending.clear();
        };
        return current;
      }
      var next = 0;
      var pending = /* @__PURE__ */ new Map();
      worker.onmessage = (event) => {
        pending.get(event.data.id)?.resolve(event.data);
        pending.delete(event.data.id);
      };
      worker.onerror = () => {
        for (const { resolve } of pending.values()) resolve({ error: "Tokenizer worker failed" });
        pending.clear();
      };
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (sender.id !== chrome.runtime.id || sender.tab || sender.url !== chrome.runtime.getURL("background.js")) return;
        if (message?.type === "playground-data-job") {
          const current = playgroundWorker(), id2 = ++dataSequence;
          const timer = setTimeout(() => {
            dataPending.delete(id2);
            respond({ error: "Local playground request timed out. Try again." });
          }, 2e4);
          dataPending.set(id2, { resolve: respond, timer });
          current.postMessage({ id: id2, query: message.query });
          return true;
        }
        if (message?.type === "dictionary-parse") {
          if (typeof message.html !== "string" || message.html.length > 1e6 || !["en", "ja"].includes(message.language)) {
            respond({ status: "unsupported", definitions: [] });
            return;
          }
          respond(parseWiktionary(message.html, message.language));
          return;
        }
        if (message?.type === "worker-release") {
          worker.postMessage(message);
          return;
        }
        if (message?.type === "worker-cancel") {
          for (const [id2, job] of pending) if (job.jobId === message.jobId) {
            worker.postMessage({ type: "worker-cancel", id: id2 });
            job.resolve({ cancelled: true });
            pending.delete(id2);
          }
          respond({ ok: true });
          return;
        }
        if (message?.type !== "worker-job") return;
        const id = ++next;
        pending.set(id, { jobId: message.jobId, resolve: respond });
        worker.postMessage({ id, key: message.key, texts: message.texts, overrides: message.overrides, includeWords: message.includeWords });
        return true;
      });
    }
  });
  require_offscreen();
})();
//# sourceMappingURL=offscreen.js.map
