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

  // src/offscreen.ts
  var require_offscreen = __commonJS({
    "src/offscreen.ts"() {
      init_wiktionary_parser();
      var worker = new Worker(chrome.runtime.getURL("tokenizer.js"));
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
