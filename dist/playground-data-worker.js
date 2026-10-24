"use strict";
(() => {
  // src/local-dictionary.ts
  function dictionaryBucket(term) {
    let hash = 2166136261;
    for (const char of term) hash = Math.imul(hash ^ char.codePointAt(0), 16777619) >>> 0;
    return (hash & 255).toString(16).padStart(2, "0");
  }
  var shards = /* @__PURE__ */ new Map();
  var loading = /* @__PURE__ */ new Map();
  var retainedBytes = 0;
  function bundledResourceURL(path) {
    return typeof chrome === "object" && chrome.runtime?.getURL ? chrome.runtime.getURL(path) : new URL(path, self.location.href).href;
  }
  async function loadDictionaryShard(dictionary, bucket) {
    const key = `${dictionary}/${bucket}`;
    const cached = shards.get(key);
    if (cached) {
      shards.delete(key);
      shards.set(key, cached);
      return cached.value;
    }
    let job = loading.get(key);
    if (!job) {
      job = (async () => {
        const response = await fetch(bundledResourceURL(`dictionaries/${dictionary}/${bucket}.json.gz`));
        if (!response.ok || !response.body) throw new Error("Local dictionary unavailable");
        const text = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text(), value = JSON.parse(text);
        if (!value.terms || !value.entries) throw new Error("Invalid dictionary shard");
        const bytes = text.length * 2;
        shards.set(key, { value, bytes });
        retainedBytes += bytes;
        while (shards.size > 16 || retainedBytes > 8 * 1024 * 1024) {
          const key2 = shards.keys().next().value;
          retainedBytes -= shards.get(key2).bytes;
          shards.delete(key2);
        }
        return value;
      })().finally(() => loading.delete(key));
      loading.set(key, job);
    }
    return job;
  }

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

  // src/shared.ts
  var hiragana = (text) => text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96));

  // src/playground-data-worker.ts
  var index;
  var normalize = (text) => hiragana(text.normalize("NFKC")).toLocaleLowerCase("en").trim();
  async function localJSON(path, compressed = false) {
    const response = await fetch(bundledResourceURL(path));
    if (!response.ok || !response.body) throw new Error("Local playground data is unavailable. Try again.");
    return JSON.parse(compressed ? await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text() : await response.text());
  }
  function searchIndex() {
    return index ??= localJSON("dictionaries/jmdict/search.json.gz", true).catch((error) => {
      index = void 0;
      throw error;
    });
  }
  var grammar;
  var points = /* @__PURE__ */ new Map();
  function lowerBound(terms, value) {
    let lo = 0, hi = terms.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (terms[mid][0] < value) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  async function queryPlayground(query) {
    if (query.op === "search") {
      const data = await searchIndex(), q = normalize(query.query);
      if (!q) return { hits: [], total: 0 };
      const scores = /* @__PURE__ */ new Map();
      if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(q)) {
        let start = lowerBound(data.terms, q);
        while (start < data.terms.length && data.terms[start][0].startsWith(q)) {
          const [term, id] = data.terms[start++], score = term === q ? normalize(data.entries[id].headword) === q ? 0 : 1 : 2;
          scores.set(id, Math.min(scores.get(id) ?? Infinity, score));
        }
      } else {
        const tokens = q.match(/[\p{L}\p{N}]+/gu) ?? [];
        let ids2, exactIds;
        for (const token of tokens) {
          const exact = new Set(data.english[token] ?? []), matches = new Set(exact);
          exactIds = exactIds ? new Set([...exactIds].filter((id) => exact.has(id))) : exact;
          if (token === tokens.at(-1) && token.length >= 2) {
            for (const key of Object.keys(data.english)) if (key.startsWith(token)) for (const id of data.english[key]) matches.add(id);
          }
          ids2 = ids2 ? new Set([...ids2].filter((id) => matches.has(id))) : matches;
        }
        for (const id of ids2 ?? []) scores.set(id, exactIds?.has(id) ? normalize(data.entries[id].meaning).split(";").some((gloss) => gloss.replace(/\([^)]*\)/g, "").trim() === q) ? 0 : 1 : 2);
      }
      const seen = /* @__PURE__ */ new Set();
      const ids = [...scores.keys()].sort((a, b) => scores.get(a) - scores.get(b) || Number(data.entries[b].common) - Number(data.entries[a].common) || Number(data.entries[a].id) - Number(data.entries[b].id)).filter((id) => {
        const key = data.entries[id].id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return { hits: ids.slice(query.offset, query.offset + 30).map((id) => data.entries[id]), total: ids.length };
    }
    if (query.op === "entry") {
      const shard = await loadDictionaryShard("jmdict", query.bucket);
      const entry = shard.entries[query.id];
      if (!entry) throw new Error("This dictionary entry is unavailable.");
      return entry;
    }
    if (query.op === "japanese") return await localJapaneseDefinition(query.word) ?? { status: "missing", definitions: [], source: "jawiktionary" };
    if (query.op === "grammar-index") return grammar ??= localJSON("grammar/index.json").catch((error) => {
      grammar = void 0;
      throw error;
    });
    if (query.op === "grammar") {
      if (points.has(query.id)) return points.get(query.id);
      const point = await localJSON(`grammar/points/${query.id}.json`);
      points.set(query.id, point);
      while (points.size > 24) points.delete(points.keys().next().value);
      return point;
    }
    if (query.op === "comparison") return localJSON(`grammar/comparisons/${query.id}.json`);
    throw new Error("Unsupported local playground request.");
  }
  self.onmessage = async ({ data }) => {
    try {
      self.postMessage({ id: data.id, value: await queryPlayground(data.query) });
    } catch (error) {
      self.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Local playground data is unavailable." });
    }
  };
})();
//# sourceMappingURL=playground-data-worker.js.map
