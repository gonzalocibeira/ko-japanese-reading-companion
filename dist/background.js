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
      for (let key2 of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key2) && key2 !== except)
          __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
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

  // src/shared.ts
  var hiragana;
  var init_shared = __esm({
    "src/shared.ts"() {
      "use strict";
      hiragana = (text) => text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96));
    }
  });

  // src/preferences.ts
  function appearance(value) {
    const v = value;
    return { scale: typeof v?.scale === "number" && Number.isFinite(v.scale) ? Math.max(0.75, Math.min(1.5, v.scale)) : 1, contrast: v?.contrast === "high" ? "high" : "auto" };
  }
  function appearanceForSite(value, hostname) {
    return appearance(value && typeof value === "object" ? value[hostname] : void 0);
  }
  function validateOverride(word, reading) {
    word = word.trim().normalize("NFC");
    reading = hiragana(reading.trim().normalize("NFKC"));
    if (!word || word.length > 80 || !/[\p{Script=Han}々]/u.test(word) || /[\p{Cc}\p{Cf}]/u.test(word)) throw new Error("Enter a word containing kanji, up to 80 characters.");
    if (!/^[ぁ-ゖーゝゞ]+$/u.test(reading) || reading.length > 80) throw new Error("Enter a reading in hiragana or katakana, up to 80 characters.");
    return { word, reading };
  }
  function validOverrides(value) {
    const entries = [];
    if (value && typeof value === "object") for (const [word, raw] of Object.entries(value)) {
      if (entries.length >= 200) break;
      try {
        if (typeof raw === "string") {
          const v = validateOverride(word, raw);
          entries.push([v.word, v.reading]);
        }
      } catch {
      }
    }
    return Object.fromEntries(entries);
  }
  function docsReadingView(value) {
    const v = value;
    return { enabled: v?.enabled === true, spacing: typeof v?.spacing === "number" && Number.isFinite(v.spacing) ? Math.max(2.2, Math.min(3.4, v.spacing)) : 2.8 };
  }
  function readingViewPreferences(value, legacy) {
    const v = value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
    const old = docsReadingView(legacy);
    const sites = v?.sites && typeof v.sites === "object" && !Array.isArray(v.sites) ? Object.fromEntries(Object.entries(v.sites).filter(([, enabled]) => typeof enabled === "boolean")) : !v && old.enabled ? { "docs.google.com": true } : {};
    return { sites, spacing: docsReadingView({ spacing: v?.spacing ?? old.spacing }).spacing, fontSize: panelFontSizes.includes(v?.fontSize ?? 0) ? v.fontSize : 20, width: typeof v?.width === "number" && Number.isFinite(v.width) ? Math.max(280, Math.min(720, v.width)) : 420 };
  }
  function mergeCorrectionBackup(json, existing) {
    if (new TextEncoder().encode(json).length > correctionBackupLimit) throw new Error("Choose a backup smaller than 256 KiB.");
    let data;
    try {
      data = JSON.parse(json);
    } catch {
      throw new Error("This file is not valid JSON.");
    }
    if (!data || data.version !== 1 || !data.corrections || typeof data.corrections !== "object" || Array.isArray(data.corrections)) throw new Error("Choose a version 1 correction backup.");
    const imported = {};
    for (const [word, reading] of Object.entries(data.corrections)) {
      if (typeof reading !== "string") throw new Error("The backup contains an invalid correction.");
      const valid = validateOverride(word, reading);
      if (Object.hasOwn(imported, valid.word) && imported[valid.word] !== valid.reading) throw new Error("The backup contains conflicting normalized words.");
      imported[valid.word] = valid.reading;
    }
    const values = { ...existing };
    let added = 0, skipped = 0;
    for (const [word, reading] of Object.entries(imported)) {
      if (Object.hasOwn(values, word)) skipped++;
      else {
        values[word] = reading;
        added++;
      }
    }
    if (Object.keys(values).length > 200) throw new Error("This import would exceed 200 corrections. Remove some corrections and try again.");
    return { values, added, skipped };
  }
  var panelFontSizes, correctionBackupLimit;
  var init_preferences = __esm({
    "src/preferences.ts"() {
      "use strict";
      init_shared();
      panelFontSizes = [16, 18, 20, 24, 28, 32];
      correctionBackupLimit = 256 * 1024;
    }
  });

  // src/local-dictionary.ts
  function dictionaryBucket(term) {
    let hash = 2166136261;
    for (const char of term) hash = Math.imul(hash ^ char.codePointAt(0), 16777619) >>> 0;
    return (hash & 255).toString(16).padStart(2, "0");
  }
  function bundledResourceURL(path) {
    return typeof chrome === "object" && chrome.runtime?.getURL ? chrome.runtime.getURL(path) : new URL(path, self.location.href).href;
  }
  async function loadDictionaryShard(dictionary, bucket) {
    const key2 = `${dictionary}/${bucket}`;
    const cached = shards.get(key2);
    if (cached) {
      shards.delete(key2);
      shards.set(key2, cached);
      return cached.value;
    }
    let job = loading.get(key2);
    if (!job) {
      job = (async () => {
        const response = await fetch(bundledResourceURL(`dictionaries/${dictionary}/${bucket}.json.gz`));
        if (!response.ok || !response.body) throw new Error("Local dictionary unavailable");
        const text = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text(), value = JSON.parse(text);
        if (!value.terms || !value.entries) throw new Error("Invalid dictionary shard");
        const bytes = text.length * 2;
        shards.set(key2, { value, bytes });
        retainedBytes += bytes;
        while (shards.size > 16 || retainedBytes > 8 * 1024 * 1024) {
          const key3 = shards.keys().next().value;
          retainedBytes -= shards.get(key3).bytes;
          shards.delete(key3);
        }
        return value;
      })().finally(() => loading.delete(key2));
      loading.set(key2, job);
    }
    return job;
  }
  async function localDefinition(raw) {
    const word = raw.normalize("NFC"), shard = await loadDictionaryShard("jmdict", dictionaryBucket(word));
    const entries = (shard.terms[word] ?? []).map((id) => shard.entries[id]).filter((entry) => !!entry);
    const rank = (entry) => [
      entry.spellings.some((k) => k.text === word) ? 0 : 1,
      entry.spellings.concat(entry.readings).some((k) => k.priority.length) ? 0 : 1,
      Number(entry.id)
    ];
    entries.sort((a, b) => {
      const x = rank(a), y = rank(b);
      return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
    });
    const definitions = [], entryIds = [];
    for (const entry of entries) {
      const exact = entry.spellings.some((k) => k.text === word);
      const pairs = entry.readings.flatMap((reading) => {
        if (!exact && reading.text !== word) return [];
        const spellings = reading.noKanji ? [] : entry.spellings.filter((k) => (!exact || k.text === word) && (!reading.restrict.length || reading.restrict.includes(k.text)));
        if (exact && !spellings.length) return [];
        return spellings.length ? spellings.map((k) => ({ spelling: k.text, reading: reading.text })) : [{ spelling: "", reading: reading.text }];
      });
      for (const sense of entry.senses) {
        if (!pairs.some((pair) => (!sense.spellings.length || sense.spellings.includes(pair.spelling)) && (!sense.readings.length || sense.readings.includes(pair.reading)))) continue;
        const labels = [...sense.field, ...sense.misc, ...sense.dialect, ...sense.info];
        const text = `${labels.length ? `(${labels.join("; ")}) ` : ""}${sense.glosses.join("; ")}`.slice(0, 600);
        if (text && !definitions.includes(text)) {
          definitions.push(text);
          if (!entryIds.includes(entry.id)) entryIds.push(entry.id);
        }
        if (definitions.length === 4) break;
      }
      if (definitions.length === 4) break;
    }
    return definitions.length ? { status: "ok", definitions, title: word, source: "jmdict", entryIds } : void 0;
  }
  var shards, loading, retainedBytes;
  var init_local_dictionary = __esm({
    "src/local-dictionary.ts"() {
      "use strict";
      shards = /* @__PURE__ */ new Map();
      loading = /* @__PURE__ */ new Map();
      retainedBytes = 0;
    }
  });

  // src/local-japanese-dictionary.ts
  async function localJapaneseDefinition(raw) {
    const word = raw.normalize("NFC"), shard = await loadDictionaryShard("jawiktionary", dictionaryBucket(word));
    const definitions = [], entryIds = [];
    let title;
    for (const id of shard.terms[word] ?? []) {
      const entry = shard.entries[id];
      if (!entry) continue;
      for (const sense of entry.senses) {
        const text = sense.text.slice(0, 600);
        if (text && !definitions.includes(text)) {
          definitions.push(text);
          if (!entryIds.includes(id)) entryIds.push(id);
          title ??= entry.title;
        }
        if (definitions.length === 4) break;
      }
      if (definitions.length === 4) break;
    }
    return definitions.length ? { status: "ok", definitions, title, source: "jawiktionary", entryIds } : void 0;
  }
  var init_local_japanese_dictionary = __esm({
    "src/local-japanese-dictionary.ts"() {
      "use strict";
      init_local_dictionary();
    }
  });

  // src/offscreen-client.ts
  async function ensureOffscreen() {
    const contexts = await chrome.runtime.getContexts({ contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT] });
    if (contexts.length) return;
    if (!creating) creating = chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: [chrome.offscreen.Reason.WORKERS, chrome.offscreen.Reason.DOM_PARSER],
      justification: "Run offline Japanese and image workers and safely extract dictionary text."
    }).finally(() => {
      creating = void 0;
    });
    await creating;
  }
  var creating;
  var init_offscreen_client = __esm({
    "src/offscreen-client.ts"() {
      "use strict";
    }
  });

  // src/dictionary.ts
  async function onlineDefinition(language, word) {
    const signal = AbortSignal.timeout(8e3);
    const run2 = async () => {
      const visited = /* @__PURE__ */ new Set();
      let title = word;
      for (let hop = 0; hop <= 2; hop++) {
        if (signal.aborted) throw new Error("Dictionary timeout");
        if (visited.has(title)) return failure("structure");
        visited.add(title);
        const url = new URL(`https://${language}.wiktionary.org/w/api.php`);
        url.search = new URLSearchParams({ action: "parse", page: title, prop: "text", format: "json", formatversion: "2", redirects: "1", disableeditsection: "1" }).toString();
        const response = await fetch(url, { credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", signal });
        if (!response.ok) return response.status === 404 ? { status: "missing", definitions: [], source: "wiktionary", title } : failure("network");
        const reader = response.body?.getReader();
        if (!reader) return failure("network");
        const chunks = [];
        let size = 0;
        for (; ; ) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 1e6) {
            await reader.cancel();
            return failure("structure");
          }
          chunks.push(value);
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.byteLength;
        }
        const data = JSON.parse(new TextDecoder().decode(bytes));
        if (data.error) return data.error.code === "missingtitle" ? { status: "missing", definitions: [], source: "wiktionary", title } : failure("network");
        if (typeof data.parse?.text !== "string") return failure("structure");
        const resolved = typeof data.parse.title === "string" ? data.parse.title : title;
        await ensureOffscreen();
        if (signal.aborted) throw new Error("Dictionary timeout");
        const parsed = await chrome.runtime.sendMessage({ type: "dictionary-parse", html: data.parse.text, language });
        if (parsed?.status === "ok" && Array.isArray(parsed.definitions) && parsed.definitions.length) return { status: "ok", definitions: parsed.definitions, title: resolved, source: "wiktionary" };
        if (parsed?.status === "missing") return { status: "missing", definitions: [], title: resolved, source: "wiktionary" };
        if (parsed?.status !== "reference" || typeof parsed.target !== "string" || !/^[\p{L}\p{M}\p{N}々〆ー・\s'-]{1,80}$/u.test(parsed.target)) return failure("structure");
        if (visited.has(resolved) && resolved !== title) return failure("structure");
        visited.add(resolved);
        title = parsed.target;
      }
      return failure("structure");
    };
    let abort = () => {
    };
    try {
      return await Promise.race([run2(), new Promise((resolve) => {
        abort = () => resolve(failure("network"));
        signal.addEventListener("abort", abort, { once: true });
      })]);
    } catch {
      return failure("network");
    } finally {
      signal.removeEventListener("abort", abort);
    }
  }
  function lookupOnlineDefinition(language, word) {
    return onlineDefinition(language, word);
  }
  function lookupDefinition(language, word) {
    const key2 = JSON.stringify([word, language]), stored = cache.get(key2);
    if (stored && stored.expires > Date.now()) {
      cache.delete(key2);
      cache.set(key2, stored);
      return Promise.resolve(stored.page);
    }
    cache.delete(key2);
    const active2 = pending.get(key2);
    if (active2) return active2;
    if (pending.size >= 8) return Promise.resolve(failure("busy"));
    const job = (async () => {
      let page;
      try {
        page = await (language === "en" ? localDefinition(word) : localJapaneseDefinition(word));
      } catch {
      }
      page ??= await onlineDefinition(language, word);
      if (page.status !== "error") {
        cache.set(key2, { page, expires: page.status === "missing" ? Date.now() + 5 * 6e4 : Infinity });
        while (cache.size > 256) cache.delete(cache.keys().next().value);
      }
      return page;
    })().finally(() => pending.delete(key2));
    pending.set(key2, job);
    return job;
  }
  var pending, cache, failure;
  var init_dictionary = __esm({
    "src/dictionary.ts"() {
      "use strict";
      init_local_dictionary();
      init_local_japanese_dictionary();
      init_offscreen_client();
      pending = /* @__PURE__ */ new Map();
      cache = /* @__PURE__ */ new Map();
      failure = (reason) => ({ status: "error", definitions: [], source: "wiktionary", reason });
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (message?.type !== "define-word") return;
        let url;
        try {
          url = sender.url ? new URL(sender.url) : void 0;
        } catch {
        }
        if (sender.tab?.id === void 0 || sender.frameId !== 0 || !url || !["http:", "https:"].includes(url.protocol) || typeof message.word !== "string" || !/^[\p{L}\p{M}\p{N}々〆ー・\s'-]{1,80}$/u.test(message.word) || !message.word.trim()) {
          respond({ error: "Invalid dictionary request" });
          return;
        }
        if (message.language !== void 0 && message.language !== "en" && message.language !== "ja") {
          respond({ error: "Invalid dictionary language" });
          return;
        }
        const word = message.word.trim().normalize("NFC"), languages = message.language ? [message.language] : ["en", "ja"];
        void Promise.all(languages.map(async (language) => [language, await lookupDefinition(language, word)])).then((entries) => respond(Object.fromEntries(entries)));
        return true;
      });
    }
  });

  // src/playground-service.ts
  function validPlaygroundQuery(query) {
    if (!query || typeof query !== "object") return false;
    const q = query;
    const word = (s) => typeof s === "string" && s.length <= 80 && /^[\p{L}\p{M}\p{N}々〆ー・\s'-]+$/u.test(s) && (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(s) || !/\s/u.test(s));
    const id = (s) => typeof s === "string" && /^[a-z0-9-]{1,64}$/.test(s);
    switch (q.op) {
      case "search":
        return typeof q.query === "string" && q.query.length <= 80 && Number.isInteger(q.offset) && Number(q.offset) >= 0 && Number(q.offset) <= 1e6;
      case "entry":
        return typeof q.id === "string" && /^\d{1,12}$/.test(q.id) && typeof q.bucket === "string" && /^[a-f0-9]{2}$/.test(q.bucket);
      case "japanese":
        return word(q.word);
      case "online":
        return word(q.word) && (q.language === "en" || q.language === "ja");
      case "grammar-index":
        return true;
      case "grammar":
      case "comparison":
        return id(q.id);
      default:
        return false;
    }
  }
  var active;
  var init_playground_service = __esm({
    "src/playground-service.ts"() {
      "use strict";
      init_offscreen_client();
      init_dictionary();
      active = 0;
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (message?.type !== "playground-data") return;
        let url;
        try {
          url = sender.url ? new URL(sender.url) : void 0;
        } catch {
        }
        const standalone = url?.protocol === "chrome-extension:" && url.hostname === chrome.runtime.id && url.pathname === "/playgrounds.html";
        const reading = sender.tab?.id !== void 0 && sender.frameId === 0 && url && ["http:", "https:"].includes(url.protocol);
        if (sender.id !== chrome.runtime.id || !standalone && !reading || !validPlaygroundQuery(message.query)) {
          respond({ error: "Invalid playground request" });
          return;
        }
        if (active >= 8) {
          respond({ error: "Playgrounds are busy. Try again." });
          return;
        }
        active++;
        const query = message.query;
        void (async () => {
          if (query.op === "online") return { value: await lookupOnlineDefinition(query.language, query.word.trim().normalize("NFC")) };
          await ensureOffscreen();
          return chrome.runtime.sendMessage({ type: "playground-data-job", query });
        })().then(respond, (error) => respond({ error: String(error) })).finally(() => active--);
        return true;
      });
    }
  });

  // src/action-state.ts
  function toolbarPresentation(url, preferences, page) {
    if (preferences.enabled === false) return { state: "paused", title: "K\u014D \u2014 paused everywhere" };
    let hostname = "";
    try {
      const parsed = new URL(url ?? "");
      if (/^https?:$/.test(parsed.protocol)) hostname = parsed.hostname;
    } catch {
    }
    if (hostname && Array.isArray(preferences.excluded) && preferences.excluded.includes(hostname)) return { state: "paused", title: `K\u014D \u2014 paused on ${hostname}` };
    if (!hostname) return { state: "unavailable", title: "K\u014D \u2014 unavailable on this page" };
    if (!page) return { state: "unavailable", title: "K\u014D \u2014 reload this tab to start readings" };
    if (page.toolbarAvailability !== "ready") return { state: "unavailable", title: `K\u014D \u2014 ${page.message}` };
    return { state: "active", title: `K\u014D \u2014 active on ${hostname}` };
  }
  var init_action_state = __esm({
    "src/action-state.ts"() {
      "use strict";
    }
  });

  // src/action.ts
  var require_action = __commonJS({
    "src/action.ts"() {
      "use strict";
      init_action_state();
      var revisions = /* @__PURE__ */ new Map();
      async function refreshTab(tabId, navigating = false) {
        const revision = /* @__PURE__ */ Symbol();
        revisions.set(tabId, revision);
        try {
          const [tab, preferences] = await Promise.all([chrome.tabs.get(tabId), chrome.storage.local.get({ enabled: true, excluded: [] })]);
          let page;
          if (!navigating && toolbarPresentation(tab.url, preferences).state === "unavailable" && /^https?:/.test(tab.url ?? "")) {
            try {
              const response = await chrome.tabs.sendMessage(tabId, { type: "status" }, { frameId: 0 });
              if (typeof response?.message === "string" && ["ready", "unavailable"].includes(response.toolbarAvailability)) page = response;
            } catch {
            }
          }
          if (revisions.get(tabId) !== revision) return;
          const presentation = toolbarPresentation(tab.url, preferences, page);
          const path = Object.fromEntries([16, 32, 48, 128].map((size) => [size, `icons/icon-${presentation.state}-${size}.png`]));
          await Promise.all([chrome.action.setIcon({ tabId, path }), chrome.action.setTitle({ tabId, title: presentation.title })]);
        } catch {
        }
      }
      async function refreshAll() {
        try {
          await Promise.all((await chrome.tabs.query({})).flatMap((tab) => tab.id === void 0 ? [] : [refreshTab(tab.id)]));
        } catch {
        }
      }
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (message?.type !== "toolbar-status-changed" || sender.frameId !== 0 || sender.tab?.id === void 0) return;
        respond({ ok: true });
        void refreshTab(sender.tab.id);
      });
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && ("enabled" in changes || "excluded" in changes)) void refreshAll();
      });
      chrome.tabs.onActivated.addListener(({ tabId }) => void refreshTab(tabId));
      chrome.tabs.onUpdated.addListener((tabId, changes, tab) => {
        if (changes.status === "loading" || changes.url) void refreshTab(tabId, changes.status === "loading" || tab.status === "loading");
        else if (changes.status === "complete") void refreshTab(tabId);
      });
      chrome.tabs.onRemoved.addListener((tabId) => revisions.delete(tabId));
      chrome.runtime.onInstalled.addListener(() => void refreshAll());
      chrome.runtime.onStartup.addListener(() => void refreshAll());
      void refreshAll();
    }
  });

  // src/mascot-preferences.ts
  function mascotPreferences(value) {
    const v = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const positions = /* @__PURE__ */ Object.create(null);
    if (v.positions && typeof v.positions === "object" && !Array.isArray(v.positions)) {
      for (const [site, p] of Object.entries(v.positions).slice(-200)) {
        if (!site || site.length > 253 || /[\s/\\?#]/u.test(site) || !p || typeof p !== "object") continue;
        if (typeof p.x === "number" && Number.isFinite(p.x) && typeof p.y === "number" && Number.isFinite(p.y)) positions[site] = { x: Math.max(0, Math.min(1, p.x)), y: Math.max(0, Math.min(1, p.y)) };
      }
    }
    return { enabled: v.enabled === true, trigger: v.trigger === "highlight" ? "highlight" : "hover", definitions: v.definitions === "en" || v.definitions === "ja" ? v.definitions : "off", size: v.size === 96 || v.size === 160 ? v.size : 128, motion: v.motion === "reduced" ? "reduced" : "system", positions };
  }
  var init_mascot_preferences = __esm({
    "src/mascot-preferences.ts"() {
      "use strict";
    }
  });

  // src/mascot-presence.ts
  function serial(tabId, work) {
    const next = (pending2.get(tabId) ?? Promise.resolve()).catch(() => {
    }).then(async () => {
      await mascotMigration;
      return work();
    });
    pending2.set(tabId, next);
    void next.finally(() => {
      if (pending2.get(tabId) === next) pending2.delete(tabId);
    }).catch(() => {
    });
    return next;
  }
  async function visit(tabId) {
    const value = (await chrome.storage.session.get(key(tabId)))[key(tabId)];
    return value && typeof value.visible === "boolean" ? { visible: value.visible, greet: value.greet === true } : void 0;
  }
  async function status(tabId, override) {
    const tab = await chrome.tabs.get(tabId);
    if (!/^https?:/.test(tab.url ?? "")) return { visible: override?.visible ?? (await visit(tabId))?.visible ?? false, available: false, reload: false, error: "K\u014D\u304F\u3093 cannot appear on this browser-protected page. He can join you on a regular website." };
    try {
      const reply = await chrome.tabs.sendMessage(tabId, { type: "mascot-render-status" }, { frameId: 0 });
      if (typeof reply?.visible !== "boolean") throw new Error("Old content script");
      return { visible: reply.visible, available: true, reload: false };
    } catch {
      return { visible: override?.visible ?? (await visit(tabId))?.visible ?? false, available: false, reload: true, error: "Reload this tab to bring K\u014D\u304F\u3093 here. Some browser-protected pages cannot show him." };
    }
  }
  function changeMascotVisit(tabId, visible) {
    return serial(tabId, async () => {
      const current = await status(tabId);
      const next = { visible: visible ?? !current.visible, greet: false };
      next.greet = next.visible;
      await chrome.storage.session.set({ [key(tabId)]: next });
      try {
        const reply = await chrome.tabs.sendMessage(tabId, { type: "mascot-visit", visible: next.visible, greet: next.greet }, { frameId: 0 });
        if (reply?.ok !== true) throw new Error("Content script unavailable");
        await chrome.storage.session.set({ [key(tabId)]: { ...next, greet: false } });
      } catch {
      }
      return status(tabId, next);
    });
  }
  var key, mascotMigration, pending2;
  var init_mascot_presence = __esm({
    "src/mascot-presence.ts"() {
      "use strict";
      init_mascot_preferences();
      key = (tabId) => `mascotVisit:${tabId}`;
      mascotMigration = (async () => {
        const state = await chrome.storage.local.get(["mascot", "mascotOnDemandV1"]);
        if (state.mascotOnDemandV1 === true) return;
        await chrome.storage.local.set({ mascot: { ...mascotPreferences(state.mascot), enabled: false }, mascotOnDemandV1: true });
      })();
      pending2 = /* @__PURE__ */ new Map();
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        const fromPage = sender.frameId === 0 && sender.tab?.id !== void 0 && /^https?:/.test(sender.url ?? "");
        const fromExtension = sender.id === chrome.runtime.id && sender.url?.startsWith(chrome.runtime.getURL(""));
        let job;
        if (message?.type === "mascot-preferences-ready" && fromExtension) job = mascotMigration.then(() => ({ ok: true }));
        else if (message?.type === "mascot-visit-ready" && fromPage) {
          const tabId = sender.tab.id;
          job = serial(tabId, async () => {
            const current = await visit(tabId);
            await chrome.action.setBadgeText({ tabId, text: "" });
            if (current?.greet) await chrome.storage.session.set({ [key(tabId)]: { ...current, greet: false } });
            return { visible: current?.visible, greet: current?.greet ?? false };
          });
        } else if (message?.type === "mascot-visit-change" && (fromPage || fromExtension)) {
          const tabId = fromPage ? sender.tab.id : message.tabId;
          if (Number.isInteger(tabId) && tabId >= 0 && (message.visible === void 0 || typeof message.visible === "boolean")) job = changeMascotVisit(tabId, message.visible);
        } else if (message?.type === "mascot-visit-status" && fromExtension && Number.isInteger(message.tabId)) {
          job = serial(message.tabId, () => status(message.tabId));
        }
        if (!job) return;
        void job.then(respond, () => respond({ error: "Could not update K\u014D\u304F\u3093. Try again." }));
        return true;
      });
      chrome.commands.onCommand.addListener((command, tab) => {
        if (command !== "toggle-mascot") return;
        void (async () => {
          const target = tab?.id === void 0 ? (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0] : tab;
          if (target?.id === void 0) return;
          const result = await changeMascotVisit(target.id);
          await chrome.action.setBadgeText({ tabId: target.id, text: result.available ? "" : "!" });
          if (!result.available) await chrome.action.setTitle({ tabId: target.id, title: `K\u014D\u304F\u3093 \u2014 ${result.error}` });
        })().catch(() => {
        });
      });
      chrome.tabs.onRemoved.addListener((tabId) => {
        void serial(tabId, () => chrome.storage.session.remove(key(tabId))).catch(() => {
        });
      });
    }
  });

  // src/preference-writer.ts
  var require_preference_writer = __commonJS({
    "src/preference-writer.ts"() {
      "use strict";
      init_preferences();
      init_mascot_preferences();
      init_mascot_presence();
      var pending3 = Promise.resolve();
      function string(value, limit) {
        if (typeof value !== "string" || value.length > limit) throw new Error("Invalid preference value.");
        return value;
      }
      function hostname(value) {
        const name = string(value, 253);
        if (!name || /[\s/\\?#]/u.test(name)) throw new Error("Invalid website preference.");
        return name;
      }
      function record(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid preference value.");
        return value;
      }
      async function apply(mutation) {
        await mascotMigration;
        switch (mutation.kind) {
          case "mascot": {
            const patch = record(mutation.patch);
            const choices = { enabled: [true, false], trigger: ["hover", "highlight"], definitions: ["off", "en", "ja"], size: [96, 128, 160], motion: ["system", "reduced"] };
            if (Object.entries(patch).some(([key2, value]) => !Object.hasOwn(choices, key2) || !choices[key2].includes(value))) throw new Error("Invalid K\u014D\u304F\u3093 preference.");
            const state = await chrome.storage.local.get("mascot");
            const next = mascotPreferences({ ...mascotPreferences(state.mascot), ...patch });
            await chrome.storage.local.set({ mascot: next });
            return next;
          }
          case "mascot-position": {
            const site = hostname(mutation.hostname), p = mutation.position;
            if (p !== null && (!p || typeof p.x !== "number" || !Number.isFinite(p.x) || p.x < 0 || p.x > 1 || typeof p.y !== "number" || !Number.isFinite(p.y) || p.y < 0 || p.y > 1)) throw new Error("Invalid K\u014D\u304F\u3093 position.");
            const state = await chrome.storage.local.get("mascot"), next = mascotPreferences(state.mascot);
            delete next.positions[site];
            if (p) next.positions[site] = { x: p.x, y: p.y };
            const bounded = mascotPreferences(next);
            await chrome.storage.local.set({ mascot: bounded });
            return bounded;
          }
          case "reading-view": {
            const patch = record(mutation.patch);
            if (Object.entries(patch).some(([key2, value]) => !["spacing", "fontSize", "width"].includes(key2) || typeof value !== "number" || !Number.isFinite(value))) throw new Error("Invalid reading panel preference.");
            if (mutation.site) {
              hostname(mutation.site.hostname);
              if (typeof mutation.site.enabled !== "boolean") throw new Error("Invalid website preference.");
            }
            const state = await chrome.storage.local.get(["readingView", "docsReadingView"]);
            const current = readingViewPreferences(state.readingView, state.docsReadingView);
            const next = readingViewPreferences({ ...current, ...patch, sites: mutation.site ? { ...current.sites, [mutation.site.hostname]: mutation.site.enabled } : current.sites });
            await chrome.storage.local.set({ readingView: next });
            return next;
          }
          case "save-correction": {
            const correction = validateOverride(string(mutation.word, 80), string(mutation.reading, 80));
            const previous = mutation.previousWord === void 0 ? void 0 : string(mutation.previousWord, 80).trim().normalize("NFC");
            const state = await chrome.storage.local.get({ readingOverrides: {} }), values = validOverrides(state.readingOverrides);
            if (previous && previous !== correction.word) delete values[previous];
            if (!Object.hasOwn(values, correction.word) && Object.keys(values).length >= 200) throw new Error("You have 200 corrections. Remove one before adding another.");
            values[correction.word] = correction.reading;
            await chrome.storage.local.set({ readingOverrides: values });
            return values;
          }
          case "remove-correction": {
            const word = string(mutation.word, 80).trim().normalize("NFC");
            const state = await chrome.storage.local.get({ readingOverrides: {} }), values = validOverrides(state.readingOverrides);
            delete values[word];
            await chrome.storage.local.set({ readingOverrides: values });
            return values;
          }
          case "import-corrections": {
            if (typeof mutation.json !== "string") throw new Error("Invalid correction backup.");
            if (mutation.json.length > correctionBackupLimit) throw new Error("Choose a backup smaller than 256 KiB.");
            const json = mutation.json;
            const state = await chrome.storage.local.get({ readingOverrides: {} });
            const result = mergeCorrectionBackup(json, validOverrides(state.readingOverrides));
            await chrome.storage.local.set({ readingOverrides: result.values });
            return result;
          }
          case "pause-site": {
            const name = hostname(mutation.hostname);
            if (typeof mutation.paused !== "boolean") throw new Error("Invalid website preference.");
            const state = await chrome.storage.local.get({ excluded: [] });
            const sites = new Set(Array.isArray(state.excluded) ? state.excluded.filter((site) => typeof site === "string") : []);
            mutation.paused ? sites.add(name) : sites.delete(name);
            const excluded = [...sites];
            await chrome.storage.local.set({ excluded });
            return excluded;
          }
          case "site-appearance": {
            const name = hostname(mutation.hostname), patch = record(mutation.patch);
            if (Object.entries(patch).some(([key2, value]) => key2 === "scale" ? typeof value !== "number" || !Number.isFinite(value) : key2 !== "contrast" || !["auto", "high"].includes(String(value)))) throw new Error("Invalid reading appearance.");
            const state = await chrome.storage.local.get({ siteAppearance: {} });
            const sites = state.siteAppearance && typeof state.siteAppearance === "object" && !Array.isArray(state.siteAppearance) ? { ...state.siteAppearance } : {};
            const next = appearance({ ...appearanceForSite(sites, name), ...patch });
            sites[name] = next;
            await chrome.storage.local.set({ siteAppearance: sites });
            return next;
          }
          default:
            throw new Error("Invalid preference operation.");
        }
      }
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (message?.type !== "mutate-preferences") return;
        const popup = sender.url === chrome.runtime.getURL("popup.html");
        let webpage = false;
        try {
          webpage = sender.tab?.id !== void 0 && sender.frameId === 0 && ["http:", "https:"].includes(new URL(sender.url ?? "").protocol);
        } catch {
        }
        if (sender.id !== chrome.runtime.id || !popup && !webpage) {
          respond({ error: "Invalid preference sender." });
          return;
        }
        if (!message.mutation || typeof message.mutation !== "object" || Array.isArray(message.mutation)) {
          respond({ error: "Invalid preference operation." });
          return;
        }
        const job = pending3.then(() => apply(message.mutation));
        pending3 = job.then(() => {
        }, () => {
        });
        void job.then((value) => respond({ value }), (error) => respond({ error: error instanceof Error ? error.message : "Could not save the preference. Try again." }));
        return true;
      });
    }
  });

  // src/photo-tab-protocol.ts
  function validPhotoSize(value) {
    if (!value || typeof value !== "object") return false;
    const { width, height } = value;
    return Number.isFinite(width) && width > 0 && width <= 32768 && Number.isFinite(height) && height > 0 && height <= 32768;
  }
  function validPhotoRectangle(value) {
    if (!validPhotoSize(value)) return false;
    const { x, y } = value;
    return Number.isFinite(x) && x >= 0 && x <= 32768 && Number.isFinite(y) && y >= 0 && y <= 32768;
  }
  function validPhotoTabSelection(value) {
    if (!value || typeof value !== "object") return false;
    const { rect, viewport } = value;
    return validPhotoRectangle(rect) && validPhotoSize(viewport) && rect.width >= 16 && rect.height >= 16 && rect.x + rect.width <= viewport.width && rect.y + rect.height <= viewport.height;
  }
  var photoTabUnavailable, photoTabExpired, photoTabMoved, photoTabNeedsGesture;
  var init_photo_tab_protocol = __esm({
    "src/photo-tab-protocol.ts"() {
      "use strict";
      photoTabUnavailable = "This tab is unavailable for Photo Lookup. Open Photo Lookup to paste or choose an image.";
      photoTabExpired = "The selected area is no longer available. Choose it again from the toolbar.";
      photoTabMoved = "The page moved. Select the area again.";
      photoTabNeedsGesture = "To capture this tab, use Look up from this tab in the K\u014D toolbar menu, or your Photo Lookup browser shortcut.";
    }
  });

  // src/photo-tab-service.ts
  function clearCaptures(filter) {
    for (const [windowId, capture2] of inFlight) {
      if ((filter.windowId === void 0 || windowId === filter.windowId) && (filter.tabId === void 0 || capture2.tabId === filter.tabId) && capture2.tabId !== filter.exceptTabId) capture2.cancelled = true;
    }
    void chrome.runtime.sendMessage({ type: "photo-tab-private-invalidate", ...filter }).catch(() => {
    });
  }
  function isIdentifier(value) {
    return typeof value === "string" && /^[a-f0-9-]{36}$/i.test(value);
  }
  function validText(value, limit) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
  }
  async function startPhotoTabLookup(tabId, documentId) {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.active || !tab.url || !/^https?:\/\//i.test(tab.url)) return { error: photoTabUnavailable };
    const owner = { id: crypto.randomUUID(), tabId, windowId: tab.windowId };
    await ensureOffscreen();
    const registered = await chrome.runtime.sendMessage({ type: "photo-tab-private-register", owner, expectedDocumentId: documentId });
    if (!registered?.ok) return { error: photoTabUnavailable };
    try {
      const current = await chrome.tabs.get(tabId);
      if (!current.active || current.windowId !== owner.windowId) throw new Error(photoTabExpired);
      const options = documentId ? { documentId } : { frameId: 0 };
      const reply = await chrome.tabs.sendMessage(tabId, { type: "photo-tab-overlay-open", id: owner.id, fromMascot: !!documentId }, options);
      if (reply?.ok) return { ok: true };
    } catch {
    }
    await close(owner);
    return { error: photoTabUnavailable };
  }
  function close(owner) {
    const job = inFlight.get(owner.windowId);
    if (job?.id === owner.id) job.cancelled = true;
    return chrome.runtime.sendMessage({ type: "photo-tab-private-close", ...owner }).catch(() => {
    });
  }
  async function documentError(owner, requestId) {
    try {
      const reply = await chrome.tabs.sendMessage(owner.tabId, { type: "photo-tab-overlay-check", id: owner.id, requestId }, { documentId: owner.documentId });
      return reply?.ok ? void 0 : reply?.moved ? photoTabMoved : photoTabExpired;
    } catch {
      return photoTabExpired;
    }
  }
  async function closeAfterNavigation(tabId, windowId) {
    const reply = await chrome.runtime.sendMessage({ type: "photo-tab-private-tab-owner", tabId, windowId }).catch(() => void 0);
    const owner = reply?.value;
    if (owner?.documentId && await documentError(owner)) await close(owner);
  }
  async function getOwner(id, sender) {
    if (sender.frameId !== 0 || sender.tab?.id === void 0 || !sender.documentId) return void 0;
    const reply = await chrome.runtime.sendMessage({ type: "photo-tab-private-owner", id, windowId: sender.tab.windowId }).catch(() => void 0);
    const owner = reply?.value;
    return owner?.tabId === sender.tab.id && owner.documentId === sender.documentId ? owner : void 0;
  }
  async function capture(owner, requestId, selection) {
    if (!validPhotoTabSelection(selection)) return { error: "Choose an area at least 16 by 16 pixels within this tab." };
    const pending3 = inFlight.get(owner.windowId);
    if (pending3) return { error: "A capture is already running in this window. Try again." };
    const job = { tabId: owner.tabId, id: owner.id, cancelled: false };
    inFlight.set(owner.windowId, job);
    try {
      const verify = async () => {
        const current = await chrome.tabs.get(owner.tabId);
        if (job.cancelled || !current.active || current.windowId !== owner.windowId) return photoTabExpired;
        return documentError(owner, requestId);
      };
      const before = await verify();
      if (before || job.cancelled) return { error: before ?? photoTabExpired };
      let screenshot;
      try {
        screenshot = await chrome.tabs.captureVisibleTab(owner.windowId, { format: "png" });
      } catch (error) {
        if (/activeTab|permission/i.test(String(error))) return { error: photoTabNeedsGesture };
        throw error;
      }
      const after = await verify();
      if (after || job.cancelled) return { error: after ?? photoTabExpired };
      if (screenshot.length > screenshotLimit) return { error: "This tab capture is too large. Paste a smaller image into Photo Lookup." };
      void chrome.tabs.sendMessage(owner.tabId, { type: "photo-tab-overlay-captured", id: owner.id, requestId }, { documentId: owner.documentId }).catch(() => {
      });
      const request = chrome.runtime.sendMessage({ type: "photo-tab-private-capture", id: owner.id, windowId: owner.windowId, requestId, screenshot, selection });
      screenshot = "";
      const result = await request;
      return job.cancelled ? { error: photoTabExpired } : result;
    } finally {
      if (inFlight.get(owner.windowId) === job) inFlight.delete(owner.windowId);
    }
  }
  async function run(message, sender) {
    if (message.type === "photo-tab-bind") {
      const { id: tabId, windowId: windowId2 } = sender.tab;
      const tab = await chrome.tabs.get(tabId);
      if (!tab.active || tab.windowId !== windowId2) return { error: photoTabExpired };
      return chrome.runtime.sendMessage({ type: "photo-tab-private-bind", id: message.id, tabId, windowId: windowId2, documentId: sender.documentId });
    }
    const owner = await getOwner(message.id, sender);
    if (!owner) return { error: photoTabExpired };
    if (message.type === "photo-tab-close") {
      return close(owner);
    }
    const { id, windowId } = owner;
    if (message.type === "photo-tab-standalone") {
      await chrome.tabs.create({ url: chrome.runtime.getURL("playgrounds.html?tool=photo"), windowId });
      return { value: true };
    }
    if (message.type === "photo-tab-dictionary") {
      const hit = message.hit;
      if (!hit || typeof hit.id !== "string" || !/^\d{1,12}$/.test(hit.id) || typeof hit.bucket !== "string" || !/^[a-f0-9]{2}$/.test(hit.bucket) || !validText(hit.headword, 80) || !validText(hit.reading, 80)) return { error: "This Dictionary entry is unavailable." };
      const url = new URL(chrome.runtime.getURL("playgrounds.html"));
      url.search = new URLSearchParams({ dictionaryId: hit.id, dictionaryBucket: hit.bucket, dictionaryWord: hit.headword, dictionaryReading: hit.reading }).toString();
      await chrome.tabs.create({ url: url.href, windowId });
      return { value: true };
    }
    if (message.type === "photo-tab-save") {
      const { crop: crop2, word } = message;
      if (!validPhotoRectangle(crop2) || !word || !validText(word.word, 100) || !validText(word.reading, 100) || !validText(word.meaning, 500)) return { error: "This selection is unavailable for saving." };
      return chrome.runtime.sendMessage({ type: "photo-tab-private-save", id, windowId, crop: crop2, word });
    }
    if (!isIdentifier(message.requestId)) return { error: photoTabExpired };
    const requestId = message.requestId;
    if (message.type === "photo-tab-capture") return capture(owner, requestId, message.selection);
    if (message.type === "photo-tab-abort") return chrome.runtime.sendMessage({ type: "photo-tab-private-abort", id, windowId, requestId });
    const crop = message.crop;
    if (crop !== void 0 && !validPhotoRectangle(crop)) return { error: "The selected crop is invalid." };
    return chrome.runtime.sendMessage({ type: "photo-tab-private-analyze", id, windowId, requestId, crop });
  }
  var tabTypes, inFlight, screenshotLimit, popupUrl;
  var init_photo_tab_service = __esm({
    "src/photo-tab-service.ts"() {
      "use strict";
      init_offscreen_client();
      init_photo_tab_protocol();
      tabTypes = /* @__PURE__ */ new Set(["photo-tab-capture", "photo-tab-analyze", "photo-tab-abort", "photo-tab-save", "photo-tab-dictionary", "photo-tab-standalone", "photo-tab-bind", "photo-tab-close"]);
      inFlight = /* @__PURE__ */ new Map();
      screenshotLimit = 48 * 1024 * 1024;
      popupUrl = chrome.runtime.getURL("popup.html");
      chrome.tabs.onActivated.addListener(({ windowId, tabId }) => clearCaptures({ windowId, exceptTabId: tabId }));
      chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
        if (change.status === "complete") void closeAfterNavigation(tabId, tab.windowId);
      });
      chrome.tabs.onRemoved.addListener((tabId) => clearCaptures({ tabId }));
      chrome.tabs.onDetached.addListener((tabId) => clearCaptures({ tabId }));
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (sender.id !== chrome.runtime.id) return;
        if (message?.type === "photo-tab-start") {
          if (sender.tab || sender.url !== popupUrl || !Number.isSafeInteger(message.tabId) || message.tabId < 0) return;
          void startPhotoTabLookup(message.tabId).then(respond, () => respond({ error: photoTabUnavailable }));
          return true;
        }
        if (sender.frameId !== 0 || sender.tab?.id === void 0 || !sender.documentId) return;
        if (sender.documentLifecycle && sender.documentLifecycle !== "active" && message?.type !== "photo-tab-close") return;
        if (message?.type === "photo-tab-mascot-start") {
          void startPhotoTabLookup(sender.tab.id, sender.documentId).then(respond, () => respond({ error: photoTabUnavailable }));
          return true;
        }
        if (!tabTypes.has(message?.type) || !isIdentifier(message.id)) return;
        void run(message, sender).then(respond, () => respond({ error: message.type === "photo-tab-capture" ? photoTabUnavailable : "Photo Lookup could not finish. Try again." }));
        return true;
      });
    }
  });

  // src/background.ts
  var require_background = __commonJS({
    "src/background.ts"() {
      init_preferences();
      init_dictionary();
      init_playground_service();
      var import_action = __toESM(require_action());
      init_mascot_presence();
      var import_preference_writer = __toESM(require_preference_writer());
      init_photo_tab_service();
      init_offscreen_client();
      chrome.commands.onCommand.addListener((command, tab) => {
        if (command !== "photo-lookup") return;
        void (async () => {
          const tabId = tab?.id ?? (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id;
          if (tabId === void 0) return;
          const result = await startPhotoTabLookup(tabId);
          if (result.error) await chrome.tabs.create({ url: chrome.runtime.getURL("playgrounds.html?tool=photo"), windowId: tab?.windowId });
        })().catch(() => {
        });
      });
      var queues = /* @__PURE__ */ new Map();
      function cancel(job) {
        if (job.cancelled) return;
        job.cancelled = true;
        job.respond({ cancelled: true });
        if (job.dispatched) chrome.runtime.sendMessage({ type: "worker-cancel", jobId: job.jobId }).catch(() => {
        });
      }
      async function drain(tabId, queue) {
        queue.running = true;
        try {
          while (queue.jobs.length && !queue.closed) {
            const job = queue.jobs.shift();
            queue.active = job;
            try {
              if (job.cancelled) continue;
              await ensureOffscreen();
              if (job.cancelled || queue.closed) continue;
              job.dispatched = true;
              const result = await chrome.runtime.sendMessage({ type: "worker-job", jobId: job.jobId, key: `${tabId}:${job.purpose}`, texts: job.texts, overrides: job.overrides, includeWords: job.includeWords });
              if (!job.cancelled) job.respond(result);
            } catch (error) {
              if (!job.cancelled) job.respond({ error: String(error) });
            } finally {
              queue.active = void 0;
            }
          }
        } finally {
          queue.running = false;
          if (!queue.jobs.length && queues.get(tabId) === queue) queues.delete(tabId);
        }
      }
      chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (!["tokenize", "cancel-tokenize"].includes(message?.type) || sender.tab?.id === void 0) return;
        if (message.purpose !== void 0 && !["readings", "playground", "mascot"].includes(message.purpose)) {
          respond({ error: "Invalid analysis purpose" });
          return;
        }
        const purpose = message.purpose ?? "readings";
        const tabId = sender.tab.id, owner = sender.documentId ?? `frame:${sender.frameId ?? 0}`;
        let queue = queues.get(tabId);
        if (message.type === "cancel-tokenize") {
          if (queue) {
            for (const job of queue.jobs) if (job.owner === owner && job.purpose === purpose && job.requestId === message.requestId) cancel(job);
            queue.jobs = queue.jobs.filter((job) => !job.cancelled);
            if (queue.active?.owner === owner && queue.active.purpose === purpose && queue.active.requestId === message.requestId) cancel(queue.active);
          }
          respond({ ok: true });
          return;
        }
        if (typeof message.requestId !== "string" || !Array.isArray(message.texts) || message.texts.length > 2e3 || message.texts.some((s) => typeof s !== "string") || message.texts.join("").length > 2e3) {
          respond({ error: "Invalid batch" });
          return;
        }
        if (purpose === "playground" && (!message.texts.length || message.texts.length > 4 || message.texts.some((text) => !text.length || text.length > 40))) {
          respond({ error: "Playground analysis accepts up to four verbs of 40 characters each" });
          return;
        }
        if (purpose === "mascot" && (sender.frameId !== 0 || message.texts.length !== 1 || !message.texts[0].length || message.texts[0].length > 1e3)) {
          respond({ error: "Invalid mascot analysis" });
          return;
        }
        if (!queue) {
          queue = { jobs: [], running: false, closed: false };
          queues.set(tabId, queue);
        }
        for (const job of queue.jobs) if (job.owner === owner && job.purpose === purpose) cancel(job);
        queue.jobs = queue.jobs.filter((job) => !job.cancelled);
        if (queue.active?.owner === owner && queue.active.purpose === purpose) cancel(queue.active);
        if (queue.jobs.length >= 32) {
          respond({ error: "Too many active frames. Try scrolling after other frames settle." });
          return;
        }
        queue.jobs.push({ overrides: purpose === "playground" ? {} : validOverrides(message.overrides), texts: message.texts, includeWords: purpose === "playground" || message.includeWords === true, requestId: message.requestId, owner, purpose, jobId: crypto.randomUUID(), cancelled: false, dispatched: false, respond });
        if (!queue.running) void drain(tabId, queue);
        return true;
      });
      chrome.tabs.onRemoved.addListener((tabId) => {
        const queue = queues.get(tabId);
        if (queue) {
          queue.closed = true;
          for (const job of queue.jobs.splice(0)) cancel(job);
          if (queue.active) cancel(queue.active);
          queues.delete(tabId);
        }
        chrome.runtime.sendMessage({ type: "worker-release", tabId }).catch(() => {
        });
      });
    }
  });
  require_background();
})();
//# sourceMappingURL=background.js.map
