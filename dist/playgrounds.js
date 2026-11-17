"use strict";
(() => {
  var __defProp = Object.defineProperty;
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
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/ui-theme.ts
  var uiTheme;
  var init_ui_theme = __esm({
    "src/ui-theme.ts"() {
      "use strict";
      uiTheme = `:root,:host{
  color-scheme:light;
  --ink:#242b2d;--muted:#625d50;--accent:#234e64;--seal:#9f3e2d;
  --paper:#f4ecd8;--surface:#e6d8b9;--line:#242b2d;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
  --body:system-ui,-apple-system,"Hiragino Sans","Yu Gothic",sans-serif;
}
*{box-sizing:border-box}
button,input,select{border-radius:0}
button.primary{background:var(--seal);color:var(--paper)}
button.primary:hover{background:var(--ink)}
button:disabled{opacity:.45;cursor:default}
button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{
  outline:3px solid var(--accent);outline-offset:3px;
}
[hidden]{display:none!important}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
`;
    }
  });

  // src/shared.ts
  function align(surface, raw) {
    if (!kanji.test(surface) || !raw || raw === "*") return [];
    const reading = hiragana(raw);
    const runs = [...surface.matchAll(/[\p{Script=Han}々〆ヵヶ]+|[^\p{Script=Han}々〆ヵヶ]+/gu)];
    let cursor = 0;
    const out = [];
    for (let i = 0; i < runs.length; i++) {
      const run = runs[i], value = run[0];
      if (!kanji.test(value)) {
        const kana2 = hiragana(value);
        if (!reading.startsWith(kana2, cursor)) return [{ start: 0, end: surface.length, reading }];
        cursor += kana2.length;
      } else {
        const next = runs[i + 1];
        let end = reading.length;
        if (next) {
          const anchor = hiragana(next[0]);
          end = reading.indexOf(anchor, cursor + 1);
          if (end < 0 || reading.indexOf(anchor, end + 1) !== -1) return [{ start: 0, end: surface.length, reading }];
        }
        if (end <= cursor) return [{ start: 0, end: surface.length, reading }];
        out.push({ start: run.index, end: run.index + value.length, reading: reading.slice(cursor, end) });
        cursor = end;
      }
    }
    return cursor === reading.length ? out : [{ start: 0, end: surface.length, reading }];
  }
  var hiragana, kanji;
  var init_shared = __esm({
    "src/shared.ts"() {
      "use strict";
      hiragana = (text) => text.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96));
      kanji = /[\p{Script=Han}々〆ヵヶ]/u;
    }
  });

  // src/adjective-playground.ts
  function valid(base) {
    return japanese.test(base.lemma) && base.lemma.length <= 40 && /^[\p{Script=Hiragana}ー]+$/u.test(base.reading) && (base.kind === "na" || base.kind === "i" && base.lemma.endsWith("\u3044") && base.reading.endsWith("\u3044"));
  }
  function stem(value, base) {
    if (["\u3044\u3044", "\u3088\u3044", "\u826F\u3044"].includes(value)) return value === "\u826F\u3044" ? "\u826F" : "\u3088";
    if (base.goodCompound && value.endsWith("\u3044\u3044")) return value.slice(0, -2) + "\u3088";
    return value.slice(0, -1);
  }
  function render(value, base, s) {
    const i = base.kind === "i", root = i ? stem(value, base) : value;
    const adverb = root + (i ? "\u304F" : "\u306B");
    if (s.family === "prenominal") return value + (i ? "" : "\u306A");
    if (s.family === "adverbial") return adverb;
    if (s.family === "linking") return root + (i ? "\u304F\u3066" : "\u3067");
    if (s.family === "conditional") return root + (s.negative ? i ? "\u304F\u306A\u3051\u308C\u3070" : "\u3067\u306F\u306A\u3051\u308C\u3070" : i ? "\u3051\u308C\u3070" : "\u306A\u3089");
    if (s.family === "conditionalTara") return root + (s.negative ? i ? "\u304F\u306A\u304B\u3063\u305F\u3089" : "\u3067\u306F\u306A\u304B\u3063\u305F\u3089" : i ? "\u304B\u3063\u305F\u3089" : "\u3060\u3063\u305F\u3089");
    if (s.family === "become" || s.family === "make") {
      const become = s.family === "become";
      const ending = s.polite ? s.negative ? s.past ? "\u307E\u305B\u3093\u3067\u3057\u305F" : "\u307E\u305B\u3093" : s.past ? "\u307E\u3057\u305F" : "\u307E\u3059" : s.negative ? s.past ? "\u306A\u304B\u3063\u305F" : "\u306A\u3044" : s.past ? become ? "\u3063\u305F" : "\u305F" : become ? "\u308B" : "\u308B";
      return adverb + (s.polite ? become ? "\u306A\u308A" : "\u3057" : s.negative ? become ? "\u306A\u3089" : "\u3057" : s.past ? become ? "\u306A" : "\u3057" : become ? "\u306A" : "\u3059") + ending;
    }
    if (i) return (s.negative ? root + (s.past ? "\u304F\u306A\u304B\u3063\u305F" : "\u304F\u306A\u3044") : s.past ? root + "\u304B\u3063\u305F" : value) + (s.polite ? "\u3067\u3059" : "");
    return root + (s.polite ? s.negative ? s.past ? "\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3067\u3057\u305F" : "\u3067\u306F\u3042\u308A\u307E\u305B\u3093" : s.past ? "\u3067\u3057\u305F" : "\u3067\u3059" : s.negative ? s.past ? "\u3067\u306F\u306A\u304B\u3063\u305F" : "\u3067\u306F\u306A\u3044" : s.past ? "\u3060\u3063\u305F" : "\u3060");
  }
  function adjectiveConstruction(base, state) {
    const i = base.kind === "i", root = i ? stem(base.lemma, base) : base.lemma;
    const rules2 = { simple: i ? "Keep \u3044 in the affirmative nonpast; otherwise replace it with \u304B\u3063\u305F, \u304F\u306A\u3044, or \u304F\u306A\u304B\u3063\u305F. Add \u3067\u3059 for polite speech." : "Add \u3060\uFF0F\u3067\u3059; use \u3060\u3063\u305F\uFF0F\u3067\u3057\u305F for past, and \u3067\u306F\u306A\u3044\uFF0F\u3067\u306F\u3042\u308A\u307E\u305B\u3093 for negatives.", prenominal: i ? "Keep the dictionary form before a noun." : "Add \u306A before a noun.", adverbial: i ? "Replace final \u3044 with \u304F to modify an action." : "Add \u306B to modify an action.", linking: i ? "Replace final \u3044 with \u304F\u3066 to connect descriptions." : "Add \u3067 to connect descriptions.", conditional: i ? "Replace final \u3044 with \u3051\u308C\u3070; for a negative condition use \u304F\u306A\u3051\u308C\u3070." : "Add \u306A\u3089; for a negative condition use \u3067\u306F\u306A\u3051\u308C\u3070.", conditionalTara: i ? "Replace final \u3044 with \u304B\u3063\u305F\u3089; for a negative condition use \u304F\u306A\u304B\u3063\u305F\u3089." : "Add \u3060\u3063\u305F\u3089; for a negative condition use \u3067\u306F\u306A\u304B\u3063\u305F\u3089.", become: i ? "Replace final \u3044 with \u304F and add \u306A\u308B. Conjugate \u306A\u308B for tense, negation, and politeness." : "Add \u306B and \u306A\u308B. Conjugate \u306A\u308B for tense, negation, and politeness.", make: i ? "Replace final \u3044 with \u304F and add \u3059\u308B. Conjugate \u3059\u308B for tense, negation, and politeness." : "Add \u306B and \u3059\u308B. Conjugate \u3059\u308B for tense, negation, and politeness." };
    const irregular = i && (base.reading === "\u3044\u3044" || base.goodCompound) && !["prenominal"].includes(state.family) && !(state.family === "simple" && !state.past && !state.negative);
    return `${base.lemma} \u2192 ${render(base.lemma, base, state)}. ${irregular ? `\u3044\u3044 changes to the \u3088\u3044 stem (${root}). ` : ""}${rules2[state.family]}`;
  }
  function createAdjectivePlayground(base, source2) {
    if (!valid(base)) throw new Error("Unsupported dictionary adjective");
    const forms = [];
    for (const family of adjectiveFamilies) for (const past of family.controls.includes("past") ? [false, true] : [false]) for (const negative of family.controls.includes("negative") ? [false, true] : [false]) for (const polite of family.controls.includes("polite") ? [false, true] : [false]) {
      const state = { family: family.id, past, negative, polite, spoken: false };
      forms.push({ ...state, id: [family.id, +past, +negative, +polite].join(":"), text: render(base.lemma, base, state), reading: render(base.reading, { ...base, lemma: base.reading }, state) });
    }
    const text = source2?.text ?? base.lemma, reading = source2?.reading ?? base.reading;
    const aliases = [];
    for (const form of forms) {
      if (base.kind === "na" && form.text.includes("\u3067\u306F")) aliases.push({ ...form, text: form.text.replace("\u3067\u306F", "\u3058\u3083"), reading: form.reading.replace("\u3067\u306F", "\u3058\u3083") });
      if (base.kind === "i" && form.family === "simple" && form.polite && form.negative) aliases.push({ ...form, text: stem(base.lemma, base) + (form.past ? "\u304F\u3042\u308A\u307E\u305B\u3093\u3067\u3057\u305F" : "\u304F\u3042\u308A\u307E\u305B\u3093"), reading: stem(base.reading, base) + (form.past ? "\u304F\u3042\u308A\u307E\u305B\u3093\u3067\u3057\u305F" : "\u304F\u3042\u308A\u307E\u305B\u3093") });
    }
    const matches2 = text === base.lemma && reading === base.reading ? [forms[0]] : [...forms, ...aliases].filter((form) => form.text === text && form.reading === reading);
    if (!matches2.length) throw new Error("Unsupported adjective source form");
    const initial = matches2.find((x) => x.family === "simple") ?? matches2[0];
    return { start: source2?.start ?? 0, end: source2?.end ?? text.length, source: text, sourceReading: reading, lemma: base.lemma, base, forms, initial: { ...initial }, sourceMatches: matches2, requiresChoice: false };
  }
  function bases(word) {
    if (word.adjectiveBases?.length) return word.adjectiveBases.filter(valid);
    if (word.pos === "\u5F62\u5BB9\u8A5E" && word.posDetail === "\u81EA\u7ACB" && word.lemmaReading) return [{ lemma: word.lemma, reading: hiragana(word.lemmaReading), kind: "i", ...word.verbClass === "\u4E0D\u5909\u5316\u578B" && word.lemma.endsWith("\u3044\u3044") ? { goodCompound: true } : {} }].filter(valid);
    if (word.pos === "\u540D\u8A5E" && word.posDetail === "\u5F62\u5BB9\u52D5\u8A5E\u8A9E\u5E79") return [{ lemma: word.lemma, reading: hiragana(word.reading), kind: "na" }].filter(valid);
    return [];
  }
  function dictionaryAdjectiveCandidates(input, words) {
    if (words.length !== 1 || words[0].start !== 0 || words[0].end !== input.length) return [];
    return bases(words[0]).filter((base) => base.lemma === input);
  }
  function buildAdjectivePlayground(text, words, wordIndex) {
    if (!Number.isInteger(wordIndex) || wordIndex < 0 || wordIndex >= words.length) return;
    let best;
    for (let start = Math.max(0, wordIndex - 11); start <= wordIndex; start++) for (const base of bases(words[start])) {
      const first = words[start];
      if (first.pos === "\u52A9\u52D5\u8A5E") continue;
      const prev = words[start - 1];
      if (prev && prev.end === first.start && (prev.pos === "\u52D5\u8A5E" || prev.pos === "\u5F62\u5BB9\u8A5E" || ["\u3066", "\u3067"].includes(text.slice(prev.start, prev.end)))) continue;
      let reading = "";
      for (let end = start; end < Math.min(words.length, start + 12); end++) {
        const word = words[end];
        if (word.start < 0 || word.end <= word.start || word.end > text.length || word.end - first.start > 80 || end > start && words[end - 1].end !== word.start) break;
        reading += hiragana(word.reading);
        if (end < wordIndex) continue;
        const next = words[end + 1], adjacent = next && next.start === word.end;
        if (adjacent && (next.pos === "\u52A9\u52D5\u8A5E" || next.pos === "\u52D5\u8A5E" || next.pos === "\u5F62\u5BB9\u8A5E" || ["\u3066", "\u3067", "\u3070", "\u305F\u3089", "\u306A\u3089"].includes(text.slice(next.start, next.end)))) continue;
        try {
          const model2 = createAdjectivePlayground(base, { text: text.slice(first.start, word.end), reading, start: first.start, end: word.end });
          if (adjacent && ["\u306F", "\u3082"].includes(text.slice(next.start, next.end)) && ["linking", "adverbial"].includes(model2.initial.family)) continue;
          if (!best || model2.start < best.start || model2.start === best.start && model2.end > best.end) best = model2;
        } catch {
        }
      }
    }
    return best;
  }
  var finite, adjectiveFamilies, japanese;
  var init_adjective_playground = __esm({
    "src/adjective-playground.ts"() {
      "use strict";
      init_shared();
      finite = ["past", "negative", "polite"];
      adjectiveFamilies = [
        { id: "simple", label: "Basic predicate", group: "Everyday forms", description: "Describe a quality or state. Nonpast can describe the present or future.", controls: finite },
        { id: "prenominal", label: "Before a noun", group: "Everyday forms", description: "Place this form immediately before a noun. The noun is not supplied here.", controls: [] },
        { id: "adverbial", label: "Modify an action: \uFF5E\u304F\uFF0F\uFF5E\u306B", group: "Everyday forms", description: "Describe how an action is done. Whether it makes sense depends on the adjective and action.", controls: [] },
        { id: "linking", label: "Connect: \uFF5E\u304F\u3066\uFF0F\uFF5E\u3067", group: "Everyday forms", description: "Link descriptions, sometimes giving a reason. This does not choose the relationship for your sentence.", controls: [] },
        { id: "conditional", label: "If: \uFF5E\u3051\u308C\u3070\uFF0F\uFF5E\u306A\u3089", group: "Conditions", description: "Set a condition. \u306A-adjectives use \u306A\u3089; these patterns are not interchangeable in every context.", controls: ["negative"] },
        { id: "conditionalTara", label: "If or when: \uFF5E\u305F\u3089", group: "Conditions", description: "Set a condition or describe when something happens; \u305F does not independently mean past here.", controls: ["negative"] },
        { id: "become", label: "Become: \uFF5E\u304F\u306A\u308B\uFF0F\uFF5E\u306B\u306A\u308B", group: "Changes of state", description: "Describe becoming this way. Switches change \u306A\u308B, the verb of change.", controls: finite },
        { id: "make", label: "Make: \uFF5E\u304F\u3059\u308B\uFF0F\uFF5E\u306B\u3059\u308B", group: "Changes of state", description: "Describe making something this way. Switches change \u3059\u308B; participants may need different particles.", controls: finite }
      ];
      japanese = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ー]+$/u;
    }
  });

  // node_modules/kamiya-codec/dist/kamiya.min.mjs
  function N(r, e) {
    if (e < 0 || e > 4) throw new Error("vowel must be between 0 and 4");
    let n = k.get(r);
    if (typeof n == "undefined") throw new Error("unknown character");
    let a = A[n][e];
    if (a.length === 0) throw new Error("vowel for kana does not exist");
    return a;
  }
  function m(r, e) {
    {
      if (r === "\u3059\u308B") return H(r, e);
      if (r === "\u304F\u308B" || r === "\u6765\u308B") return R(r, e);
      if (r === "\u3060") return O(r, e);
      if (r === "\u3067\u3059") return Z(r, e);
      if (r.endsWith("\u304F\u3060\u3055\u308B")) {
        if (e === "Dictionary") return [r];
        if (e === "Conjunctive") return [r.slice(0, -2) + "\u3055\u3044"];
        throw new Error("unknown conjugation for -kudasaru");
      }
      let i = j.get(r);
      if (i && i.has(e)) return [i.get(e) || ""];
    }
    let n = r.slice(0, -1), a = r.slice(-1), t = C.get(e === "Imperative" ? "Conditional" : e);
    if (typeof t == "undefined") throw new Error("Conjugation not yet implemented");
    if (t < 5) return a === "\u3046" ? t === 0 ? [n + "\u308F"] : [n + N("\u3042", t)] : [n + N(a, t)];
    let u = t - 5, o = U.get(r === "\u884C\u304F" || r === "\u3044\u304F" ? "\u3064" : a);
    if (!o) throw new Error("Unknown verb ending. Is it in dictionary form?");
    return [n + o[u]];
  }
  function y(r, e) {
    if (r === "\u3059\u308B") return H(r, e);
    if (r === "\u304F\u308B" || r === "\u6765\u308B") return R(r, e);
    if (r === "\u3060") return O(r, e);
    if (r === "\u3067\u3059") return Z(r, e);
    let n = r.slice(0, -1);
    switch (e) {
      case "Negative":
      case "Zu":
      case "Nu":
        return [n];
      case "Conjunctive":
        return [n];
      case "Dictionary":
        return [r];
      case "Conditional":
        return [n + "\u308C"];
      case "Imperative":
        return [n + "\u308D", n + "\u3088"];
      case "Volitional":
        return [n + "\u3088\u3046"];
      case "Te":
        return [n + "\u3066"];
      case "Ta":
        return [n + "\u305F"];
      case "Tara":
        return [n + "\u305F\u3089"];
      case "Tari":
        return [n + "\u305F\u308A"];
      default:
        throw new Error("Unhandled conjugation");
    }
  }
  function R(r, e) {
    let n = "";
    switch (e) {
      case "Negative":
      case "Zu":
      case "Nu":
        n = "\u3053";
        break;
      case "Conjunctive":
        n = "\u304D";
        break;
      case "Dictionary":
        n = "\u304F\u308B";
        break;
      case "Conditional":
        n = "\u304F\u308C";
        break;
      case "Imperative":
        n = "\u3053\u3044";
        break;
      case "Volitional":
        n = "\u3053\u3088\u3046";
        break;
      case "Te":
        n = "\u304D\u3066";
        break;
      case "Ta":
        n = "\u304D\u305F";
        break;
      case "Tara":
        n = "\u304D\u305F\u3089";
        break;
      case "Tari":
        n = "\u304D\u305F\u308A";
        break;
      default:
        throw new Error("Unhandled conjugation");
    }
    let a = r.slice(0, -1);
    if (a === "\u304F") return [n];
    if (a === "\u6765") return ["\u6765" + n.slice(1)];
    throw new Error("Expected input to be \u6765\u308B or \u304F\u308B");
  }
  function H(r, e) {
    switch (e) {
      case "Negative":
        return ["\u3057"];
      case "Conjunctive":
        return ["\u3057"];
      case "Dictionary":
        return ["\u3059\u308B"];
      case "Conditional":
        return ["\u3059\u308C"];
      case "Imperative":
        return ["\u3057\u308D", "\u305B\u3088"];
      case "Volitional":
        return ["\u3057\u3088\u3046"];
      case "Te":
        return ["\u3057\u3066"];
      case "Ta":
        return ["\u3057\u305F"];
      case "Tara":
        return ["\u3057\u305F\u3089"];
      case "Tari":
        return ["\u3057\u305F\u308A"];
      case "Zu":
        return ["\u305B\u305A"];
      case "Nu":
        return ["\u305B\u306C"];
      default:
        throw new Error("Unhandled conjugation");
    }
  }
  function O(r, e) {
    switch (e) {
      case "Negative":
        return ["\u3067\u306A\u3044", "\u3067\u306F\u306A\u3044", "\u3058\u3083\u306A\u3044"];
      case "Dictionary":
        return ["\u3060"];
      case "Conditional":
        return ["\u306A\u3089"];
      case "Te":
        return ["\u3067"];
      case "Ta":
        return ["\u3060\u3063\u305F"];
      case "Tara":
        return ["\u3060\u3063\u305F\u3089"];
      case "Tari":
        return ["\u3060\u3063\u305F\u308A"];
      default:
        throw new Error("Unhandled conjugation");
    }
  }
  function Z(r, e) {
    switch (e) {
      case "Negative":
        return ["\u3067\u3042\u308A\u307E\u305B\u3093", "\u3067\u306F\u3042\u308A\u307E\u305B\u3093"];
      case "Dictionary":
        return ["\u3067\u3059"];
      case "Te":
        return ["\u3067\u3057\u3066"];
      case "Ta":
        return ["\u3067\u3057\u305F"];
      case "Tara":
        return ["\u3067\u3057\u305F\u3089"];
      case "Tari":
        return ["\u3067\u3057\u305F\u308A"];
      default:
        throw new Error("Unhandled conjugation");
    }
  }
  var f, A, k, T, V, j, C, P, K, W, U;
  var init_kamiya_min = __esm({
    "node_modules/kamiya-codec/dist/kamiya.min.mjs"() {
      f = (r) => r.split("");
      A = [f("\u3042\u3044\u3046\u3048\u304A"), f("\u304B\u304D\u304F\u3051\u3053"), f("\u304C\u304E\u3050\u3052\u3054"), f("\u3055\u3057\u3059\u305B\u305D"), f("\u3056\u3058\u305A\u305C\u305E"), f("\u305F\u3061\u3064\u3066\u3068"), f("\u3060\u3062\u3065\u3067\u3069"), f("\u306A\u306B\u306C\u306D\u306E"), f("\u306F\u3072\u3075\u3078\u307B"), f("\u3070\u3073\u3076\u3079\u307C"), f("\u3071\u3074\u3077\u307A\u307D"), f("\u307E\u307F\u3080\u3081\u3082"), ["\u3084", "", "\u3086", "", "\u3088"], f("\u3089\u308A\u308B\u308C\u308D"), ["\u308F", "", "", "", "\u3092"], ["\u3093", "", "", "", ""]];
      k = /* @__PURE__ */ new Map([]);
      A.forEach((r, e) => {
        r.forEach((n) => {
          n.length > 0 && k.set(n, e);
        });
      });
      T = ["Negative", "Conjunctive", "Dictionary", "Conditional", "Imperative", "Volitional", "Te", "Ta", "Tara", "Tari", "Zu", "Nu"];
      V = [["\u3042\u308B", "Negative", ""], ["\u3054\u3056\u308B", "Conjunctive", "\u3054\u3056\u3044"], ["\u3044\u3089\u3063\u3057\u3083\u308B", "Conjunctive", "\u3044\u3089\u3063\u3057\u3083\u3044"], ["\u3044\u3089\u3063\u3057\u3083\u308B", "Conditional", "\u3044\u3089\u3063\u3057\u3083\u3044"], ["\u3044\u3089\u3063\u3057\u3083\u308B", "Imperative", "\u3044\u3089\u3063\u3057\u3083\u3044"]];
      j = /* @__PURE__ */ new Map([]);
      for (let [r, e, n] of V) {
        let a = j.get(r);
        a ? a.set(e, n) : j.set(r, /* @__PURE__ */ new Map([[e, n]]));
      }
      C = new Map(T.filter((r) => r !== "Imperative").map((r, e) => [r, e]));
      C.set("Zu", (P = C.get("Negative")) != null ? P : -1);
      C.set("Nu", (K = C.get("Negative")) != null ? K : -1);
      W = [["\u304F", ["\u3044\u3066", "\u3044\u305F", "\u3044\u305F\u3089", "\u3044\u305F\u308A"]], ["\u3050", ["\u3044\u3067", "\u3044\u3060", "\u3044\u3060\u3089", "\u3044\u3060\u308A"]], ["\u3059", ["\u3057\u3066", "\u3057\u305F", "\u3057\u305F\u3089", "\u3057\u305F\u308A"]], ["\u306C", ["\u3093\u3067", "\u3093\u3060", "\u3093\u3060\u3089", "\u3093\u3060\u308A"]], ["\u3076", ["\u3093\u3067", "\u3093\u3060", "\u3093\u3060\u3089", "\u3093\u3060\u308A"]], ["\u3080", ["\u3093\u3067", "\u3093\u3060", "\u3093\u3060\u3089", "\u3093\u3060\u308A"]], ["\u3064", ["\u3063\u3066", "\u3063\u305F", "\u3063\u305F\u3089", "\u3063\u305F\u308A"]], ["\u308B", ["\u3063\u3066", "\u3063\u305F", "\u3063\u305F\u3089", "\u3063\u305F\u308A"]], ["\u3046", ["\u3063\u3066", "\u3063\u305F", "\u3063\u305F\u3089", "\u3063\u305F\u308A"]]];
      U = /* @__PURE__ */ new Map([]);
      for (let [r, e] of W) U.set(r, e);
    }
  });

  // src/verb-playground.ts
  function validBase(base) {
    if (!base.lemma || base.lemma.length > 40 || !japanese2.test(base.lemma) || !kana.test(base.reading) || helperLemmas.has(base.lemma) || irregularLexemes.has(base.lemma)) return false;
    if (base.prefix && (!japanese2.test(base.prefix) || !base.prefixReading || !kana.test(base.prefixReading) || base.lemma !== "\u3059\u308B" || (base.prefix + base.lemma).length > 40)) return false;
    if (base.verbClass === "\u4E00\u6BB5") return base.lemma.endsWith("\u308B") && base.reading.endsWith("\u308B");
    if (base.verbClass === "\u30B5\u5909\u30FB\u30B9\u30EB") return base.lemma === "\u3059\u308B" && base.reading === "\u3059\u308B";
    if (base.verbClass === "\u30AB\u5909\u30FB\u6765\u30EB" || base.verbClass === "\u30AB\u5909\u30FB\u30AF\u30EB") return ["\u6765\u308B", "\u304F\u308B"].includes(base.lemma) && base.reading === "\u304F\u308B";
    return godan.has(base.verbClass) && /[うくぐすつぬぶむる]$/u.test(base.lemma);
  }
  function wordBase(word) {
    if (word.pos !== "\u52D5\u8A5E" || word.posDetail !== "\u81EA\u7ACB" || !word.verbForm || !word.lemmaReading || !word.verbClass) return;
    const base = { lemma: word.lemma, reading: hiragana(word.lemmaReading), verbClass: word.verbClass };
    return validBase(base) ? base : void 0;
  }
  function restrictVerbBase(base) {
    return { ...base, restricted: true };
  }
  function verbBaseText(base) {
    return (base.prefix ?? "") + base.lemma;
  }
  function verbBaseReading(base) {
    return (base.prefixReading ?? "") + base.reading;
  }
  function elementary(base, conj) {
    if (base.verbClass === "\u4E94\u6BB5\u30FB\u30AB\u884C\u4FC3\u97F3\u4FBF" && (conj === "Te" || conj === "Ta")) {
      const ending = conj === "Te" ? "\u3063\u3066" : "\u3063\u305F";
      return { text: base.lemma.slice(0, -1) + ending, reading: base.reading.slice(0, -1) + ending };
    }
    if (base.reading === "\u3042\u308B" && ["\u3042\u308B", "\u6709\u308B", "\u5728\u308B"].includes(base.lemma) && conj === "Negative") return { text: "", reading: "" };
    if (godan.has(base.verbClass)) {
      const prefix = "\u4EEE";
      const a2 = m(prefix + base.lemma, conj), b2 = m(prefix + base.reading, conj);
      if (a2.length !== 1 || b2.length !== 1) throw new Error("Ambiguous godan form");
      return { text: a2[0].slice(prefix.length), reading: b2[0].slice(prefix.length) };
    }
    const fn = base.verbClass === "\u4E00\u6BB5" ? y : m;
    const a = fn(base.lemma, conj), b = fn(base.reading, conj);
    if (conj === "Imperative" && a.length > 1 && b.length > 1) return { text: a[0], reading: b[0] };
    if (a.length !== 1 || b.length !== 1) throw new Error("Ambiguous elementary form");
    return { text: a[0], reading: b[0] };
  }
  function add(pair, suffix) {
    return { text: pair.text + suffix, reading: pair.reading + suffix };
  }
  function derived(base, family, spoken) {
    const make = (pair, verbClass = "\u4E00\u6BB5") => ({ lemma: pair.text, reading: pair.reading, verbClass });
    const negative = () => elementary(base, "Negative");
    if (family === "potential") {
      if (isSuru(base)) return make({ text: "\u3067\u304D\u308B", reading: "\u3067\u304D\u308B" });
      if (isKuru(base)) return make(add(negative(), "\u3089\u308C\u308B"));
      return make(add(elementary(base, base.verbClass === "\u4E00\u6BB5" ? "Negative" : "Conditional"), base.verbClass === "\u4E00\u6BB5" ? "\u3089\u308C\u308B" : "\u308B"));
    }
    if (family === "passive") return make(isSuru(base) ? { text: "\u3055\u308C\u308B", reading: "\u3055\u308C\u308B" } : add(negative(), base.verbClass === "\u4E00\u6BB5" || isKuru(base) ? "\u3089\u308C\u308B" : "\u308C\u308B"));
    if (family === "causative" || family === "causativePassive") {
      const pair = isSuru(base) ? { text: "\u3055\u305B\u308B", reading: "\u3055\u305B\u308B" } : add(negative(), base.verbClass === "\u4E00\u6BB5" || isKuru(base) ? "\u3055\u305B\u308B" : "\u305B\u308B");
      return make(family === "causativePassive" ? { text: pair.text.slice(0, -1) + "\u3089\u308C\u308B", reading: pair.reading.slice(0, -1) + "\u3089\u308C\u308B" } : pair);
    }
    const te2 = elementary(base, "Te");
    if (family === "teIru") return make(add(te2, "\u3044\u308B"));
    if (family === "teMiru") return make(add(te2, "\u307F\u308B"));
    if (family === "teOku") return make(spoken ? { text: te2.text.slice(0, -1) + (te2.text.endsWith("\u3067") ? "\u3069\u304F" : "\u3068\u304F"), reading: te2.reading.slice(0, -1) + (te2.reading.endsWith("\u3067") ? "\u3069\u304F" : "\u3068\u304F") } : add(te2, "\u304A\u304F"), "\u4E94\u6BB5\u30FB\u30AB\u884C\u30A4\u97F3\u4FBF");
    if (family === "teShimau") return make(spoken ? { text: te2.text.slice(0, -1) + (te2.text.endsWith("\u3067") ? "\u3058\u3083\u3046" : "\u3061\u3083\u3046"), reading: te2.reading.slice(0, -1) + (te2.reading.endsWith("\u3067") ? "\u3058\u3083\u3046" : "\u3061\u3083\u3046") } : add(te2, "\u3057\u307E\u3046"), "\u4E94\u6BB5\u30FB\u30EF\u884C\u4FC3\u97F3\u4FBF");
    return base;
  }
  function finiteForm(base, state) {
    if (state.polite) return add(elementary(base, "Conjunctive"), state.negative ? state.past ? "\u307E\u305B\u3093\u3067\u3057\u305F" : "\u307E\u305B\u3093" : state.past ? "\u307E\u3057\u305F" : "\u307E\u3059");
    if (state.negative) return add(elementary(base, "Negative"), state.past ? "\u306A\u304B\u3063\u305F" : "\u306A\u3044");
    return elementary(base, state.past ? "Ta" : "Dictionary");
  }
  function generate(base, state) {
    const family = state.family;
    if (family === "desire") return add(elementary(base, "Conjunctive"), (state.negative ? state.past ? "\u305F\u304F\u306A\u304B\u3063\u305F" : "\u305F\u304F\u306A\u3044" : state.past ? "\u305F\u304B\u3063\u305F" : "\u305F\u3044") + (state.polite ? "\u3067\u3059" : ""));
    if (family === "te") return state.negative ? add(elementary(base, "Negative"), "\u306A\u304F\u3066") : elementary(base, "Te");
    if (family === "without") return add(elementary(base, "Negative"), "\u306A\u3044\u3067");
    if (family === "conditionalBa") return add(elementary(base, state.negative ? "Negative" : "Conditional"), state.negative ? "\u306A\u3051\u308C\u3070" : "\u3070");
    if (family === "conditionalTara") return add(finiteForm(base, { ...state, past: true }), "\u3089");
    if (family === "volitional") {
      if (state.polite) return add(elementary(base, "Conjunctive"), "\u307E\u3057\u3087\u3046");
      const stem2 = elementary(base, "Volitional");
      return base.verbClass === "\u4E00\u6BB5" || isSuru(base) || isKuru(base) ? stem2 : add(stem2, "\u3046");
    }
    if (family === "request") return state.negative ? add(elementary(base, "Negative"), "\u306A\u3044\u3067\u304F\u3060\u3055\u3044") : add(elementary(base, "Te"), "\u304F\u3060\u3055\u3044");
    if (family === "imperative") return elementary(base, "Imperative");
    if (family === "prohibition") return add(elementary(base, "Dictionary"), "\u306A");
    const target = derived(base, family, state.spoken), pair = finiteForm(target, state);
    if (family === "teIru" && state.spoken) {
      const te2 = elementary(base, "Te");
      return { text: te2.text + pair.text.slice(te2.text.length + 1), reading: te2.reading + pair.reading.slice(te2.reading.length + 1) };
    }
    return pair;
  }
  function stateId(state) {
    return [state.family, +state.past, +state.negative, +state.polite, +state.spoken].join(":");
  }
  function formsFor(base) {
    if (!validBase(base)) return [];
    const restricted = base.restricted || lexicalRestrictions.has(base.lemma) || base.reading === "\u3042\u308B" && ["\u3042\u308B", "\u6709\u308B", "\u5728\u308B"].includes(base.lemma);
    const out = [];
    for (const family of verbFamilies) {
      if (restricted && !restrictedFamilies.has(family.id)) continue;
      for (const past of family.controls.includes("past") ? [false, true] : [false]) for (const negative of family.controls.includes("negative") ? [false, true] : [false]) for (const polite of family.controls.includes("polite") ? [false, true] : [false]) for (const spoken of family.controls.includes("spoken") ? [false, true] : [false]) {
        const state = { family: family.id, past, negative, polite, spoken };
        const pair = generate(base, state);
        out.push({ ...state, id: stateId(state), text: (base.prefix ?? "") + pair.text, reading: (base.prefixReading ?? "") + pair.reading });
      }
    }
    return out;
  }
  function sourceAliases(base, forms) {
    const aliases = [];
    for (const form of forms) {
      if (form.family === "desire" && form.polite && form.negative) {
        const pair = add(elementary(base, "Conjunctive"), form.past ? "\u305F\u304F\u3042\u308A\u307E\u305B\u3093\u3067\u3057\u305F" : "\u305F\u304F\u3042\u308A\u307E\u305B\u3093");
        aliases.push({ ...form, id: form.id + ":alias", text: (base.prefix ?? "") + pair.text, reading: (base.prefixReading ?? "") + pair.reading });
      }
      if (form.family === "imperative" && (base.verbClass === "\u4E00\u6BB5" || isSuru(base))) {
        const pair = isSuru(base) ? { text: "\u305B\u3088", reading: "\u305B\u3088" } : add(elementary(base, "Negative"), "\u3088");
        aliases.push({ ...form, id: form.id + ":alias", text: (base.prefix ?? "") + pair.text, reading: (base.prefixReading ?? "") + pair.reading });
      }
    }
    return aliases;
  }
  function model(base, forms, source2, sourceReading, matches2, start = 0, end = source2.length) {
    const first = matches2[0];
    const initial = { family: first.family, past: first.past, negative: first.negative, polite: first.polite, spoken: first.spoken };
    return { start, end, source: source2, sourceReading, lemma: verbBaseText(base), base, forms, initial, sourceMatches: matches2, requiresChoice: new Set(matches2.map((match) => match.family)).size > 1 };
  }
  function createVerbPlayground(base, source2) {
    const forms = formsFor(base), text = source2?.text ?? verbBaseText(base), reading = source2?.reading ?? verbBaseReading(base);
    const matches2 = source2 ? [...forms, ...sourceAliases(base, forms)].filter((form) => form.text === text && form.reading === reading) : forms.filter((form) => form.family === "simple" && !form.past && !form.negative && !form.polite && !form.spoken);
    if (!matches2.length) throw new Error("Unsupported dictionary verb or source form");
    return model(base, forms, text, reading, matches2, source2?.start, source2?.end);
  }
  function contiguous(words, left, right) {
    return left >= 0 && right < words.length && words[left].end === words[right].start;
  }
  function auxiliaryPrefix(text, words, start) {
    let index = start - 1;
    if (!contiguous(words, index, start)) return false;
    if (words[index].pos === "\u52D5\u8A5E") return true;
    const previous = text.slice(words[index].start, words[index].end);
    if (words[start].lemma === "\u5F97\u308B" && previous === "\u3092" && contiguous(words, index - 1, index) && words[index - 1].lemma === "\u306C" && text.slice(words[index - 1].start, words[index - 1].end) === "\u3056\u308B") return true;
    if (previous === "\u306F" || previous === "\u3082") {
      if (!contiguous(words, index - 1, index)) return false;
      index--;
    }
    const link = text.slice(words[index].start, words[index].end);
    return (link === "\u3066" || link === "\u3067") && contiguous(words, index - 1, index) && words[index - 1].pos === "\u52D5\u8A5E";
  }
  function unsupportedContinuation(text, words, endIndex, family) {
    const next = endIndex + 1;
    if (!contiguous(words, endIndex, next)) return false;
    if (words[next].pos === "\u52A9\u52D5\u8A5E" || words[next].pos === "\u52D5\u8A5E") return true;
    const link = text.slice(words[next].start, words[next].end);
    if (link === "\u306A" && words[next].posDetail === "\u7D42\u52A9\u8A5E" && (words[endIndex].pos === "\u52D5\u8A5E" || words[endIndex].lemma === "\u307E\u3059")) return true;
    if (link === "\u3067" && words[endIndex].lemma === "\u306A\u3044") return true;
    if (["te", "without"].includes(family) && ["\u306F", "\u3082"].includes(link)) return true;
    return ["\u3066", "\u3067", "\u3068"].includes(link) && contiguous(words, next, next + 1) && words[next + 1].pos === "\u52D5\u8A5E";
  }
  function terminal(word, family) {
    if (["te", "without", "conditionalBa"].includes(family)) return word.pos === "\u52A9\u8A5E" && word.posDetail === "\u63A5\u7D9A\u52A9\u8A5E";
    if (family === "conditionalTara") return word.verbForm === "\u4EEE\u5B9A\u5F62";
    if (family === "imperative") return !!word.verbForm?.startsWith("\u547D\u4EE4") || word.lemma === "\u3088" && word.pos === "\u52A9\u8A5E" && word.posDetail === "\u7D42\u52A9\u8A5E";
    if (family === "request") return !!word.verbForm?.startsWith("\u547D\u4EE4");
    if (family === "prohibition") return word.pos === "\u52A9\u8A5E" && word.posDetail === "\u7D42\u52A9\u8A5E";
    return word.verbForm === "\u57FA\u672C\u5F62" || family === "teShimau" && word.lemma === "\u3046" && word.pos === "\u611F\u52D5\u8A5E";
  }
  function buildVerbPlayground(text, words, wordIndex) {
    if (!Number.isInteger(wordIndex) || wordIndex < 0 || wordIndex >= words.length) return;
    let best;
    for (let start = Math.max(0, wordIndex - 11); start <= wordIndex; start++) {
      const word = words[start], base = wordBase(word);
      if (!base || auxiliaryPrefix(text, words, start) || word.start < 0 || word.end > text.length || word.start >= word.end) continue;
      if ((["\u3044\u308B", "\u5C45\u308B"].includes(base.lemma) || ["\u304F\u308B", "\u3059\u308B"].includes(base.lemma) && godan.has(base.verbClass)) && word.verbForm === "\u57FA\u672C\u5F62" && text.slice(word.start, word.end) === base.lemma) continue;
      let forms, all;
      try {
        forms = formsFor(base);
        all = [...forms, ...sourceAliases(base, forms)];
      } catch {
        continue;
      }
      if (all.length > 128) continue;
      const index = /* @__PURE__ */ new Map();
      for (const form of all) {
        const key = form.text + "\0" + form.reading;
        index.set(key, [...index.get(key) ?? [], form]);
      }
      let sourceReading = "";
      for (let endIndex = start; endIndex < Math.min(words.length, start + 12); endIndex++) {
        const endWord = words[endIndex];
        if (endIndex > start && !contiguous(words, endIndex - 1, endIndex)) break;
        if (endWord.end > text.length || endWord.end <= endWord.start || endWord.end - word.start > 80) break;
        sourceReading += hiragana(endWord.reading);
        if (endIndex < wordIndex) continue;
        const source2 = text.slice(word.start, endWord.end);
        const matches2 = (index.get(source2 + "\0" + sourceReading) ?? []).filter((form) => terminal(endWord, form.family) && !unsupportedContinuation(text, words, endIndex, form.family));
        if (matches2.length && (!best || word.start < best.start || word.start === best.start && endWord.end > best.end)) best = model(base, forms, source2, sourceReading, matches2, word.start, endWord.end);
      }
    }
    return best;
  }
  function dictionaryVerbCandidates(input, words) {
    if (!input || input.length > 40 || !japanese2.test(input) || !words.length || words[0].start !== 0 || words.at(-1).end !== input.length) return [];
    if (words.some((word, index) => word.start < 0 || word.end <= word.start || word.end > input.length || index > 0 && !contiguous(words, index - 1, index))) return [];
    if (input === "\u304F\u308B") return [
      { lemma: "\u6765\u308B", reading: "\u304F\u308B", verbClass: "\u30AB\u5909\u30FB\u6765\u30EB", label: "\u6765\u308B \u2014 come" },
      { lemma: "\u7E70\u308B", reading: "\u304F\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u7E70\u308B \u2014 reel, turn, or leaf through" }
    ];
    if (input === "\u3059\u308B") return [
      { lemma: "\u3059\u308B", reading: "\u3059\u308B", verbClass: "\u30B5\u5909\u30FB\u30B9\u30EB", label: "\u3059\u308B \u2014 do" },
      { lemma: "\u5237\u308B", reading: "\u3059\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u5237\u308B \u2014 print" },
      { lemma: "\u647A\u308B", reading: "\u3059\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u647A\u308B \u2014 rub or grind" }
    ];
    if (input === "\u5C45\u308B") return [
      { lemma: "\u5C45\u308B", reading: "\u3044\u308B", verbClass: "\u4E00\u6BB5", label: "\u5C45\u308B\uFF08\u3044\u308B\uFF09\u2014 exist or stay (animate)" },
      { lemma: "\u5C45\u308B", reading: "\u304A\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u5C45\u308B\uFF08\u304A\u308B\uFF09\u2014 be or stay" }
    ];
    if (input === "\u3044\u308B") return [
      { lemma: "\u3044\u308B", reading: "\u3044\u308B", verbClass: "\u4E00\u6BB5", label: "\u3044\u308B \u2014 exist or stay (animate)" },
      { lemma: "\u8981\u308B", reading: "\u3044\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u8981\u308B \u2014 need" },
      { lemma: "\u714E\u308B", reading: "\u3044\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u714E\u308B \u2014 roast" },
      { lemma: "\u7092\u308B", reading: "\u3044\u308B", verbClass: "\u4E94\u6BB5\u30FB\u30E9\u884C", label: "\u7092\u308B \u2014 roast or toast" }
    ];
    const last = words.at(-1), base = wordBase(last);
    if (!base || last.verbForm !== "\u57FA\u672C\u5F62" || input.slice(last.start, last.end) !== base.lemma || hiragana(last.reading) !== base.reading) return [];
    if (words.length === 1) return [lexicalRestrictions.has(base.lemma) ? restrictVerbBase(base) : base];
    if (words.length === 2 && base.lemma === "\u3059\u308B" && words[0].pos === "\u540D\u8A5E" && words[0].posDetail === "\u30B5\u5909\u63A5\u7D9A" && kana.test(hiragana(words[0].reading))) return [{ ...base, prefix: input.slice(0, last.start), prefixReading: hiragana(words[0].reading) }];
    return [];
  }
  function potentialBaseQueries(base) {
    if (base.prefix || base.verbClass !== "\u4E00\u6BB5" || lexicalRestrictions.has(base.lemma) || !base.lemma.endsWith("\u308B")) return [];
    const tail = potentialRows[base.lemma.at(-2) ?? ""];
    const queries = tail ? [base.lemma.slice(0, -2) + tail] : [];
    if (base.lemma === "\u3053\u308C\u308B") queries.push("\u304F\u308B");
    return queries;
  }
  function isRaDroppedPotential(source2, query, words) {
    if (!potentialBaseQueries(source2).includes(query)) return false;
    if (source2.lemma === "\u3044\u308C\u308B" && source2.reading === "\u3044\u308C\u308B") return false;
    for (const candidate of dictionaryVerbCandidates(query, words)) {
      if (candidate.prefix || candidate.verbClass !== "\u4E00\u6BB5" && !isKuru(candidate)) continue;
      const stem2 = elementary(candidate, "Negative");
      if (stem2.text + "\u308C\u308B" === source2.lemma && stem2.reading + "\u308C\u308B" === source2.reading) return true;
      if (isKuru(candidate) && source2.lemma === "\u3053\u308C\u308B" && source2.reading === "\u3053\u308C\u308B") return true;
    }
    return false;
  }
  function resolvePotentialBase(source2, query, words) {
    if (!potentialBaseQueries(source2).includes(query)) return;
    for (const candidate of dictionaryVerbCandidates(query, words)) {
      if (candidate.prefix || !godan.has(candidate.verbClass)) continue;
      const potential = formsFor(candidate).find((form) => form.family === "potential" && !form.past && !form.negative && !form.polite && !form.spoken);
      if (potential?.text === source2.lemma && potential.reading === source2.reading) return candidate;
    }
  }
  function verbConstruction(base, state) {
    const full = verbBaseText(base), result = (base.prefix ?? "") + generate(base, state).text;
    const steps = { simple: "Conjugate the dictionary verb.", potential: "Godan: change the final u-row to the e-row and add \u308B. Ichidan: replace \u308B with \u3089\u308C\u308B. \u3059\u308B becomes \u3067\u304D\u308B; \u6765\u308B becomes \u6765\u3089\u308C\u308B.", passive: "Godan: use the a-row stem (\u3046 \u2192 \u308F) + \u308C\u308B. Ichidan: replace \u308B with \u3089\u308C\u308B. \u3059\u308B \u2192 \u3055\u308C\u308B; \u6765\u308B \u2192 \u6765\u3089\u308C\u308B.", causative: "Godan: use the a-row stem (\u3046 \u2192 \u308F) + \u305B\u308B. Ichidan: replace \u308B with \u3055\u305B\u308B. \u3059\u308B \u2192 \u3055\u305B\u308B; \u6765\u308B \u2192 \u6765\u3055\u305B\u308B.", causativePassive: "Build the full causative, then replace its final \u308B with \u3089\u308C\u308B.", desire: "Add \u305F\u3044 to the \u307E\u3059 stem, then use \u3044-adjective endings for tense and negation; add \u3067\u3059 for politeness.", te: "Use the class-specific \u3066\uFF0F\u3067 form; for negative use the negative stem + \u306A\u304F\u3066.", without: "Use the negative stem + \u306A\u3044\u3067.", conditionalBa: "Godan: e-row + \u3070. Ichidan: replace \u308B with \u308C\u3070. Negative: negative stem + \u306A\u3051\u308C\u3070.", conditionalTara: "Build the past form (plain or polite, affirmative or negative), then add \u3089.", volitional: "Godan: o-row + \u3046. Ichidan: replace \u308B with \u3088\u3046. \u3059\u308B \u2192 \u3057\u3088\u3046; \u6765\u308B \u2192 \u6765\u3088\u3046. Polite: \u307E\u3059 stem + \u307E\u3057\u3087\u3046.", request: "Use the \u3066\uFF0F\u3067 form + \u304F\u3060\u3055\u3044; negative: negative stem + \u306A\u3044\u3067\u304F\u3060\u3055\u3044.", imperative: "Godan: final e-row. Ichidan: replace \u308B with \u308D. \u3059\u308B \u2192 \u3057\u308D; \u6765\u308B \u2192 \u6765\u3044.", prohibition: "Add \u306A to the dictionary form.", teIru: "Use the \u3066\uFF0F\u3067 form + \u3044\u308B; conjugate \u3044\u308B. Spoken shortening drops its initial \u3044.", teMiru: "Use the \u3066\uFF0F\u3067 form + \u307F\u308B; conjugate \u307F\u308B as ichidan.", teOku: "Use the \u3066\uFF0F\u3067 form + \u304A\u304F; conjugate \u304A\u304F as godan. Spoken \u3066\u304A\u304F\uFF0F\u3067\u304A\u304F becomes \u3068\u304F\uFF0F\u3069\u304F.", teShimau: "Use the \u3066\uFF0F\u3067 form + \u3057\u307E\u3046; conjugate \u3057\u307E\u3046 as godan. Spoken \u3066\u3057\u307E\u3046\uFF0F\u3067\u3057\u307E\u3046 becomes \u3061\u3083\u3046\uFF0F\u3058\u3083\u3046." };
    let rule = steps[state.family];
    if (["simple", "potential", "passive", "causative", "causativePassive", "teIru", "teMiru", "teOku", "teShimau"].includes(state.family)) {
      const target = derived(base, state.family, state.spoken);
      if (state.polite) rule += " Use its \u307E\u3059 stem + " + (state.negative ? state.past ? "\u307E\u305B\u3093\u3067\u3057\u305F" : "\u307E\u305B\u3093" : state.past ? "\u307E\u3057\u305F" : "\u307E\u3059") + ".";
      else if (state.negative) rule += " Use its negative stem + " + (state.past ? "\u306A\u304B\u3063\u305F" : "\u306A\u3044") + ".";
      else if (state.past) rule += " Use its class-specific \u305F\uFF0F\u3060 past form.";
      else rule += " Keep the resulting dictionary form.";
      if (target !== base) rule += " Resulting base: " + (base.prefix ?? "") + target.lemma + ".";
      if (base.reading === "\u3042\u308B" && state.negative) rule += " \u3042\u308B has the irregular negative \u306A\u3044.";
    }
    return `${full} \u2192 ${result}. ${rule}`;
  }
  var finite2, verbFamilies, godan, kana, japanese2, helperLemmas, irregularLexemes, lexicalRestrictions, restrictedFamilies, isSuru, isKuru, potentialRows;
  var init_verb_playground = __esm({
    "src/verb-playground.ts"() {
      "use strict";
      init_kamiya_min();
      init_shared();
      finite2 = ["past", "negative", "polite"];
      verbFamilies = [
        { id: "simple", label: "Basic", group: "Everyday forms", description: "State an action or situation. Nonpast can describe the present, habits, or the future.", controls: finite2 },
        { id: "te", label: "Connect: \uFF5E\u3066\uFF0F\uFF5E\u306A\u304F\u3066", group: "Everyday forms", description: "Connect an affirmative or negative statement to what follows, sometimes giving a reason. Negative \uFF5E\u306A\u304F\u3066 differs from \uFF5E\u306A\u3044\u3067.", controls: ["negative"] },
        { id: "without", label: "Without doing: \uFF5E\u306A\u3044\u3067", group: "Everyday forms", description: "Describe not doing an action, or make a casual negative request. This differs from \uFF5E\u306A\u304F\u3066.", controls: [] },
        { id: "desire", label: "Want to: \uFF5E\u305F\u3044", group: "Everyday forms", description: "Express a desire to do something. Who wants it and the surrounding context matter.", controls: finite2 },
        { id: "potential", label: "Can: potential", group: "Ability and voice", description: "Express ability or possibility. Ichidan verbs and \u6765\u308B share this spelling with passive and some respectful uses.", controls: finite2 },
        { id: "passive", label: "Passive", group: "Ability and voice", description: "Present someone or something as affected by an action. Participants and particles may need changes.", controls: finite2 },
        { id: "causative", label: "Make or let: causative", group: "Ability and voice", description: "Express making or allowing someone to act; the sentence determines which meaning applies.", controls: finite2 },
        { id: "causativePassive", label: "Be made to: causative-passive", group: "Ability and voice", description: "Express being made to act. This playground uses the full form, not the shortened causative-passive.", controls: finite2 },
        { id: "conditionalBa", label: "If: \uFF5E\u3070", group: "Conditions and intentions", description: "Set a condition. This form has no independent past or polite switch here.", controls: ["negative"] },
        { id: "conditionalTara", label: "If or when: \uFF5E\u305F\u3089", group: "Conditions and intentions", description: "Set a condition or say when something happens. Its \u305F does not by itself locate the condition in the past.", controls: ["negative", "polite"] },
        { id: "volitional", label: "Intention or invitation", group: "Conditions and intentions", description: "Express an intention or invitation. The polite form ends in \uFF5E\u307E\u3057\u3087\u3046.", controls: ["polite"] },
        { id: "request", label: "Please: \uFF5E\u3066\u304F\u3060\u3055\u3044", group: "Requests and commands", description: "Make an affirmative or negative request. Politeness also depends on context.", controls: ["negative"] },
        { id: "imperative", label: "Direct command", group: "Requests and commands", description: "Give a direct, forceful command. This is not a polite request.", controls: [] },
        { id: "prohibition", label: "Do not: \uFF5E\u308B\u306A", group: "Requests and commands", description: "Give a direct prohibition. This is stronger than a negative request.", controls: [] },
        { id: "teIru", label: "Ongoing or resulting state: \uFF5E\u3066\u3044\u308B", group: "Everyday constructions", description: "Describe an ongoing action, repeated activity, or resulting state. The verb and context determine the meaning.", controls: [...finite2, "spoken"] },
        { id: "teMiru", label: "Try doing: \uFF5E\u3066\u307F\u308B", group: "Everyday constructions", description: "Try an action to see what happens. This differs from trying hard or attempting unsuccessfully.", controls: finite2 },
        { id: "teOku", label: "Prepare or leave: \uFF5E\u3066\u304A\u304F", group: "Everyday constructions", description: "Do something in preparation, or leave a situation as it is.", controls: [...finite2, "spoken"] },
        { id: "teShimau", label: "Finish or end up: \uFF5E\u3066\u3057\u307E\u3046", group: "Everyday constructions", description: "Express completion or an unintended result, sometimes with regret. Regret is not automatic.", controls: [...finite2, "spoken"] }
      ];
      godan = /* @__PURE__ */ new Set(["\u4E94\u6BB5\u30FB\u30AB\u884C\u30A4\u97F3\u4FBF", "\u4E94\u6BB5\u30FB\u30AB\u884C\u4FC3\u97F3\u4FBF", "\u4E94\u6BB5\u30FB\u30AC\u884C", "\u4E94\u6BB5\u30FB\u30B5\u884C", "\u4E94\u6BB5\u30FB\u30BF\u884C", "\u4E94\u6BB5\u30FB\u30CA\u884C", "\u4E94\u6BB5\u30FB\u30D0\u884C", "\u4E94\u6BB5\u30FB\u30DE\u884C", "\u4E94\u6BB5\u30FB\u30E9\u884C", "\u4E94\u6BB5\u30FB\u30EF\u884C\u4FC3\u97F3\u4FBF"]);
      kana = /^[\p{Script=Hiragana}ー]+$/u;
      japanese2 = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ー]+$/u;
      helperLemmas = /* @__PURE__ */ new Set(["\u308C\u308B", "\u3089\u308C\u308B", "\u305B\u308B", "\u3055\u305B\u308B"]);
      irregularLexemes = /* @__PURE__ */ new Set(["\u554F\u3046", "\u8ACB\u3046", "\u4E5E\u3046", "\u604B\u3046", "\u3086\u304F", "\u5F80\u304F", "\u901D\u304F", "\u306A\u3055\u308B", "\u70BA\u3055\u308B", "\u304F\u3060\u3055\u308B", "\u4E0B\u3055\u308B", "\u304A\u3063\u3057\u3083\u308B", "\u4EF0\u308B", "\u3044\u3089\u3063\u3057\u3083\u308B", "\u3054\u3056\u308B", "\u5FA1\u5EA7\u308B"]);
      lexicalRestrictions = /* @__PURE__ */ new Set(["\u3067\u304D\u308B", "\u51FA\u6765\u308B"]);
      restrictedFamilies = /* @__PURE__ */ new Set(["simple", "te", "without", "conditionalBa", "conditionalTara"]);
      isSuru = (base) => base.verbClass === "\u30B5\u5909\u30FB\u30B9\u30EB";
      isKuru = (base) => base.verbClass === "\u30AB\u5909\u30FB\u6765\u30EB" || base.verbClass === "\u30AB\u5909\u30FB\u30AF\u30EB";
      potentialRows = { "\u3048": "\u3046", "\u3051": "\u304F", "\u3052": "\u3050", "\u305B": "\u3059", "\u3066": "\u3064", "\u306D": "\u306C", "\u3079": "\u3076", "\u3081": "\u3080", "\u308C": "\u308B" };
    }
  });

  // src/mimetic-data.ts
  var ninjal, daijisen, mimeticEntries;
  var init_mimetic_data = __esm({
    "src/mimetic-data.ts"() {
      "use strict";
      ninjal = (word) => ({ label: "NINJAL \xB7 Japanese reference", url: `https://www2.ninjal.ac.jp/Onomatope/50_on/${word}.html` });
      daijisen = (word, id, slug = word) => ({ label: "Daijisen \xB7 Japanese reference", url: `https://kotobank.jp/word/${encodeURIComponent(slug)}-${id}` });
      mimeticEntries = [
        { id: "rolling", category: "movement", keywords: ["roll", "ball", "stone"], sceneUse: "Rolling objects", initialVariant: 0, variants: [
          { aliases: [], term: "\u3053\u308D\u3053\u308D", gloss: "A small, round object rolling.", example: "\u8D64\u3044\u30D3\u30FC\u7389\u304C\u3053\u308D\u3053\u308D\u3068\u673A\u306E\u7AEF\u307E\u3067\u8EE2\u304C\u3063\u305F\u3002", translation: "A red marble rolled to the edge of the desk.", sceneDescription: "A small ball rolls along the ground.", otherUses: "Also used for a round, plump body, frequent changes, and some kinds of laughter or insect sounds.", reference: ninjal("korokoro") },
          { aliases: [], term: "\u3054\u308D\u3054\u308D", gloss: "A large or heavy object rolling with a rumbling impression.", example: "\u5742\u9053\u3092\u5927\u304D\u306A\u77F3\u304C\u3054\u308D\u3054\u308D\u3068\u8EE2\u304C\u3063\u3066\u3044\u304F\u3002", translation: "A large stone rolls down the slope.", sceneDescription: "A large, uneven stone rolls along the ground.", otherUses: "Also used for thunder, a cat\u2019s purr, bodily sensations, or lounging about. This scene illustrates rolling only.", reference: ninjal("gorogoro") }
        ] },
        { id: "rotation", category: "movement", keywords: ["turn", "spin", "circle"], sceneUse: "Things turning", initialVariant: 0, variants: [
          { aliases: [], term: "\u304F\u308B\u304F\u308B", gloss: "Spinning lightly or neatly, as a small top does.", example: "\u624B\u306E\u3072\u3089\u306E\u4E0A\u3067\u5C0F\u3055\u306A\u3053\u307E\u304C\u304F\u308B\u304F\u308B\u56DE\u308B\u3002", translation: "A little top spins on a palm.", sceneDescription: "A small top spins neatly in place.", otherUses: "Also used for curling hair, rolling up paper, and repeated changes. The difference is not a universal size rule.", reference: ninjal("kurukuru") },
          { aliases: [], term: "\u3050\u308B\u3050\u308B", gloss: "Turning round and round, as a spinning ride does.", example: "\u904A\u5712\u5730\u306E\u30AB\u30C3\u30D7\u304C\u3050\u308B\u3050\u308B\u56DE\u3063\u3066\u3044\u308B\u3002", translation: "The cups of an amusement park ride turn round and round.", sceneDescription: "A cup on a ride circles repeatedly around a center.", otherUses: "Also used for circling an area, winding rope around something, dizziness, or stomach sounds.", reference: ninjal("guruguru") }
        ] },
        { id: "light", category: "nature", keywords: ["light", "sparkle", "glare", "sun"], sceneUse: "Light shining", initialVariant: 0, variants: [
          { aliases: [], term: "\u304D\u3089\u304D\u3089", gloss: "Sparkling or glittering light.", example: "\u671D\u306E\u5149\u3067\u6C60\u306E\u6C34\u9762\u304C\u304D\u3089\u304D\u3089\u8F1D\u3044\u3066\u3044\u308B\u3002", translation: "The pond\u2019s surface sparkles in the morning light.", sceneDescription: "Several small points of light sparkle on water.", otherUses: "Can describe shining eyes, gems, or glittering clothing as well. Brightness alone does not determine the word.", reference: ninjal("kirakira") },
          { aliases: [], term: "\u304E\u3089\u304E\u3089", gloss: "Strong, glaring light, often felt as harsh.", example: "\u7A93\u306E\u5916\u3067\u306F\u5F37\u3044\u65E5\u5DEE\u3057\u304C\u304E\u3089\u304E\u3089\u7167\u308A\u3064\u3051\u3066\u3044\u308B\u3002", translation: "Outside the window, the sunlight glares intensely.", sceneDescription: "A sun gives off broad, strong rays.", otherUses: "Can also describe an intense look in someone\u2019s eyes. This scene illustrates sunlight.", reference: daijisen("\u304E\u3089\u304E\u3089", 480078) }
        ] },
        { id: "rain", category: "nature", keywords: ["rain", "water", "weather"], sceneUse: "Rain falling", initialVariant: 0, variants: [
          { aliases: [], term: "\u3057\u3068\u3057\u3068", gloss: "Rain falling quietly and gently.", example: "\u5EAD\u306E\u82B1\u306B\u3057\u3068\u3057\u3068\u3068\u96E8\u304C\u964D\u308A\u7D9A\u3044\u3066\u3044\u308B\u3002", translation: "Gentle rain keeps falling on the garden flowers.", sceneDescription: "Fine, spaced raindrops fall quietly below a cloud.", otherUses: "This scene shows the common rain use; the word also has older uses for quiet movement or dampness.", reference: daijisen("\u3057\u3068\u3057\u3068", 522183) },
          { aliases: ["\u3056\u30FC\u3056\u30FC"], term: "\u3056\u3042\u3056\u3042", gloss: "Heavy rain falling with a strong rushing sound.", example: "\u99C5\u306B\u7740\u3044\u305F\u9014\u7AEF\u3001\u96E8\u304C\u3056\u3042\u3056\u3042\u3068\u964D\u308A\u59CB\u3081\u305F\u3002", translation: "Just as we reached the station, rain began pouring down.", sceneDescription: "Many thick raindrops pour down below a cloud.", otherUses: "Can also describe water rushing from a hose or other source. This scene illustrates rain.", reference: ninjal("zaazaa") }
        ] },
        { id: "texture", category: "texture", keywords: ["smooth", "rough", "dry", "gritty"], sceneUse: "Surface texture", initialVariant: 0, variants: [
          { aliases: [], term: "\u3055\u3089\u3055\u3089", gloss: "A dry, smooth, nonsticky feel.", example: "\u3053\u306E\u5E03\u306F\u3055\u3089\u3055\u3089\u3057\u3066\u3044\u3066\u6C17\u6301\u3061\u304C\u3044\u3044\u3002", translation: "This fabric feels pleasantly smooth and dry.", sceneDescription: "A fingertip glides across smooth fabric.", otherUses: "Also used for silky hair, fine powder, flowing water, fluent writing, or with \u306A\u3044 to mean \u201Cnot at all.\u201D", reference: ninjal("sarasara") },
          { aliases: [], term: "\u3056\u3089\u3056\u3089", gloss: "A rough or gritty feel.", example: "\u3056\u3089\u3056\u3089\u3057\u305F\u7D19\u306B\u925B\u7B46\u3067\u7DDA\u3092\u5F15\u3044\u305F\u3002", translation: "I drew a pencil line on rough paper.", sceneDescription: "A fingertip moves over the uneven surface of rough paper.", otherUses: "Can describe rough skin, grit in the mouth, a sandy floor, or sand falling. It is not simply the opposite in every use.", reference: ninjal("zarazara") }
        ] },
        { id: "smile", category: "people", keywords: ["smile", "grin", "face"], sceneUse: "Facial expressions", initialVariant: 0, variants: [
          { aliases: [], term: "\u306B\u3053\u306B\u3053", gloss: "Smiling with an openly happy or friendly impression.", example: "\u53CB\u9054\u306B\u4F1A\u3046\u3068\u3001\u5F1F\u306F\u306B\u3053\u306B\u3053\u3057\u305F\u3002", translation: "My little brother smiled happily when he saw his friend.", sceneDescription: "A face has an open, cheerful smile.", otherUses: "The expression describes the visible smile; it cannot tell you everything about someone\u2019s feelings.", reference: ninjal("nikoniko") },
          { aliases: [], term: "\u306B\u3084\u306B\u3084", gloss: "Grinning to oneself; the reason may be private.", example: "\u79D8\u5BC6\u306E\u8A08\u753B\u3092\u8003\u3048\u3066\u3001\u5144\u306F\u306B\u3084\u306B\u3084\u3057\u3066\u3044\u308B\u3002", translation: "My older brother is grinning to himself over a secret plan.", sceneDescription: "A face has a small, knowing grin.", otherUses: "May suggest private pleasure, a smirk, or an unsettling smile to an observer. It does not always imply bad intentions.", reference: ninjal("niyaniya") }
        ] },
        // New comparisons describe one authored use, not universal opposites.
        { id: "anticipation", category: "feelings", keywords: ["excited", "anticipation", "nervous", "heartbeat"], sceneUse: "Waiting for something", initialVariant: 0, variants: [
          { aliases: [], term: "\u308F\u304F\u308F\u304F", gloss: "Excitedly looking forward to something.", example: "\u660E\u65E5\u306E\u9060\u8DB3\u306E\u3053\u3068\u3092\u8003\u3048\u308B\u3068\u3001\u308F\u304F\u308F\u304F\u3059\u308B\u3002", translation: "Thinking about tomorrow\u2019s outing makes me excited.", sceneDescription: "A person looks forward to an outing, with a bag ready beside them.", otherUses: "Usually expresses pleased anticipation. It can occur together with \u3069\u304D\u3069\u304D; excitement and a pounding heart can go together.", reference: ninjal("wakuwaku") },
          { aliases: [], term: "\u3069\u304D\u3069\u304D", gloss: "Feeling your heart beat quickly or strongly.", example: "\u767A\u8868\u306E\u9806\u756A\u3092\u5F85\u3063\u3066\u3044\u308B\u3068\u3001\u80F8\u304C\u3069\u304D\u3069\u304D\u3057\u305F\u3002", translation: "My heart pounded while I waited for my turn to present.", sceneDescription: "A person waits beside a presentation board, with a pounding-heart symbol.", otherUses: "Can accompany anxiety, excitement, attraction, or exercise. This scene shows nervousness before a presentation.", reference: ninjal("dokidoki") }
        ] },
        { id: "irritation", category: "feelings", keywords: ["irritated", "impatient", "annoyed", "anger"], sceneUse: "Unpleasant feelings", initialVariant: 0, variants: [
          { aliases: [], term: "\u3044\u3089\u3044\u3089", gloss: "Feeling impatient or irritated by something that keeps bothering you.", example: "\u30D0\u30B9\u304C\u306A\u304B\u306A\u304B\u6765\u306A\u304F\u3066\u3001\u3044\u3089\u3044\u3089\u3057\u305F\u3002", translation: "I became impatient because the bus was taking so long.", sceneDescription: "A person waits by a bus-stop clock with an impatient expression.", otherUses: "Can describe irritation at delays, noise, or repeated frustrations. It does not always mean outright anger.", reference: ninjal("iraira") },
          { aliases: [], term: "\u3080\u304B\u3080\u304B", gloss: "Anger or resentment welling up.", example: "\u5931\u793C\u306A\u3053\u3068\u3092\u8A00\u308F\u308C\u3066\u3001\u3080\u304B\u3080\u304B\u3057\u305F\u3002", translation: "I felt anger welling up after someone said something rude.", sceneDescription: "A person reacts angrily to an unwelcome comment shown as a jagged speech bubble.", otherUses: "Also describes nausea or an upset stomach. This scene illustrates anger, so check which sense fits your passage.", reference: ninjal("mukamuka") }
        ] },
        { id: "relief", category: "feelings", keywords: ["relief", "relieved", "refreshed", "clear"], sceneUse: "Feeling better", initialVariant: 0, variants: [
          { aliases: [], term: "\u307B\u3063\u3068", gloss: "Feeling relief when a worry or strain eases.", example: "\u306A\u304F\u3057\u305F\u9375\u304C\u898B\u3064\u304B\u3063\u3066\u3001\u307B\u3063\u3068\u3057\u305F\u3002", translation: "I felt relieved when I found my lost key.", sceneDescription: "A person relaxes their shoulders after finding a key.", otherUses: "Often accompanies \u3059\u308B, \u5B89\u5FC3\u3059\u308B, or \u4E00\u606F\u3064\u304F. Relief can follow worry, effort, or reaching a safe stopping point.", reference: ninjal("hotto") },
          { aliases: [], term: "\u3059\u3063\u304D\u308A", gloss: "Feeling clear and refreshed, without a lingering burden.", example: "\u6C17\u306B\u306A\u3063\u3066\u3044\u305F\u4ED5\u4E8B\u3092\u7D42\u3048\u3066\u3001\u6C17\u5206\u304C\u3059\u3063\u304D\u308A\u3057\u305F\u3002", translation: "Finishing the task that had been on my mind left me feeling refreshed.", sceneDescription: "A completed task is checked off and a person\u2019s thought cloud clears.", otherUses: "Also describes uncluttered rooms, clean designs, clear weather, or waking refreshed. It overlaps with relief in some situations.", reference: ninjal("sukkiri") }
        ] },
        { id: "worry", category: "feelings", keywords: ["worried", "anxious", "flustered", "uncertain"], sceneUse: "Reacting to uncertainty", initialVariant: 0, variants: [
          { aliases: [], term: "\u306F\u3089\u306F\u3089", gloss: "Watching anxiously because something might go wrong.", example: "\u3053\u307C\u308C\u305D\u3046\u306A\u30B3\u30C3\u30D7\u3092\u904B\u3076\u5B50\u3069\u3082\u3092\u898B\u3066\u3001\u306F\u3089\u306F\u3089\u3057\u305F\u3002", translation: "I watched anxiously as a child carried a glass that looked ready to spill.", sceneDescription: "An observer watches a child carrying a glass with water near the rim.", otherUses: "Also describes leaves or petals fluttering down and tears falling. The scene shows an anxious observer\u2019s feelings.", reference: ninjal("harahara") },
          { aliases: [], term: "\u304A\u308D\u304A\u308D", gloss: "Being flustered and unsure what to do.", example: "\u5207\u7B26\u304C\u898B\u3064\u304B\u3089\u305A\u3001\u6539\u672D\u306E\u524D\u3067\u304A\u308D\u304A\u308D\u3057\u305F\u3002", translation: "Unable to find my ticket, I stood flustered in front of the ticket gate.", sceneDescription: "A person searches their pockets uncertainly beside a ticket gate.", otherUses: "Can describe being overwhelmed by surprise, distress, or worry. Older uses include a trembling, tearful voice.", reference: daijisen("\u304A\u308D\u304A\u308D", 455547) }
        ] },
        { id: "sleep", category: "body", keywords: ["sleep", "doze", "drowsy", "soundly"], sceneUse: "Sleep", initialVariant: 0, variants: [
          { aliases: [], term: "\u3046\u3068\u3046\u3068", gloss: "Dozing or drifting into light sleep.", example: "\u96FB\u8ECA\u306E\u5EA7\u5E2D\u3067\u3001\u3064\u3044\u3046\u3068\u3046\u3068\u3057\u3066\u3057\u307E\u3063\u305F\u3002", translation: "I accidentally dozed off in my train seat.", sceneDescription: "A seated person\u2019s sleepy head dips slightly above an open book.", otherUses: "Describes drowsiness or shallow sleep. It does not imply a full night of deep, uninterrupted sleep.", reference: daijisen("\u3046\u3068\u3046\u3068", 441022) },
          { aliases: [], term: "\u3050\u3063\u3059\u308A", gloss: "Sleeping soundly and deeply.", example: "\u6628\u591C\u306F\u671D\u307E\u3067\u3050\u3063\u3059\u308A\u7720\u308C\u305F\u3002", translation: "Last night I slept soundly until morning.", sceneDescription: "A person rests comfortably under a blanket, with a moon above the bed.", otherUses: "Used with sleeping or resting; it describes sound sleep without requiring audible snoring.", reference: ninjal("gussuri") }
        ] },
        { id: "exhaustion", category: "body", keywords: ["tired", "exhausted", "drained", "limp"], sceneUse: "Being worn out", initialVariant: 0, variants: [
          { aliases: [], term: "\u304F\u305F\u304F\u305F", gloss: "Thoroughly exhausted, with little energy left.", example: "\u9577\u3044\u5C71\u9053\u3092\u6B69\u3044\u3066\u3001\u3082\u3046\u304F\u305F\u304F\u305F\u3060\u3002", translation: "After walking the long mountain trail, I\u2019m completely worn out.", sceneDescription: "An exhausted walker sits beside their backpack after a long hike.", otherUses: "Also describes worn-out, limp clothing or food cooked very soft. The fatigue sense overlaps with \u3050\u3063\u305F\u308A.", reference: daijisen("\u304F\u305F\u304F\u305F", 483799) },
          { aliases: [], term: "\u3050\u3063\u305F\u308A", gloss: "Drained of strength, with a limp or drooping appearance.", example: "\u4E00\u65E5\u4E2D\u52D5\u304D\u56DE\u3063\u305F\u3042\u3068\u3001\u30BD\u30D5\u30A1\u30FC\u3067\u3050\u3063\u305F\u308A\u3057\u3066\u3044\u305F\u3002", translation: "After being on the move all day, I lay drained on the sofa.", sceneDescription: "A tired person lies limply across a sofa with their arms resting down.", otherUses: "Can follow tiredness, heat, or illness. It is not a fixed, more severe stage of \u304F\u305F\u304F\u305F.", reference: daijisen("\u3050\u3063\u305F\u308A", 3210060, "\u3050\u3064\u305F\u308A") }
        ] },
        { id: "pain", category: "body", keywords: ["pain", "throbbing", "prickly", "itchy"], sceneUse: "Kinds of discomfort", initialVariant: 0, variants: [
          { aliases: [], term: "\u305A\u304D\u305A\u304D", gloss: "A repeated, throbbing pain.", example: "\u6B6F\u304C\u305A\u304D\u305A\u304D\u75DB\u3080\u3002", translation: "My tooth aches with a throbbing pain.", sceneDescription: "A tooth is surrounded by repeated pulse marks.", otherUses: "Can describe a toothache, headache, or pain around a wound. The expression describes a sensation, not its cause.", reference: daijisen("\u305A\u304D\u305A\u304D", 541033) },
          { aliases: [], term: "\u3061\u304F\u3061\u304F", gloss: "A repeated prickling sensation, like small needle pricks.", example: "\u65B0\u3057\u3044\u30BB\u30FC\u30BF\u30FC\u3092\u7740\u308B\u3068\u3001\u9996\u304C\u3061\u304F\u3061\u304F\u3059\u308B\u3002", translation: "The new sweater feels prickly around my neck.", sceneDescription: "Small pointed fibers on a sweater touch the skin at the neckline.", otherUses: "Also describes repeated small jabs, sewing, or pointed remarks that hurt someone\u2019s feelings.", reference: daijisen("\u3061\u304F\u3061\u304F", 565605) }
        ] },
        { id: "stomach", category: "body", keywords: ["hungry", "full", "stomach", "eating"], sceneUse: "Before and after eating", initialVariant: 0, variants: [
          { aliases: [], term: "\u307A\u3053\u307A\u3053", gloss: "Very hungry, with an empty-stomach feeling.", example: "\u304A\u663C\u3092\u98DF\u3079\u3066\u3044\u306A\u3044\u306E\u3067\u3001\u304A\u8179\u304C\u307A\u3053\u307A\u3053\u3060\u3002", translation: "I haven\u2019t had lunch, so I\u2019m very hungry.", sceneDescription: "A hungry person stands beside an empty bowl, with a stomach symbol.", otherUses: "Also describes repeated bowing or a thin surface denting in and out. This scene shows hunger.", reference: ninjal("pekopeko") },
          { aliases: [], term: "\u3071\u3093\u3071\u3093", gloss: "Swollen or filled so tightly that it feels ready to burst.", example: "\u98DF\u3079\u3059\u304E\u3066\u3001\u304A\u8179\u304C\u3071\u3093\u3071\u3093\u306B\u306A\u3063\u305F\u3002", translation: "I ate too much, and now my stomach feels stretched full.", sceneDescription: "A person with a full-stomach symbol sits beside several emptied bowls.", otherUses: "Also describes an overstuffed bag, clapping, or popping sounds. This scene shows being overly full after eating.", reference: daijisen("\u3071\u3093\u3071\u3093", 607227) }
        ] },
        { id: "balance", category: "body", keywords: ["unsteady", "dizzy", "sway", "stagger"], sceneUse: "Keeping your balance", initialVariant: 0, variants: [
          { aliases: [], term: "\u3075\u3089\u3075\u3089", gloss: "Swaying or feeling unable to stand steadily.", example: "\u5BDD\u4E0D\u8DB3\u3067\u3001\u7ACB\u3061\u4E0A\u304C\u308B\u3068\u3075\u3089\u3075\u3089\u3057\u305F\u3002", translation: "After too little sleep, I felt unsteady when I stood up.", sceneDescription: "A person sways beside a chair, with a curved balance line.", otherUses: "Also describes wandering without a firm purpose or wavering in a decision. This scene shows physical unsteadiness.", reference: ninjal("furafura") },
          { aliases: [], term: "\u3088\u308D\u3088\u308D", gloss: "Staggering or moving with difficulty keeping your balance.", example: "\u91CD\u3044\u8377\u7269\u3092\u6301\u3063\u3066\u3001\u3088\u308D\u3088\u308D\u6B69\u3044\u305F\u3002", translation: "I staggered along carrying the heavy luggage.", sceneDescription: "A person carrying a heavy box takes uneven, unsteady steps.", otherUses: "Can describe a person or a bicycle swerving or almost falling. It overlaps with \u3075\u3089\u3075\u3089 rather than forming a severity scale.", reference: ninjal("yoroyoro") }
        ] },
        { id: "temperature", category: "body", keywords: ["warm", "cool", "temperature", "touch"], sceneUse: "Feeling temperature", initialVariant: 0, variants: [
          { aliases: [], term: "\u307D\u304B\u307D\u304B", gloss: "Feeling pleasantly warm.", example: "\u65E5\u306A\u305F\u306B\u5EA7\u308B\u3068\u3001\u80CC\u4E2D\u304C\u307D\u304B\u307D\u304B\u3057\u3066\u304D\u305F\u3002", translation: "Sitting in the sunshine made my back feel pleasantly warm.", sceneDescription: "A person sits comfortably in a sunny patch with gentle warmth lines.", otherUses: "Can describe warm weather or a warming body. Another use describes repeated blows; this scene illustrates warmth only.", reference: daijisen("\u307D\u304B\u307D\u304B", 629296) },
          { aliases: [], term: "\u3072\u3093\u3084\u308A", gloss: "Feeling cool or cold to the touch.", example: "\u51B7\u3084\u3057\u305F\u30BF\u30AA\u30EB\u304C\u3001\u3072\u3093\u3084\u308A\u3057\u3066\u6C17\u6301\u3061\u3044\u3044\u3002", translation: "The chilled towel feels pleasantly cool.", sceneDescription: "A cool towel rests on a person\u2019s forehead beside a snowflake symbol.", otherUses: "Also describes cool air or a cool room. Whether the sensation is pleasant depends on the situation.", reference: daijisen("\u3072\u3093\u3084\u308A", 614851) }
        ] },
        { id: "walking", category: "movement", keywords: ["walk", "slow", "brisk", "pace"], sceneUse: "Walking pace", initialVariant: 0, variants: [
          { aliases: [], term: "\u306E\u308D\u306E\u308D", gloss: "Moving sluggishly or more slowly than expected.", example: "\u75B2\u308C\u3066\u3001\u99C5\u307E\u3067\u306E\u308D\u306E\u308D\u6B69\u3044\u305F\u3002", translation: "Feeling tired, I walked sluggishly to the station.", sceneDescription: "A walker makes slow progress toward a station sign.", otherUses: "Also describes traffic, queues, or slow actions. It often carries an impression of delay, unlike a relaxed stroll.", reference: ninjal("noronoro") },
          { aliases: [], term: "\u3059\u305F\u3059\u305F", gloss: "Walking briskly, without hesitation or stopping.", example: "\u5F7C\u5973\u306F\u8FF7\u308F\u305A\u3001\u51FA\u53E3\u307E\u3067\u3059\u305F\u3059\u305F\u6B69\u3044\u3066\u3044\u3063\u305F\u3002", translation: "She walked briskly straight to the exit without hesitating.", sceneDescription: "A walker heads toward an exit with a clear stride and forward trail.", otherUses: "Usually describes a person\u2019s brisk, unhesitating walk. It does not mean running.", reference: daijisen("\u3059\u305F\u3059\u305F", 542064) }
        ] },
        { id: "busy", category: "movement", keywords: ["busy", "rush", "efficient", "work"], sceneUse: "Getting things done", initialVariant: 0, variants: [
          { aliases: [], term: "\u3070\u305F\u3070\u305F", gloss: "Rushing about busily, with many things to do.", example: "\u51FA\u304B\u3051\u308B\u524D\u306B\u3001\u5FD8\u308C\u7269\u3092\u63A2\u3057\u3066\u3070\u305F\u3070\u305F\u3057\u3066\u3044\u305F\u3002", translation: "Before leaving, I rushed around looking for things I had forgotten.", sceneDescription: "A person hurriedly moves between a bag, a clock, and scattered belongings.", otherUses: "Also describes flapping, noisy footsteps, kicking limbs, or things happening one after another. This scene shows a busy rush.", reference: ninjal("batabata") },
          { aliases: [], term: "\u3066\u304D\u3071\u304D", gloss: "Acting briskly, efficiently, and decisively.", example: "\u673A\u306E\u4E0A\u306E\u66F8\u985E\u3092\u3066\u304D\u3071\u304D\u7247\u4ED8\u3051\u305F\u3002", translation: "I briskly and efficiently sorted away the papers on the desk.", sceneDescription: "A person moves papers into orderly trays and completes a checklist.", otherUses: "Can describe clear, prompt replies as well as efficient actions. Mere speed or frantic movement does not guarantee this impression.", reference: daijisen("\u3066\u304D\u3071\u304D", 575447) }
        ] },
        { id: "wandering", category: "movement", keywords: ["wander", "stroll", "lost", "walk"], sceneUse: "Walking around", initialVariant: 0, variants: [
          { aliases: [], term: "\u3046\u308D\u3046\u308D", gloss: "Moving around without a clear direction or appearing unsettled.", example: "\u51FA\u53E3\u304C\u308F\u304B\u3089\u305A\u3001\u99C5\u306E\u4E2D\u3092\u3046\u308D\u3046\u308D\u3057\u305F\u3002", translation: "Not knowing where the exit was, I wandered around the station.", sceneDescription: "A person follows a winding path between station signs while searching for the exit.", otherUses: "Can describe pacing or lingering around an area. It can sound suspicious in some contexts, but does not itself prove bad intent.", reference: ninjal("urouro") },
          { aliases: [], term: "\u3076\u3089\u3076\u3089", gloss: "Strolling without a fixed purpose or hurry.", example: "\u4F11\u65E5\u306F\u3001\u5546\u5E97\u8857\u3092\u3076\u3089\u3076\u3089\u6B69\u304F\u3002", translation: "On days off, I stroll around the shopping street.", sceneDescription: "A relaxed walker passes shop windows on a gentle path.", otherUses: "Also describes something dangling and swaying, or idling without work. This scene illustrates a relaxed stroll.", reference: ninjal("burabura") }
        ] },
        { id: "looking", category: "people", keywords: ["look", "stare", "attention", "eyes"], sceneUse: "Ways of looking", initialVariant: 0, variants: [
          { aliases: [], term: "\u3058\u3063\u3068", gloss: "Looking steadily, with your attention fixed on something.", example: "\u732B\u304C\u7A93\u306E\u5916\u3092\u3058\u3063\u3068\u898B\u3066\u3044\u308B\u3002", translation: "The cat is looking steadily out of the window.", sceneDescription: "A cat keeps its gaze fixed on a bird outside the window.", otherUses: "Also describes staying still, thinking intently, or quietly enduring something. The scene illustrates a steady gaze.", reference: ninjal("jitto") },
          { aliases: [], term: "\u3058\u308D\u3058\u308D", gloss: "Conspicuously looking someone or something over.", example: "\u77E5\u3089\u306A\u3044\u4EBA\u3092\u3058\u308D\u3058\u308D\u898B\u308B\u306E\u306F\u5931\u793C\u3060\u3002", translation: "It is rude to stare at a stranger and look them up and down.", sceneDescription: "An observer\u2019s gaze moves from another person\u2019s hat down to their shoes.", otherUses: "Often suggests an intrusive or rude gaze. It is not simply a longer or more attentive version of \u3058\u3063\u3068.", reference: ninjal("jirojiro") }
        ] },
        { id: "laughter", category: "people", keywords: ["laugh", "giggle", "chuckle", "voice"], sceneUse: "Laughter", initialVariant: 0, variants: [
          { aliases: [], term: "\u304F\u3059\u304F\u3059", gloss: "Laughing quietly or trying to suppress a laugh.", example: "\u53CB\u9054\u304B\u3089\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u8AAD\u3093\u3067\u3001\u304F\u3059\u304F\u3059\u7B11\u3063\u305F\u3002", translation: "I quietly chuckled while reading a message from a friend.", sceneDescription: "A person covers a small smile while reading their phone.", otherUses: "The quiet laugh may be private or shared. It does not by itself mean laughing maliciously at someone.", reference: ninjal("kusukusu") },
          { aliases: [], term: "\u3052\u3089\u3052\u3089", gloss: "Laughing loudly and without holding back.", example: "\u30B3\u30E1\u30C7\u30A3\u30FC\u3092\u898B\u3066\u3001\u307F\u3093\u306A\u3067\u3052\u3089\u3052\u3089\u7B11\u3063\u305F\u3002", translation: "We all laughed loudly while watching the comedy.", sceneDescription: "A person laughs with an open mouth and broad laughter marks.", otherUses: "Can describe joyful laughter or laughing at someone\u2019s mistake. The surrounding situation determines whether it seems unkind.", reference: ninjal("geragera") }
        ] },
        { id: "crying", category: "people", keywords: ["cry", "sob", "tears", "voice"], sceneUse: "Crying", initialVariant: 0, variants: [
          { aliases: [], term: "\u3057\u304F\u3057\u304F", gloss: "Crying quietly with weak, subdued sobs.", example: "\u5F1F\u306F\u5927\u5207\u306A\u304A\u3082\u3061\u3083\u3092\u306A\u304F\u3057\u3066\u3001\u3057\u304F\u3057\u304F\u6CE3\u3044\u305F\u3002", translation: "My little brother quietly sobbed after losing his favorite toy.", sceneDescription: "A downcast face sheds a few tears with a small, closed mouth.", otherUses: "Also describes a persistent, relatively dull pain, such as a stomachache. This scene illustrates crying.", reference: daijisen("\u3057\u304F\u3057\u304F", 518215) },
          { aliases: [], term: "\u308F\u3093\u308F\u3093", gloss: "Crying loudly, with your voice raised.", example: "\u59B9\u306F\u8EE2\u3093\u3067\u3001\u308F\u3093\u308F\u3093\u6CE3\u304D\u51FA\u3057\u305F\u3002", translation: "My little sister fell and began crying loudly.", sceneDescription: "A tearful face cries with an open mouth and wide voice marks.", otherUses: "Also represents a dog barking or loud sounds echoing; it is a child\u2019s word for a dog too. Check the passage for the intended sense.", reference: daijisen("\u308F\u3093\u308F\u3093", 666104) }
        ] },
        { id: "softness", category: "texture", keywords: ["soft", "fluffy", "chewy", "bread", "mochi"], sceneUse: "Soft food textures", initialVariant: 0, variants: [
          { aliases: [], term: "\u3075\u308F\u3075\u308F", gloss: "Soft, airy, and lightly puffed up.", example: "\u3053\u306E\u30D1\u30F3\u306F\u3001\u3075\u308F\u3075\u308F\u3057\u3066\u3044\u308B\u3002", translation: "This bread is soft and fluffy.", sceneDescription: "A light, airy piece of bread compresses gently under a fingertip.", otherUses: "Also describes floating, drifting, fluffy bedding, or a flighty feeling. This scene shows airy bread.", reference: daijisen("\u3075\u308F\u3075\u308F", 622898) },
          { aliases: [], term: "\u3082\u3061\u3082\u3061", gloss: "Soft and chewy, with a slightly sticky texture.", example: "\u3053\u306E\u304A\u9905\u306F\u3001\u3082\u3061\u3082\u3061\u3057\u305F\u98DF\u611F\u3060\u3002", translation: "This mochi has a soft, chewy texture.", sceneDescription: "A piece of mochi stretches slightly as it is gently pulled.", otherUses: "Also describes plump, springy-feeling skin. This scene illustrates a food texture rather than an opposite of \u3075\u308F\u3075\u308F.", reference: daijisen("\u3082\u3061\u3082\u3061", 645794) }
        ] },
        { id: "moisture", category: "texture", keywords: ["moist", "damp", "wet", "sweat"], sceneUse: "Moisture", initialVariant: 0, variants: [
          { aliases: [], term: "\u3057\u3063\u3068\u308A", gloss: "Lightly and evenly moist.", example: "\u3053\u306E\u30B1\u30FC\u30AD\u306F\u3001\u3057\u3063\u3068\u308A\u3057\u3066\u3044\u3066\u304A\u3044\u3057\u3044\u3002", translation: "This cake is moist and delicious.", sceneDescription: "A slice of cake has an evenly moist interior with small moisture marks.", otherUses: "Also describes moist skin, damp clothes, or a calm, composed atmosphere. It is not always a positive judgement.", reference: daijisen("\u3057\u3063\u3068\u308A", 3211894, "\u3057\u3064\u3068\u308A") },
          { aliases: [], term: "\u3058\u3063\u3068\u308A", gloss: "Noticeably damp or moist, often with sweat.", example: "\u6691\u3044\u90E8\u5C4B\u306B\u3044\u305F\u3089\u3001\u984D\u306B\u3058\u3063\u3068\u308A\u6C57\u3092\u304B\u3044\u305F\u3002", translation: "My forehead became damp with sweat in the hot room.", sceneDescription: "A forehead has a layer of sweat beads below a warm-air symbol.", otherUses: "Often describes sweat or heavy dampness. Older uses overlap with a calm, composed sense of \u3057\u3063\u3068\u308A; context matters.", reference: daijisen("\u3058\u3063\u3068\u308A", 3211895, "\u3058\u3064\u3068\u308A") }
        ] },
        { id: "stickiness", category: "texture", keywords: ["sticky", "stringy", "natto", "syrup"], sceneUse: "Kinds of stickiness", initialVariant: 0, variants: [
          { aliases: [], term: "\u306D\u3070\u306D\u3070", gloss: "Viscous or stringy stickiness.", example: "\u7D0D\u8C46\u3092\u6DF7\u305C\u308B\u3068\u3001\u306D\u3070\u306D\u3070\u3057\u305F\u7CF8\u304C\u4F38\u3073\u308B\u3002", translation: "Stirring natto produces long, sticky threads.", sceneDescription: "Chopsticks lift sticky threads from a bowl of natto.", otherUses: "Also describes other sticky foods or materials. Threads are a useful illustration, not a requirement in every use.", reference: ninjal("nebaneba") },
          { aliases: [], term: "\u3079\u305F\u3079\u305F", gloss: "Sticky material clinging to a surface.", example: "\u30B7\u30ED\u30C3\u30D7\u304C\u6307\u306B\u3064\u3044\u3066\u3001\u3079\u305F\u3079\u305F\u3059\u308B\u3002", translation: "Syrup got on my fingers, and they feel sticky.", sceneDescription: "Syrup clings between a fingertip and a small puddle on a plate.", otherUses: "Also describes clinging affection or covering a surface with something. Its physical sticky sense can overlap with \u306D\u3070\u306D\u3070.", reference: daijisen("\u3079\u305F\u3079\u305F", 624917) }
        ] },
        { id: "slipperiness", category: "texture", keywords: ["slippery", "smooth", "slimy", "oily"], sceneUse: "Slippery surfaces", initialVariant: 0, variants: [
          { aliases: [], term: "\u3064\u308B\u3064\u308B", gloss: "Smooth and slippery to the touch.", example: "\u78E8\u3044\u305F\u77F3\u306E\u8868\u9762\u306F\u3001\u3064\u308B\u3064\u308B\u3057\u3066\u3044\u308B\u3002", translation: "The polished stone has a smooth, slippery surface.", sceneDescription: "A fingertip glides across a smooth, polished stone.", otherUses: "Also describes smooth skin or a slippery floor or icy road. A smooth surface need not have slime or oil on it.", reference: ninjal("tsurutsuru") },
          { aliases: [], term: "\u306C\u308B\u306C\u308B", gloss: "Slippery with a slimy, soapy, or oily feel.", example: "\u305B\u3063\u3051\u3093\u304C\u3064\u3044\u3066\u3001\u624B\u304C\u306C\u308B\u306C\u308B\u3059\u308B\u3002", translation: "My hands feel slippery with soap on them.", sceneDescription: "A soapy hand slides over a wet bar of soap with a visible slippery layer.", otherUses: "Can describe oil, algae, seaweed, or other slippery coatings. It is not simply a stronger degree of \u3064\u308B\u3064\u308B.", reference: ninjal("nurunuru") }
        ] },
        { id: "crispness", category: "texture", keywords: ["crisp", "crunch", "cookie", "toast", "food"], sceneUse: "Crisp food textures", initialVariant: 0, variants: [
          { aliases: [], term: "\u3055\u304F\u3055\u304F", gloss: "A light, crisp bite with a pleasant breaking sound.", example: "\u713C\u304D\u305F\u3066\u306E\u30AF\u30C3\u30AD\u30FC\u306F\u3001\u3055\u304F\u3055\u304F\u3057\u3066\u3044\u308B\u3002", translation: "The freshly baked cookies have a light, crisp texture.", sceneDescription: "A cookie breaks into light crumbs with small crisp-bite marks.", otherUses: "Also describes chopping, stepping on snow, easy progress, or responsive software. This scene illustrates a cookie\u2019s texture.", reference: daijisen("\u3055\u304F\u3055\u304F", 509580) },
          { aliases: [], term: "\u304B\u308A\u304B\u308A", gloss: "Hard, dry, and crisp when bitten.", example: "\u30D1\u30F3\u306E\u8033\u3092\u304B\u308A\u304B\u308A\u306B\u713C\u3044\u305F\u3002", translation: "I toasted the bread crusts until they were crisp and crunchy.", sceneDescription: "A toasted bread crust snaps into firm pieces with sharp crunch marks.", otherUses: "Also describes scratching sounds or being irritable. Food examples overlap with \u3055\u304F\u3055\u304F; there is no universal hardness scale.", reference: daijisen("\u304B\u308A\u304B\u308A", 467818) }
        ] },
        { id: "dryness", category: "texture", keywords: ["dry", "parched", "skin", "thirsty"], sceneUse: "Dryness", initialVariant: 0, variants: [
          { aliases: [], term: "\u304B\u3089\u304B\u3089", gloss: "Thoroughly dry or parched.", example: "\u9577\u304F\u8D70\u3063\u305F\u306E\u3067\u3001\u306E\u3069\u304C\u304B\u3089\u304B\u3089\u3060\u3002", translation: "My throat is parched after the long run.", sceneDescription: "A thirsty person holds an empty cup beside a dry-throat symbol.", otherUses: "Also describes thoroughly dry laundry, empty contents, rattling sounds, or a kind of laughter. This scene shows thirst.", reference: ninjal("karakara") },
          { aliases: [], term: "\u304B\u3055\u304B\u3055", gloss: "Dry and lacking a smooth, supple feel.", example: "\u51AC\u306B\u306A\u308B\u3068\u3001\u624B\u304C\u304B\u3055\u304B\u3055\u306B\u306A\u308B\u3002", translation: "My hands become dry and rough in winter.", sceneDescription: "A hand has dry, uneven skin marks on its surface.", otherUses: "Also describes dry leaves or paper rustling, and figuratively a lack of emotional warmth. This scene shows dry skin.", reference: daijisen("\u304B\u3055\u304B\u3055", 461613) }
        ] },
        { id: "crowd", category: "sounds", keywords: ["crowd", "chatter", "murmur", "noisy"], sceneUse: "Crowd sounds", initialVariant: 0, variants: [
          { aliases: [], term: "\u304C\u3084\u304C\u3084", gloss: "The noisy chatter of a group of people.", example: "\u4F11\u307F\u6642\u9593\u306E\u6559\u5BA4\u306F\u3001\u304C\u3084\u304C\u3084\u3057\u3066\u3044\u305F\u3002", translation: "The classroom was full of noisy chatter during the break.", sceneDescription: "Several people chat in small groups with overlapping speech bubbles.", otherUses: "Often describes a busy room or gathering. It overlaps with \u3056\u308F\u3056\u308F; the pair is not a fixed loud-versus-quiet rule.", reference: ninjal("gayagaya") },
          { aliases: [], term: "\u3056\u308F\u3056\u308F", gloss: "A crowd\u2019s restless noise or murmuring.", example: "\u958B\u6F14\u3092\u5F85\u3064\u5BA2\u3067\u3001\u4F1A\u5834\u304C\u3056\u308F\u3056\u308F\u3057\u3066\u3044\u308B\u3002", translation: "The venue is filled with the murmur of people waiting for the show to begin.", sceneDescription: "An audience murmurs and shifts while waiting in rows of seats.", otherUses: "Also describes rustling leaves or a restless, uneasy feeling. Crowd uses overlap with \u304C\u3084\u304C\u3084.", reference: daijisen("\u3056\u308F\u3056\u308F", 512678) }
        ] },
        { id: "knocking", category: "sounds", keywords: ["knock", "tap", "bang", "door"], sceneUse: "Knocking on a door", initialVariant: 0, variants: [
          { aliases: [], term: "\u3068\u3093\u3068\u3093", gloss: "Repeated light taps or knocks.", example: "\u6249\u3092\u3068\u3093\u3068\u3093\u3068\u8EFD\u304F\u305F\u305F\u3044\u305F\u3002", translation: "I tapped lightly on the door.", sceneDescription: "A hand gives a door small, repeated taps with short sound marks.", otherUses: "Also describes smooth progress or two amounts being roughly equal, including breaking even. This scene shows knocking only.", reference: daijisen("\u3068\u3093\u3068\u3093", 586781) },
          { aliases: [], term: "\u3069\u3093\u3069\u3093", gloss: "Repeated strong, heavy knocks or bangs.", example: "\u5916\u304B\u3089\u3001\u30C9\u30A2\u3092\u3069\u3093\u3069\u3093\u305F\u305F\u304F\u97F3\u304C\u3057\u305F\u3002", translation: "I heard someone banging repeatedly on the door from outside.", sceneDescription: "A hand knocks firmly on a door with broad impact marks.", otherUses: "Also describes rapid progress, increasing amounts, or doing more and more. Sound intensity is the comparison in this scene.", reference: ninjal("dondon") }
        ] },
        // 1.2: six food/texture, five sound, and four daily-action comparisons.
        { "id": "eating", "category": "body", "sceneUse": "Taking bites and chewing", "keywords": ["food", "eat", "bite", "chew", "mouth"], "initialVariant": 0, "variants": [
          { "term": "\u3071\u304F\u3071\u304F", "aliases": [], "gloss": "Taking one bite after another with an opening mouth.", "example": "\u5F1F\u306F\u304A\u306B\u304E\u308A\u3092\u3071\u304F\u3071\u304F\u98DF\u3079\u305F\u3002", "translation": "My little brother ate his rice ball in eager bites.", "sceneDescription": "A mouth opens toward a rice ball.", "otherUses": "Also describes repeated opening and closing, such as a fish\u2019s mouth. This scene shows eating.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%B1%E3%81%8F%E3%81%B1%E3%81%8F-600437" } },
          { "term": "\u3082\u3050\u3082\u3050", "aliases": [], "gloss": "Chewing with food held in the mouth.", "example": "\u59B9\u306F\u30D1\u30F3\u3092\u3082\u3050\u3082\u3050\u304B\u3093\u3067\u3044\u308B\u3002", "translation": "My little sister is munching her bread.", "sceneDescription": "Rounded cheeks move as someone chews bread.", "otherUses": "Can also describe muffled or indistinct speech. Taking bites and chewing can happen in the same meal.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%82%82%E3%81%90%E3%82%82%E3%81%90-645412" } }
        ] },
        { "id": "thinCrunch", "category": "texture", "sceneUse": "Different crunchy bites", "keywords": ["food", "crunch", "seaweed", "pickle", "bite"], "initialVariant": 0, "variants": [
          { "term": "\u3071\u308A\u3071\u308A", "aliases": [], "gloss": "A brittle crunch, as with thin, dry food.", "example": "\u713C\u3044\u305F\u306E\u308A\u304C\u3071\u308A\u3071\u308A\u3057\u3066\u3044\u308B\u3002", "translation": "The toasted seaweed is crisp.", "sceneDescription": "A thin sheet of seaweed snaps into pieces.", "otherUses": "Also describes stiff material or the sound of tearing. The scene illustrates seaweed, not every crunchy food.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%B1%E3%82%8A%E3%81%B1%E3%82%8A-605380" } },
          { "term": "\u307D\u308A\u307D\u308A", "aliases": [], "gloss": "A light repeated crunch while eating.", "example": "\u304D\u3085\u3046\u308A\u306E\u6F2C\u7269\u3092\u307D\u308A\u307D\u308A\u98DF\u3079\u305F\u3002", "translation": "I ate the cucumber pickles with a light crunch.", "sceneDescription": "Small pickle slices are bitten with short sound marks.", "otherUses": "Can also describe light scratching. Food and the speaker\u2019s impression affect which crunch word fits.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%BD%E3%82%8A%E3%81%BD%E3%82%8A-631608" } }
        ] },
        { "id": "viscosity", "category": "texture", "sceneUse": "Flowing food textures", "keywords": ["food", "thick", "melt", "cheese", "soup", "liquid"], "initialVariant": 0, "variants": [
          { "term": "\u3068\u308D\u3068\u308D", "aliases": [], "gloss": "Soft and smoothly flowing, as melted cheese.", "example": "\u30C1\u30FC\u30BA\u304C\u3068\u308D\u3068\u308D\u306B\u6EB6\u3051\u305F\u3002", "translation": "The cheese melted into a soft, flowing texture.", "sceneDescription": "Melted cheese stretches gently from a spoon.", "otherUses": "Also describes gentle heat, slow movement, or dozing. This scene shows melting food.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%A8%E3%82%8D%E3%81%A8%E3%82%8D-586493" } },
          { "term": "\u3069\u308D\u3069\u308D", "aliases": [], "gloss": "Thick and viscous, as a heavy liquid.", "example": "\u7C89\u3092\u5165\u308C\u3059\u304E\u3066\u3001\u30B9\u30FC\u30D7\u304C\u3069\u308D\u3069\u308D\u306B\u306A\u3063\u305F\u3002", "translation": "I added too much flour and the soup became very thick.", "sceneDescription": "A thick soup falls heavily from a ladle.", "otherUses": "Also used for mud, tangled relationships, and some rumbling sounds. It is not always an evaluation of taste.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%A9%E3%82%8D%E3%81%A9%E3%82%8D-586494" } }
        ] },
        { "id": "flavor", "category": "texture", "sceneUse": "Light and rich flavors", "keywords": ["food", "soup", "flavor", "taste", "rich", "light"], "initialVariant": 0, "variants": [
          { "term": "\u3042\u3063\u3055\u308A", "aliases": [], "gloss": "Light in flavor without a heavy richness.", "example": "\u663C\u306F\u3042\u3063\u3055\u308A\u3057\u305F\u30B9\u30FC\u30D7\u3092\u9078\u3093\u3060\u3002", "translation": "For lunch I chose a light soup.", "sceneDescription": "A clear bowl of soup has a few small ingredients.", "otherUses": "Can also describe an uncomplicated attitude or something done easily. This scene concerns flavor.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/assari.html" } },
          { "term": "\u3053\u3063\u3066\u308A", "aliases": [], "gloss": "Rich and heavy in flavor or oils.", "example": "\u3053\u306E\u30E9\u30FC\u30E1\u30F3\u306E\u30B9\u30FC\u30D7\u306F\u3053\u3063\u3066\u308A\u3057\u3066\u3044\u308B\u3002", "translation": "This ramen broth is rich and heavy.", "sceneDescription": "A ramen bowl contains a dense broth with oil droplets.", "otherUses": "Can also describe a thick application or a thorough scolding. Richness does not by itself mean good or bad.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%93%E3%81%A4%E3%81%A6%E3%82%8A-3210803" } }
        ] },
        { "id": "elasticFood", "category": "texture", "sceneUse": "Springy and wobbly food", "keywords": ["food", "shrimp", "jelly", "springy", "wobble", "soft"], "initialVariant": 0, "variants": [
          { "term": "\u3077\u308A\u3077\u308A", "aliases": [], "gloss": "Firmly springy and pleasant to bite.", "example": "\u3053\u306E\u30A8\u30D3\u306F\u3077\u308A\u3077\u308A\u3057\u3066\u3044\u308B\u3002", "translation": "This shrimp has a firm, springy bite.", "sceneDescription": "A curled shrimp springs back after a gentle press.", "otherUses": "Also describes visible irritation or other elastic surfaces. This scene illustrates a food texture.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%B7%E3%82%8A%E3%81%B7%E3%82%8A-621501" } },
          { "term": "\u3077\u3088\u3077\u3088", "aliases": [], "gloss": "Soft and yielding with a wobble.", "example": "\u76BF\u306E\u30BC\u30EA\u30FC\u304C\u3077\u3088\u3077\u3088\u63FA\u308C\u3066\u3044\u308B\u3002", "translation": "The jelly on the plate is wobbling softly.", "sceneDescription": "A soft dome of jelly wobbles on a plate.", "otherUses": "Can describe soft elastic material or flesh. It does not simply mean the opposite of \u3077\u308A\u3077\u308A.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%B7%E3%82%88%E3%81%B7%E3%82%88-736213" } }
        ] },
        { "id": "freshCrunch", "category": "texture", "sceneUse": "Firm bites and fresh crispness", "keywords": ["food", "crunch", "cartilage", "lettuce", "vegetable", "fresh"], "initialVariant": 0, "variants": [
          { "term": "\u3053\u308A\u3053\u308A", "aliases": [], "gloss": "A firm, resistant crunch when bitten.", "example": "\u8EDF\u9AA8\u3092\u3053\u308A\u3053\u308A\u3068\u304B\u3093\u3060\u3002", "translation": "I chewed the cartilage with a firm crunch.", "sceneDescription": "Small firm pieces resist a pair of stylized teeth.", "otherUses": "Also describes stiff or knotted muscles. This scene concerns the resistance of food when chewed.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%93%E3%82%8A%E3%81%93%E3%82%8A-505187" } },
          { "term": "\u3057\u3083\u304D\u3057\u3083\u304D", "aliases": [], "gloss": "Fresh, crisp texture with a clean bite.", "example": "\u3053\u306E\u30EC\u30BF\u30B9\u306F\u3057\u3083\u304D\u3057\u3083\u304D\u3057\u3066\u3044\u308B\u3002", "translation": "This lettuce is fresh and crisp.", "sceneDescription": "A fresh lettuce leaf bends and snaps.", "otherUses": "Also describes brisk, efficient behavior. The food examples illustrate different sensations rather than a universal ranking.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%97%E3%82%84%E3%81%8D%E3%81%97%E3%82%84%E3%81%8D-3212007" } }
        ] },
        { "id": "rattling", "category": "sounds", "sceneUse": "Rattling and rumbling objects", "keywords": ["sound", "rattle", "window", "shutter", "rumble"], "initialVariant": 0, "variants": [
          { "term": "\u304C\u305F\u304C\u305F", "aliases": [], "gloss": "Repeated rattling as something shakes.", "example": "\u98A8\u3067\u7A93\u304C\u304C\u305F\u304C\u305F\u9CF4\u3063\u305F\u3002", "translation": "The window rattled in the wind.", "sceneDescription": "A window shakes inside its frame.", "otherUses": "Also describes trembling, instability, or complaints. This scene shows a loose window.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/gatagata.html" } },
          { "term": "\u304C\u3089\u304C\u3089", "aliases": [], "gloss": "A loud rolling or rattling sound.", "example": "\u5E97\u306E\u30B7\u30E3\u30C3\u30BF\u30FC\u304C\u304C\u3089\u304C\u3089\u3068\u4E0A\u304C\u3063\u305F\u3002", "translation": "The shop shutter rolled up with a rattle.", "sceneDescription": "A ridged shutter rises with broad sound marks.", "otherUses": "Also used for an empty place, gargling, or a hoarse voice. This scene shows a shutter.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/garagara.html" } }
        ] },
        { "id": "metalSounds", "category": "sounds", "sceneUse": "Forceful and ringing metal sounds", "keywords": ["sound", "metal", "hammer", "bell", "ring", "loud"], "initialVariant": 0, "variants": [
          { "term": "\u304C\u3093\u304C\u3093", "aliases": [], "gloss": "A loud, forceful sound repeated insistently.", "example": "\u5DE5\u4E8B\u73FE\u5834\u3067\u91D1\u5C5E\u3092\u304C\u3093\u304C\u3093\u305F\u305F\u3044\u3066\u3044\u308B\u3002", "translation": "Metal is being hammered loudly at the construction site.", "sceneDescription": "A hammer strikes a metal plate with heavy marks.", "otherUses": "Also describes a pounding headache or vigorous activity. This scene illustrates hammering.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/gangan.html" } },
          { "term": "\u304B\u3093\u304B\u3093", "aliases": [], "gloss": "A clear, high metallic ringing.", "example": "\u8E0F\u5207\u306E\u9418\u304C\u304B\u3093\u304B\u3093\u9CF4\u3063\u3066\u3044\u308B\u3002", "translation": "The railway crossing bell is ringing.", "sceneDescription": "A crossing bell rings beside a striped barrier.", "otherUses": "Also describes strong sunlight or anger. Sound quality and context matter, not only volume.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%8B%E3%82%93%E3%81%8B%E3%82%93-469383" } }
        ] },
        { "id": "quietVoices", "category": "sounds", "sceneUse": "Whispers and muttering", "keywords": ["sound", "voice", "whisper", "mutter", "quiet", "speech"], "initialVariant": 0, "variants": [
          { "term": "\u3072\u305D\u3072\u305D", "aliases": [], "gloss": "Speaking quietly so others will not hear.", "example": "\u4E8C\u4EBA\u306F\u3072\u305D\u3072\u305D\u3068\u76F8\u8AC7\u3057\u305F\u3002", "translation": "The two spoke together in whispers.", "sceneDescription": "Two people lean toward a small shared speech bubble.", "otherUses": "Can convey secrecy or quietness. This scene shows a private conversation.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%B2%E3%81%9D%E3%81%B2%E3%81%9D-610349" } },
          { "term": "\u3076\u3064\u3076\u3064", "aliases": [], "gloss": "Muttering words in a low voice.", "example": "\u5144\u306F\u3076\u3064\u3076\u3064\u8A00\u3044\u306A\u304C\u3089\u7247\u4ED8\u3051\u305F\u3002", "translation": "My older brother tidied up while muttering.", "sceneDescription": "One person mutters beside a pile of belongings.", "otherUses": "Also describes bumps, small pieces, or interruption. Muttering may express complaint but does not always do so.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%B6%E3%81%A4%E3%81%B6%E3%81%A4-619464" } }
        ] },
        { "id": "smallDrops", "category": "sounds", "sceneUse": "Drops falling", "keywords": ["sound", "water", "drip", "rain", "drops"], "initialVariant": 0, "variants": [
          { "term": "\u307D\u305F\u307D\u305F", "aliases": [], "gloss": "Liquid falling in distinct repeated drops.", "example": "\u86C7\u53E3\u304B\u3089\u6C34\u304C\u307D\u305F\u307D\u305F\u843D\u3061\u3066\u3044\u308B\u3002", "translation": "Water is dripping from the tap.", "sceneDescription": "Separate drops fall from a tap into a basin.", "otherUses": "Also used for other dripping liquids. This scene shows a small leak.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%BD%E3%81%9F%E3%81%BD%E3%81%9F-630379" } },
          { "term": "\u307D\u3064\u307D\u3064", "aliases": [], "gloss": "Small, scattered drops beginning to fall.", "example": "\u5098\u306B\u96E8\u304C\u307D\u3064\u307D\u3064\u5F53\u305F\u308A\u59CB\u3081\u305F\u3002", "translation": "Scattered raindrops began tapping my umbrella.", "sceneDescription": "A few raindrops land at separated points on an umbrella.", "otherUses": "Also describes scattered objects, intermittent speech, or something starting little by little. This scene shows light rain.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%BD%E3%81%A4%E3%81%BD%E3%81%A4-630850" } }
        ] },
        { "id": "conversation", "category": "sounds", "sceneUse": "Ways of talking", "keywords": ["sound", "speech", "chatter", "fluent", "conversation"], "initialVariant": 0, "variants": [
          { "term": "\u307A\u3061\u3083\u304F\u3061\u3083", "aliases": [], "gloss": "Chattering busily about everyday things.", "example": "\u53CB\u9054\u3068\u307A\u3061\u3083\u304F\u3061\u3083\u304A\u3057\u3083\u3079\u308A\u3057\u305F\u3002", "translation": "I chatted away with my friends.", "sceneDescription": "Two friends exchange many small speech bubbles.", "otherUses": "Often conveys an observer\u2019s impression of chatter and can sound critical. This scene shows casual conversation.", "reference": { "label": "Daijisen \xB7 Japanese reference", "url": "https://kotobank.jp/word/%E3%81%BA%E3%81%A1%E3%82%84%E3%81%8F%E3%81%A1%E3%82%84-3218342" } },
          { "term": "\u307A\u3089\u307A\u3089", "aliases": [], "gloss": "Speaking a language fluently.", "example": "\u59C9\u306F\u30B9\u30DA\u30A4\u30F3\u8A9E\u304C\u307A\u3089\u307A\u3089\u3060\u3002", "translation": "My older sister speaks Spanish fluently.", "sceneDescription": "A speaker sends a continuous line of words toward a globe.", "otherUses": "Also describes nonstop chatter, turning pages, or thin material. This scene shows language fluency.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/perapera.html" } }
        ] },
        { "id": "discretion", "category": "movement", "sceneUse": "Unnoticed and gentle actions", "keywords": ["action", "quiet", "secret", "gentle", "careful"], "initialVariant": 0, "variants": [
          { "term": "\u3053\u3063\u305D\u308A", "aliases": [], "gloss": "Acting without other people noticing.", "example": "\u53CB\u9054\u3078\u306E\u8D08\u308A\u7269\u3092\u3053\u3063\u305D\u308A\u96A0\u3057\u305F\u3002", "translation": "I secretly hid a gift for my friend.", "sceneDescription": "A person hides a wrapped gift behind a screen.", "otherUses": "The emphasis is on avoiding notice; an action need not be physically gentle.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/kossori.html" } },
          { "term": "\u305D\u3063\u3068", "aliases": [], "gloss": "Acting gently and with little disturbance.", "example": "\u7720\u3063\u3066\u3044\u308B\u732B\u306E\u305D\u3070\u306B\u6BDB\u5E03\u3092\u305D\u3063\u3068\u7F6E\u3044\u305F\u3002", "translation": "I gently placed a blanket beside the sleeping cat.", "sceneDescription": "A hand carefully lowers a blanket beside a sleeping cat.", "otherUses": "Can also mean leaving without attracting attention or leaving someone alone. This scene illustrates gentle handling.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/sotto.html" } }
        ] },
        { "id": "unhurried", "category": "movement", "sceneUse": "Delaying and relaxing", "keywords": ["action", "delay", "relax", "time", "leisure"], "initialVariant": 0, "variants": [
          { "term": "\u3050\u305A\u3050\u305A", "aliases": [], "gloss": "Delaying instead of getting on with something.", "example": "\u51FA\u767A\u524D\u306B\u3050\u305A\u3050\u305A\u3057\u3066\u3044\u305F\u3089\u3001\u30D0\u30B9\u3092\u9003\u3057\u305F\u3002", "translation": "I dawdled before leaving and missed the bus.", "sceneDescription": "A person hesitates beside a bag while a bus leaves.", "otherUses": "Also describes grumbling, fussing, or a stuffy nose. This scene shows an unwelcome delay.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/guzuguzu.html" } },
          { "term": "\u306E\u3093\u3073\u308A", "aliases": [], "gloss": "Spending time at an unhurried, relaxed pace.", "example": "\u4F11\u65E5\u306F\u5EAD\u3067\u306E\u3093\u3073\u308A\u904E\u3054\u3057\u305F\u3002", "translation": "I spent my day off relaxing in the garden.", "sceneDescription": "A seated person rests beside a plant and a cup.", "otherUses": "Can also imply being too slow when there is a deadline. The scene shows welcome leisure.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/nonbiri.html" } }
        ] },
        { "id": "neatness", "category": "movement", "sceneUse": "Exact fits and orderly actions", "keywords": ["action", "neat", "tidy", "exact", "fit", "organize"], "initialVariant": 0, "variants": [
          { "term": "\u304D\u3063\u3061\u308A", "aliases": [], "gloss": "Fitting or doing something exactly.", "example": "\u7BB1\u306B\u672C\u304C\u304D\u3063\u3061\u308A\u53CE\u307E\u3063\u305F\u3002", "translation": "The books fitted exactly into the box.", "sceneDescription": "Books fill a box with no gaps at either end.", "otherUses": "Also describes exact amounts, punctuality, and thorough work. This scene shows a close fit.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/kicchiri.html" } },
          { "term": "\u304D\u3061\u3093\u3068", "aliases": [], "gloss": "Doing or arranging something properly and neatly.", "example": "\u9774\u3092\u7384\u95A2\u306B\u304D\u3061\u3093\u3068\u4E26\u3079\u305F\u3002", "translation": "I arranged the shoes neatly in the entrance.", "sceneDescription": "Pairs of shoes stand in orderly rows.", "otherUses": "Also describes reliability, proper behavior, or regularity. Exactness and tidiness can overlap.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/kichinto.html" } }
        ] },
        { "id": "smoothWork", "category": "movement", "sceneUse": "Smooth progress and prompt action", "keywords": ["action", "work", "write", "prompt", "quick", "smooth"], "initialVariant": 0, "variants": [
          { "term": "\u3059\u3089\u3059\u3089", "aliases": [], "gloss": "Proceeding smoothly without getting stuck.", "example": "\u624B\u7D19\u306E\u8A00\u8449\u304C\u3059\u3089\u3059\u3089\u66F8\u3051\u305F\u3002", "translation": "I was able to write the letter smoothly.", "sceneDescription": "A pen draws an uninterrupted line across a letter.", "otherUses": "Also describes fluent reading or answering. This scene shows ease of writing, not just speed.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/surasura.html" } },
          { "term": "\u3055\u3063\u3055\u3068", "aliases": [], "gloss": "Doing something promptly without lingering.", "example": "\u98DF\u4E8B\u306E\u5F8C\u3001\u3055\u3063\u3055\u3068\u98DF\u5668\u3092\u7247\u4ED8\u3051\u305F\u3002", "translation": "After eating, I promptly cleared the dishes.", "sceneDescription": "Hands carry a stack of dishes away from a table.", "otherUses": "In instructions it can sound impatient or brusque. This scene describes prompt action.", "reference": { "label": "NINJAL \xB7 Japanese reference", "url": "https://www2.ninjal.ac.jp/Onomatope/50_on/sassato.html" } }
        ] }
      ];
    }
  });

  // src/mimetic-playground.ts
  function normalizeMimetic(surface) {
    return surface.normalize("NFKC").replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 96));
  }
  function svgNode(tag, attrs = {}, children = []) {
    const node2 = document.createElementNS(svgNS, tag);
    for (const [name, value] of Object.entries(attrs)) node2.setAttribute(name, String(value));
    node2.append(...children);
    return node2;
  }
  function setMimeticLegacyAnimations(value) {
    const next = value === true;
    if (next === showLegacyAnimations) return;
    showLegacyAnimations = next;
    for (const ref of scenes) {
      const root = ref.deref();
      if (root) root.dispatchEvent(new Event("mimetic-style-change"));
      else scenes.delete(ref);
    }
  }
  function scene(entry, index) {
    if (showLegacyAnimations) return legacyScene(entry, index);
    const art = document.createElement("div");
    art.className = "mimetic-art mimetic-print";
    art.setAttribute("aria-hidden", "true");
    art.dataset.scene = entry.id;
    art.dataset.variant = String(index);
    art.dataset.playing = "true";
    art.dataset.style = "woodblock";
    const frames = document.createElement("span");
    frames.className = "mimetic-frames";
    const path = `art/mimetics/${entry.id}-${index}.webp`;
    const url = typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL(path) : path;
    frames.style.backgroundImage = `url("${url}")`;
    frames.style.transform = `translateX(-${(posterFrames[entry.id]?.[index] ?? 5) * 100 / 12}%)`;
    art.append(frames);
    return art;
  }
  function legacyScene(entry, index) {
    const svg = svgNode("svg", { viewBox: "0 0 240 124", "aria-hidden": "true", focusable: "false", class: "mimetic-art" });
    const stroke = { fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" };
    const line = (d, attrs = {}) => svgNode("path", { ...stroke, d, ...attrs });
    const circle = (cx, cy, r, attrs = {}) => svgNode("circle", { ...stroke, cx, cy, r, ...attrs });
    const group = (className, children) => svgNode("g", { class: className }, children);
    const box = (x, y2, width, height, attrs = {}) => svgNode("rect", { ...stroke, x, y: y2, width, height, rx: 3, fill: "var(--surface)", ...attrs });
    const at2 = (className, x, y2, children) => {
      const node2 = group(className, children);
      node2.setAttribute("transform", `translate(${x} ${y2})`);
      return node2;
    };
    const face = (x, y2, r, mood = "neutral") => {
      const eyes = mood === "happy" ? "M-14-4q4-5 8 0M6-4q4-5 8 0" : mood === "angry" ? "M-14-8-6-4M6-4 14-8" : "M-13-5h4M9-5h4";
      const mouth = mood === "happy" ? "M-9 7q9 10 18 0" : mood === "worried" || mood === "sad" || mood === "angry" ? "M-8 13q8-9 16 0" : "M-7 9H7";
      const node2 = group("mimetic-face", [circle(0, 0, 24, { fill: "var(--surface)" }), line(eyes), line(mouth, { stroke: "var(--accent)" })]);
      node2.setAttribute("transform", `translate(${x} ${y2}) scale(${r / 24})`);
      return node2;
    };
    const person = (x, y2, mood = "neutral", seated = false) => at2("mimetic-person", x, y2, [
      face(0, 0, 14, mood),
      line("M0 15V43M0 24-15 38M0 24 15 38"),
      line(seated ? "M0 43H20V66M0 43-18 50-18 66" : "M0 43-12 67M0 43 12 67")
    ]);
    const clock = (x, y2) => at2("", x, y2, [circle(0, 0, 13, { fill: "var(--paper)" }), line("M0-9V0L7 4")]);
    const bag = (x, y2) => at2("", x, y2, [box(0, 0, 25, 30), line("M7 0V-6Q13-13 19-6V0M5 17H20")]);
    const heart = (x, y2) => at2("mimetic-pulse", x, y2, [line("M0 13-17-3C-28-20-5-29 0-13C5-29 28-20 17-3Z", { fill: "var(--accent)" })]);
    const drop = (x, y2, r = 4) => at2("mimetic-drop", x, y2, [line(`M0 ${-r * 2}Q${r * 2} ${r} 0 ${r}Q${-r * 2} ${r} 0 ${-r * 2}Z`, { fill: "var(--accent)", "stroke-width": 1 })]);
    const bubble = (x, y2, width = 34) => at2("", x, y2, [line(`M0 0H${width}V21H14L6 29V21H0Z`, { fill: "var(--paper)" }), line(`M7 8H${width - 7}M7 14H${width - 12}`, { "stroke-width": 1 })]);
    const ground = () => line("M20 110H220", { class: "mimetic-trail" });
    const motion = (className, children) => group(className, children);
    const soundMarks = (x, y2, big = false) => at2("mimetic-pulse", x, y2, [
      line(`M0-14 ${big ? 18 : 9}-24M3 0H${big ? 26 : 13}M0 14 ${big ? 18 : 9} 24`, { "stroke-width": big ? 3 : 1.5, stroke: "var(--accent)" })
    ]);
    const checklist = (x, y2) => at2("", x, y2, [box(0, 0, 37, 46, { fill: "var(--paper)" }), line("M6 11 9 14 14 7M6 25 9 28 14 21M18 12H30M18 26H30M6 38H30", { stroke: "var(--accent)" })]);
    svg.dataset.scene = entry.id;
    svg.dataset.variant = String(index);
    svg.dataset.playing = "true";
    const renderers = { rolling: () => {
      svg.append(line("M12 104H228"), line("M30 70H60m-8-6 8 6-8 6", { class: "mimetic-trail" }));
      const object = index === 0 ? [circle(0, 0, 12, { fill: "var(--accent)" }), line("M-7-7 7 7M7-7-7 7", { stroke: "var(--paper)" })] : [
        line("M-25-12-10-27 13-24 28-7 21 19 0 28-22 15Z", { fill: "var(--surface)" }),
        line("M-10-20 0-3 18 6M0-3-16 9")
      ];
      const mover = group("mimetic-roll", [group("mimetic-wheel", object)]);
      mover.setAttribute("transform", `translate(92 ${index === 0 ? 91 : 75})`);
      svg.append(mover);
    }, rotation: () => {
      svg.append(line("M65 26A59 40 0 1 1 59 85m0 0 2-13m-2 13 13-2", { class: "mimetic-trail" }));
      if (index === 0) {
        const top = group("mimetic-spin", [line("M120 31V45"), line("M83 57 120 41 157 57 120 99Z", { fill: "var(--surface)" }), line("M83 57 120 72 157 57M120 72V99"), line("M103 49 139 64", { stroke: "var(--accent)", "stroke-width": 5 })]);
        svg.append(top);
      } else {
        svg.append(circle(120, 65, 10, { fill: "var(--accent)" }));
        const cup = group("mimetic-orbit", [line("M160 44H198L193 70Q180 82 165 70Z", { fill: "var(--surface)" }), line("M198 50Q216 48 210 63Q208 69 195 67"), line("M165 44Q179 37 198 44")]);
        svg.append(cup);
      }
    }, light: () => {
      if (index === 0) {
        svg.append(line("M13 96Q38 86 63 96T113 96T163 96T213 96M26 110Q51 100 76 110T126 110T176 110T226 110", { class: "mimetic-trail" }));
        for (const [cx, cy, r] of [[57, 45, 13], [117, 66, 9], [179, 32, 17]]) svg.append(group("mimetic-spark", [line(`M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`, { fill: "var(--accent)" })]));
      } else {
        const rays = [circle(120, 62, 25, { fill: "var(--accent)" })];
        for (let n = 0; n < 12; n++) {
          const angle = n * Math.PI / 6;
          rays.push(line(`M${120 + Math.cos(angle) * 34} ${62 + Math.sin(angle) * 34}L${120 + Math.cos(angle) * 52} ${62 + Math.sin(angle) * 52}`, { "stroke-width": 5 }));
        }
        svg.append(group("mimetic-glare", rays));
      }
    }, rain: () => {
      svg.append(line("M57 43Q37 21 64 17Q78-2 100 14Q119-3 138 12Q167 4 172 24Q204 23 190 43Z", { fill: "var(--surface)" }));
      const drops = [];
      for (let n = 0; n < (index === 0 ? 9 : 24); n++) {
        const x = 47 + n % 8 * 21, y2 = 58 + Math.floor(n / 8) * 19;
        drops.push(line(`M${x} ${y2}l${index === 0 ? -2 : -6} ${index === 0 ? 7 : 13}`, { "stroke-width": index === 0 ? 1.5 : 3 }));
      }
      svg.append(group("mimetic-rainfall", drops), line("M38 115H201", { class: "mimetic-trail" }));
    }, texture: () => {
      svg.append(line("M24 69H216V112H24Z", { fill: "var(--surface)" }));
      for (let y2 = 78; y2 <= 100; y2 += 11) {
        const d = index === 0 ? `M31 ${y2}Q44 ${y2 - 4} 57 ${y2}T83 ${y2}T109 ${y2}T135 ${y2}T161 ${y2}T187 ${y2}T213 ${y2}` : `M31 ${y2}l7-4 6 6 7-7 7 6 7-4 7 5 7-6 7 5 7-5 7 5 7-6 7 6 7-4 7 4 7-6 7 6 7-5 7 6 7-7 7 5 7-3 7 4 7-4 7 4`;
        svg.append(line(d, { "stroke-width": 1.4, class: "mimetic-trail" }));
      }
      svg.append(group("mimetic-touch", [line("M88 19V52Q88 68 103 68H128Q136 68 136 60V47Q136 42 130 42H111V18Q111 9 101 9T88 19Z", { fill: "var(--paper)" }), line("M94 62H105", { stroke: "var(--accent)", "stroke-width": 3 })]));
    }, smile: () => {
      svg.append(circle(120, 62, 45, { fill: "var(--surface)" }));
      const features = index === 0 ? [
        line("M94 51Q101 41 108 51M132 51Q139 41 146 51"),
        line("M99 70Q120 95 141 70", { stroke: "var(--accent)", "stroke-width": 3 })
      ] : [
        line("M94 48 108 52M132 52 146 48"),
        line("M105 76Q125 82 143 66", { stroke: "var(--accent)", "stroke-width": 3 }),
        line("M140 63 147 65")
      ];
      svg.append(group("mimetic-expression", features));
    }, anticipation: () => {
      svg.append(ground(), person(77, 35, index === 0 ? "happy" : "worried"));
      if (index === 0) svg.append(bag(165, 74), motion("mimetic-bob", [line("M140 29 145 39 156 40 148 48 150 59 140 53 130 59 132 48 124 40 135 39Z", { fill: "var(--accent)" })]));
      else svg.append(box(146, 18, 65, 43), line("M154 31H203M154 43H190M178 61V82M163 84H193"), heart(119, 88));
    }, irritation: () => {
      svg.append(ground(), motion("mimetic-restless", [person(82, 35, "angry")]));
      if (index === 0) svg.append(clock(181, 35), line("M181 49V108M161 65H201", { class: "mimetic-trail" }));
      else svg.append(motion("mimetic-pulse", [line("M145 24 157 28 166 18 174 29 190 24 188 39 202 47 187 55 191 69 174 65 164 77 157 63 142 66 145 51 133 41 148 36Z", { fill: "var(--paper)" }), line("M168 33V49M168 56V58", { stroke: "var(--accent)", "stroke-width": 4 })]));
    }, relief: () => {
      svg.append(ground(), motion("mimetic-breathe", [person(80, 34, "happy")]));
      if (index === 0) svg.append(motion("mimetic-bob", [circle(158, 59, 10, { stroke: "var(--accent)" }), line("M166 65 190 89M181 80 188 73M187 86 194 79", { stroke: "var(--accent)", "stroke-width": 4 })]), line("M104 47q15 9 23-1", { class: "mimetic-trail" }));
      else svg.append(checklist(164, 41), motion("mimetic-clear", [line("M99 20q7-16 20-8 14-10 24 4 13 0 12 13H103Z", { class: "mimetic-trail" })]), line("M100 49 111 43M104 59H116M100 69 111 75", { stroke: "var(--accent)" }));
    }, worry: () => {
      svg.append(ground());
      if (index === 0) {
        svg.append(person(50, 35, "worried"), person(123, 45, "neutral"), line("M123 69 153 72M141 65H163L160 91H144Z", { fill: "var(--paper)" }), motion("mimetic-tilt", [line("M143 72H162", { stroke: "var(--accent)", "stroke-width": 3 })]), line("M66 32 103 37", { class: "mimetic-trail", "stroke-dasharray": "3 4" }));
      } else svg.append(motion("mimetic-restless", [person(83, 36, "worried"), box(77, 66, 7, 9)]), box(160, 48, 34, 62), line("M154 49H205M167 66H187M177 56V76", { stroke: "var(--accent)" }), line("M118 24Q116 12 128 12T139 24Q139 29 129 34V40M129 48V50"));
    }, sleep: () => {
      if (index === 0) {
        svg.append(ground(), line("M67 63V99H113M72 98V110M107 98V110"), motion("mimetic-nod", [face(96, 38, 16, "sad")]), line("M95 54V80H117V108M95 65 126 73M95 80 84 98V108"), line("M122 66 144 60 164 67V91L144 85 122 91Z", { fill: "var(--paper)" }), line("M144 60V85"));
      } else svg.append(box(43, 74, 153, 33), line("M43 66V115M196 66V115"), face(69, 61, 14, "happy"), motion("mimetic-breathe", [line("M82 72Q121 48 181 70V99H81Z", { fill: "var(--surface)" })]), line("M197 16A17 17 0 1 0 215 36 15 15 0 0 1 197 16Z", { fill: "var(--accent)" }));
    }, exhaustion: () => {
      svg.append(ground());
      if (index === 0) svg.append(line("M30 83 49 50 67 84M36 74H60", { class: "mimetic-trail" }), person(100, 36, "sad", true), line("M77 91H124V109H77Z", { fill: "var(--surface)" }), bag(168, 76), motion("mimetic-sag", [line("M132 36q9 7 0 14m9-8q9 7 0 14", { class: "mimetic-trail" })]));
      else svg.append(box(40, 70, 155, 37), box(34, 61, 17, 46), box(185, 61, 17, 46), face(69, 64, 13, "sad"), motion("mimetic-sag", [line("M83 73 150 77 173 91M111 75 119 99M149 78 173 81M88 70 91 83", { "stroke-width": 3 })]));
    }, pain: () => {
      if (index === 0) svg.append(line("M91 30Q106 19 120 29Q137 19 150 31Q159 45 146 62L138 103Q128 108 123 75Q120 66 116 75Q112 108 102 103L94 62Q82 45 91 30Z", { fill: "var(--surface)" }), motion("mimetic-pulse", [line("M66 40 76 45M63 61H76M68 82 78 76M164 44 175 38M166 62H180M163 79 175 86", { stroke: "var(--accent)", "stroke-width": 3 })]));
      else svg.append(face(120, 29, 19, "worried"), line("M91 49 65 67 79 88 90 77V113H150V77L161 88 175 67 149 49 139 57H101Z", { fill: "var(--surface)" }), line("M103 55V65M111 56V65M119 56V65M127 56V65M135 55V65"), motion("mimetic-pulse", [line("M101 61 104 49M113 62 116 50M125 62 128 50M137 61 140 49", { stroke: "var(--accent)" })]));
    }, stomach: () => {
      svg.append(ground(), person(84, 35, index === 0 ? "sad" : "neutral"));
      if (index === 0) svg.append(motion("mimetic-pulse", [line("M76 68 83 64 89 69 96 64", { stroke: "var(--accent)" })]), line("M147 81H204Q201 105 175 105T147 81Z", { fill: "var(--paper)" }), line("M153 85H198", { class: "mimetic-trail" }));
      else {
        svg.append(motion("mimetic-breathe", [circle(84, 70, 17, { fill: "var(--surface)", stroke: "var(--accent)" })]));
        for (const x of [142, 171, 200]) svg.append(line(`M${x} 85h25q-2 16-12 16t-13-16Z`, { fill: "var(--paper)" }));
      }
    }, balance: () => {
      svg.append(ground());
      if (index === 0) svg.append(line("M39 59V91H72M44 91V110M69 91V110"), motion("mimetic-sway", [person(122, 36, "worried")]), line("M159 34q15-11 20 3t20 0", { class: "mimetic-trail" }));
      else svg.append(motion("mimetic-stagger", [person(88, 35, "worried"), box(113, 58, 62, 35), line("M101 72H126M128 60V93")]), line("M79 108 91 102 105 109 118 104 132 110", { class: "mimetic-trail" }));
    }, temperature: () => {
      if (index === 0) {
        svg.append(ground(), person(80, 38, "happy"), circle(180, 34, 16, { fill: "var(--accent)" }), line("M180 9V2M180 59V67M155 34H147M205 34H213M162 16 156 10M198 52 204 58M162 52 156 58M198 16 204 10"));
        svg.append(motion("mimetic-rise", [line("M126 56q-8 10 0 20t0 20M139 53q-8 10 0 20t0 20", { stroke: "var(--accent)" })]));
      } else svg.append(face(112, 76, 31, "happy"), box(81, 40, 62, 17, { fill: "var(--paper)" }), motion("mimetic-pulse", [line("M182 29V67M165 38 199 58M165 58 199 38M177 34 182 39 187 34M177 62 182 57 187 62", { stroke: "var(--accent)" })]));
    }, walking: () => {
      svg.append(ground(), line("M191 47V108M176 26H218V47H176Z", { fill: "var(--paper)" }), line("M184 37H209m-6-5 6 5-6 5", { stroke: "var(--accent)" }));
      const walker = motion(index === 0 ? "mimetic-slow-walk" : "mimetic-walk", [person(77, 35, index === 0 ? "sad" : "neutral")]);
      svg.append(walker, index === 0 ? line("M41 96H51M52 105H59", { class: "mimetic-trail" }) : line("M27 58H52M23 70H47M30 83H54", { class: "mimetic-trail" }));
    }, busy: () => {
      svg.append(ground());
      if (index === 0) svg.append(motion("mimetic-restless", [person(112, 35, "worried")]), bag(37, 76), clock(194, 29), box(172, 75, 31, 18), line("M170 74 188 60 210 74M48 42H65V62H48", { fill: "var(--paper)" }));
      else svg.append(person(69, 35, "neutral"), line("M115 80H216M122 81V110M208 81V110"), box(161, 71, 40, 9), box(166, 62, 40, 9), motion("mimetic-sort", [box(120, 54, 32, 14, { fill: "var(--paper)" })]), checklist(171, 9));
    }, wandering: () => {
      svg.append(ground());
      if (index === 0) svg.append(motion("mimetic-restless", [person(68, 34, "worried")]), line("M152 30H209V47H152M178 47V86M160 38H198m-5-4 5 4-5 4", { fill: "var(--paper)" }), line("M93 106Q137 76 154 96T207 95", { class: "mimetic-trail", "stroke-dasharray": "4 4" }));
      else svg.append(motion("mimetic-slow-walk", [person(66, 35, "happy")]), box(147, 44, 70, 57), line("M141 43 151 27H213L223 43ZM159 45V100M185 45V100M159 77H185", { fill: "var(--paper)" }), line("M95 105Q119 93 136 104", { class: "mimetic-trail" }));
    }, looking: () => {
      if (index === 0) svg.append(box(145, 17, 69, 78, { fill: "var(--paper)" }), line("M180 17V95M145 56H214"), line("M53 94Q57 64 78 65Q100 62 106 92V105H53M52 100Q28 107 34 87M61 61 59 38 75 49 87 43 94 60Q96 80 76 80T61 61Z", { fill: "var(--surface)" }), line("M77 60H81M89 60H92M96 66 100 68M109 62 164 47", { class: "mimetic-trail", "stroke-dasharray": "3 4" }), motion("mimetic-bob", [line("M164 42q11-13 23 0l8-3-3 8h-24m7-5 5 5", { fill: "var(--accent)" })]));
      else svg.append(ground(), person(51, 35, "neutral"), person(179, 35, "neutral"), line("M156 23H201M165 23V12H191V23M166 103H175M183 103H192"), motion("mimetic-gaze", [line("M68 32 157 18M68 36 164 94", { class: "mimetic-trail", "stroke-dasharray": "3 4", stroke: "var(--accent)" })]));
    }, laughter: () => {
      svg.append(face(120, 61, 34, "happy"));
      if (index === 0) svg.append(box(46, 45, 24, 40, { fill: "var(--paper)" }), line("M52 52H63M52 58H64M52 64H61"), motion("mimetic-bob", [line("M126 76 136 67Q142 62 145 69L137 86 121 90", { fill: "var(--paper)" })]), line("M98 73Q110 83 121 74", { stroke: "var(--accent)" }));
      else svg.append(motion("mimetic-laugh", [svgNode("ellipse", { ...stroke, cx: 120, cy: 76, rx: 13, ry: 10, fill: "var(--accent)" })]), soundMarks(164, 61, true), at2("", 76, 61, [line("M0-14-18-24M-3 0H-26M0 14-18 24", { "stroke-width": 3, stroke: "var(--accent)" })]));
    }, crying: () => {
      svg.append(face(120, 60, 34, "sad"), drop(101, 79, 3), drop(139, 84, 3));
      if (index === 0) svg.append(line("M109 78q4-3 8 0t8 0", { stroke: "var(--accent)" }), line("M100 53 109 56M132 56 141 53"));
      else svg.append(svgNode("ellipse", { ...stroke, cx: 120, cy: 77, rx: 8, ry: 11, fill: "var(--accent)" }), drop(98, 94, 4), drop(143, 99, 4), soundMarks(165, 61, true), line("M77 36 62 27M74 60H55M77 83 62 94", { stroke: "var(--accent)", "stroke-width": 3 }));
    }, softness: () => {
      if (index === 0) svg.append(line("M70 104V72Q60 55 75 46Q87 36 101 43Q118 27 134 43Q151 34 168 50Q179 64 169 74V104Z", { fill: "var(--surface)" }), circle(97, 77, 4), circle(121, 90, 5), circle(145, 76, 4), motion("mimetic-press", [line("M113 12V45Q113 58 121 58T129 45V12", { fill: "var(--paper)" })]));
      else svg.append(motion("mimetic-stretch", [line("M73 68Q84 44 119 57Q157 45 168 69Q162 99 122 92Q81 99 73 68Z", { fill: "var(--surface)" })]), line("M43 57 74 66 68 83 40 77M197 55 168 65 173 82 202 75", { fill: "var(--paper)" }), line("M90 70Q119 76 149 69", { stroke: "var(--accent)" }));
    }, moisture: () => {
      if (index === 0) {
        svg.append(line("M78 54 114 31 176 51V101H78Z", { fill: "var(--surface)" }), line("M78 54H176M114 31V53M78 71H176"), drop(98, 87, 3), drop(121, 88, 3), drop(151, 86, 3));
      } else svg.append(face(115, 71, 35, "worried"), drop(92, 53, 3), drop(107, 46, 3), drop(127, 45, 3), drop(142, 54, 3), motion("mimetic-rise", [line("M177 34q-8 9 0 18t0 18M192 34q-8 9 0 18t0 18", { stroke: "var(--accent)" })]));
    }, stickiness: () => {
      if (index === 0) {
        svg.append(line("M66 81H171Q166 111 118 111T66 81Z", { fill: "var(--surface)" }));
        for (const x of [86, 105, 126, 148]) svg.append(circle(x, 84, 5, { fill: "var(--accent)" }));
        svg.append(motion("mimetic-lift", [line("M121 24 162 67M132 19 171 61"), line("M153 57Q130 68 109 83M159 63Q152 78 135 84M145 50Q106 57 89 83", { stroke: "var(--accent)" })]));
      } else svg.append(svgNode("ellipse", { ...stroke, cx: 116, cy: 99, rx: 62, ry: 11, fill: "var(--paper)" }), line("M86 95Q105 88 125 94T153 98Q129 107 86 101Z", { fill: "var(--accent)", "stroke-width": 1 }), motion("mimetic-lift", [line("M113 13V63Q113 73 123 73T133 63V13", { fill: "var(--paper)" }), line("M117 70Q113 84 104 97M127 71Q143 85 139 97", { stroke: "var(--accent)", "stroke-width": 3 })]));
    }, slipperiness: () => {
      svg.append(svgNode("ellipse", { ...stroke, cx: 121, cy: 93, rx: 64, ry: 20, fill: "var(--surface)" }));
      if (index === 0) svg.append(line("M79 88Q109 75 161 86", { class: "mimetic-trail" }));
      else svg.append(svgNode("ellipse", { ...stroke, cx: 121, cy: 86, rx: 49, ry: 12, fill: "var(--accent)" }), circle(176, 77, 8), circle(189, 64, 5), line("M104 85H139", { stroke: "var(--paper)" }));
      svg.append(motion("mimetic-slide", [line("M85 15V54Q85 69 101 69H125Q135 69 135 60V51Q135 44 126 44H109V15Q109 5 97 5T85 15Z", { fill: "var(--paper)" })]));
    }, crispness: () => {
      if (index === 0) {
        svg.append(motion("mimetic-crack", [line("M113 34A34 34 0 0 0 113 100L105 90 115 80 105 70 115 59 105 47Z", { fill: "var(--surface)" }), line("M122 34A34 34 0 0 1 122 100L114 90 124 80 114 70 124 59 114 47Z", { fill: "var(--surface)" })]), circle(94, 56, 3), circle(98, 83, 3), circle(137, 55, 3), circle(138, 81, 3), circle(166, 95, 2), circle(175, 83, 2));
      } else svg.append(motion("mimetic-crack", [line("M59 40 104 31 120 49 110 58 119 68 109 79 118 91 66 102Z", { fill: "var(--surface)" }), line("M129 30 177 40 172 103 129 93 120 81 130 69 121 58 131 49Z", { fill: "var(--surface)" })]), line("M70 48 98 42M139 43 165 49M73 91 98 85M140 84 161 91", { stroke: "var(--accent)", "stroke-width": 4 }), soundMarks(185, 69));
    }, dryness: () => {
      if (index === 0) svg.append(ground(), person(77, 35, "sad"), line("M148 73H181L177 106H152ZM181 80Q200 77 196 90Q195 98 180 97"), motion("mimetic-pulse", [line("M71 53 78 48 84 54 91 48", { stroke: "var(--accent)" })]));
      else svg.append(line("M82 103V64Q82 55 90 58L100 65V28Q100 19 108 20Q114 20 114 29V55H120V17Q120 10 127 10T134 17V55H140V24Q140 16 147 17T154 25V56H160V39Q160 31 167 32T174 40V86Q171 105 154 111H96Z", { fill: "var(--surface)" }), motion("mimetic-pulse", [line("M105 78 111 74 117 80 124 75M125 95 131 90 138 96 145 91M148 69 154 65 160 70", { stroke: "var(--accent)" })]));
    }, crowd: () => {
      if (index === 0) svg.append(person(55, 48, "happy"), person(119, 52, "neutral"), person(183, 48, "happy"), motion("mimetic-bob", [bubble(28, 7, 38), bubble(91, 10, 43), bubble(166, 5, 42)]));
      else {
        for (const [row, y2] of [43, 83].entries()) for (let n = 0; n < 5; n++) {
          const x = 40 + n * 39;
          svg.append(face(x, y2, 10, "neutral"), line(`M${x - 12} ${y2 + 26}V${y2 + 14}H${x + 12}V${y2 + 26}`, { fill: "var(--surface)" }));
          if (row === 0 && n % 2 === 0) svg.append(motion("mimetic-bob", [line(`M${x - 5} ${y2 - 20}h4m4 0h4m4 0h4`, { stroke: "var(--accent)" })]));
        }
      }
    }, knocking: () => {
      svg.append(box(122, 14, 62, 101, { fill: "var(--paper)" }), box(131, 23, 43, 32), circle(173, 76, 3, { fill: "var(--accent)" }), motion("mimetic-knock", [line("M40 64H74V52Q74 46 80 46H100Q106 46 106 53V60H113V75Q113 87 101 87H80V81H40Z", { fill: "var(--surface)" }), line("M82 54V65M91 53V65M100 54V65")]), soundMarks(193, 68, index === 1));
      if (index === 1) svg.append(line("M112 37 117 43M111 95 117 90", { stroke: "var(--accent)", "stroke-width": 3 }));
    }, eating: () => {
      svg.append(face(88, 58, 34, "happy"), line("M47 108H199"));
      if (index === 0) svg.append(motion("mimetic-knock", [line("M149 85 168 43Q172 35 178 43L199 85Z", { fill: "var(--paper)" }), box(164, 69, 20, 18, { fill: "var(--accent)" })]), line("M81 68Q89 57 100 68Q89 85 81 68Z", { fill: "var(--accent)" }));
      else svg.append(motion("mimetic-pulse", [circle(65, 69, 8, { fill: "var(--sand)" }), circle(111, 69, 8, { fill: "var(--sand)" })]), box(152, 49, 42, 34, { fill: "var(--sand)" }), line("M159 45Q173 24 188 45M159 59H187M159 70H180"));
    }, thinCrunch: () => {
      svg.append(line("M40 105H202"));
      if (index === 0) svg.append(motion("mimetic-crack", [line("M55 28 110 20 101 91 48 98Z", { fill: "var(--accent)" }), line("M122 21 178 31 189 97 130 90Z", { fill: "var(--accent)" }), line("M63 40 96 33M60 55 94 48M137 38 167 45M139 57 171 63", { stroke: "var(--paper)" })]), soundMarks(195, 53));
      else {
        for (let n = 0; n < 4; n++) svg.append(motion("mimetic-bob", [circle(65 + n * 35, 70 + n % 2 * 9, 13, { fill: "var(--surface)" }), circle(65 + n * 35, 70 + n % 2 * 9, 6, { stroke: "var(--accent)" })]));
        svg.append(soundMarks(201, 51));
      }
    }, viscosity: () => {
      svg.append(line("M51 82Q120 125 190 82Z", { fill: "var(--surface)" }), line("M48 81H193"));
      if (index === 0) svg.append(line("M106 26H204M106 26Q87 27 83 40H117Q119 30 106 26Z", { fill: "var(--sand)" }), motion("mimetic-stretch", [line("M89 41Q87 62 103 78M110 41Q115 62 118 78", { stroke: "var(--accent)", "stroke-width": 5 })]));
      else svg.append(line("M154 19 113 42M93 37Q72 60 112 64Q135 55 113 42Z", { fill: "var(--surface)" }), motion("mimetic-drop", [line("M100 64Q89 83 102 87Q119 90 110 65Z", { fill: "var(--accent)" })]), line("M65 87Q100 72 134 88T179 87", { stroke: "var(--accent)", "stroke-width": 4 }));
    }, flavor: () => {
      svg.append(line("M43 62Q51 111 120 111Q186 111 198 62Z", { fill: "var(--surface)" }), svgNode("ellipse", { ...stroke, cx: 120, cy: 62, rx: 77, ry: 18, fill: index === 0 ? "var(--paper)" : "var(--sand)" }));
      if (index === 0) svg.append(circle(92, 61, 4, { fill: "var(--accent)" }), line("M130 60h15M114 67h8", { stroke: "var(--accent)" }), motion("mimetic-rise", [line("M105 38Q95 28 107 17M133 37Q126 27 137 13")]));
      else {
        for (let n = 0; n < 9; n++) svg.append(circle(67 + n * 12, 60 + (n % 3 - 1) * 5, 3 + n % 3, { fill: "var(--accent)" }));
        svg.append(motion("mimetic-rise", [line("M80 35Q62 22 79 9M120 34Q104 21 119 7M161 36Q143 22 157 9", { "stroke-width": 3 })]));
      }
    }, elasticFood: () => {
      svg.append(svgNode("ellipse", { ...stroke, cx: 120, cy: 106, rx: 79, ry: 9 }));
      if (index === 0) svg.append(motion("mimetic-stretch", [line("M164 69Q154 28 116 34Q71 38 71 73Q73 104 111 99Q136 96 133 78Q126 67 112 79Q100 86 99 71Q101 53 120 56Q139 57 146 78Z", { fill: "var(--sand)" }), line("M80 53 100 64M95 39 107 57M117 35 120 56M139 42 131 59M151 53 139 68", { stroke: "var(--accent)" }), line("M164 69 185 56 179 82Z", { fill: "var(--accent)" })]));
      else svg.append(motion("mimetic-sway", [line("M67 100Q69 38 120 36Q174 38 176 100Q120 113 67 100Z", { fill: "var(--sand)" }), svgNode("ellipse", { ...stroke, cx: 120, cy: 41, rx: 21, ry: 7, fill: "var(--accent)" }), line("M83 87Q87 60 97 57", { stroke: "var(--paper)", "stroke-width": 4 })]));
    }, freshCrunch: () => {
      if (index === 0) svg.append(box(60, 28, 122, 19), line("M72 28V41M89 28V41M110 28V41M134 28V41M156 28V41"), motion("mimetic-press", [line("M70 76 88 59 107 69 103 89 81 95ZM124 69 145 57 163 75 152 95 130 91Z", { fill: "var(--sand)" })]), soundMarks(198, 75));
      else svg.append(motion("mimetic-crack", [line("M111 106Q31 76 61 35Q77 15 98 36Q113 17 131 32Q162 13 177 43Q206 71 111 106Z", { fill: "var(--surface)" }), line("M111 106 118 40M114 83 79 52M116 66 154 43M111 94 160 69", { stroke: "var(--accent)" })]), soundMarks(207, 56));
    }, rattling: () => {
      if (index === 0) svg.append(box(60, 13, 118, 101), motion("mimetic-restless", [box(69, 23, 100, 82, { fill: "var(--paper)" }), line("M119 23V105M69 64H169")]), line("M36 40 49 47M185 80 201 87", { stroke: "var(--accent)" }));
      else {
        svg.append(box(57, 12, 130, 102, { fill: "var(--paper)" }));
        const ridges = [];
        for (let n = 0; n < 7; n++) ridges.push(line(`M62 ${22 + n * 10}H182`));
        svg.append(motion("mimetic-lift", ridges), soundMarks(201, 57, true));
      }
    }, metalSounds: () => {
      if (index === 0) svg.append(box(54, 87, 116, 15), motion("mimetic-nod", [line("M109 67 137 20 151 29 123 75Z", { fill: "var(--sand)" }), line("M101 48 144 72 135 88 92 64Z", { fill: "var(--surface)" })]), soundMarks(190, 76, true));
      else svg.append(line("M90 113V25H146M142 17V29"), motion("mimetic-sway", [line("M123 64Q126 29 143 29Q159 29 164 64ZM117 65H170", { fill: "var(--sand)" }), circle(143, 71, 4, { fill: "var(--accent)" })]), line("M43 95H191", { stroke: "var(--accent)", "stroke-width": 7 }), soundMarks(190, 46));
    }, quietVoices: () => {
      if (index === 0) svg.append(person(70, 41, "neutral"), person(164, 41, "neutral"), motion("mimetic-bob", [bubble(91, 7, 43)]), line("M94 55h4m4 0h4m4 0h4", { stroke: "var(--accent)" }));
      else svg.append(person(75, 38, "angry"), box(144, 70, 48, 39), line("M151 80H186M156 90H180"), motion("mimetic-pulse", [bubble(94, 14, 34), line("M102 25h3m5 0h3", { stroke: "var(--accent)" })]));
    }, smallDrops: () => {
      if (index === 0) svg.append(line("M47 24H126V51H100V39H47Z", { fill: "var(--surface)" }), line("M38 94Q120 130 202 94M38 94H202"), drop(113, 62, 4), drop(113, 81, 4));
      else {
        svg.append(line("M52 72Q120 10 188 72Q167 61 143 72Q120 61 98 72Q73 61 52 72ZM120 70V108Q120 119 109 111", { fill: "var(--surface)" }), drop(78, 24, 3), drop(152, 18, 3), motion("mimetic-pulse", [line("M69 50l-6-7M169 50l7-8", { stroke: "var(--accent)" })]));
      }
    }, conversation: () => {
      if (index === 0) svg.append(person(66, 48, "happy"), person(170, 48, "happy"), motion("mimetic-bob", [bubble(24, 5, 32), bubble(81, 10, 32), bubble(156, 4, 48)]));
      else svg.append(person(62, 43, "happy"), circle(177, 72, 31), svgNode("ellipse", { ...stroke, cx: 177, cy: 72, rx: 13, ry: 31 }), line("M146 72H208M153 54H201M153 90H201"), motion("mimetic-slide", [bubble(92, 12, 40)]));
    }, discretion: () => {
      if (index === 0) svg.append(person(72, 35, "neutral"), box(130, 12, 54, 101, { fill: "var(--paper)" }), motion("mimetic-slide", [box(81, 79, 31, 26, { fill: "var(--sand)" }), line("M96 79V105M81 87H112M96 79Q77 59 86 57Q99 55 96 79Q112 56 115 63Q119 76 96 79", { stroke: "var(--accent)" })]));
      else svg.append(line("M135 98Q123 79 143 74Q159 61 177 78Q197 89 179 101Z", { fill: "var(--surface)" }), line("M146 83l4 3m16-3 4 3M176 79 180 67 185 84"), motion("mimetic-press", [line("M50 46H111L130 77H72Z", { fill: "var(--sand)" }), line("M56 49 76 27 105 45", { fill: "var(--surface)" })]));
    }, unhurried: () => {
      if (index === 0) svg.append(person(54, 39, "worried"), bag(77, 78), clock(41, 19), motion("mimetic-slide", [box(126, 40, 82, 54), box(135, 49, 21, 16, { fill: "var(--paper)" }), box(166, 49, 21, 16, { fill: "var(--paper)" }), circle(142, 98, 8), circle(193, 98, 8)]));
      else svg.append(motion("mimetic-breathe", [person(92, 36, "happy", true)]), box(73, 84, 50, 12), line("M176 107V57M176 82Q142 85 149 66Q172 60 176 82ZM176 72Q199 70 198 48Q174 48 176 72Z", { fill: "var(--surface)" }), box(163, 101, 27, 14), line("M40 88H62L59 105H43Z"));
    }, neatness: () => {
      if (index === 0) {
        svg.append(box(48, 72, 147, 40));
        for (let n = 0; n < 6; n++) svg.append(motion("mimetic-lift", [box(53 + n * 23, 31 + n % 2 * 9, 22, 76 - n % 2 * 9, { fill: n % 2 ? "var(--sand)" : "var(--surface)" }), line(`M${60 + n * 23} 53V91`, { stroke: "var(--accent)" })]));
      } else {
        svg.append(box(47, 17, 147, 94, { fill: "var(--paper)" }));
        for (let n = 0; n < 3; n++) for (let k3 = 0; k3 < 2; k3++) svg.append(motion("mimetic-bob", [line(`M${61 + n * 44} ${36 + k3 * 40}q-6 12 2 17h16q9-6 0-17Z`, { fill: "var(--surface)" })]));
      }
    }, smoothWork: () => {
      if (index === 0) svg.append(line("M63 20H168L181 108H48Z", { fill: "var(--paper)" }), line("M70 47H148M67 65H142M65 85H156", { stroke: "var(--accent)" }), motion("mimetic-slide", [line("M91 75 137 21 143 27 100 82Z", { fill: "var(--sand)" })]));
      else svg.append(line("M37 99H203M52 99V116M186 99V116"), motion("mimetic-slide", [svgNode("ellipse", { ...stroke, cx: 111, cy: 78, rx: 35, ry: 8 }), svgNode("ellipse", { ...stroke, cx: 111, cy: 69, rx: 35, ry: 8 }), svgNode("ellipse", { ...stroke, cx: 111, cy: 60, rx: 35, ry: 8 }), line("M57 72 80 80M150 80 173 71", { stroke: "var(--accent)", "stroke-width": 4 })]));
    } };
    renderers[entry.id]();
    return svg;
  }
  function element(tag, className, text) {
    const node2 = document.createElement(tag);
    node2.className = className;
    if (text !== void 0) node2.textContent = text;
    return node2;
  }
  function renderMimeticPlayground(entry) {
    const root = element("section", "mimetic-playground");
    root.setAttribute("aria-label", "Mimetic Playground");
    const heading = element("h4", "mimetic-heading", "Mimetic Playground");
    const context = element("p", "mimetic-context", entry.sceneUse);
    const controls = element("div", "mimetic-controls");
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", "Compare expressions");
    const detail = element("div", "mimetic-detail");
    detail.setAttribute("aria-live", "polite");
    detail.setAttribute("aria-atomic", "true");
    const term = element("p", "mimetic-term");
    term.lang = "ja";
    const gloss = element("p", "mimetic-gloss");
    const example = element("p", "mimetic-example");
    example.lang = "ja";
    const translation = element("p", "mimetic-translation");
    detail.append(term, gloss);
    const examples = element("div", "mimetic-examples");
    examples.setAttribute("aria-live", "polite");
    examples.append(example, translation);
    const figure = element("figure", "mimetic-figure");
    const stage = element("div", "mimetic-stage");
    const caption = element("figcaption", "mimetic-caption");
    figure.append(stage, caption);
    const motionNote = element("p", "mimetic-motion-note", "Reduced motion: the illustration stays still.");
    const uses = element("p", "mimetic-uses");
    const reference = element("a", "mimetic-reference");
    reference.target = "_blank";
    reference.rel = "noopener noreferrer";
    let selected = entry.initialVariant;
    const buttons = entry.variants.map((variant, index) => {
      const button3 = element("button", "mimetic-choice", variant.term);
      button3.type = "button";
      button3.lang = "ja";
      button3.addEventListener("click", () => update(index));
      controls.append(button3);
      return button3;
    });
    function update(index) {
      selected = index;
      const variant = entry.variants[index];
      for (const [i, button3] of buttons.entries()) button3.setAttribute("aria-pressed", String(i === index));
      term.textContent = variant.term;
      gloss.textContent = variant.gloss;
      example.textContent = variant.example;
      translation.textContent = variant.translation;
      caption.textContent = variant.sceneDescription;
      uses.textContent = variant.otherUses;
      let url;
      try {
        url = new URL(variant.reference.url);
      } catch {
      }
      if (url?.protocol === "https:" && ["www2.ninjal.ac.jp", "kotobank.jp"].includes(url.hostname)) {
        reference.href = url.href;
        reference.textContent = `${variant.reference.label} (opens a new tab)`;
        reference.hidden = false;
      } else {
        reference.removeAttribute("href");
        reference.hidden = true;
      }
      stage.replaceChildren(scene(entry, index));
    }
    root.addEventListener("mimetic-style-change", () => stage.replaceChildren(scene(entry, selected)));
    for (const ref of scenes) if (!ref.deref()) scenes.delete(ref);
    scenes.add(new WeakRef(root));
    const more = element("details", "mimetic-more");
    more.append(element("summary", "", "Other uses & reference"), element("p", "", "These are related expressions, each shown in one context."), uses, reference);
    root.append(heading, context, controls, detail, figure, motionNote, examples, more);
    update(selected);
    return root;
  }
  var spellings, svgNS, showLegacyAnimations, scenes, posterFrames, mimeticStyles;
  var init_mimetic_playground = __esm({
    "src/mimetic-playground.ts"() {
      "use strict";
      init_mimetic_data();
      init_mimetic_data();
      spellings = /* @__PURE__ */ new Map();
      for (const entry of mimeticEntries) for (const [index, variant] of entry.variants.entries()) {
        for (const spelling of [variant.term, ...variant.aliases]) {
          const key = normalizeMimetic(spelling);
          if (spellings.has(key)) throw new Error(`Duplicate mimetic spelling: ${key}`);
          spellings.set(key, { entry, index });
        }
      }
      svgNS = "http://www.w3.org/2000/svg";
      showLegacyAnimations = false;
      scenes = /* @__PURE__ */ new Set();
      posterFrames = {
        relief: [9, 8],
        stomach: [5, 10],
        smile: [8, 8],
        crispness: [8, 8],
        thinCrunch: [8, 8],
        freshCrunch: [8, 8],
        neatness: [10, 10]
      };
      mimeticStyles = `
.mimetic-playground{min-width:0;margin-top:12px;padding-top:12px;border-top:2px solid var(--line);color:var(--ink);font:12px/1.55 var(--body,system-ui)}
.mimetic-playground .mimetic-heading{margin:0 0 8px;font:800 11px/1.4 var(--mono,monospace);text-transform:uppercase}
.mimetic-playground .mimetic-context,.mimetic-playground .mimetic-uses{margin:8px 0;color:var(--muted,var(--ink));font-size:11px}
.mimetic-controls{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.mimetic-controls .mimetic-choice{flex:1;min-width:0;white-space:nowrap;font-size:16px}
.mimetic-playground .mimetic-choice{margin:0;padding:7px 9px;border:2px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer;font:700 12px/1.4 var(--body,system-ui)}
.mimetic-playground .mimetic-choice[aria-pressed=true]{background:var(--accent);color:var(--paper)}
.mimetic-playground button:focus-visible,.mimetic-playground a:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.mimetic-playground .mimetic-term{margin:8px 0 2px;font-size:21px;font-weight:700}
.mimetic-playground .mimetic-gloss{margin:0 0 10px;font-weight:700}
.mimetic-playground .mimetic-example{margin:8px 0 2px;font-size:15px;line-height:1.8;overflow-wrap:anywhere}
.mimetic-playground .mimetic-translation{margin:2px 0 8px;color:var(--muted,var(--ink))}
.mimetic-figure{margin:12px 0 8px}.mimetic-stage{overflow:hidden;background:var(--paper);border:1px solid var(--line)}
.mimetic-art{display:block;width:100%;height:auto;max-height:180px;color:var(--ink)}.mimetic-trail{opacity:.55}
.mimetic-print{position:relative;aspect-ratio:2/1;overflow:hidden;background:#f3e7ce;max-height:none;contain:paint}
.mimetic-frames{display:block;width:1200%;height:100%;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated;transform:translateX(-41.6666667%)}
.mimetic-print[data-playing=true] .mimetic-frames{animation:mimetic-print-frames 2.4s steps(11,end) infinite}
@keyframes mimetic-print-frames{0%{transform:translateX(0)}91.6666667%,100%{transform:translateX(-91.6666667%)}}
.mimetic-playground .mimetic-caption{padding:5px 0;font-size:11px;overflow-wrap:anywhere}
.mimetic-playground .mimetic-reference{display:inline-block;margin:4px 0;font-size:10px;color:var(--accent);overflow-wrap:anywhere;text-underline-offset:3px}
.mimetic-more{margin-top:14px;border-top:1px solid var(--line);padding-top:10px;font-size:11px;color:var(--muted)}.mimetic-more summary{cursor:pointer;font-weight:600}.mimetic-motion-note{display:none}.mimetic-art .mimetic-spin{transform-origin:120px 65px}.mimetic-art .mimetic-orbit{transform-origin:120px 65px}.mimetic-art .mimetic-expression{transform-origin:120px 65px}.mimetic-art .mimetic-spark,.mimetic-art .mimetic-wheel{transform-box:fill-box;transform-origin:center}
.mimetic-art[data-playing=true] .mimetic-roll{animation:mimetic-roll 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-wheel{animation:mimetic-wheel 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-spin{animation:mimetic-spin 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-orbit{animation:mimetic-spin 2.4s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-spark{animation:mimetic-spark 1.8s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-glare{animation:mimetic-glare 1.8s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-rainfall{animation:mimetic-rainfall .65s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-touch{animation:mimetic-touch 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-expression{animation:mimetic-expression 1.8s ease-in-out infinite}
.mimetic-art .mimetic-pulse,.mimetic-art .mimetic-breathe,.mimetic-art .mimetic-tilt,.mimetic-art .mimetic-nod,.mimetic-art .mimetic-sway,.mimetic-art .mimetic-stretch{transform-box:fill-box;transform-origin:center}
.mimetic-art[data-playing=true] .mimetic-pulse{animation:mimetic-pulse 1.8s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-bob{animation:mimetic-bob 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-restless{animation:mimetic-restless 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-breathe{animation:mimetic-breathe 2.2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-clear{animation:mimetic-clear 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-tilt{animation:mimetic-tilt 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-nod{animation:mimetic-nod 2.2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-sag{animation:mimetic-sag 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-sway{animation:mimetic-sway 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-stagger{animation:mimetic-stagger 2.3s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-rise{animation:mimetic-rise 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-slow-walk{animation:mimetic-slow-walk 2.4s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-walk{animation:mimetic-walk 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-sort{animation:mimetic-sort 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-gaze{animation:mimetic-gaze 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-laugh{animation:mimetic-laugh .7s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-drop{animation:mimetic-drop .7s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-press{animation:mimetic-press 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-stretch{animation:mimetic-stretch 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-lift{animation:mimetic-lift 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-slide{animation:mimetic-slide 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-crack{animation:mimetic-crack 2s ease-in-out infinite}
.mimetic-art[data-playing=true] .mimetic-knock{animation:mimetic-knock .6s ease-in-out infinite}
@keyframes mimetic-roll{0%,100%{translate:0 0}50%{translate:80px 0}}
@keyframes mimetic-wheel{0%,100%{rotate:0deg}50%{rotate:150deg}}
@keyframes mimetic-spin{0%{rotate:0deg}100%{rotate:720deg}}
@keyframes mimetic-spark{0%,100%{scale:1;opacity:1}50%{scale:.75;opacity:.65}}
@keyframes mimetic-glare{0%,100%{opacity:1}50%{opacity:.7}}
@keyframes mimetic-rainfall{0%{translate:0 -7px}100%{translate:0 7px}}
@keyframes mimetic-touch{0%,100%{translate:0 0}50%{translate:65px 0}}
@keyframes mimetic-expression{0%,100%{scale:1}50%{scale:1.05}}
@keyframes mimetic-pulse{0%,100%{scale:1;opacity:1}50%{scale:1.1;opacity:.7}}
@keyframes mimetic-bob{0%,100%{translate:0 0}50%{translate:0 -3px}}
@keyframes mimetic-restless{0%,100%{translate:0 0}25%{translate:-4px 0}75%{translate:4px 0}}
@keyframes mimetic-breathe{0%,100%{scale:1}50%{scale:1 1.035}}
@keyframes mimetic-clear{0%,100%{opacity:.5}50%{opacity:.08}}
@keyframes mimetic-tilt{0%,100%{rotate:0deg}50%{rotate:6deg}}
@keyframes mimetic-nod{0%,100%{rotate:0deg;translate:0 0}50%{rotate:8deg;translate:0 3px}}
@keyframes mimetic-sag{0%,100%{translate:0 0}50%{translate:0 3px}}
@keyframes mimetic-sway{0%,100%{rotate:0deg}25%{rotate:-3deg}75%{rotate:3deg}}
@keyframes mimetic-stagger{0%,100%{translate:0 0}33%{translate:9px 2px}66%{translate:18px -1px}}
@keyframes mimetic-rise{0%,100%{translate:0 0;opacity:1}50%{translate:0 -7px;opacity:.5}}
@keyframes mimetic-slow-walk{0%,100%{translate:0 0}50%{translate:20px 0}}
@keyframes mimetic-walk{0%,100%{translate:0 0}50%{translate:48px 0}}
@keyframes mimetic-sort{0%,100%{translate:0 0}50%{translate:42px 9px}}
@keyframes mimetic-gaze{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes mimetic-laugh{0%,100%{translate:0 0}50%{translate:0 -2px}}
@keyframes mimetic-drop{0%,100%{translate:0 0;opacity:1}70%{translate:0 5px;opacity:.5}}
@keyframes mimetic-press{0%,100%{translate:0 0}50%{translate:0 9px}}
@keyframes mimetic-stretch{0%,100%{scale:1}50%{scale:1.15 1}}
@keyframes mimetic-lift{0%,100%{translate:0 0}50%{translate:0 -6px}}
@keyframes mimetic-slide{0%,100%{translate:0 0}50%{translate:30px 0}}
@keyframes mimetic-crack{0%,100%{translate:0 0}50%{translate:0 -3px}}
@keyframes mimetic-knock{0%,100%{translate:0 0}50%{translate:7px 0}}
@media(prefers-reduced-motion:reduce){.mimetic-art[data-playing=true] *{animation:none!important}.mimetic-playground .mimetic-motion-note{display:block;margin:6px 0;font-size:11px;color:var(--muted,var(--ink))}}
`;
    }
  });

  // src/meaning-forks.ts
  var meaningForkStyles;
  var init_meaning_forks = __esm({
    "src/meaning-forks.ts"() {
      "use strict";
      init_shared();
      meaningForkStyles = `
.meaning-forks{min-width:0;max-width:100%;color:var(--ink);font-family:var(--body);font-size:13px;line-height:1.55}
.meaning-title{font-size:16px;margin:0 0 6px}
.meaning-traits{font-family:var(--mono);font-size:10px;color:var(--muted);margin:0 0 10px;overflow-wrap:anywhere}
.meaning-intro,.meaning-note{margin:8px 0;color:var(--muted)}
.meaning-controls{border:0;padding:0;margin:12px 0;display:flex;gap:6px;flex-wrap:wrap;min-width:0}
.meaning-legend{font-size:11px;color:var(--muted);margin-bottom:6px;padding:0}
.meaning-choice{font:inherit;border:1px solid var(--line);padding:6px 9px;margin:0;background:var(--paper);color:var(--ink);cursor:pointer}
.meaning-choice[aria-pressed=true]{background:var(--accent);color:var(--paper)}
.meaning-choice:focus-visible,.meaning-reference:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
.meaning-detail{border:1px solid var(--line);padding:12px;background:var(--paper)}
.meaning-selected{margin:0 0 10px;font-size:13px}
.meaning-diagram{display:flex;align-items:center;flex-direction:column;gap:4px;margin:0 0 10px}
.meaning-role{border:1px solid var(--line);padding:5px 9px;max-width:100%;overflow-wrap:anywhere;text-align:center}
.meaning-relation{font-size:11px;color:var(--accent);text-align:center}
.meaning-explanation{margin:0;overflow-wrap:anywhere}
.meaning-note,.meaning-references{font-size:11px}
.meaning-references{margin:12px 0 0;color:var(--muted)}
.meaning-reference{color:var(--accent)}
`;
    }
  });

  // src/exploration.ts
  function changedRange(original, value) {
    const a = Array.from(original), b = Array.from(value);
    let prefix = 0, suffix = 0;
    while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
    while (suffix < a.length - prefix && suffix < b.length - prefix && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix++;
    return { start: b.slice(0, prefix).join("").length, end: b.slice(0, b.length - suffix).join("").length };
  }
  function annotated(text, reading, original) {
    const span = document.createElement("span");
    span.lang = "ja";
    const change = original === void 0 ? void 0 : changedRange(original, text);
    const append2 = (parent, start, end) => {
      const from = change ? Math.max(start, change.start) : end, to = change ? Math.min(end, change.end) : end;
      if (from < to) {
        parent.append(document.createTextNode(text.slice(start, from)));
        const mark = document.createElement("mark");
        mark.textContent = text.slice(from, to);
        parent.append(mark, document.createTextNode(text.slice(to, end)));
      } else parent.append(document.createTextNode(text.slice(start, end)));
    };
    let offset = 0;
    for (const part of align(text, reading)) {
      append2(span, offset, part.start);
      const ruby = document.createElement("ruby");
      append2(ruby, part.start, part.end);
      const rt2 = document.createElement("rt");
      rt2.textContent = part.reading;
      ruby.append(rt2);
      span.append(ruby);
      offset = part.end;
    }
    append2(span, offset, text.length);
    return span;
  }
  function renderVerbPlayground(model2) {
    return renderWordForms(model2, verbFamilies, "Verb Playground", "Verb form", (state) => verbConstruction(model2.base, state));
  }
  function renderAdjectivePlayground(model2) {
    return renderWordForms(model2, adjectiveFamilies, "Adjective Playground", "Adjective form", (state) => adjectiveConstruction(model2.base, state));
  }
  function renderWordForms(model2, familyList, title, formLabel, construction) {
    const section = document.createElement("section");
    section.className = "verb-playground";
    section.setAttribute("aria-label", title);
    if (title === "Adjective Playground") section.classList.add("adjective-playground");
    const heading = document.createElement("h4");
    heading.textContent = title;
    const description = document.createElement("p");
    description.className = "verb-instruction";
    description.textContent = "Choose a form and adjust its ending.";
    const familyLabel = document.createElement("label");
    familyLabel.className = "verb-family-label";
    familyLabel.append(document.createTextNode("Form "));
    const select = document.createElement("select");
    select.className = "verb-family";
    select.setAttribute("aria-label", formLabel);
    familyLabel.append(select);
    const explanation = document.createElement("p");
    explanation.className = "verb-explanation";
    const controls = document.createElement("div");
    controls.className = "verb-controls";
    const recipe = document.createElement("p");
    recipe.className = "form-construction";
    const state = { ...model2.initial };
    let pristine = true, chosen = !model2.requiresChoice;
    const families = familyList.filter((family) => model2.forms.some((form) => form.family === family.id));
    const groups = /* @__PURE__ */ new Map();
    for (const family of families) {
      let group = groups.get(family.group);
      if (!group) {
        group = document.createElement("optgroup");
        group.label = family.group;
        groups.set(family.group, group);
        select.append(group);
      }
      const option = document.createElement("option");
      option.value = family.id;
      option.textContent = family.label;
      group.append(option);
    }
    const choices = document.createElement("div");
    choices.className = "verb-ambiguity";
    if (model2.requiresChoice) {
      const prompt = document.createElement("p");
      prompt.textContent = "This spelling has several interpretations, including possible respectful uses. Choose a supported interpretation to explore; the passage determines its meaning.";
      choices.append(prompt);
      const seen = /* @__PURE__ */ new Set();
      for (const match of model2.sourceMatches) {
        if (seen.has(match.family)) continue;
        seen.add(match.family);
        const button3 = document.createElement("button");
        button3.type = "button";
        button3.textContent = familyList.find((family) => family.id === match.family)?.label ?? match.family;
        button3.addEventListener("click", () => {
          Object.assign(state, match);
          chosen = true;
          pristine = true;
          paintControls();
          render2();
          select.focus();
        });
        choices.append(button3);
      }
    }
    const result = document.createElement("div");
    result.className = "verb-result";
    result.setAttribute("aria-live", "polite");
    result.setAttribute("aria-atomic", "true");
    const render2 = () => {
      const family = families.find((family2) => family2.id === state.family);
      const variant = model2.forms.find((form) => form.family === state.family && form.past === state.past && form.negative === state.negative && form.polite === state.polite && form.spoken === state.spoken);
      const japanese4 = annotated(pristine ? model2.source : variant?.text ?? model2.source, pristine ? model2.sourceReading : variant?.reading ?? model2.sourceReading, model2.source);
      japanese4.className = "verb-japanese";
      const caption = document.createElement("p");
      caption.className = "verb-state";
      const traits = [];
      if (chosen && family) {
        traits.push(family.label);
        if (family.controls.includes("past")) traits.push(state.past ? "Past" : "Nonpast");
        if (family.controls.includes("negative")) traits.push(state.negative ? "Negative" : "Affirmative");
        if (family.controls.includes("polite")) traits.push(state.polite ? "Polite" : "Plain");
        if (state.spoken) traits.push("Spoken shortening");
      } else traits.push("Original spelling \xB7 Choose an interpretation above");
      caption.textContent = traits.join(" \xB7 ");
      result.replaceChildren(japanese4, caption);
      familyLabel.hidden = controls.hidden = explanation.hidden = !chosen;
      choices.hidden = chosen;
      select.value = state.family;
      explanation.textContent = family?.description ?? "";
      recipe.hidden = !chosen;
      recipe.textContent = chosen ? "How this form is built: " + construction(state) + (pristine && variant?.text !== model2.source ? " The original spelling is preserved above; this rule shows the standard generated form." : "") : "";
    };
    const paintControls = () => {
      controls.replaceChildren();
      const family = families.find((family2) => family2.id === state.family);
      for (const [key, label] of [["past", "Past"], ["negative", "Negative"], ["polite", "Polite"], ["spoken", "Spoken shortening"]]) {
        if (!family?.controls.includes(key)) continue;
        const container = document.createElement("label"), input = document.createElement("input");
        input.type = "checkbox";
        input.checked = state[key];
        input.dataset.control = key;
        input.addEventListener("change", () => {
          state[key] = input.checked;
          pristine = false;
          render2();
        });
        container.append(input, document.createTextNode(label));
        controls.append(container);
      }
    };
    select.addEventListener("change", () => {
      const family = families.find((family2) => family2.id === select.value);
      if (!family) return;
      state.family = family.id;
      for (const key of ["past", "negative", "polite", "spoken"]) if (!family.controls.includes(key)) state[key] = false;
      pristine = false;
      paintControls();
      render2();
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "verb-reset";
    reset.textContent = "Reset";
    reset.addEventListener("click", () => {
      Object.assign(state, model2.initial);
      chosen = !model2.requiresChoice;
      pristine = true;
      paintControls();
      render2();
    });
    const output = document.createElement("div");
    output.className = "verb-output";
    const resultBar = document.createElement("div");
    resultBar.className = "verb-result-bar";
    resultBar.append(document.createTextNode("Result"), reset);
    output.append(resultBar, result);
    const help = document.createElement("details");
    help.className = "verb-help";
    const summary = document.createElement("summary");
    summary.textContent = "How to use this form";
    const note = document.createElement("p");
    note.textContent = "Underlined characters differ from the original. Reset restores its exact spelling. These forms are demonstrations; the surrounding sentence and social context may need other changes.";
    help.append(summary, note);
    section.append(heading, description, choices, familyLabel, controls, output, recipe, explanation, help);
    paintControls();
    render2();
    return section;
  }
  function withOriginal(base, original) {
    try {
      return createVerbPlayground(base, { text: original.source, reading: original.sourceReading, start: original.start, end: original.end });
    } catch {
      return;
    }
  }
  async function verifiedVerbInterpretations(model2, tokenize, signal) {
    const queries = potentialBaseQueries(model2.base).filter((query) => Array.from(query).length <= 40).slice(0, 4);
    if (!queries.length) return [{ label: model2.base.label ?? model2.source, model: model2 }];
    const restricted = withOriginal(restrictVerbBase(model2.base), model2);
    const choices = restricted ? [{ label: `${model2.base.label ?? model2.lemma} \xB7 dictionary entry (limited forms)`, model: restricted }] : [];
    const results = await tokenize(queries, signal);
    if (signal.aborted) return [];
    const seen = /* @__PURE__ */ new Set();
    let verified = false;
    for (let index = 0; index < queries.length; index++) {
      if (isRaDroppedPotential(model2.base, queries[index], results[index] ?? [])) return [];
      const base = resolvePotentialBase(model2.base, queries[index], results[index] ?? []);
      if (!base || seen.has(base.lemma)) continue;
      verified = true;
      const derived2 = withOriginal(base, model2);
      if (!derived2) continue;
      seen.add(base.lemma);
      choices.push({ label: `Potential of ${base.prefix ?? ""}${base.lemma} (${base.prefixReading ?? ""}${base.reading})`, model: derived2 });
    }
    return verified ? choices : [{ label: model2.base.label ?? model2.source, model: model2 }];
  }
  var explorationStyles;
  var init_exploration = __esm({
    "src/exploration.ts"() {
      "use strict";
      init_adjective_playground();
      init_shared();
      init_verb_playground();
      init_mimetic_playground();
      init_meaning_forks();
      explorationStyles = `
.explore-toggle,.definition-retry{margin:8px 8px 0 0;font-size:11px}
.explore-panel{margin-top:12px;border:1px solid var(--line);padding:12px;background:var(--paper);min-width:0}
.explore-panel[hidden]{display:none}.explore-tools{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.explore-tools button{margin:0;font-size:10px}.explore-tools button[aria-pressed=true]{background:var(--accent);color:var(--paper)}
.explore-panel h4{margin:0 0 8px;font:800 12px/1.4 var(--mono);text-transform:uppercase}
.explore-panel p{font-size:12px}.explore-panel .explore-source{font:20px/2 var(--body);margin:4px 0 14px;overflow-wrap:anywhere}
.explore-panel .explore-source-label{font-size:11px;color:var(--muted);margin:0}
.verb-playground{min-width:0}.verb-instruction{color:var(--muted);margin:0 0 14px}
.verb-controls{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}
.verb-controls label{display:inline-flex;flex:0 0 auto;align-items:center;gap:7px;min-height:36px;padding:7px;border:1px solid var(--line);background:var(--paper);font:12px/1.4 var(--body);white-space:nowrap;overflow-wrap:normal;cursor:pointer}
.verb-controls label:has(input:checked){background:var(--surface);border-color:var(--accent)}
.verb-controls input[type=checkbox]{flex:0 0 16px;accent-color:var(--accent);width:16px;height:16px;min-width:16px;max-width:16px;margin:0;padding:0}
.verb-output{border-left:4px solid var(--accent);padding:10px 12px;margin:14px 0;background:var(--surface);overflow-wrap:anywhere}
.verb-result-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--muted);font:11px/1.4 var(--body)}
.verb-result .verb-japanese{display:block;font:28px/2.1 var(--body)}
.verb-result mark{color:var(--ink);background:var(--sand,#e4cd9d);text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}
.verb-result .verb-state{font-size:11px;color:var(--muted);margin:4px 0 0}
.verb-reset{margin:0;padding:4px 8px;font-size:11px;background:var(--paper)}
.explore-panel a{font-size:11px;overflow-wrap:anywhere}
.explore-panel button:focus-visible,.explore-panel input:focus-visible,.explore-toggle:focus-visible,.definition-retry:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.verb-family-label{display:grid;gap:6px;font-size:12px;font-weight:600;margin:14px 0 0}
.verb-family{width:100%;min-width:0;max-width:100%;font:13px/1.5 var(--body);padding:9px;background:var(--paper);color:var(--ink);border:1px solid var(--line)}
.verb-explanation{color:var(--muted);font:12px/1.6 var(--body);margin:12px 0}
.verb-help{margin-top:14px;border-top:1px solid var(--line);padding-top:10px;color:var(--muted);font:11px/1.6 var(--body)}
.verb-help summary{cursor:pointer;font-weight:600}.verb-help p{font-size:11px}
.verb-ambiguity,.verb-base-choices{border:1px solid var(--line);padding:10px;margin:10px 0}
.verb-ambiguity button,.verb-base-choices button{margin:4px 6px 4px 0;max-width:100%;white-space:normal;overflow-wrap:anywhere;text-align:left}
.verb-family:focus-visible{outline:3px solid var(--accent);outline-offset:2px}.verb-playground [hidden]{display:none}
${mimeticStyles}
${meaningForkStyles}
`;
    }
  });

  // src/playground-data.ts
  var grammarGroups, playgroundData;
  var init_playground_data = __esm({
    "src/playground-data.ts"() {
      "use strict";
      grammarGroups = ["time", "reasons", "conditions", "comparison", "certainty", "wishes and obligations", "connecting ideas", "social tone"];
      playgroundData = async (query, signal) => {
        if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
        const reply = await chrome.runtime.sendMessage({ type: "playground-data", query });
        if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
        if (!reply || reply.error) throw new Error(reply?.error ?? "Local playground data is unavailable.");
        return reply.value;
      };
    }
  });

  // src/definitions.ts
  function dictionaryURL(language, word) {
    return `https://${language}.wiktionary.org/wiki/${encodeURIComponent(word)}#${language === "en" ? "Japanese" : "\u65E5\u672C\u8A9E"}`;
  }
  function definitionSource(page, language, word) {
    if (page.source === "jmdict") return {
      url: "https://www.edrdg.org/jmdict/j_jmdict.html",
      label: "JMdict \xB7 offline \u2197",
      notice: "JMdict \xB7 EDRDG \xB7 CC BY-SA 4.0 \xB7 Looked up on this device."
    };
    if (page.source === "jawiktionary") return {
      url: dictionaryURL("ja", page.title ?? word),
      label: "\u30A6\u30A3\u30AF\u30B7\u30E7\u30CA\u30EA\u30FC \xB7 \u30AA\u30D5\u30E9\u30A4\u30F3 \u2197",
      notice: "\u65E5\u672C\u8A9E\u7248\u30A6\u30A3\u30AF\u30B7\u30E7\u30CA\u30EA\u30FC \xB7 Kaikki/Wiktextract \xB7 CC BY-SA 4.0 \xB7 \u7AEF\u672B\u5185\u3067\u691C\u7D22\u3002"
    };
    return {
      url: dictionaryURL(language, page.title ?? word),
      label: language === "en" ? "English Wiktionary \u2197" : "\u30A6\u30A3\u30AF\u30B7\u30E7\u30CA\u30EA\u30FC\u65E5\u672C\u8A9E\u7248 \u2197",
      notice: "Wiktionary \xB7 CC BY-SA \xB7 Only the lookup term and any spelling-reference terms are sent."
    };
  }
  var init_definitions = __esm({
    "src/definitions.ts"() {
      "use strict";
    }
  });

  // src/playground-tools.ts
  function node(tag, className = "", text) {
    const el = document.createElement(tag);
    el.className = className;
    if (text !== void 0) el.textContent = text;
    return el;
  }
  function button(label, action, className = "") {
    const el = node("button", className, label);
    el.type = "button";
    el.addEventListener("click", action);
    return el;
  }
  function labelInput(label, placeholder) {
    const wrap = node("label", "tool-label", label), input = node("input");
    input.type = "search";
    input.maxLength = 80;
    input.placeholder = placeholder;
    input.autocomplete = "off";
    input.spellcheck = false;
    wrap.append(input);
    return { wrap, input };
  }
  function workspace(name) {
    const root = node("section", "playground-workspace");
    root.setAttribute("aria-label", name);
    const scroller = node("div", "tool-scroll"), layout = node("div", "tool-layout"), catalog = node("div", "tool-catalog"), detail = node("section", "tool-detail");
    detail.hidden = true;
    detail.tabIndex = -1;
    detail.setAttribute("aria-label", `${name} details`);
    const status2 = node("p", "tool-status");
    status2.setAttribute("role", "status");
    const results = node("div", "tool-results");
    catalog.append(status2, results);
    layout.append(catalog, detail);
    scroller.append(layout);
    root.append(scroller);
    let origin, scroll = 0;
    function back(restoreFocus = true) {
      detail.hidden = true;
      root.classList.remove("has-detail");
      scroller.scrollTop = scroll;
      if (restoreFocus) origin?.focus({ preventScroll: true });
      root.dispatchEvent(new Event("tool-results"));
    }
    const backButton = button("\u2190 Results", () => back(), "tool-back");
    backButton.setAttribute("aria-label", "Results");
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !detail.hidden) {
        e.preventDefault();
        e.stopPropagation();
        back();
      }
    });
    function show(content, from) {
      if (detail.hidden) scroll = scroller.scrollTop;
      else if (from && catalog.contains(from)) scroll = catalog.scrollTop;
      if (from && catalog.contains(from)) origin = from;
      detail.replaceChildren(backButton, content);
      detail.hidden = false;
      root.classList.add("has-detail");
      scroller.scrollTop = 0;
      catalog.scrollTop = scroll;
      detail.scrollTop = 0;
      detail.focus({ preventScroll: true });
    }
    function error(target, error2, retry) {
      const p2 = node("p", "tool-error", error2 instanceof Error ? error2.message : "Could not load local data.");
      p2.setAttribute("role", "status");
      target.replaceChildren(p2, button("Try again", retry));
    }
    return { root, scroller, backButton, catalog, status: status2, results, detail, show, back, error };
  }
  function source(target, page, language, word) {
    const attribution = definitionSource(page, language, word), link = node("a", "tool-source", attribution.label);
    link.href = attribution.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    target.append(link, node("p", "tool-source", attribution.notice));
  }
  function onlineButton(options, target, word, language, alive) {
    const action = button(`Look up ${language === "en" ? "English" : "Japanese"} online`, () => {
      action.disabled = true;
      target.setAttribute("aria-busy", "true");
      void options.data({ op: "online", word, language }).then((page) => {
        if (!alive()) return;
        const content = node("div");
        content.append(node("p", "", page.status === "ok" ? "Online definitions" : page.status === "missing" ? "No Japanese entry was found in this Wiktionary edition." : "Online lookup could not finish. Try again."));
        for (const definition of page.definitions) content.append(node("p", "", definition));
        if (page.status === "ok") source(content, page, language, word);
        target.replaceChildren(content);
        if (page.status === "error") onlineButton(options, target, word, language, alive);
      }).catch((error) => {
        if (alive()) {
          target.replaceChildren(node("p", "tool-error", String(error)));
          onlineButton(options, target, word, language, alive);
        }
      }).finally(() => {
        target.removeAttribute("aria-busy");
      });
    });
    target.append(node("p", "tool-source", `Sends \u201C${word}\u201D to ${language === "en" ? "English" : "Japanese"} Wiktionary only when selected.`), action);
  }
  function renderDictionaryTool(options, initialWord = "", initialEntry) {
    const view = workspace("Dictionary"), { wrap, input } = labelInput("Search dictionary", "Japanese, reading, or English meaning");
    const form = node("form", "tool-search");
    form.append(wrap, button("Search locally", () => void search()));
    view.catalog.prepend(node("p", "playground-intro", "Search the bundled dictionaries. Online lookup is optional."), form);
    input.value = initialEntry?.headword ?? initialWord;
    let disposed = false, composing = false, timer, sequence = 0, detailVersion = 0, total = 0, hits = [], query = "", controller;
    let formProbe, completedSequence = -1, suggestedSequence = -1;
    const active = () => !disposed;
    const more = button("Show more", () => void search(true));
    more.hidden = true;
    async function open(hit, origin) {
      const version = ++detailVersion, content = node("article");
      formProbe = void 0;
      content.append(node("p", "", "Loading local entry\u2026"));
      view.show(content, origin);
      try {
        const entry = await options.data({ op: "entry", id: hit.id, bucket: hit.bucket });
        if (disposed || version !== detailVersion) return;
        content.replaceChildren(node("h2", "tool-heading", hit.headword), node("p", "tool-reading", hit.reading));
        const spellings2 = node("details");
        spellings2.append(node("summary", "", "Spellings and readings"));
        for (const reading of entry.readings) {
          const allowed = reading.noKanji ? [] : entry.spellings.filter((s) => !reading.restrict.length || reading.restrict.includes(s.text));
          spellings2.append(node("p", "", `${allowed.map((s) => s.text).join(" / ") || "Kana only"} \u2014 ${reading.text}${reading.info.length ? ` \xB7 ${reading.info.join("; ")}` : ""}`));
        }
        for (const spelling of entry.spellings) if (spelling.info.length) spellings2.append(node("p", "", `${spelling.text}: ${spelling.info.join("; ")}`));
        content.append(spellings2);
        content.append(node("h3", "", "English senses"));
        const senses = node("ol", "dictionary-senses");
        entry.senses.forEach((sense, index) => {
          const li = node("li");
          li.append(node("p", "tool-sense-label", sense.pos.join(" \xB7 ")), node("p", "", sense.glosses.join("; ")));
          const labels = [...sense.field, ...sense.misc, ...sense.dialect, ...sense.info];
          if (labels.length) li.append(node("p", "tool-source", labels.join(" \xB7 ")));
          if (sense.spellings.length || sense.readings.length) li.append(node("p", "tool-source", `Applies to: ${[...sense.spellings, ...sense.readings].join(" / ")}`));
          if (index < 4) senses.append(li);
          else {
            let extra = content.querySelector(".dictionary-more");
            if (!extra) {
              extra = node("details", "dictionary-more");
              extra.append(node("summary", "", "More senses"), node("ol"));
              content.append(extra);
            }
            extra.querySelector("ol").append(li);
          }
        });
        content.insertBefore(senses, content.querySelector(".dictionary-more"));
        source(content, { status: "ok", definitions: [], source: "jmdict" }, "en", hit.headword);
        if (hit.headword.length <= 40 && entry.senses.some((s) => s.pos.some((p2) => /\bverb\b|adjectiv/.test(p2)))) {
          let probed = false;
          formProbe = () => {
            if (view.root.hidden || probed || disposed || version !== detailVersion) return;
            probed = true;
            void options.tokenize([hit.headword], new AbortController().signal).then((words) => {
              if (disposed || version !== detailVersion) return;
              if (dictionaryVerbCandidates(hit.headword, words[0] ?? []).length || dictionaryAdjectiveCandidates(hit.headword, words[0] ?? []).length) content.append(button("Try word forms", () => options.forms(hit.headword)));
            }).catch(() => {
            });
          };
          formProbe();
        }
        const ja = node("section", "dictionary-japanese");
        ja.append(node("h3", "", "Japanese definitions"), node("p", "", "Checking the local Japanese dictionary\u2026"));
        content.append(ja);
        const showJapanese = async () => {
          try {
            const page = await options.data({ op: "japanese", word: hit.headword });
            if (disposed || version !== detailVersion) return;
            ja.replaceChildren(node("h3", "", "Japanese definitions"));
            if (page.status === "ok") {
              for (const definition of page.definitions) ja.append(node("p", "", definition));
              source(ja, page, "ja", hit.headword);
            } else {
              ja.append(node("p", "", "No bundled Japanese definition for this word."));
              onlineButton(options, ja, hit.headword, "ja", () => active() && version === detailVersion);
            }
          } catch (error) {
            if (active() && version === detailVersion) view.error(ja, error, () => void showJapanese());
          }
        };
        void showJapanese();
      } catch (error) {
        if (active() && version === detailVersion) view.error(content, error, () => void open(hit, origin));
      }
    }
    function render2() {
      view.results.replaceChildren();
      for (const hit of hits) {
        const item = button("", () => void open(hit, item), "tool-result");
        item.append(annotated(hit.headword, hit.reading), node("span", "tool-sense-label", hit.pos.join(" \xB7 ")), node("span", "", hit.meaning));
        view.results.append(item);
      }
      more.hidden = hits.length >= total;
      view.results.append(more);
    }
    async function suggestions(value, id) {
      if (view.root.hidden || suggestedSequence === id || !japanese3(value) || value.length > 40 || !/^[\p{L}々ー]+$/u.test(value)) return;
      suggestedSequence = id;
      const signal = controller.signal;
      try {
        const words = (await options.tokenize([value], signal))[0] ?? [];
        if (disposed || id !== sequence) return;
        const candidates = /* @__PURE__ */ new Set();
        for (const [i] of words.entries()) {
          const verb = buildVerbPlayground(value, words, i), adjective = buildAdjectivePlayground(value, words, i);
          if (verb && verb.start === 0 && verb.end === value.length) candidates.add((verb.base.prefix ?? "") + verb.base.lemma);
          if (adjective && adjective.start === 0 && adjective.end === value.length) candidates.add(adjective.base.lemma);
        }
        for (const candidate of candidates) {
          const result = await options.data({ op: "search", query: candidate, offset: 0 }, signal);
          if (disposed || id !== sequence) return;
          if (result.hits.some((h) => h.headword === candidate)) view.results.append(button(`Look up dictionary form: ${candidate}`, () => {
            input.value = candidate;
            void search();
          }));
        }
      } catch {
      }
    }
    async function search(append2 = false) {
      clearTimeout(timer);
      if (disposed || composing) return;
      const value = input.value.normalize("NFKC").trim();
      if (append2 && value !== query) return;
      const id = ++sequence;
      controller?.abort();
      controller = new AbortController();
      if (!append2) {
        detailVersion++;
        view.back(false);
        hits = [];
        total = 0;
        view.results.replaceChildren();
      }
      query = value;
      if (!value) {
        view.status.textContent = "Enter a Japanese word, reading, or English meaning.";
        return;
      }
      view.status.textContent = "Searching on this device\u2026";
      more.disabled = true;
      try {
        const result = await options.data({ op: "search", query: value, offset: append2 ? hits.length : 0 }, controller.signal);
        if (disposed || id !== sequence) return;
        hits = append2 ? [...hits, ...result.hits] : result.hits;
        total = result.total;
        view.status.textContent = `${total} entries \xB7 offline`;
        render2();
        if (!total) {
          view.status.textContent = japanese3(value) ? "No matching English dictionary entry in the bundled data." : "No matching English meaning. Try a shorter or different word.";
          if (japanese3(value)) {
            const local = node("section"), english = node("section");
            local.append(node("h3", "", "Japanese definitions"));
            english.append(node("h3", "", "English definitions"));
            view.results.append(local, english);
            onlineButton(options, english, value, "en", () => active() && id === sequence);
            const page = await options.data({ op: "japanese", word: value }, controller.signal);
            if (disposed || id !== sequence) return;
            if (page.status === "ok") {
              for (const definition of page.definitions) local.append(node("p", "", definition));
              source(local, page, "ja", value);
            } else onlineButton(options, local, value, "ja", () => active() && id === sequence);
          }
        }
        completedSequence = id;
        if (!append2) void suggestions(value, id);
      } catch (error) {
        if (active() && id === sequence) view.error(view.results, error, () => void search());
      } finally {
        if (id === sequence) more.disabled = false;
      }
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      void search();
    });
    input.addEventListener("compositionstart", () => {
      composing = true;
      clearTimeout(timer);
      controller?.abort();
      sequence++;
    });
    input.addEventListener("compositionend", () => {
      composing = false;
      void search();
    });
    input.addEventListener("input", () => {
      clearTimeout(timer);
      controller?.abort();
      sequence++;
      if (!composing) timer = setTimeout(() => void search(), 180);
    });
    if (initialEntry) {
      view.status.textContent = "Search locally for more entries.";
      void open(initialEntry, input);
    } else if (initialWord) void search();
    else view.status.textContent = "Enter a Japanese word, reading, or English meaning.";
    return { element: view.root, focus: () => {
      formProbe?.();
      if (completedSequence === sequence) void suggestions(query, sequence);
      (initialEntry && !view.detail.hidden ? view.detail : input).focus();
    }, dispose: () => {
      disposed = true;
      sequence++;
      detailVersion++;
      clearTimeout(timer);
      controller?.abort();
    } };
  }
  function renderGrammarExample(example, options, lens) {
    const wrap = node("div", "grammar-example"), sentence = node("p", "grammar-sentence");
    for (const segment of example.segments) {
      const text = segment.reading ? annotated(segment.text, segment.reading) : document.createTextNode(segment.text);
      if (segment.role) {
        const part = button("", () => {
          lens.textContent = segment.role;
          wrap.querySelectorAll(".grammar-highlight").forEach((el) => el.setAttribute("aria-pressed", String(el === part)));
        }, "grammar-highlight"), mark = node("span", "grammar-mark");
        part.setAttribute("aria-pressed", "false");
        part.setAttribute("aria-label", `${segment.text}: explain construction`);
        mark.append(text);
        part.append(mark);
        sentence.append(part);
      } else if (segment.lemma) {
        const word = button("", () => options.dictionary(segment.lemma), "grammar-word"), mark = node("span", "grammar-mark");
        word.setAttribute("aria-label", `Look up ${segment.lemma}`);
        mark.append(text);
        word.append(mark);
        sentence.append(word);
      } else sentence.append(text);
    }
    wrap.append(sentence, node("p", "grammar-translation", example.translation), node("p", "tool-source", example.note));
    return wrap;
  }
  function renderGrammarTool(options) {
    const panel = options.presentation === "panel";
    const view = workspace("Grammar"), { wrap, input } = labelInput("Search grammar", "Pattern, reading, romaji, or what you want to express");
    const filters = node("div", "grammar-filters"), levelLabel = node("label", "tool-label", "Level"), level = node("select");
    level.setAttribute("aria-label", "Grammar level");
    for (const value of ["All", "N5", "N4", "N3", "N2", "N1"]) {
      const opt = node("option", "", value === "All" ? "All levels" : value);
      opt.value = value;
      level.append(opt);
    }
    level.value = "N5";
    levelLabel.append(level);
    const groupLabel = node("label", "tool-label", "Meaning group"), group = node("select");
    group.setAttribute("aria-label", "Grammar meaning group");
    const all = node("option", "", "All meanings");
    all.value = "";
    group.append(all);
    for (const value of grammarGroups) {
      const opt = node("option", "", value);
      opt.value = value;
      group.append(opt);
    }
    groupLabel.append(group);
    filters.append(levelLabel, groupLabel);
    view.catalog.prepend(node("p", "playground-intro", "Sentence Lens \xB7 explore what grammar changes in a sentence."), wrap, filters);
    const filterSummary = node("summary");
    if (panel) {
      view.root.classList.add("panel-grammar");
      const controls = node("div", "grammar-controls"), disclosure = node("details", "grammar-filter-disclosure");
      disclosure.append(filterSummary, filters);
      controls.append(wrap, disclosure, view.status);
      view.catalog.querySelector(".playground-intro")?.remove();
      view.catalog.prepend(controls);
      view.backButton.textContent = "\u2190 Back to results";
      view.backButton.setAttribute("aria-label", "Back to results");
    }
    let disposed = false, index = [], version = 0, composing = false, limit = 30;
    view.root.addEventListener("tool-results", () => {
      version++;
    });
    let matches2 = [], rendered = 0;
    const sentinel = node("p", "grammar-list-end");
    function appendBatch() {
      if (disposed || !panel || !view.detail.hidden || view.root.getClientRects().length === 0) return;
      const end = Math.min(rendered + 30, matches2.length), fragment = document.createDocumentFragment();
      for (const summary of matches2.slice(rendered, end)) fragment.append(result(summary));
      view.results.append(fragment);
      rendered = end;
      view.status.textContent = `${rendered} of ${matches2.length} grammar points \xB7 offline`;
      sentinel.textContent = rendered === matches2.length && matches2.length ? "End of results" : "";
      observer?.unobserve(sentinel);
      if (rendered < matches2.length) observer?.observe(sentinel);
    }
    const observer = panel ? new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && sentinel.getBoundingClientRect().top <= view.scroller.getBoundingClientRect().bottom + 300) appendBatch();
    }, { root: view.scroller, rootMargin: "0px 0px 300px 0px" }) : void 0;
    function result(summary) {
      const b = button("", () => void open(summary, b), "tool-result");
      b.append(node("span", "tool-pattern", summary.pattern), node("span", "tool-source", summary.level), node("span", "", summary.purpose));
      return b;
    }
    const normalize3 = (s) => s.normalize("NFKC").toLocaleLowerCase("en").replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96));
    async function open(summary, origin) {
      const id = ++version, content = node("article");
      content.append(node("p", "", "Opening local grammar\u2026"));
      view.show(content, origin);
      try {
        const point = await options.data({ op: "grammar", id: summary.id });
        if (disposed || id !== version) return;
        const lens = node("p", "grammar-lens", grammarHint);
        lens.setAttribute("role", "status");
        content.replaceChildren(node("p", "tool-source", `${point.level} \xB7 study reference`), node("h2", "tool-heading", point.pattern), node("p", "grammar-purpose", point.purpose));
        content.append(renderGrammarExample(point.examples[0], options, lens), lens);
        const extra = node("details", "grammar-examples");
        extra.append(node("summary", "", "More examples"));
        for (const example of point.examples.slice(1)) extra.append(renderGrammarExample(example, options, lens));
        content.append(extra);
        const details = node("details", "grammar-notes");
        details.append(node("summary", "", "Formation and usage"));
        details.append(node("h3", "", "How it is formed"));
        for (const rule of point.formation) details.append(node("p", "", rule));
        details.append(node("h3", "", "Register"), node("p", "", point.register), node("h3", "", "Usage limits"), node("p", "", point.restrictions), node("h3", "", "Watch out"), node("p", "", point.mistake));
        content.append(details);
        for (const comparisonId of point.comparisons) {
          const comparison = node("section", "grammar-comparison");
          content.append(comparison);
          const loadComparison = async () => {
            try {
              const data = await options.data({ op: "comparison", id: comparisonId });
              if (disposed || id !== version) return;
              const output = node("div"), explanation = node("p", "grammar-change"), choices = node("div", "grammar-switches"), clens = node("p", "grammar-lens");
              clens.setAttribute("role", "status");
              explanation.setAttribute("aria-live", "polite");
              const familyOption = content.querySelector(`select[aria-label="Comparison family"] option[value="${point.comparisons.indexOf(comparisonId)}"]`);
              if (familyOption) familyOption.textContent = data.title;
              comparison.setAttribute("aria-label", data.title);
              choices.setAttribute("role", "group");
              choices.setAttribute("aria-label", `Compare: ${data.title}`);
              comparison.replaceChildren(node("h3", "", `Compare: ${data.title}`), choices, output, explanation, clens);
              const buttons = [];
              const choose = (n) => {
                output.replaceChildren(renderGrammarExample(data.variants[n].example, options, clens));
                explanation.textContent = `What changed? ${data.variants[n].change}`;
                clens.textContent = grammarHint;
                buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(i === n)));
              };
              data.variants.forEach((variant, n) => {
                const b = button(variant.label, () => choose(n));
                buttons.push(b);
                choices.append(b);
              });
              choose(0);
              const activity = node("details", "grammar-activity"), feedback = node("p");
              feedback.setAttribute("role", "status");
              activity.append(node("summary", "", "Choose the meaning"), node("p", "", data.question));
              data.answers.forEach((answer, n) => activity.append(button(answer, () => {
                feedback.textContent = `${n === data.correct ? "Yes." : "Try another interpretation."} ${data.feedback}`;
              })));
              activity.append(feedback);
              comparison.append(activity);
            } catch (error) {
              if (!disposed && id === version) view.error(comparison, error, () => void loadComparison());
            }
          };
          void loadComparison();
        }
        const related = node("nav", "grammar-related");
        related.setAttribute("aria-label", "Related grammar");
        for (const relatedId of point.related) {
          const summary2 = index.find((p2) => p2.id === relatedId);
          if (summary2) {
            const b = button(summary2.pattern, () => void open(summary2, b));
            related.append(b);
          }
        }
        if (related.childElementCount) content.append(node("h3", "", "Related grammar"), related);
        content.append(node("p", "tool-source", "Original K\u014D explanations and examples. JLPT levels are study references, not an official syllabus."));
        if (panel) panelDetails(content, point, lens);
      } catch (error) {
        if (!disposed && id === version) view.error(content, error, () => void open(summary, origin));
      }
    }
    function panelDetails(content, point, lens) {
      const toolbar = node("div", "grammar-detail-toolbar"), tabs = node("div", "grammar-section-tabs");
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Grammar sections");
      const heading = content.querySelector(".tool-heading"), levelInfo = content.querySelector(".tool-source");
      toolbar.append(view.backButton, heading, levelInfo, tabs);
      const example = node("section"), usage = node("section"), compare = node("section");
      const purpose = content.querySelector(".grammar-purpose");
      const exampleHost = node("div"), exampleNav = node("div", "grammar-example-nav"), count = node("span");
      count.setAttribute("role", "status");
      let selected = 0;
      const previous = button("Previous", () => showExample(selected - 1)), next = button("Next", () => showExample(selected + 1));
      function showExample(n) {
        selected = n;
        exampleHost.replaceChildren(renderGrammarExample(point.examples[n], options, lens));
        lens.textContent = grammarHint;
        count.textContent = `${n + 1} / ${point.examples.length}`;
        previous.disabled = n === 0;
        next.disabled = n === point.examples.length - 1;
      }
      exampleNav.append(previous, count, next);
      example.append(purpose, exampleHost, lens, exampleNav);
      showExample(0);
      const notes = content.querySelector(".grammar-notes");
      notes.querySelector("summary")?.remove();
      usage.append(...Array.from(notes.childNodes));
      const related = content.querySelector(".grammar-related");
      if (related) usage.append(node("h3", "", "Related grammar"), related);
      const families = Array.from(content.querySelectorAll(".grammar-comparison"));
      if (families.length > 1) {
        const label = node("label", "tool-label", "Comparison"), select = node("select");
        select.setAttribute("aria-label", "Comparison family");
        point.comparisons.forEach((_, i) => {
          const option = node("option", "", `Comparison ${i + 1}`);
          option.value = String(i);
          select.append(option);
        });
        select.onchange = () => families.forEach((family, i) => {
          family.hidden = i !== Number(select.value);
        });
        label.append(select);
        compare.append(label);
      }
      families.forEach((family, i) => {
        family.hidden = i !== 0;
        compare.append(family);
      });
      const sections = [["Example", example], ["Usage", usage], ...families.length ? [["Compare", compare]] : []];
      const buttons = [], positions = /* @__PURE__ */ new Map();
      let active = example;
      function choose(n, focus = false) {
        positions.set(active, view.scroller.scrollTop);
        active = sections[n][1];
        sections.forEach(([, section], i) => {
          section.hidden = i !== n;
          buttons[i].setAttribute("aria-selected", String(i === n));
          buttons[i].tabIndex = i === n ? 0 : -1;
        });
        view.scroller.scrollTop = positions.get(active) ?? 0;
        if (focus) buttons[n].focus();
      }
      const prefix = `grammar-section-${++grammarSectionSequence}`;
      sections.forEach(([name, section], i) => {
        const b = button(name, () => choose(i));
        b.setAttribute("role", "tab");
        b.id = `${prefix}-${i}`;
        section.id = `${prefix}-${i}-pane`;
        b.setAttribute("aria-controls", section.id);
        section.setAttribute("role", "tabpanel");
        section.setAttribute("aria-labelledby", b.id);
        b.onkeydown = (e) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
          e.preventDefault();
          choose(e.key === "Home" ? 0 : e.key === "End" ? sections.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + sections.length) % sections.length, true);
        };
        buttons.push(b);
        tabs.append(b);
      });
      const attribution = content.lastElementChild;
      content.replaceChildren(toolbar, ...sections.map(([, section]) => section), attribution);
      choose(0);
    }
    function render2(reset = true) {
      if (composing || disposed) return;
      if (reset) limit = 30;
      const tokens = normalize3(input.value).trim().split(/\s+/u).filter((token) => token && !["a", "an", "the", "to", "of"].includes(token));
      matches2 = index.filter((p2) => (level.value === "All" || p2.level === level.value) && (!group.value || p2.groups.includes(group.value)) && tokens.every((t) => normalize3([p2.pattern, ...p2.aliases, p2.purpose, ...p2.keywords].join(" ")).includes(t)));
      view.status.textContent = `${matches2.length} grammar points \xB7 offline`;
      view.results.replaceChildren();
      if (panel) {
        observer?.disconnect();
        rendered = 0;
        view.scroller.scrollTop = 0;
        filterSummary.textContent = `Filters \xB7 ${level.value === "All" ? "All levels" : level.value} \xB7 ${group.value || "All meanings"}`;
        view.catalog.append(sentinel);
        observer?.observe(sentinel);
        appendBatch();
      } else {
        for (const summary of matches2.slice(0, limit)) view.results.append(result(summary));
        if (matches2.length > limit) view.results.append(button("Show more", () => {
          limit += 30;
          render2(false);
        }));
      }
      if (!matches2.length) view.results.append(node("p", "", "No matches. Try All levels, another spelling, or a meaning such as \u201Creason\u201D."));
    }
    async function load() {
      view.status.textContent = "Opening the local grammar collection\u2026";
      try {
        index = await options.data({ op: "grammar-index" });
        if (!disposed) render2();
      } catch (error) {
        if (!disposed) view.error(view.results, error, () => void load());
      }
    }
    input.addEventListener("input", () => render2());
    input.addEventListener("compositionstart", () => {
      composing = true;
    });
    input.addEventListener("compositionend", () => {
      composing = false;
      render2();
    });
    level.addEventListener("change", () => {
      version++;
      view.back(false);
      render2();
    });
    group.addEventListener("change", () => {
      version++;
      view.back(false);
      render2();
    });
    void load();
    return { element: view.root, focus: () => {
      if (panel && !view.detail.hidden) view.detail.focus({ preventScroll: true });
      else input.focus({ preventScroll: true });
    }, dispose: () => {
      disposed = true;
      version++;
      observer?.disconnect();
    } };
  }
  var japanese3, grammarHint, grammarSectionSequence, playgroundToolStyles;
  var init_playground_tools = __esm({
    "src/playground-tools.ts"() {
      "use strict";
      init_exploration();
      init_verb_playground();
      init_adjective_playground();
      init_definitions();
      init_playground_data();
      japanese3 = (q2) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(q2);
      grammarHint = "Select highlighted grammar to see its role. Dotted words open the dictionary.";
      grammarSectionSequence = 0;
      playgroundToolStyles = `
.playground-workspaces,.legacy-playground{display:flex;flex-direction:column;flex:1;min-height:0;height:100%}
.playground-workspace{display:flex;flex:1;min-height:0;min-width:0;container-type:inline-size}.tool-scroll{overflow:auto;overscroll-behavior:contain;width:100%;padding:16px;min-height:0}
.tool-layout{display:grid;gap:20px;min-width:0}.tool-catalog,.tool-detail{min-width:0}.has-detail .tool-catalog{display:none}.tool-detail:focus{outline:none}
.tool-label{display:grid;gap:6px;font-size:12px;font-weight:600;margin-bottom:12px}.tool-label input,.tool-label select{font:13px/1.5 var(--body);padding:10px;background:var(--paper);color:var(--ink);border:1px solid var(--line);width:100%;min-width:0}
.tool-search>button{margin:0}.tool-status{font-size:12px;color:var(--muted)}.tool-results{display:grid;gap:8px}.tool-result{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:12px!important;white-space:normal;overflow-wrap:anywhere;margin:0!important}
.tool-result ruby,.tool-pattern{font-size:20px;font-weight:500;color:var(--accent)}.tool-sense-label,.tool-source{font-size:11px;color:var(--muted);font-weight:400}.tool-heading{font:700 25px/1.6 var(--body);margin:12px 0}.tool-reading{font-size:16px}.tool-back{margin:0!important;padding:5px 0!important;border:0!important;color:var(--accent);background:transparent!important}
.tool-detail p{overflow-wrap:anywhere}.tool-detail details{margin:14px 0;padding:10px 0;border-block:1px solid var(--surface)}.tool-detail summary{cursor:pointer;font-weight:600}.dictionary-senses{padding-left:22px}.dictionary-senses li{padding-bottom:8px}.dictionary-senses p{margin:4px 0}.dictionary-japanese{border-top:1px solid var(--line);margin-top:18px}.dictionary-more ol{padding-left:22px}
.grammar-filters{display:grid;grid-template-columns:1fr 1fr;gap:10px}.grammar-purpose{font-size:15px}.grammar-sentence{font:22px/2.5 var(--body);overflow-wrap:anywhere}.grammar-sentence button{display:inline!important;font:inherit!important;padding:0!important;margin:0!important;white-space:normal!important;border:0;background:transparent;color:inherit;text-decoration:none}.grammar-mark{padding:1px 2px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.grammar-highlight .grammar-mark{background:var(--surface)}.grammar-highlight[aria-pressed=true] .grammar-mark{box-shadow:inset 0 0 0 1px var(--seal)}.grammar-word .grammar-mark{text-decoration:underline dotted;text-decoration-thickness:1px;text-underline-offset:.18em}.grammar-translation{font-size:14px}.grammar-lens{padding:10px;border-left:3px solid var(--accent);background:var(--surface);font-size:12px}.grammar-comparison{margin-top:24px;border-top:2px solid var(--line)}
.grammar-switches,.grammar-related{display:flex;gap:6px;flex-wrap:wrap}.grammar-switches button,.grammar-related button{margin:0!important}.grammar-switches [aria-pressed=true]{background:var(--accent);color:var(--paper)}.grammar-change{font-size:12px}.grammar-activity button{display:block;margin:8px 0!important;text-align:left}.playground-route-back{margin:0!important;padding:8px 16px!important;text-align:left;font-size:12px}
.panel-playground-picker{display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:1px solid var(--line);font-size:12px;flex:none}
.panel-playground-picker select{flex:1;min-width:0;padding:6px;font:inherit;background:var(--paper);color:var(--ink);border:1px solid var(--line)}
.panel-grammar .tool-scroll{padding:0 12px 12px;scroll-padding-top:160px}
.panel-grammar .tool-layout{display:block}.panel-grammar .grammar-controls{position:sticky;top:0;z-index:2;background:var(--paper);padding:10px 0 6px;border-bottom:1px solid var(--surface)}
.panel-grammar .tool-label{margin-bottom:6px}.panel-grammar .tool-label input,.panel-grammar .tool-label select{padding:6px}
.panel-grammar .grammar-filter-disclosure{font-size:12px}.panel-grammar summary{cursor:pointer;min-height:32px;padding:6px 0}
.panel-grammar .tool-status{margin:6px 0}.panel-grammar .tool-results{gap:0}
.panel-grammar .tool-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;padding:9px 2px!important;background:transparent;border:0;border-bottom:1px solid var(--surface);width:100%;font:14px/1.5 var(--body)}
.panel-grammar .tool-result>:last-child{grid-column:1/-1}.panel-grammar .tool-pattern{font-size:18px}.panel-grammar .tool-result:hover{background:var(--surface)}
.panel-grammar .grammar-list-end{font-size:12px;color:var(--muted);min-height:1px}
.panel-grammar .grammar-detail-toolbar{position:sticky;top:0;z-index:2;background:var(--paper);padding:6px 0;border-bottom:1px solid var(--line)}
.panel-grammar .tool-heading{font-size:22px;line-height:1.4;margin:2px 0}.panel-grammar .grammar-detail-toolbar>.tool-source{margin:2px 0 6px}
.panel-grammar .grammar-section-tabs,.panel-grammar .grammar-example-nav{display:flex;align-items:center;gap:6px}
.panel-grammar .grammar-section-tabs button{flex:1;margin:0}.panel-grammar .grammar-section-tabs [aria-selected=true]{background:var(--accent);color:var(--paper)}
.panel-grammar button{min-height:32px}.panel-grammar .grammar-sentence button{min-height:0}
.panel-grammar .grammar-example-nav{justify-content:space-between}.panel-grammar .grammar-example-nav button{margin:0}
.panel-grammar .tool-detail{font-size:14px}.panel-grammar .grammar-sentence{font-size:20px;line-height:2.5;overflow-wrap:normal;line-break:strict;word-break:normal}
.panel-grammar .grammar-lens{font-size:14px}.panel-grammar .grammar-comparison{margin-top:12px;border-top:0}
@container(min-width:740px){.has-detail .tool-scroll{overflow:hidden}.has-detail .tool-catalog{display:block;overflow:auto;overscroll-behavior:contain}.has-detail .tool-layout{height:100%;grid-template-columns:minmax(230px,1fr) minmax(0,1.8fr)}.has-detail .tool-detail{overflow:auto;overscroll-behavior:contain;border-left:1px solid var(--line);padding-left:20px}}
@container(max-width:440px){.playground-tabs{display:grid;grid-template-columns:1fr 1fr}.grammar-filters{grid-template-columns:1fr}.grammar-sentence{font-size:20px}}
@media(max-width:440px){.playground-tabs{display:grid;grid-template-columns:1fr 1fr}.grammar-filters{grid-template-columns:1fr}.grammar-sentence{font-size:20px}}
`;
    }
  });

  // src/playground-browser.ts
  function element2(tag, className, text) {
    const node2 = document.createElement(tag);
    node2.className = className;
    if (text !== void 0) node2.textContent = text;
    return node2;
  }
  function classLabel(base) {
    if (base.verbClass === "\u4E00\u6BB5") return "Ichidan";
    if (base.verbClass.startsWith("\u4E94\u6BB5")) return "Godan";
    if (base.verbClass.startsWith("\u30B5\u5909")) return "\u3059\u308B irregular";
    if (base.verbClass.startsWith("\u30AB\u5909")) return "\u6765\u308B irregular";
    return base.verbClass;
  }
  function renderLegacyPlaygroundBrowser(options, initial = "verbs") {
    const root = element2("section", "playground-browser");
    root.setAttribute("aria-label", "Playgrounds");
    const panelId = `ko-playground-pane-${++browserSequence}`;
    let tab = "verbs", disposed = false, request = 0, controller;
    let catalogScroll = 0, returnFocus;
    const cancel2 = () => {
      request++;
      controller?.abort();
      controller = void 0;
      form.removeAttribute("aria-busy");
      submit.disabled = false;
    };
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      cancel2();
    };
    const verbIntro = "Enter a dictionary-form verb or adjective here, or open a word\u2019s playground in Reading view. Everything works offline.";
    const intro = element2("p", "playground-intro", verbIntro);
    const tabs = element2("div", "playground-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Playground type");
    const filters = element2("div", "playground-filters");
    const searchLabel = element2("label", "", "Search expressions");
    const search = element2("input", "playground-search");
    search.type = "search";
    search.maxLength = 80;
    search.setAttribute("aria-label", "Search mimetic expressions");
    search.placeholder = "Japanese, reading, or English";
    searchLabel.append(search);
    const categoryLabel = element2("label", "", "Category");
    const category = element2("select", "playground-category");
    category.setAttribute("aria-label", "Mimetic category");
    const all = element2("option", "", "All categories");
    all.value = "";
    category.append(all);
    for (const [value, label] of categories) {
      const option = element2("option", "", label);
      option.value = value;
      category.append(option);
    }
    categoryLabel.append(category);
    filters.hidden = true;
    filters.append(searchLabel, categoryLabel);
    const form = element2("form", "playground-verb-input");
    form.noValidate = true;
    const inputLabel = element2("label", "", "Dictionary-form word");
    const input = element2("input", "");
    input.type = "text";
    input.maxLength = 40;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "\u98DF\u3079\u308B, \u9AD8\u3044, or \u9759\u304B";
    inputLabel.append(input);
    const submit = element2("button", "", "Check word locally");
    submit.type = "submit";
    const feedback = element2("p", "playground-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    const confirmation = element2("div", "playground-confirmation");
    form.append(inputLabel, submit, feedback, confirmation);
    const count = element2("p", "playground-count");
    count.setAttribute("role", "status");
    count.hidden = true;
    const results = element2("div", "playground-results");
    results.setAttribute("aria-label", "Mimetic expressions");
    results.hidden = true;
    const selection = element2("div", "playground-selection");
    const catalog = element2("div", "playground-catalog");
    catalog.append(intro, form, filters, count, results);
    const detailNav = element2("div", "playground-detail-nav");
    detailNav.hidden = true;
    const back = element2("button", "playground-back", "\u2190 Examples");
    back.type = "button";
    back.setAttribute("aria-label", "Back to examples");
    detailNav.append(back);
    const scroller = element2("div", "playground-scroll");
    const backToExamples = () => {
      selection.replaceChildren();
      catalog.hidden = false;
      detailNav.hidden = true;
      scroller.scrollTop = catalogScroll;
      if (tab === "verbs") {
        confirmation.replaceChildren();
        feedback.textContent = "";
        input.focus({ preventScroll: true });
        input.select();
      } else (returnFocus?.isConnected ? returnFocus : search).focus({ preventScroll: true });
    };
    back.addEventListener("click", backToExamples);
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && catalog.hidden) {
        event.preventDefault();
        event.stopPropagation();
        backToExamples();
      }
    });
    const showSelection = (panel, origin) => {
      if (!catalog.hidden) catalogScroll = scroller.scrollTop;
      back.textContent = tab === "verbs" ? "\u2190 Change word" : "\u2190 Examples";
      back.setAttribute("aria-label", tab === "verbs" ? "Change word" : "Back to examples");
      returnFocus = origin;
      selection.replaceChildren(panel);
      catalog.hidden = true;
      detailNav.hidden = false;
      scroller.scrollTop = 0;
      Array.from(panel.querySelectorAll("select,button")).find((node2) => node2.getClientRects().length)?.focus({ preventScroll: true });
    };
    const pane = element2("div", "playground-pane");
    pane.id = panelId;
    pane.setAttribute("role", "tabpanel");
    pane.setAttribute("aria-labelledby", `${panelId}-${tab}`);
    const showVerb = (interpretation, origin) => {
      const panel = element2("div", "explore-panel");
      const label = element2("p", "explore-source-label", "Original phrase");
      const source2 = element2("p", "explore-source");
      source2.append(annotated(interpretation.model.source, interpretation.model.sourceReading));
      const original = element2("div", "playground-original");
      original.append(label, source2);
      panel.append(original, renderVerbPlayground(interpretation.model));
      showSelection(panel, origin);
    };
    const confirm = (choices) => {
      confirmation.replaceChildren();
      for (const choice of choices) {
        const button3 = element2("button", "", `Use ${choice.label}`);
        button3.type = "button";
        button3.addEventListener("click", () => {
          if (disposed) return;
          cancel2();
          feedback.textContent = "";
          showVerb(choice, button3);
        });
        confirmation.append(button3);
      }
    };
    const check = async (value) => {
      cancel2();
      selection.replaceChildren();
      confirmation.replaceChildren();
      feedback.textContent = "";
      if (disposed) return;
      if (!value || Array.from(value).length > 40 || !/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ー]+$/u.test(value)) {
        feedback.textContent = "Enter one dictionary-form verb or adjective, such as \u98DF\u3079\u308B, \u9AD8\u3044, or \u9759\u304B (up to 40 characters).";
        return;
      }
      controller = new AbortController();
      const current = controller, id = request;
      form.setAttribute("aria-busy", "true");
      submit.disabled = true;
      feedback.textContent = "Checking the bundled dictionary\u2026";
      try {
        const words = (await options.tokenize([value], current.signal))[0] ?? [];
        const candidates = dictionaryVerbCandidates(value, words), adjectives = dictionaryAdjectiveCandidates(value, words);
        if (disposed || current.signal.aborted || id !== request) return;
        if (!candidates.length && !adjectives.length) {
          feedback.textContent = "Use a recognized dictionary-form verb or adjective, such as \u98DF\u3079\u308B, \u9AD8\u3044, or \u9759\u304B (without \u306A). Sentences and conjugated forms cannot be entered here.";
          return;
        }
        const choices = [];
        for (const candidate of candidates) {
          const model2 = createVerbPlayground(candidate);
          const interpretations = await verifiedVerbInterpretations(model2, options.tokenize, current.signal);
          if (disposed || current.signal.aborted || id !== request) return;
          for (const interpretation of interpretations) {
            const base = interpretation.model.base;
            choices.push({ ...interpretation, label: `${interpretation.label} \xB7 ${base.prefixReading ?? ""}${base.reading} \xB7 ${classLabel(base)}` });
          }
        }
        feedback.textContent = !choices.length ? "That derived construction is outside the supported forms. Try its original dictionary verb." : choices.length > 1 ? "Choose the dictionary entry or interpretation you intend." : "Confirm the dictionary form, reading, and class to begin.";
        confirm(choices);
        for (const base of adjectives) {
          const button3 = element2("button", "", `Use ${base.lemma} \xB7 ${base.reading} \xB7 ${base.kind === "i" ? "\u3044-adjective" : "\u306A-adjective"}`);
          button3.type = "button";
          button3.addEventListener("click", () => {
            if (disposed) return;
            cancel2();
            feedback.textContent = "";
            const model2 = createAdjectivePlayground(base), panel = element2("div", "explore-panel");
            const original = element2("div", "playground-original");
            original.append(element2("p", "explore-source-label", "Original word"), annotated(model2.source, model2.sourceReading));
            panel.append(original, renderAdjectivePlayground(model2));
            showSelection(panel, button3);
          });
          confirmation.append(button3);
        }
        if (adjectives.length) feedback.textContent = "Confirm the dictionary form, reading, and class to begin.";
      } catch {
        if (disposed || current.signal.aborted || id !== request) return;
        feedback.textContent = "The local dictionary could not finish. Try again, or click a word in Reading view to explore it.";
      } finally {
        if (!disposed && !current.signal.aborted && id === request) {
          form.removeAttribute("aria-busy");
          submit.disabled = false;
          controller = void 0;
        }
      }
    };
    const renderResults = () => {
      if (disposed) return;
      results.replaceChildren();
      if (tab === "verbs") {
        count.textContent = "";
        return;
      }
      const query = normalize(search.value);
      let total = 0;
      for (const entry of mimeticEntries) for (const [index, variant] of entry.variants.entries()) {
        if (category.value && entry.category !== category.value) continue;
        const values = [variant.term, ...variant.aliases, entry.sceneUse, variant.gloss, ...entry.keywords];
        if (!matches(normalizeMimetic(query), values)) continue;
        total++;
        const button3 = element2("button", "playground-entry");
        button3.type = "button";
        button3.append(element2("span", "playground-term", variant.term), element2("span", "playground-gloss", variant.gloss));
        button3.addEventListener("click", () => {
          if (disposed) return;
          cancel2();
          confirmation.replaceChildren();
          feedback.textContent = "";
          const panel = element2("div", "explore-panel");
          panel.append(renderMimeticPlayground({ ...entry, initialVariant: index }));
          showSelection(panel, button3);
        });
        results.append(button3);
      }
      count.textContent = `${total} expressions`;
      if (!total) results.append(element2("p", "", "No matching expressions. Try another spelling, reading, or English word."));
    };
    const tabButtons = /* @__PURE__ */ new Map();
    const changeTab = (next) => {
      if (disposed) return;
      cancel2();
      tab = next;
      selection.replaceChildren();
      confirmation.replaceChildren();
      feedback.textContent = "";
      catalog.hidden = false;
      detailNav.hidden = true;
      scroller.scrollTop = 0;
      form.hidden = next !== "verbs";
      filters.hidden = count.hidden = results.hidden = next !== "mimetics";
      intro.textContent = next === "verbs" ? verbIntro : "Choose an expression to compare. Everything works offline.";
      pane.setAttribute("aria-labelledby", `${panelId}-${next}`);
      for (const [key, button3] of tabButtons) {
        button3.setAttribute("aria-selected", String(key === next));
        button3.tabIndex = key === next ? 0 : -1;
      }
      renderResults();
    };
    for (const [id, label] of [["verbs", "Word forms"], ["mimetics", "Mimetics"]]) {
      const button3 = element2("button", "", label);
      button3.type = "button";
      button3.setAttribute("role", "tab");
      button3.setAttribute("aria-selected", String(id === tab));
      button3.tabIndex = id === tab ? 0 : -1;
      button3.id = `${panelId}-${id}`;
      button3.setAttribute("aria-controls", panelId);
      button3.addEventListener("click", () => changeTab(id));
      button3.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "verbs" : event.key === "End" ? "mimetics" : tab === "verbs" ? "mimetics" : "verbs";
        changeTab(next);
        tabButtons.get(next)?.focus();
      });
      tabButtons.set(id, button3);
      tabs.append(button3);
    }
    search.addEventListener("input", renderResults);
    category.addEventListener("change", renderResults);
    input.addEventListener("input", () => {
      cancel2();
      feedback.textContent = "";
      confirmation.replaceChildren();
      selection.replaceChildren();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void check(input.value.normalize("NFKC").trim());
    });
    pane.append(catalog, selection);
    scroller.append(pane);
    root.append(tabs, detailNav, scroller);
    renderResults();
    if (initial === "mimetics") changeTab(initial);
    tabs.remove();
    if (initial === "verbs") {
      filters.remove();
      count.remove();
      results.remove();
    } else form.remove();
    root.classList.remove("playground-browser");
    root.classList.add("legacy-playground");
    return { element: root, dispose, suspend: () => {
      cancel2();
      if (feedback.textContent === "Checking the bundled dictionary\u2026") feedback.textContent = "Check the word again to continue.";
    }, focus: () => {
      if (!disposed) (tab === "verbs" ? input : search).focus();
    } };
  }
  function renderPlaygroundBrowser(options) {
    const root = node("section", "playground-browser");
    root.setAttribute("aria-label", "Playgrounds");
    root.classList.toggle("has-photo-tools", !!options.photo);
    const tabs = node("div", "playground-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Playground type");
    const host = node("div", "playground-workspaces"), routeBack = button("\u2190 Return to previous playground", () => goBack(), "playground-route-back");
    routeBack.hidden = true;
    const pickerLabel = node("label", "panel-playground-picker", "Playground"), picker = node("select");
    picker.setAttribute("aria-label", "Playground");
    pickerLabel.hidden = true;
    pickerLabel.append(picker);
    const registry = /* @__PURE__ */ new Map(), buttons = /* @__PURE__ */ new Map(), history = [];
    let current, tab = "verbs", disposed = false;
    const id = `ko-tools-${++browserSequence}`;
    const toolOptions = { presentation: options.presentation, tokenize: options.tokenize, data: options.data ?? playgroundData, dictionary: (word) => navigate(renderDictionaryTool(toolOptions, word)), forms: (word) => {
      const tool = renderLegacyPlaygroundBrowser(options);
      navigate(tool);
      const input = tool.element.querySelector(".playground-verb-input input");
      input.value = word;
      tool.element.querySelector("form").requestSubmit();
    } };
    function create(name) {
      if (name === "photo") return options.photo.lookup((entry) => navigate(renderDictionaryTool(toolOptions, "", entry)));
      if (name === "diary") return options.photo.diary();
      const tool = name === "dictionary" ? renderDictionaryTool(toolOptions, "", options.dictionaryEntry) : name === "grammar" ? renderGrammarTool(toolOptions) : renderLegacyPlaygroundBrowser(options, name);
      tool.element.querySelector(".playground-pane")?.removeAttribute("role");
      return tool;
    }
    function navigate(tool) {
      if (disposed) {
        tool.dispose();
        return;
      }
      history.push({ tool: current, focus: root.getRootNode().activeElement });
      current.element.hidden = true;
      current = tool;
      tool.element.setAttribute("role", "tabpanel");
      tool.element.setAttribute("aria-label", "Linked playground");
      tool.element.querySelector(".playground-pane")?.removeAttribute("role");
      host.append(tool.element);
      routeBack.hidden = false;
      tool.focus();
    }
    function goBack() {
      const previous = history.pop();
      if (!previous) return;
      current.dispose();
      current.element.remove();
      current = previous.tool;
      current.element.hidden = false;
      routeBack.hidden = history.length === 0;
      if (previous.focus instanceof HTMLElement && previous.focus.isConnected) previous.focus.focus({ preventScroll: true });
      else current.focus();
    }
    function change(next, focus = true) {
      if (disposed) return;
      while (history.length) goBack();
      if (current) {
        current.suspend?.();
        current.element.hidden = true;
      }
      tab = next;
      picker.value = next;
      pickerLabel.hidden = options.presentation !== "panel" || next !== "grammar";
      tabs.hidden = !pickerLabel.hidden;
      root.classList.toggle("panel-grammar-active", !pickerLabel.hidden);
      current = registry.get(next) ?? create(next);
      if (!registry.has(next)) {
        registry.set(next, current);
        current.element.id = `${id}-${next}-pane`;
        current.element.setAttribute("role", "tabpanel");
        current.element.setAttribute("aria-labelledby", `${id}-${next}`);
        host.append(current.element);
      }
      current.element.hidden = false;
      current.activate?.();
      for (const [name, b] of buttons) {
        b.setAttribute("aria-selected", String(name === next));
        b.tabIndex = name === next ? 0 : -1;
      }
      if (focus) current.focus();
    }
    const tools = [["dictionary", "Dictionary"], ["verbs", "Word forms"], ["grammar", "Grammar"], ["mimetics", "Mimetics"]];
    if (options.photo) tools.push(["photo", "Photo Lookup"], ["diary", "Picture Diary"]);
    for (const [name, label] of tools) {
      const option = node("option", "", label);
      option.value = name;
      picker.append(option);
      const b = button(label, () => change(name));
      b.setAttribute("role", "tab");
      b.id = `${id}-${name}`;
      b.setAttribute("aria-controls", `${id}-${name}-pane`);
      buttons.set(name, b);
      tabs.append(b);
      b.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const position = tools.findIndex(([name2]) => name2 === tab), next = tools[event.key === "Home" ? 0 : event.key === "End" ? tools.length - 1 : (position + (event.key === "ArrowRight" ? 1 : -1) + tools.length) % tools.length][0];
        change(next, false);
        if (pickerLabel.hidden) buttons.get(next).focus();
        else picker.focus();
      });
    }
    picker.onchange = () => change(picker.value);
    root.append(tabs, pickerLabel, routeBack, host);
    change(options.dictionaryEntry ? "dictionary" : options.photo && options.initialTool ? options.initialTool : "verbs", false);
    return { element: root, focus: () => current.focus(), dispose: () => {
      if (disposed) return;
      disposed = true;
      for (const tool of /* @__PURE__ */ new Set([...registry.values(), ...history.map((entry) => entry.tool), current])) tool.dispose();
    } };
  }
  var playgroundBrowserStyles, categories, normalize, browserSequence, matches;
  var init_playground_browser = __esm({
    "src/playground-browser.ts"() {
      "use strict";
      init_adjective_playground();
      init_shared();
      init_verb_playground();
      init_mimetic_playground();
      init_exploration();
      init_playground_data();
      init_playground_tools();
      playgroundBrowserStyles = `
.playground-browser{display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;container-type:inline-size;font:13px/1.5 var(--body);overflow-wrap:break-word}
.playground-tabs{display:flex;flex:none;gap:6px;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--paper)}
.playground-tabs button{flex:1;min-width:0;margin:0;padding:9px;font:700 12px/1.4 var(--mono)}
.has-photo-tools .playground-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}
.has-photo-tools .playground-tabs button{padding:8px 5px;white-space:normal}
@container(max-width:640px){.has-photo-tools .playground-tabs{grid-template-columns:repeat(3,minmax(0,1fr))}.has-photo-tools .playground-tabs button{font-size:11px}}
.playground-tabs [aria-selected=true]{background:var(--accent);color:var(--paper)}
.playground-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:16px}
.playground-intro{margin:0 0 14px;color:var(--muted);font-size:12px}
.playground-filters{display:grid;gap:10px}
.playground-filters label,.playground-verb-input label{display:grid;gap:5px;font-size:12px;font-weight:600}
.playground-filters input,.playground-filters select,.playground-verb-input input{width:100%;max-width:100%;min-width:0;box-sizing:border-box;font:13px/1.5 var(--body);color:var(--ink);background:var(--paper);border:1px solid var(--line);padding:9px}
.playground-browser button{max-width:100%}
.playground-verb-input{margin:0}.playground-verb-input button{margin:8px 0 0;font-size:12px}
.playground-feedback{color:var(--muted);margin:8px 0;font-size:12px}.playground-feedback:empty{display:none}
.playground-confirmation{display:grid;gap:8px;margin:8px 0}.playground-confirmation:empty{display:none}
.playground-confirmation button{margin:0;text-align:left;font-size:12px;white-space:normal;overflow-wrap:anywhere}
.playground-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr));gap:8px;margin:10px 0}
.playground-entry{display:flex;flex-direction:column;gap:3px;margin:0;width:100%;min-width:0;text-align:left;padding:10px;font-size:12px;white-space:normal;overflow-wrap:break-word}
.playground-entry .playground-term{font:20px/1.5 var(--body);color:var(--accent)}
.playground-entry .playground-gloss{font:11px/1.5 var(--body);color:var(--muted)}
.playground-count{font-size:11px;color:var(--muted);margin:14px 0 8px}
.playground-detail-nav{flex:none;padding:8px 16px;border-bottom:1px solid var(--line);background:var(--surface)}
.playground-back{margin:0;padding:4px 0;border:0;background:transparent;color:var(--accent);font-size:12px}.playground-back:hover{background:transparent;text-decoration:underline}
.playground-selection{min-width:0}.playground-selection:empty{display:none}
.playground-selection .explore-panel{margin:0;padding:0;border:0;background:transparent}
.playground-original{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.playground-selection .verb-instruction{display:none}
.playground-selection .explore-source-label{margin:0;color:var(--muted);font:11px/1.4 var(--body)}
.playground-selection .explore-source{margin:0;font:22px/1.9 var(--body)}
.playground-selection .mimetic-playground{border:0;margin:0;padding:0}
.playground-browser button:focus-visible,.playground-browser input:focus-visible,.playground-browser select:focus-visible,.playground-browser summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.playground-browser [hidden]{display:none}
` + playgroundToolStyles;
      categories = [["feelings", "Feelings"], ["body", "Body"], ["movement", "Movement"], ["people", "People"], ["texture", "Texture"], ["sounds", "Sound"], ["nature", "Light & Weather"]];
      normalize = (value) => hiragana(value.normalize("NFKC")).toLocaleLowerCase("en").trim();
      browserSequence = 0;
      matches = (query, values) => !query || query.split(/\s+/u).every((part) => values.some((value) => normalize(value).includes(part)));
    }
  });

  // src/photo-vision.ts
  async function decodePhoto(source2) {
    if (!(source2 instanceof Blob) || !source2.size || source2.size > maxPhotoBytes) throw new Error("Choose an image up to 32 MB.");
    let image;
    try {
      image = await createImageBitmap(source2);
    } catch {
      throw new Error("K\u014D could not open this image. Try a PNG, JPEG, or WebP file.");
    }
    if (image.width > maxPhotoSide || image.height > maxPhotoSide || image.width * image.height > maxPhotoPixels) {
      image.close();
      throw new Error("This image is too large. Choose a smaller image or screenshot.");
    }
    return image;
  }
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
    function analyze(source2, crop, signal) {
      if (disposed || signal?.aborted) return Promise.reject(new DOMException("Photo lookup cancelled", "AbortError"));
      if (pending.size >= 4) return Promise.reject(new Error("Photo Lookup is busy. Try again shortly."));
      return new Promise((resolve, reject) => {
        const thread = start(), id = ++sequence;
        const abort2 = () => {
          thread.postMessage({ cancel: id });
          pending.delete(id);
          cleanup();
          reject(new DOMException("Photo lookup cancelled", "AbortError"));
        };
        const timer = setTimeout(() => stop(new Error("Local image analysis took too long. Try a smaller crop.")), 6e4);
        const cleanup = () => {
          clearTimeout(timer);
          signal?.removeEventListener("abort", abort2);
        };
        pending.set(id, { resolve, reject, cleanup });
        signal?.addEventListener("abort", abort2, { once: true });
        try {
          thread.postMessage({ id, source: source2, crop });
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
  var maxPhotoBytes, maxPhotoPixels, maxPhotoSide;
  var init_photo_vision = __esm({
    "src/photo-vision.ts"() {
      "use strict";
      maxPhotoBytes = 32 * 1024 * 1024;
      maxPhotoPixels = 4e7;
      maxPhotoSide = 16384;
    }
  });

  // src/photo-vocabulary.ts
  function normalizePhotoLabel(label) {
    return label.normalize("NFKC").toLowerCase().replace(/[‐‑–—-]/g, " ").replace(/\s+/g, " ").trim();
  }
  function singularPhotoLabel(label) {
    if (label.endsWith("ies")) return label.slice(0, -3) + "y";
    if (/(?:[sxz]|ch|sh)es$/.test(label)) return label.slice(0, -2);
    if (/[^sui]s$/.test(label)) return label.slice(0, -1);
    return label;
  }
  function stripQualifiers(gloss) {
    while (/\([^()]*\)/.test(gloss)) gloss = gloss.replace(/\([^()]*\)/g, "");
    return normalizePhotoLabel(gloss).replace(/^(?:a|an|the) /, "");
  }
  function noun(hit) {
    return hit.pos.some((pos) => pos.startsWith("noun (common)"));
  }
  function matchingGloss(hit, labels) {
    return hit.meaning.split(";").map((gloss) => gloss.trim()).find((gloss) => labels.includes(normalizePhotoLabel(gloss)) || labels.includes(stripQualifiers(gloss)));
  }
  async function photoVocabulary(data, rawLabel, signal) {
    const label = normalizePhotoLabel(rawLabel);
    if (!label || label.length > 80) return [];
    const labels = [.../* @__PURE__ */ new Set([label, singularPhotoLabel(label)])];
    const guesses = labels.flatMap((value) => Object.hasOwn(preferred, value) ? preferred[value] : []);
    const fixed = [];
    for (const { query, glosses, display } of guesses) {
      const { hits } = await data({ op: "search", query, offset: 0 }, signal);
      const exact = hits.find((hit) => (hit.headword === query || hit.reading === query) && noun(hit) && matchingGloss(hit, glosses ?? labels));
      if (exact) fixed.push({ ...exact, headword: display ?? exact.headword, meaning: matchingGloss(exact, glosses ?? labels) });
    }
    if (fixed.length) return fixed;
    for (const query of labels) {
      const { hits } = await data({ op: "search", query, offset: 0 }, signal);
      const exact = hits.flatMap((hit) => {
        if (!noun(hit)) return [];
        const meaning = matchingGloss(hit, labels);
        return meaning ? [{ hit: { ...hit, meaning }, first: hit.meaning.startsWith(meaning) }] : [];
      });
      const first = exact.filter((candidate) => candidate.first);
      const pool2 = first.length ? first : exact;
      const common = pool2.filter((candidate) => candidate.hit.common);
      if (pool2.length) return (common.length ? common : pool2).slice(0, 4).map((candidate) => candidate.hit);
    }
    return [];
  }
  var preferred;
  var init_photo_vocabulary = __esm({
    "src/photo-vocabulary.ts"() {
      "use strict";
      preferred = {
        umbrella: [{ query: "\u5098" }],
        book: [{ query: "\u672C" }],
        notebook: [{ query: "\u30CE\u30FC\u30C8" }],
        bottle: [{ query: "\u74F6" }, { query: "\u30DC\u30C8\u30EB" }],
        "water bottle": [{ query: "\u6C34\u7B52", glosses: ["water bottle", "canteen"] }, { query: "\u30DA\u30C3\u30C8\u30DC\u30C8\u30EB", glosses: ["plastic bottle", "pet bottle"] }],
        "plastic bottle": [{ query: "\u30DA\u30C3\u30C8\u30DC\u30C8\u30EB", glosses: ["plastic bottle", "pet bottle"] }],
        cup: [{ query: "\u30AB\u30C3\u30D7" }, { query: "\u30B3\u30C3\u30D7", glosses: ["glass", "tumbler"], display: "\u30B3\u30C3\u30D7" }],
        mug: [{ query: "\u30DE\u30B0\u30AB\u30C3\u30D7" }],
        cat: [{ query: "\u732B" }],
        dog: [{ query: "\u72AC" }],
        rabbit: [{ query: "\u514E" }],
        table: [{ query: "\u30C6\u30FC\u30D6\u30EB" }],
        chair: [{ query: "\u6905\u5B50" }],
        plant: [{ query: "\u690D\u7269" }],
        lamp: [{ query: "\u30E9\u30F3\u30D7" }],
        pen: [{ query: "\u30DA\u30F3" }],
        pencil: [{ query: "\u925B\u7B46" }],
        keyboard: [{ query: "\u30AD\u30FC\u30DC\u30FC\u30C9" }],
        mouse: [{ query: "\u30DE\u30A6\u30B9" }, { query: "\u9F20" }],
        "computer mouse": [{ query: "\u30DE\u30A6\u30B9", glosses: ["(computer) mouse"] }],
        apple: [{ query: "\u6797\u6A8E", display: "\u308A\u3093\u3054" }],
        ball: [{ query: "\u30DC\u30FC\u30EB" }],
        photograph: [{ query: "\u5199\u771F" }],
        photo: [{ query: "\u5199\u771F" }],
        plate: [{ query: "\u76BF" }],
        "rice bowl": [{ query: "\u8336\u7897" }],
        mountain: [{ query: "\u5C71" }],
        tree: [{ query: "\u6728" }],
        tower: [{ query: "\u5854" }],
        building: [{ query: "\u5EFA\u7269" }],
        sign: [{ query: "\u770B\u677F" }, { query: "\u6A19\u8B58" }],
        fence: [{ query: "\u67F5" }],
        "stop sign": [{ query: "\u4E00\u6642\u505C\u6B62\u6A19\u8B58" }, { query: "\u6A19\u8B58", glosses: ["sign", "marker"] }]
      };
    }
  });

  // src/photo-counters.ts
  function normalizedKind(raw) {
    const original = normalizePhotoLabel(raw);
    if (knownLabels.has(original) || generalObjects.has(original) || uncountableLabels.has(original)) return original;
    const label = original.replace(visualModifiers, "");
    if (knownLabels.has(label) || generalObjects.has(label) || uncountableLabels.has(label)) return label;
    const pair = label.replace(/^pairs of /, "pair of ");
    return irregularLabels.get(label) ?? (knownLabels.has(pair) ? pair : singularPhotoLabel(label));
  }
  function numberParts(count) {
    const tens = Math.floor(count / 10), ones = count % 10;
    const word = (tens ? (tens === 1 ? "" : digitWords[tens - 1]) + "\u5341" : "") + (ones ? digitWords[ones - 1] : "");
    const prefix = tens ? (tens === 1 ? "" : digitReadings[tens]) + "\u3058\u3085\u3046" : "";
    return { tens, ones, word, prefix };
  }
  function specificCount(count, counter) {
    const { tens, ones, word, prefix } = numberParts(count);
    if (counter === "\u4EBA" && count <= 2) return { kind: "word", word: word + counter, reading: count === 1 ? "\u3072\u3068\u308A" : "\u3075\u305F\u308A" };
    const rule = rules[counter];
    const changes = rule.changes ?? {};
    const reading = ones ? prefix + (changes[ones] ?? digitReadings[ones] + rule.reading) : (tens === 1 ? "" : digitReadings[tens]) + (changes[10] ?? "\u3058\u3085\u3046" + rule.reading);
    return { kind: "word", word: word + counter, reading };
  }
  function countPhotoObjects(labels, useGeneral = false) {
    const count = labels.length;
    if (!count) return { kind: "empty" };
    if (count > 99) return { kind: "out-of-range" };
    const kinds = labels.map(normalizedKind), counters = kinds.map((kind) => knownLabels.get(kind));
    const first = counters[0];
    if (first && counters.every((counter) => counter === first)) return specificCount(count, first);
    if (counters.some((counter) => counter && animateCounters.has(counter))) return { kind: "mixed" };
    if (kinds.some((kind) => uncountableLabels.has(kind))) return { kind: "unsupported" };
    if (!useGeneral && !kinds.every((kind) => generalObjects.has(kind))) return { kind: "offer-general" };
    const { word, prefix, ones } = numberParts(count);
    return {
      kind: "general",
      word: count < 10 ? word + "\u3064" : word,
      reading: count <= 10 ? nativeReadings[count - 1] : prefix + digitReadings[ones]
    };
  }
  var photoCounterGuide, rules, knownLabels, animateCounters, generalObjects, uncountableLabels, irregularLabels, digitWords, digitReadings, nativeReadings, visualModifiers;
  var init_photo_counters = __esm({
    "src/photo-counters.ts"() {
      "use strict";
      init_photo_vocabulary();
      photoCounterGuide = "https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/017.html";
      rules = {
        \u672C: { reading: "\u307B\u3093", changes: { 1: "\u3044\u3063\u307D\u3093", 3: "\u3055\u3093\u307C\u3093", 6: "\u308D\u3063\u307D\u3093", 8: "\u306F\u3063\u307D\u3093", 10: "\u3058\u3085\u3063\u307D\u3093" }, labels: [
          "bottle",
          "water bottle",
          "plastic bottle",
          "glass bottle",
          "wine bottle",
          "beer bottle",
          "pen",
          "pencil",
          "marker",
          "umbrella",
          "straw",
          "candle",
          "carrot",
          "banana",
          "cucumber",
          "screwdriver",
          "pole",
          "tree",
          "branch",
          "stick",
          "log",
          "cable",
          "rope",
          "skewer"
        ] },
        \u518A: { reading: "\u3055\u3064", changes: { 1: "\u3044\u3063\u3055\u3064", 8: "\u306F\u3063\u3055\u3064", 10: "\u3058\u3085\u3063\u3055\u3064" }, labels: [
          "book",
          "notebook",
          "magazine",
          "textbook",
          "comic book",
          "dictionary",
          "booklet",
          "photo album",
          "cookbook",
          "sketchbook",
          "journal"
        ] },
        \u679A: { reading: "\u307E\u3044", labels: [
          "paper",
          "sheet of paper",
          "leaf",
          "picture",
          "photograph",
          "photo",
          "card",
          "plate",
          "ticket",
          "sticker",
          "postcard",
          "stamp",
          "sheet",
          "towel",
          "handkerchief",
          "shirt",
          "t shirt",
          "banknote",
          "poster",
          "painting",
          "disc",
          "cd",
          "dvd"
        ] },
        \u5339: { reading: "\u3072\u304D", changes: { 1: "\u3044\u3063\u3074\u304D", 3: "\u3055\u3093\u3073\u304D", 6: "\u308D\u3063\u3074\u304D", 8: "\u306F\u3063\u3074\u304D", 10: "\u3058\u3085\u3063\u3074\u304D" }, labels: [
          "animal",
          "pet",
          "cat",
          "kitten",
          "dog",
          "puppy",
          "rabbit",
          "fish",
          "goldfish",
          "hamster",
          "mouse",
          "rat",
          "squirrel",
          "frog",
          "toad",
          "turtle",
          "lizard",
          "snake",
          "insect",
          "butterfly",
          "beetle",
          "bee",
          "ant",
          "spider",
          "crab",
          "shrimp",
          "lobster",
          "snail",
          "squid",
          "octopus",
          "monkey",
          "fox",
          "raccoon"
        ] },
        \u500B: { reading: "\u3053", changes: { 1: "\u3044\u3063\u3053", 6: "\u308D\u3063\u3053", 8: "\u306F\u3063\u3053", 10: "\u3058\u3085\u3063\u3053" }, labels: [
          "ball",
          "apple",
          "orange",
          "egg",
          "cup",
          "glass",
          "mug",
          "bowl",
          "bean",
          "stone",
          "box",
          "cookie",
          "onion",
          "tomato",
          "potato",
          "peach",
          "pear",
          "strawberry",
          "lemon",
          "lime",
          "rock",
          "coin",
          "button",
          "dice",
          "die",
          "block",
          "brick",
          "doughnut",
          "donut",
          "bun",
          "sandwich",
          "candy",
          "bead",
          "battery",
          "can"
        ] },
        \u53F0: { reading: "\u3060\u3044", labels: [
          "car",
          "sports car",
          "passenger car",
          "truck",
          "pickup truck",
          "bus",
          "van",
          "minivan",
          "taxi",
          "motorcycle",
          "motorbike",
          "bicycle",
          "bike",
          "scooter",
          "tractor",
          "ambulance",
          "police car",
          "fire truck",
          "forklift",
          "excavator",
          "machine",
          "computer",
          "laptop",
          "tablet",
          "phone",
          "mobile phone",
          "smartphone",
          "television",
          "tv",
          "monitor",
          "camera",
          "printer",
          "refrigerator",
          "fridge",
          "microwave",
          "washing machine",
          "vacuum cleaner",
          "air conditioner",
          "fan",
          "piano"
        ] },
        \u4EBA: { reading: "\u306B\u3093", changes: { 4: "\u3088\u306B\u3093" }, labels: [
          "person",
          "human",
          "man",
          "woman",
          "adult",
          "child",
          "boy",
          "girl",
          "baby",
          "toddler",
          "teenager",
          "student",
          "teacher",
          "worker",
          "pedestrian",
          "rider",
          "driver",
          "cyclist",
          "runner",
          "player",
          "athlete",
          "tourist",
          "customer",
          "passenger",
          "chef",
          "waiter",
          "nurse",
          "doctor",
          "police officer",
          "firefighter",
          "skateboarder",
          "skier",
          "surfer"
        ] },
        \u982D: { reading: "\u3068\u3046", changes: { 1: "\u3044\u3063\u3068\u3046", 8: "\u306F\u3063\u3068\u3046", 10: "\u3058\u3085\u3063\u3068\u3046" }, labels: [
          "horse",
          "cow",
          "bull",
          "cattle",
          "ox",
          "donkey",
          "elephant",
          "giraffe",
          "zebra",
          "bear",
          "lion",
          "tiger",
          "hippopotamus",
          "rhinoceros",
          "rhino",
          "camel",
          "buffalo",
          "sheep",
          "goat",
          "deer",
          "whale"
        ] },
        \u7FBD: { reading: "\u308F", labels: [
          "bird",
          "chicken",
          "rooster",
          "hen",
          "duck",
          "goose",
          "swan",
          "pigeon",
          "dove",
          "sparrow",
          "crow",
          "raven",
          "eagle",
          "hawk",
          "owl",
          "parrot",
          "penguin",
          "flamingo",
          "seagull"
        ] },
        \u8ED2: { reading: "\u3051\u3093", changes: { 1: "\u3044\u3063\u3051\u3093", 3: "\u3055\u3093\u3052\u3093", 6: "\u308D\u3063\u3051\u3093", 8: "\u306F\u3063\u3051\u3093", 10: "\u3058\u3085\u3063\u3051\u3093" }, labels: [
          "house",
          "home",
          "cottage",
          "shop",
          "store",
          "convenience store",
          "restaurant",
          "cafe",
          "coffee shop",
          "bakery",
          "bookstore",
          "movie theater",
          "cinema"
        ] },
        \u8DB3: { reading: "\u305D\u304F", changes: { 1: "\u3044\u3063\u305D\u304F", 3: "\u3055\u3093\u305E\u304F", 8: "\u306F\u3063\u305D\u304F", 10: "\u3058\u3085\u3063\u305D\u304F" }, labels: [
          "pair of shoes",
          "pair of boots",
          "pair of socks",
          "pair of sandals",
          "pair of slippers",
          "pair of sneakers"
        ] },
        \u7740: { reading: "\u3061\u3083\u304F", changes: { 1: "\u3044\u3063\u3061\u3083\u304F", 8: "\u306F\u3063\u3061\u3083\u304F", 10: "\u3058\u3085\u3063\u3061\u3083\u304F" }, labels: [
          "coat",
          "jacket",
          "dress",
          "suit",
          "kimono",
          "uniform",
          "outfit",
          "raincoat",
          "swimsuit",
          "costume"
        ] },
        \u96BB: { reading: "\u305B\u304D", changes: { 1: "\u3044\u3063\u305B\u304D", 8: "\u306F\u3063\u305B\u304D", 10: "\u3058\u3085\u3063\u305B\u304D" }, labels: [
          "ship",
          "ferry",
          "cargo ship",
          "cruise ship",
          "warship",
          "tanker",
          "container ship",
          "battleship",
          "aircraft carrier"
        ] },
        \u811A: { reading: "\u304D\u3083\u304F", changes: { 1: "\u3044\u3063\u304D\u3083\u304F", 6: "\u308D\u3063\u304D\u3083\u304F", 8: "\u306F\u3063\u304D\u3083\u304F", 10: "\u3058\u3085\u3063\u304D\u3083\u304F" }, labels: [
          "chair",
          "stool",
          "office chair",
          "dining chair"
        ] },
        \u4E21: { reading: "\u308A\u3087\u3046", labels: ["train car", "train carriage", "railcar", "railway carriage", "subway car"] },
        \u6A5F: { reading: "\u304D", changes: { 1: "\u3044\u3063\u304D", 6: "\u308D\u3063\u304D", 8: "\u306F\u3063\u304D", 10: "\u3058\u3085\u3063\u304D" }, labels: [
          "airplane",
          "aeroplane",
          "plane",
          "aircraft",
          "airliner",
          "helicopter",
          "jet plane",
          "fighter jet"
        ] },
        \u676F: { reading: "\u306F\u3044", changes: { 1: "\u3044\u3063\u3071\u3044", 3: "\u3055\u3093\u3070\u3044", 6: "\u308D\u3063\u3071\u3044", 8: "\u306F\u3063\u3071\u3044", 10: "\u3058\u3085\u3063\u3071\u3044" }, labels: [
          "cup of coffee",
          "cup of tea",
          "cup of water",
          "glass of water",
          "glass of wine",
          "glass of beer",
          "mug of beer",
          "bowl of soup",
          "bowl of rice",
          "bowl of noodles"
        ] }
      };
      knownLabels = /* @__PURE__ */ new Map();
      for (const counter of Object.keys(rules)) {
        for (const label of rules[counter].labels) knownLabels.set(label, counter);
      }
      animateCounters = /* @__PURE__ */ new Set(["\u4EBA", "\u5339", "\u982D", "\u7FBD"]);
      generalObjects = /* @__PURE__ */ new Set(["bag", "backpack", "handbag", "purse", "wallet", "suitcase", "luggage tag", "pillow", "cushion", "blanket", "toy", "gift", "container", "basket", "bucket", "park", "parcel", "package", "shelf"]);
      uncountableLabels = /* @__PURE__ */ new Set(["sky", "snow", "sand", "grass", "water", "ground", "paved ground", "dirt", "soil", "smoke", "fog", "mist", "rain", "crowd", "flock", "herd", "group of people"]);
      irregularLabels = /* @__PURE__ */ new Map([
        ["people", "person"],
        ["men", "man"],
        ["women", "woman"],
        ["children", "child"],
        ["mice", "mouse"],
        ["geese", "goose"],
        ["oxen", "ox"],
        ["shelves", "shelf"],
        ["cups of coffee", "cup of coffee"],
        ["cups of tea", "cup of tea"],
        ["cups of water", "cup of water"],
        ["glasses of water", "glass of water"],
        ["glasses of wine", "glass of wine"],
        ["glasses of beer", "glass of beer"]
      ]);
      digitWords = "\u4E00\u4E8C\u4E09\u56DB\u4E94\u516D\u4E03\u516B\u4E5D";
      digitReadings = ["", "\u3044\u3061", "\u306B", "\u3055\u3093", "\u3088\u3093", "\u3054", "\u308D\u304F", "\u306A\u306A", "\u306F\u3061", "\u304D\u3085\u3046"];
      nativeReadings = ["\u3072\u3068\u3064", "\u3075\u305F\u3064", "\u307F\u3063\u3064", "\u3088\u3063\u3064", "\u3044\u3064\u3064", "\u3080\u3063\u3064", "\u306A\u306A\u3064", "\u3084\u3063\u3064", "\u3053\u3053\u306E\u3064", "\u3068\u304A"];
      visualModifiers = /^(?:(?:black|white|red|blue|green|yellow|orange|brown|gray|grey|pink|purple|beige|silver|golden|large|small|tiny) )+/;
    }
  });

  // src/photo-lookup.ts
  function element3(tag, className, content) {
    const node2 = document.createElement(tag);
    if (className) node2.className = className;
    if (content !== void 0) node2.textContent = content;
    return node2;
  }
  function button2(label, action) {
    const el = element3("button", "", label);
    el.type = "button";
    el.addEventListener("click", action);
    return el;
  }
  function svgElement(tag) {
    return document.createElementNS("http://www.w3.org/2000/svg", tag);
  }
  function status(className) {
    const feedback = element3("p", className);
    feedback.setAttribute("role", "status");
    return feedback;
  }
  function formatWord(word, reading) {
    const japanese4 = element3("span");
    japanese4.lang = "ja";
    japanese4.textContent = word === reading || !reading ? word : `${word}\uFF08${reading}\uFF09`;
    return japanese4;
  }
  function polygonContains(point, polygon) {
    let inside = false;
    for (let i = 0, j3 = polygon.length - 1; i < polygon.length; j3 = i++) {
      const [x, y2] = polygon[i], [previousX, previousY] = polygon[j3];
      if (y2 > point.y !== previousY > point.y && point.x < (previousX - x) * (point.y - y2) / (previousY - y2) + x) inside = !inside;
    }
    return inside;
  }
  function hitTest(point, detection) {
    if (detection.polygons?.length) return detection.polygons.some((polygon) => polygonContains(point, polygon));
    const { x, y: y2, width, height } = detection.box;
    return point.x >= x && point.x <= x + width && point.y >= y2 && point.y <= y2 + height;
  }
  function renderPhotoResults(options) {
    const root = element3("section", `photo-lookup-results${options.detachStage ? " is-detached" : ""}`);
    root.setAttribute("aria-label", "Object lookup");
    const stage = element3("div", `photo-lookup-stage${options.detachStage ? " is-detached" : ""}`);
    if (options.source) stage.append(options.source.preview);
    const svg = svgElement("svg"), overlays = svgElement("g"), drawn = svgElement("rect");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    drawn.classList.add("photo-lookup-drawn-crop");
    drawn.style.display = "none";
    svg.append(overlays, drawn);
    stage.append(svg);
    const actions = element3("div", "photo-lookup-actions"), feedback = status("photo-lookup-feedback");
    const countOutput = status("photo-lookup-count"), objects = element3("div", "photo-lookup-objects");
    countOutput.tabIndex = -1;
    const countGuide = element3("a", "", "Counter guide");
    countGuide.href = photoCounterGuide;
    countGuide.target = "_blank";
    countGuide.rel = "noopener noreferrer";
    const overlaps = element3("div", "photo-lookup-choices"), card = element3("div", "photo-lookup-card");
    objects.setAttribute("role", "group");
    objects.setAttribute("aria-label", "Detected objects");
    overlaps.setAttribute("role", "group");
    overlaps.setAttribute("aria-label", "Overlapping objects");
    card.setAttribute("aria-label", "Selected object");
    let disposed = false, counting = false, useGeneralCount = false, cropping = false, busy = false, stageAvailable = true;
    let width = options.source?.width ?? 0, height = options.source?.height ?? 0;
    let detections = [];
    let active, selection = /* @__PURE__ */ new Set();
    let analysis, lookup;
    let retryRegion;
    let crop, drag;
    const editedLabels = /* @__PURE__ */ new Map();
    const numbers = /* @__PURE__ */ new Map();
    const words = /* @__PURE__ */ new Map();
    const items = /* @__PURE__ */ new Map();
    const shapes = /* @__PURE__ */ new Map();
    const countButton = button2("Count", () => {
      counting = !counting;
      useGeneralCount = false;
      countButton.setAttribute("aria-pressed", String(counting));
      selection = new Set(counting && active ? [active.id] : []);
      refreshSelections();
    });
    countButton.setAttribute("aria-pressed", "false");
    const drawButton = button2("Crop and retry", () => setCropping(true));
    const runCrop = button2("Analyze crop", () => {
      if (!crop) return;
      const region = crop;
      setCropping(false);
      void analyze(region);
    });
    const cancelCrop = button2("Cancel crop", () => setCropping(false));
    const retry = button2("Try again", () => void analyze(retryRegion));
    runCrop.classList.add("photo-primary");
    runCrop.hidden = cancelCrop.hidden = retry.hidden = true;
    countButton.hidden = true;
    drawButton.disabled = !width || !height;
    actions.append(countButton, drawButton, runCrop, cancelCrop, retry);
    const controls = element3("div", "photo-lookup-controls");
    controls.append(element3("h3", "", "Objects"), actions);
    const inspector = element3("aside", "photo-lookup-inspector");
    inspector.append(controls, feedback, countOutput, overlaps, card, objects);
    if (!options.detachStage) {
      const media = element3("figure", "photo-lookup-media");
      media.append(stage);
      root.append(media);
    }
    root.append(inspector);
    const labelFor = (object) => editedLabels.get(object.id) ?? object.label;
    const displayObject = (object) => numbers.has(object.id) ? `${labelFor(object)} ${numbers.get(object.id)}` : labelFor(object);
    function dimensions(nextWidth, nextHeight) {
      width = nextWidth;
      height = nextHeight;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      stage.style.setProperty("--photo-aspect", `${width} / ${height}`);
      stage.style.setProperty("--photo-limit", `calc(62vh * ${width / height})`);
    }
    function refreshSelections() {
      for (const [id, item] of items) {
        const selected = counting ? selection.has(id) : active?.id === id;
        item.setAttribute("aria-pressed", String(selected));
        shapes.get(id)?.classList.toggle("is-active", selected);
      }
      countOutput.replaceChildren();
      if (!counting) return;
      const labels = detections.filter((object) => selection.has(object.id)).map(labelFor);
      const japanese4 = countPhotoObjects(labels, useGeneralCount);
      const tools = element3("div", "photo-lookup-count-tools");
      if (japanese4.kind === "empty") {
        countOutput.textContent = "Select objects to see their Japanese counter.";
      } else {
        countOutput.append(`${labels.length} selected`);
        if (japanese4.kind === "word" || japanese4.kind === "general") {
          countOutput.append(" \xB7 ", formatWord(japanese4.word, japanese4.reading));
          if (japanese4.kind === "general") countOutput.append(element3("small", "", "General count for things."));
        } else {
          const hint = {
            mixed: "Choose objects that share a counter.",
            unsupported: "Counter unavailable for this selection.",
            "out-of-range": "Select up to 99 objects to see the Japanese count.",
            "offer-general": "Use the general count for inanimate objects."
          }[japanese4.kind];
          countOutput.append(element3("small", "", hint));
          if (japanese4.kind === "offer-general") tools.append(button2("Count as things", () => {
            useGeneralCount = true;
            refreshSelections();
            countOutput.focus({ preventScroll: true });
          }));
        }
      }
      tools.append(countGuide);
      countOutput.append(tools);
    }
    function markHover(id) {
      for (const [key, shape] of shapes) shape.classList.toggle("is-hovered", key === id);
    }
    function setCropping(value) {
      if (value && !stageAvailable) return;
      cropping = value;
      stage.classList.toggle("is-cropping", value);
      crop = void 0;
      drag = void 0;
      drawn.style.display = "none";
      runCrop.hidden = cancelCrop.hidden = !value;
      drawButton.hidden = value || !stageAvailable;
      runCrop.disabled = true;
      overlaps.replaceChildren();
      feedback.textContent = value ? "Drag a rectangle around the object, then choose Analyze crop." : "";
      if (!value && stageAvailable) drawButton.focus({ preventScroll: true });
    }
    function select(object) {
      overlaps.replaceChildren();
      feedback.textContent = "";
      useGeneralCount = false;
      if (counting && selection.has(object.id)) {
        selection.delete(object.id);
        if (active?.id === object.id) {
          active = detections.find((item) => selection.has(item.id));
          if (active) void lookupObject(active);
          else {
            lookup?.abort();
            card.replaceChildren();
          }
        }
      } else {
        if (counting) selection.add(object.id);
        if (active?.id !== object.id) options.onObjectSelect?.();
        active = object;
        void lookupObject(object);
      }
      refreshSelections();
    }
    function selectAt(point) {
      const matches2 = detections.filter((object) => hitTest(point, object));
      if (matches2.length === 1) {
        select(matches2[0]);
        return;
      }
      overlaps.replaceChildren();
      if (!matches2.length) {
        feedback.textContent = "No detected object here. You can draw a smaller crop and retry.";
        return;
      }
      feedback.textContent = "Choose the object you meant.";
      for (const object of matches2) overlaps.append(button2(displayObject(object), () => {
        select(object);
        items.get(object.id)?.focus({ preventScroll: true });
      }));
      overlaps.firstElementChild.focus({ preventScroll: true });
    }
    function labelEditor(object) {
      const form = element3("form", "photo-lookup-edit"), label = element3("label", "", "English label");
      const input = element3("input");
      input.value = labelFor(object);
      input.maxLength = 80;
      input.required = true;
      input.autocomplete = "off";
      label.append(input);
      const submit = element3("button", "", "Update label");
      submit.type = "submit";
      form.append(label, submit, button2("Cancel", () => void lookupObject(object)));
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const corrected = input.value.trim();
        if (!corrected || !new RegExp("\\p{Script=Latin}", "u").test(corrected)) {
          input.setCustomValidity("Enter an English object label.");
          input.reportValidity();
          return;
        }
        editedLabels.set(object.id, corrected);
        useGeneralCount = false;
        const item = items.get(object.id);
        if (item) item.textContent = displayObject(object);
        refreshSelections();
        void lookupObject(object);
      });
      input.addEventListener("input", () => input.setCustomValidity(""));
      card.querySelector(".photo-lookup-edit")?.remove();
      card.append(form);
      input.focus();
      input.select();
    }
    async function lookupObject(object) {
      lookup?.abort();
      const controller = new AbortController();
      lookup = controller;
      const label = labelFor(object);
      const controls2 = element3("div", "photo-lookup-actions"), edit = button2("Edit label", () => labelEditor(object));
      edit.classList.add("photo-lookup-edit-button");
      controls2.append(edit);
      const meaning = element3("div"), result = status("photo-lookup-feedback");
      const modelLabel = element3("p", "photo-lookup-label", label);
      card.replaceChildren(modelLabel, meaning, controls2, result);
      result.textContent = "Looking up Japanese\u2026";
      const current = () => !disposed && !controller.signal.aborted;
      function showHit(hit, focus = false) {
        const name = element3("p", "photo-lookup-word");
        name.lang = "ja";
        name.append(element3("span", "", hit.headword));
        if (hit.reading && hit.reading !== hit.headword) name.append(element3("small", "", hit.reading));
        const gloss = element3("p", "photo-lookup-gloss", hit.meaning);
        const save = button2("Save to Picture Diary", () => {
          save.disabled = true;
          result.textContent = "Saving crop\u2026";
          void options.save(object.box, hit).then(() => {
            if (current()) result.textContent = "Saved to Picture Diary.";
          }, (error) => {
            if (!current()) return;
            save.disabled = false;
            result.textContent = error instanceof Error ? error.message : "Could not save the crop. Try again.";
          });
        });
        save.classList.add("photo-primary");
        const dictionary = button2("Open Dictionary", () => options.dictionary(hit));
        modelLabel.hidden = normalizePhotoLabel(hit.meaning).split(" (")[0] === normalizePhotoLabel(label);
        meaning.replaceChildren(name, gloss);
        controls2.replaceChildren(save, dictionary, edit);
        result.textContent = "";
        if (focus) dictionary.focus({ preventScroll: true });
      }
      try {
        const key = normalizePhotoLabel(label);
        const hits = words.get(key) ?? await photoVocabulary(options.data, label, controller.signal);
        if (!current()) return;
        if (!words.has(key)) words.set(key, hits);
        result.textContent = "";
        if (hits.length === 1) {
          showHit(hits[0]);
          return;
        }
        if (!hits.length) {
          result.textContent = "No reliable match in the local Japanese dictionary.";
          return;
        }
        const choices = element3("div", "photo-lookup-choices");
        choices.setAttribute("role", "group");
        choices.setAttribute("aria-label", "Japanese word choices");
        for (const hit of hits) {
          const choice = button2("", () => showHit(hit, true));
          choice.append(formatWord(hit.headword, hit.reading), ` \xB7 ${hit.meaning}`);
          choices.append(choice);
        }
        meaning.append(element3("p", "", "Choose the Japanese word that fits."), choices);
      } catch {
        if (!current()) return;
        result.textContent = "The local dictionary could not finish.";
        controls2.append(button2("Retry lookup", () => void lookupObject(object)));
      }
    }
    function applyAnalysis(result) {
      dimensions(result.width, result.height);
      lookup?.abort();
      detections = result.detections;
      active = void 0;
      selection.clear();
      numbers.clear();
      editedLabels.clear();
      items.clear();
      shapes.clear();
      objects.replaceChildren();
      overlays.replaceChildren();
      overlaps.replaceChildren();
      card.replaceChildren();
      const groups = /* @__PURE__ */ new Map();
      for (const detection of detections) {
        const list = groups.get(detection.label) ?? [];
        list.push(detection);
        groups.set(detection.label, list);
      }
      for (const group of groups.values()) {
        if (group.length > 1) group.forEach((detection, index) => numbers.set(detection.id, index + 1));
      }
      for (const detection of detections) {
        const item = button2(displayObject(detection), () => select(detection)), shape = svgElement("g");
        item.addEventListener("focus", () => markHover(detection.id));
        item.addEventListener("blur", () => markHover());
        item.addEventListener("pointerenter", () => markHover(detection.id));
        item.addEventListener("pointerleave", () => markHover());
        if (detection.polygons?.length) {
          for (const polygon of detection.polygons) {
            const outline = svgElement("polygon");
            outline.setAttribute("points", polygon.map((point) => point.join(",")).join(" "));
            outline.classList.add("photo-lookup-shape");
            shape.append(outline);
          }
        } else {
          const box = svgElement("rect");
          box.classList.add("photo-lookup-shape");
          for (const [key, value] of Object.entries(detection.box)) box.setAttribute(key, String(value));
          shape.append(box);
        }
        objects.append(item);
        overlays.append(shape);
        items.set(detection.id, item);
        shapes.set(detection.id, shape);
      }
      countButton.hidden = !detections.length;
      drawButton.disabled = false;
      refreshSelections();
      feedback.textContent = detections.length ? "Select an object in the image or list." : "No objects detected. Try a clearer photo or a tighter crop.";
    }
    async function analyze(region) {
      if (disposed) return;
      analysis?.abort();
      const controller = new AbortController();
      analysis = controller;
      busy = true;
      drawButton.disabled = true;
      retry.hidden = true;
      feedback.textContent = "Looking for objects on this device\u2026";
      try {
        const result = await options.analyze(region, controller.signal);
        if (!disposed && !controller.signal.aborted) applyAnalysis(result);
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        retryRegion = region;
        retry.hidden = false;
        feedback.textContent = error instanceof Error ? error.message : "Photo Lookup could not analyze the image.";
      } finally {
        if (analysis === controller) {
          busy = false;
          drawButton.disabled = !width || !height;
        }
      }
    }
    function stagePoint(event) {
      const bounds = stage.getBoundingClientRect();
      return {
        x: Math.min(width, Math.max(0, (event.clientX - bounds.left) * width / bounds.width)),
        y: Math.min(height, Math.max(0, (event.clientY - bounds.top) * height / bounds.height))
      };
    }
    function drawTo(point) {
      if (!drag) return;
      const x = Math.floor(Math.min(drag.start.x, point.x)), y2 = Math.floor(Math.min(drag.start.y, point.y));
      crop = { x, y: y2, width: Math.ceil(Math.max(drag.start.x, point.x)) - x, height: Math.ceil(Math.max(drag.start.y, point.y)) - y2 };
      drawn.style.display = "";
      for (const [key, value] of Object.entries(crop)) drawn.setAttribute(key, String(value));
      runCrop.disabled = crop.width < 4 || crop.height < 4;
    }
    stage.addEventListener("pointerdown", (event) => {
      if (!cropping || event.button !== 0) return;
      event.preventDefault();
      drag = { start: stagePoint(event), pointer: event.pointerId };
      stage.setPointerCapture(event.pointerId);
      drawTo(drag.start);
    });
    stage.addEventListener("pointermove", (event) => {
      if (!cropping && !busy || cropping && drag?.pointer === event.pointerId) {
        const point = stagePoint(event);
        if (cropping) drawTo(point);
        else markHover(detections.find((object) => hitTest(point, object))?.id);
      }
    });
    stage.addEventListener("pointerup", (event) => {
      if (!cropping || drag?.pointer !== event.pointerId) return;
      drawTo(stagePoint(event));
      drag = void 0;
    });
    stage.addEventListener("pointercancel", () => {
      if (!drag) return;
      drag = void 0;
      crop = void 0;
      drawn.style.display = "none";
      runCrop.disabled = true;
    });
    stage.addEventListener("pointerleave", () => markHover());
    stage.addEventListener("click", (event) => {
      if (!cropping && !busy && width && height) selectAt(stagePoint(event));
    });
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && cropping) {
        event.preventDefault();
        event.stopPropagation();
        setCropping(false);
      }
    });
    if (width && height) dimensions(width, height);
    if (options.initialAnalysis) applyAnalysis(options.initialAnalysis);
    else queueMicrotask(() => void analyze(void 0));
    return {
      element: root,
      stage,
      focus: () => {
        const first = items.values().next().value;
        (first ?? drawButton).focus({ preventScroll: true });
      },
      setStageAvailable: (available) => {
        stageAvailable = available;
        if (!available && cropping) setCropping(false);
        drawButton.hidden = !available || cropping;
      },
      dispose: () => {
        disposed = true;
        analysis?.abort();
        lookup?.abort();
      }
    };
  }
  function renderPhotoLookup(options) {
    const root = element3("section", "playground-workspace photo-lookup");
    const scroll = element3("div", "photo-lookup-scroll"), drop = element3("div", "photo-lookup-input");
    const heading = element3("div", "photo-lookup-heading");
    heading.append(element3("h2", "", "Photo Lookup"));
    const label = element3("label", "photo-lookup-source"), input = element3("input"), labelText = element3("span", "", "Choose an image");
    input.type = "file";
    input.accept = "image/*";
    label.append(input, labelText);
    const feedback = status("photo-lookup-feedback"), host = element3("div");
    const empty = element3("div", "photo-lookup-empty"), inspector = element3("aside", "photo-lookup-inspector");
    inspector.append(element3("h3", "", "Objects"), element3("p", "photo-lookup-feedback", "Select an object to see its Japanese name. Photos stay on this device."));
    drop.append(label, element3("p", "", "You can also paste or drop an image."));
    empty.append(drop, inspector);
    host.append(empty);
    scroll.append(heading, feedback, host);
    root.append(scroll);
    let disposed = false, revision = 0;
    let result;
    async function open(blob) {
      if (disposed) return;
      if (blob.type && !blob.type.startsWith("image/")) {
        feedback.textContent = "Choose an image file.";
        return;
      }
      const request = ++revision;
      feedback.textContent = "Opening the image\u2026";
      let image;
      try {
        image = await decodePhoto(blob);
        if (disposed || request !== revision) return;
        const canvas = element3("canvas");
        canvas.setAttribute("aria-hidden", "true");
        const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("K\u014D could not display this image.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        result?.dispose();
        result = renderPhotoResults({
          data: options.data,
          dictionary: options.dictionary,
          source: { preview: canvas, width: image.width, height: image.height },
          analyze: (crop, signal) => options.analyze(blob, crop, signal),
          save: (crop, hit) => options.save(blob, crop, hit)
        });
        if (label.parentElement !== heading) {
          const focused = document.activeElement === input;
          heading.append(label);
          labelText.textContent = "Change image";
          if (focused) input.focus({ preventScroll: true });
        }
        host.replaceChildren(result.element);
        feedback.textContent = "";
      } catch (error) {
        if (!disposed && request === revision) feedback.textContent = error instanceof Error ? error.message : "This image could not be opened.";
      } finally {
        image?.close();
      }
    }
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      input.value = "";
      if (file) void open(file);
    });
    scroll.addEventListener("dragover", (event) => {
      if (!event.dataTransfer?.types.includes("Files")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      scroll.classList.add("is-dragging");
    });
    scroll.addEventListener("dragleave", (event) => {
      if (!(event.relatedTarget instanceof Node) || !scroll.contains(event.relatedTarget)) scroll.classList.remove("is-dragging");
    });
    scroll.addEventListener("drop", (event) => {
      event.preventDefault();
      scroll.classList.remove("is-dragging");
      const file = event.dataTransfer?.files[0];
      if (file) void open(file);
    });
    const paste = (event) => {
      if (!root.isConnected || !root.getClientRects().length) return;
      const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith("image/"));
      if (file) {
        event.preventDefault();
        void open(file);
      }
    };
    document.addEventListener("paste", paste);
    if (options.initialImage) void open(options.initialImage);
    return { element: root, focus: () => input.focus({ preventScroll: true }), dispose: () => {
      disposed = true;
      document.removeEventListener("paste", paste);
      result?.dispose();
    } };
  }
  var photoLookupStyles;
  var init_photo_lookup = __esm({
    "src/photo-lookup.ts"() {
      "use strict";
      init_photo_vision();
      init_photo_counters();
      init_photo_vocabulary();
      photoLookupStyles = `
.photo-lookup,.photo-lookup-results{--photo-line:#d4c5ab;--photo-card:#faf3e4;--photo-faint:#eee2cb;--photo-radius:4px;color:var(--ink,#242b2d);font:14px/1.5 var(--body,system-ui);min-width:0;overflow-wrap:anywhere}
.photo-lookup[hidden],.photo-lookup [hidden],.photo-lookup-results [hidden],.photo-lookup-stage [hidden]{display:none}
.photo-lookup-scroll{overflow:auto;min-height:0;flex:1;padding:clamp(14px,3vw,32px);overscroll-behavior:contain}
.photo-lookup-heading{display:flex;align-items:center;justify-content:space-between;gap:8px 16px;flex-wrap:wrap;padding-bottom:17px}
.photo-lookup-heading h2{margin:0;font:750 clamp(24px,3vw,31px)/1.22 var(--body,system-ui);letter-spacing:-.03em}
.photo-lookup-results,.photo-lookup-empty{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(255px,1fr);align-items:start;gap:clamp(12px,2vw,22px)}
.photo-lookup-results.is-detached{display:block}
.photo-lookup-input{display:grid;place-content:center;justify-items:center;gap:10px;min-height:clamp(200px,42vh,380px);padding:22px;background:var(--photo-card);border:1px dashed #a89b83;border-radius:var(--photo-radius);text-align:center}
.photo-lookup-scroll.is-dragging .photo-lookup-input{background:var(--photo-faint);border-color:var(--seal,#9f3e2d);outline:2px solid var(--seal,#9f3e2d);outline-offset:-3px}
.photo-lookup-scroll.is-dragging .photo-lookup-media{outline:2px solid var(--seal,#9f3e2d);outline-offset:2px}
.photo-lookup-input p{margin:0;color:var(--muted,#625d50);font-size:13px}
.photo-lookup-source{display:inline-flex;position:relative;max-width:100%}
.photo-lookup-source input{clip-path:inset(50%);width:1px;height:1px;position:absolute;overflow:hidden;white-space:nowrap}
.photo-lookup-source span,.photo-lookup-results button{display:inline-block;color:var(--ink,#242b2d);background:transparent;border:1px solid var(--photo-line);border-radius:var(--photo-radius);padding:7px 10px;font:650 12px/1.4 var(--body,system-ui);margin:0;cursor:pointer;text-align:start}
.photo-lookup-source span{background:var(--photo-card);border-color:#b7aa92;padding:8px 12px}
.photo-lookup-input .photo-lookup-source span,.photo-lookup-results button.photo-primary{background:var(--seal,#9f3e2d);color:var(--paper,#f4ecd8);border-color:var(--seal,#9f3e2d)}
.photo-lookup-source:hover span,.photo-lookup-results button:hover:not(:disabled){background:var(--photo-faint)}
.photo-lookup-input .photo-lookup-source:hover span,.photo-lookup-results button.photo-primary:hover:not(:disabled){background:#813225;border-color:#813225}
.photo-lookup-source input:focus-visible + span,.photo-lookup-results button:focus-visible,.photo-lookup-results input:focus-visible{outline:2px solid var(--accent,#234e64);outline-offset:2px}
.photo-lookup-results button:disabled{opacity:.55;cursor:default}
.photo-lookup-inspector{display:grid;gap:12px;align-content:start;min-width:0;min-height:138px;padding:15px;background:var(--photo-card);border:1px solid var(--photo-line);border-radius:var(--photo-radius)}
.photo-lookup-results.is-detached .photo-lookup-inspector{border:0;background:transparent;padding:0;min-height:0;gap:10px}
.photo-lookup-inspector h3{margin:0;font:750 15px/1.4 var(--body,system-ui)}
.photo-lookup-inspector p,.photo-lookup-heading p{margin:0}
.photo-lookup-controls{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px}
.photo-lookup-actions,.photo-lookup-choices{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.photo-lookup-results button[aria-pressed=true]{color:var(--paper,#f4ecd8);background:var(--accent,#234e64);border-color:var(--accent,#234e64)}
.photo-lookup-results button[aria-pressed=true]:hover{background:#17394b}
.photo-lookup-objects{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,110px),1fr));gap:6px}
.photo-lookup-objects button{min-width:0;overflow-wrap:anywhere}
.photo-lookup-choices:not(:empty){margin-top:6px}
.photo-lookup-media{display:grid;place-items:center;min-width:0;min-height:clamp(200px,48vh,530px);margin:0;background:#262928;border-radius:var(--photo-radius);border:1px solid #262928;overflow:hidden}
.photo-lookup-stage{position:relative;width:100%;margin:0;overflow:hidden;aspect-ratio:var(--photo-aspect,1);max-width:min(100%,var(--photo-limit,100%));cursor:crosshair;touch-action:none;user-select:none}
.photo-lookup-stage.is-detached{height:100%;max-width:none;aspect-ratio:auto;background:transparent}
.photo-lookup-stage canvas,.photo-lookup-stage svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.photo-lookup-stage canvas{display:block}
.photo-lookup-shape{fill:none;stroke:#fff3da;stroke-width:1px;stroke-opacity:.42;vector-effect:non-scaling-stroke}
.photo-lookup-stage.is-detached .photo-lookup-shape{stroke:#234e64;stroke-opacity:.56}
.photo-lookup-stage .is-active .photo-lookup-shape{fill:#d48a5d24;stroke:#ffbd8e;stroke-width:2.5px;stroke-opacity:1}
.photo-lookup-stage.is-detached .is-active .photo-lookup-shape{stroke:#9f3e2d;fill:#9f3e2d26}
.photo-lookup-stage .is-hovered .photo-lookup-shape{stroke:#ffe2ba;stroke-width:2px;stroke-opacity:1}
.photo-lookup-stage.is-detached .is-hovered .photo-lookup-shape{stroke:#9f3e2d;stroke-opacity:1}
.photo-lookup-drawn-crop{fill:#fff3da22;stroke:#ffe2ba;stroke-width:2px;stroke-dasharray:5 3;vector-effect:non-scaling-stroke}
.photo-lookup-stage.is-detached .photo-lookup-drawn-crop{stroke:#9f3e2d}
.photo-lookup-card{display:grid;min-width:0;gap:9px;border:1px solid var(--photo-line);border-inline-start:3px solid var(--seal,#9f3e2d);border-radius:var(--photo-radius);background:#fff9ed;padding:12px}
.photo-lookup-card:empty,.photo-lookup-feedback:empty,.photo-lookup-count:empty,.photo-lookup-choices:empty,.photo-lookup-objects:empty{display:none}
.photo-lookup-label{font:700 13px/1.4 var(--body,system-ui);color:var(--muted,#625d50)}
.photo-lookup-feedback{color:var(--muted,#625d50);font-size:13px}
.photo-lookup-scroll>.photo-lookup-feedback:not(:empty){margin:0 0 12px}
.photo-lookup-word{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 8px;color:var(--accent,#234e64);font:750 30px/1.34 var(--body,system-ui);letter-spacing:-.02em}
.photo-lookup-word small{font:600 14px/1.45 var(--body,system-ui);color:var(--muted,#625d50);letter-spacing:normal}
.photo-lookup-gloss{font-size:14px;color:var(--ink,#242b2d)}
.photo-lookup-results .photo-lookup-edit-button{border-color:transparent;color:var(--muted,#625d50);text-decoration:underline;text-underline-offset:2px}
.photo-lookup-count{padding:7px 9px;background:#e6ebea;border-radius:var(--photo-radius);color:var(--accent,#234e64);font-weight:650}
.photo-lookup-count small{display:block;margin-top:3px;font-size:12px;font-weight:400;color:var(--muted,#625d50)}
.photo-lookup-count-tools{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin-top:5px}
.photo-lookup-count-tools a{font:600 12px/1.4 var(--body,system-ui);color:var(--accent,#234e64);text-underline-offset:2px}
.photo-lookup-edit{display:flex;flex-wrap:wrap;gap:6px;align-items:end;margin:0}
.photo-lookup-edit label{display:grid;gap:3px;min-width:0;flex:1 1 120px;font-size:12px}
.photo-lookup-edit input{min-width:0;width:100%;padding:6px;color:var(--ink,#242b2d);background:var(--paper,#f4ecd8);border:1px solid var(--photo-line);border-radius:var(--photo-radius);font:inherit}
@container(max-width:690px){.photo-lookup-results,.photo-lookup-empty{grid-template-columns:minmax(0,1fr)}.photo-lookup-media{min-height:0}.photo-lookup-inspector{min-height:0}}
@media(max-width:540px){.photo-lookup-results,.photo-lookup-empty{grid-template-columns:minmax(0,1fr)}.photo-lookup-media{min-height:0}}
`;
    }
  });

  // src/photo-diary.ts
  function validDiaryWord(value) {
    const valid2 = (text, limit) => typeof text === "string" && text.trim().length > 0 && text.length <= limit;
    return valid2(value.word, 256) && valid2(value.reading, 256) && valid2(value.meaning, 1024);
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
  async function listDiaryEntries() {
    const entries = await transaction("readonly", async (store) => requestValue(store.getAll()));
    return entries.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
  }
  async function deleteDiaryEntry(id) {
    await transaction("readwrite", async (store) => requestValue(store.delete(id)));
  }
  async function mergeDiaryEntries(entries) {
    return transaction("readwrite", async (store) => {
      let added = 0;
      for (const entry of entries) {
        if (await requestValue(store.getKey(entry.id)) !== void 0) continue;
        await requestValue(store.add(entry));
        added++;
      }
      return { added, skipped: entries.length - added };
    });
  }
  var databaseName, storeName;
  var init_photo_diary = __esm({
    "src/photo-diary.ts"() {
      "use strict";
      databaseName = "ko-picture-diary";
      storeName = "entries";
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/constants.js
  var MAX_32_BITS, MAX_16_BITS, MAX_8_BITS, COMPRESSION_METHOD_DEFLATE, COMPRESSION_METHOD_DEFLATE_64, COMPRESSION_METHOD_STORE, COMPRESSION_METHOD_AES, LOCAL_FILE_HEADER_SIGNATURE, SPLIT_ZIP_FILE_SIGNATURE, TEMPORARY_SPLIT_ZIP_FILE_SIGNATURE, DATA_DESCRIPTOR_RECORD_SIGNATURE, ARCHIVE_EXTRA_DATA_SIGNATURE, DIGITAL_SIGNATURE_RECORD_SIGNATURE, CENTRAL_FILE_HEADER_SIGNATURE, END_OF_CENTRAL_DIR_SIGNATURE, ZIP64_END_OF_CENTRAL_DIR_SIGNATURE, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE, CENTRAL_FILE_HEADER_LENGTH, END_OF_CENTRAL_DIR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH, DATA_DESCRIPTOR_RECORD_LENGTH, DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH, DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH, SPLIT_ZIP_FILE_SIGNATURE_LENGTH, EXTRAFIELD_TYPE_ZIP64, EXTRAFIELD_TYPE_AES, EXTRAFIELD_TYPE_NTFS, EXTRAFIELD_TYPE_NTFS_TAG1, EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP, EXTRAFIELD_TYPE_UNICODE_PATH, EXTRAFIELD_TYPE_UNICODE_COMMENT, EXTRAFIELD_TYPE_USDZ, EXTRAFIELD_TYPE_INFOZIP, EXTRAFIELD_TYPE_UNIX, EXTRAFIELD_TYPE_UNIX_TYPE1, EXTRAFIELD_TYPE_PKWARE_UNIX, BITFLAG_ENCRYPTED, BITFLAG_LEVEL, BITFLAG_LEVEL_MAX_MASK, BITFLAG_LEVEL_FAST_MASK, BITFLAG_LEVEL_SUPER_FAST_MASK, BITFLAG_DATA_DESCRIPTOR, BITFLAG_COMPRESSED_PATCHED_DATA, BITFLAG_STRONG_ENCRYPTION, BITFLAG_LANG_ENCODING_FLAG, BITFLAG_MASKED_LOCAL_HEADERS, FILE_ATTR_MSDOS_DIR_MASK, FILE_ATTR_MSDOS_READONLY_MASK, FILE_ATTR_MSDOS_HIDDEN_MASK, FILE_ATTR_MSDOS_SYSTEM_MASK, FILE_ATTR_MSDOS_ARCHIVE_MASK, FILE_ATTR_UNIX_TYPE_MASK, FILE_ATTR_UNIX_TYPE_DIR, FILE_ATTR_UNIX_TYPE_SYMLINK, FILE_ATTR_UNIX_TYPE_FILE, FILE_ATTR_UNIX_EXECUTABLE_MASK, FILE_ATTR_UNIX_DEFAULT_MASK, FILE_ATTR_UNIX_SETUID_MASK, FILE_ATTR_UNIX_SETGID_MASK, FILE_ATTR_UNIX_STICKY_MASK, VERSION_STORE, VERSION_DEFLATE, VERSION_ZIP64, VERSION_AES, VERSION_MADE_BY_MSDOS, VERSION_MADE_BY_UNIX, DIRECTORY_SIGNATURE, HEADER_SIZE, HEADER_OFFSET_VERSION, HEADER_OFFSET_SIGNATURE, HEADER_OFFSET_COMPRESSED_SIZE, HEADER_OFFSET_UNCOMPRESSED_SIZE, HEADER_OFFSET_FILENAME_LENGTH, HEADER_OFFSET_EXTRAFIELD_LENGTH, LOCAL_HEADER_COMMON_OFFSET, MAX_DATE, MIN_DATE, UNDEFINED_VALUE, INFINITY_VALUE, ERR_LOCAL_FILE_HEADER_NOT_FOUND, ERR_OVERLAPPING_ENTRY, ERR_EXTRAFIELD_ZIP64_NOT_FOUND, UNDEFINED_TYPE, FUNCTION_TYPE, OBJECT_TYPE, STRING_TYPE, NUMBER_TYPE, BOOLEAN_TYPE, EMPTY_UINT8_ARRAY, SYMBOL_ASYNC_DISPOSE;
  var init_constants = __esm({
    "node_modules/@zip.js/zip.js/lib/core/constants.js"() {
      MAX_32_BITS = 4294967295;
      MAX_16_BITS = 65535;
      MAX_8_BITS = 255;
      COMPRESSION_METHOD_DEFLATE = 8;
      COMPRESSION_METHOD_DEFLATE_64 = 9;
      COMPRESSION_METHOD_STORE = 0;
      COMPRESSION_METHOD_AES = 99;
      LOCAL_FILE_HEADER_SIGNATURE = 67324752;
      SPLIT_ZIP_FILE_SIGNATURE = 134695760;
      TEMPORARY_SPLIT_ZIP_FILE_SIGNATURE = 808471376;
      DATA_DESCRIPTOR_RECORD_SIGNATURE = SPLIT_ZIP_FILE_SIGNATURE;
      ARCHIVE_EXTRA_DATA_SIGNATURE = 134630224;
      DIGITAL_SIGNATURE_RECORD_SIGNATURE = 84233040;
      CENTRAL_FILE_HEADER_SIGNATURE = 33639248;
      END_OF_CENTRAL_DIR_SIGNATURE = 101010256;
      ZIP64_END_OF_CENTRAL_DIR_SIGNATURE = 101075792;
      ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE = 117853008;
      CENTRAL_FILE_HEADER_LENGTH = 46;
      END_OF_CENTRAL_DIR_LENGTH = 22;
      ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH = 20;
      ZIP64_END_OF_CENTRAL_DIR_LENGTH = 56;
      ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH = END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LENGTH;
      DATA_DESCRIPTOR_RECORD_LENGTH = 12;
      DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH = 20;
      DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH = 4;
      SPLIT_ZIP_FILE_SIGNATURE_LENGTH = 4;
      EXTRAFIELD_TYPE_ZIP64 = 1;
      EXTRAFIELD_TYPE_AES = 39169;
      EXTRAFIELD_TYPE_NTFS = 10;
      EXTRAFIELD_TYPE_NTFS_TAG1 = 1;
      EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP = 21589;
      EXTRAFIELD_TYPE_UNICODE_PATH = 28789;
      EXTRAFIELD_TYPE_UNICODE_COMMENT = 25461;
      EXTRAFIELD_TYPE_USDZ = 6534;
      EXTRAFIELD_TYPE_INFOZIP = 30837;
      EXTRAFIELD_TYPE_UNIX = 30805;
      EXTRAFIELD_TYPE_UNIX_TYPE1 = 22613;
      EXTRAFIELD_TYPE_PKWARE_UNIX = 13;
      BITFLAG_ENCRYPTED = 1;
      BITFLAG_LEVEL = 6;
      BITFLAG_LEVEL_MAX_MASK = 2;
      BITFLAG_LEVEL_FAST_MASK = 4;
      BITFLAG_LEVEL_SUPER_FAST_MASK = 6;
      BITFLAG_DATA_DESCRIPTOR = 8;
      BITFLAG_COMPRESSED_PATCHED_DATA = 32;
      BITFLAG_STRONG_ENCRYPTION = 64;
      BITFLAG_LANG_ENCODING_FLAG = 2048;
      BITFLAG_MASKED_LOCAL_HEADERS = 8192;
      FILE_ATTR_MSDOS_DIR_MASK = 16;
      FILE_ATTR_MSDOS_READONLY_MASK = 1;
      FILE_ATTR_MSDOS_HIDDEN_MASK = 2;
      FILE_ATTR_MSDOS_SYSTEM_MASK = 4;
      FILE_ATTR_MSDOS_ARCHIVE_MASK = 32;
      FILE_ATTR_UNIX_TYPE_MASK = 61440;
      FILE_ATTR_UNIX_TYPE_DIR = 16384;
      FILE_ATTR_UNIX_TYPE_SYMLINK = 40960;
      FILE_ATTR_UNIX_TYPE_FILE = 32768;
      FILE_ATTR_UNIX_EXECUTABLE_MASK = 73;
      FILE_ATTR_UNIX_DEFAULT_MASK = 420;
      FILE_ATTR_UNIX_SETUID_MASK = 2048;
      FILE_ATTR_UNIX_SETGID_MASK = 1024;
      FILE_ATTR_UNIX_STICKY_MASK = 512;
      VERSION_STORE = 10;
      VERSION_DEFLATE = 20;
      VERSION_ZIP64 = 45;
      VERSION_AES = 51;
      VERSION_MADE_BY_MSDOS = 20;
      VERSION_MADE_BY_UNIX = 768;
      DIRECTORY_SIGNATURE = "/";
      HEADER_SIZE = 30;
      HEADER_OFFSET_VERSION = 0;
      HEADER_OFFSET_SIGNATURE = 10;
      HEADER_OFFSET_COMPRESSED_SIZE = 14;
      HEADER_OFFSET_UNCOMPRESSED_SIZE = 18;
      HEADER_OFFSET_FILENAME_LENGTH = 22;
      HEADER_OFFSET_EXTRAFIELD_LENGTH = 24;
      LOCAL_HEADER_COMMON_OFFSET = 4;
      MAX_DATE = new Date(2107, 11, 31, 23, 59, 58);
      MIN_DATE = new Date(1980, 0, 1);
      UNDEFINED_VALUE = void 0;
      INFINITY_VALUE = Infinity;
      ERR_LOCAL_FILE_HEADER_NOT_FOUND = "Local file header not found";
      ERR_OVERLAPPING_ENTRY = "Overlapping entry found";
      ERR_EXTRAFIELD_ZIP64_NOT_FOUND = "Zip64 extra field not found";
      UNDEFINED_TYPE = "undefined";
      FUNCTION_TYPE = "function";
      OBJECT_TYPE = "object";
      STRING_TYPE = "string";
      NUMBER_TYPE = "number";
      BOOLEAN_TYPE = "boolean";
      EMPTY_UINT8_ARRAY = new Uint8Array();
      SYMBOL_ASYNC_DISPOSE = Symbol.asyncDispose || /* @__PURE__ */ Symbol();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/options.js
  function checkFunctionOption(value) {
    if (value && typeof value != FUNCTION_TYPE) {
      throw new Error(ERR_INVALID_FUNCTION_OPTION);
    }
    return value;
  }
  function checkReaderOptionsObject(readerOptions) {
    if (readerOptions && (typeof readerOptions != OBJECT_TYPE || Array.isArray(readerOptions))) {
      throw new Error(ERR_INVALID_READER_OPTIONS);
    }
    return readerOptions;
  }
  function checkSignalOption(signal) {
    if (signal && (typeof signal.addEventListener != FUNCTION_TYPE || typeof signal.aborted != BOOLEAN_TYPE)) {
      throw new Error(ERR_INVALID_SIGNAL);
    }
    return signal || UNDEFINED_VALUE;
  }
  function throwIfAborted(signal) {
    if (signal && signal.aborted) {
      throw signal.reason === UNDEFINED_VALUE ? new DOMException(ERR_ABORTED, ABORT_ERROR_NAME) : signal.reason;
    }
  }
  function checkPasswordOption(password, rawPassword) {
    if (password && typeof password != STRING_TYPE || rawPassword && !(rawPassword instanceof Uint8Array)) {
      throw new Error(ERR_INVALID_PASSWORD_TYPE);
    }
  }
  function checkPassThroughOption(passThrough) {
    if (passThrough !== UNDEFINED_VALUE && typeof passThrough != BOOLEAN_TYPE && passThrough !== PASS_THROUGH_COMPRESSED) {
      throw new Error(ERR_INVALID_PASS_THROUGH_VALUE);
    }
    return passThrough;
  }
  function checkInteger(value, maxValue, errorMessage) {
    if (!Number.isInteger(value) || value < 0 || value > maxValue) {
      throw new Error(errorMessage);
    }
  }
  function checkIntegerOption(value, maxValue, errorMessage) {
    if (value !== UNDEFINED_VALUE) {
      checkInteger(value, maxValue, errorMessage);
    }
  }
  function toNumber(value) {
    return typeof value == STRING_TYPE && value.trim() ? Number(value) : value;
  }
  var OPTION_FILENAME_ENCODING, OPTION_COMMENT_ENCODING, OPTION_DECODE_TEXT, OPTION_EXTRACT_PREPENDED_DATA, OPTION_EXTRACT_APPENDED_DATA, OPTION_PASSWORD, OPTION_RAW_PASSWORD, OPTION_PASS_THROUGH, OPTION_SIGNAL, OPTION_CHECK_PASSWORD_ONLY, OPTION_CHECK_OVERLAPPING_ENTRY_ONLY, OPTION_CHECK_OVERLAPPING_ENTRY, OPTION_CHECK_AMBIGUITY, OPTION_CHECK_LOCAL_DIRECTORY, OPTION_CHECK_LOCAL_FILENAME, OPTION_CHECK_SIGNATURE, OPTION_CHECK_CRC32, OPTION_CHECK_AUTHENTICATION_CODE, OPTION_USE_WEB_WORKERS, OPTION_USE_COMPRESSION_STREAM, OPTION_PREVENT_CLOSE, OPTION_ENCRYPTION_STRENGTH, OPTION_EXTENDED_TIMESTAMP, OPTION_NTFS_TIMESTAMP, OPTION_KEEP_ORDER, OPTION_LEVEL, OPTION_BUFFERED_WRITE, OPTION_CREATE_TEMP_STREAM, OPTION_DATA_DESCRIPTOR_SIGNATURE, OPTION_USE_UNICODE_FILE_NAMES, OPTION_DATA_DESCRIPTOR, OPTION_SUPPORT_ZIP64_SPLIT_FILE, OPTION_ENCODE_TEXT, OPTION_OFFSET, OPTION_USDZ, OPTION_UNIX_EXTRA_FIELD_TYPE, OPTION_LOCAL_EXTRA_FIELD, OPTION_CENTRAL_EXTRA_FIELD, OPTION_STRICTNESS, OPTION_FILENAME_VALIDATION, OPTION_NORMALIZE_FILENAME, OPTION_MAX_APPENDED_DATA_SIZE, OPTION_DECRYPT_CENTRAL_DIRECTORY, OPTION_SIGN_CENTRAL_DIRECTORY, OPTION_ENTRY, TEXT_TYPE_FILENAME, TEXT_TYPE_COMMENT, STRICTNESS_STRICT, STRICTNESS_BALANCED, STRICTNESS_TOLERANT, PASS_THROUGH_COMPRESSED, ERR_INVALID_FUNCTION_OPTION, ERR_INVALID_SIGNAL, ERR_INVALID_PASSWORD_TYPE, ERR_INVALID_PASS_THROUGH_VALUE, ERR_INVALID_READER_OPTIONS, ERR_ABORTED, ABORT_ERROR_NAME;
  var init_options = __esm({
    "node_modules/@zip.js/zip.js/lib/core/options.js"() {
      init_constants();
      OPTION_FILENAME_ENCODING = "filenameEncoding";
      OPTION_COMMENT_ENCODING = "commentEncoding";
      OPTION_DECODE_TEXT = "decodeText";
      OPTION_EXTRACT_PREPENDED_DATA = "extractPrependedData";
      OPTION_EXTRACT_APPENDED_DATA = "extractAppendedData";
      OPTION_PASSWORD = "password";
      OPTION_RAW_PASSWORD = "rawPassword";
      OPTION_PASS_THROUGH = "passThrough";
      OPTION_SIGNAL = "signal";
      OPTION_CHECK_PASSWORD_ONLY = "checkPasswordOnly";
      OPTION_CHECK_OVERLAPPING_ENTRY_ONLY = "checkOverlappingEntryOnly";
      OPTION_CHECK_OVERLAPPING_ENTRY = "checkOverlappingEntry";
      OPTION_CHECK_AMBIGUITY = "checkAmbiguity";
      OPTION_CHECK_LOCAL_DIRECTORY = "checkLocalDirectory";
      OPTION_CHECK_LOCAL_FILENAME = "checkLocalFilename";
      OPTION_CHECK_SIGNATURE = "checkSignature";
      OPTION_CHECK_CRC32 = "checkCrc32";
      OPTION_CHECK_AUTHENTICATION_CODE = "checkAuthenticationCode";
      OPTION_USE_WEB_WORKERS = "useWebWorkers";
      OPTION_USE_COMPRESSION_STREAM = "useCompressionStream";
      OPTION_PREVENT_CLOSE = "preventClose";
      OPTION_ENCRYPTION_STRENGTH = "encryptionStrength";
      OPTION_EXTENDED_TIMESTAMP = "extendedTimestamp";
      OPTION_NTFS_TIMESTAMP = "ntfsTimestamp";
      OPTION_KEEP_ORDER = "keepOrder";
      OPTION_LEVEL = "level";
      OPTION_BUFFERED_WRITE = "bufferedWrite";
      OPTION_CREATE_TEMP_STREAM = "createTempStream";
      OPTION_DATA_DESCRIPTOR_SIGNATURE = "dataDescriptorSignature";
      OPTION_USE_UNICODE_FILE_NAMES = "useUnicodeFileNames";
      OPTION_DATA_DESCRIPTOR = "dataDescriptor";
      OPTION_SUPPORT_ZIP64_SPLIT_FILE = "supportZip64SplitFile";
      OPTION_ENCODE_TEXT = "encodeText";
      OPTION_OFFSET = "offset";
      OPTION_USDZ = "usdz";
      OPTION_UNIX_EXTRA_FIELD_TYPE = "unixExtraFieldType";
      OPTION_LOCAL_EXTRA_FIELD = "localExtraField";
      OPTION_CENTRAL_EXTRA_FIELD = "centralExtraField";
      OPTION_STRICTNESS = "strictness";
      OPTION_FILENAME_VALIDATION = "filenameValidation";
      OPTION_NORMALIZE_FILENAME = "normalizeFilename";
      OPTION_MAX_APPENDED_DATA_SIZE = "maxAppendedDataSize";
      OPTION_DECRYPT_CENTRAL_DIRECTORY = "decryptCentralDirectory";
      OPTION_SIGN_CENTRAL_DIRECTORY = "signCentralDirectory";
      OPTION_ENTRY = "entry";
      TEXT_TYPE_FILENAME = "filename";
      TEXT_TYPE_COMMENT = "comment";
      STRICTNESS_STRICT = "strict";
      STRICTNESS_BALANCED = "balanced";
      STRICTNESS_TOLERANT = "tolerant";
      PASS_THROUGH_COMPRESSED = "compressed";
      ERR_INVALID_FUNCTION_OPTION = "Invalid option (must be a function)";
      ERR_INVALID_SIGNAL = "Invalid signal (must be an AbortSignal instance)";
      ERR_INVALID_PASSWORD_TYPE = "Invalid password (password must be a string, rawPassword must be a Uint8Array)";
      ERR_INVALID_PASS_THROUGH_VALUE = "Invalid passThrough option (must be a boolean or 'compressed')";
      ERR_INVALID_READER_OPTIONS = "Invalid readerOptions (must be an object)";
      ERR_ABORTED = "The operation was aborted";
      ABORT_ERROR_NAME = "AbortError";
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/configuration.js
  function getConfiguration() {
    return config;
  }
  function getChunkSize(config2) {
    return normalizeChunkSize(config2.chunkSize);
  }
  function normalizeChunkSize(chunkSize) {
    chunkSize = toNumber(chunkSize);
    return Number.isInteger(chunkSize) && chunkSize >= MINIMUM_PROPERTY_VALUE ? Math.max(chunkSize, MINIMUM_CHUNK_SIZE) : DEFAULT_CHUNK_SIZE;
  }
  function checkConfiguration(configuration) {
    const checkedConfiguration = {};
    for (const propertyName of CONFIGURABLE_PROPERTY_NAMES) {
      const propertyValue = configuration[propertyName];
      if (propertyValue !== UNDEFINED_VALUE) {
        checkedConfiguration[propertyName] = checkPropertyValue(propertyName, propertyValue);
      }
    }
    return checkedConfiguration;
  }
  function checkPropertyValue(propertyName, propertyValue) {
    if (NUMBER_PROPERTY_NAMES.includes(propertyName)) {
      propertyValue = toNumber(propertyValue);
      if (propertyName == PROPERTY_NAME_MAX_WORKERS && (!Number.isInteger(propertyValue) || propertyValue < MINIMUM_PROPERTY_VALUE)) {
        throw new Error(ERR_INVALID_MAX_WORKERS);
      }
    } else if (FUNCTION_PROPERTY_NAMES.includes(propertyName)) {
      checkFunctionOption(propertyValue);
    } else if (propertyName == PROPERTY_NAME_BASE_URI) {
      if (propertyValue && typeof propertyValue != STRING_TYPE) {
        throw new Error(ERR_INVALID_BASE_URI);
      }
    } else if (URI_PROPERTY_NAMES.includes(propertyName)) {
      if (propertyValue && typeof propertyValue != STRING_TYPE && typeof propertyValue != FUNCTION_TYPE) {
        throw new Error(ERR_INVALID_URI);
      }
    }
    return propertyValue;
  }
  function normalizeConfiguration(configuration) {
    configuration = configuration || {};
    const { CompressionStreamZlib, DecompressionStreamZlib } = configuration;
    if (CompressionStreamZlib === UNDEFINED_VALUE && DecompressionStreamZlib === UNDEFINED_VALUE) {
      return configuration;
    }
    const normalizedConfiguration = Object.assign({}, configuration);
    if (normalizedConfiguration.CompressionStreamFallback === UNDEFINED_VALUE) {
      normalizedConfiguration.CompressionStreamFallback = CompressionStreamZlib;
    }
    if (normalizedConfiguration.DecompressionStreamFallback === UNDEFINED_VALUE) {
      normalizedConfiguration.DecompressionStreamFallback = DecompressionStreamZlib;
    }
    return normalizedConfiguration;
  }
  function setDefaultConfiguration(configuration) {
    const checkedConfiguration = checkConfiguration(normalizeConfiguration(configuration));
    Object.assign(DEFAULT_CONFIGURATION, checkedConfiguration);
    Object.assign(config, checkedConfiguration);
  }
  var DEFAULT_CHUNK_SIZE, MINIMUM_CHUNK_SIZE, MINIMUM_PROPERTY_VALUE, ERR_INVALID_MAX_WORKERS, ERR_INVALID_BASE_URI, ERR_INVALID_URI, maxWorkers, DEFAULT_CONFIGURATION, PROPERTY_NAME_MAX_WORKERS, PROPERTY_NAME_BASE_URI, URI_PROPERTY_NAMES, BOOLEAN_PROPERTY_NAMES, NUMBER_PROPERTY_NAMES, FUNCTION_PROPERTY_NAMES, CONFIGURABLE_PROPERTY_NAMES, config;
  var init_configuration = __esm({
    "node_modules/@zip.js/zip.js/lib/core/configuration.js"() {
      init_constants();
      init_options();
      DEFAULT_CHUNK_SIZE = 256 * 1024;
      MINIMUM_CHUNK_SIZE = 64;
      MINIMUM_PROPERTY_VALUE = 1;
      ERR_INVALID_MAX_WORKERS = "Invalid maxWorkers (must be an integer greater than 0)";
      ERR_INVALID_BASE_URI = "Invalid baseURI (must be a string)";
      ERR_INVALID_URI = "Invalid URI (must be a string or a function returning a string)";
      maxWorkers = 2;
      try {
        if (typeof navigator != UNDEFINED_TYPE && navigator.hardwareConcurrency) {
          maxWorkers = navigator.hardwareConcurrency;
        }
      } catch {
      }
      DEFAULT_CONFIGURATION = {
        workerURI: "./core/web-worker-wasm.js",
        wasmURI: "./core/streams/zlib-wasm/zlib-streams.wasm",
        chunkSize: DEFAULT_CHUNK_SIZE,
        maxWorkers,
        terminateWorkerTimeout: 5e3,
        workerStarvationTimeout: 5e3,
        workerStartupTimeout: 5e3,
        useWebWorkers: true,
        useCompressionStream: true,
        CompressionStream: typeof CompressionStream != UNDEFINED_TYPE && CompressionStream,
        DecompressionStream: typeof DecompressionStream != UNDEFINED_TYPE && DecompressionStream
      };
      PROPERTY_NAME_MAX_WORKERS = "maxWorkers";
      PROPERTY_NAME_BASE_URI = "baseURI";
      URI_PROPERTY_NAMES = [
        "wasmURI",
        "workerURI"
      ];
      BOOLEAN_PROPERTY_NAMES = [
        "useCompressionStream",
        "useWebWorkers"
      ];
      NUMBER_PROPERTY_NAMES = [
        "chunkSize",
        PROPERTY_NAME_MAX_WORKERS,
        "terminateWorkerTimeout",
        "workerStarvationTimeout",
        "workerStartupTimeout"
      ];
      FUNCTION_PROPERTY_NAMES = [
        "createWorker",
        "CompressionStream",
        "DecompressionStream",
        "CompressionStreamFallback",
        "DecompressionStreamFallback"
      ];
      CONFIGURABLE_PROPERTY_NAMES = [
        PROPERTY_NAME_BASE_URI,
        ...URI_PROPERTY_NAMES,
        ...BOOLEAN_PROPERTY_NAMES,
        ...NUMBER_PROPERTY_NAMES,
        ...FUNCTION_PROPERTY_NAMES
      ];
      config = { ...DEFAULT_CONFIGURATION };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/array.js
  function concat(first, second) {
    const result = new Uint8Array(first.length + second.length);
    result.set(first);
    result.set(second, first.length);
    return result;
  }
  function toExactUint8Array(array) {
    return array.byteOffset || array.byteLength != array.buffer.byteLength ? new Uint8Array(array) : array;
  }
  function getDataView(array) {
    return new DataView(array.buffer, array.byteOffset, array.byteLength);
  }
  var init_array = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/array.js"() {
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/error.js
  function isErrorObject(error) {
    return Boolean(error) && typeof error == "object";
  }
  var init_error = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/error.js"() {
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/codecs/crc32.js
  var T2, T0, T1, T22, T3, T4, T5, T6, T7, Crc32;
  var init_crc32 = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/codecs/crc32.js"() {
      T2 = [[], [], [], [], [], [], [], []];
      for (let n = 0; n < 256; n++) {
        let t = n;
        for (let j3 = 0; j3 < 8; j3++) {
          t = t & 1 ? t >>> 1 ^ 3988292384 : t >>> 1;
        }
        T2[0][n] = t;
      }
      for (let n = 0; n < 256; n++) {
        for (let k3 = 1; k3 < 8; k3++) {
          const previous = T2[k3 - 1][n];
          T2[k3][n] = previous >>> 8 ^ T2[0][previous & 255];
        }
      }
      [T0, T1, T22, T3, T4, T5, T6, T7] = T2;
      Crc32 = class {
        constructor(crc) {
          this.crc = crc || -1;
        }
        append(data) {
          let crc = this.crc | 0;
          const length = data.length | 0;
          let offset = 0;
          if (length >= 8 && data.buffer) {
            const view = new DataView(data.buffer, data.byteOffset, length);
            const end = length - 8;
            for (; offset <= end; offset += 8) {
              const a = crc ^ view.getInt32(offset, true);
              const b = view.getInt32(offset + 4, true);
              crc = T7[a & 255] ^ T6[a >>> 8 & 255] ^ T5[a >>> 16 & 255] ^ T4[a >>> 24 & 255] ^ T3[b & 255] ^ T22[b >>> 8 & 255] ^ T1[b >>> 16 & 255] ^ T0[b >>> 24 & 255];
            }
          }
          for (; offset < length; offset++) {
            crc = crc >>> 8 ^ T0[(crc ^ data[offset]) & 255];
          }
          this.crc = crc;
        }
        get() {
          return ~this.crc;
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/crc32-stream.js
  var Crc32Stream;
  var init_crc32_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/crc32-stream.js"() {
      init_crc32();
      Crc32Stream = class extends TransformStream {
        constructor() {
          let stream;
          const crc32 = new Crc32();
          super({
            transform(chunk, controller) {
              crc32.append(chunk);
              controller.enqueue(chunk);
            },
            flush() {
              const value = new Uint8Array(4);
              const dataView = new DataView(value.buffer);
              dataView.setUint32(0, crc32.get());
              stream.value = value;
            }
          });
          stream = this;
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/encode-text.js
  function encodeText(value) {
    if (typeof TextEncoder == UNDEFINED_TYPE) {
      value = unescape(encodeURIComponent(value));
      const result = new Uint8Array(value.length);
      for (let i = 0; i < result.length; i++) {
        result[i] = value.charCodeAt(i);
      }
      return result;
    } else {
      return new TextEncoder().encode(value);
    }
  }
  var init_encode_text = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/encode-text.js"() {
      init_constants();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/codecs/aes-hmac-sha1.js
  function createEngine(key, authenticationKey) {
    initTables();
    const roundKeys = new Int32Array(ROUND_KEYS_LENGTH);
    const rounds = expandKey(key, roundKeys);
    const keystream = new Int32Array(BLOCK_LENGTH / 4);
    const hmac = createHmac(authenticationKey);
    let counter0 = 0;
    let counter1 = 0;
    let counter2 = 0;
    let counter3 = 0;
    return {
      process(data, decrypt2) {
        if (decrypt2) {
          hmac.update(data, 0, data.length);
        }
        encrypt2(data);
        if (!decrypt2) {
          hmac.update(data, 0, data.length);
        }
      },
      digest() {
        return hmac.digest();
      }
    };
    function encrypt2(data) {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      const length = data.length;
      let offset = 0;
      for (; offset + BLOCK_LENGTH <= length; offset += BLOCK_LENGTH) {
        nextKeystream();
        view.setInt32(offset, view.getInt32(offset) ^ keystream[0]);
        view.setInt32(offset + 4, view.getInt32(offset + 4) ^ keystream[1]);
        view.setInt32(offset + 8, view.getInt32(offset + 8) ^ keystream[2]);
        view.setInt32(offset + 12, view.getInt32(offset + 12) ^ keystream[3]);
      }
      if (offset < length) {
        nextKeystream();
        for (let indexByte = 0; offset < length; offset++, indexByte++) {
          data[offset] ^= keystream[indexByte >> 2] >>> 24 - 8 * (indexByte & 3);
        }
      }
    }
    function nextKeystream() {
      counter0 = counter0 + 1 | 0;
      if (!counter0) {
        counter1 = counter1 + 1 | 0;
        if (!counter1) {
          counter2 = counter2 + 1 | 0;
          if (!counter2) {
            counter3 = counter3 + 1 | 0;
          }
        }
      }
      let s0 = swapBytes(counter0) ^ roundKeys[0];
      let s1 = swapBytes(counter1) ^ roundKeys[1];
      let s2 = swapBytes(counter2) ^ roundKeys[2];
      let s3 = swapBytes(counter3) ^ roundKeys[3];
      let t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[4];
      let t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[5];
      let t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[6];
      let t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[7];
      s0 = T02[t0 >>> 24] ^ T12[t1 >>> 16 & 255] ^ T23[t2 >>> 8 & 255] ^ T32[t3 & 255] ^ roundKeys[8];
      s1 = T02[t1 >>> 24] ^ T12[t2 >>> 16 & 255] ^ T23[t3 >>> 8 & 255] ^ T32[t0 & 255] ^ roundKeys[9];
      s2 = T02[t2 >>> 24] ^ T12[t3 >>> 16 & 255] ^ T23[t0 >>> 8 & 255] ^ T32[t1 & 255] ^ roundKeys[10];
      s3 = T02[t3 >>> 24] ^ T12[t0 >>> 16 & 255] ^ T23[t1 >>> 8 & 255] ^ T32[t2 & 255] ^ roundKeys[11];
      t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[12];
      t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[13];
      t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[14];
      t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[15];
      s0 = T02[t0 >>> 24] ^ T12[t1 >>> 16 & 255] ^ T23[t2 >>> 8 & 255] ^ T32[t3 & 255] ^ roundKeys[16];
      s1 = T02[t1 >>> 24] ^ T12[t2 >>> 16 & 255] ^ T23[t3 >>> 8 & 255] ^ T32[t0 & 255] ^ roundKeys[17];
      s2 = T02[t2 >>> 24] ^ T12[t3 >>> 16 & 255] ^ T23[t0 >>> 8 & 255] ^ T32[t1 & 255] ^ roundKeys[18];
      s3 = T02[t3 >>> 24] ^ T12[t0 >>> 16 & 255] ^ T23[t1 >>> 8 & 255] ^ T32[t2 & 255] ^ roundKeys[19];
      t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[20];
      t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[21];
      t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[22];
      t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[23];
      s0 = T02[t0 >>> 24] ^ T12[t1 >>> 16 & 255] ^ T23[t2 >>> 8 & 255] ^ T32[t3 & 255] ^ roundKeys[24];
      s1 = T02[t1 >>> 24] ^ T12[t2 >>> 16 & 255] ^ T23[t3 >>> 8 & 255] ^ T32[t0 & 255] ^ roundKeys[25];
      s2 = T02[t2 >>> 24] ^ T12[t3 >>> 16 & 255] ^ T23[t0 >>> 8 & 255] ^ T32[t1 & 255] ^ roundKeys[26];
      s3 = T02[t3 >>> 24] ^ T12[t0 >>> 16 & 255] ^ T23[t1 >>> 8 & 255] ^ T32[t2 & 255] ^ roundKeys[27];
      t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[28];
      t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[29];
      t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[30];
      t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[31];
      s0 = T02[t0 >>> 24] ^ T12[t1 >>> 16 & 255] ^ T23[t2 >>> 8 & 255] ^ T32[t3 & 255] ^ roundKeys[32];
      s1 = T02[t1 >>> 24] ^ T12[t2 >>> 16 & 255] ^ T23[t3 >>> 8 & 255] ^ T32[t0 & 255] ^ roundKeys[33];
      s2 = T02[t2 >>> 24] ^ T12[t3 >>> 16 & 255] ^ T23[t0 >>> 8 & 255] ^ T32[t1 & 255] ^ roundKeys[34];
      s3 = T02[t3 >>> 24] ^ T12[t0 >>> 16 & 255] ^ T23[t1 >>> 8 & 255] ^ T32[t2 & 255] ^ roundKeys[35];
      t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[36];
      t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[37];
      t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[38];
      t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[39];
      let indexKey = 40;
      if (rounds > 10) {
        s0 = T02[t0 >>> 24] ^ T12[t1 >>> 16 & 255] ^ T23[t2 >>> 8 & 255] ^ T32[t3 & 255] ^ roundKeys[40];
        s1 = T02[t1 >>> 24] ^ T12[t2 >>> 16 & 255] ^ T23[t3 >>> 8 & 255] ^ T32[t0 & 255] ^ roundKeys[41];
        s2 = T02[t2 >>> 24] ^ T12[t3 >>> 16 & 255] ^ T23[t0 >>> 8 & 255] ^ T32[t1 & 255] ^ roundKeys[42];
        s3 = T02[t3 >>> 24] ^ T12[t0 >>> 16 & 255] ^ T23[t1 >>> 8 & 255] ^ T32[t2 & 255] ^ roundKeys[43];
        t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[44];
        t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[45];
        t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[46];
        t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[47];
        indexKey = 48;
      }
      if (rounds > 12) {
        s0 = T02[t0 >>> 24] ^ T12[t1 >>> 16 & 255] ^ T23[t2 >>> 8 & 255] ^ T32[t3 & 255] ^ roundKeys[48];
        s1 = T02[t1 >>> 24] ^ T12[t2 >>> 16 & 255] ^ T23[t3 >>> 8 & 255] ^ T32[t0 & 255] ^ roundKeys[49];
        s2 = T02[t2 >>> 24] ^ T12[t3 >>> 16 & 255] ^ T23[t0 >>> 8 & 255] ^ T32[t1 & 255] ^ roundKeys[50];
        s3 = T02[t3 >>> 24] ^ T12[t0 >>> 16 & 255] ^ T23[t1 >>> 8 & 255] ^ T32[t2 & 255] ^ roundKeys[51];
        t0 = T02[s0 >>> 24] ^ T12[s1 >>> 16 & 255] ^ T23[s2 >>> 8 & 255] ^ T32[s3 & 255] ^ roundKeys[52];
        t1 = T02[s1 >>> 24] ^ T12[s2 >>> 16 & 255] ^ T23[s3 >>> 8 & 255] ^ T32[s0 & 255] ^ roundKeys[53];
        t2 = T02[s2 >>> 24] ^ T12[s3 >>> 16 & 255] ^ T23[s0 >>> 8 & 255] ^ T32[s1 & 255] ^ roundKeys[54];
        t3 = T02[s3 >>> 24] ^ T12[s0 >>> 16 & 255] ^ T23[s1 >>> 8 & 255] ^ T32[s2 & 255] ^ roundKeys[55];
        indexKey = 56;
      }
      keystream[0] = (S_BOX[t0 >>> 24] << 24 | S_BOX[t1 >>> 16 & 255] << 16 | S_BOX[t2 >>> 8 & 255] << 8 | S_BOX[t3 & 255]) ^ roundKeys[indexKey];
      keystream[1] = (S_BOX[t1 >>> 24] << 24 | S_BOX[t2 >>> 16 & 255] << 16 | S_BOX[t3 >>> 8 & 255] << 8 | S_BOX[t0 & 255]) ^ roundKeys[indexKey + 1];
      keystream[2] = (S_BOX[t2 >>> 24] << 24 | S_BOX[t3 >>> 16 & 255] << 16 | S_BOX[t0 >>> 8 & 255] << 8 | S_BOX[t1 & 255]) ^ roundKeys[indexKey + 2];
      keystream[3] = (S_BOX[t3 >>> 24] << 24 | S_BOX[t0 >>> 16 & 255] << 16 | S_BOX[t1 >>> 8 & 255] << 8 | S_BOX[t2 & 255]) ^ roundKeys[indexKey + 3];
    }
  }
  function pbkdf2(password, salt, iterations, length) {
    const hmac = createHmac(password);
    const result = new Uint8Array(length);
    const block = new Uint8Array(salt.length + 4);
    const blockView = new DataView(block.buffer);
    block.set(salt);
    for (let indexBlock = 1, offset = 0; offset < length; indexBlock++, offset += SHA1_DIGEST_LENGTH) {
      blockView.setUint32(salt.length, indexBlock);
      hmac.update(block, 0, block.length);
      let previous = hmac.digest();
      const output = previous.slice();
      for (let iteration = 1; iteration < iterations; iteration++) {
        hmac.update(previous, 0, SHA1_DIGEST_LENGTH);
        previous = hmac.digest();
        for (let indexByte = 0; indexByte < SHA1_DIGEST_LENGTH; indexByte++) {
          output[indexByte] ^= previous[indexByte];
        }
      }
      result.set(output.subarray(0, Math.min(SHA1_DIGEST_LENGTH, length - offset)), offset);
    }
    return result;
  }
  function createHmac(key) {
    const sha1 = createSha1();
    const innerKey = new Uint8Array(SHA1_BLOCK_LENGTH);
    const outerKey = new Uint8Array(SHA1_BLOCK_LENGTH);
    if (key.length > SHA1_BLOCK_LENGTH) {
      sha1.update(key, 0, key.length);
      key = sha1.digest();
    }
    for (let indexByte = 0; indexByte < SHA1_BLOCK_LENGTH; indexByte++) {
      const keyByte = indexByte < key.length ? key[indexByte] : 0;
      innerKey[indexByte] = keyByte ^ HMAC_INNER_PADDING;
      outerKey[indexByte] = keyByte ^ HMAC_OUTER_PADDING;
    }
    sha1.update(innerKey, 0, SHA1_BLOCK_LENGTH);
    return {
      update(data, offset, length) {
        sha1.update(data, offset, length);
      },
      digest() {
        const innerDigest = sha1.digest();
        sha1.update(outerKey, 0, SHA1_BLOCK_LENGTH);
        sha1.update(innerDigest, 0, SHA1_DIGEST_LENGTH);
        const result = sha1.digest();
        sha1.update(innerKey, 0, SHA1_BLOCK_LENGTH);
        return result;
      }
    };
  }
  function createSha1() {
    const state = new Int32Array(SHA1_INITIAL_STATE);
    const schedule = new Int32Array(SHA1_SCHEDULE_LENGTH);
    const block = new Uint8Array(SHA1_BLOCK_LENGTH);
    const blockView = new DataView(block.buffer);
    const lengthBytes = new Uint8Array(8);
    let blockLength = 0;
    let totalLength = 0;
    return {
      update,
      digest
    };
    function update(data, offset, length) {
      const end = offset + length;
      totalLength += length;
      if (blockLength) {
        while (offset < end && blockLength < SHA1_BLOCK_LENGTH) {
          block[blockLength++] = data[offset++];
        }
        if (blockLength == SHA1_BLOCK_LENGTH) {
          compress(blockView, 0);
          blockLength = 0;
        }
      }
      if (offset + SHA1_BLOCK_LENGTH <= end) {
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        for (; offset + SHA1_BLOCK_LENGTH <= end; offset += SHA1_BLOCK_LENGTH) {
          compress(view, offset);
        }
      }
      while (offset < end) {
        block[blockLength++] = data[offset++];
      }
    }
    function digest() {
      const bits = totalLength * 8;
      const high = Math.floor(bits / 4294967296);
      const low = bits >>> 0;
      update(SHA1_PADDING, 0, 1);
      while (blockLength != SHA1_LENGTH_OFFSET) {
        update(SHA1_ZERO, 0, 1);
      }
      lengthBytes[0] = high >>> 24;
      lengthBytes[1] = high >>> 16;
      lengthBytes[2] = high >>> 8;
      lengthBytes[3] = high;
      lengthBytes[4] = low >>> 24;
      lengthBytes[5] = low >>> 16;
      lengthBytes[6] = low >>> 8;
      lengthBytes[7] = low;
      update(lengthBytes, 0, 8);
      const result = new Uint8Array(SHA1_DIGEST_LENGTH);
      const resultView = new DataView(result.buffer);
      for (let indexWord = 0; indexWord < state.length; indexWord++) {
        resultView.setInt32(4 * indexWord, state[indexWord]);
      }
      state.set(SHA1_INITIAL_STATE);
      blockLength = 0;
      totalLength = 0;
      return result;
    }
    function compress(view, offset) {
      for (let index = 0; index < 16; index++) {
        schedule[index] = view.getInt32(offset + 4 * index);
      }
      let a = state[0];
      let b = state[1];
      let c = state[2];
      let d = state[3];
      let e = state[4];
      let t;
      for (let index = 0; index < 15; index += 5) {
        e = (a << 5 | a >>> 27) + ((c ^ d) & b ^ d) + e + 1518500249 + schedule[index] | 0;
        b = b << 30 | b >>> 2;
        d = (e << 5 | e >>> 27) + ((b ^ c) & a ^ c) + d + 1518500249 + schedule[index + 1] | 0;
        a = a << 30 | a >>> 2;
        c = (d << 5 | d >>> 27) + ((a ^ b) & e ^ b) + c + 1518500249 + schedule[index + 2] | 0;
        e = e << 30 | e >>> 2;
        b = (c << 5 | c >>> 27) + ((e ^ a) & d ^ a) + b + 1518500249 + schedule[index + 3] | 0;
        d = d << 30 | d >>> 2;
        a = (b << 5 | b >>> 27) + ((d ^ e) & c ^ e) + a + 1518500249 + schedule[index + 4] | 0;
        c = c << 30 | c >>> 2;
      }
      e = (a << 5 | a >>> 27) + ((c ^ d) & b ^ d) + e + 1518500249 + schedule[15] | 0;
      b = b << 30 | b >>> 2;
      t = schedule[13] ^ schedule[8] ^ schedule[2] ^ schedule[0];
      t = t << 1 | t >>> 31;
      schedule[0] = t;
      d = (e << 5 | e >>> 27) + ((b ^ c) & a ^ c) + d + 1518500249 + t | 0;
      a = a << 30 | a >>> 2;
      t = schedule[14] ^ schedule[9] ^ schedule[3] ^ schedule[1];
      t = t << 1 | t >>> 31;
      schedule[1] = t;
      c = (d << 5 | d >>> 27) + ((a ^ b) & e ^ b) + c + 1518500249 + t | 0;
      e = e << 30 | e >>> 2;
      t = schedule[15] ^ schedule[10] ^ schedule[4] ^ schedule[2];
      t = t << 1 | t >>> 31;
      schedule[2] = t;
      b = (c << 5 | c >>> 27) + ((e ^ a) & d ^ a) + b + 1518500249 + t | 0;
      d = d << 30 | d >>> 2;
      t = schedule[0] ^ schedule[11] ^ schedule[5] ^ schedule[3];
      t = t << 1 | t >>> 31;
      schedule[3] = t;
      a = (b << 5 | b >>> 27) + ((d ^ e) & c ^ e) + a + 1518500249 + t | 0;
      c = c << 30 | c >>> 2;
      for (let index = 20; index < 40; index += 5) {
        t = schedule[index - 3 & 15] ^ schedule[index - 8 & 15] ^ schedule[index - 14 & 15] ^ schedule[index & 15];
        t = t << 1 | t >>> 31;
        schedule[index & 15] = t;
        e = (a << 5 | a >>> 27) + (b ^ c ^ d) + e + 1859775393 + t | 0;
        b = b << 30 | b >>> 2;
        t = schedule[index - 2 & 15] ^ schedule[index - 7 & 15] ^ schedule[index - 13 & 15] ^ schedule[index + 1 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 1 & 15] = t;
        d = (e << 5 | e >>> 27) + (a ^ b ^ c) + d + 1859775393 + t | 0;
        a = a << 30 | a >>> 2;
        t = schedule[index - 1 & 15] ^ schedule[index - 6 & 15] ^ schedule[index - 12 & 15] ^ schedule[index + 2 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 2 & 15] = t;
        c = (d << 5 | d >>> 27) + (e ^ a ^ b) + c + 1859775393 + t | 0;
        e = e << 30 | e >>> 2;
        t = schedule[index & 15] ^ schedule[index - 5 & 15] ^ schedule[index - 11 & 15] ^ schedule[index + 3 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 3 & 15] = t;
        b = (c << 5 | c >>> 27) + (d ^ e ^ a) + b + 1859775393 + t | 0;
        d = d << 30 | d >>> 2;
        t = schedule[index + 1 & 15] ^ schedule[index - 4 & 15] ^ schedule[index - 10 & 15] ^ schedule[index + 4 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 4 & 15] = t;
        a = (b << 5 | b >>> 27) + (c ^ d ^ e) + a + 1859775393 + t | 0;
        c = c << 30 | c >>> 2;
      }
      for (let index = 40; index < 60; index += 5) {
        t = schedule[index - 3 & 15] ^ schedule[index - 8 & 15] ^ schedule[index - 14 & 15] ^ schedule[index & 15];
        t = t << 1 | t >>> 31;
        schedule[index & 15] = t;
        e = (a << 5 | a >>> 27) + (b & c | (b | c) & d) + e + 2400959708 + t | 0;
        b = b << 30 | b >>> 2;
        t = schedule[index - 2 & 15] ^ schedule[index - 7 & 15] ^ schedule[index - 13 & 15] ^ schedule[index + 1 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 1 & 15] = t;
        d = (e << 5 | e >>> 27) + (a & b | (a | b) & c) + d + 2400959708 + t | 0;
        a = a << 30 | a >>> 2;
        t = schedule[index - 1 & 15] ^ schedule[index - 6 & 15] ^ schedule[index - 12 & 15] ^ schedule[index + 2 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 2 & 15] = t;
        c = (d << 5 | d >>> 27) + (e & a | (e | a) & b) + c + 2400959708 + t | 0;
        e = e << 30 | e >>> 2;
        t = schedule[index & 15] ^ schedule[index - 5 & 15] ^ schedule[index - 11 & 15] ^ schedule[index + 3 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 3 & 15] = t;
        b = (c << 5 | c >>> 27) + (d & e | (d | e) & a) + b + 2400959708 + t | 0;
        d = d << 30 | d >>> 2;
        t = schedule[index + 1 & 15] ^ schedule[index - 4 & 15] ^ schedule[index - 10 & 15] ^ schedule[index + 4 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 4 & 15] = t;
        a = (b << 5 | b >>> 27) + (c & d | (c | d) & e) + a + 2400959708 + t | 0;
        c = c << 30 | c >>> 2;
      }
      for (let index = 60; index < 80; index += 5) {
        t = schedule[index - 3 & 15] ^ schedule[index - 8 & 15] ^ schedule[index - 14 & 15] ^ schedule[index & 15];
        t = t << 1 | t >>> 31;
        schedule[index & 15] = t;
        e = (a << 5 | a >>> 27) + (b ^ c ^ d) + e + 3395469782 + t | 0;
        b = b << 30 | b >>> 2;
        t = schedule[index - 2 & 15] ^ schedule[index - 7 & 15] ^ schedule[index - 13 & 15] ^ schedule[index + 1 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 1 & 15] = t;
        d = (e << 5 | e >>> 27) + (a ^ b ^ c) + d + 3395469782 + t | 0;
        a = a << 30 | a >>> 2;
        t = schedule[index - 1 & 15] ^ schedule[index - 6 & 15] ^ schedule[index - 12 & 15] ^ schedule[index + 2 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 2 & 15] = t;
        c = (d << 5 | d >>> 27) + (e ^ a ^ b) + c + 3395469782 + t | 0;
        e = e << 30 | e >>> 2;
        t = schedule[index & 15] ^ schedule[index - 5 & 15] ^ schedule[index - 11 & 15] ^ schedule[index + 3 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 3 & 15] = t;
        b = (c << 5 | c >>> 27) + (d ^ e ^ a) + b + 3395469782 + t | 0;
        d = d << 30 | d >>> 2;
        t = schedule[index + 1 & 15] ^ schedule[index - 4 & 15] ^ schedule[index - 10 & 15] ^ schedule[index + 4 & 15];
        t = t << 1 | t >>> 31;
        schedule[index + 4 & 15] = t;
        a = (b << 5 | b >>> 27) + (c ^ d ^ e) + a + 3395469782 + t | 0;
        c = c << 30 | c >>> 2;
      }
      state[0] = state[0] + a | 0;
      state[1] = state[1] + b | 0;
      state[2] = state[2] + c | 0;
      state[3] = state[3] + d | 0;
      state[4] = state[4] + e | 0;
    }
  }
  function initTables() {
    if (!tablesInitialized) {
      let p2 = 1;
      let q2 = 1;
      do {
        p2 = (p2 ^ p2 << 1 ^ (p2 & 128 ? 27 : 0)) & 255;
        q2 = (q2 ^ q2 << 1) & 255;
        q2 = (q2 ^ q2 << 2) & 255;
        q2 = (q2 ^ q2 << 4) & 255;
        if (q2 & 128) {
          q2 ^= 9;
        }
        S_BOX[p2] = (q2 ^ (q2 << 1 | q2 >> 7) ^ (q2 << 2 | q2 >> 6) ^ (q2 << 3 | q2 >> 5) ^ (q2 << 4 | q2 >> 4) ^ 99) & 255;
      } while (p2 != 1);
      S_BOX[0] = 99;
      for (let index = 0; index < 256; index++) {
        const s = S_BOX[index];
        const s2 = multiplyByTwo(s);
        const t = s2 << 24 | s << 16 | s << 8 | s2 ^ s;
        T02[index] = t;
        T12[index] = t >>> 8 | t << 24;
        T23[index] = t >>> 16 | t << 16;
        T32[index] = t >>> 24 | t << 8;
      }
      tablesInitialized = true;
    }
  }
  function expandKey(key, roundKeys) {
    const keyWords = key.length >> 2;
    const rounds = keyWords + 6;
    const total = 4 * (rounds + 1);
    let roundConstant = 1;
    for (let index = 0; index < keyWords; index++) {
      roundKeys[index] = key[4 * index] << 24 | key[4 * index + 1] << 16 | key[4 * index + 2] << 8 | key[4 * index + 3];
    }
    for (let index = keyWords; index < total; index++) {
      let word = roundKeys[index - 1];
      if (index % keyWords == 0) {
        word = substituteWord(word << 8 | word >>> 24) ^ roundConstant << 24;
        roundConstant = multiplyByTwo(roundConstant);
      } else if (keyWords > 6 && index % keyWords == 4) {
        word = substituteWord(word);
      }
      roundKeys[index] = roundKeys[index - keyWords] ^ word;
    }
    return rounds;
  }
  function substituteWord(word) {
    return S_BOX[word >>> 24] << 24 | S_BOX[word >>> 16 & 255] << 16 | S_BOX[word >>> 8 & 255] << 8 | S_BOX[word & 255];
  }
  function swapBytes(value) {
    return value << 24 | (value & 65280) << 8 | value >>> 8 & 65280 | value >>> 24;
  }
  function multiplyByTwo(value) {
    return (value << 1 ^ (value >> 7) * 27) & 255;
  }
  var BLOCK_LENGTH, ROUND_KEYS_LENGTH, SHA1_BLOCK_LENGTH, SHA1_DIGEST_LENGTH, SHA1_SCHEDULE_LENGTH, SHA1_LENGTH_OFFSET, SHA1_PADDING, SHA1_ZERO, SHA1_INITIAL_STATE, HMAC_INNER_PADDING, HMAC_OUTER_PADDING, S_BOX, T02, T12, T23, T32, tablesInitialized;
  var init_aes_hmac_sha1 = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/codecs/aes-hmac-sha1.js"() {
      BLOCK_LENGTH = 16;
      ROUND_KEYS_LENGTH = 60;
      SHA1_BLOCK_LENGTH = 64;
      SHA1_DIGEST_LENGTH = 20;
      SHA1_SCHEDULE_LENGTH = 16;
      SHA1_LENGTH_OFFSET = 56;
      SHA1_PADDING = new Uint8Array([128]);
      SHA1_ZERO = new Uint8Array(1);
      SHA1_INITIAL_STATE = new Int32Array([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
      HMAC_INNER_PADDING = 54;
      HMAC_OUTER_PADDING = 92;
      S_BOX = new Uint8Array(256);
      T02 = new Int32Array(256);
      T12 = new Int32Array(256);
      T23 = new Int32Array(256);
      T32 = new Int32Array(256);
      tablesInitialized = false;
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/common-crypto.js
  function getRandomValues(array) {
    if (GET_RANDOM_VALUES_SUPPORTED) {
      return crypto.getRandomValues(array);
    } else {
      throw new Error(ERR_UNSUPPORTED_CRYPTO_API);
    }
  }
  var GET_RANDOM_VALUES_SUPPORTED, ERR_INVALID_PASSWORD, ERR_INVALID_AUTHENTICATION_CODE, ERR_ABORT_CHECK_PASSWORD, ERR_UNSUPPORTED_CRYPTO_API;
  var init_common_crypto = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/common-crypto.js"() {
      init_constants();
      GET_RANDOM_VALUES_SUPPORTED = typeof crypto != UNDEFINED_TYPE && typeof crypto.getRandomValues == FUNCTION_TYPE;
      ERR_INVALID_PASSWORD = "Invalid password";
      ERR_INVALID_AUTHENTICATION_CODE = "Invalid authentication code";
      ERR_ABORT_CHECK_PASSWORD = "zipjs-abort-check-password";
      ERR_UNSUPPORTED_CRYPTO_API = "Crypto API not supported";
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/aes-crypto-stream.js
  function initAesCrypto(aesCrypto, password, rawPassword, encryptionStrength) {
    Object.assign(aesCrypto, {
      ready: new Promise((resolve) => aesCrypto.resolveReady = resolve),
      password: encodePassword(password, rawPassword),
      strength: encryptionStrength - 1,
      pendingInput: EMPTY_UINT8_ARRAY,
      discarded: false
    });
  }
  function setDisposingReadable(stream, aesCrypto) {
    const reader = stream.readable.getReader();
    const readable = new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
          disposeEngine(aesCrypto);
          reader.cancel(error).catch(() => {
          });
          throw error;
        }
      },
      cancel(reason) {
        disposeEngine(aesCrypto);
        return reader.cancel(reason);
      }
    });
    Object.defineProperty(stream, "readable", {
      get() {
        return readable;
      }
    });
  }
  function append(aesCrypto, input, output, paddingStart, paddingEnd, decrypt2) {
    const {
      engine,
      pendingInput
    } = aesCrypto;
    if (pendingInput.length) {
      input = concat(pendingInput, input);
    }
    const inputLength = input.length - paddingEnd;
    const alignedLength = inputLength - inputLength % BLOCK_LENGTH2;
    output = expand(output, paddingStart + alignedLength);
    if (alignedLength) {
      const chunk = subarray(output, paddingStart, paddingStart + alignedLength);
      chunk.set(subarray(input, 0, alignedLength));
      engine.process(chunk, decrypt2);
    }
    aesCrypto.pendingInput = subarray(input, alignedLength);
    return output;
  }
  async function createDecryptionKeys(decrypt2, strength, password, preamble) {
    const passwordVerificationKey = await createKeys(decrypt2, strength, password, subarray(preamble, 0, SALT_LENGTH[strength]));
    const passwordVerification = subarray(preamble, SALT_LENGTH[strength]);
    if (passwordVerificationKey[0] != passwordVerification[0] || passwordVerificationKey[1] != passwordVerification[1]) {
      disposeEngine(decrypt2);
      throw new Error(ERR_INVALID_PASSWORD);
    }
  }
  function disposeEngine(aesCrypto) {
    const { engine } = aesCrypto;
    aesCrypto.discarded = true;
    if (engine && engine.dispose) {
      engine.dispose();
    }
  }
  async function createEncryptionKeys(encrypt2, strength, password) {
    const salt = getRandomValues(new Uint8Array(SALT_LENGTH[strength]));
    const passwordVerification = await createKeys(encrypt2, strength, password, salt);
    return concat(salt, passwordVerification);
  }
  async function createKeys(aesCrypto, strength, password, salt) {
    aesCrypto.password = null;
    const keyLength = KEY_LENGTH[strength];
    const compositeKey = await deriveKey(password, salt, keyLength * 2 + PASSWORD_VERIFICATION_LENGTH);
    aesCrypto.engine = createEngine2(subarray(compositeKey, 0, keyLength), subarray(compositeKey, keyLength, keyLength * 2));
    if (aesCrypto.discarded) {
      disposeEngine(aesCrypto);
    }
    return subarray(compositeKey, keyLength * 2);
  }
  async function deriveKey(password, salt, length) {
    if (DERIVE_BITS_SUPPORTED) {
      try {
        const baseKey = await subtle.importKey(RAW_FORMAT, password, BASE_KEY_ALGORITHM, false, DERIVED_BITS_USAGE);
        return new Uint8Array(await subtle.deriveBits(Object.assign({ salt }, DERIVED_BITS_ALGORITHM), baseKey, length * 8));
      } catch {
        DERIVE_BITS_SUPPORTED = false;
      }
    }
    return pbkdf2(password, salt, PBKDF2_ITERATIONS, length);
  }
  function encodePassword(password, rawPassword) {
    if (rawPassword === UNDEFINED_VALUE) {
      return encodeText(password);
    } else {
      return rawPassword;
    }
  }
  function expand(inputArray, length) {
    if (length && length > inputArray.length) {
      const array = inputArray;
      inputArray = new Uint8Array(length);
      inputArray.set(array, 0);
    }
    return inputArray;
  }
  function subarray(array, begin, end) {
    return array.subarray(begin, end);
  }
  var BLOCK_LENGTH2, RAW_FORMAT, PBKDF2_ALGORITHM, HASH_ALGORITHM, HASH_FUNCTION, PBKDF2_ITERATIONS, BASE_KEY_ALGORITHM, DERIVED_BITS_ALGORITHM, DERIVED_BITS_USAGE, SALT_LENGTH, KEY_LENGTH, AUTHENTICATION_CODE_LENGTH, PASSWORD_VERIFICATION_LENGTH, CRYPTO_API_SUPPORTED, subtle, SUBTLE_API_SUPPORTED, DERIVE_BITS_SUPPORTED, createEngine2, AESDecryptionStream, AESEncryptionStream;
  var init_aes_crypto_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/aes-crypto-stream.js"() {
      init_constants();
      init_encode_text();
      init_array();
      init_aes_hmac_sha1();
      init_common_crypto();
      BLOCK_LENGTH2 = 16;
      RAW_FORMAT = "raw";
      PBKDF2_ALGORITHM = { name: "PBKDF2" };
      HASH_ALGORITHM = { name: "HMAC" };
      HASH_FUNCTION = "SHA-1";
      PBKDF2_ITERATIONS = 1e3;
      BASE_KEY_ALGORITHM = Object.assign({ hash: HASH_ALGORITHM }, PBKDF2_ALGORITHM);
      DERIVED_BITS_ALGORITHM = Object.assign({ iterations: PBKDF2_ITERATIONS, hash: { name: HASH_FUNCTION } }, PBKDF2_ALGORITHM);
      DERIVED_BITS_USAGE = ["deriveBits"];
      SALT_LENGTH = [8, 12, 16];
      KEY_LENGTH = [16, 24, 32];
      AUTHENTICATION_CODE_LENGTH = 10;
      PASSWORD_VERIFICATION_LENGTH = 2;
      CRYPTO_API_SUPPORTED = typeof crypto != UNDEFINED_TYPE;
      subtle = CRYPTO_API_SUPPORTED && crypto.subtle;
      SUBTLE_API_SUPPORTED = CRYPTO_API_SUPPORTED && typeof subtle != UNDEFINED_TYPE;
      DERIVE_BITS_SUPPORTED = SUBTLE_API_SUPPORTED && typeof subtle.importKey == FUNCTION_TYPE && typeof subtle.deriveBits == FUNCTION_TYPE;
      createEngine2 = createEngine;
      AESDecryptionStream = class extends TransformStream {
        constructor({ password, rawPassword, encryptionStrength, checkPasswordOnly, checkAuthenticationCode = true }) {
          const aesCrypto = {};
          super({
            start() {
              initAesCrypto(aesCrypto, password, rawPassword, encryptionStrength);
            },
            async transform(chunk, controller) {
              const {
                password: password2,
                strength,
                resolveReady,
                ready
              } = aesCrypto;
              if (password2) {
                await createDecryptionKeys(aesCrypto, strength, password2, subarray(chunk, 0, SALT_LENGTH[strength] + PASSWORD_VERIFICATION_LENGTH));
                chunk = subarray(chunk, SALT_LENGTH[strength] + PASSWORD_VERIFICATION_LENGTH);
                if (checkPasswordOnly) {
                  disposeEngine(aesCrypto);
                  controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
                } else {
                  resolveReady();
                }
              } else {
                await ready;
              }
              if (aesCrypto.discarded) {
                return;
              }
              const output = new Uint8Array(chunk.length - AUTHENTICATION_CODE_LENGTH - (chunk.length - AUTHENTICATION_CODE_LENGTH) % BLOCK_LENGTH2);
              controller.enqueue(append(aesCrypto, chunk, output, 0, AUTHENTICATION_CODE_LENGTH, true));
            },
            async flush(controller) {
              const {
                engine,
                pendingInput,
                ready
              } = aesCrypto;
              if (engine) {
                await ready;
                if (aesCrypto.discarded) {
                  return;
                }
                const originalAuthenticationCode = subarray(pendingInput, pendingInput.length - AUTHENTICATION_CODE_LENGTH);
                const decryptedChunkArray = new Uint8Array(subarray(pendingInput, 0, pendingInput.length - AUTHENTICATION_CODE_LENGTH));
                engine.process(decryptedChunkArray, true);
                const authenticationCode = engine.digest();
                let invalidAuthenticationCode = pendingInput.length < AUTHENTICATION_CODE_LENGTH ? 1 : 0;
                for (let indexByte = 0; indexByte < AUTHENTICATION_CODE_LENGTH; indexByte++) {
                  invalidAuthenticationCode |= authenticationCode[indexByte] ^ originalAuthenticationCode[indexByte];
                }
                if (invalidAuthenticationCode && checkAuthenticationCode) {
                  controller.error(new Error(ERR_INVALID_AUTHENTICATION_CODE));
                  return;
                }
                controller.enqueue(decryptedChunkArray);
              }
            }
          });
          setDisposingReadable(this, aesCrypto);
        }
      };
      AESEncryptionStream = class extends TransformStream {
        constructor({ password, rawPassword, encryptionStrength }) {
          const aesCrypto = {};
          super({
            start() {
              initAesCrypto(aesCrypto, password, rawPassword, encryptionStrength);
            },
            async transform(chunk, controller) {
              const {
                password: password2,
                strength,
                resolveReady,
                ready
              } = aesCrypto;
              let preamble = EMPTY_UINT8_ARRAY;
              if (password2) {
                preamble = await createEncryptionKeys(aesCrypto, strength, password2);
                resolveReady();
              } else {
                await ready;
              }
              if (aesCrypto.discarded) {
                return;
              }
              const output = new Uint8Array(preamble.length + chunk.length - chunk.length % BLOCK_LENGTH2);
              output.set(preamble, 0);
              controller.enqueue(append(aesCrypto, chunk, output, preamble.length, 0, false));
            },
            async flush(controller) {
              const {
                engine,
                pendingInput,
                ready
              } = aesCrypto;
              if (engine) {
                await ready;
                if (aesCrypto.discarded) {
                  return;
                }
                const encryptedChunkArray = new Uint8Array(pendingInput);
                engine.process(encryptedChunkArray, false);
                const authenticationCode = subarray(engine.digest(), 0, AUTHENTICATION_CODE_LENGTH);
                controller.enqueue(concat(encryptedChunkArray, authenticationCode));
              }
            }
          });
          setDisposingReadable(this, aesCrypto);
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/zip-crypto-stream.js
  function initZipCrypto(zipCrypto, password, rawPassword, passwordVerification) {
    Object.assign(zipCrypto, {
      password,
      rawPassword,
      passwordVerification
    });
    createKeys2(zipCrypto, password, rawPassword);
  }
  function decrypt(target, input) {
    const output = new Uint8Array(input.length);
    for (let index = 0; index < input.length; index++) {
      output[index] = getByte(target) ^ input[index];
      updateKeys(target, output[index]);
    }
    return output;
  }
  function encrypt(target, input) {
    const output = new Uint8Array(input.length);
    for (let index = 0; index < input.length; index++) {
      output[index] = getByte(target) ^ input[index];
      updateKeys(target, input[index]);
    }
    return output;
  }
  function createKeys2(target, password, rawPassword) {
    const cryptoKeys = [305419896, 591751049, 878082192];
    Object.assign(target, {
      cryptoKeys,
      crcKey0: new Crc32(cryptoKeys[0]),
      crcKey2: new Crc32(cryptoKeys[2])
    });
    if (rawPassword) {
      for (let index = 0; index < rawPassword.length; index++) {
        updateKeys(target, rawPassword[index]);
      }
    } else {
      for (let index = 0; index < password.length; index++) {
        updateKeys(target, password.charCodeAt(index));
      }
    }
  }
  function updateKeys(target, byte) {
    let [, key1] = target.cryptoKeys;
    target.crcKey0.append([byte]);
    const key0 = ~target.crcKey0.get();
    key1 = getInt32(Math.imul(getInt32(key1 + getInt8(key0)), 134775813) + 1);
    target.crcKey2.append([key1 >>> 24]);
    const key2 = ~target.crcKey2.get();
    target.cryptoKeys = [key0, key1, key2];
  }
  function getByte(target) {
    const temp = target.cryptoKeys[2] | 2;
    return getInt8(Math.imul(temp, temp ^ 1) >>> 8);
  }
  function getInt8(number) {
    return number & 255;
  }
  function getInt32(number) {
    return number & 4294967295;
  }
  var HEADER_LENGTH, ZipCryptoDecryptionStream, ZipCryptoEncryptionStream;
  var init_zip_crypto_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/zip-crypto-stream.js"() {
      init_crc32();
      init_common_crypto();
      HEADER_LENGTH = 12;
      ZipCryptoDecryptionStream = class extends TransformStream {
        constructor({ password, rawPassword, passwordVerification, checkPasswordOnly }) {
          super({
            start() {
              initZipCrypto(this, password, rawPassword, passwordVerification);
            },
            transform(chunk, controller) {
              const zipCrypto = this;
              if (zipCrypto.password || zipCrypto.rawPassword) {
                const decryptedHeader = decrypt(zipCrypto, chunk.subarray(0, HEADER_LENGTH));
                zipCrypto.password = zipCrypto.rawPassword = null;
                if ((decryptedHeader[HEADER_LENGTH - 1] ^ zipCrypto.passwordVerification) != 0) {
                  throw new Error(ERR_INVALID_PASSWORD);
                }
                chunk = chunk.subarray(HEADER_LENGTH);
              }
              if (checkPasswordOnly) {
                controller.error(new Error(ERR_ABORT_CHECK_PASSWORD));
              } else {
                controller.enqueue(decrypt(zipCrypto, chunk));
              }
            }
          });
        }
      };
      ZipCryptoEncryptionStream = class extends TransformStream {
        constructor({ password, rawPassword, passwordVerification }) {
          super({
            start() {
              initZipCrypto(this, password, rawPassword, passwordVerification);
            },
            transform(chunk, controller) {
              const zipCrypto = this;
              let output;
              let offset;
              if (zipCrypto.password || zipCrypto.rawPassword) {
                zipCrypto.password = zipCrypto.rawPassword = null;
                const header = getRandomValues(new Uint8Array(HEADER_LENGTH));
                header[HEADER_LENGTH - 1] = zipCrypto.passwordVerification;
                output = new Uint8Array(chunk.length + header.length);
                output.set(encrypt(zipCrypto, header), 0);
                offset = HEADER_LENGTH;
              } else {
                output = new Uint8Array(chunk.length);
                offset = 0;
              }
              output.set(encrypt(zipCrypto, chunk), offset);
              controller.enqueue(output);
            }
          });
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/compatible-streams.js
  function toCompatibleReadable(readable) {
    if (readable instanceof ReadableStream) {
      return readable;
    }
    const reader = readable.getReader();
    return new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
          reader.cancel(error).catch(() => {
          });
          throw error;
        }
      },
      cancel(reason) {
        return reader.cancel(reason);
      }
    });
  }
  function streamToBlob(readable, contentType) {
    readable = toCompatibleReadable(readable);
    const blobOptions = contentType ? { type: contentType } : {};
    if (responseSupportsGlobalReadable()) {
      return new Response(readable).blob().then((blob) => contentType ? new Blob([blob], blobOptions) : blob);
    }
    const chunks = [];
    return readable.pipeTo(new WritableStream({
      write(chunk) {
        chunks.push(chunk);
      }
    })).then(() => new Blob(chunks, blobOptions));
  }
  function responseSupportsGlobalReadable() {
    return typeof Blob.prototype.stream != FUNCTION_TYPE || new Blob([]).stream() instanceof ReadableStream;
  }
  function toCompatibleWritable(writable) {
    if (writable instanceof WritableStream) {
      return writable;
    }
    const writer = writable.getWriter();
    return new WritableStream({
      write(chunk) {
        return writer.write(chunk);
      },
      close() {
        return writer.close();
      },
      abort(reason) {
        return writer.abort(reason);
      }
    });
  }
  var init_compatible_streams = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/compatible-streams.js"() {
      init_constants();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/codec-registry.js
  function getRegisteredCodec(compressionMethod) {
    return registeredCodecs.get(compressionMethod);
  }
  function getCodecStreams(format) {
    return codecStreams.get(format);
  }
  function setCodecStreams(format, streams) {
    const { CompressionStream: CompressionStream2, DecompressionStream: DecompressionStream2 } = streams;
    if (typeof CompressionStream2 != FUNCTION_TYPE && typeof DecompressionStream2 != FUNCTION_TYPE) {
      throw new Error(ERR_INVALID_CODEC_MODULE);
    }
    codecStreams.set(format, { CompressionStream: CompressionStream2, DecompressionStream: DecompressionStream2 });
  }
  async function ensureCodecStreams(format, codecURI) {
    if (!codecStreams.has(format) && codecURI) {
      setCodecStreams(format, await import(
        /* webpackIgnore: true */
        /* @vite-ignore */
        codecURI
      ));
    }
  }
  var ERR_INVALID_CODEC_MODULE, ERR_UNSUPPORTED_COMPRESSION, registeredCodecs, codecStreams;
  var init_codec_registry = __esm({
    "node_modules/@zip.js/zip.js/lib/core/codec-registry.js"() {
      init_constants();
      ERR_INVALID_CODEC_MODULE = "Invalid codec module";
      ERR_UNSUPPORTED_COMPRESSION = "Compression method not supported";
      registeredCodecs = /* @__PURE__ */ new Map();
      codecStreams = /* @__PURE__ */ new Map();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/zip-entry-stream.js
  function pipeThroughGzipDecompressionStream(readable, gzipStream, outputSize, crc32, sourceErrors) {
    const writer = gzipStream.writable.getWriter();
    const reader = gzipStream.readable.getReader();
    const outputCrc32 = crc32 === UNDEFINED_VALUE ? new Crc32() : UNDEFINED_VALUE;
    let outputLength = 0;
    let trailerWritten = false;
    let settled = false;
    let resolvePull, controller;
    const output = new ReadableStream({
      start(streamController) {
        controller = streamController;
      },
      pull() {
        resumePump();
      },
      cancel(reason) {
        settled = true;
        resumePump();
        return reader.cancel(reason);
      }
    });
    pump();
    drain();
    return output;
    async function pump() {
      const inputReader = readable.getReader();
      try {
        const header = new Uint8Array(GZIP_HEADER_LENGTH);
        header.set(GZIP_HEADER_BYTES);
        await writer.write(header);
        for (; ; ) {
          await outputCapacity();
          await writer.ready;
          const { value, done } = await readSource(inputReader, sourceErrors);
          if (done) {
            break;
          }
          await writer.write(value);
        }
        if (outputCrc32) {
          await writer.write(new Uint8Array(0));
        }
        const trailer = new Uint8Array(GZIP_TRAILER_LENGTH);
        const dataView = getDataView(trailer);
        dataView.setUint32(0, outputCrc32 ? outputCrc32.get() : crc32, true);
        dataView.setUint32(4, outputSize, true);
        trailerWritten = true;
        await writer.write(trailer);
        await writer.close();
      } catch (error) {
        await abort(writer, error);
        await cancel(inputReader, error);
      }
    }
    async function drain() {
      try {
        for (; ; ) {
          const { value, done } = await read();
          if (done) {
            break;
          }
          outputLength += value.length;
          if (outputLength > outputSize) {
            throw new Error(ERR_INVALID_UNCOMPRESSED_SIZE);
          }
          if (outputCrc32) {
            outputCrc32.append(value);
          }
          controller.enqueue(value);
        }
        if (!settled) {
          settled = true;
          controller.close();
        }
      } catch (error) {
        fail(error);
        await cancel(reader, error);
      }
    }
    function read() {
      return reader.read().catch((error) => {
        if (trailerWritten) {
          if (!outputCrc32) {
            throw mapError(error, ERR_INVALID_CRC32);
          }
          if (outputLength != outputSize) {
            throw mapError(error, ERR_INVALID_UNCOMPRESSED_SIZE);
          }
          return { done: true };
        }
        throw mapCodecError(error, sourceErrors);
      });
    }
    function outputCapacity() {
      if (!settled && controller.desiredSize <= 0) {
        return new Promise((resolve) => resolvePull = resolve);
      }
    }
    function resumePump() {
      if (resolvePull) {
        const resolve = resolvePull;
        resolvePull = UNDEFINED_VALUE;
        resolve();
      }
    }
    function fail(error) {
      if (!settled) {
        settled = true;
        controller.error(error);
        resumePump();
      }
    }
  }
  function supportsFormat(StreamClass, format) {
    if (!StreamClass) {
      return false;
    }
    let supportByFormat = formatSupportByStream.get(StreamClass);
    if (!supportByFormat) {
      supportByFormat = /* @__PURE__ */ new Map();
      formatSupportByStream.set(StreamClass, supportByFormat);
    }
    let supported = supportByFormat.get(format);
    if (supported === UNDEFINED_VALUE) {
      try {
        new StreamClass(format);
        supported = true;
      } catch {
        supported = false;
      }
      supportByFormat.set(format, supported);
    }
    return supported;
  }
  function supportsDeflateRaw(StreamClass) {
    return supportsFormat(StreamClass, FORMAT_DEFLATE_RAW);
  }
  function supportsGzip(StreamClass) {
    return supportsFormat(StreamClass, FORMAT_GZIP);
  }
  function setReadable(stream, readable, flush) {
    readable = pipeThrough(readable, new TransformStream({ flush }));
    Object.defineProperty(stream, "readable", {
      get() {
        return readable;
      }
    });
  }
  function createCodecStream(CodecStreamClass, format, options) {
    if (!CodecStreamClass) {
      throw new Error(ERR_UNSUPPORTED_COMPRESSION);
    }
    return new CodecStreamClass(format, options);
  }
  function getGzipCodecStream(useCompressionStream, CodecStreamNative, CodecStreamFallback) {
    if (useCompressionStream && CodecStreamNative) {
      return CodecStreamNative;
    } else if (CodecStreamFallback && CodecStreamFallback.requiresModule) {
      return CodecStreamFallback;
    }
  }
  function pipeThroughCompressionStream(readable, useCompressionStream, options, CompressionStreamNative, CompressionStreamFallback, sourceErrors) {
    const Stream2 = useCompressionStream && CompressionStreamNative ? CompressionStreamNative : CompressionStreamFallback || CompressionStreamNative;
    const format = options.deflate64 ? FORMAT_DEFLATE64_RAW : FORMAT_DEFLATE_RAW;
    let codecStream;
    try {
      codecStream = new Stream2(format, options);
    } catch (error) {
      if (useCompressionStream && CompressionStreamFallback && Stream2 != CompressionStreamFallback) {
        codecStream = new CompressionStreamFallback(format, options);
      } else {
        throw error;
      }
    }
    return pipeThroughBackpressured(readable, codecStream, sourceErrors);
  }
  function pipeThrough(readable, transformStream) {
    return toCompatibleReadable(readable).pipeThrough(transformStream);
  }
  function pipeThroughBackpressured(readable, transformStream, sourceErrors) {
    const writer = transformStream.writable.getWriter();
    const reader = readable.getReader();
    pump();
    return transformStream.readable;
    async function pump() {
      try {
        for (; ; ) {
          await writer.ready;
          const result = await readSource(reader, sourceErrors);
          if (result.done) {
            await writer.close();
            break;
          }
          await writer.write(result.value);
        }
      } catch (error) {
        await abort(writer, error);
        await cancel(reader, error);
      }
    }
  }
  async function abort(writer, error) {
    try {
      await writer.abort(error);
    } catch {
    }
  }
  async function cancel(reader, error) {
    try {
      await reader.cancel(error);
    } catch {
    }
  }
  function readSource(reader, sourceErrors) {
    const result = reader.read();
    return sourceErrors ? result.catch((error) => {
      sourceErrors.add(error);
      throw error;
    }) : result;
  }
  function mapCodecError(error, sourceErrors) {
    if (sourceErrors.has(error)) {
      return error;
    }
    return mapError(error, isMemoryError(error) ? ERR_CODEC_OUT_OF_MEMORY : ERR_INVALID_COMPRESSED_DATA);
  }
  function mapMemoryError(error) {
    return isMemoryError(error) ? mapError(error, ERR_CODEC_OUT_OF_MEMORY) : error;
  }
  function isMemoryError(error) {
    return isErrorObject(error) && error.code == Z_MEM_ERROR_CODE;
  }
  function mapError(error, message) {
    const mappedError = new Error(message);
    mappedError.cause = error;
    return mappedError;
  }
  function mapInflateStreamError(readable, sourceErrors) {
    const reader = readable.getReader();
    return new ReadableStream({
      async pull(controller) {
        try {
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
          await cancel(reader, error);
          throw mapCodecError(error, sourceErrors);
        }
      },
      cancel(reason) {
        return reader.cancel(reason);
      }
    });
  }
  var ERR_INVALID_UNCOMPRESSED_SIZE, ERR_INVALID_COMPRESSED_DATA, ERR_CODEC_OUT_OF_MEMORY, ERR_INVALID_CRC32, Z_MEM_ERROR_CODE, FORMAT_DEFLATE_RAW, FORMAT_DEFLATE64_RAW, FORMAT_GZIP, GZIP_HEADER_LENGTH, GZIP_TRAILER_LENGTH, GZIP_HEADER_BYTES, DeflateStream, GzipToRawDeflateStream, InflateStream, formatSupportByStream;
  var init_zip_entry_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/zip-entry-stream.js"() {
      init_crc32();
      init_crc32_stream();
      init_aes_crypto_stream();
      init_zip_crypto_stream();
      init_common_crypto();
      init_constants();
      init_array();
      init_compatible_streams();
      init_error();
      init_codec_registry();
      ERR_INVALID_UNCOMPRESSED_SIZE = "Invalid uncompressed size";
      ERR_INVALID_COMPRESSED_DATA = "Invalid compressed data";
      ERR_CODEC_OUT_OF_MEMORY = "Codec out of memory";
      ERR_INVALID_CRC32 = "Invalid CRC32";
      Z_MEM_ERROR_CODE = "Z_MEM_ERROR";
      FORMAT_DEFLATE_RAW = "deflate-raw";
      FORMAT_DEFLATE64_RAW = "deflate64-raw";
      FORMAT_GZIP = "gzip";
      GZIP_HEADER_LENGTH = 10;
      GZIP_TRAILER_LENGTH = 8;
      GZIP_HEADER_BYTES = [31, 139, 8];
      DeflateStream = class extends TransformStream {
        constructor(options, { chunkSize, CompressionStreamFallback, CompressionStream: CompressionStream2 }) {
          super({});
          const { compressed, encrypted, useCompressionStream, zipCrypto, computeCrc32, level, deflate64, format, compressionMethod, inputSize } = options;
          const stream = this;
          let crc32Stream, encryptionStream, gzipCrc32Stream;
          let readable = super.readable;
          const codecStreams2 = format && getCodecStreams(format);
          const GzipCompressionStream = getGzipCodecStream(useCompressionStream, CompressionStream2, CompressionStreamFallback);
          const useGzipCrc32 = computeCrc32 && compressed && !deflate64 && !codecStreams2 && (!encrypted || zipCrypto) && Boolean(GzipCompressionStream);
          if ((!encrypted || zipCrypto) && computeCrc32 && !useGzipCrc32) {
            crc32Stream = new Crc32Stream();
            readable = pipeThrough(readable, crc32Stream);
          }
          if (compressed) {
            if (codecStreams2) {
              readable = pipeThroughBackpressured(readable, createCodecStream(codecStreams2.CompressionStream, format, { level, chunkSize, compressionMethod, uncompressedSize: inputSize }));
            } else if (useGzipCrc32) {
              gzipCrc32Stream = new GzipToRawDeflateStream();
              readable = pipeThroughBackpressured(readable, new GzipCompressionStream(FORMAT_GZIP, { level, chunkSize }));
              readable = pipeThrough(readable, gzipCrc32Stream);
            } else {
              try {
                readable = pipeThroughCompressionStream(readable, useCompressionStream, { level, chunkSize }, CompressionStream2, CompressionStreamFallback);
              } catch (error) {
                if (!useCompressionStream && CompressionStreamFallback) {
                  throw mapMemoryError(error);
                }
                let gzipStream;
                try {
                  gzipStream = new CompressionStream2(FORMAT_GZIP);
                } catch {
                  throw mapMemoryError(error);
                }
                readable = pipeThroughBackpressured(readable, gzipStream);
                readable = pipeThrough(readable, new GzipToRawDeflateStream());
              }
            }
          }
          if (encrypted) {
            if (zipCrypto) {
              readable = pipeThrough(readable, new ZipCryptoEncryptionStream(options));
            } else {
              encryptionStream = new AESEncryptionStream(options);
              readable = pipeThrough(readable, encryptionStream);
            }
          }
          setReadable(stream, readable, () => {
            if ((!encrypted || zipCrypto) && computeCrc32) {
              stream.crc32 = useGzipCrc32 ? gzipCrc32Stream.crc32 : new DataView(crc32Stream.value.buffer).getUint32(0);
            }
          });
        }
      };
      GzipToRawDeflateStream = class extends TransformStream {
        constructor() {
          let stream;
          let headerBytesLeft = GZIP_HEADER_LENGTH;
          let trailerCandidate = new Uint8Array(0);
          super({
            transform(chunk, controller) {
              if (headerBytesLeft) {
                const droppedLength = Math.min(headerBytesLeft, chunk.length);
                headerBytesLeft -= droppedLength;
                chunk = chunk.subarray(droppedLength);
                if (!chunk.length) {
                  return;
                }
              }
              const availableLength = trailerCandidate.length + chunk.length;
              if (availableLength <= GZIP_TRAILER_LENGTH) {
                trailerCandidate = concat(trailerCandidate, chunk);
                return;
              }
              const emitLength = availableLength - GZIP_TRAILER_LENGTH;
              const emittedFromTrailer = Math.min(emitLength, trailerCandidate.length);
              controller.enqueue(concat(
                trailerCandidate.subarray(0, emittedFromTrailer),
                chunk.subarray(0, emitLength - emittedFromTrailer)
              ));
              trailerCandidate = concat(
                trailerCandidate.subarray(emittedFromTrailer),
                chunk.subarray(emitLength - emittedFromTrailer)
              );
            },
            flush() {
              const dataView = getDataView(trailerCandidate);
              stream.crc32 = dataView.getUint32(0, true);
              stream.uncompressedSize = dataView.getUint32(4, true);
            }
          });
          stream = this;
        }
      };
      InflateStream = class extends TransformStream {
        constructor(options, { chunkSize, DecompressionStreamFallback, DecompressionStream: DecompressionStream2 }) {
          super({});
          const { zipCrypto, encrypted, checkCrc32, crc32, compressed, useCompressionStream, deflate64, format, compressionMethod, rawBitFlag, outputSize } = options;
          let crc32Stream, decryptionStream, gzipCrc32;
          let readable = super.readable;
          if (encrypted) {
            if (zipCrypto) {
              readable = pipeThrough(readable, new ZipCryptoDecryptionStream(options));
            } else {
              decryptionStream = new AESDecryptionStream(options);
              readable = pipeThrough(readable, decryptionStream);
            }
          }
          if (compressed) {
            const sourceErrors = /* @__PURE__ */ new Set();
            const codecStreams2 = format && getCodecStreams(format);
            let gzipStream;
            if (codecStreams2) {
              readable = pipeThroughBackpressured(readable, createCodecStream(codecStreams2.DecompressionStream, format, { chunkSize, compressionMethod, rawBitFlag, uncompressedSize: outputSize }), sourceErrors);
            } else {
              const GzipDecompressionStream = getGzipCodecStream(useCompressionStream, DecompressionStream2, DecompressionStreamFallback);
              if (checkCrc32 && !deflate64 && crc32 !== UNDEFINED_VALUE && outputSize !== UNDEFINED_VALUE && GzipDecompressionStream) {
                try {
                  gzipStream = new GzipDecompressionStream(FORMAT_GZIP, { chunkSize });
                } catch {
                  gzipStream = UNDEFINED_VALUE;
                }
              }
              if (!gzipStream) {
                try {
                  readable = pipeThroughCompressionStream(readable, useCompressionStream, { chunkSize, deflate64 }, DecompressionStream2, DecompressionStreamFallback, sourceErrors);
                } catch (error) {
                  if (deflate64 || outputSize === UNDEFINED_VALUE || !useCompressionStream && DecompressionStreamFallback) {
                    throw mapMemoryError(error);
                  }
                  try {
                    gzipStream = new DecompressionStream2(FORMAT_GZIP);
                  } catch {
                    throw mapMemoryError(error);
                  }
                }
              }
            }
            if (gzipStream) {
              gzipCrc32 = true;
              readable = pipeThroughGzipDecompressionStream(readable, gzipStream, outputSize, crc32, sourceErrors);
            } else {
              readable = mapInflateStreamError(readable, sourceErrors);
            }
          }
          if (checkCrc32 && !gzipCrc32) {
            crc32Stream = new Crc32Stream();
            readable = pipeThrough(readable, crc32Stream);
          }
          setReadable(this, readable, () => {
            if (crc32Stream) {
              const computedCrc32 = new DataView(crc32Stream.value.buffer).getUint32(0, false);
              if (crc32 != computedCrc32) {
                throw new Error(ERR_INVALID_CRC32);
              }
            }
          });
        }
      };
      formatSupportByStream = /* @__PURE__ */ new Map();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/codec-stream.js
  var DEFAULT_CHUNK_SIZE2, MESSAGE_EVENT_TYPE, MESSAGE_START, MESSAGE_PULL, MESSAGE_DATA, MESSAGE_ACK_DATA, MESSAGE_CLOSE, CODEC_DEFLATE, CODEC_INFLATE, CodecStream, ChunkStream;
  var init_codec_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/codec-stream.js"() {
      init_constants();
      init_zip_entry_stream();
      DEFAULT_CHUNK_SIZE2 = 256 * 1024;
      MESSAGE_EVENT_TYPE = "message";
      MESSAGE_START = "start";
      MESSAGE_PULL = "pull";
      MESSAGE_DATA = "data";
      MESSAGE_ACK_DATA = "ack";
      MESSAGE_CLOSE = "close";
      CODEC_DEFLATE = "deflate";
      CODEC_INFLATE = "inflate";
      CodecStream = class extends TransformStream {
        constructor(options, config2) {
          super({});
          const codec = this;
          const { codecType } = options;
          let Stream2;
          if (codecType.startsWith(CODEC_DEFLATE)) {
            Stream2 = DeflateStream;
          } else if (codecType.startsWith(CODEC_INFLATE)) {
            Stream2 = InflateStream;
          }
          codec.outputSize = 0;
          let inputSize = 0;
          const stream = new Stream2(options, config2);
          const readable = super.readable;
          const inputSizeStream = new TransformStream({
            transform(chunk, controller) {
              if (chunk && chunk.length) {
                inputSize += chunk.length;
                controller.enqueue(chunk);
              }
            },
            flush() {
              Object.assign(codec, {
                inputSize
              });
            }
          });
          const outputSizeStream = new TransformStream({
            transform(chunk, controller) {
              if (chunk && chunk.length) {
                controller.enqueue(chunk);
                codec.outputSize += chunk.length;
                if (options.outputSize !== UNDEFINED_VALUE && codec.outputSize > options.outputSize) {
                  throw new Error(ERR_INVALID_UNCOMPRESSED_SIZE);
                }
              }
            },
            flush() {
              const { crc32 } = stream;
              Object.assign(codec, {
                crc32,
                inputSize
              });
            }
          });
          Object.defineProperty(codec, "readable", {
            get() {
              return readable.pipeThrough(inputSizeStream).pipeThrough(stream).pipeThrough(outputSizeStream);
            }
          });
        }
      };
      ChunkStream = class extends TransformStream {
        constructor(chunkSize) {
          const pendingChunks = [];
          let pendingLength = 0;
          let outputSize = 0;
          if (!Number.isFinite(chunkSize) || chunkSize < 1) {
            chunkSize = DEFAULT_CHUNK_SIZE2;
          }
          super({
            transform(chunk, controller) {
              pendingChunks.push(chunk);
              pendingLength += chunk.length;
              while (pendingLength > chunkSize) {
                outputSize += chunkSize;
                controller.enqueue(shiftChunk());
              }
            },
            flush(controller) {
              if (pendingLength) {
                outputSize += pendingLength;
                controller.enqueue(concatChunks(pendingChunks, pendingLength));
              }
            }
          });
          Object.defineProperty(this, "outputSize", {
            get: () => outputSize
          });
          function shiftChunk() {
            const result = new Uint8Array(chunkSize);
            let resultOffset = 0;
            while (resultOffset < chunkSize) {
              const firstChunk = pendingChunks[0];
              const remainingLength = chunkSize - resultOffset;
              if (firstChunk.length <= remainingLength) {
                result.set(firstChunk, resultOffset);
                resultOffset += firstChunk.length;
                pendingChunks.shift();
              } else {
                result.set(firstChunk.subarray(0, remainingLength), resultOffset);
                pendingChunks[0] = firstChunk.subarray(remainingLength);
                resultOffset += remainingLength;
              }
            }
            pendingLength -= chunkSize;
            return result;
          }
          function concatChunks(chunks, length) {
            const result = new Uint8Array(length);
            let offset = 0;
            for (const chunk of chunks) {
              result.set(chunk, offset);
              offset += chunk.length;
            }
            return result;
          }
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/codec-worker.js
  function setWebWorkerBackend(backend) {
    webWorkerBackend = backend;
  }
  async function supportsDeflate(config2) {
    const { CompressionStream: NativeStream, CompressionStreamFallback: FallbackStream } = config2;
    if (FallbackStream && !FallbackStream.requiresModule) {
      return true;
    }
    if (supportsDeflateRaw(NativeStream) || supportsGzip(NativeStream)) {
      return true;
    }
    if (FallbackStream) {
      return await loadModule(config2);
    }
    return false;
  }
  async function loadModule(config2) {
    if (initModule) {
      try {
        await initModule(config2);
        return true;
      } catch {
      }
    }
    return false;
  }
  function disableWebWorker(workerData) {
    if (workerData.createWorker) {
      createWorkerFailed = true;
    } else {
      webWorkerSupported = false;
    }
  }
  async function callHandler(handler, ...parameters) {
    try {
      await handler(...parameters);
    } catch {
    }
  }
  function createWorkerInterface(workerData, config2) {
    return {
      run: () => runWorker(workerData, config2)
    };
  }
  async function runWorker({ options, readable, writable, onTaskFinished, workerOptions }, config2) {
    let codecStream, chunkStream, modulePromise;
    try {
      if (options.compressed && !options.format) {
        const deflate = options.codecType.startsWith(CODEC_DEFLATE);
        const FallbackStream = deflate ? config2.CompressionStreamFallback : config2.DecompressionStreamFallback;
        const NativeStream = deflate ? config2.CompressionStream : config2.DecompressionStream;
        if (!options.useCompressionStream) {
          if (!await moduleLoaded() && (!FallbackStream || FallbackStream.requiresModule)) {
            options.useCompressionStream = true;
          }
        } else if (FallbackStream && FallbackStream.requiresModule && !supportsDeflateRaw(NativeStream)) {
          await moduleLoaded();
        }
      }
      if (options.encrypted && !options.zipCrypto) {
        await moduleLoaded();
      }
      codecStream = new CodecStream(options, config2);
      chunkStream = new ChunkStream(getChunkSize(config2));
      const { signal } = workerOptions.streamOptions;
      await readable.pipeThrough(codecStream).pipeThrough(chunkStream).pipeTo(writable, { preventClose: true, preventAbort: true, signal });
      const {
        crc32,
        inputSize,
        outputSize
      } = codecStream;
      return {
        crc32,
        inputSize,
        outputSize
      };
    } catch (error) {
      if (codecStream) {
        const outputSize = chunkStream ? chunkStream.outputSize : 0;
        workerOptions.outputSize = outputSize;
        if (isErrorObject(error)) {
          try {
            error.outputSize = outputSize;
          } catch {
          }
        }
      }
      throw error;
    } finally {
      onTaskFinished();
    }
    function moduleLoaded() {
      if (!modulePromise) {
        modulePromise = loadModule(config2);
      }
      return modulePromise;
    }
  }
  var ERR_WORKER_STARTUP_TIMEOUT, webWorkerSupported, createWorkerFailed, webWorkerBackend, initModule, CodecWorker, ProgressWatcherStream;
  var init_codec_worker = __esm({
    "node_modules/@zip.js/zip.js/lib/core/codec-worker.js"() {
      init_constants();
      init_configuration();
      init_error();
      init_codec_stream();
      ERR_WORKER_STARTUP_TIMEOUT = "Worker startup timeout";
      initModule = () => {
      };
      CodecWorker = class {
        constructor(workerData, { readable, writable }, workerOptions, onTaskFinished) {
          const { options, config: config2, streamOptions, useWebWorkers, workerURI } = workerOptions;
          let { createWorker } = workerOptions;
          const { signal } = streamOptions;
          if (createWorkerFailed) {
            createWorker = UNDEFINED_VALUE;
          }
          Object.assign(workerData, {
            busy: true,
            generation: (workerData.generation || 0) + 1,
            readable: readable.pipeThrough(new ChunkStream(getChunkSize(config2))).pipeThrough(new ProgressWatcherStream(streamOptions), { signal }),
            writable,
            options: Object.assign({}, options),
            workerOptions,
            workerURI,
            createWorker,
            terminate() {
              return new Promise((resolve) => {
                const { worker, busy } = workerData;
                if (busy) {
                  workerData.terminateResolvers = workerData.terminateResolvers || [];
                  workerData.terminateResolvers.push(resolve);
                } else {
                  if (worker) {
                    worker.terminate();
                    workerData.worker = null;
                  }
                  resolve();
                }
                workerData.interface = null;
              });
            },
            onTaskFinished() {
              if (workerData.busy) {
                const { terminateResolvers, worker } = workerData;
                if (terminateResolvers) {
                  workerData.terminateResolvers = null;
                  if (worker) {
                    workerData.terminated = true;
                    worker.terminate();
                  }
                }
                workerData.busy = false;
                const pendingTasks = onTaskFinished(workerData);
                if (terminateResolvers) {
                  terminateResolvers.forEach((resolve) => resolve(pendingTasks));
                }
              }
            }
          });
          if (webWorkerSupported === UNDEFINED_VALUE) {
            webWorkerSupported = typeof Worker != UNDEFINED_TYPE;
          }
          return (useWebWorkers && webWorkerBackend && (webWorkerSupported && workerURI || createWorker) ? webWorkerBackend : createWorkerInterface)(workerData, config2);
        }
      };
      ProgressWatcherStream = class extends TransformStream {
        constructor({ onstart, onprogress, size, onend }) {
          let chunkOffset = 0;
          super({
            async start() {
              if (onstart) {
                await callHandler(onstart, size);
              }
            },
            async transform(chunk, controller) {
              chunkOffset += chunk.length;
              if (onprogress) {
                await callHandler(onprogress, chunkOffset, size);
              }
              controller.enqueue(chunk);
            },
            async flush() {
              if (onend) {
                await callHandler(onend, chunkOffset);
              }
            }
          });
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/codec-worker-web.js
  function createWebWorkerInterface(workerData, config2) {
    const { baseURI, chunkSize, workerStartupTimeout } = config2;
    let { wasmURI } = config2;
    if (!workerData.interface) {
      if (typeof wasmURI == FUNCTION_TYPE) {
        wasmURI = wasmURI();
      }
      let worker;
      try {
        worker = getWebWorker(workerData.workerURI, baseURI, workerData);
      } catch {
        disableWebWorker(workerData);
        return createWorkerInterface(workerData, config2);
      }
      Object.assign(workerData, {
        worker,
        workerAlive: false,
        terminated: false,
        startupError: null,
        interface: {
          run: async () => {
            try {
              return await runWebWorker(workerData, { chunkSize, wasmURI, baseURI, workerStartupTimeout });
            } catch (error) {
              if (error && error.workerStartupFailed) {
                disableWebWorker(workerData);
                releaseWorkerStreams(workerData);
                return runWorker(workerData, config2);
              }
              if (error && error.codecImportFailed) {
                if (workerData.reader) {
                  releaseWorkerStreams(workerData);
                  return runWorker(workerData, config2);
                }
                workerData.onTaskFinished();
              }
              throw error;
            }
          }
        }
      });
    }
    return workerData.interface;
  }
  async function runWebWorker(workerData, config2) {
    if (!workerData.worker) {
      const { startupError } = workerData;
      workerData.startupError = null;
      const error = startupError || new Error(ERR_WORKER_STARTUP_TIMEOUT);
      error.workerStartupFailed = true;
      throw error;
    }
    let resolveResult, rejectResult;
    const result = new Promise((resolve, reject) => {
      resolveResult = resolve;
      rejectResult = (error) => {
        const { outputSize, workerOptions } = workerData;
        workerOptions.outputSize = outputSize;
        if (isErrorObject(error)) {
          try {
            error.outputSize = outputSize;
          } catch {
          }
        }
        reject(error);
      };
    });
    Object.assign(workerData, {
      reader: null,
      writer: null,
      outputSize: 0,
      destinationFailed: false,
      destinationError: null,
      resolveResult,
      rejectResult,
      result
    });
    const { readable, options } = workerData;
    const { writable, closed, abortPipe } = watchClosedStream(workerData.writable, workerData);
    try {
      sendMessage({
        type: MESSAGE_START,
        options,
        config: config2
      }, workerData);
    } catch (error) {
      abortPipe();
      try {
        await closed;
      } catch {
      }
      workerData.onTaskFinished();
      throw error;
    }
    Object.assign(workerData, {
      reader: readable.getReader(),
      writer: writable.getWriter()
    });
    const { workerStartupTimeout } = config2;
    if (!workerData.workerAlive && Number.isFinite(workerStartupTimeout) && workerStartupTimeout >= 0) {
      workerData.startupTimeout = setTimeout(() => onStartupTimeout(workerData), workerStartupTimeout);
    }
    try {
      const resultValue = await result;
      await closeWritable();
      await closed;
      return resultValue;
    } catch (error) {
      await closeWritable();
      abortPipe();
      try {
        await closed;
      } catch {
      }
      const { outputSize, workerOptions, destinationFailed, destinationError } = workerData;
      workerOptions.outputSize = outputSize;
      const workerFailed = isErrorObject(error) && (error.codecImportFailed || error.workerStartupFailed);
      const reportedError = destinationFailed && !workerFailed ? destinationError : error;
      if (isErrorObject(reportedError)) {
        try {
          reportedError.outputSize = outputSize;
        } catch {
        }
      }
      throw reportedError;
    }
    async function closeWritable() {
      if (!writable.locked) {
        try {
          await writable.getWriter().close();
        } catch {
        }
      }
    }
  }
  function watchClosedStream(writableSource, workerData) {
    const abortController = new AbortController();
    let aborting;
    const { writable, readable } = new TransformStream({
      transform(chunk, controller) {
        workerData.outputSize += chunk.length;
        controller.enqueue(chunk);
      }
    });
    const closed = readable.pipeTo(writableSource, { preventClose: true, preventAbort: true, signal: abortController.signal });
    closed.catch((error) => {
      if (!aborting) {
        Object.assign(workerData, { destinationFailed: true, destinationError: error });
      }
    });
    const { signal } = workerData.workerOptions.streamOptions;
    if (signal) {
      const onAbort = () => abortController.abort(signal.reason);
      const removeAbortListener = () => signal.removeEventListener(ABORT_EVENT_TYPE, onAbort);
      signal.addEventListener(ABORT_EVENT_TYPE, onAbort);
      closed.then(removeAbortListener, removeAbortListener);
    }
    return {
      writable,
      closed,
      abortPipe: () => {
        aborting = true;
        abortController.abort();
      }
    };
  }
  function releaseWorkerStreams(workerData) {
    const { reader } = workerData;
    if (reader) {
      reader.releaseLock();
    }
    workerData.reader = null;
    workerData.writer = null;
  }
  function terminateWorker(workerData) {
    const { worker } = workerData;
    if (worker) {
      try {
        worker.terminate();
      } catch {
      }
    }
    workerData.interface = null;
  }
  function getWebWorker(url, baseURI, workerData, isModuleType, useBlobURI = true) {
    const { createWorker } = workerData;
    let worker, resolvedURI, resolvedOptions;
    if (createWorker) {
      worker = createWorker();
    } else if (webWorkerURI === UNDEFINED_VALUE || webWorkerSource !== url) {
      const isFunctionURI = typeof url == FUNCTION_TYPE;
      if (isFunctionURI) {
        resolvedURI = url(useBlobURI);
      } else {
        resolvedURI = url;
      }
      const isDataURI = resolvedURI.startsWith("data:");
      const isBlobURI = resolvedURI.startsWith("blob:");
      if (isDataURI || isBlobURI) {
        if (isModuleType === UNDEFINED_VALUE) {
          isModuleType = false;
        }
        if (isModuleType) {
          resolvedOptions = MODULE_WORKER_OPTIONS;
        }
        try {
          worker = new Worker(resolvedURI, resolvedOptions);
        } catch (error) {
          if (isBlobURI) {
            try {
              URL.revokeObjectURL(resolvedURI);
            } catch {
            }
          }
          if (isFunctionURI && isBlobURI) {
            return getWebWorker(url, baseURI, workerData, isModuleType, false);
          } else if (!isModuleType) {
            return getWebWorker(url, baseURI, workerData, true, false);
          } else {
            throw error;
          }
        }
      } else {
        if (isModuleType === UNDEFINED_VALUE) {
          isModuleType = true;
        }
        if (isModuleType) {
          resolvedOptions = MODULE_WORKER_OPTIONS;
        }
        try {
          resolvedURI = new URL(resolvedURI, baseURI);
        } catch {
        }
        try {
          worker = new Worker(resolvedURI, resolvedOptions);
        } catch (error) {
          if (isModuleType) {
            return getWebWorker(url, baseURI, workerData, false, useBlobURI);
          } else {
            throw error;
          }
        }
      }
      webWorkerSource = url;
      webWorkerURI = resolvedURI;
      webWorkerOptions = resolvedOptions;
    } else {
      worker = new Worker(webWorkerURI, webWorkerOptions);
    }
    worker.addEventListener(MESSAGE_EVENT_TYPE, (event) => {
      workerData.workerAlive = true;
      clearStartupTimeout(workerData);
      onMessage(event, workerData);
    });
    worker.addEventListener(ERROR_EVENT_TYPE, (event) => onWorkerError(event, workerData));
    worker.addEventListener(MESSAGE_ERROR_EVENT_TYPE, (event) => onWorkerError(event, workerData));
    return worker;
  }
  function onStartupTimeout(workerData) {
    workerData.startupTimeout = null;
    if (workerData.workerAlive) {
      return;
    }
    const { rejectResult, writer } = workerData;
    terminateWorker(workerData);
    workerData.worker = null;
    if (rejectResult) {
      const error = new Error(ERR_WORKER_STARTUP_TIMEOUT);
      error.workerStartupFailed = true;
      rejectResult(error);
      if (writer) {
        writer.releaseLock();
      }
    }
  }
  function clearStartupTimeout(workerData) {
    const { startupTimeout } = workerData;
    if (startupTimeout) {
      clearTimeout(startupTimeout);
      workerData.startupTimeout = null;
    }
  }
  function onWorkerError(event, workerData) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    clearStartupTimeout(workerData);
    const { workerAlive, rejectResult, writer, onTaskFinished } = workerData;
    terminateWorker(workerData);
    if (!workerAlive) {
      workerData.worker = null;
    }
    let error = event.error || new Error(event.message || ERROR_EVENT_TYPE);
    if (!workerAlive) {
      error = Object.assign(new Error(error.message || ERROR_EVENT_TYPE), { workerStartupFailed: true });
      workerData.startupError = error;
    }
    if (rejectResult) {
      rejectResult(error);
      if (writer) {
        writer.releaseLock();
      }
      if (workerAlive) {
        onTaskFinished();
      }
    }
  }
  function sendMessage(message, { worker, writer }) {
    try {
      const { value } = message;
      if (value) {
        message.value = toExactUint8Array(value);
        try {
          worker.postMessage(message, [message.value.buffer]);
        } catch {
          worker.postMessage(message);
        }
      } else {
        worker.postMessage(message);
      }
    } catch (error) {
      if (writer) {
        writer.releaseLock();
      }
      throw error;
    }
  }
  async function onMessage({ data }, workerData) {
    const { type, value, messageId, result, error, errorValue } = data;
    const { reader, writer, resolveResult, rejectResult, onTaskFinished, generation } = workerData;
    const stale = () => workerData.generation != generation;
    try {
      if (error) {
        fail(getResponseError(error, errorValue));
      } else {
        if (type == MESSAGE_PULL) {
          const { value: value2, done } = await reader.read();
          if (!stale()) {
            sendMessage({ type: MESSAGE_DATA, value: value2, done, messageId }, workerData);
          }
        }
        if (type == MESSAGE_DATA) {
          const chunk = new Uint8Array(value);
          await writer.ready;
          await writer.write(chunk);
          if (!stale()) {
            sendMessage({ type: MESSAGE_ACK_DATA, messageId }, workerData);
          }
        }
        if (type == MESSAGE_CLOSE) {
          succeed(result);
        }
      }
    } catch (error2) {
      if (!stale()) {
        terminateWorker(workerData);
        fail(error2);
      }
    }
    function fail(error2) {
      if (!stale()) {
        rejectResult(error2);
        releaseWriter();
        if (!(isErrorObject(error2) && error2.codecImportFailed)) {
          onTaskFinished();
        }
      }
    }
    function succeed(result2) {
      if (!stale()) {
        resolveResult(result2);
        releaseWriter();
        onTaskFinished();
      }
    }
    function releaseWriter() {
      if (writer) {
        writer.releaseLock();
      }
    }
  }
  function getResponseError(errorData, errorValue) {
    const { message, stack, code, name, outputSize, cause, codecImportFailed } = errorData;
    let responseError;
    if (errorValue) {
      responseError = errorValue.value;
    } else {
      responseError = Object.assign(new Error(message), { stack, code, name });
    }
    if (isErrorObject(responseError)) {
      try {
        if (outputSize !== UNDEFINED_VALUE) {
          responseError.outputSize = outputSize;
        }
        if (codecImportFailed) {
          responseError.codecImportFailed = true;
        }
        if (cause) {
          if (!isErrorObject(responseError.cause)) {
            responseError.cause = Object.assign(new Error(cause.message), { name: cause.name });
          }
          if (cause.code !== UNDEFINED_VALUE && responseError.cause.code !== cause.code) {
            responseError.cause.code = cause.code;
          }
        }
        if (errorValue) {
          if (responseError.name !== name) {
            responseError.name = name;
          }
          if (responseError.code !== code) {
            responseError.code = code;
          }
        }
      } catch {
      }
    }
    return responseError;
  }
  var MODULE_WORKER_OPTIONS, ERROR_EVENT_TYPE, MESSAGE_ERROR_EVENT_TYPE, ABORT_EVENT_TYPE, webWorkerSource, webWorkerURI, webWorkerOptions;
  var init_codec_worker_web = __esm({
    "node_modules/@zip.js/zip.js/lib/core/codec-worker-web.js"() {
      init_constants();
      init_array();
      init_error();
      init_codec_stream();
      init_codec_worker();
      MODULE_WORKER_OPTIONS = { type: "module" };
      ERROR_EVENT_TYPE = "error";
      MESSAGE_ERROR_EVENT_TYPE = "messageerror";
      ABORT_EVENT_TYPE = "abort";
      setWebWorkerBackend(createWebWorkerInterface);
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/codec-pool.js
  async function runWorker2(stream, workerOptions) {
    const { options, config: config2 } = workerOptions;
    const { useWebWorkers, useCompressionStream, compressed, checkCrc32, computeCrc32, encrypted, format, codecURI } = options;
    const { workerURI, createWorker, maxWorkers: maxWorkers2 } = config2;
    if (format) {
      if (codecURI) {
        options.codecURI = resolveCodecURI(codecURI, config2.baseURI);
      }
      await ensureCodecStreams(format, options.codecURI);
    }
    const streamCopy = !compressed && !checkCrc32 && !computeCrc32 && !encrypted;
    const workerSupported = format === UNDEFINED_VALUE || Boolean(options.codecURI);
    workerOptions.useWebWorkers = !streamCopy && workerSupported && (useWebWorkers || useWebWorkers === UNDEFINED_VALUE && config2.useWebWorkers);
    workerOptions.workerURI = workerOptions.useWebWorkers && workerURI ? workerURI : UNDEFINED_VALUE;
    workerOptions.createWorker = workerOptions.useWebWorkers && createWorker ? createWorker : UNDEFINED_VALUE;
    options.useCompressionStream = useCompressionStream || useCompressionStream === UNDEFINED_VALUE && config2.useCompressionStream;
    return (await getWorker()).run();
    async function getWorker() {
      const workerData = pool.find((workerData2) => !workerData2.busy);
      if (workerData) {
        clearTerminateTimeout(workerData);
        return new CodecWorker(workerData, stream, workerOptions, onTaskFinished);
      } else if (pool.length < maxWorkers2) {
        const workerData2 = { indexWorker };
        indexWorker++;
        pool.push(workerData2);
        return new CodecWorker(workerData2, stream, workerOptions, onTaskFinished);
      } else {
        return new Promise((resolve) => {
          pendingRequests.push({ resolve, stream, workerOptions });
          starvationDelay = config2.workerStarvationTimeout;
          armStarvationTimeout();
        });
      }
    }
    function onTaskFinished(workerData) {
      clearStarvationTimeout();
      if (workerData.terminated) {
        workerData.terminated = false;
        return runPendingRequestsInline();
      } else if (pendingRequests.length) {
        const [{ resolve, stream: stream2, workerOptions: workerOptions2 }] = pendingRequests.splice(0, 1);
        resolve(new CodecWorker(workerData, stream2, workerOptions2, onTaskFinished));
        armStarvationTimeout();
      } else if (workerData.worker) {
        clearTerminateTimeout(workerData);
        terminateWorker2(workerData, workerOptions);
      } else {
        pool = pool.filter((data) => data != workerData);
      }
    }
  }
  function resolveCodecURI(codecURI, baseURI) {
    try {
      return new URL(codecURI, baseURI).toString();
    } catch {
      return codecURI;
    }
  }
  function armStarvationTimeout() {
    if (!starvationTimeout && pendingRequests.length && Number.isFinite(starvationDelay) && starvationDelay >= 0) {
      starvationTimeout = setTimeout(onWorkerStarvation, starvationDelay);
    }
  }
  function clearStarvationTimeout() {
    if (starvationTimeout) {
      clearTimeout(starvationTimeout);
      starvationTimeout = null;
    }
  }
  function onWorkerStarvation() {
    starvationTimeout = null;
    if (pendingRequests.length) {
      const [{ resolve, stream, workerOptions }] = pendingRequests.splice(0, 1);
      resolve(new CodecWorker({}, stream, getInlineWorkerOptions(workerOptions), onInlineTaskFinished));
      armStarvationTimeout();
    }
  }
  function runPendingRequestsInline() {
    const tasks = pendingRequests.splice(0).map(({ resolve, stream, workerOptions }) => new Promise((resolveTask) => {
      resolve(new CodecWorker({}, stream, getInlineWorkerOptions(workerOptions), () => {
        onInlineTaskFinished();
        resolveTask();
      }));
    }));
    clearStarvationTimeout();
    return Promise.all(tasks);
  }
  function getInlineWorkerOptions(workerOptions) {
    return Object.assign({}, workerOptions, { useWebWorkers: false, workerURI: UNDEFINED_VALUE, createWorker: UNDEFINED_VALUE });
  }
  function onInlineTaskFinished() {
    clearStarvationTimeout();
    armStarvationTimeout();
  }
  function terminateWorker2(workerData, workerOptions) {
    const { config: config2 } = workerOptions;
    const { terminateWorkerTimeout } = config2;
    if (Number.isFinite(terminateWorkerTimeout) && terminateWorkerTimeout >= 0) {
      workerData.terminateTimeout = setTimeout(async () => {
        pool = pool.filter((data) => data != workerData);
        try {
          await workerData.terminate();
        } catch {
        }
      }, terminateWorkerTimeout);
    }
  }
  function clearTerminateTimeout(workerData) {
    const { terminateTimeout } = workerData;
    if (terminateTimeout) {
      clearTimeout(terminateTimeout);
      workerData.terminateTimeout = null;
    }
  }
  var pool, pendingRequests, starvationTimeout, starvationDelay, indexWorker;
  var init_codec_pool = __esm({
    "node_modules/@zip.js/zip.js/lib/core/codec-pool.js"() {
      init_constants();
      init_codec_stream();
      init_codec_registry();
      init_codec_worker();
      pool = [];
      pendingRequests = [];
      indexWorker = 0;
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/decode-cp437.js
  function decodeCP437(stringValue) {
    let result = "";
    for (let indexCharacter = 0; indexCharacter < stringValue.length; indexCharacter++) {
      result += CP437[stringValue[indexCharacter]];
    }
    return result;
  }
  var CP437;
  var init_decode_cp437 = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/decode-cp437.js"() {
      CP437 = "\0\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\xA0".split("");
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/decode-text.js
  function decodeText(value, encoding) {
    return decode(value, encoding, true);
  }
  function isUTF8Text(value) {
    if (value.some((byte) => byte > 127)) {
      try {
        new TextDecoder("utf-8", { fatal: true }).decode(value);
        return true;
      } catch {
        return false;
      }
    } else {
      return false;
    }
  }
  function decodeTextRemovingBOM(value, encoding) {
    return decode(value, encoding, false);
  }
  function decode(value, encoding, ignoreBOM) {
    if (encoding && encoding.trim().toLowerCase() == "cp437") {
      return decodeCP437(value);
    } else {
      return new TextDecoder(encoding, { ignoreBOM }).decode(value);
    }
  }
  var init_decode_text = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/decode-text.js"() {
      init_decode_cp437();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/io.js
  function probeBlobSliceReliability() {
    blobSliceProbe = (async () => {
      try {
        const slicedBlob = new Blob([new Uint8Array(3)]).slice(1, 2);
        const streamReader = slicedBlob.stream().getReader();
        let streamedLength = 0;
        let result = await streamReader.read();
        while (!result.done) {
          streamedLength += result.value.length;
          result = await streamReader.read();
        }
        blobSliceReliable = streamedLength == 1;
      } catch {
        blobSliceReliable = false;
      }
    })();
  }
  function ownsWritable(writer) {
    return Boolean(writer && writer.getData);
  }
  async function initStream(stream, initSize) {
    if (stream.init && !stream.initialized) {
      await stream.init(initSize);
    } else {
      return Promise.resolve();
    }
  }
  async function initDiskReader(diskReader) {
    diskReader = new GenericReader(diskReader);
    await initStream(diskReader);
    if (diskReader.size === UNDEFINED_VALUE || !diskReader.readUint8Array) {
      diskReader = new BlobReader(await streamToBlob(diskReader.readable));
      await initStream(diskReader);
    }
    return diskReader;
  }
  function readUint8Array(reader, offset, size) {
    return reader.readUint8Array(offset, size);
  }
  function createReadable(reader, options) {
    if (reader.createReadable) {
      return reader.createReadable(options);
    } else if (reader.readUint8Array) {
      return Reader.prototype.createReadable.call(reader, options);
    } else {
      return reader.readable;
    }
  }
  var ERR_ITERATOR_COMPLETED_TOO_SOON, ERR_WRITER_SIZE_NOT_WRITABLE, CONTENT_TYPE_TEXT_PLAIN, DEFAULT_BUFFER_SIZE, DEFAULT_MAXIMUM_RANGE_SIZE, END_OF_CENTRAL_DIR_SEARCH_LENGTH, PROPERTY_NAME_WRITABLE, DISK_BOUNDARY, Stream, Reader, blobSliceReliable, blobSliceProbe, BlobReader, BlobWriter, TextReader, TextWriter, SplitDataReader, SplitDataWriter, GenericReader, GenericWriter;
  var init_io = __esm({
    "node_modules/@zip.js/zip.js/lib/core/io.js"() {
      init_constants();
      init_configuration();
      init_array();
      init_compatible_streams();
      init_decode_text();
      ERR_ITERATOR_COMPLETED_TOO_SOON = "Writer iterator completed too soon";
      ERR_WRITER_SIZE_NOT_WRITABLE = "Invalid writer (size must be writable)";
      CONTENT_TYPE_TEXT_PLAIN = "text/plain";
      DEFAULT_BUFFER_SIZE = 256 * 1024;
      DEFAULT_MAXIMUM_RANGE_SIZE = 16 * 1024 * 1024;
      END_OF_CENTRAL_DIR_SEARCH_LENGTH = END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS;
      PROPERTY_NAME_WRITABLE = "writable";
      DISK_BOUNDARY = /* @__PURE__ */ Symbol();
      Stream = class {
        constructor() {
          this.size = 0;
        }
        init() {
          this.initialized = true;
        }
      };
      Reader = class extends Stream {
        get readable() {
          return this.createReadable();
        }
        createReadable({ offset = 0, size, chunkSize = getChunkSize(getConfiguration()) } = {}) {
          const reader = this;
          let chunkOffset = 0;
          chunkSize = normalizeChunkSize(chunkSize);
          return new ReadableStream({
            async pull(controller) {
              const dataSize = size === UNDEFINED_VALUE ? chunkSize : Math.min(chunkSize, size - chunkOffset);
              const data = await readUint8Array(reader, offset + chunkOffset, dataSize);
              if (data.length) {
                controller.enqueue(data);
                chunkOffset += data.length;
              }
              if (size !== UNDEFINED_VALUE && chunkOffset >= size || !data.length && dataSize) {
                controller.close();
              }
            }
          });
        }
      };
      BlobReader = class extends Reader {
        constructor(blob) {
          super();
          Object.assign(this, {
            sourceBlob: blob,
            size: blob.size
          });
          if (!blobSliceProbe) {
            probeBlobSliceReliability();
          }
        }
        createReadable(options) {
          const reader = this;
          const { sourceBlob, size } = reader;
          const { offset = 0, size: readSize = size - offset } = options || {};
          if (typeof sourceBlob.stream == FUNCTION_TYPE) {
            if (!offset && readSize >= size) {
              return toCompatibleReadable(sourceBlob.stream());
            }
            if (blobSliceReliable) {
              return toCompatibleReadable(sourceBlob.slice(offset, offset + readSize).stream());
            }
          }
          return super.createReadable(options);
        }
        async readUint8Array(offset, length) {
          const reader = this;
          const offsetEnd = offset + length;
          const readsWholeBlob = !offset && offsetEnd >= reader.size;
          const blob = readsWholeBlob ? reader.sourceBlob : reader.sourceBlob.slice(offset, offsetEnd);
          let arrayBuffer = await blob.arrayBuffer();
          const sliceIgnoredByBuggyImplementation = arrayBuffer.byteLength > length;
          if (sliceIgnoredByBuggyImplementation) {
            arrayBuffer = arrayBuffer.slice(offset, offsetEnd);
          }
          return new Uint8Array(arrayBuffer);
        }
      };
      BlobWriter = class extends Stream {
        constructor(contentType) {
          super();
          const writer = this;
          const transformStream = new TransformStream();
          Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
            get() {
              return transformStream.writable;
            }
          });
          writer.contentType = contentType;
          writer.blobPromise = streamToBlob(transformStream.readable, contentType);
          writer.blobPromise.catch(() => {
          });
        }
        getData() {
          return this.blobPromise;
        }
      };
      TextReader = class extends BlobReader {
        constructor(text) {
          super(new Blob([text], { type: CONTENT_TYPE_TEXT_PLAIN }));
        }
      };
      TextWriter = class extends BlobWriter {
        constructor(encoding) {
          super();
          Object.assign(this, {
            encoding,
            utf8: !encoding || encoding.toLowerCase() == "utf-8"
          });
        }
        async getData() {
          const {
            encoding,
            utf8
          } = this;
          const blob = await super.getData();
          if (blob.text && utf8) {
            return blob.text();
          } else {
            return decodeTextRemovingBOM(new Uint8Array(await blob.arrayBuffer()), encoding);
          }
        }
      };
      SplitDataReader = class extends Reader {
        constructor(readers) {
          super();
          this.readers = readers;
        }
        async init() {
          const reader = this;
          reader.lastDiskNumber = 0;
          const readers = reader.readers = await Promise.all(reader.readers.map(initDiskReader));
          reader.diskOffsets = readers.map((diskReader) => {
            const diskOffset = reader.size;
            reader.size += diskReader.size;
            return diskOffset;
          });
          super.init();
        }
        getDiskOffset(diskNumber) {
          const { diskOffsets, size } = this;
          const diskOffset = diskOffsets[diskNumber];
          return diskOffset === UNDEFINED_VALUE ? size : diskOffset;
        }
        async readUint8Array(offset, length) {
          const reader = this;
          const { readers } = this;
          let result;
          let currentDiskNumber = 0;
          let currentReaderOffset = offset;
          while (readers[currentDiskNumber] && currentReaderOffset >= readers[currentDiskNumber].size) {
            currentReaderOffset -= readers[currentDiskNumber].size;
            currentDiskNumber++;
          }
          const currentReader = readers[currentDiskNumber];
          if (currentReader) {
            const currentReaderSize = currentReader.size;
            if (currentReaderOffset + length <= currentReaderSize) {
              result = await readUint8Array(currentReader, currentReaderOffset, length);
            } else {
              const chunkLength = currentReaderSize - currentReaderOffset;
              const firstPart = await readUint8Array(currentReader, currentReaderOffset, chunkLength);
              const secondPart = await reader.readUint8Array(offset + chunkLength, length - chunkLength);
              result = concat(firstPart, secondPart);
            }
          } else {
            result = EMPTY_UINT8_ARRAY;
          }
          reader.lastDiskNumber = Math.max(currentDiskNumber, reader.lastDiskNumber);
          return result;
        }
      };
      SplitDataWriter = class extends Stream {
        constructor(writerGenerator, maxSize = 4294967295) {
          super();
          const writer = this;
          Object.assign(writer, {
            diskNumber: 0,
            diskOffset: 0,
            size: 0,
            maxSize,
            availableSize: maxSize
          });
          let diskSourceWriter, diskWritable, diskWriter;
          const writable = new WritableStream({
            async write(chunk) {
              if (chunk === DISK_BOUNDARY) {
                if (diskWriter) {
                  await endDisk();
                }
                return;
              }
              const { availableSize } = writer;
              if (!diskWriter) {
                const { value, done } = await writerGenerator.next();
                if (done && !value) {
                  throw new Error(ERR_ITERATOR_COMPLETED_TOO_SOON);
                } else {
                  diskSourceWriter = value;
                  diskSourceWriter.size = 0;
                  if (diskSourceWriter.maxSize) {
                    writer.maxSize = diskSourceWriter.maxSize;
                  }
                  writer.availableSize = writer.maxSize;
                  await initStream(diskSourceWriter);
                  diskWritable = value.writable;
                  diskWriter = diskWritable.getWriter();
                }
                await this.write(chunk);
              } else if (chunk.length >= availableSize) {
                await writeChunk(chunk.subarray(0, availableSize));
                await endDisk();
                if (chunk.length > availableSize) {
                  await this.write(chunk.subarray(availableSize));
                }
              } else {
                await writeChunk(chunk);
              }
            },
            async close() {
              if (diskWriter) {
                await diskWriter.ready;
                await closeDiskWriter();
              }
            },
            async abort(reason) {
              if (diskWriter) {
                await diskWriter.abort(reason);
              }
            }
          });
          Object.defineProperty(writer, PROPERTY_NAME_WRITABLE, {
            get() {
              return writable;
            }
          });
          async function writeChunk(chunk) {
            const chunkLength = chunk.length;
            if (chunkLength) {
              await diskWriter.ready;
              await diskWriter.write(chunk);
              diskSourceWriter.size += chunkLength;
              writer.availableSize -= chunkLength;
            }
          }
          async function endDisk() {
            await closeDiskWriter();
            writer.diskOffset += diskSourceWriter.size;
            writer.diskNumber++;
            diskWriter = null;
            writer.availableSize = writer.maxSize;
          }
          async function closeDiskWriter() {
            await diskWriter.close();
          }
        }
        async closeDisk() {
          const streamWriter = this.writable.getWriter();
          try {
            await streamWriter.ready;
            await streamWriter.write(DISK_BOUNDARY);
          } finally {
            streamWriter.releaseLock();
          }
        }
      };
      GenericReader = class {
        constructor(reader) {
          if (Array.isArray(reader)) {
            reader = new SplitDataReader(reader);
          }
          if (reader instanceof ReadableStream || typeof reader.getReader == FUNCTION_TYPE) {
            reader = {
              readable: toCompatibleReadable(reader)
            };
          }
          return reader;
        }
      };
      GenericWriter = class {
        constructor(writer) {
          if (writer.writable === UNDEFINED_VALUE && typeof writer.next == FUNCTION_TYPE) {
            writer = new SplitDataWriter(writer);
          }
          if (writer instanceof WritableStream || typeof writer.getWriter == FUNCTION_TYPE) {
            writer = {
              writable: toCompatibleWritable(writer)
            };
          }
          try {
            writer.size = writer.size === UNDEFINED_VALUE ? 0 : writer.size;
          } catch {
            throw new Error(ERR_WRITER_SIZE_NOT_WRITABLE);
          }
          return writer;
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/warnings.js
  function addWarning(warnings, reason, filename) {
    if (!warnings.some((warning) => warning.reason == reason)) {
      const warning = { reason };
      if (filename !== UNDEFINED_VALUE) {
        warning.filename = filename;
      }
      warnings.push(warning);
    }
  }
  var init_warnings = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/warnings.js"() {
      init_constants();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/zip-entry.js
  function getUserExtraField(extraField) {
    if (extraField) {
      const userExtraField = /* @__PURE__ */ new Map();
      extraField.forEach((field, type) => {
        if (!INTERPRETED_EXTRA_FIELD_TYPES.has(type)) {
          userExtraField.set(type, field.data);
        }
      });
      if (userExtraField.size) {
        return userExtraField;
      }
    }
  }
  function getEncryptionOverhead(encrypted, zipCrypto, encryptionStrength) {
    return encrypted ? zipCrypto ? 12 : 16 + encryptionStrength * 4 : 0;
  }
  var PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT, PROPERTY_NAME_UNCOMPRESSED_SIZE, PROPERTY_NAME_COMPRESSED_SIZE, PROPERTY_NAME_OFFSET, PROPERTY_NAME_DISK_NUMBER_START, PROPERTY_NAME_LAST_MODIFICATION_DATE, PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE, PROPERTY_NAME_LAST_ACCESS_DATE, PROPERTY_NAME_RAW_LAST_ACCESS_DATE, PROPERTY_NAME_CREATION_DATE, PROPERTY_NAME_RAW_CREATION_DATE, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES, PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW, PROPERTY_NAME_MSDOS_ATTRIBUTES, PROPERTY_NAME_MS_DOS_COMPATIBLE, PROPERTY_NAME_ZIP64, PROPERTY_NAME_ENCRYPTED, PROPERTY_NAME_VERSION, PROPERTY_NAME_VERSION_MADE_BY, PROPERTY_NAME_ZIPCRYPTO, PROPERTY_NAME_DIRECTORY, PROPERTY_NAME_EXECUTABLE, PROPERTY_NAME_SYMLINK, PROPERTY_NAME_COMPRESSION_METHOD, PROPERTY_NAME_SIGNATURE, PROPERTY_NAME_CRC32, PROPERTY_NAME_EXTRA_FIELD, PROPERTY_NAME_EXTRA_FIELD_INFOZIP, PROPERTY_NAME_EXTRA_FIELD_UNIX, PROPERTY_NAME_EXTRA_FIELD_UNIX_TYPE1, PROPERTY_NAME_EXTRA_FIELD_PKWARE_UNIX, PROPERTY_NAME_UID, PROPERTY_NAME_GID, PROPERTY_NAME_UNIX_MODE, PROPERTY_NAME_SETUID, PROPERTY_NAME_SETGID, PROPERTY_NAME_STICKY, PROPERTY_NAME_BITFLAG, PROPERTY_NAME_RAW_BITFLAG, PROPERTY_NAME_FILENAME_LENGTH, PROPERTY_NAME_EXTRA_FIELD_LENGTH, PROPERTY_NAME_UNIX_EXTERNAL_UPPER, PROPERTY_NAME_FILENAME_UTF8, PROPERTY_NAME_COMMENT_UTF8, PROPERTY_NAME_RAW_EXTRA_FIELD, PROPERTY_NAME_EXTRA_FIELD_ZIP64, PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH, PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT, PROPERTY_NAME_EXTRA_FIELD_AES, PROPERTY_NAME_EXTRA_FIELD_NTFS, PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP, PROPERTY_NAME_EXTRA_FIELD_USDZ, PROPERTY_NAMES, Entry, INTERPRETED_EXTRA_FIELD_TYPES;
  var init_zip_entry = __esm({
    "node_modules/@zip.js/zip.js/lib/core/zip-entry.js"() {
      init_constants();
      PROPERTY_NAME_FILENAME = "filename";
      PROPERTY_NAME_RAW_FILENAME = "rawFilename";
      PROPERTY_NAME_COMMENT = "comment";
      PROPERTY_NAME_RAW_COMMENT = "rawComment";
      PROPERTY_NAME_UNCOMPRESSED_SIZE = "uncompressedSize";
      PROPERTY_NAME_COMPRESSED_SIZE = "compressedSize";
      PROPERTY_NAME_OFFSET = "offset";
      PROPERTY_NAME_DISK_NUMBER_START = "diskNumberStart";
      PROPERTY_NAME_LAST_MODIFICATION_DATE = "lastModDate";
      PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE = "rawLastModDate";
      PROPERTY_NAME_LAST_ACCESS_DATE = "lastAccessDate";
      PROPERTY_NAME_RAW_LAST_ACCESS_DATE = "rawLastAccessDate";
      PROPERTY_NAME_CREATION_DATE = "creationDate";
      PROPERTY_NAME_RAW_CREATION_DATE = "rawCreationDate";
      PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES = "internalFileAttributes";
      PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES = "externalFileAttributes";
      PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW = "msdosAttributesRaw";
      PROPERTY_NAME_MSDOS_ATTRIBUTES = "msdosAttributes";
      PROPERTY_NAME_MS_DOS_COMPATIBLE = "msDosCompatible";
      PROPERTY_NAME_ZIP64 = "zip64";
      PROPERTY_NAME_ENCRYPTED = "encrypted";
      PROPERTY_NAME_VERSION = "version";
      PROPERTY_NAME_VERSION_MADE_BY = "versionMadeBy";
      PROPERTY_NAME_ZIPCRYPTO = "zipCrypto";
      PROPERTY_NAME_DIRECTORY = "directory";
      PROPERTY_NAME_EXECUTABLE = "executable";
      PROPERTY_NAME_SYMLINK = "symlink";
      PROPERTY_NAME_COMPRESSION_METHOD = "compressionMethod";
      PROPERTY_NAME_SIGNATURE = "signature";
      PROPERTY_NAME_CRC32 = "crc32";
      PROPERTY_NAME_EXTRA_FIELD = "extraField";
      PROPERTY_NAME_EXTRA_FIELD_INFOZIP = "extraFieldInfoZip";
      PROPERTY_NAME_EXTRA_FIELD_UNIX = "extraFieldUnix";
      PROPERTY_NAME_EXTRA_FIELD_UNIX_TYPE1 = "extraFieldUnixType1";
      PROPERTY_NAME_EXTRA_FIELD_PKWARE_UNIX = "extraFieldPkwareUnix";
      PROPERTY_NAME_UID = "uid";
      PROPERTY_NAME_GID = "gid";
      PROPERTY_NAME_UNIX_MODE = "unixMode";
      PROPERTY_NAME_SETUID = "setuid";
      PROPERTY_NAME_SETGID = "setgid";
      PROPERTY_NAME_STICKY = "sticky";
      PROPERTY_NAME_BITFLAG = "bitFlag";
      PROPERTY_NAME_RAW_BITFLAG = "rawBitFlag";
      PROPERTY_NAME_FILENAME_LENGTH = "filenameLength";
      PROPERTY_NAME_EXTRA_FIELD_LENGTH = "extraFieldLength";
      PROPERTY_NAME_UNIX_EXTERNAL_UPPER = "unixExternalUpper";
      PROPERTY_NAME_FILENAME_UTF8 = "filenameUTF8";
      PROPERTY_NAME_COMMENT_UTF8 = "commentUTF8";
      PROPERTY_NAME_RAW_EXTRA_FIELD = "rawExtraField";
      PROPERTY_NAME_EXTRA_FIELD_ZIP64 = "extraFieldZip64";
      PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH = "extraFieldUnicodePath";
      PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT = "extraFieldUnicodeComment";
      PROPERTY_NAME_EXTRA_FIELD_AES = "extraFieldAES";
      PROPERTY_NAME_EXTRA_FIELD_NTFS = "extraFieldNTFS";
      PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP = "extraFieldExtendedTimestamp";
      PROPERTY_NAME_EXTRA_FIELD_USDZ = "extraFieldUSDZ";
      PROPERTY_NAMES = [
        PROPERTY_NAME_FILENAME,
        PROPERTY_NAME_RAW_FILENAME,
        PROPERTY_NAME_UNCOMPRESSED_SIZE,
        PROPERTY_NAME_COMPRESSED_SIZE,
        PROPERTY_NAME_LAST_MODIFICATION_DATE,
        PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE,
        PROPERTY_NAME_COMMENT,
        PROPERTY_NAME_RAW_COMMENT,
        PROPERTY_NAME_LAST_ACCESS_DATE,
        PROPERTY_NAME_RAW_LAST_ACCESS_DATE,
        PROPERTY_NAME_CREATION_DATE,
        PROPERTY_NAME_RAW_CREATION_DATE,
        PROPERTY_NAME_OFFSET,
        PROPERTY_NAME_DISK_NUMBER_START,
        PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES,
        PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES,
        PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW,
        PROPERTY_NAME_MSDOS_ATTRIBUTES,
        PROPERTY_NAME_MS_DOS_COMPATIBLE,
        PROPERTY_NAME_ZIP64,
        PROPERTY_NAME_ENCRYPTED,
        PROPERTY_NAME_VERSION,
        PROPERTY_NAME_VERSION_MADE_BY,
        PROPERTY_NAME_ZIPCRYPTO,
        PROPERTY_NAME_DIRECTORY,
        PROPERTY_NAME_EXECUTABLE,
        PROPERTY_NAME_SYMLINK,
        PROPERTY_NAME_COMPRESSION_METHOD,
        PROPERTY_NAME_SIGNATURE,
        PROPERTY_NAME_CRC32,
        PROPERTY_NAME_EXTRA_FIELD,
        PROPERTY_NAME_EXTRA_FIELD_UNIX,
        PROPERTY_NAME_EXTRA_FIELD_INFOZIP,
        PROPERTY_NAME_EXTRA_FIELD_UNIX_TYPE1,
        PROPERTY_NAME_EXTRA_FIELD_PKWARE_UNIX,
        PROPERTY_NAME_UID,
        PROPERTY_NAME_GID,
        PROPERTY_NAME_UNIX_MODE,
        PROPERTY_NAME_UNIX_EXTERNAL_UPPER,
        PROPERTY_NAME_SETUID,
        PROPERTY_NAME_SETGID,
        PROPERTY_NAME_STICKY,
        PROPERTY_NAME_BITFLAG,
        PROPERTY_NAME_RAW_BITFLAG,
        PROPERTY_NAME_FILENAME_LENGTH,
        PROPERTY_NAME_EXTRA_FIELD_LENGTH,
        PROPERTY_NAME_FILENAME_UTF8,
        PROPERTY_NAME_COMMENT_UTF8,
        PROPERTY_NAME_RAW_EXTRA_FIELD,
        PROPERTY_NAME_EXTRA_FIELD_ZIP64,
        PROPERTY_NAME_EXTRA_FIELD_UNICODE_PATH,
        PROPERTY_NAME_EXTRA_FIELD_UNICODE_COMMENT,
        PROPERTY_NAME_EXTRA_FIELD_AES,
        PROPERTY_NAME_EXTRA_FIELD_NTFS,
        PROPERTY_NAME_EXTRA_FIELD_EXTENDED_TIMESTAMP,
        PROPERTY_NAME_EXTRA_FIELD_USDZ
      ];
      Entry = class {
        constructor(data) {
          PROPERTY_NAMES.forEach((name) => this[name] = data[name]);
        }
      };
      INTERPRETED_EXTRA_FIELD_TYPES = /* @__PURE__ */ new Set([
        EXTRAFIELD_TYPE_ZIP64,
        EXTRAFIELD_TYPE_AES,
        EXTRAFIELD_TYPE_NTFS,
        EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP,
        EXTRAFIELD_TYPE_UNICODE_PATH,
        EXTRAFIELD_TYPE_UNICODE_COMMENT,
        EXTRAFIELD_TYPE_USDZ,
        EXTRAFIELD_TYPE_INFOZIP,
        EXTRAFIELD_TYPE_UNIX,
        EXTRAFIELD_TYPE_UNIX_TYPE1,
        EXTRAFIELD_TYPE_PKWARE_UNIX
      ]);
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/zip-reader.js
  var zip_reader_exports = {};
  __export(zip_reader_exports, {
    ERR_AMBIGUOUS_ARCHIVE: () => ERR_AMBIGUOUS_ARCHIVE,
    ERR_BAD_FORMAT: () => ERR_BAD_FORMAT,
    ERR_CENTRAL_DIRECTORY_NOT_FOUND: () => ERR_CENTRAL_DIRECTORY_NOT_FOUND,
    ERR_CODEC_OUT_OF_MEMORY: () => ERR_CODEC_OUT_OF_MEMORY,
    ERR_ENCRYPTED: () => ERR_ENCRYPTED,
    ERR_ENCRYPTED_CENTRAL_DIRECTORY: () => ERR_ENCRYPTED_CENTRAL_DIRECTORY,
    ERR_ENTRY_DATA_OUT_OF_BOUNDS: () => ERR_ENTRY_DATA_OUT_OF_BOUNDS,
    ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND: () => ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND,
    ERR_EOCDR_NOT_FOUND: () => ERR_EOCDR_NOT_FOUND,
    ERR_EXTRAFIELD_ZIP64_NOT_FOUND: () => ERR_EXTRAFIELD_ZIP64_NOT_FOUND,
    ERR_INVALID_AUTHENTICATION_CODE: () => ERR_INVALID_AUTHENTICATION_CODE,
    ERR_INVALID_COMPRESSED_DATA: () => ERR_INVALID_COMPRESSED_DATA,
    ERR_INVALID_CRC32: () => ERR_INVALID_CRC32,
    ERR_INVALID_FILENAME_VALIDATION: () => ERR_INVALID_FILENAME_VALIDATION,
    ERR_INVALID_MAX_APPENDED_DATA_SIZE: () => ERR_INVALID_MAX_APPENDED_DATA_SIZE,
    ERR_INVALID_PASSWORD: () => ERR_INVALID_PASSWORD,
    ERR_INVALID_STRICTNESS: () => ERR_INVALID_STRICTNESS,
    ERR_INVALID_UNCOMPRESSED_SIZE: () => ERR_INVALID_UNCOMPRESSED_SIZE,
    ERR_LOCAL_FILE_HEADER_NOT_FOUND: () => ERR_LOCAL_FILE_HEADER_NOT_FOUND,
    ERR_OVERLAPPING_ENTRY: () => ERR_OVERLAPPING_ENTRY,
    ERR_SPLIT_ZIP_FILE: () => ERR_SPLIT_ZIP_FILE,
    ERR_UNSAFE_FILENAME: () => ERR_UNSAFE_FILENAME,
    ERR_UNSUPPORTED_COMPRESSION: () => ERR_UNSUPPORTED_COMPRESSION,
    ERR_UNSUPPORTED_ENCRYPTION: () => ERR_UNSUPPORTED_ENCRYPTION,
    ERR_UNSUPPORTED_UINT64: () => ERR_UNSUPPORTED_UINT64,
    ERR_WORKER_STARTUP_TIMEOUT: () => ERR_WORKER_STARTUP_TIMEOUT,
    WARNING_APPENDED_DATA: () => WARNING_APPENDED_DATA,
    WARNING_COMPRESSED_PATCHED_DATA: () => WARNING_COMPRESSED_PATCHED_DATA,
    WARNING_DUPLICATE_FILENAME: () => WARNING_DUPLICATE_FILENAME,
    WARNING_MALFORMED_EXTRA_FIELD: () => WARNING_MALFORMED_EXTRA_FIELD,
    WARNING_MISMATCHED_CENTRAL_DIRECTORY_OFFSET: () => WARNING_MISMATCHED_CENTRAL_DIRECTORY_OFFSET,
    WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG: () => WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG,
    WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD: () => WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD,
    WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES: () => WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES,
    WARNING_MISMATCHED_LOCAL_FILE_HEADER_FILENAME: () => WARNING_MISMATCHED_LOCAL_FILE_HEADER_FILENAME,
    WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY: () => WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY,
    WARNING_MISSING_ZIP64_EXTRA_FIELD: () => WARNING_MISSING_ZIP64_EXTRA_FIELD,
    WARNING_MULTIPLE_END_OF_CENTRAL_DIRECTORY: () => WARNING_MULTIPLE_END_OF_CENTRAL_DIRECTORY,
    WARNING_PREPENDED_CENTRAL_DIRECTORY: () => WARNING_PREPENDED_CENTRAL_DIRECTORY,
    WARNING_PREPENDED_DATA: () => WARNING_PREPENDED_DATA,
    WARNING_TRAILING_CENTRAL_DIRECTORY_DATA: () => WARNING_TRAILING_CENTRAL_DIRECTORY_DATA,
    WARNING_UNKNOWN_VERSION: () => WARNING_UNKNOWN_VERSION,
    WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA: () => WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA,
    WARNING_UNSORTED_CENTRAL_DIRECTORY: () => WARNING_UNSORTED_CENTRAL_DIRECTORY,
    WARNING_WRAPPED_ENTRIES_COUNT: () => WARNING_WRAPPED_ENTRIES_COUNT,
    ZipReader: () => ZipReader,
    ZipReaderStream: () => ZipReaderStream,
    getEntryDataDescriptorLength: () => getEntryDataDescriptorLength,
    isZipFile: () => isZipFile
  });
  function createEntryStream(entry, pendingEntries2) {
    const { readable, writable } = new TransformStream();
    let dataReader;
    const entryStream = {
      cancel: async (reason) => {
        pendingEntries2.delete(entryStream);
        await (dataReader ? dataReader.cancel(reason) : readable.cancel(reason));
      }
    };
    entryStream.readable = new ReadableStream({
      async pull(controller) {
        if (!dataReader) {
          dataReader = readable.getReader();
          pendingEntries2.add(entryStream);
          getData();
        }
        const { done, value } = await dataReader.read();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      },
      cancel: (reason) => entryStream.cancel(reason)
    }, { highWaterMark: 0 });
    return entryStream;
    async function getData() {
      try {
        await entry.getData(writable, { preventClose: false });
      } catch (error) {
        try {
          await writable.abort(error);
        } catch {
        }
      } finally {
        pendingEntries2.delete(entryStream);
      }
    }
  }
  async function isZipFile(reader, options = {}) {
    reader = new GenericReader(reader);
    await initStream(reader);
    if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
      reader = new BlobReader(await streamToBlob(reader.readable));
      await initStream(reader);
    }
    if (reader.size < END_OF_CENTRAL_DIR_LENGTH) {
      return false;
    }
    const strictness = getStrictness(options, {});
    const rejectAmbiguousEndOfDirectory = strictness != STRICTNESS_TOLERANT;
    const maxAppendedDataSize = getMaxAppendedDataSize(options[OPTION_MAX_APPENDED_DATA_SIZE], strictness);
    const { endOfDirectoryInfo, endOfDirectoryReachingEndCount } = await findEndOfCentralDirectory(reader, rejectAmbiguousEndOfDirectory, maxAppendedDataSize);
    if (!endOfDirectoryInfo || strictness == STRICTNESS_STRICT && endOfDirectoryReachingEndCount > 1) {
      return false;
    }
    const commentLength = getUint16(getDataView(endOfDirectoryInfo), 20);
    const appendedDataOffset = endOfDirectoryInfo.offset + END_OF_CENTRAL_DIR_LENGTH + commentLength;
    return reader.size - appendedDataOffset <= maxAppendedDataSize;
  }
  function detectEncryptedCentralDirectory(directoryView) {
    return directoryView.byteLength >= 4 && getUint32(directoryView, 0) == ARCHIVE_EXTRA_DATA_SIGNATURE;
  }
  function getWrappedFilesLength(directoryView, directoryArray, offset) {
    let wrappedFilesLength = 0;
    while (offset + CENTRAL_FILE_HEADER_LENGTH <= directoryArray.length && getUint32(directoryView, offset) == CENTRAL_FILE_HEADER_SIGNATURE) {
      offset += CENTRAL_FILE_HEADER_LENGTH + getUint16(directoryView, offset + 28) + getUint16(directoryView, offset + 30) + getUint16(directoryView, offset + 32);
      wrappedFilesLength++;
    }
    return wrappedFilesLength % (MAX_16_BITS + 1) ? 0 : wrappedFilesLength;
  }
  function pointsAtDirectory(reader, offset) {
    return startsWithSignature(reader, offset, CENTRAL_FILE_HEADER_SIGNATURE);
  }
  async function startsWithSignature(reader, offset, signature) {
    if (offset < 0 || offset + 4 > reader.size) {
      return false;
    }
    const signatureArray = await readUint8Array(reader, offset, 4);
    return getUint32(getDataView(signatureArray), 0) == signature;
  }
  async function findDigitalSignatureRecordOffset(reader, endOffset) {
    const startOffset = Math.max(0, endOffset - (6 + MAX_16_BITS));
    const tailArray = await readUint8Array(reader, startOffset, endOffset - startOffset);
    const tailView = getDataView(tailArray);
    for (let indexByte = tailArray.length - 6; indexByte >= 0; indexByte--) {
      if (getUint32(tailView, indexByte) == DIGITAL_SIGNATURE_RECORD_SIGNATURE && indexByte + 6 + getUint16(tailView, indexByte + 4) == tailArray.length) {
        return startOffset + indexByte;
      }
    }
  }
  async function findZip64EndOfDirectoryOffset(reader, endOffset) {
    const startOffset = Math.max(0, endOffset - (ZIP64_END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS));
    const tailArray = await readUint8Array(reader, startOffset, endOffset - startOffset);
    const tailView = getDataView(tailArray);
    for (let indexByte = tailArray.length - ZIP64_END_OF_CENTRAL_DIR_LENGTH; indexByte >= 0; indexByte--) {
      if (getUint32(tailView, indexByte) == ZIP64_END_OF_CENTRAL_DIR_SIGNATURE && indexByte + 12 + Number(tailView.getBigUint64(indexByte + 4, true)) == tailArray.length) {
        return startOffset + indexByte;
      }
    }
  }
  async function probeLocalHeaders(reader, directoryArray, directoryView, offsetDelta) {
    let result = { localHeaderFound: false, shiftedLocalHeaderFound: false };
    let recordOffset = 0;
    while (recordOffset + CENTRAL_FILE_HEADER_LENGTH <= directoryArray.length && getUint32(directoryView, recordOffset) == CENTRAL_FILE_HEADER_SIGNATURE) {
      const localHeaderOffset = getLocalHeaderOffset(directoryArray, directoryView, recordOffset);
      if (localHeaderOffset !== UNDEFINED_VALUE) {
        const localHeaderFound = await startsWithSignature(reader, localHeaderOffset, LOCAL_FILE_HEADER_SIGNATURE);
        const shiftedLocalHeaderFound = await startsWithSignature(reader, localHeaderOffset + offsetDelta, LOCAL_FILE_HEADER_SIGNATURE);
        if (!recordOffset) {
          result = { localHeaderFound, shiftedLocalHeaderFound };
        }
        if (localHeaderFound != shiftedLocalHeaderFound) {
          return { localHeaderFound, shiftedLocalHeaderFound };
        }
      }
      recordOffset += CENTRAL_FILE_HEADER_LENGTH + getUint16(directoryView, recordOffset + 28) + getUint16(directoryView, recordOffset + 30) + getUint16(directoryView, recordOffset + 32);
    }
    return result;
  }
  function getLocalHeaderOffset(directoryArray, directoryView, recordOffset) {
    const localHeaderOffset = getUint32(directoryView, recordOffset + 42);
    if (localHeaderOffset != MAX_32_BITS) {
      return localHeaderOffset;
    }
    let offsetExtraField = recordOffset + CENTRAL_FILE_HEADER_LENGTH + getUint16(directoryView, recordOffset + 28);
    const endExtraField = Math.min(offsetExtraField + getUint16(directoryView, recordOffset + 30), directoryArray.length);
    while (offsetExtraField + 4 <= endExtraField) {
      const type = getUint16(directoryView, offsetExtraField);
      const size = getUint16(directoryView, offsetExtraField + 2);
      if (type == EXTRAFIELD_TYPE_ZIP64) {
        let offsetValue = offsetExtraField + 4;
        if (getUint32(directoryView, recordOffset + 24) == MAX_32_BITS) {
          offsetValue += 8;
        }
        if (getUint32(directoryView, recordOffset + 20) == MAX_32_BITS) {
          offsetValue += 8;
        }
        return offsetValue + 8 <= endExtraField ? getBigUint64(directoryView, offsetValue) : UNDEFINED_VALUE;
      }
      offsetExtraField += 4 + size;
    }
    return UNDEFINED_VALUE;
  }
  function readDigitalSignature(signatureRecordArray) {
    if (signatureRecordArray.length >= 6) {
      const signatureRecordView = getDataView(signatureRecordArray);
      if (getUint32(signatureRecordView, 0) == DIGITAL_SIGNATURE_RECORD_SIGNATURE) {
        const signatureDataLength = getUint16(signatureRecordView, 4);
        if (6 + signatureDataLength <= signatureRecordArray.length) {
          return new Uint8Array(signatureRecordArray.subarray(6, 6 + signatureDataLength));
        }
      }
    }
  }
  function getEncryptedDirectoryDataLength(directoryEncryptionInfo, declaredDirectoryDataLength, directoryDataLength) {
    const encryptedDirectoryDataLength = directoryEncryptionInfo && directoryEncryptionInfo.compressedSize ? directoryEncryptionInfo.compressedSize : declaredDirectoryDataLength;
    return encryptedDirectoryDataLength > 0 && encryptedDirectoryDataLength <= directoryDataLength ? encryptedDirectoryDataLength : directoryDataLength;
  }
  function getDirectoryEncryptionInfo(rawExtensibleData) {
    const directoryEncryptionInfo = { rawExtensibleData };
    if (rawExtensibleData.length >= 28) {
      const extensibleDataView = getDataView(rawExtensibleData);
      const hashDataLength = getUint16(extensibleDataView, 26);
      Object.assign(directoryEncryptionInfo, {
        compressionMethod: getUint16(extensibleDataView, 0),
        compressedSize: getBigUint64(extensibleDataView, 2),
        uncompressedSize: getBigUint64(extensibleDataView, 10),
        encryptionAlgorithm: getUint16(extensibleDataView, 18),
        bitLength: getUint16(extensibleDataView, 20),
        flags: getUint16(extensibleDataView, 22),
        hashAlgorithm: getUint16(extensibleDataView, 24),
        hashData: rawExtensibleData.subarray(28, 28 + hashDataLength)
      });
    }
    return directoryEncryptionInfo;
  }
  function readCommonHeader(directory, dataView, offset) {
    const rawBitFlag = directory.rawBitFlag = getUint16(dataView, offset + 2);
    const encrypted = (rawBitFlag & BITFLAG_ENCRYPTED) == BITFLAG_ENCRYPTED;
    const rawLastModDate = getUint32(dataView, offset + 6);
    Object.assign(directory, {
      encrypted,
      version: getUint16(dataView, offset),
      bitFlag: {
        level: (rawBitFlag & BITFLAG_LEVEL) >> 1,
        dataDescriptor: (rawBitFlag & BITFLAG_DATA_DESCRIPTOR) == BITFLAG_DATA_DESCRIPTOR,
        languageEncodingFlag: (rawBitFlag & BITFLAG_LANG_ENCODING_FLAG) == BITFLAG_LANG_ENCODING_FLAG
      },
      rawLastModDate,
      lastModDate: getDate(rawLastModDate),
      filenameLength: getUint16(dataView, offset + 22),
      extraFieldLength: getUint16(dataView, offset + 24)
    });
  }
  function readCommonFooter(fileEntry, directory, dataView, offset, localDirectory) {
    const { rawExtraField } = directory;
    const extraField = directory.extraField = /* @__PURE__ */ new Map();
    const rawExtraFieldView = getDataView(rawExtraField);
    let offsetExtraField = 0;
    let malformedExtraField = false;
    try {
      while (offsetExtraField < rawExtraField.length) {
        const type = getUint16(rawExtraFieldView, offsetExtraField);
        const size = getUint16(rawExtraFieldView, offsetExtraField + 2);
        extraField.set(type, {
          type,
          data: rawExtraField.slice(offsetExtraField + 4, offsetExtraField + 4 + size)
        });
        offsetExtraField += 4 + size;
      }
    } catch {
      malformedExtraField = true;
    }
    if (offsetExtraField > rawExtraField.length) {
      malformedExtraField = true;
    }
    const compressionMethod = getUint16(dataView, offset + 4);
    Object.assign(directory, {
      signature: getUint32(dataView, offset + HEADER_OFFSET_SIGNATURE),
      crc32: getUint32(dataView, offset + HEADER_OFFSET_SIGNATURE),
      compressedSize: getUint32(dataView, offset + HEADER_OFFSET_COMPRESSED_SIZE),
      uncompressedSize: getUint32(dataView, offset + HEADER_OFFSET_UNCOMPRESSED_SIZE)
    });
    const extraFieldZip64 = extraField.get(EXTRAFIELD_TYPE_ZIP64);
    let extraFieldZip64Missing;
    if (extraFieldZip64) {
      if (!readExtraFieldZip64(extraFieldZip64, directory, localDirectory)) {
        malformedExtraField = true;
      }
      directory.extraFieldZip64 = extraFieldZip64;
    } else if (ZIP64_PROPERTIES.some(([propertyName, max]) => directory[propertyName] == max)) {
      if (localDirectory) {
        malformedExtraField = true;
      } else {
        extraFieldZip64Missing = true;
      }
    }
    const extraFieldUnicodePath = extraField.get(EXTRAFIELD_TYPE_UNICODE_PATH);
    if (extraFieldUnicodePath) {
      readExtraFieldUnicode(extraFieldUnicodePath, PROPERTY_NAME_FILENAME, PROPERTY_NAME_RAW_FILENAME, directory, fileEntry);
      directory.extraFieldUnicodePath = extraFieldUnicodePath;
    }
    const extraFieldUnicodeComment = extraField.get(EXTRAFIELD_TYPE_UNICODE_COMMENT);
    if (extraFieldUnicodeComment) {
      readExtraFieldUnicode(extraFieldUnicodeComment, PROPERTY_NAME_COMMENT, PROPERTY_NAME_RAW_COMMENT, directory, fileEntry);
      directory.extraFieldUnicodeComment = extraFieldUnicodeComment;
    }
    const extraFieldAES = extraField.get(EXTRAFIELD_TYPE_AES);
    if (extraFieldAES && (compressionMethod == COMPRESSION_METHOD_AES || directory.encrypted) && extraFieldAES.data.length >= 7) {
      readExtraFieldAES(extraFieldAES, directory, compressionMethod);
      directory.extraFieldAES = extraFieldAES;
    } else {
      if (extraFieldAES) {
        malformedExtraField = true;
      }
      directory.compressionMethod = compressionMethod;
    }
    const extraFieldPkwareUnix = extraField.get(EXTRAFIELD_TYPE_PKWARE_UNIX);
    if (extraFieldPkwareUnix) {
      readExtraFieldUnixDates(extraFieldPkwareUnix, directory);
      directory.extraFieldPkwareUnix = extraFieldPkwareUnix;
    }
    const extraFieldUnixType1 = extraField.get(EXTRAFIELD_TYPE_UNIX_TYPE1);
    if (extraFieldUnixType1) {
      readExtraFieldUnixDates(extraFieldUnixType1, directory);
      directory.extraFieldUnixType1 = extraFieldUnixType1;
    }
    const extraFieldExtendedTimestamp = extraField.get(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
    if (extraFieldExtendedTimestamp) {
      readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory);
      directory.extraFieldExtendedTimestamp = extraFieldExtendedTimestamp;
    }
    const extraFieldNTFS = extraField.get(EXTRAFIELD_TYPE_NTFS);
    if (extraFieldNTFS) {
      readExtraFieldNTFS(extraFieldNTFS, directory);
      directory.extraFieldNTFS = extraFieldNTFS;
    }
    const extraFieldInfoZip = extraField.get(EXTRAFIELD_TYPE_INFOZIP);
    let unixIdsRead;
    if (extraFieldInfoZip) {
      unixIdsRead = readExtraFieldUnix(extraFieldInfoZip, directory, true);
      directory.extraFieldInfoZip = extraFieldInfoZip;
    }
    const extraFieldUnix = extraField.get(EXTRAFIELD_TYPE_UNIX);
    if (extraFieldUnix) {
      readExtraFieldUnix(extraFieldUnix, unixIdsRead ? {} : directory, false);
      directory.extraFieldUnix = extraFieldUnix;
    }
    const extraFieldUSDZ = extraField.get(EXTRAFIELD_TYPE_USDZ);
    if (extraFieldUSDZ) {
      directory.extraFieldUSDZ = extraFieldUSDZ;
    }
    if (extraFieldZip64Missing) {
      throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
    }
    return malformedExtraField;
  }
  function readExtraFieldZip64(extraFieldZip64, directory, localDirectory) {
    directory.zip64 = true;
    const extraFieldView = getDataView(extraFieldZip64.data);
    const missingProperties = ZIP64_PROPERTIES.filter(([propertyName, max]) => directory[propertyName] == max);
    const requiredLength = missingProperties.reduce((length, [, max]) => length + ZIP64_EXTRACTION[max].bytes, 0);
    if (extraFieldZip64.data.length < requiredLength) {
      if (localDirectory) {
        return false;
      }
      throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
    }
    const values = [];
    try {
      for (let indexMissingProperty = 0, offset = 0; indexMissingProperty < missingProperties.length; indexMissingProperty++) {
        const [, max] = missingProperties[indexMissingProperty];
        const extraction = ZIP64_EXTRACTION[max];
        values.push(extraction.getValue(extraFieldView, offset));
        offset += extraction.bytes;
      }
    } catch (error) {
      if (localDirectory) {
        return false;
      }
      throw error;
    }
    missingProperties.forEach(([propertyName], indexMissingProperty) => {
      directory[propertyName] = extraFieldZip64[propertyName] = values[indexMissingProperty];
    });
    return true;
  }
  function readExtraFieldUnicode(extraFieldUnicode, propertyName, rawPropertyName, directory, fileEntry) {
    if (extraFieldUnicode.data.length < 5) {
      extraFieldUnicode.valid = false;
      return;
    }
    const extraFieldView = getDataView(extraFieldUnicode.data);
    const computedCrc32 = new Crc32();
    computedCrc32.append(fileEntry[rawPropertyName]);
    const computedCrc32View = getDataView(new Uint8Array(4));
    computedCrc32View.setUint32(0, computedCrc32.get(), true);
    const nameCrc32 = getUint32(extraFieldView, 1);
    const version = getUint8(extraFieldView, 0);
    Object.assign(extraFieldUnicode, {
      version,
      [propertyName]: decodeText(extraFieldUnicode.data.subarray(5)),
      valid: version == 1 && !fileEntry.bitFlag.languageEncodingFlag && nameCrc32 == getUint32(computedCrc32View, 0)
    });
    if (extraFieldUnicode.valid) {
      directory[propertyName] = extraFieldUnicode[propertyName];
      directory[propertyName + PROPERTY_NAME_UTF8_SUFFIX] = true;
    }
  }
  function readExtraFieldAES(extraFieldAES, directory, compressionMethod) {
    const extraFieldView = getDataView(extraFieldAES.data);
    const strength = getUint8(extraFieldView, 4);
    Object.assign(extraFieldAES, {
      vendorVersion: getUint8(extraFieldView, 0),
      vendorId: getUint8(extraFieldView, 2),
      strength,
      originalCompressionMethod: compressionMethod,
      compressionMethod: getUint16(extraFieldView, 5)
    });
    directory.compressionMethod = extraFieldAES.compressionMethod;
    if (extraFieldAES.vendorVersion != VENDOR_VERSION_AE_1) {
      directory.crc32 = UNDEFINED_VALUE;
    }
  }
  function readExtraFieldNTFS(extraFieldNTFS, directory) {
    const extraFieldView = getDataView(extraFieldNTFS.data);
    let offsetExtraField = 4;
    let tag1Data;
    try {
      while (offsetExtraField < extraFieldNTFS.data.length && !tag1Data) {
        const tagValue = getUint16(extraFieldView, offsetExtraField);
        const attributeSize = getUint16(extraFieldView, offsetExtraField + 2);
        if (tagValue == EXTRAFIELD_TYPE_NTFS_TAG1) {
          tag1Data = extraFieldNTFS.data.slice(offsetExtraField + 4, offsetExtraField + 4 + attributeSize);
        }
        offsetExtraField += 4 + attributeSize;
      }
    } catch {
    }
    if (tag1Data && tag1Data.length == 24) {
      const tag1View = getDataView(tag1Data);
      const rawLastModDate = tag1View.getBigUint64(0, true);
      const rawLastAccessDate = tag1View.getBigUint64(8, true);
      const rawCreationDate = tag1View.getBigUint64(16, true);
      Object.assign(extraFieldNTFS, {
        rawLastModDate,
        rawLastAccessDate,
        rawCreationDate
      });
      const lastModDate = getDateNTFS(rawLastModDate);
      const lastAccessDate = getDateNTFS(rawLastAccessDate);
      const creationDate = getDateNTFS(rawCreationDate);
      const extraFieldData = { lastModDate, lastAccessDate, creationDate };
      Object.assign(extraFieldNTFS, extraFieldData);
      Object.assign(directory, extraFieldData, { rawLastAccessDate, rawCreationDate });
    }
  }
  function readExtraFieldUnixDates(extraField, directory) {
    if (extraField.data.length < 8) {
      return;
    }
    const extraFieldView = getDataView(extraField.data);
    const lastAccessDate = new Date((getUint32(extraFieldView, 0) | 0) * 1e3);
    const lastModDate = new Date((getUint32(extraFieldView, 4) | 0) * 1e3);
    const extraFieldData = { lastAccessDate, lastModDate };
    if (extraField.data.length >= 12) {
      extraFieldData.uid = getUint16(extraFieldView, 8);
      extraFieldData.gid = getUint16(extraFieldView, 10);
    }
    Object.assign(extraField, extraFieldData);
    Object.assign(directory, extraFieldData);
  }
  function readExtraFieldUnix(extraField, directory, isInfoZip) {
    try {
      const view = getDataView(extraField.data);
      let uid, gid;
      if (isInfoZip) {
        let offset = 0;
        const version = getUint8(view, offset++);
        const uidSize = getUint8(view, offset++);
        uid = unpackUnixId(extraField.data.subarray(offset, offset + uidSize));
        offset += uidSize;
        const gidSize = getUint8(view, offset++);
        gid = unpackUnixId(extraField.data.subarray(offset, offset + gidSize));
        Object.assign(extraField, { version, uid, gid });
      } else if (extraField.data.length >= 4) {
        uid = getUint16(view, 0);
        gid = getUint16(view, 2);
        Object.assign(extraField, { uid, gid });
      }
      if (uid !== UNDEFINED_VALUE) {
        directory.uid = uid;
      }
      if (gid !== UNDEFINED_VALUE) {
        directory.gid = gid;
      }
      return uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE;
    } catch {
    }
  }
  function unpackUnixId(bytes) {
    const buffer = new Uint8Array(4);
    buffer.set(bytes, 0);
    const view = new DataView(buffer.buffer, buffer.byteOffset, 4);
    return view.getUint32(0, true);
  }
  function readExtraFieldExtendedTimestamp(extraFieldExtendedTimestamp, directory, localDirectory) {
    if (!extraFieldExtendedTimestamp.data.length) {
      return;
    }
    const extraFieldView = getDataView(extraFieldExtendedTimestamp.data);
    const flags = getUint8(extraFieldView, 0);
    const timeProperties = [];
    const timeRawProperties = [];
    if (localDirectory) {
      if ((flags & 1) == 1) {
        timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
        timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
      }
      if ((flags & 2) == 2) {
        timeProperties.push(PROPERTY_NAME_LAST_ACCESS_DATE);
        timeRawProperties.push(PROPERTY_NAME_RAW_LAST_ACCESS_DATE);
      }
      if ((flags & 4) == 4) {
        timeProperties.push(PROPERTY_NAME_CREATION_DATE);
        timeRawProperties.push(PROPERTY_NAME_RAW_CREATION_DATE);
      }
    } else if (extraFieldExtendedTimestamp.data.length >= 5) {
      timeProperties.push(PROPERTY_NAME_LAST_MODIFICATION_DATE);
      timeRawProperties.push(PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
    }
    let offset = 1;
    timeProperties.forEach((propertyName, indexProperty) => {
      if (extraFieldExtendedTimestamp.data.length >= offset + 4) {
        const time = getUint32(extraFieldView, offset);
        directory[propertyName] = extraFieldExtendedTimestamp[propertyName] = new Date((time | 0) * 1e3);
        const rawPropertyName = timeRawProperties[indexProperty];
        extraFieldExtendedTimestamp[rawPropertyName] = time;
      }
      offset += 4;
    });
  }
  async function detectOverlappingEntry({
    reader,
    fileEntry,
    index,
    offset,
    crc32,
    compressedSize,
    uncompressedSize,
    dataOffset,
    dataDescriptor,
    extraFieldZip64,
    readRanges
  }) {
    let dataDescriptorLength = 0;
    if (dataDescriptor) {
      const zip64 = Boolean(extraFieldZip64);
      const localDataDescriptor = await readLocalDataDescriptor(reader, dataOffset + compressedSize, { crc32, compressedSize, uncompressedSize, zip64 });
      if (localDataDescriptor) {
        fileEntry.localDirectory.dataDescriptor = localDataDescriptor;
        dataDescriptorLength = getDataDescriptorLength(localDataDescriptor.zip64, localDataDescriptor.signature);
      } else {
        dataDescriptorLength = getDataDescriptorLength(zip64, false);
      }
    }
    const range = {
      start: offset,
      end: dataOffset + compressedSize + dataDescriptorLength,
      fileEntry
    };
    const { indexes, sortedRanges, pendingRanges } = readRanges;
    if (!indexes.has(index)) {
      const overlappingRange = findOverlappingRange(sortedRanges, range) || pendingRanges.find((otherRange) => rangesOverlap(range, otherRange));
      if (overlappingRange) {
        const error = new Error(ERR_OVERLAPPING_ENTRY);
        error.overlappingEntry = overlappingRange.fileEntry;
        throw error;
      }
      indexes.add(index);
      pendingRanges.push(range);
      if (pendingRanges.length * pendingRanges.length > sortedRanges.length) {
        pendingRanges.sort((range2, otherRange) => range2.start - otherRange.start);
        readRanges.sortedRanges = mergeRanges(sortedRanges, pendingRanges);
        pendingRanges.length = 0;
      }
    }
  }
  function findOverlappingRange(sortedRanges, range) {
    let low = 0;
    let high = sortedRanges.length;
    while (low < high) {
      const middle = low + high >>> 1;
      if (sortedRanges[middle].start < range.start) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    const previousRange = sortedRanges[low - 1];
    const nextRange = sortedRanges[low];
    if (previousRange && rangesOverlap(range, previousRange)) {
      return previousRange;
    }
    if (nextRange && rangesOverlap(range, nextRange)) {
      return nextRange;
    }
  }
  function rangesOverlap(range, otherRange) {
    return range.start < otherRange.end && otherRange.start < range.end;
  }
  function mergeRanges(sortedRanges, pendingRanges) {
    const mergedRanges = [];
    let indexSorted = 0;
    let indexPending = 0;
    while (indexSorted < sortedRanges.length || indexPending < pendingRanges.length) {
      if (indexPending == pendingRanges.length || indexSorted < sortedRanges.length && sortedRanges[indexSorted].start < pendingRanges[indexPending].start) {
        mergedRanges.push(sortedRanges[indexSorted++]);
      } else {
        mergedRanges.push(pendingRanges[indexPending++]);
      }
    }
    return mergedRanges;
  }
  async function readLocalDataDescriptor(reader, offset, { crc32, compressedSize, uncompressedSize, zip64 }) {
    const maxLength = DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH + DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
    const length = Math.min(maxLength, Math.max(0, reader.size - offset));
    const dataDescriptorArray = length ? await readUint8Array(reader, offset, length) : EMPTY_UINT8_ARRAY;
    const dataDescriptorView = getDataView(dataDescriptorArray);
    const candidates = [[zip64, true], [zip64, false], [!zip64, true], [!zip64, false]].map(([zip64Layout, signature]) => readDataDescriptor(dataDescriptorView, zip64Layout, signature)).filter((candidate) => candidate && candidate.compressedSize == compressedSize && candidate.uncompressedSize == uncompressedSize);
    return candidates.find((candidate) => candidate.crc32 == crc32) || candidates[0] || readDataDescriptor(dataDescriptorView, zip64, true) || readDataDescriptor(dataDescriptorView, zip64, false);
  }
  async function getEntryDataDescriptorLength(reader, offset, { crc32, compressedSize, uncompressedSize, extraFieldZip64 }) {
    const dataDescriptor = await readLocalDataDescriptor(reader, offset, { crc32, compressedSize, uncompressedSize, zip64: Boolean(extraFieldZip64) });
    if (dataDescriptor && dataDescriptor.compressedSize == compressedSize && dataDescriptor.uncompressedSize == uncompressedSize) {
      return getDataDescriptorLength(dataDescriptor.zip64, dataDescriptor.signature);
    }
  }
  function readDataDescriptor(dataDescriptorView, zip64, signature) {
    const offset = signature ? DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH : 0;
    if (dataDescriptorView.byteLength < getDataDescriptorLength(zip64, signature) || signature && getUint32(dataDescriptorView, 0) != DATA_DESCRIPTOR_RECORD_SIGNATURE) {
      return UNDEFINED_VALUE;
    }
    const crc32 = getUint32(dataDescriptorView, offset);
    let compressedSize;
    let uncompressedSize;
    try {
      if (zip64) {
        compressedSize = getBigUint64(dataDescriptorView, offset + 4);
        uncompressedSize = getBigUint64(dataDescriptorView, offset + 12);
      } else {
        compressedSize = getUint32(dataDescriptorView, offset + 4);
        uncompressedSize = getUint32(dataDescriptorView, offset + 8);
      }
    } catch {
      return UNDEFINED_VALUE;
    }
    return { signature, zip64, crc32, compressedSize, uncompressedSize };
  }
  function getDataDescriptorLength(zip64, signature) {
    return (zip64 ? DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH : DATA_DESCRIPTOR_RECORD_LENGTH) + (signature ? DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH : 0);
  }
  function getDiskOffset(reader, diskNumber) {
    return reader.getDiskOffset ? reader.getDiskOffset(diskNumber) : 0;
  }
  async function startsWithSplitZipSignature(reader) {
    return await getFirstSignature(reader) == SPLIT_ZIP_FILE_SIGNATURE;
  }
  async function startsWithSplitZipMarker(reader) {
    const signature = await getFirstSignature(reader);
    return signature == SPLIT_ZIP_FILE_SIGNATURE || signature == TEMPORARY_SPLIT_ZIP_FILE_SIGNATURE;
  }
  async function getFirstSignature(reader) {
    const signatureArray = await readUint8Array(reader, 0, SPLIT_ZIP_FILE_SIGNATURE_LENGTH);
    return getUint32(getDataView(signatureArray));
  }
  function isStrictnessValue(value) {
    return value === STRICTNESS_STRICT || value === STRICTNESS_BALANCED || value === STRICTNESS_TOLERANT;
  }
  function getDecodableOutputSize(outputSize, compressedSize, compressed) {
    return Math.min(outputSize, compressed ? compressedSize * MAX_DEFLATE_EXPANSION_RATIO : compressedSize);
  }
  function getStrictness(options, inheritedOptions) {
    return resolveStrictness(options, resolveStrictness(inheritedOptions, STRICTNESS_BALANCED));
  }
  function resolveStrictness(options, inheritedStrictness) {
    const strictness = options[OPTION_STRICTNESS];
    if (strictness !== UNDEFINED_VALUE) {
      if (!isStrictnessValue(strictness)) {
        throw new Error(ERR_INVALID_STRICTNESS);
      }
      return strictness;
    }
    const checkAmbiguity = options[OPTION_CHECK_AMBIGUITY];
    if (checkAmbiguity === UNDEFINED_VALUE) {
      return inheritedStrictness;
    }
    if (checkAmbiguity) {
      return STRICTNESS_STRICT;
    }
    return inheritedStrictness == STRICTNESS_TOLERANT ? STRICTNESS_TOLERANT : STRICTNESS_BALANCED;
  }
  function getCheckLocalDirectory(checkLocalDirectory, strictness) {
    if (checkLocalDirectory === UNDEFINED_VALUE) {
      return strictness != STRICTNESS_TOLERANT;
    }
    return Boolean(checkLocalDirectory);
  }
  function getCheckLocalFilename(checkLocalFilename, strictness) {
    if (checkLocalFilename === UNDEFINED_VALUE) {
      return strictness == STRICTNESS_STRICT;
    }
    return Boolean(checkLocalFilename);
  }
  function getFilenameValidation(filenameValidation, strictness) {
    if (filenameValidation === UNDEFINED_VALUE) {
      return strictness;
    }
    if (!isStrictnessValue(filenameValidation)) {
      throw new Error(ERR_INVALID_FILENAME_VALIDATION);
    }
    return filenameValidation;
  }
  function isUnsafeFilename(filename, filenameValidation) {
    if (filenameValidation == STRICTNESS_TOLERANT) {
      return false;
    }
    const pathParts = filename.split("/");
    if (pathParts.length > 1 && pathParts[pathParts.length - 1] === "") {
      pathParts.pop();
    }
    if (PARENT_DIRECTORY_REGEXP.test(filename) || filename.startsWith("/") || filename.startsWith("\\") || DRIVE_LETTER_REGEXP.test(filename)) {
      return true;
    }
    return filenameValidation == STRICTNESS_STRICT && (pathParts.includes(".") || pathParts.includes("") || filename.includes("\0"));
  }
  function getMaxAppendedDataSize(maxAppendedDataSize, strictness) {
    if (maxAppendedDataSize !== UNDEFINED_VALUE) {
      const size = toNumber(maxAppendedDataSize);
      if (typeof size != NUMBER_TYPE || Number.isNaN(size) || size < 0) {
        throw new Error(ERR_INVALID_MAX_APPENDED_DATA_SIZE);
      }
      return size;
    }
    if (strictness == STRICTNESS_STRICT) {
      return 0;
    }
    if (strictness == STRICTNESS_TOLERANT) {
      return Infinity;
    }
    return MAX_16_BITS;
  }
  async function findEndOfCentralDirectory(reader, rejectAmbiguous, maxAppendedDataSize) {
    const { size } = reader;
    const anchoredLength = Math.min(size, END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS);
    const remoteProbeBudget = { remaining: MAX_END_OF_CENTRAL_DIR_PROBES };
    let endOfDirectoryInfo;
    let plausibleEndOfDirectoryInfo;
    let endOfDirectoryReachingEndCount = 0;
    for await (const [anchoredView, anchoredOffset, anchoredArray, indexByte, offset] of scanEndOfCentralDirectory(reader, anchoredLength)) {
      const commentLength = getUint16(anchoredView, indexByte + 20);
      if (offset + END_OF_CENTRAL_DIR_LENGTH + commentLength == size) {
        const reachability = await getCentralDirectoryReachability(reader, anchoredView, anchoredOffset, indexByte, offset, size, remoteProbeBudget);
        if (reachability == CENTRAL_DIRECTORY_REACHABLE) {
          if (!endOfDirectoryInfo) {
            endOfDirectoryInfo = getEndOfCentralDirectoryInfo(anchoredArray, indexByte, offset);
          }
          endOfDirectoryReachingEndCount++;
          if (!rejectAmbiguous || endOfDirectoryReachingEndCount > 1) {
            break;
          }
        } else if (reachability == CENTRAL_DIRECTORY_PLAUSIBLE && !plausibleEndOfDirectoryInfo) {
          plausibleEndOfDirectoryInfo = getEndOfCentralDirectoryInfo(anchoredArray, indexByte, offset);
        }
      }
    }
    if (!endOfDirectoryInfo) {
      endOfDirectoryInfo = plausibleEndOfDirectoryInfo;
    }
    if (!endOfDirectoryInfo) {
      endOfDirectoryInfo = await seekEndOfCentralDirectory(reader, maxAppendedDataSize, remoteProbeBudget);
    }
    return { endOfDirectoryInfo, endOfDirectoryReachingEndCount };
  }
  async function seekEndOfCentralDirectory(reader, maxAppendedDataSize, remoteProbeBudget) {
    const { size } = reader;
    const searchLength = Math.min(size, maxAppendedDataSize == Infinity ? size : END_OF_CENTRAL_DIR_LENGTH + MAX_16_BITS + maxAppendedDataSize);
    let firstSignatureInfo, plausibleInfo;
    for await (const [searchView, searchOffset, searchArray, indexByte, offset] of scanEndOfCentralDirectory(reader, searchLength)) {
      const record = getEndOfCentralDirectoryInfo(searchArray, indexByte, offset);
      if (!firstSignatureInfo) {
        firstSignatureInfo = record;
      }
      const reachability = await getCentralDirectoryReachability(reader, searchView, searchOffset, indexByte, offset, size, remoteProbeBudget);
      if (reachability == CENTRAL_DIRECTORY_REACHABLE) {
        return record;
      }
      if (reachability == CENTRAL_DIRECTORY_PLAUSIBLE && !plausibleInfo) {
        plausibleInfo = record;
      }
    }
    return plausibleInfo || firstSignatureInfo;
  }
  async function* scanEndOfCentralDirectory(reader, scanLength) {
    const scanOffset = reader.size - scanLength;
    const scanArray = await readUint8Array(reader, scanOffset, scanLength);
    const scanView = getDataView(scanArray);
    for (let indexByte = scanArray.length - END_OF_CENTRAL_DIR_LENGTH; indexByte >= 0; indexByte--) {
      if (getUint32(scanView, indexByte) == END_OF_CENTRAL_DIR_SIGNATURE) {
        yield [scanView, scanOffset, scanArray, indexByte, scanOffset + indexByte];
      }
    }
  }
  function getEndOfCentralDirectoryInfo(scanArray, indexByte, offset) {
    return { offset, buffer: new Uint8Array(scanArray.subarray(indexByte, indexByte + END_OF_CENTRAL_DIR_LENGTH)).buffer };
  }
  async function getCentralDirectoryReachability(reader, view, anchoredOffset, indexByte, offset, size, remoteProbeBudget) {
    const filesLength = getUint16(view, indexByte + 10);
    const directoryDataLength = getUint32(view, indexByte + 12);
    const directoryDataOffset = getUint32(view, indexByte + 16);
    if (filesLength == MAX_16_BITS || directoryDataLength == MAX_32_BITS || directoryDataOffset == MAX_32_BITS) {
      const locatorSignature = await readSignature(reader, view, anchoredOffset, offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, size, remoteProbeBudget);
      return locatorSignature == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE ? CENTRAL_DIRECTORY_REACHABLE : CENTRAL_DIRECTORY_UNREACHABLE;
    }
    if (!filesLength && !directoryDataLength) {
      return CENTRAL_DIRECTORY_PLAUSIBLE;
    }
    const directoryDiskNumber = getUint16(view, indexByte + 6);
    for (const centralDirectoryOffset of [offset - directoryDataLength, getDiskOffset(reader, directoryDiskNumber) + directoryDataOffset]) {
      if (await readSignature(reader, view, anchoredOffset, centralDirectoryOffset, size, remoteProbeBudget) == CENTRAL_FILE_HEADER_SIGNATURE) {
        return CENTRAL_DIRECTORY_REACHABLE;
      }
    }
    return CENTRAL_DIRECTORY_UNREACHABLE;
  }
  async function readSignature(reader, view, anchoredOffset, signatureOffset, size, remoteProbeBudget) {
    if (signatureOffset < 0 || signatureOffset + 4 > size) {
      return UNDEFINED_VALUE;
    }
    if (signatureOffset >= anchoredOffset) {
      return getUint32(view, signatureOffset - anchoredOffset);
    }
    if (remoteProbeBudget.remaining > 0) {
      remoteProbeBudget.remaining--;
      const signatureArray = await readUint8Array(reader, signatureOffset, 4);
      return getUint32(getDataView(signatureArray), 0);
    }
    return UNDEFINED_VALUE;
  }
  function validateLocalDirectory(zipEntry, localDirectory, rawLocalFilename, checkLocalFilename, warnings) {
    const { rawFilename } = zipEntry;
    const reject = !warnings;
    const maskedLocalDirectory = zipEntry.decryptedDirectory && (localDirectory.rawBitFlag & BITFLAG_MASKED_LOCAL_HEADERS) == BITFLAG_MASKED_LOCAL_HEADERS;
    if (checkLocalFilename && !maskedLocalDirectory && (rawLocalFilename.length != rawFilename.length || rawLocalFilename.some((byteValue, indexByte) => byteValue != rawFilename[indexByte]))) {
      reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_FILENAME);
    }
    if ((localDirectory.rawBitFlag & BITFLAG_AMBIGUITY_MASK) != (zipEntry.rawBitFlag & BITFLAG_AMBIGUITY_MASK)) {
      reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG);
    }
    if (localDirectory.compressionMethod != zipEntry.compressionMethod) {
      reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD);
    }
    if (!localDirectory.bitFlag.dataDescriptor && !maskedLocalDirectory && (localDirectory.crc32 || localDirectory.compressedSize || localDirectory.uncompressedSize) && (localDirectory.crc32 != zipEntry.crc32 || localDirectory.compressedSize != zipEntry.compressedSize || localDirectory.uncompressedSize != zipEntry.uncompressedSize)) {
      reportAmbiguity(reject, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES);
    }
  }
  function validateDataDescriptor(zipEntry, localDirectory, warnings) {
    const { dataDescriptor } = localDirectory;
    const maskedLocalDirectory = zipEntry.decryptedDirectory && (localDirectory.rawBitFlag & BITFLAG_MASKED_LOCAL_HEADERS) == BITFLAG_MASKED_LOCAL_HEADERS;
    if (dataDescriptor && !maskedLocalDirectory && (zipEntry.crc32 !== UNDEFINED_VALUE && dataDescriptor.crc32 != zipEntry.crc32 || dataDescriptor.compressedSize != zipEntry.compressedSize || dataDescriptor.uncompressedSize != zipEntry.uncompressedSize)) {
      reportAmbiguity(!warnings, warnings, WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES);
    }
  }
  function reportAmbiguity(reject, warnings, reason) {
    if (reject) {
      throwAmbiguousArchive(reason);
    } else {
      addWarning(warnings, reason);
    }
  }
  function throwAmbiguousArchive(reason) {
    const error = new Error(ERR_AMBIGUOUS_ARCHIVE);
    error.reason = reason;
    throw error;
  }
  function getOptionValue(zipReader, options, name) {
    return options[name] === UNDEFINED_VALUE ? zipReader.options[name] : options[name];
  }
  function getFunctionOptionValue(zipReader, options, name) {
    return checkFunctionOption(getOptionValue(zipReader, options, name));
  }
  function getDate(timeRaw) {
    const date = (timeRaw & 4294901760) >> 16, time = timeRaw & MAX_16_BITS;
    const result = new Date(1980 + ((date & 65024) >> 9), ((date & 480) >> 5) - 1, date & 31, (time & 63488) >> 11, (time & 2016) >> 5, (time & 31) * 2, 0);
    return result < MIN_DATE ? MIN_DATE : result;
  }
  function getDateNTFS(timeRaw) {
    return new Date(Number(timeRaw / BigInt(1e4) - BigInt(116444736e5)));
  }
  function getUint8(view, offset) {
    return view.getUint8(offset);
  }
  function getUint16(view, offset) {
    return view.getUint16(offset, true);
  }
  function getUint32(view, offset) {
    return view.getUint32(offset, true);
  }
  function getBigUint64(view, offset) {
    const value = view.getBigUint64(offset, true);
    if (value > MAX_SAFE_UINT64) {
      throw new Error(ERR_UNSUPPORTED_UINT64);
    }
    return Number(value);
  }
  var ERR_BAD_FORMAT, ERR_EOCDR_NOT_FOUND, ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND, ERR_CENTRAL_DIRECTORY_NOT_FOUND, ERR_ENCRYPTED, ERR_UNSUPPORTED_ENCRYPTION, ERR_SPLIT_ZIP_FILE, ERR_ENTRY_DATA_OUT_OF_BOUNDS, ERR_AMBIGUOUS_ARCHIVE, ERR_ENCRYPTED_CENTRAL_DIRECTORY, ERR_UNSAFE_FILENAME, ERR_INVALID_STRICTNESS, ERR_INVALID_FILENAME_VALIDATION, ERR_INVALID_MAX_APPENDED_DATA_SIZE, ERR_UNSUPPORTED_UINT64, WARNING_UNSORTED_CENTRAL_DIRECTORY, WARNING_UNKNOWN_VERSION, WARNING_COMPRESSED_PATCHED_DATA, WARNING_MALFORMED_EXTRA_FIELD, WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA, WARNING_WRAPPED_ENTRIES_COUNT, WARNING_APPENDED_DATA, WARNING_PREPENDED_DATA, WARNING_PREPENDED_CENTRAL_DIRECTORY, WARNING_TRAILING_CENTRAL_DIRECTORY_DATA, WARNING_MISMATCHED_CENTRAL_DIRECTORY_OFFSET, WARNING_MISSING_ZIP64_EXTRA_FIELD, WARNING_DUPLICATE_FILENAME, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY, WARNING_MULTIPLE_END_OF_CENTRAL_DIRECTORY, WARNING_MISMATCHED_LOCAL_FILE_HEADER_FILENAME, WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG, WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD, WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES, MAX_KNOWN_VERSION, DRIVE_LETTER_REGEXP, PARENT_DIRECTORY_REGEXP, CHARSET_UTF8, PROPERTY_NAME_UTF8_SUFFIX, CHARSET_CP437, BITFLAG_AMBIGUITY_MASK, VENDOR_VERSION_AE_1, ZIP64_PROPERTIES, ZIP64_EXTRACTION, MAX_SAFE_UINT64, MAX_END_OF_CENTRAL_DIR_PROBES, MAX_DEFLATE_EXPANSION_RATIO, CENTRAL_DIRECTORY_UNREACHABLE, CENTRAL_DIRECTORY_PLAUSIBLE, CENTRAL_DIRECTORY_REACHABLE, ZipReader, ZipReaderStream, ZipEntry;
  var init_zip_reader = __esm({
    "node_modules/@zip.js/zip.js/lib/core/zip-reader.js"() {
      init_constants();
      init_configuration();
      init_codec_registry();
      init_codec_pool();
      init_io();
      init_decode_text();
      init_array();
      init_warnings();
      init_compatible_streams();
      init_error();
      init_crc32();
      init_zip_entry();
      init_options();
      ERR_BAD_FORMAT = "File format is not recognized";
      ERR_EOCDR_NOT_FOUND = "End of central directory not found";
      ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND = "End of Zip64 central directory locator not found";
      ERR_CENTRAL_DIRECTORY_NOT_FOUND = "Central directory header not found";
      ERR_ENCRYPTED = "File contains encrypted entry";
      ERR_UNSUPPORTED_ENCRYPTION = "Encryption method not supported";
      ERR_SPLIT_ZIP_FILE = "Split zip file";
      ERR_ENTRY_DATA_OUT_OF_BOUNDS = "Entry data out of bounds";
      ERR_AMBIGUOUS_ARCHIVE = "Ambiguous archive";
      ERR_ENCRYPTED_CENTRAL_DIRECTORY = "Encrypted central directory is not supported";
      ERR_UNSAFE_FILENAME = "Unsafe filename";
      ERR_INVALID_STRICTNESS = "Invalid strictness (must be 'strict', 'balanced' or 'tolerant')";
      ERR_INVALID_FILENAME_VALIDATION = "Invalid filenameValidation (must be 'strict', 'balanced' or 'tolerant')";
      ERR_INVALID_MAX_APPENDED_DATA_SIZE = "Invalid maxAppendedDataSize (must be a number greater than or equal to 0)";
      ERR_UNSUPPORTED_UINT64 = "64-bit value exceeds Number.MAX_SAFE_INTEGER";
      WARNING_UNSORTED_CENTRAL_DIRECTORY = "unsorted central directory";
      WARNING_UNKNOWN_VERSION = "unknown version needed to extract";
      WARNING_COMPRESSED_PATCHED_DATA = "compressed patched data";
      WARNING_MALFORMED_EXTRA_FIELD = "malformed extra field";
      WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA = "unknown zip64 extensible data";
      WARNING_WRAPPED_ENTRIES_COUNT = "wrapped entries count";
      WARNING_APPENDED_DATA = "appended data";
      WARNING_PREPENDED_DATA = "prepended data";
      WARNING_PREPENDED_CENTRAL_DIRECTORY = "prepended central directory";
      WARNING_TRAILING_CENTRAL_DIRECTORY_DATA = "trailing central directory data";
      WARNING_MISMATCHED_CENTRAL_DIRECTORY_OFFSET = "mismatched central directory offset";
      WARNING_MISSING_ZIP64_EXTRA_FIELD = "missing zip64 extra field";
      WARNING_DUPLICATE_FILENAME = "duplicate filename";
      WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY = "mismatched zip64 end of central directory record";
      WARNING_MULTIPLE_END_OF_CENTRAL_DIRECTORY = "multiple end of central directory records";
      WARNING_MISMATCHED_LOCAL_FILE_HEADER_FILENAME = "mismatched local file header (filename)";
      WARNING_MISMATCHED_LOCAL_FILE_HEADER_BIT_FLAG = "mismatched local file header (general purpose bit flag)";
      WARNING_MISMATCHED_LOCAL_FILE_HEADER_COMPRESSION_METHOD = "mismatched local file header (compression method)";
      WARNING_MISMATCHED_LOCAL_FILE_HEADER_CRC32_OR_SIZES = "mismatched local file header (crc32 or sizes)";
      MAX_KNOWN_VERSION = 63;
      DRIVE_LETTER_REGEXP = /^[a-zA-Z]:/;
      PARENT_DIRECTORY_REGEXP = /(^|[\\/])\.\.([\\/]|$)/;
      CHARSET_UTF8 = "utf-8";
      PROPERTY_NAME_UTF8_SUFFIX = "UTF8";
      CHARSET_CP437 = "cp437";
      BITFLAG_AMBIGUITY_MASK = BITFLAG_ENCRYPTED | BITFLAG_DATA_DESCRIPTOR | BITFLAG_STRONG_ENCRYPTION | BITFLAG_LANG_ENCODING_FLAG;
      VENDOR_VERSION_AE_1 = 1;
      ZIP64_PROPERTIES = [
        [PROPERTY_NAME_UNCOMPRESSED_SIZE, MAX_32_BITS],
        [PROPERTY_NAME_COMPRESSED_SIZE, MAX_32_BITS],
        [PROPERTY_NAME_OFFSET, MAX_32_BITS],
        [PROPERTY_NAME_DISK_NUMBER_START, MAX_16_BITS]
      ];
      ZIP64_EXTRACTION = {
        [MAX_16_BITS]: {
          getValue: getUint32,
          bytes: 4
        },
        [MAX_32_BITS]: {
          getValue: getBigUint64,
          bytes: 8
        }
      };
      MAX_SAFE_UINT64 = BigInt(Number.MAX_SAFE_INTEGER);
      MAX_END_OF_CENTRAL_DIR_PROBES = 64;
      MAX_DEFLATE_EXPANSION_RATIO = 1032;
      CENTRAL_DIRECTORY_UNREACHABLE = 0;
      CENTRAL_DIRECTORY_PLAUSIBLE = 1;
      CENTRAL_DIRECTORY_REACHABLE = 2;
      ZipReader = class {
        constructor(reader, options = {}) {
          Object.assign(this, {
            reader: new GenericReader(reader),
            options: options || {},
            readRanges: { indexes: /* @__PURE__ */ new Set(), sortedRanges: [], pendingRanges: [] },
            entriesMissingZip64ExtraField: /* @__PURE__ */ new WeakSet()
          });
        }
        async *getEntriesGenerator(options = {}) {
          const zipReader = this;
          let { reader } = zipReader;
          await initStream(reader);
          if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
            reader = new BlobReader(await streamToBlob(reader.readable));
            await initStream(reader);
          }
          if (reader.size < END_OF_CENTRAL_DIR_LENGTH) {
            throw new Error(ERR_BAD_FORMAT);
          }
          const warnings = zipReader.warnings = [];
          const strictness = getStrictness(options, zipReader.options);
          const checkAmbiguity = strictness == STRICTNESS_STRICT;
          const rejectAmbiguousEndOfDirectory = strictness != STRICTNESS_TOLERANT;
          const maxAppendedDataSize = getMaxAppendedDataSize(getOptionValue(zipReader, options, OPTION_MAX_APPENDED_DATA_SIZE), strictness);
          const filenameValidation = getFilenameValidation(getOptionValue(zipReader, options, OPTION_FILENAME_VALIDATION), strictness);
          const normalizeFilename = getOptionValue(zipReader, options, OPTION_NORMALIZE_FILENAME);
          const { endOfDirectoryInfo, endOfDirectoryReachingEndCount } = await findEndOfCentralDirectory(reader, rejectAmbiguousEndOfDirectory, maxAppendedDataSize);
          if (!endOfDirectoryInfo) {
            if (await startsWithSplitZipSignature(reader)) {
              throw new Error(ERR_SPLIT_ZIP_FILE);
            } else {
              throw new Error(ERR_EOCDR_NOT_FOUND);
            }
          }
          if (rejectAmbiguousEndOfDirectory && endOfDirectoryReachingEndCount > 1) {
            throwAmbiguousArchive(WARNING_MULTIPLE_END_OF_CENTRAL_DIRECTORY);
          }
          const endOfDirectoryView = getDataView(endOfDirectoryInfo);
          let directoryDataLength = getUint32(endOfDirectoryView, 12);
          let directoryDataOffset = getUint32(endOfDirectoryView, 16);
          const commentOffset = endOfDirectoryInfo.offset;
          const commentLength = getUint16(endOfDirectoryView, 20);
          const appendedDataOffset = commentOffset + END_OF_CENTRAL_DIR_LENGTH + commentLength;
          const appendedDataLength = reader.size - appendedDataOffset;
          if (appendedDataLength > maxAppendedDataSize) {
            throwAmbiguousArchive(WARNING_APPENDED_DATA);
          }
          if (appendedDataLength > 0) {
            addWarning(warnings, WARNING_APPENDED_DATA);
          }
          let lastDiskNumber = getUint16(endOfDirectoryView, 4);
          const expectedLastDiskNumber = reader.lastDiskNumber || 0;
          let diskNumber = getUint16(endOfDirectoryView, 6);
          let filesLength = getUint16(endOfDirectoryView, 10);
          let prependedDataLength = 0;
          let prependedCentralDirectory;
          let startOffset;
          let zip64EndOfDirectory;
          let zip64EndOfDirectoryVersion2;
          let zip64EndOfDirectoryLength = ZIP64_END_OF_CENTRAL_DIR_LENGTH;
          let directoryEncryptionInfo;
          const requiresZip64 = directoryDataOffset == MAX_32_BITS || directoryDataLength == MAX_32_BITS || filesLength == MAX_16_BITS || diskNumber == MAX_16_BITS;
          if (directoryDataOffset != MAX_32_BITS && diskNumber != MAX_16_BITS) {
            directoryDataOffset += getDiskOffset(reader, diskNumber);
          }
          if (requiresZip64) {
            const endOfDirectoryLocatorArray = endOfDirectoryInfo.offset >= ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH ? await readUint8Array(reader, endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH) : EMPTY_UINT8_ARRAY;
            const endOfDirectoryLocatorView = getDataView(endOfDirectoryLocatorArray);
            if (endOfDirectoryLocatorArray.length == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH && getUint32(endOfDirectoryLocatorView, 0) == ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE) {
              directoryDataOffset = getDiskOffset(reader, getUint32(endOfDirectoryLocatorView, 4)) + getBigUint64(endOfDirectoryLocatorView, 8);
              let endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH);
              let endOfDirectoryView2 = getDataView(endOfDirectoryArray);
              if (endOfDirectoryArray.length < ZIP64_END_OF_CENTRAL_DIR_LENGTH || getUint32(endOfDirectoryView2, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) {
                const locatorOffset = endOfDirectoryInfo.offset - ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH;
                let expectedDirectoryDataOffset = locatorOffset - ZIP64_END_OF_CENTRAL_DIR_LENGTH;
                if (!await startsWithSignature(reader, expectedDirectoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_SIGNATURE)) {
                  expectedDirectoryDataOffset = await findZip64EndOfDirectoryOffset(reader, locatorOffset);
                }
                if (expectedDirectoryDataOffset !== UNDEFINED_VALUE && expectedDirectoryDataOffset >= 0 && directoryDataOffset != expectedDirectoryDataOffset) {
                  const originalDirectoryDataOffset = directoryDataOffset;
                  directoryDataOffset = expectedDirectoryDataOffset;
                  if (directoryDataOffset > originalDirectoryDataOffset) {
                    prependedDataLength = directoryDataOffset - originalDirectoryDataOffset;
                  }
                  endOfDirectoryArray = await readUint8Array(reader, directoryDataOffset, ZIP64_END_OF_CENTRAL_DIR_LENGTH);
                  endOfDirectoryView2 = getDataView(endOfDirectoryArray);
                }
              }
              if (endOfDirectoryArray.length < ZIP64_END_OF_CENTRAL_DIR_LENGTH || getUint32(endOfDirectoryView2, 0) != ZIP64_END_OF_CENTRAL_DIR_SIGNATURE) {
                throw new Error(ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND);
              }
              zip64EndOfDirectory = true;
              zip64EndOfDirectoryVersion2 = getBigUint64(endOfDirectoryView2, 4) > ZIP64_END_OF_CENTRAL_DIR_LENGTH - 12;
              if (zip64EndOfDirectoryVersion2) {
                const extensibleDataLength = Math.min(
                  getBigUint64(endOfDirectoryView2, 4) - (ZIP64_END_OF_CENTRAL_DIR_LENGTH - 12),
                  reader.size - directoryDataOffset - ZIP64_END_OF_CENTRAL_DIR_LENGTH
                );
                if (extensibleDataLength > 0) {
                  zip64EndOfDirectoryLength += extensibleDataLength;
                  const rawExtensibleData = await readUint8Array(reader, directoryDataOffset + ZIP64_END_OF_CENTRAL_DIR_LENGTH, extensibleDataLength);
                  directoryEncryptionInfo = getDirectoryEncryptionInfo(rawExtensibleData);
                }
              }
              if (lastDiskNumber == MAX_16_BITS) {
                lastDiskNumber = getUint32(endOfDirectoryView2, 16);
              } else if (lastDiskNumber != getUint32(endOfDirectoryView2, 16)) {
                reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
              }
              if (diskNumber == MAX_16_BITS) {
                diskNumber = getUint32(endOfDirectoryView2, 20);
              } else if (diskNumber != getUint32(endOfDirectoryView2, 20)) {
                reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
              }
              if (filesLength == MAX_16_BITS) {
                filesLength = getBigUint64(endOfDirectoryView2, 32);
              } else if (filesLength != getBigUint64(endOfDirectoryView2, 32)) {
                reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
              }
              if (directoryDataLength == MAX_32_BITS) {
                directoryDataLength = getBigUint64(endOfDirectoryView2, 40);
              } else if (directoryDataLength != getBigUint64(endOfDirectoryView2, 40)) {
                reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_ZIP64_END_OF_CENTRAL_DIRECTORY);
              }
              directoryDataOffset = getDiskOffset(reader, diskNumber) + getBigUint64(endOfDirectoryView2, 48) + prependedDataLength;
            } else if (directoryDataOffset == MAX_32_BITS || directoryDataLength == MAX_32_BITS || diskNumber == MAX_16_BITS) {
              throw new Error(ERR_EOCDR_LOCATOR_ZIP64_NOT_FOUND);
            }
          }
          let declaredDirectoryDataLength = directoryDataLength;
          const centralDirectoryEndOffset = endOfDirectoryInfo.offset - (zip64EndOfDirectory ? zip64EndOfDirectoryLength + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH : 0);
          if (expectedLastDiskNumber != lastDiskNumber) {
            throw new Error(ERR_SPLIT_ZIP_FILE);
          }
          if (directoryDataOffset < 0) {
            throw new Error(ERR_BAD_FORMAT);
          }
          let offset = 0;
          let directoryArray = directoryDataOffset < reader.size ? await readUint8Array(reader, directoryDataOffset, directoryDataLength) : EMPTY_UINT8_ARRAY;
          let directoryView = getDataView(directoryArray);
          if (directoryDataLength) {
            let expectedDirectoryDataOffset = centralDirectoryEndOffset - directoryDataLength;
            if (directoryDataOffset != expectedDirectoryDataOffset && diskNumber == lastDiskNumber) {
              const storedPointsAtDirectory = directoryArray.length >= 4 && (getUint32(directoryView, offset) == CENTRAL_FILE_HEADER_SIGNATURE || Boolean(directoryEncryptionInfo && directoryEncryptionInfo.compressedSize) || detectEncryptedCentralDirectory(directoryView));
              if (!storedPointsAtDirectory && expectedDirectoryDataOffset < 0) {
                throw new Error(ERR_BAD_FORMAT);
              }
              let reconcile = !storedPointsAtDirectory;
              if (expectedDirectoryDataOffset >= 0 && expectedDirectoryDataOffset + 4 <= reader.size) {
                let expectedPointsAtDirectory = await pointsAtDirectory(reader, expectedDirectoryDataOffset);
                if (!expectedPointsAtDirectory) {
                  const signatureRecordOffset = await findDigitalSignatureRecordOffset(reader, centralDirectoryEndOffset);
                  const signedDirectoryDataOffset = signatureRecordOffset - directoryDataLength;
                  if (signatureRecordOffset !== UNDEFINED_VALUE && signedDirectoryDataOffset >= 0 && await pointsAtDirectory(reader, signedDirectoryDataOffset)) {
                    expectedDirectoryDataOffset = signedDirectoryDataOffset;
                    expectedPointsAtDirectory = true;
                  }
                }
                if (storedPointsAtDirectory) {
                  reconcile = expectedPointsAtDirectory;
                }
              }
              if (reconcile && expectedDirectoryDataOffset != directoryDataOffset) {
                const originalDirectoryDataOffset = directoryDataOffset;
                directoryDataOffset = expectedDirectoryDataOffset;
                directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength);
                directoryView = getDataView(directoryArray);
                const offsetDelta = directoryDataOffset - originalDirectoryDataOffset;
                const { localHeaderFound, shiftedLocalHeaderFound } = await probeLocalHeaders(reader, directoryArray, directoryView, offsetDelta);
                if (offsetDelta > 0 && !(localHeaderFound && !shiftedLocalHeaderFound)) {
                  prependedDataLength += offsetDelta;
                  prependedCentralDirectory = storedPointsAtDirectory;
                } else {
                  reportAmbiguity(checkAmbiguity, warnings, WARNING_MISMATCHED_CENTRAL_DIRECTORY_OFFSET);
                  if (offsetDelta < 0 && !localHeaderFound && shiftedLocalHeaderFound) {
                    prependedDataLength += offsetDelta;
                  }
                }
              }
            }
            if (directoryArray.length < 4) {
              throw new Error(ERR_BAD_FORMAT);
            }
          } else if (!filesLength && directoryDataOffset < centralDirectoryEndOffset && diskNumber == lastDiskNumber) {
            prependedDataLength += centralDirectoryEndOffset - directoryDataOffset;
            directoryDataOffset = centralDirectoryEndOffset;
          }
          const expectedDirectoryDataLength = centralDirectoryEndOffset - directoryDataOffset;
          if (directoryDataLength != expectedDirectoryDataLength && expectedDirectoryDataLength >= 0 && diskNumber == lastDiskNumber) {
            directoryDataLength = expectedDirectoryDataLength;
            directoryArray = await readUint8Array(reader, directoryDataOffset, directoryDataLength);
            directoryView = getDataView(directoryArray);
          }
          if (directoryDataOffset < 0 || directoryDataOffset >= reader.size) {
            throw new Error(ERR_BAD_FORMAT);
          }
          zipReader.directoryOffset = directoryDataOffset;
          zipReader.directoryLength = declaredDirectoryDataLength;
          const decryptCentralDirectory = getFunctionOptionValue(zipReader, options, OPTION_DECRYPT_CENTRAL_DIRECTORY);
          let decryptedDirectory, dataAfterEncryptedDirectory;
          if (decryptCentralDirectory && filesLength && directoryArray.length >= 4 && getUint32(directoryView, 0) != CENTRAL_FILE_HEADER_SIGNATURE && (zip64EndOfDirectoryVersion2 || detectEncryptedCentralDirectory(directoryView))) {
            const encryptedDirectoryDataLength = getEncryptedDirectoryDataLength(directoryEncryptionInfo, declaredDirectoryDataLength, directoryArray.length);
            dataAfterEncryptedDirectory = directoryArray.subarray(encryptedDirectoryDataLength);
            directoryArray = await decryptCentralDirectory(directoryArray.subarray(0, encryptedDirectoryDataLength), directoryEncryptionInfo);
            directoryView = getDataView(directoryArray);
            declaredDirectoryDataLength = directoryArray.length;
            decryptedDirectory = true;
          }
          if (directoryEncryptionInfo && !decryptedDirectory && (directoryArray.length < 4 || getUint32(directoryView, 0) == CENTRAL_FILE_HEADER_SIGNATURE)) {
            addWarning(warnings, WARNING_UNKNOWN_ZIP64_EXTENSIBLE_DATA);
          }
          startOffset = directoryDataOffset;
          const filenameEncoding = getOptionValue(zipReader, options, OPTION_FILENAME_ENCODING);
          const commentEncoding = getOptionValue(zipReader, options, OPTION_COMMENT_ENCODING);
          const filenames = /* @__PURE__ */ new Set();
          let duplicateFilename;
          let previousEntryPosition = -Infinity;
          const recoverWrappedFilesLength = !checkAmbiguity && !zip64EndOfDirectory;
          if (!filesLength && recoverWrappedFilesLength) {
            filesLength = getWrappedFilesLength(directoryView, directoryArray, offset);
            if (filesLength) {
              addWarning(warnings, WARNING_WRAPPED_ENTRIES_COUNT);
            }
          }
          const entryOptions = Object.assign({}, zipReader.options, options, { [OPTION_STRICTNESS]: strictness });
          delete entryOptions[OPTION_CHECK_AMBIGUITY];
          for (let indexFile = 0; indexFile < filesLength; indexFile++) {
            const fileEntry = new ZipEntry(reader, entryOptions);
            if (offset + CENTRAL_FILE_HEADER_LENGTH > directoryArray.length || getUint32(directoryView, offset) != CENTRAL_FILE_HEADER_SIGNATURE) {
              if (indexFile == 0 && !decryptedDirectory && (zip64EndOfDirectoryVersion2 || detectEncryptedCentralDirectory(directoryView))) {
                throw new Error(ERR_ENCRYPTED_CENTRAL_DIRECTORY);
              }
              throw new Error(ERR_CENTRAL_DIRECTORY_NOT_FOUND);
            }
            readCommonHeader(fileEntry, directoryView, offset + 6);
            const languageEncodingFlag = Boolean(fileEntry.bitFlag.languageEncodingFlag);
            const filenameOffset = offset + CENTRAL_FILE_HEADER_LENGTH;
            const extraFieldOffset = filenameOffset + fileEntry.filenameLength;
            const commentOffset2 = extraFieldOffset + fileEntry.extraFieldLength;
            const versionMadeBy = getUint16(directoryView, offset + 4);
            const msDosCompatible = versionMadeBy >> 8 == 0;
            const unixCompatible = versionMadeBy >> 8 == 3;
            const commentLength2 = getUint16(directoryView, offset + 32);
            const endOffset = commentOffset2 + commentLength2;
            const rawEntryData = new Uint8Array(directoryArray.subarray(filenameOffset, endOffset));
            const rawFilename = rawEntryData.subarray(0, fileEntry.filenameLength);
            const rawComment = rawEntryData.subarray(fileEntry.filenameLength + fileEntry.extraFieldLength);
            const filenameUTF8 = languageEncodingFlag || !filenameEncoding && isUTF8Text(rawFilename);
            const commentUTF8 = languageEncodingFlag || !commentEncoding && isUTF8Text(rawComment);
            const externalFileAttributes = getUint32(directoryView, offset + 38);
            const msdosAttributesRaw = externalFileAttributes & MAX_8_BITS;
            const msdosAttributes = {
              readOnly: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_READONLY_MASK),
              hidden: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_HIDDEN_MASK),
              system: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_SYSTEM_MASK),
              directory: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_DIR_MASK),
              archive: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_ARCHIVE_MASK)
            };
            const offsetFileEntry = getUint32(directoryView, offset + 42);
            const decode2 = getFunctionOptionValue(zipReader, options, OPTION_DECODE_TEXT) || decodeText;
            const rawFilenameEncoding = filenameUTF8 ? CHARSET_UTF8 : filenameEncoding || CHARSET_CP437;
            const rawCommentEncoding = commentUTF8 ? CHARSET_UTF8 : commentEncoding || CHARSET_CP437;
            let filename = decode2(rawFilename, rawFilenameEncoding, TEXT_TYPE_FILENAME);
            if (filename === UNDEFINED_VALUE) {
              filename = decodeText(rawFilename, rawFilenameEncoding);
            }
            let comment = decode2(rawComment, rawCommentEncoding, TEXT_TYPE_COMMENT);
            if (comment === UNDEFINED_VALUE) {
              comment = decodeText(rawComment, rawCommentEncoding);
            }
            Object.assign(fileEntry, {
              index: indexFile,
              decryptedDirectory,
              versionMadeBy,
              msDosCompatible,
              zip64: false,
              compressedSize: 0,
              uncompressedSize: 0,
              commentLength: commentLength2,
              offset: offsetFileEntry,
              diskNumberStart: getUint16(directoryView, offset + 34),
              internalFileAttributes: getUint16(directoryView, offset + 36),
              externalFileAttributes,
              msdosAttributesRaw,
              msdosAttributes,
              rawFilename,
              filenameUTF8,
              commentUTF8,
              rawExtraField: rawEntryData.subarray(fileEntry.filenameLength, fileEntry.filenameLength + fileEntry.extraFieldLength),
              rawComment,
              filename,
              comment
            });
            let malformedExtraField;
            try {
              malformedExtraField = readCommonFooter(fileEntry, fileEntry, directoryView, offset + 6);
            } catch (error) {
              if (checkAmbiguity || error.message != ERR_EXTRAFIELD_ZIP64_NOT_FOUND) {
                throw error;
              }
              fileEntry.zip64ExtraFieldMissing = true;
              addWarning(warnings, WARNING_MISSING_ZIP64_EXTRA_FIELD, fileEntry.filename);
            }
            filename = fileEntry.filename;
            if (normalizeFilename) {
              const normalizedFilename = normalizeFilename(filename);
              if (normalizedFilename !== UNDEFINED_VALUE) {
                filename = fileEntry.filename = normalizedFilename;
              }
            }
            if (isUnsafeFilename(filename, filenameValidation)) {
              const error = new Error(ERR_UNSAFE_FILENAME);
              error.filename = filename;
              throw error;
            }
            if (malformedExtraField) {
              addWarning(warnings, WARNING_MALFORMED_EXTRA_FIELD, filename);
            }
            if (fileEntry.zip64ExtraFieldMissing && fileEntry.offset == MAX_32_BITS) {
              startOffset = 0;
            } else {
              fileEntry.offset += prependedDataLength;
              const entryPosition = getDiskOffset(reader, fileEntry.diskNumberStart) + fileEntry.offset;
              startOffset = Math.min(entryPosition, startOffset);
              if (entryPosition < previousEntryPosition) {
                addWarning(warnings, WARNING_UNSORTED_CENTRAL_DIRECTORY, filename);
              }
              previousEntryPosition = entryPosition;
            }
            if ((fileEntry.version & MAX_8_BITS) > MAX_KNOWN_VERSION) {
              addWarning(warnings, WARNING_UNKNOWN_VERSION, filename);
            }
            if ((fileEntry.rawBitFlag & BITFLAG_COMPRESSED_PATCHED_DATA) == BITFLAG_COMPRESSED_PATCHED_DATA) {
              addWarning(warnings, WARNING_COMPRESSED_PATCHED_DATA, filename);
            }
            if (filenames.has(fileEntry.filename)) {
              duplicateFilename = true;
            }
            filenames.add(fileEntry.filename);
            const unixExternalUpper = fileEntry.externalFileAttributes >> 16 & MAX_16_BITS;
            if (fileEntry.unixMode === UNDEFINED_VALUE && (unixExternalUpper & (FILE_ATTR_UNIX_DEFAULT_MASK | FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_TYPE_DIR)) != 0) {
              fileEntry.unixMode = unixExternalUpper;
            }
            const setuid = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_SETUID_MASK);
            const setgid = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_SETGID_MASK);
            const sticky = Boolean(fileEntry.unixMode & FILE_ATTR_UNIX_STICKY_MASK);
            const unixType = fileEntry.unixMode === UNDEFINED_VALUE ? unixExternalUpper : fileEntry.unixMode;
            const symlink = (unixType & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_SYMLINK;
            const modeIsDir = fileEntry.unixMode !== UNDEFINED_VALUE && (fileEntry.unixMode & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_DIR;
            const upperIsDir = (unixExternalUpper & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_DIR;
            const directory = modeIsDir || upperIsDir || msDosCompatible && msdosAttributes.directory || fileEntry.filename.endsWith(DIRECTORY_SIGNATURE);
            const executable = !symlink && !directory && (fileEntry.unixMode !== UNDEFINED_VALUE ? (fileEntry.unixMode & FILE_ATTR_UNIX_EXECUTABLE_MASK) != 0 : unixCompatible && (unixExternalUpper & FILE_ATTR_UNIX_EXECUTABLE_MASK) != 0);
            Object.assign(fileEntry, {
              setuid,
              setgid,
              sticky,
              symlink,
              unixExternalUpper,
              executable,
              directory,
              zipCrypto: fileEntry.encrypted && !fileEntry.extraFieldAES
            });
            const entry = new Entry(fileEntry);
            if (fileEntry.zip64ExtraFieldMissing) {
              zipReader.entriesMissingZip64ExtraField.add(entry);
            }
            entry.getData = (writer, options2) => fileEntry.getData(writer, entry, zipReader, options2);
            entry.arrayBuffer = async (options2) => {
              const writer = new TransformStream();
              const arrayBufferPromise = streamToBlob(writer.readable).then((blob) => blob.arrayBuffer());
              arrayBufferPromise.catch(() => {
              });
              await fileEntry.getData(
                writer,
                entry,
                zipReader,
                Object.assign({}, options2, { preventClose: false })
              );
              return arrayBufferPromise;
            };
            offset = endOffset;
            if (indexFile == filesLength - 1 && recoverWrappedFilesLength) {
              const wrappedFilesLength = getWrappedFilesLength(directoryView, directoryArray, offset);
              if (wrappedFilesLength) {
                filesLength += wrappedFilesLength;
                addWarning(warnings, WARNING_WRAPPED_ENTRIES_COUNT);
              }
            }
            const { onprogress } = options;
            if (onprogress) {
              try {
                await onprogress(indexFile + 1, filesLength, new Entry(fileEntry));
              } catch {
              }
            }
            yield entry;
          }
          let offsetAfterSignature = offset;
          let digitalSignature = readDigitalSignature(directoryArray.subarray(offset)) || (decryptedDirectory ? readDigitalSignature(dataAfterEncryptedDirectory) : UNDEFINED_VALUE);
          if (!digitalSignature && !decryptedDirectory) {
            const signatureRecordOffset = directoryDataOffset + offset;
            const signatureRecordLength = Math.min(centralDirectoryEndOffset - signatureRecordOffset, 6 + MAX_16_BITS);
            if (signatureRecordLength >= 6) {
              digitalSignature = readDigitalSignature(await readUint8Array(reader, signatureRecordOffset, signatureRecordLength));
            }
          }
          if (digitalSignature) {
            zipReader.digitalSignature = digitalSignature;
            offsetAfterSignature = offset + 6 + digitalSignature.length;
          }
          if (offset != declaredDirectoryDataLength && offsetAfterSignature != declaredDirectoryDataLength || !decryptedDirectory && offset != directoryDataLength && offsetAfterSignature != directoryDataLength) {
            reportAmbiguity(checkAmbiguity, warnings, WARNING_TRAILING_CENTRAL_DIRECTORY_DATA);
          }
          if (duplicateFilename) {
            reportAmbiguity(checkAmbiguity, warnings, WARNING_DUPLICATE_FILENAME);
          }
          const extractPrependedData = getOptionValue(zipReader, options, OPTION_EXTRACT_PREPENDED_DATA);
          const extractAppendedData = getOptionValue(zipReader, options, OPTION_EXTRACT_APPENDED_DATA);
          const splitZipSignatureLength = (checkAmbiguity || extractPrependedData) && filesLength && startOffset == SPLIT_ZIP_FILE_SIGNATURE_LENGTH && await startsWithSplitZipMarker(reader) ? SPLIT_ZIP_FILE_SIGNATURE_LENGTH : 0;
          if (checkAmbiguity && (prependedDataLength > 0 || filesLength && startOffset > splitZipSignatureLength)) {
            throwAmbiguousArchive(WARNING_PREPENDED_DATA);
          }
          if (prependedDataLength > 0 || filesLength && startOffset > SPLIT_ZIP_FILE_SIGNATURE_LENGTH) {
            addWarning(warnings, WARNING_PREPENDED_DATA);
          }
          if (prependedCentralDirectory) {
            addWarning(warnings, WARNING_PREPENDED_CENTRAL_DIRECTORY);
          }
          if (extractPrependedData) {
            zipReader.prependedData = startOffset > splitZipSignatureLength ? await readUint8Array(reader, splitZipSignatureLength, startOffset - splitZipSignatureLength) : EMPTY_UINT8_ARRAY;
          }
          zipReader.comment = commentLength ? await readUint8Array(reader, commentOffset + END_OF_CENTRAL_DIR_LENGTH, commentLength) : EMPTY_UINT8_ARRAY;
          if (extractAppendedData) {
            zipReader.appendedData = appendedDataOffset < reader.size ? await readUint8Array(reader, appendedDataOffset, reader.size - appendedDataOffset) : EMPTY_UINT8_ARRAY;
          }
          return true;
        }
        async getEntries(options = {}) {
          const entries = [];
          for await (const entry of this.getEntriesGenerator(options)) {
            entries.push(entry);
          }
          return entries;
        }
        async close() {
          const { reader } = this;
          if (!reader.readUint8Array && reader.readable && !reader.readable.locked) {
            await reader.readable.cancel();
          }
        }
        [SYMBOL_ASYNC_DISPOSE]() {
          return this.close();
        }
      };
      ZipReaderStream = class {
        constructor(options = {}) {
          let sourceController;
          const { readable, writable } = new TransformStream({
            start(controller) {
              sourceController = controller;
            }
          });
          const zipReader = new ZipReader(readable, options);
          const gen = zipReader.getEntriesGenerator();
          const pendingEntries2 = /* @__PURE__ */ new Set();
          this.readable = new ReadableStream({
            async pull(controller) {
              const { done, value } = await gen.next();
              if (done)
                return controller.close();
              const entryStream = createEntryStream(value, pendingEntries2);
              const chunk = {
                ...value,
                readable: entryStream.readable
              };
              delete chunk.getData;
              Object.defineProperties(chunk, {
                localDirectory: {
                  get: () => value.localDirectory,
                  enumerable: true
                },
                warnings: {
                  get: () => value.warnings,
                  enumerable: true
                }
              });
              controller.enqueue(chunk);
            },
            async cancel(reason) {
              const entryStreams = Array.from(pendingEntries2);
              pendingEntries2.clear();
              sourceController.error(reason);
              await Promise.allSettled(entryStreams.map((entryStream) => entryStream.cancel(reason)));
              await Promise.allSettled([gen.return(), zipReader.close()]);
            }
          });
          this.writable = writable;
        }
      };
      ZipEntry = class {
        constructor(reader, options) {
          Object.assign(this, {
            reader,
            options
          });
        }
        async getData(writer, fileEntry, zipReader, options = {}) {
          const zipEntry = this;
          const { readRanges, directoryOffset } = zipReader;
          if (zipEntry.zip64ExtraFieldMissing) {
            throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
          }
          const config2 = getConfiguration();
          const {
            reader,
            index,
            offset,
            diskNumberStart,
            extraFieldAES,
            extraFieldZip64,
            compressionMethod,
            bitFlag,
            rawBitFlag,
            crc32,
            rawLastModDate,
            uncompressedSize,
            compressedSize
          } = zipEntry;
          const {
            dataDescriptor
          } = bitFlag;
          const localDirectory = fileEntry.localDirectory = {};
          const warnings = fileEntry.warnings = [];
          const localHeaderOffset = getDiskOffset(reader, diskNumberStart) + offset;
          const dataArray = await readUint8Array(reader, localHeaderOffset, HEADER_SIZE);
          const dataView = getDataView(dataArray);
          let password = getOptionValue(zipEntry, options, OPTION_PASSWORD);
          let rawPassword = getOptionValue(zipEntry, options, OPTION_RAW_PASSWORD);
          const passThrough = checkPassThroughOption(getOptionValue(zipEntry, options, OPTION_PASS_THROUGH));
          const passThroughCompression = Boolean(passThrough);
          const passThroughEncryption = passThrough === true;
          checkPasswordOption(password, rawPassword);
          password = password && password.length ? password : UNDEFINED_VALUE;
          rawPassword = rawPassword && rawPassword.length ? rawPassword : UNDEFINED_VALUE;
          if (extraFieldAES) {
            if (extraFieldAES.originalCompressionMethod != COMPRESSION_METHOD_AES) {
              throw new Error(ERR_UNSUPPORTED_COMPRESSION);
            }
          }
          if (dataArray.length < HEADER_SIZE || getUint32(dataView, 0) != LOCAL_FILE_HEADER_SIGNATURE) {
            throw new Error(ERR_LOCAL_FILE_HEADER_NOT_FOUND);
          }
          readCommonHeader(localDirectory, dataView, 4);
          const {
            extraFieldLength,
            filenameLength
          } = localDirectory;
          const dataOffset = localDirectory.dataOffset = localHeaderOffset + HEADER_SIZE + filenameLength + extraFieldLength;
          const checkLocalDirectoryOption = getOptionValue(zipEntry, options, OPTION_CHECK_LOCAL_DIRECTORY);
          const entryStrictness = getStrictness(options, zipEntry.options);
          const checkLocalDirectory = getCheckLocalDirectory(checkLocalDirectoryOption, entryStrictness);
          const checkLocalFilenameOption = getOptionValue(zipEntry, options, OPTION_CHECK_LOCAL_FILENAME);
          const checkLocalFilename = getCheckLocalFilename(
            checkLocalFilenameOption === UNDEFINED_VALUE ? checkLocalDirectoryOption : checkLocalFilenameOption,
            entryStrictness
          );
          let rawLocalFilename = EMPTY_UINT8_ARRAY;
          if (checkLocalFilename && (filenameLength || extraFieldLength)) {
            const trailingDataArray = await readUint8Array(reader, localHeaderOffset + HEADER_SIZE, filenameLength + extraFieldLength);
            rawLocalFilename = trailingDataArray.subarray(0, filenameLength);
            localDirectory.rawExtraField = trailingDataArray.subarray(filenameLength);
          } else {
            localDirectory.rawExtraField = extraFieldLength ? await readUint8Array(reader, localHeaderOffset + HEADER_SIZE + filenameLength, extraFieldLength) : EMPTY_UINT8_ARRAY;
          }
          if (checkLocalFilename) {
            localDirectory.rawFilename = rawLocalFilename;
          }
          if (readCommonFooter(zipEntry, localDirectory, dataView, 4, true)) {
            addWarning(warnings, WARNING_MALFORMED_EXTRA_FIELD);
          }
          validateLocalDirectory(zipEntry, localDirectory, rawLocalFilename, checkLocalFilename, checkLocalDirectory ? UNDEFINED_VALUE : warnings);
          const { lastAccessDate, creationDate, uid, gid } = localDirectory;
          if (lastAccessDate && fileEntry.lastAccessDate === UNDEFINED_VALUE) {
            fileEntry.lastAccessDate = lastAccessDate;
          }
          if (creationDate && fileEntry.creationDate === UNDEFINED_VALUE) {
            fileEntry.creationDate = creationDate;
          }
          if (uid !== UNDEFINED_VALUE && fileEntry.uid === UNDEFINED_VALUE) {
            fileEntry.uid = uid;
          }
          if (gid !== UNDEFINED_VALUE && fileEntry.gid === UNDEFINED_VALUE) {
            fileEntry.gid = gid;
          }
          const checkPasswordOnly = getOptionValue(zipEntry, options, OPTION_CHECK_PASSWORD_ONLY);
          const encrypted = zipEntry.encrypted && (!passThroughEncryption || checkPasswordOnly);
          const zipCrypto = encrypted && !extraFieldAES;
          if (!passThroughEncryption) {
            fileEntry.zipCrypto = zipCrypto;
          }
          if (encrypted && (zipEntry.rawBitFlag & BITFLAG_STRONG_ENCRYPTION) == BITFLAG_STRONG_ENCRYPTION) {
            throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
          }
          const registeredCodec = passThroughCompression ? UNDEFINED_VALUE : getRegisteredCodec(compressionMethod);
          if (compressionMethod != COMPRESSION_METHOD_STORE && compressionMethod != COMPRESSION_METHOD_DEFLATE && compressionMethod != COMPRESSION_METHOD_DEFLATE_64 && !registeredCodec && !passThroughCompression) {
            throw new Error(ERR_UNSUPPORTED_COMPRESSION);
          }
          if (encrypted) {
            if (!zipCrypto && (extraFieldAES.strength < 1 || extraFieldAES.strength > 3)) {
              throw new Error(ERR_UNSUPPORTED_ENCRYPTION);
            } else if (!password && !rawPassword) {
              throw new Error(ERR_ENCRYPTED);
            }
          }
          if (dataOffset + compressedSize > Math.min(reader.size, directoryOffset)) {
            throw new Error(ERR_ENTRY_DATA_OUT_OF_BOUNDS);
          }
          const size = compressedSize;
          const signal = checkSignalOption(getOptionValue(zipEntry, options, OPTION_SIGNAL));
          throwIfAborted(signal);
          let checkOverlappingEntry = getOptionValue(zipEntry, options, OPTION_CHECK_OVERLAPPING_ENTRY);
          const checkOverlappingEntryOnly = getOptionValue(zipEntry, options, OPTION_CHECK_OVERLAPPING_ENTRY_ONLY);
          if (checkOverlappingEntryOnly) {
            checkOverlappingEntry = true;
          }
          const { onstart, onprogress, onend } = options;
          const compressed = compressionMethod != COMPRESSION_METHOD_STORE && !passThroughCompression;
          const outputSize = passThroughCompression ? compressedSize - getEncryptionOverhead(encrypted, zipCrypto, extraFieldAES && extraFieldAES.strength) : uncompressedSize;
          const deflate64 = compressionMethod == COMPRESSION_METHOD_DEFLATE_64;
          let useCompressionStream = getOptionValue(zipEntry, options, OPTION_USE_COMPRESSION_STREAM);
          if (deflate64) {
            useCompressionStream = false;
          }
          const checkCrc32Option = getOptionValue(zipEntry, options, OPTION_CHECK_CRC32);
          const checkCrc32 = (checkCrc32Option === UNDEFINED_VALUE ? getOptionValue(zipEntry, options, OPTION_CHECK_SIGNATURE) : checkCrc32Option) && !passThroughCompression && (!encrypted || zipCrypto || extraFieldAES && extraFieldAES.vendorVersion == VENDOR_VERSION_AE_1);
          const workerOptions = {
            options: {
              codecType: CODEC_INFLATE,
              password,
              rawPassword,
              zipCrypto,
              encryptionStrength: extraFieldAES && extraFieldAES.strength,
              checkCrc32,
              checkAuthenticationCode: getOptionValue(zipEntry, options, OPTION_CHECK_AUTHENTICATION_CODE),
              passwordVerification: zipCrypto && (dataDescriptor ? rawLastModDate >>> 8 & MAX_8_BITS : crc32 >>> 24 & MAX_8_BITS),
              outputSize,
              crc32,
              compressed,
              encrypted,
              useWebWorkers: getOptionValue(zipEntry, options, OPTION_USE_WEB_WORKERS),
              useCompressionStream,
              deflate64,
              format: registeredCodec ? registeredCodec.format : UNDEFINED_VALUE,
              codecURI: registeredCodec ? registeredCodec.codecURI : UNDEFINED_VALUE,
              compressionMethod,
              rawBitFlag,
              checkPasswordOnly
            },
            config: config2,
            streamOptions: { signal, size, onstart, onprogress, onend }
          };
          if (checkOverlappingEntry) {
            await detectOverlappingEntry({
              reader,
              fileEntry,
              index,
              offset: localHeaderOffset,
              crc32,
              compressedSize,
              uncompressedSize,
              dataOffset,
              dataDescriptor: dataDescriptor || localDirectory.bitFlag.dataDescriptor,
              extraFieldZip64: extraFieldZip64 || localDirectory.extraFieldZip64,
              readRanges
            });
            validateDataDescriptor(zipEntry, localDirectory, checkLocalDirectory ? UNDEFINED_VALUE : warnings);
          }
          let writable, abortError, aborted;
          try {
            if (!checkOverlappingEntryOnly) {
              if (checkPasswordOnly) {
                writer = new WritableStream();
              }
              writer = new GenericWriter(writer);
              await initStream(writer, getDecodableOutputSize(outputSize, compressedSize, compressed));
              ({ writable } = writer);
              const readable = toCompatibleReadable(reader.createReadable({ offset: dataOffset, size }));
              const { outputSize: writtenSize } = await runWorker2({ readable, writable }, workerOptions);
              throwIfAborted(signal);
              if (writtenSize != outputSize) {
                throw Object.assign(new Error(ERR_INVALID_UNCOMPRESSED_SIZE), { outputSize: writtenSize });
              }
              writer.size += writtenSize;
            }
          } catch (error) {
            if (isErrorObject(error) && error.outputSize !== UNDEFINED_VALUE) {
              writer.size += error.outputSize;
            }
            if (!checkPasswordOnly || !isErrorObject(error) || error.message != ERR_ABORT_CHECK_PASSWORD) {
              abortError = error;
              aborted = true;
              throw error;
            }
          } finally {
            const preventClose = !ownsWritable(writer) && getOptionValue(zipEntry, options, OPTION_PREVENT_CLOSE);
            if (!preventClose && writable && !writable.locked) {
              const writableWriter = writable.getWriter();
              if (aborted) {
                try {
                  await writableWriter.abort(abortError);
                } catch {
                }
              } else {
                await writableWriter.close();
              }
            }
          }
          return checkPasswordOnly || checkOverlappingEntryOnly ? UNDEFINED_VALUE : writer.getData ? writer.getData() : writable;
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/zip-core-reader.js
  var init_zip_core_reader = __esm({
    "node_modules/@zip.js/zip.js/lib/zip-core-reader.js"() {
      init_codec_worker_web();
      init_zip_reader();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/zip-writer.js
  async function closeArchive(zipWriter, comment, options) {
    const { pendingAddFileCalls, writer } = zipWriter;
    const { writable } = writer;
    if (!(comment instanceof Uint8Array)) {
      throw new Error(ERR_INVALID_COMMENT_TYPE);
    }
    if (getLength(comment) > MAX_16_BITS) {
      throw new Error(ERR_INVALID_COMMENT);
    }
    while (pendingAddFileCalls.size) {
      await Promise.allSettled(Array.from(pendingAddFileCalls));
    }
    await Promise.allSettled(zipWriter.pendingErrors.map((watcher) => watcher.recorded));
    const unobservedWatchers = zipWriter.pendingErrors.filter((watcher) => watcher.failed && !watcher.observed);
    if (unobservedWatchers.length) {
      const unobservedErrors = unobservedWatchers.map((watcher) => watcher.error);
      unobservedWatchers.forEach((watcher) => watcher.observed = true);
      const [error] = unobservedErrors;
      try {
        error.entryErrors = unobservedErrors;
      } catch {
      }
      throw error;
    }
    await closeFile(zipWriter, comment, options);
    zipWriter.archiveClosed = true;
    const preventClose = !ownsWritable(writer) && getOptionValue2(zipWriter, options, OPTION_PREVENT_CLOSE);
    if (!preventClose) {
      await writable.getWriter().close();
    }
    return getWriterData(writer);
  }
  function getWriterData(writer) {
    return writer.getData ? writer.getData() : writer.writable;
  }
  function watchPromiseError(zipWriter, promise) {
    const watchedPromise = new WatchedPromise((resolve, reject) => Promise.prototype.then.call(promise, resolve, reject));
    const watcher = {};
    watchedPromise.watcher = watcher;
    watcher.recorded = Promise.prototype.then.call(
      watchedPromise,
      UNDEFINED_VALUE,
      (error) => Object.assign(watcher, { failed: true, error })
    );
    zipWriter.pendingErrors.push(watcher);
    return watchedPromise;
  }
  async function appendZipEntries(zipWriter, reader, options = {}) {
    const { pendingAddFileCalls, filenames, fileEntries } = zipWriter;
    const filter = checkFunctionOption(options.filter);
    const readerOptions = checkReaderOptionsObject(options.readerOptions);
    while (pendingAddFileCalls.size) {
      await Promise.allSettled(Array.from(pendingAddFileCalls));
    }
    let resolveAppendZip;
    const promiseAppendZip = new Promise((resolve) => resolveAppendZip = resolve);
    pendingAddFileCalls.add(promiseAppendZip);
    const appendedFilenames = [];
    let releaseLockWriter;
    try {
      reader = new GenericReader(reader);
      await initStream(reader);
      if (reader.size === UNDEFINED_VALUE || !reader.readUint8Array) {
        reader = new BlobReader(await streamToBlob(reader.readable));
        await initStream(reader);
      }
      const { ZipReader: ZipReader2, getEntryDataDescriptorLength: getEntryDataDescriptorLength2 } = await Promise.resolve().then(() => (init_zip_reader(), zip_reader_exports));
      const zipReader = new ZipReader2(reader, readerOptions);
      const keptEntries = [];
      let entries;
      try {
        entries = await zipReader.getEntries();
        for (const entry of entries) {
          if (!filter || await filter(entry, getExistingEntry(fileEntries, entry.filename))) {
            keptEntries.push(entry);
          }
        }
      } finally {
        await zipReader.close();
      }
      await initStream(zipWriter.writer);
      const { directoryOffset, entriesMissingZip64ExtraField } = zipReader;
      keptEntries.forEach((entry) => {
        const { filename } = entry;
        if (entriesMissingZip64ExtraField.has(entry)) {
          throw new Error(ERR_EXTRAFIELD_ZIP64_NOT_FOUND);
        }
        if (filenames.has(filename)) {
          throw new Error(ERR_DUPLICATED_NAME);
        }
        filenames.add(filename);
        appendedFilenames.push(filename);
      });
      zipWriter.writerLocked = true;
      const { lockWriter } = zipWriter;
      zipWriter.lockWriter = new Promise((resolve) => releaseLockWriter = () => {
        zipWriter.writerLocked = false;
        resolve();
      });
      await lockWriter;
      if (zipWriter.addSplitZipSignature) {
        delete zipWriter.addSplitZipSignature;
        if (filter || !await startsWithSplitZipSignature2(reader)) {
          await writeData(zipWriter.writer, getSplitZipSignatureArray());
          zipWriter.offset += SPLIT_ZIP_FILE_SIGNATURE_LENGTH;
        }
      }
      const entryPositions = await copyZipData(zipWriter, reader, entries, keptEntries, directoryOffset, Boolean(filter), getEntryDataDescriptorLength2);
      keptEntries.forEach((entry) => {
        const {
          version,
          rawLastModDate,
          rawFilename,
          rawBitFlag,
          uncompressedSize,
          compressedSize,
          extraFieldZip64
        } = entry;
        let {
          compressionMethod,
          rawExtraField
        } = entry;
        rawExtraField = removeExtraFieldZip64(rawExtraField || EMPTY_UINT8_ARRAY);
        if (entry.extraFieldAES) {
          compressionMethod = COMPRESSION_METHOD_AES;
        }
        const extraFieldLength = getLength(rawExtraField);
        const zip64UncompressedSize = Boolean(extraFieldZip64) && extraFieldZip64.uncompressedSize !== UNDEFINED_VALUE;
        const zip64CompressedSize = Boolean(extraFieldZip64) && extraFieldZip64.compressedSize !== UNDEFINED_VALUE;
        const {
          headerArray,
          headerView
        } = getHeaderArrayData({
          version,
          bitFlag: rawBitFlag,
          compressionMethod,
          uncompressedSize,
          compressedSize,
          rawLastModDate,
          rawFilename,
          zip64CompressedSize,
          zip64UncompressedSize,
          extraFieldLength
        });
        const { crc32 } = entry;
        if (crc32 !== UNDEFINED_VALUE) {
          setUint32(headerView, HEADER_OFFSET_SIGNATURE, crc32);
        }
        const { offset, diskNumberStart } = entryPositions.get(entry);
        fileEntries.set(entry.filename, Object.assign({}, entry, {
          zip64Enabled: true,
          zip64UncompressedSize,
          zip64CompressedSize,
          offset,
          diskNumberStart,
          zip64DiskNumberStart: false,
          rawExtraFieldZip64: EMPTY_UINT8_ARRAY,
          rawExtraFieldAES: EMPTY_UINT8_ARRAY,
          rawExtraFieldExtendedTimestamp: EMPTY_UINT8_ARRAY,
          rawExtraFieldNTFS: EMPTY_UINT8_ARRAY,
          rawExtraFieldUnix: EMPTY_UINT8_ARRAY,
          rawCentralExtraFieldUnix: EMPTY_UINT8_ARRAY,
          rawExtraField,
          rawCentralExtraField: EMPTY_UINT8_ARRAY,
          headerArray,
          headerView
        }));
      });
    } catch (error) {
      appendedFilenames.forEach((filename) => filenames.delete(filename));
      throw error;
    } finally {
      resolveAppendZip();
      pendingAddFileCalls.delete(promiseAppendZip);
      if (releaseLockWriter) {
        releaseLockWriter();
      }
    }
  }
  function getExistingEntry(fileEntries, filename) {
    const fileEntry = fileEntries.get(filename);
    return fileEntry ? new Entry(fileEntry) : UNDEFINED_VALUE;
  }
  async function prependZipEntries(zipWriter, reader) {
    if (zipWriter.filenames.size) {
      throw new Error(ERR_ZIP_NOT_EMPTY);
    }
    await appendZipEntries(zipWriter, reader);
  }
  async function addFileEntry(zipWriter, name, reader, options) {
    options = Object.assign({}, options);
    const entry = options[OPTION_ENTRY];
    if (entry !== UNDEFINED_VALUE) {
      const { entryOptions, passThroughOptions } = getSourceEntryOptions(
        entry,
        checkPassThroughOption(getOptionValue2(zipWriter, options, OPTION_PASS_THROUGH)),
        getOptionValue2(zipWriter, options, PROPERTY_NAME_LAST_MODIFICATION_DATE)
      );
      delete options[OPTION_ENTRY];
      options = Object.assign(entryOptions, passThroughOptions, options);
    }
    if (getOptionValue2(zipWriter, options, PROPERTY_NAME_DIRECTORY) && !name.endsWith(DIRECTORY_SIGNATURE)) {
      name += DIRECTORY_SIGNATURE;
    }
    if (zipWriter.filenames.has(name)) {
      throw new Error(ERR_DUPLICATED_NAME);
    }
    zipWriter.filenames.add(name);
    if (workers < getConfiguration().maxWorkers) {
      workers++;
    } else {
      await new Promise((resolve) => pendingEntries.push(resolve));
    }
    try {
      return await addFile(zipWriter, name, reader, options);
    } catch (error) {
      zipWriter.filenames.delete(name);
      throw error;
    } finally {
      const pendingEntry = pendingEntries.shift();
      if (pendingEntry) {
        pendingEntry();
      } else {
        workers--;
      }
    }
  }
  async function addFile(zipWriter, name, reader, options) {
    const attributesInfo = resolveAttributes(zipWriter, name, options);
    ({ name } = attributesInfo);
    const metadataInfo = resolveMetadata(zipWriter, name, options);
    const { comment } = metadataInfo;
    const extraField = options[PROPERTY_NAME_EXTRA_FIELD];
    zipWriter.fileEntries.set(name, UNDEFINED_VALUE);
    const previousFileEntry = zipWriter.lastFileEntry;
    const pendingFileEntry = {};
    let releaseLockFileEntry;
    if (metadataInfo.resolvedOptions.keepOrder) {
      pendingFileEntry.lockFileEntry = new Promise((resolve) => releaseLockFileEntry = resolve);
    }
    zipWriter.lastFileEntry = pendingFileEntry;
    let fileEntry;
    try {
      const { resolvedOptions } = metadataInfo;
      if (resolvedOptions.level != 0 && resolvedOptions.compressionMethod === UNDEFINED_VALUE && !resolvedOptions.passThroughCompression && !await supportsDeflate(getConfiguration())) {
        resolvedOptions.level = 0;
        addWarning(zipWriter.warnings, WARNING_COMPRESSION_UNAVAILABLE, name);
      }
      const sizesInfo = await resolveSizes(zipWriter, reader, metadataInfo, options);
      ({ reader } = sizesInfo);
      const diskOffset = getDiskOffset2(zipWriter.writer);
      const diskNumber = getDiskNumber(zipWriter.writer);
      let crc32 = options.crc32 === UNDEFINED_VALUE ? options[PROPERTY_NAME_SIGNATURE] : options.crc32;
      const storesAE2 = sizesInfo.resolvedOptions.encrypted && !resolvedOptions.zipCrypto;
      if (resolvedOptions.passThroughCompression && !resolvedOptions.passThroughEncryption && storesAE2) {
        crc32 = UNDEFINED_VALUE;
      }
      if (resolvedOptions.passThroughCompression && reader && !storesAE2 && crc32 === UNDEFINED_VALUE) {
        throw new Error(ERR_UNDEFINED_CRC32);
      }
      options = Object.assign({}, options, attributesInfo.resolvedOptions, metadataInfo.resolvedOptions, sizesInfo.resolvedOptions, {
        signature: options[PROPERTY_NAME_SIGNATURE],
        crc32,
        offset: zipWriter.offset - diskOffset,
        diskNumberStart: diskNumber,
        [OPTION_USDZ]: zipWriter.options[OPTION_USDZ]
      });
      const headerInfo = getHeaderInfo(options);
      if (headerInfo.lastModDateClamped) {
        addWarning(zipWriter.warnings, WARNING_CLAMPED_LAST_MODIFICATION_DATE, name);
      }
      const dataDescriptorInfo = getDataDescriptorInfo(options);
      const metadataSize = getLength(headerInfo.localHeaderArray, dataDescriptorInfo.dataDescriptorArray);
      fileEntry = await getFileEntry(zipWriter, name, reader, {
        headerInfo,
        dataDescriptorInfo,
        metadataSize,
        fileEntry: pendingFileEntry,
        previousFileEntry,
        releaseLockFileEntry
      }, options);
    } catch (error) {
      zipWriter.fileEntries.delete(name);
      throw error;
    } finally {
      if (releaseLockFileEntry) {
        releaseLockFileEntry(previousFileEntry && previousFileEntry.lockFileEntry);
      }
    }
    Object.assign(fileEntry, {
      name,
      comment,
      extraField
    });
    return new Entry(fileEntry);
  }
  function getSourceEntryOptions(entry, passThrough, lastModDateOverride) {
    if (entry === null || typeof entry != OBJECT_TYPE || Array.isArray(entry)) {
      throw new Error(ERR_INVALID_ENTRY);
    }
    const {
      externalFileAttributes,
      versionMadeBy,
      comment,
      lastModDate,
      rawLastModDate,
      creationDate,
      lastAccessDate,
      uncompressedSize,
      encrypted,
      zipCrypto,
      crc32,
      compressionMethod,
      extraFieldAES,
      extraFieldUnix,
      internalFileAttributes,
      extraField,
      bitFlag,
      directory,
      uid,
      gid
    } = entry;
    const entryOptions = {
      externalFileAttributes,
      versionMadeBy,
      comment,
      lastModDate,
      creationDate,
      lastAccessDate,
      internalFileAttributes,
      directory
    };
    if (bitFlag && bitFlag.languageEncodingFlag) {
      entryOptions[OPTION_USE_UNICODE_FILE_NAMES] = true;
    }
    const userExtraField = getUserExtraField(extraField);
    if (userExtraField) {
      entryOptions[PROPERTY_NAME_EXTRA_FIELD] = userExtraField;
    }
    if (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE) {
      Object.assign(entryOptions, {
        uid,
        gid,
        unixExtraFieldType: extraFieldUnix ? UNIX_EXTRA_FIELD_TYPE : INFOZIP_EXTRA_FIELD_TYPE
      });
    }
    const passThroughOptions = {};
    if (passThrough && !directory) {
      Object.assign(passThroughOptions, {
        uncompressedSize,
        crc32,
        compressionMethod
      });
      if (passThrough !== PASS_THROUGH_COMPRESSED) {
        Object.assign(passThroughOptions, {
          encrypted,
          zipCrypto,
          encryptionStrength: extraFieldAES ? extraFieldAES.strength : UNDEFINED_VALUE
        });
      }
      if (bitFlag) {
        passThroughOptions.dataDescriptor = bitFlag.dataDescriptor;
        passThroughOptions[OPTION_LEVEL] = LEVEL_BY_BITFLAG_LEVEL[bitFlag.level];
      }
      if (lastModDateOverride === UNDEFINED_VALUE) {
        passThroughOptions.rawLastModDate = rawLastModDate;
      } else if (passThrough !== PASS_THROUGH_COMPRESSED && zipCrypto && (!bitFlag || bitFlag.dataDescriptor) && lastModDateOverride instanceof Date && getDosTimeHighByte(lastModDateOverride) != (rawLastModDate >>> 8 & MAX_8_BITS)) {
        throw new Error(ERR_ZIP_CRYPTO_LAST_MOD_DATE);
      }
    }
    return { entryOptions, passThroughOptions };
  }
  function getDosTimeHighByte(lastModDate) {
    let dosLastModDate = new Date(Math.ceil(Math.floor(lastModDate.getTime() / 1e3) / 2) * 2e3);
    if (dosLastModDate < MIN_DATE) {
      dosLastModDate = MIN_DATE;
    } else if (dosLastModDate > MAX_DATE) {
      dosLastModDate = MAX_DATE;
    }
    return (dosLastModDate.getHours() << 3 | dosLastModDate.getMinutes() >> 3) & MAX_8_BITS;
  }
  function resolveAttributes(zipWriter, name, options) {
    let msDosCompatible = getOptionValue2(zipWriter, options, PROPERTY_NAME_MS_DOS_COMPATIBLE);
    let versionMadeBy = getOptionValue2(zipWriter, options, PROPERTY_NAME_VERSION_MADE_BY, msDosCompatible ? VERSION_MADE_BY_MSDOS : VERSION_MADE_BY_UNIX);
    const executable = getOptionValue2(zipWriter, options, PROPERTY_NAME_EXECUTABLE);
    const uid = getNumberOptionValue(zipWriter, options, PROPERTY_NAME_UID);
    const gid = getNumberOptionValue(zipWriter, options, PROPERTY_NAME_GID);
    let unixMode = getNumberOptionValue(zipWriter, options, PROPERTY_NAME_UNIX_MODE);
    let unixExtraFieldType = getOptionValue2(zipWriter, options, OPTION_UNIX_EXTRA_FIELD_TYPE);
    let setuid = getOptionValue2(zipWriter, options, PROPERTY_NAME_SETUID);
    let setgid = getOptionValue2(zipWriter, options, PROPERTY_NAME_SETGID);
    let sticky = getOptionValue2(zipWriter, options, PROPERTY_NAME_STICKY);
    checkIntegerOption(uid, MAX_32_BITS, ERR_INVALID_UID);
    checkIntegerOption(gid, MAX_32_BITS, ERR_INVALID_GID);
    checkIntegerOption(unixMode, MAX_16_BITS, ERR_INVALID_UNIX_MODE);
    if (unixExtraFieldType !== UNDEFINED_VALUE && unixExtraFieldType !== INFOZIP_EXTRA_FIELD_TYPE && unixExtraFieldType !== UNIX_EXTRA_FIELD_TYPE) {
      throw new Error(ERR_INVALID_UNIX_EXTRA_FIELD_TYPE);
    }
    if (unixExtraFieldType === UNIX_EXTRA_FIELD_TYPE && (uid !== UNDEFINED_VALUE && uid > MAX_16_BITS || gid !== UNDEFINED_VALUE && gid > MAX_16_BITS)) {
      throw new Error(ERR_INVALID_UNIX_ID_SIZE);
    }
    if (unixExtraFieldType === UNDEFINED_VALUE && (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE)) {
      unixExtraFieldType = INFOZIP_EXTRA_FIELD_TYPE;
    }
    let msdosAttributesRaw = getNumberOptionValue(zipWriter, options, PROPERTY_NAME_MSDOS_ATTRIBUTES_RAW);
    let msdosAttributes = getOptionValue2(zipWriter, options, PROPERTY_NAME_MSDOS_ATTRIBUTES);
    const hasUnixMetadata = uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE || unixMode !== UNDEFINED_VALUE || unixExtraFieldType || executable;
    const hasMsDosProvided = msdosAttributesRaw !== UNDEFINED_VALUE || msdosAttributes !== UNDEFINED_VALUE;
    if (hasUnixMetadata) {
      msDosCompatible = false;
      versionMadeBy = versionMadeBy & MAX_8_BITS | VERSION_MADE_BY_UNIX;
    } else if (hasMsDosProvided) {
      msDosCompatible = true;
      versionMadeBy = versionMadeBy & MAX_8_BITS;
    }
    checkIntegerOption(msdosAttributesRaw, MAX_8_BITS, ERR_INVALID_MSDOS_ATTRIBUTES);
    if (msdosAttributes && (typeof msdosAttributes !== OBJECT_TYPE || Array.isArray(msdosAttributes))) {
      throw new Error(ERR_INVALID_MSDOS_DATA);
    }
    if (versionMadeBy > MAX_16_BITS) {
      throw new Error(ERR_INVALID_VERSION);
    }
    let externalFileAttributes = getOptionValue2(zipWriter, options, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES);
    const externalFileAttributesProvided = externalFileAttributes !== UNDEFINED_VALUE;
    if (!externalFileAttributesProvided) {
      externalFileAttributes = 0;
    }
    if (!options[PROPERTY_NAME_DIRECTORY] && name.endsWith(DIRECTORY_SIGNATURE)) {
      options[PROPERTY_NAME_DIRECTORY] = true;
    }
    const directory = getOptionValue2(zipWriter, options, PROPERTY_NAME_DIRECTORY);
    if (directory) {
      if (!name.endsWith(DIRECTORY_SIGNATURE)) {
        name += DIRECTORY_SIGNATURE;
      }
      if (!externalFileAttributesProvided) {
        externalFileAttributes = FILE_ATTR_MSDOS_DIR_MASK;
        if (!msDosCompatible) {
          externalFileAttributes |= (FILE_ATTR_UNIX_TYPE_DIR | FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_DEFAULT_MASK) << 16;
        }
      }
    } else if (!msDosCompatible && !externalFileAttributesProvided) {
      if (executable) {
        externalFileAttributes = (FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_DEFAULT_MASK) << 16;
      } else {
        externalFileAttributes = FILE_ATTR_UNIX_DEFAULT_MASK << 16;
      }
    }
    if (!msDosCompatible) {
      const unixModeProvided = unixMode !== UNDEFINED_VALUE || Boolean(setuid || setgid || sticky);
      const defaultUnixMode = externalFileAttributes >> 16 & MAX_16_BITS;
      unixMode = unixMode === UNDEFINED_VALUE ? defaultUnixMode : unixMode & MAX_16_BITS;
      if (setuid) {
        unixMode |= FILE_ATTR_UNIX_SETUID_MASK;
      } else {
        setuid = Boolean(unixMode & FILE_ATTR_UNIX_SETUID_MASK);
      }
      if (setgid) {
        unixMode |= FILE_ATTR_UNIX_SETGID_MASK;
      } else {
        setgid = Boolean(unixMode & FILE_ATTR_UNIX_SETGID_MASK);
      }
      if (sticky) {
        unixMode |= FILE_ATTR_UNIX_STICKY_MASK;
      } else {
        sticky = Boolean(unixMode & FILE_ATTR_UNIX_STICKY_MASK);
      }
      if (!externalFileAttributesProvided || unixModeProvided) {
        if (directory) {
          unixMode = unixMode & ~FILE_ATTR_UNIX_TYPE_MASK | FILE_ATTR_UNIX_TYPE_DIR;
        } else if (!(unixMode & FILE_ATTR_UNIX_TYPE_MASK)) {
          unixMode |= FILE_ATTR_UNIX_TYPE_FILE;
        }
        externalFileAttributes = (unixMode & MAX_16_BITS) << 16 | externalFileAttributes & MAX_16_BITS;
      }
    }
    ({ msdosAttributesRaw, msdosAttributes } = normalizeMsdosAttributes(msdosAttributesRaw, msdosAttributes));
    if (hasMsDosProvided) {
      externalFileAttributes = externalFileAttributes & MAX_32_BITS | msdosAttributesRaw & MAX_8_BITS;
    }
    const unixExternalUpper = externalFileAttributes >> 16 & MAX_16_BITS;
    const symlink = unixMode !== UNDEFINED_VALUE && (unixMode & FILE_ATTR_UNIX_TYPE_MASK) == FILE_ATTR_UNIX_TYPE_SYMLINK;
    return {
      name,
      resolvedOptions: {
        versionMadeBy,
        msDosCompatible: Boolean(msDosCompatible),
        externalFileAttributes,
        unixExternalUpper,
        uid,
        gid,
        unixMode,
        unixExtraFieldType,
        symlink,
        setuid,
        setgid,
        sticky,
        msdosAttributesRaw,
        msdosAttributes
      }
    };
  }
  function resolveMetadata(zipWriter, name, options) {
    const encode = getFunctionOptionValue2(zipWriter, options, OPTION_ENCODE_TEXT) || encodeText;
    let rawFilename = encode(name, TEXT_TYPE_FILENAME);
    if (rawFilename === UNDEFINED_VALUE) {
      rawFilename = encodeText(name);
    }
    if (getLength(rawFilename) > MAX_16_BITS) {
      throw new Error(ERR_INVALID_ENTRY_NAME);
    }
    const comment = options[PROPERTY_NAME_COMMENT] || "";
    if (typeof comment != STRING_TYPE) {
      throw new Error(ERR_INVALID_ENTRY_COMMENT_TYPE);
    }
    let rawComment = encode(comment, TEXT_TYPE_COMMENT);
    if (rawComment === UNDEFINED_VALUE) {
      rawComment = encodeText(comment);
    }
    if (getLength(rawComment) > MAX_16_BITS) {
      throw new Error(ERR_INVALID_ENTRY_COMMENT);
    }
    const version = getOptionValue2(zipWriter, options, PROPERTY_NAME_VERSION);
    if (version !== UNDEFINED_VALUE && version > MAX_16_BITS) {
      throw new Error(ERR_INVALID_VERSION);
    }
    const lastModDate = getDateOptionValue(zipWriter, options, PROPERTY_NAME_LAST_MODIFICATION_DATE, /* @__PURE__ */ new Date());
    const rawLastModDate = getOptionValue2(zipWriter, options, PROPERTY_NAME_RAW_LAST_MODIFICATION_DATE);
    const lastAccessDate = getDateOptionValue(zipWriter, options, PROPERTY_NAME_LAST_ACCESS_DATE);
    const creationDate = getDateOptionValue(zipWriter, options, PROPERTY_NAME_CREATION_DATE);
    const internalFileAttributes = getOptionValue2(zipWriter, options, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES, 0);
    const passThrough = checkPassThroughOption(getOptionValue2(zipWriter, options, OPTION_PASS_THROUGH));
    const passThroughCompression = Boolean(passThrough);
    const passThroughEncryption = passThrough === true;
    let password = getOptionValue2(zipWriter, options, OPTION_PASSWORD);
    let rawPassword = getOptionValue2(zipWriter, options, OPTION_RAW_PASSWORD);
    checkPasswordOption(password, rawPassword);
    password = password && password.length ? password : UNDEFINED_VALUE;
    rawPassword = rawPassword && rawPassword.length ? rawPassword : UNDEFINED_VALUE;
    const encryptionStrength = getNumberOptionValue(zipWriter, options, OPTION_ENCRYPTION_STRENGTH, 3);
    const zipCrypto = getOptionValue2(zipWriter, options, PROPERTY_NAME_ZIPCRYPTO);
    const extendedTimestamp = getOptionValue2(zipWriter, options, OPTION_EXTENDED_TIMESTAMP, true);
    const ntfsTimestamp = getOptionValue2(zipWriter, options, OPTION_NTFS_TIMESTAMP);
    const keepOrder = getOptionValue2(zipWriter, options, OPTION_KEEP_ORDER, true);
    const useWebWorkers = getOptionValue2(zipWriter, options, OPTION_USE_WEB_WORKERS);
    const bufferedWrite = getOptionValue2(zipWriter, options, OPTION_BUFFERED_WRITE);
    const createTempStream = getFunctionOptionValue2(zipWriter, options, OPTION_CREATE_TEMP_STREAM);
    const dataDescriptorSignature = getOptionValue2(zipWriter, options, OPTION_DATA_DESCRIPTOR_SIGNATURE, true);
    const signal = checkSignalOption(getOptionValue2(zipWriter, options, OPTION_SIGNAL));
    throwIfAborted(signal);
    const useUnicodeFileNames = getOptionValue2(
      zipWriter,
      options,
      OPTION_USE_UNICODE_FILE_NAMES,
      !isPrintableASCIIText(rawFilename) || !isPrintableASCIIText(rawComment)
    );
    const compressionMethod = getOptionValue2(zipWriter, options, PROPERTY_NAME_COMPRESSION_METHOD);
    const registeredCodec = passThroughCompression || compressionMethod === UNDEFINED_VALUE ? UNDEFINED_VALUE : getRegisteredCodec(compressionMethod);
    if (!passThroughCompression && compressionMethod !== UNDEFINED_VALUE && compressionMethod !== COMPRESSION_METHOD_STORE && compressionMethod !== COMPRESSION_METHOD_DEFLATE && !registeredCodec) {
      throw new Error(ERR_UNSUPPORTED_COMPRESSION);
    }
    let level = getNumberOptionValue(zipWriter, options, OPTION_LEVEL);
    checkIntegerOption(level, MAX_LEVEL, ERR_INVALID_LEVEL);
    if (zipWriter.options[OPTION_USDZ]) {
      if (password !== UNDEFINED_VALUE || rawPassword !== UNDEFINED_VALUE) {
        throw new Error(ERR_UNSUPPORTED_ENCRYPTION_USDZ);
      }
      if (level === UNDEFINED_VALUE && compressionMethod === UNDEFINED_VALUE) {
        level = 0;
      }
    }
    if (passThroughCompression) {
      level = toNumber(options[OPTION_LEVEL]);
    }
    let useCompressionStream = getOptionValue2(zipWriter, options, OPTION_USE_COMPRESSION_STREAM);
    let dataDescriptor = getOptionValue2(zipWriter, options, OPTION_DATA_DESCRIPTOR);
    if (bufferedWrite && dataDescriptor === UNDEFINED_VALUE) {
      dataDescriptor = false;
    }
    if (dataDescriptor === UNDEFINED_VALUE || zipCrypto && !passThroughEncryption) {
      dataDescriptor = true;
    }
    if (level !== UNDEFINED_VALUE && level != 6) {
      useCompressionStream = false;
    }
    const zip64 = getOptionValue2(zipWriter, options, PROPERTY_NAME_ZIP64);
    if (!zipCrypto && (password !== UNDEFINED_VALUE || rawPassword !== UNDEFINED_VALUE) && !(Number.isInteger(encryptionStrength) && encryptionStrength >= 1 && encryptionStrength <= 3)) {
      throw new Error(ERR_INVALID_ENCRYPTION_STRENGTH);
    }
    const rawExtraField = serializeExtraField(options[PROPERTY_NAME_EXTRA_FIELD]);
    const rawLocalExtraField = serializeExtraField(options[OPTION_LOCAL_EXTRA_FIELD]);
    const rawCentralExtraField = serializeExtraField(options[OPTION_CENTRAL_EXTRA_FIELD]);
    return {
      comment,
      resolvedOptions: {
        rawFilename,
        rawComment,
        version,
        lastModDate,
        rawLastModDate,
        lastAccessDate,
        creationDate,
        internalFileAttributes,
        passThroughCompression,
        passThroughEncryption,
        password,
        rawPassword,
        encryptionStrength,
        zipCrypto,
        extendedTimestamp,
        ntfsTimestamp,
        keepOrder,
        useWebWorkers,
        bufferedWrite,
        createTempStream,
        dataDescriptorSignature,
        signal,
        useUnicodeFileNames,
        compressionMethod,
        format: registeredCodec ? registeredCodec.format : UNDEFINED_VALUE,
        codecURI: registeredCodec ? registeredCodec.codecURI : UNDEFINED_VALUE,
        codecVersionNeeded: registeredCodec ? registeredCodec.versionNeeded : UNDEFINED_VALUE,
        level,
        useCompressionStream,
        dataDescriptor,
        zip64,
        rawExtraField,
        rawLocalExtraField,
        rawCentralExtraField
      }
    };
  }
  function serializeExtraField(extraField) {
    if (!extraField) {
      return EMPTY_UINT8_ARRAY;
    }
    if (!(extraField instanceof Map)) {
      throw new Error(ERR_INVALID_EXTRAFIELD);
    }
    let extraFieldSize = 0;
    let offset = 0;
    extraField.forEach((data, type) => {
      checkInteger(type, MAX_16_BITS, ERR_INVALID_EXTRAFIELD_TYPE);
      if (!(data instanceof Uint8Array)) {
        throw new Error(ERR_INVALID_EXTRAFIELD_DATA_TYPE);
      }
      if (getLength(data) > MAX_16_BITS) {
        throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
      }
      extraFieldSize += 4 + getLength(data);
    });
    const rawExtraField = new Uint8Array(extraFieldSize);
    const rawExtraFieldView = getDataView(rawExtraField);
    extraField.forEach((data, type) => {
      setUint16(rawExtraFieldView, offset, type);
      setUint16(rawExtraFieldView, offset + 2, getLength(data));
      arraySet(rawExtraField, data, offset + 4);
      offset += 4 + getLength(data);
    });
    return rawExtraField;
  }
  async function resolveSizes(zipWriter, reader, { resolvedOptions: metadata }, options) {
    if (metadata.passThroughCompression && !reader && !getOptionValue2(zipWriter, options, PROPERTY_NAME_DIRECTORY)) {
      throw new Error(ERR_UNDEFINED_READER);
    }
    let contentSize;
    if (reader) {
      reader = new GenericReader(reader);
      await initStream(reader);
      if (!reader.readUint8Array && !reader.readable) {
        throw new Error(ERR_INVALID_READER);
      }
      ({ size: contentSize } = reader);
    }
    return Object.assign({ reader }, resolveEntrySizes(zipWriter, Boolean(reader), contentSize, metadata, options));
  }
  function resolveEntrySizes(zipWriter, hasContent, contentSize, metadata, options) {
    const { passThroughCompression, passThroughEncryption, zipCrypto, password, rawPassword, encryptionStrength } = metadata;
    let { dataDescriptor, zip64, level, compressionMethod } = metadata;
    let maximumCompressedSize = 0;
    let uncompressedSize = 0;
    let unknownSize = false;
    const uncompressedSizeOption = toNumber(options[PROPERTY_NAME_UNCOMPRESSED_SIZE]);
    checkIntegerOption(uncompressedSizeOption, Number.MAX_SAFE_INTEGER, ERR_INVALID_UNCOMPRESSED_SIZE_OPTION);
    if (passThroughCompression && hasContent) {
      uncompressedSize = uncompressedSizeOption;
      if (uncompressedSize === UNDEFINED_VALUE) {
        throw new Error(ERR_UNDEFINED_UNCOMPRESSED_SIZE);
      }
      if (compressionMethod === UNDEFINED_VALUE) {
        throw new Error(ERR_UNDEFINED_COMPRESSION_METHOD);
      }
    }
    const zip64Enabled = zip64 === true;
    const encrypted = getOptionValue2(zipWriter, options, PROPERTY_NAME_ENCRYPTED);
    if (hasContent && passThroughEncryption && !encrypted && getLength(password, rawPassword)) {
      throw new Error(ERR_UNSUPPORTED_ENCRYPTION_PASS_THROUGH);
    }
    const encryptedEntry = hasContent && (Boolean(password && getLength(password) || rawPassword && getLength(rawPassword)) || passThroughEncryption && encrypted);
    if (!hasContent) {
      level = 0;
      compressionMethod = COMPRESSION_METHOD_STORE;
    }
    const encryptionOverhead = getEncryptionOverhead(encryptedEntry, zipCrypto, encryptionStrength);
    if (hasContent) {
      if (!passThroughCompression) {
        const expectedSize = contentSize === UNDEFINED_VALUE ? uncompressedSizeOption : contentSize;
        if (expectedSize === UNDEFINED_VALUE) {
          if (zip64 || zip64 === UNDEFINED_VALUE) {
            zip64 = unknownSize = true;
            maximumCompressedSize = MAX_32_BITS + 1;
          }
        } else {
          options.uncompressedSize = uncompressedSize = expectedSize;
          maximumCompressedSize = (isCompressed(compressionMethod, level) ? getMaximumCompressedSize(uncompressedSize) : uncompressedSize) + encryptionOverhead;
        }
      } else {
        options.uncompressedSize = uncompressedSize;
        maximumCompressedSize = contentSize === UNDEFINED_VALUE ? getMaximumCompressedSize(uncompressedSize) + encryptionOverhead : contentSize + (passThroughEncryption ? 0 : encryptionOverhead);
      }
    }
    const emptyEntry = !encryptedEntry && (!hasContent || contentSize === 0 && !passThroughCompression) && !isCompressed(compressionMethod, level);
    const crc32Provided = options.crc32 !== UNDEFINED_VALUE || options[PROPERTY_NAME_SIGNATURE] !== UNDEFINED_VALUE;
    const completeHeader = passThroughCompression && hasContent && contentSize !== UNDEFINED_VALUE && !(encryptedEntry && zipCrypto) && (crc32Provided || encryptedEntry && !zipCrypto);
    if ((emptyEntry || completeHeader) && getOptionValue2(zipWriter, options, OPTION_DATA_DESCRIPTOR) === UNDEFINED_VALUE) {
      dataDescriptor = false;
    }
    const zip64UncompressedSize = zip64Enabled || unknownSize || uncompressedSize >= MAX_32_BITS;
    const zip64CompressedSize = zip64Enabled || maximumCompressedSize >= MAX_32_BITS;
    if (zip64UncompressedSize || zip64CompressedSize) {
      if (zip64 === false) {
        throw new Error(ERR_UNSUPPORTED_FORMAT);
      } else {
        zip64 = true;
      }
    }
    zip64 = zip64 || false;
    return {
      maximumCompressedSize,
      resolvedOptions: {
        dataDescriptor,
        emptyEntry,
        completeHeader,
        knownCompressedSize: completeHeader ? maximumCompressedSize : UNDEFINED_VALUE,
        zip64,
        zip64Enabled,
        unknownSize,
        zip64UncompressedSize,
        zip64CompressedSize,
        uncompressedSize,
        level,
        compressionMethod,
        encrypted: encryptedEntry
      }
    };
  }
  async function getFileEntry(zipWriter, name, reader, entryInfo, options) {
    const {
      fileEntries,
      writer
    } = zipWriter;
    const {
      keepOrder,
      dataDescriptor,
      emptyEntry,
      completeHeader,
      signal
    } = options;
    const {
      headerInfo,
      fileEntry: pendingFileEntry,
      previousFileEntry,
      releaseLockFileEntry
    } = entryInfo;
    const usdz = zipWriter.options[OPTION_USDZ];
    let fileEntry = pendingFileEntry;
    let bufferedWrite;
    let directWrite;
    let releaseLockWriter;
    let writingBufferedEntryData;
    let writingEntryData;
    let writerSizeBeforeEntry;
    let flushedBufferedSize = 0;
    let fileWriter;
    const lockPreviousFileEntry = keepOrder && previousFileEntry ? previousFileEntry.lockFileEntry : UNDEFINED_VALUE;
    fileEntries.set(name, fileEntry);
    try {
      if (options.bufferedWrite || !keepOrder || zipWriter.writerLocked || zipWriter.bufferedWrites || zipWriter.directWrites || !dataDescriptor && !emptyEntry && !completeHeader) {
        bufferedWrite = true;
        zipWriter.bufferedWrites++;
        if (options.createTempStream) {
          fileWriter = await options.createTempStream();
        } else {
          fileWriter = new TransformStream(UNDEFINED_VALUE, UNDEFINED_VALUE, { highWaterMark: INFINITY_VALUE });
        }
        fileWriter.size = 0;
        await initStream(writer);
      } else {
        directWrite = true;
        zipWriter.directWrites++;
        fileWriter = writer;
        await lockPreviousFileEntry;
        await requestLockWriter();
      }
      await initStream(fileWriter);
      const diskOffset = getDiskOffset2(writer);
      if (zipWriter.addSplitZipSignature && !bufferedWrite) {
        await writeSplitZipSignature(zipWriter, writer);
      }
      if (usdz && !bufferedWrite) {
        appendExtraFieldUSDZ(entryInfo, zipWriter.offset - diskOffset);
      }
      const { localHeaderArray } = headerInfo;
      if (!bufferedWrite) {
        await skipDiskIfNeeded();
      }
      const diskNumberStart = getDiskNumber(writer);
      const entryOffset = getSegmentOffset(zipWriter, writer);
      fileEntry.diskNumberStart = diskNumberStart;
      if (!bufferedWrite) {
        writingEntryData = true;
        writerSizeBeforeEntry = writer.size;
        await writeData(fileWriter, localHeaderArray);
      }
      fileEntry = await createFileEntry(reader, fileWriter, fileEntry, entryInfo, getConfiguration(), options);
      if (!bufferedWrite) {
        writingEntryData = false;
      }
      fileEntries.set(name, fileEntry);
      fileEntry.filename = name;
      if (bufferedWrite) {
        await Promise.all([fileWriter.writable.getWriter().close(), lockPreviousFileEntry]);
        await requestLockWriter();
        if (zipWriter.addSplitZipSignature) {
          await writeSplitZipSignature(zipWriter, writer);
        }
        writingBufferedEntryData = true;
        writerSizeBeforeEntry = writer.size;
        await skipDiskIfNeeded();
        fileEntry.diskNumberStart = getDiskNumber(writer);
        fileEntry.offset = getSegmentOffset(zipWriter, writer);
        if (usdz) {
          const previousMetadataSize = entryInfo.metadataSize;
          appendExtraFieldUSDZ(entryInfo, zipWriter.offset - getDiskOffset2(writer));
          fileEntry.size += entryInfo.metadataSize - previousMetadataSize;
        }
        updateLocalHeader(fileEntry, headerInfo.localHeaderView, options);
        await writeData(writer, headerInfo.localHeaderArray);
        await flushBufferedData(fileWriter.readable, writer, signal, (chunkLength) => flushedBufferedSize += chunkLength);
        writer.size += fileWriter.size;
        writingBufferedEntryData = false;
      } else {
        fileEntry.diskNumberStart = diskNumberStart;
        fileEntry.offset = entryOffset;
      }
      zipWriter.offset += fileEntry.size;
      return fileEntry;
    } catch (error) {
      if (writingBufferedEntryData || writingEntryData) {
        zipWriter.hasCorruptedEntries = true;
        if (error) {
          try {
            error.corruptedEntry = true;
          } catch {
          }
        }
        zipWriter.offset += writer.size - writerSizeBeforeEntry;
        if (bufferedWrite) {
          zipWriter.offset += flushedBufferedSize;
        }
      }
      fileEntries.delete(name);
      throw error;
    } finally {
      if (bufferedWrite) {
        zipWriter.bufferedWrites--;
      }
      if (directWrite) {
        zipWriter.directWrites--;
      }
      if (releaseLockFileEntry) {
        releaseLockFileEntry(lockPreviousFileEntry);
      }
      if (releaseLockWriter) {
        releaseLockWriter();
      }
      if (bufferedWrite && fileWriter && fileWriter.dispose) {
        try {
          await fileWriter.dispose();
        } catch {
        }
      }
    }
    async function requestLockWriter() {
      zipWriter.writerLocked = true;
      const { lockWriter } = zipWriter;
      zipWriter.lockWriter = new Promise((resolve) => releaseLockWriter = () => {
        zipWriter.writerLocked = false;
        resolve();
      });
      await lockWriter;
    }
    async function skipDiskIfNeeded() {
      if (exceedsAvailableSize(writer, getLength(headerInfo.localHeaderArray))) {
        await writer.closeDisk();
      }
    }
  }
  async function createFileEntry(reader, writer, { diskNumberStart, lockFileEntry }, entryInfo, config2, options) {
    const {
      headerInfo,
      dataDescriptorInfo,
      metadataSize
    } = entryInfo;
    const {
      headerArray,
      headerView,
      lastModDate,
      rawLastModDate,
      encrypted,
      compressed,
      version,
      compressionMethod,
      rawExtraFieldZip64,
      localExtraFieldZip64Length,
      rawExtraFieldExtendedTimestamp,
      extraFieldExtendedTimestampFlag,
      extraFieldExtendedTimestampTime,
      rawExtraFieldNTFS,
      rawExtraFieldUnix,
      rawCentralExtraFieldUnix,
      rawExtraFieldAES
    } = headerInfo;
    const { dataDescriptorArray } = dataDescriptorInfo;
    const {
      rawFilename,
      lastAccessDate,
      creationDate,
      password,
      rawPassword,
      level,
      useUnicodeFileNames,
      zip64,
      zip64Enabled,
      zip64UncompressedSize,
      zip64CompressedSize,
      zipCrypto,
      dataDescriptor,
      directory,
      executable,
      versionMadeBy,
      rawComment,
      rawExtraField,
      rawCentralExtraField,
      useWebWorkers,
      onstart,
      onprogress,
      onend,
      signal,
      encryptionStrength,
      extendedTimestamp,
      msDosCompatible,
      internalFileAttributes,
      externalFileAttributes,
      uid,
      gid,
      unixMode,
      symlink,
      setuid,
      setgid,
      sticky,
      unixExternalUpper,
      msdosAttributesRaw,
      msdosAttributes,
      useCompressionStream,
      passThroughCompression,
      passThroughEncryption,
      format,
      codecURI
    } = options;
    const fileEntry = {
      lockFileEntry,
      versionMadeBy,
      zip64,
      zip64Enabled,
      directory: Boolean(directory),
      executable: Boolean(executable),
      filenameUTF8: Boolean(useUnicodeFileNames),
      rawFilename,
      commentUTF8: Boolean(useUnicodeFileNames),
      rawComment,
      rawExtraFieldZip64,
      localExtraFieldZip64Length,
      rawExtraFieldExtendedTimestamp,
      rawExtraFieldNTFS,
      rawExtraFieldUnix,
      rawCentralExtraFieldUnix,
      rawExtraFieldAES,
      rawExtraField,
      rawCentralExtraField,
      extendedTimestamp,
      msDosCompatible,
      internalFileAttributes,
      externalFileAttributes,
      diskNumberStart,
      uid,
      gid,
      unixMode,
      symlink: Boolean(symlink),
      setuid,
      setgid,
      sticky,
      unixExternalUpper,
      msdosAttributesRaw,
      msdosAttributes
    };
    let {
      crc32,
      uncompressedSize
    } = options;
    let compressedSize = 0;
    if (!passThroughCompression) {
      uncompressedSize = 0;
    }
    const { writable } = writer;
    if (reader) {
      const size = reader.size;
      const readable = toCompatibleReadable(createReadable(reader, { size }));
      const workerOptions = {
        options: {
          codecType: CODEC_DEFLATE,
          inputSize: size,
          level,
          rawPassword,
          password,
          encryptionStrength,
          zipCrypto: encrypted && zipCrypto,
          passwordVerification: encrypted && zipCrypto && rawLastModDate >> 8 & MAX_8_BITS,
          computeCrc32: !passThroughCompression,
          compressed: compressed && !passThroughCompression,
          encrypted: encrypted && !passThroughEncryption,
          useWebWorkers,
          useCompressionStream,
          format,
          codecURI,
          compressionMethod
        },
        config: config2,
        streamOptions: { signal, size, onstart, onprogress, onend }
      };
      try {
        const result = await runWorker2({ readable, writable }, workerOptions);
        compressedSize = result.outputSize;
        writer.size += compressedSize;
        throwIfAborted(signal);
        if (!passThroughCompression) {
          uncompressedSize = result.inputSize;
          if (!encrypted || zipCrypto) {
            crc32 = result.crc32;
          }
        }
        if (!zip64CompressedSize && compressedSize >= MAX_32_BITS || !zip64UncompressedSize && uncompressedSize >= MAX_32_BITS) {
          throw new Error(ERR_UNSUPPORTED_FORMAT);
        }
      } catch (error) {
        const { outputSize: failedOutputSize } = workerOptions;
        if (failedOutputSize !== UNDEFINED_VALUE) {
          writer.size += failedOutputSize;
        } else if (isErrorObject(error) && error.outputSize !== UNDEFINED_VALUE) {
          writer.size += error.outputSize;
        }
        throw error;
      }
    }
    setEntryInfo({
      crc32,
      compressedSize,
      uncompressedSize,
      headerInfo,
      dataDescriptorInfo
    }, options);
    if (dataDescriptor) {
      await writeData(writer, dataDescriptorArray);
    }
    Object.assign(fileEntry, {
      uncompressedSize,
      compressedSize,
      lastModDate,
      rawLastModDate,
      creationDate,
      lastAccessDate,
      encrypted: Boolean(encrypted),
      zipCrypto: Boolean(zipCrypto),
      size: metadataSize + compressedSize,
      compressionMethod,
      version,
      headerArray,
      headerView,
      signature: crc32,
      crc32: encrypted && !zipCrypto && !passThroughCompression ? UNDEFINED_VALUE : crc32,
      extraFieldExtendedTimestampFlag,
      extraFieldExtendedTimestampTime,
      zip64UncompressedSize,
      zip64CompressedSize
    });
    return fileEntry;
  }
  function getHeaderInfo(options) {
    const {
      rawFilename,
      lastModDate,
      rawLastModDate: rawLastModDateOption,
      lastAccessDate,
      creationDate,
      level,
      zip64,
      zipCrypto,
      useUnicodeFileNames,
      dataDescriptor,
      directory,
      rawExtraField,
      rawLocalExtraField,
      encryptionStrength,
      extendedTimestamp,
      ntfsTimestamp,
      passThroughCompression,
      encrypted,
      zip64UncompressedSize,
      zip64CompressedSize,
      uncompressedSize,
      knownCompressedSize,
      unknownSize,
      crc32
    } = options;
    let { version, compressionMethod } = options;
    const compressedSize = dataDescriptor ? UNDEFINED_VALUE : knownCompressedSize;
    const compressed = !directory && isCompressed(compressionMethod, level);
    let rawLocalExtraFieldZip64;
    const uncompressedFile = passThroughCompression || !compressed;
    const zip64ExtraFieldComplete = zip64 && (options.bufferedWrite || !dataDescriptor || (!zip64UncompressedSize && !zip64CompressedSize || uncompressedFile && !unknownSize));
    const writeLocalExtraFieldZip64 = zip64ExtraFieldComplete || zip64 && dataDescriptor && (zip64UncompressedSize || zip64CompressedSize);
    if (zip64 && (zip64UncompressedSize || zip64CompressedSize)) {
      const length = 4 + 16;
      const extraFieldZip64 = createRecordWriter(length);
      extraFieldZip64.writeUint16(EXTRAFIELD_TYPE_ZIP64);
      extraFieldZip64.writeUint16(length - 4);
      rawLocalExtraFieldZip64 = extraFieldZip64.array;
      if (zip64ExtraFieldComplete) {
        extraFieldZip64.writeUint64(uncompressedSize);
        if (uncompressedFile) {
          const encryptionOverhead = getEncryptionOverhead(encrypted, zipCrypto, encryptionStrength);
          extraFieldZip64.writeUint64(passThroughCompression ? compressedSize === UNDEFINED_VALUE ? 0 : compressedSize : uncompressedSize + encryptionOverhead);
        }
      }
    } else {
      rawLocalExtraFieldZip64 = EMPTY_UINT8_ARRAY;
    }
    let rawExtraFieldAES;
    if (encrypted && !zipCrypto) {
      const extraFieldAES = createRecordWriter(getLength(EXTRAFIELD_DATA_AES) + 2);
      extraFieldAES.writeUint16(EXTRAFIELD_TYPE_AES);
      extraFieldAES.writeBytes(EXTRAFIELD_DATA_AES);
      rawExtraFieldAES = extraFieldAES.array;
      rawExtraFieldAES[8] = encryptionStrength;
    } else {
      rawExtraFieldAES = EMPTY_UINT8_ARRAY;
    }
    let rawExtraFieldNTFS;
    let rawExtraFieldExtendedTimestamp;
    let extraFieldExtendedTimestampFlag;
    let extraFieldExtendedTimestampTime;
    if (extendedTimestamp) {
      const lastModTimeUnix = getTimeUnix(lastModDate);
      const lastModTimeUnixInRange = inUnixTimeRange(lastModTimeUnix);
      if (lastModTimeUnixInRange) {
        const extraFieldTimestampLength = 9 + (lastAccessDate ? 4 : 0) + (creationDate ? 4 : 0);
        const extraFieldTimestamp = createRecordWriter(extraFieldTimestampLength);
        extraFieldExtendedTimestampFlag = 1 + (lastAccessDate ? 2 : 0) + (creationDate ? 4 : 0);
        extraFieldExtendedTimestampTime = lastModTimeUnix;
        extraFieldTimestamp.writeUint16(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
        extraFieldTimestamp.writeUint16(extraFieldTimestampLength - 4);
        extraFieldTimestamp.writeUint8(extraFieldExtendedTimestampFlag);
        extraFieldTimestamp.writeUint32(lastModTimeUnix);
        if (lastAccessDate) {
          extraFieldTimestamp.writeUint32(clampUnixTime(getTimeUnix(lastAccessDate)));
        }
        if (creationDate) {
          extraFieldTimestamp.writeUint32(clampUnixTime(getTimeUnix(creationDate)));
        }
        rawExtraFieldExtendedTimestamp = extraFieldTimestamp.array;
      } else {
        rawExtraFieldExtendedTimestamp = EMPTY_UINT8_ARRAY;
      }
      const writeExtraFieldNTFS = ntfsTimestamp === UNDEFINED_VALUE ? !lastModTimeUnixInRange || Boolean(lastAccessDate || creationDate) : ntfsTimestamp;
      if (writeExtraFieldNTFS) {
        try {
          const lastModTimeNTFS = getTimeNTFS(lastModDate);
          const extraFieldNTFS = createRecordWriter(36);
          extraFieldNTFS.writeUint16(EXTRAFIELD_TYPE_NTFS);
          extraFieldNTFS.writeUint16(32);
          extraFieldNTFS.skip(4);
          extraFieldNTFS.writeUint16(EXTRAFIELD_TYPE_NTFS_TAG1);
          extraFieldNTFS.writeUint16(24);
          extraFieldNTFS.writeUint64(lastModTimeNTFS);
          extraFieldNTFS.writeUint64(lastAccessDate ? getTimeNTFS(lastAccessDate) : lastModTimeNTFS);
          extraFieldNTFS.writeUint64(creationDate ? getTimeNTFS(creationDate) : lastModTimeNTFS);
          rawExtraFieldNTFS = extraFieldNTFS.array;
        } catch {
          rawExtraFieldNTFS = EMPTY_UINT8_ARRAY;
        }
      } else {
        rawExtraFieldNTFS = EMPTY_UINT8_ARRAY;
      }
    } else {
      rawExtraFieldNTFS = rawExtraFieldExtendedTimestamp = EMPTY_UINT8_ARRAY;
    }
    let rawExtraFieldUnix;
    let rawCentralExtraFieldUnix;
    try {
      const { uid, gid, unixExtraFieldType } = options;
      if (unixExtraFieldType == INFOZIP_EXTRA_FIELD_TYPE && (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE)) {
        const uidBytes = packUnixId(uid === UNDEFINED_VALUE ? 0 : uid);
        const gidBytes = packUnixId(gid === UNDEFINED_VALUE ? 0 : gid);
        const payloadLength = 3 + uidBytes.length + gidBytes.length;
        const extraFieldUnix = createRecordWriter(4 + payloadLength);
        extraFieldUnix.writeUint16(EXTRAFIELD_TYPE_INFOZIP);
        extraFieldUnix.writeUint16(payloadLength);
        extraFieldUnix.writeUint8(1);
        extraFieldUnix.writeUint8(uidBytes.length);
        extraFieldUnix.writeBytes(uidBytes);
        extraFieldUnix.writeUint8(gidBytes.length);
        extraFieldUnix.writeBytes(gidBytes);
        rawExtraFieldUnix = rawCentralExtraFieldUnix = extraFieldUnix.array;
      } else if (unixExtraFieldType == UNIX_EXTRA_FIELD_TYPE && (uid !== UNDEFINED_VALUE || gid !== UNDEFINED_VALUE)) {
        const extraFieldUnix = createRecordWriter(8);
        extraFieldUnix.writeUint16(EXTRAFIELD_TYPE_UNIX);
        extraFieldUnix.writeUint16(4);
        extraFieldUnix.writeUint16((uid === UNDEFINED_VALUE ? 0 : uid) & MAX_16_BITS);
        extraFieldUnix.writeUint16((gid === UNDEFINED_VALUE ? 0 : gid) & MAX_16_BITS);
        rawExtraFieldUnix = extraFieldUnix.array;
        const centralExtraFieldUnix = createRecordWriter(4);
        centralExtraFieldUnix.writeUint16(EXTRAFIELD_TYPE_UNIX);
        centralExtraFieldUnix.writeUint16(0);
        rawCentralExtraFieldUnix = centralExtraFieldUnix.array;
      } else {
        rawExtraFieldUnix = rawCentralExtraFieldUnix = EMPTY_UINT8_ARRAY;
      }
    } catch {
      rawExtraFieldUnix = rawCentralExtraFieldUnix = EMPTY_UINT8_ARRAY;
    }
    if (compressionMethod === UNDEFINED_VALUE) {
      compressionMethod = compressed ? COMPRESSION_METHOD_DEFLATE : COMPRESSION_METHOD_STORE;
    }
    if (version === UNDEFINED_VALUE) {
      version = compressionMethod == COMPRESSION_METHOD_STORE && !directory && !encrypted ? VERSION_STORE : VERSION_DEFLATE;
    }
    const { codecVersionNeeded } = options;
    if (compressed && codecVersionNeeded !== UNDEFINED_VALUE) {
      version = version > codecVersionNeeded ? version : codecVersionNeeded;
    }
    if (zip64) {
      version = version > VERSION_ZIP64 ? version : VERSION_ZIP64;
    }
    if (encrypted && !zipCrypto) {
      version = version > VERSION_AES ? version : VERSION_AES;
      if (passThroughCompression && crc32 !== UNDEFINED_VALUE) {
        rawExtraFieldAES[EXTRAFIELD_OFFSET_AES_VENDOR_VERSION] = VENDOR_VERSION_AE_12;
      }
      setUint16(getDataView(rawExtraFieldAES), EXTRAFIELD_OFFSET_AES_COMPRESSION_METHOD, compressionMethod);
      compressionMethod = COMPRESSION_METHOD_AES;
    }
    const localExtraFieldZip64Length = writeLocalExtraFieldZip64 ? getLength(rawLocalExtraFieldZip64) : 0;
    const extraFieldLength = localExtraFieldZip64Length + getLength(rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraFieldUnix, rawExtraField, rawLocalExtraField);
    const maximumUsdzExtraFieldLength = options[OPTION_USDZ] ? EXTRAFIELD_USDZ_MAX_LENGTH : 0;
    if (extraFieldLength + maximumUsdzExtraFieldLength > MAX_16_BITS) {
      throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
    }
    const dosLastModDate = new Date(Math.ceil(Math.floor(lastModDate.getTime() / 1e3) / 2) * 2e3);
    const clampedLastModDate = dosLastModDate < MIN_DATE ? MIN_DATE : dosLastModDate > MAX_DATE ? MAX_DATE : dosLastModDate;
    const storedLastModDate = getLength(rawExtraFieldExtendedTimestamp) ? new Date(getTimeUnix(lastModDate) * 1e3) : getLength(rawExtraFieldNTFS) ? lastModDate : clampedLastModDate;
    const {
      headerArray,
      headerView,
      rawLastModDate
    } = getHeaderArrayData({
      version,
      bitFlag: getBitFlag(level, useUnicodeFileNames, dataDescriptor, encrypted, compressionMethod),
      compressionMethod,
      uncompressedSize,
      compressedSize,
      lastModDate: clampedLastModDate,
      rawLastModDate: rawLastModDateOption,
      rawFilename,
      zip64CompressedSize,
      zip64UncompressedSize,
      extraFieldLength
    });
    if (compressedSize !== UNDEFINED_VALUE && passThroughCompression && crc32 !== UNDEFINED_VALUE) {
      setUint32(headerView, HEADER_OFFSET_SIGNATURE, crc32);
    }
    const localHeader = createRecordWriter(HEADER_SIZE + getLength(rawFilename) + extraFieldLength);
    const localHeaderArray = localHeader.array;
    const localHeaderView = getDataView(localHeaderArray);
    localHeader.writeUint32(LOCAL_FILE_HEADER_SIGNATURE);
    localHeader.writeBytes(headerArray);
    localHeader.writeBytes(rawFilename);
    if (writeLocalExtraFieldZip64) {
      localHeader.writeBytes(rawLocalExtraFieldZip64);
    }
    localHeader.writeBytes(rawExtraFieldAES);
    localHeader.writeBytes(rawExtraFieldExtendedTimestamp);
    localHeader.writeBytes(rawExtraFieldNTFS);
    localHeader.writeBytes(rawExtraFieldUnix);
    localHeader.writeBytes(rawExtraField);
    localHeader.writeBytes(rawLocalExtraField);
    if (dataDescriptor) {
      if (!zip64CompressedSize) {
        setUint32(localHeaderView, HEADER_OFFSET_COMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, 0);
      }
      if (!zip64UncompressedSize) {
        setUint32(localHeaderView, HEADER_OFFSET_UNCOMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, 0);
      }
    }
    return {
      localHeaderArray,
      localHeaderView,
      headerArray,
      headerView,
      lastModDate: storedLastModDate,
      lastModDateClamped: storedLastModDate === clampedLastModDate && dosLastModDate.getTime() != clampedLastModDate.getTime(),
      rawLastModDate,
      encrypted,
      compressed,
      version,
      compressionMethod,
      extraFieldExtendedTimestampFlag,
      extraFieldExtendedTimestampTime,
      rawExtraFieldZip64: EMPTY_UINT8_ARRAY,
      localExtraFieldZip64Length,
      rawExtraFieldExtendedTimestamp,
      rawExtraFieldNTFS,
      rawExtraFieldUnix,
      rawCentralExtraFieldUnix,
      rawExtraFieldAES,
      extraFieldLength
    };
  }
  function appendExtraFieldUSDZ(entryInfo, zipWriterOffset) {
    const { headerInfo } = entryInfo;
    let { localHeaderArray, extraFieldLength } = headerInfo;
    let extraBytesLength = 64 - (zipWriterOffset + getLength(localHeaderArray)) % 64;
    if (extraBytesLength < 4) {
      extraBytesLength += 64;
    }
    const rawExtraFieldUSDZ = new Uint8Array(extraBytesLength);
    const extraFieldUSDZView = getDataView(rawExtraFieldUSDZ);
    setUint16(extraFieldUSDZView, 0, EXTRAFIELD_TYPE_USDZ);
    setUint16(extraFieldUSDZView, 2, extraBytesLength - 4);
    const previousLocalHeaderArray = localHeaderArray;
    headerInfo.localHeaderArray = localHeaderArray = new Uint8Array(getLength(previousLocalHeaderArray) + extraBytesLength);
    arraySet(localHeaderArray, previousLocalHeaderArray);
    arraySet(localHeaderArray, rawExtraFieldUSDZ, getLength(previousLocalHeaderArray));
    const localHeaderArrayView = getDataView(localHeaderArray);
    setUint16(localHeaderArrayView, 28, extraFieldLength + extraBytesLength);
    headerInfo.localHeaderView = localHeaderArrayView;
    entryInfo.metadataSize += extraBytesLength;
  }
  function packUnixId(id) {
    const dataArray = new Uint8Array(4);
    const dataView = getDataView(dataArray);
    dataView.setUint32(0, id, true);
    let length = 4;
    while (length > 1 && dataArray[length - 1] === 0) {
      length--;
    }
    return dataArray.subarray(0, length);
  }
  function normalizeMsdosAttributes(msdosAttributesRaw, msdosAttributes) {
    if (msdosAttributesRaw !== UNDEFINED_VALUE) {
      msdosAttributesRaw = msdosAttributesRaw & MAX_8_BITS;
    } else if (msdosAttributes !== UNDEFINED_VALUE) {
      const { readOnly, hidden, system, directory: msdDir, archive } = msdosAttributes;
      let raw = 0;
      if (readOnly) raw |= FILE_ATTR_MSDOS_READONLY_MASK;
      if (hidden) raw |= FILE_ATTR_MSDOS_HIDDEN_MASK;
      if (system) raw |= FILE_ATTR_MSDOS_SYSTEM_MASK;
      if (msdDir) raw |= FILE_ATTR_MSDOS_DIR_MASK;
      if (archive) raw |= FILE_ATTR_MSDOS_ARCHIVE_MASK;
      msdosAttributesRaw = raw & MAX_8_BITS;
    }
    if (msdosAttributes === UNDEFINED_VALUE) {
      msdosAttributes = {
        readOnly: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_READONLY_MASK),
        hidden: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_HIDDEN_MASK),
        system: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_SYSTEM_MASK),
        directory: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_DIR_MASK),
        archive: Boolean(msdosAttributesRaw & FILE_ATTR_MSDOS_ARCHIVE_MASK)
      };
    }
    return { msdosAttributesRaw, msdosAttributes };
  }
  function getDataDescriptorInfo({
    zip64,
    dataDescriptor,
    dataDescriptorSignature
  }) {
    let dataDescriptorArray = EMPTY_UINT8_ARRAY;
    let dataDescriptorView, dataDescriptorOffset = 0;
    let dataDescriptorLength = zip64 ? DATA_DESCRIPTOR_RECORD_ZIP_64_LENGTH : DATA_DESCRIPTOR_RECORD_LENGTH;
    if (dataDescriptorSignature) {
      dataDescriptorLength += DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
    }
    if (dataDescriptor) {
      dataDescriptorArray = new Uint8Array(dataDescriptorLength);
      dataDescriptorView = getDataView(dataDescriptorArray);
      if (dataDescriptorSignature) {
        dataDescriptorOffset = DATA_DESCRIPTOR_RECORD_SIGNATURE_LENGTH;
        setUint32(dataDescriptorView, 0, DATA_DESCRIPTOR_RECORD_SIGNATURE);
      }
    }
    return {
      dataDescriptorArray,
      dataDescriptorView,
      dataDescriptorOffset
    };
  }
  function setEntryInfo({
    crc32,
    compressedSize,
    uncompressedSize,
    headerInfo,
    dataDescriptorInfo
  }, {
    zip64,
    zipCrypto,
    passThroughCompression,
    dataDescriptor
  }) {
    const {
      headerView,
      encrypted
    } = headerInfo;
    const {
      dataDescriptorView,
      dataDescriptorOffset
    } = dataDescriptorInfo;
    if ((!encrypted || zipCrypto || passThroughCompression) && crc32 !== UNDEFINED_VALUE) {
      setUint32(headerView, HEADER_OFFSET_SIGNATURE, crc32);
      if (dataDescriptor) {
        setUint32(dataDescriptorView, dataDescriptorOffset, crc32);
      }
    }
    if (zip64) {
      if (dataDescriptor) {
        setBigUint64(dataDescriptorView, dataDescriptorOffset + 4, BigInt(compressedSize));
        setBigUint64(dataDescriptorView, dataDescriptorOffset + 12, BigInt(uncompressedSize));
      }
    } else {
      setUint32(headerView, HEADER_OFFSET_COMPRESSED_SIZE, compressedSize);
      setUint32(headerView, HEADER_OFFSET_UNCOMPRESSED_SIZE, uncompressedSize);
      if (dataDescriptor) {
        setUint32(dataDescriptorView, dataDescriptorOffset + 4, compressedSize);
        setUint32(dataDescriptorView, dataDescriptorOffset + 8, uncompressedSize);
      }
    }
  }
  function updateLocalHeader({
    rawFilename,
    encrypted,
    zip64,
    localExtraFieldZip64Length,
    crc32,
    compressedSize,
    uncompressedSize,
    zip64UncompressedSize,
    zip64CompressedSize
  }, localHeaderView, { dataDescriptor, passThroughCompression }) {
    if (!dataDescriptor) {
      if (!encrypted || passThroughCompression && crc32 !== UNDEFINED_VALUE) {
        setUint32(localHeaderView, HEADER_OFFSET_SIGNATURE + LOCAL_HEADER_COMMON_OFFSET, crc32);
      }
      if (!zip64CompressedSize) {
        setUint32(localHeaderView, HEADER_OFFSET_COMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, compressedSize);
      }
      if (!zip64UncompressedSize) {
        setUint32(localHeaderView, HEADER_OFFSET_UNCOMPRESSED_SIZE + LOCAL_HEADER_COMMON_OFFSET, uncompressedSize);
      }
    }
    if (zip64 && localExtraFieldZip64Length) {
      const localHeaderOffset = HEADER_SIZE + getLength(rawFilename) + 4;
      setBigUint64(localHeaderView, localHeaderOffset, BigInt(uncompressedSize));
      setBigUint64(localHeaderView, localHeaderOffset + 8, BigInt(compressedSize));
    }
  }
  async function closeFile(zipWriter, comment, options) {
    const { directoryDataLength, zip64Entries } = createDirectoryRecords(zipWriter.fileEntries);
    const { directoryStart, directoryEnd, directoryArray } = await writeDirectoryRecords(zipWriter, directoryDataLength, options);
    const signatureLength = await writeDigitalSignatureRecord(zipWriter, directoryArray, options);
    await writeEndOfDirectoryRecord(zipWriter, comment, options, { directoryStart, directoryEnd, directoryDataLength, signatureLength, zip64Entries });
  }
  function createDirectoryRecords(files) {
    let directoryDataLength = 0;
    let zip64Entries = false;
    for (const [, fileEntry] of files) {
      const {
        rawFilename,
        rawExtraFieldAES,
        rawComment,
        rawExtraFieldNTFS,
        rawCentralExtraFieldUnix,
        rawExtraField,
        rawCentralExtraField,
        extraFieldExtendedTimestampFlag,
        extraFieldExtendedTimestampTime,
        zip64Enabled,
        uncompressedSize,
        compressedSize
      } = fileEntry;
      let { zip64UncompressedSize, zip64CompressedSize } = fileEntry;
      if (!zip64Enabled) {
        if (zip64UncompressedSize && uncompressedSize < MAX_32_BITS) {
          zip64UncompressedSize = fileEntry.zip64UncompressedSize = false;
        }
        if (zip64CompressedSize && compressedSize < MAX_32_BITS) {
          zip64CompressedSize = fileEntry.zip64CompressedSize = false;
        }
      }
      zip64Entries = zip64Entries || zip64UncompressedSize || zip64CompressedSize;
      const zip64Offset = fileEntry.offset >= MAX_32_BITS;
      const zip64DiskNumberStart = fileEntry.diskNumberStart >= MAX_16_BITS;
      let rawExtraFieldZip64;
      if (zip64Offset || zip64DiskNumberStart || zip64UncompressedSize || zip64CompressedSize) {
        const length = 4 + (zip64UncompressedSize ? 8 : 0) + (zip64CompressedSize ? 8 : 0) + (zip64Offset ? 8 : 0) + (zip64DiskNumberStart ? 4 : 0);
        const extraFieldZip64 = createRecordWriter(length);
        extraFieldZip64.writeUint16(EXTRAFIELD_TYPE_ZIP64);
        extraFieldZip64.writeUint16(length - 4);
        if (zip64UncompressedSize) {
          extraFieldZip64.writeUint64(uncompressedSize);
        }
        if (zip64CompressedSize) {
          extraFieldZip64.writeUint64(compressedSize);
        }
        if (zip64Offset) {
          extraFieldZip64.writeUint64(fileEntry.offset);
        }
        if (zip64DiskNumberStart) {
          extraFieldZip64.writeUint32(fileEntry.diskNumberStart);
        }
        rawExtraFieldZip64 = extraFieldZip64.array;
      } else {
        rawExtraFieldZip64 = EMPTY_UINT8_ARRAY;
      }
      fileEntry.rawExtraFieldZip64 = rawExtraFieldZip64;
      fileEntry.zip64Offset = zip64Offset;
      fileEntry.zip64DiskNumberStart = zip64DiskNumberStart;
      let rawExtraFieldTimestamp;
      if (extraFieldExtendedTimestampTime === UNDEFINED_VALUE) {
        rawExtraFieldTimestamp = EMPTY_UINT8_ARRAY;
      } else {
        const extraFieldTimestamp = createRecordWriter(9);
        extraFieldTimestamp.writeUint16(EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
        extraFieldTimestamp.writeUint16(5);
        extraFieldTimestamp.writeUint8(extraFieldExtendedTimestampFlag);
        extraFieldTimestamp.writeUint32(extraFieldExtendedTimestampTime);
        rawExtraFieldTimestamp = extraFieldTimestamp.array;
      }
      fileEntry.rawExtraFieldExtendedTimestamp = rawExtraFieldTimestamp;
      const extraFieldLength = getLength(
        rawExtraFieldZip64,
        rawExtraFieldAES,
        rawExtraFieldNTFS,
        rawCentralExtraFieldUnix,
        rawExtraFieldTimestamp,
        rawExtraField,
        rawCentralExtraField
      );
      if (extraFieldLength > MAX_16_BITS) {
        throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
      }
      directoryDataLength += CENTRAL_FILE_HEADER_LENGTH + getLength(rawFilename, rawComment) + extraFieldLength;
    }
    return { directoryDataLength, zip64Entries };
  }
  async function writeDirectoryRecords(zipWriter, directoryDataLength, options) {
    const { fileEntries, writer } = zipWriter;
    const directoryArray = new Uint8Array(directoryDataLength);
    await initStream(writer);
    let offset = 0;
    let directoryDiskOffset = 0;
    let directoryStartDiskNumber = getDiskNumber(writer);
    let directoryStartDiskOffset = getDiskOffset2(writer);
    let directoryEndDiskEntriesLength = 0;
    for (const [indexFileEntry, fileEntry] of Array.from(fileEntries.values()).entries()) {
      const {
        offset: fileEntryOffset,
        rawFilename,
        rawExtraFieldZip64,
        rawExtraFieldAES,
        rawExtraFieldExtendedTimestamp,
        rawExtraFieldNTFS,
        rawCentralExtraFieldUnix,
        rawExtraField,
        rawCentralExtraField,
        rawComment,
        versionMadeBy,
        headerArray,
        headerView,
        zip64UncompressedSize,
        zip64CompressedSize,
        zip64DiskNumberStart,
        zip64Offset,
        internalFileAttributes,
        externalFileAttributes,
        diskNumberStart,
        uncompressedSize,
        compressedSize
      } = fileEntry;
      const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawCentralExtraFieldUnix, rawExtraField, rawCentralExtraField);
      const directoryRecordLength = CENTRAL_FILE_HEADER_LENGTH + getLength(rawFilename, rawComment) + extraFieldLength;
      if (exceedsAvailableSize(writer, offset + directoryRecordLength - directoryDiskOffset)) {
        await writeData(writer, directoryArray.slice(directoryDiskOffset, offset));
        directoryDiskOffset = offset;
        directoryEndDiskEntriesLength = 0;
        await writer.closeDisk();
      }
      if (indexFileEntry == 0) {
        directoryStartDiskNumber = getDiskNumber(writer);
        directoryStartDiskOffset = getDiskOffset2(writer);
      }
      if (!zip64UncompressedSize) {
        setUint32(headerView, HEADER_OFFSET_UNCOMPRESSED_SIZE, uncompressedSize);
      }
      if (!zip64CompressedSize) {
        setUint32(headerView, HEADER_OFFSET_COMPRESSED_SIZE, compressedSize);
      }
      if ((zip64Offset || zip64DiskNumberStart) && fileEntry.version < VERSION_ZIP64) {
        setUint16(headerView, HEADER_OFFSET_VERSION, VERSION_ZIP64);
      }
      const directoryRecord = createRecordWriter(directoryRecordLength);
      directoryRecord.writeUint32(CENTRAL_FILE_HEADER_SIGNATURE);
      directoryRecord.writeUint16(versionMadeBy);
      directoryRecord.writeBytes(headerArray.subarray(0, HEADER_SIZE - 4 - 2));
      directoryRecord.writeUint16(extraFieldLength);
      directoryRecord.writeUint16(getLength(rawComment));
      directoryRecord.writeUint16(zip64DiskNumberStart ? MAX_16_BITS : diskNumberStart);
      directoryRecord.writeUint16(internalFileAttributes);
      directoryRecord.writeUint32(externalFileAttributes);
      directoryRecord.writeUint32(zip64Offset ? MAX_32_BITS : fileEntryOffset);
      directoryRecord.writeBytes(rawFilename);
      directoryRecord.writeBytes(rawExtraFieldZip64);
      directoryRecord.writeBytes(rawExtraFieldAES);
      directoryRecord.writeBytes(rawExtraFieldExtendedTimestamp);
      directoryRecord.writeBytes(rawExtraFieldNTFS);
      directoryRecord.writeBytes(rawCentralExtraFieldUnix);
      directoryRecord.writeBytes(rawExtraField);
      directoryRecord.writeBytes(rawCentralExtraField);
      directoryRecord.writeBytes(rawComment);
      arraySet(directoryArray, directoryRecord.array, offset);
      offset += directoryRecordLength;
      directoryEndDiskEntriesLength++;
      if (options.onprogress) {
        try {
          await options.onprogress(indexFileEntry + 1, fileEntries.size, new Entry(fileEntry));
        } catch {
        }
      }
    }
    await writeData(writer, directoryDiskOffset ? directoryArray.slice(directoryDiskOffset) : directoryArray);
    return {
      directoryStart: { diskNumber: directoryStartDiskNumber, diskOffset: directoryStartDiskOffset },
      directoryEnd: { diskNumber: getDiskNumber(writer), entriesLength: directoryEndDiskEntriesLength },
      directoryArray
    };
  }
  async function writeDigitalSignatureRecord(zipWriter, directoryArray, options) {
    const signCentralDirectory = getFunctionOptionValue2(zipWriter, options, OPTION_SIGN_CENTRAL_DIRECTORY);
    if (signCentralDirectory) {
      const signatureData = await signCentralDirectory(directoryArray);
      const signatureDataLength = getLength(signatureData);
      if (signatureDataLength > MAX_16_BITS) {
        throw new Error(ERR_INVALID_SIGNATURE_DATA);
      }
      const signatureRecord = createRecordWriter(6 + signatureDataLength);
      signatureRecord.writeUint32(DIGITAL_SIGNATURE_RECORD_SIGNATURE);
      signatureRecord.writeUint16(signatureDataLength);
      signatureRecord.writeBytes(signatureData);
      const { writer } = zipWriter;
      if (exceedsAvailableSize(writer, getLength(signatureRecord.array))) {
        await writer.closeDisk();
      }
      await writeData(writer, signatureRecord.array);
      return 6 + signatureDataLength;
    }
    return 0;
  }
  async function writeEndOfDirectoryRecord(zipWriter, comment, options, cdInfo) {
    const { writer } = zipWriter;
    const { directoryStart, directoryEnd, signatureLength, zip64Entries } = cdInfo;
    let { directoryDataLength } = cdInfo;
    let fileEntriesLength = zipWriter.fileEntries.size;
    let diskNumber = directoryStart.diskNumber;
    let directoryOffset = getSegmentOffset(zipWriter, directoryStart);
    const commentLength = getLength(comment);
    if (commentLength > MAX_16_BITS) {
      throw new Error(ERR_INVALID_COMMENT);
    }
    let zip64 = getOptionValue2(zipWriter, options, PROPERTY_NAME_ZIP64);
    let lastDiskNumber = getDiskNumber(writer);
    if (exceedsAvailableSize(writer, (zip64 ? ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH : END_OF_CENTRAL_DIR_LENGTH) + commentLength)) {
      lastDiskNumber++;
    }
    if (directoryOffset >= MAX_32_BITS || directoryDataLength >= MAX_32_BITS || fileEntriesLength >= MAX_16_BITS || lastDiskNumber >= MAX_16_BITS) {
      if (zip64 === false) {
        throw new Error(ERR_UNSUPPORTED_FORMAT);
      } else {
        zip64 = true;
      }
    } else if (zip64 === UNDEFINED_VALUE && zip64Entries) {
      zip64 = true;
    }
    const endOfdirectoryRecord = createRecordWriter(zip64 ? ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH : END_OF_CENTRAL_DIR_LENGTH);
    if (exceedsAvailableSize(writer, getLength(endOfdirectoryRecord.array) + commentLength)) {
      await writer.closeDisk();
    }
    lastDiskNumber = getDiskNumber(writer);
    let diskFileEntriesLength = lastDiskNumber == directoryEnd.diskNumber ? directoryEnd.entriesLength : 0;
    if (zip64) {
      endOfdirectoryRecord.writeUint32(ZIP64_END_OF_CENTRAL_DIR_SIGNATURE);
      endOfdirectoryRecord.writeUint64(44);
      endOfdirectoryRecord.writeUint16(45);
      endOfdirectoryRecord.writeUint16(45);
      endOfdirectoryRecord.writeUint32(lastDiskNumber);
      endOfdirectoryRecord.writeUint32(diskNumber);
      endOfdirectoryRecord.writeUint64(diskFileEntriesLength);
      endOfdirectoryRecord.writeUint64(fileEntriesLength);
      endOfdirectoryRecord.writeUint64(directoryDataLength);
      endOfdirectoryRecord.writeUint64(directoryOffset);
      endOfdirectoryRecord.writeUint32(ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE);
      endOfdirectoryRecord.writeUint32(lastDiskNumber);
      endOfdirectoryRecord.writeUint64(BigInt(getSegmentOffset(zipWriter, writer)) + BigInt(directoryDataLength) + BigInt(signatureLength));
      endOfdirectoryRecord.writeUint32(lastDiskNumber + 1);
      const supportZip64SplitFile = getOptionValue2(zipWriter, options, OPTION_SUPPORT_ZIP64_SPLIT_FILE, true);
      if (supportZip64SplitFile) {
        lastDiskNumber = MAX_16_BITS;
        diskNumber = MAX_16_BITS;
      }
      diskFileEntriesLength = MAX_16_BITS;
      fileEntriesLength = MAX_16_BITS;
      directoryOffset = MAX_32_BITS;
      directoryDataLength = MAX_32_BITS;
    }
    endOfdirectoryRecord.writeUint32(END_OF_CENTRAL_DIR_SIGNATURE);
    endOfdirectoryRecord.writeUint16(lastDiskNumber);
    endOfdirectoryRecord.writeUint16(diskNumber);
    endOfdirectoryRecord.writeUint16(diskFileEntriesLength);
    endOfdirectoryRecord.writeUint16(fileEntriesLength);
    endOfdirectoryRecord.writeUint32(directoryDataLength);
    endOfdirectoryRecord.writeUint32(directoryOffset);
    endOfdirectoryRecord.writeUint16(commentLength);
    await writeData(writer, endOfdirectoryRecord.array);
    if (commentLength) {
      await writeData(writer, comment);
    }
  }
  function createRecordWriter(length) {
    const array = new Uint8Array(length);
    const view = getDataView(array);
    let offset = 0;
    return {
      array,
      writeUint8: (value) => {
        setUint8(view, offset, value);
        offset += 1;
      },
      writeUint16: (value) => {
        setUint16(view, offset, value);
        offset += 2;
      },
      writeUint32: (value) => {
        setUint32(view, offset, value);
        offset += 4;
      },
      writeUint64: (value) => {
        setBigUint64(view, offset, BigInt(value));
        offset += 8;
      },
      writeBytes: (value) => {
        arraySet(array, value, offset);
        offset += getLength(value);
      },
      skip: (count) => offset += count
    };
  }
  function getDiskNumber(writer) {
    const { diskNumber = 0 } = writer;
    return diskNumber;
  }
  function getDiskOffset2(writer) {
    const { diskOffset = 0 } = writer;
    return diskOffset;
  }
  function exceedsAvailableSize(writer, length) {
    const { availableSize = INFINITY_VALUE } = writer;
    return length > availableSize;
  }
  function getSegmentOffset(zipWriter, { diskNumber = 0, diskOffset = 0 }) {
    return zipWriter.offset - diskOffset - (diskNumber ? zipWriter.initialOffset : 0);
  }
  async function startsWithSplitZipSignature2(reader) {
    const signatureArray = await readUint8Array(reader, 0, SPLIT_ZIP_FILE_SIGNATURE_LENGTH);
    return getUint322(getDataView(signatureArray), 0) == SPLIT_ZIP_FILE_SIGNATURE;
  }
  function removeExtraFieldZip64(rawExtraField) {
    const rawExtraFieldView = getDataView(rawExtraField);
    let offsetExtraField = 0;
    while (offsetExtraField + 4 <= getLength(rawExtraField)) {
      const size = 4 + getUint162(rawExtraFieldView, offsetExtraField + 2);
      if (getUint162(rawExtraFieldView, offsetExtraField) == EXTRAFIELD_TYPE_ZIP64) {
        return removeExtraFieldZip64(concat(
          rawExtraField.subarray(0, offsetExtraField),
          rawExtraField.subarray(Math.min(offsetExtraField + size, getLength(rawExtraField)))
        ));
      }
      offsetExtraField += size;
    }
    return rawExtraField;
  }
  async function copyZipData(zipWriter, reader, entries, keptEntries, directoryOffset, compact, getEntryDataDescriptorLength2) {
    const { writer } = zipWriter;
    const entryPositions = /* @__PURE__ */ new Map();
    if (writer.closeDisk || compact) {
      const sortedEntries = Array.from(entries).sort((firstEntry, secondEntry) => getSourceOffset(reader, firstEntry) - getSourceOffset(reader, secondEntry));
      const regionEnds = getRegionEnds(reader, sortedEntries, directoryOffset);
      const keptEntrySet = new Set(keptEntries);
      const localHeaderLengths = /* @__PURE__ */ new Map();
      for (let indexEntry = 0; indexEntry < sortedEntries.length; indexEntry++) {
        const entry = sortedEntries[indexEntry];
        if (keptEntrySet.has(entry)) {
          const sourceOffset = getSourceOffset(reader, entry);
          const localHeaderLength = await getLocalHeaderLength(reader, sourceOffset);
          if (localHeaderLength === UNDEFINED_VALUE) {
            throw new Error(ERR_LOCAL_FILE_HEADER_NOT_FOUND);
          }
          let entryEnd = sourceOffset + localHeaderLength + entry.compressedSize;
          if (entry.bitFlag.dataDescriptor) {
            const dataDescriptorLength = await getEntryDataDescriptorLength2(reader, entryEnd, entry);
            entryEnd = dataDescriptorLength === UNDEFINED_VALUE ? Math.max(entryEnd, regionEnds[indexEntry]) : entryEnd + dataDescriptorLength;
          }
          if (entryEnd > regionEnds[indexEntry]) {
            throw new Error(ERR_OVERLAPPING_ENTRY);
          }
          regionEnds[indexEntry] = entryEnd;
          localHeaderLengths.set(entry, localHeaderLength);
        }
      }
      let copiedOffset = 0;
      let lastPosition;
      for (let indexEntry = 0; indexEntry < sortedEntries.length; indexEntry++) {
        const entry = sortedEntries[indexEntry];
        if (keptEntrySet.has(entry)) {
          const sourceOffset = getSourceOffset(reader, entry);
          if (sourceOffset < copiedOffset) {
            entryPositions.set(entry, lastPosition);
          } else {
            if (!compact) {
              await copyData(zipWriter, reader, copiedOffset, sourceOffset - copiedOffset);
            }
            if (writer.closeDisk && exceedsAvailableSize(writer, localHeaderLengths.get(entry))) {
              await writer.closeDisk();
            }
            lastPosition = {
              offset: getSegmentOffset(zipWriter, writer),
              diskNumberStart: getDiskNumber(writer)
            };
            entryPositions.set(entry, lastPosition);
            await copyData(zipWriter, reader, sourceOffset, regionEnds[indexEntry] - sourceOffset);
            copiedOffset = regionEnds[indexEntry];
          }
        }
      }
      if (!compact) {
        await copyData(zipWriter, reader, copiedOffset, directoryOffset - copiedOffset);
      }
    } else {
      const baseOffset = zipWriter.offset;
      await copyData(zipWriter, reader, 0, directoryOffset);
      entries.forEach((entry) => entryPositions.set(entry, {
        offset: baseOffset + getSourceOffset(reader, entry),
        diskNumberStart: 0
      }));
    }
    return entryPositions;
  }
  function getRegionEnds(reader, sortedEntries, directoryOffset) {
    const regionEnds = new Array(sortedEntries.length);
    let regionEnd = directoryOffset;
    for (let indexEntry = sortedEntries.length - 1; indexEntry >= 0; indexEntry--) {
      const sourceOffset = getSourceOffset(reader, sortedEntries[indexEntry]);
      const nextEntry = sortedEntries[indexEntry + 1];
      if (nextEntry && getSourceOffset(reader, nextEntry) > sourceOffset) {
        regionEnd = Math.min(getSourceOffset(reader, nextEntry), directoryOffset);
      }
      regionEnds[indexEntry] = regionEnd;
    }
    return regionEnds;
  }
  async function copyData(zipWriter, reader, offset, size) {
    if (size > 0) {
      const { writer } = zipWriter;
      let copiedLength = 0;
      try {
        await flushBufferedData(createReadable(reader, { offset, size }), writer, UNDEFINED_VALUE, (chunkLength) => copiedLength += chunkLength);
      } catch (error) {
        if (copiedLength) {
          zipWriter.hasCorruptedEntries = true;
          try {
            error.corruptedEntry = true;
          } catch {
          }
        }
        throw error;
      } finally {
        writer.size += copiedLength;
        zipWriter.offset += copiedLength;
      }
    }
  }
  async function getLocalHeaderLength(reader, offset) {
    const headerArray = offset >= 0 && offset + HEADER_SIZE <= reader.size ? await readUint8Array(reader, offset, HEADER_SIZE) : EMPTY_UINT8_ARRAY;
    if (getLength(headerArray) < HEADER_SIZE) {
      return UNDEFINED_VALUE;
    }
    const headerView = getDataView(headerArray);
    if (getUint322(headerView, 0) != LOCAL_FILE_HEADER_SIGNATURE) {
      return UNDEFINED_VALUE;
    }
    return HEADER_SIZE + getUint162(headerView, HEADER_OFFSET_FILENAME_LENGTH + LOCAL_HEADER_COMMON_OFFSET) + getUint162(headerView, HEADER_OFFSET_EXTRAFIELD_LENGTH + LOCAL_HEADER_COMMON_OFFSET);
  }
  function getSourceOffset(reader, { offset, diskNumberStart }) {
    return offset + (reader.getDiskOffset ? reader.getDiskOffset(diskNumberStart) : 0);
  }
  function getSplitZipSignatureArray() {
    const signatureArray = new Uint8Array(SPLIT_ZIP_FILE_SIGNATURE_LENGTH);
    setUint32(getDataView(signatureArray), 0, SPLIT_ZIP_FILE_SIGNATURE);
    return signatureArray;
  }
  async function writeSplitZipSignature(zipWriter, writer) {
    delete zipWriter.addSplitZipSignature;
    await writeData(writer, getSplitZipSignatureArray());
    zipWriter.offset += SPLIT_ZIP_FILE_SIGNATURE_LENGTH;
  }
  async function writeData(writer, array) {
    const { writable } = writer;
    const streamWriter = writable.getWriter();
    try {
      await streamWriter.ready;
      writer.size += getLength(array);
      await streamWriter.write(array);
    } finally {
      streamWriter.releaseLock();
    }
  }
  async function flushBufferedData(readable, writer, signal, onChunkWritten) {
    const streamWriter = writer.writable.getWriter();
    try {
      await readable.pipeTo(new WritableStream({
        async write(chunk) {
          await streamWriter.ready;
          await streamWriter.write(chunk);
          onChunkWritten(getLength(chunk));
        }
      }), { preventClose: true, preventAbort: true, signal });
    } finally {
      streamWriter.releaseLock();
    }
  }
  function getTimeNTFS(date) {
    if (date) {
      const timeNTFS = (BigInt(date.getTime()) + BigInt(116444736e5)) * BigInt(1e4);
      return timeNTFS < MIN_NTFS_TIME ? MIN_NTFS_TIME : timeNTFS > MAX_NTFS_TIME ? MAX_NTFS_TIME : timeNTFS;
    }
  }
  function getTimeUnix(date) {
    return Math.floor(date.getTime() / 1e3);
  }
  function inUnixTimeRange(timeUnix) {
    return timeUnix >= MIN_UNIX_TIME && timeUnix <= MAX_UNIX_TIME;
  }
  function clampUnixTime(timeUnix) {
    return Math.min(MAX_UNIX_TIME, Math.max(MIN_UNIX_TIME, timeUnix));
  }
  function getOptionValue2(zipWriter, options, name, defaultValue) {
    const result = options[name] === UNDEFINED_VALUE ? zipWriter.options[name] : options[name];
    return result === UNDEFINED_VALUE ? defaultValue : result;
  }
  function getDateOptionValue(zipWriter, options, name, defaultValue) {
    const date = getOptionValue2(zipWriter, options, name, defaultValue);
    if (date === null) {
      return defaultValue;
    }
    if (date !== UNDEFINED_VALUE && (typeof date.getTime != FUNCTION_TYPE || Number.isNaN(date.getTime()))) {
      throw new Error(ERR_INVALID_DATE);
    }
    return date;
  }
  function getFunctionOptionValue2(zipWriter, options, name) {
    return checkFunctionOption(getOptionValue2(zipWriter, options, name));
  }
  function getNumberOptionValue(zipWriter, options, name, defaultValue) {
    return toNumber(getOptionValue2(zipWriter, options, name, defaultValue));
  }
  function getMaximumCompressedSize(uncompressedSize) {
    return uncompressedSize + 5 * (Math.floor(uncompressedSize / 16383) + 1);
  }
  function isCompressed(compressionMethod, level) {
    return compressionMethod === UNDEFINED_VALUE ? level === UNDEFINED_VALUE || level > 0 : compressionMethod !== COMPRESSION_METHOD_STORE;
  }
  function getUint162(view, offset) {
    return view.getUint16(offset, true);
  }
  function getUint322(view, offset) {
    return view.getUint32(offset, true);
  }
  function setUint8(view, offset, value) {
    view.setUint8(offset, value);
  }
  function setUint16(view, offset, value) {
    view.setUint16(offset, value, true);
  }
  function setUint32(view, offset, value) {
    view.setUint32(offset, value, true);
  }
  function setBigUint64(view, offset, value) {
    view.setBigUint64(offset, value, true);
  }
  function arraySet(array, typedArray, offset) {
    array.set(typedArray, offset);
  }
  function getLength(...arrayLikes) {
    let result = 0;
    arrayLikes.forEach((arrayLike) => arrayLike && (result += arrayLike.length));
    return result;
  }
  function getHeaderArrayData({
    version,
    bitFlag,
    compressionMethod,
    uncompressedSize,
    compressedSize,
    lastModDate,
    rawLastModDate,
    rawFilename,
    zip64CompressedSize,
    zip64UncompressedSize,
    extraFieldLength
  }) {
    const headerRecord = createRecordWriter(HEADER_SIZE - 4);
    const headerArray = headerRecord.array;
    const headerView = getDataView(headerArray);
    headerRecord.writeUint16(version);
    headerRecord.writeUint16(bitFlag);
    headerRecord.writeUint16(compressionMethod);
    if (rawLastModDate === UNDEFINED_VALUE) {
      const dateArray = new Uint32Array(1);
      const dateView = getDataView(dateArray);
      setUint16(dateView, 0, (lastModDate.getHours() << 6 | lastModDate.getMinutes()) << 5 | lastModDate.getSeconds() / 2);
      setUint16(dateView, 2, (lastModDate.getFullYear() - 1980 << 4 | lastModDate.getMonth() + 1) << 5 | lastModDate.getDate());
      rawLastModDate = dateArray[0];
    }
    headerRecord.writeUint32(rawLastModDate);
    headerRecord.skip(4);
    if (zip64CompressedSize || compressedSize !== UNDEFINED_VALUE) {
      headerRecord.writeUint32(zip64CompressedSize ? MAX_32_BITS : compressedSize);
    } else {
      headerRecord.skip(4);
    }
    if (zip64UncompressedSize || uncompressedSize !== UNDEFINED_VALUE) {
      headerRecord.writeUint32(zip64UncompressedSize ? MAX_32_BITS : uncompressedSize);
    } else {
      headerRecord.skip(4);
    }
    headerRecord.writeUint16(getLength(rawFilename));
    headerRecord.writeUint16(extraFieldLength);
    return {
      headerArray,
      headerView,
      rawLastModDate
    };
  }
  function isPrintableASCIIText(rawText) {
    return rawText.every((characterCode) => characterCode >= MIN_PRINTABLE_ASCII_CHARACTER_CODE && characterCode <= MAX_PRINTABLE_ASCII_CHARACTER_CODE);
  }
  function getBitFlag(level, useUnicodeFileNames, dataDescriptor, encrypted, compressionMethod) {
    let bitFlag = 0;
    if (useUnicodeFileNames) {
      bitFlag = bitFlag | BITFLAG_LANG_ENCODING_FLAG;
    }
    if (dataDescriptor) {
      bitFlag = bitFlag | BITFLAG_DATA_DESCRIPTOR;
    }
    if (compressionMethod == COMPRESSION_METHOD_DEFLATE || compressionMethod == COMPRESSION_METHOD_DEFLATE_64) {
      if (level >= 0 && level <= 3) {
        bitFlag = bitFlag | BITFLAG_LEVEL_SUPER_FAST_MASK;
      }
      if (level > 3 && level <= 5) {
        bitFlag = bitFlag | BITFLAG_LEVEL_FAST_MASK;
      }
      if (level == 9) {
        bitFlag = bitFlag | BITFLAG_LEVEL_MAX_MASK;
      }
    }
    if (encrypted) {
      bitFlag = bitFlag | BITFLAG_ENCRYPTED;
    }
    return bitFlag;
  }
  var ERR_DUPLICATED_NAME, ERR_INVALID_COMMENT, ERR_INVALID_COMMENT_TYPE, ERR_INVALID_ENTRY_COMMENT, ERR_INVALID_ENTRY_COMMENT_TYPE, ERR_INVALID_DATE, ERR_INVALID_ENTRY_NAME, ERR_INVALID_VERSION, ERR_INVALID_ENCRYPTION_STRENGTH, ERR_UNSUPPORTED_ENCRYPTION_USDZ, ERR_UNSUPPORTED_SPLIT_USDZ, ERR_UNSUPPORTED_ENCRYPTION_PASS_THROUGH, ERR_INVALID_EXTRAFIELD, ERR_INVALID_EXTRAFIELD_TYPE, ERR_INVALID_EXTRAFIELD_DATA_TYPE, ERR_INVALID_EXTRAFIELD_DATA, MIN_UNIX_TIME, MAX_UNIX_TIME, MIN_NTFS_TIME, MAX_NTFS_TIME, ERR_UNSUPPORTED_FORMAT, ERR_UNDEFINED_UNCOMPRESSED_SIZE, ERR_UNDEFINED_COMPRESSION_METHOD, ERR_UNDEFINED_CRC32, ERR_UNDEFINED_READER, ERR_INVALID_READER, ERR_ZIP_NOT_EMPTY, ERR_INVALID_UID, ERR_INVALID_GID, ERR_INVALID_UNIX_MODE, ERR_INVALID_UNIX_EXTRA_FIELD_TYPE, ERR_INVALID_UNIX_ID_SIZE, ERR_INVALID_MSDOS_ATTRIBUTES, ERR_INVALID_MSDOS_DATA, ERR_INVALID_LEVEL, ERR_INVALID_UNCOMPRESSED_SIZE_OPTION, ERR_INVALID_SIGNATURE_DATA, ERR_INVALID_ENTRY, ERR_ZIP_CRYPTO_LAST_MOD_DATE, WARNING_COMPRESSION_UNAVAILABLE, WARNING_CLAMPED_LAST_MODIFICATION_DATE, EXTRAFIELD_DATA_AES, EXTRAFIELD_OFFSET_AES_VENDOR_VERSION, EXTRAFIELD_OFFSET_AES_COMPRESSION_METHOD, EXTRAFIELD_USDZ_MAX_LENGTH, MIN_PRINTABLE_ASCII_CHARACTER_CODE, MAX_PRINTABLE_ASCII_CHARACTER_CODE, VENDOR_VERSION_AE_12, INFOZIP_EXTRA_FIELD_TYPE, UNIX_EXTRA_FIELD_TYPE, LEVEL_BY_BITFLAG_LEVEL, MAX_LEVEL, workers, pendingEntries, ZipWriter, WatchedPromise;
  var init_zip_writer = __esm({
    "node_modules/@zip.js/zip.js/lib/core/zip-writer.js"() {
      init_constants();
      init_configuration();
      init_codec_registry();
      init_codec_worker();
      init_codec_pool();
      init_io();
      init_encode_text();
      init_array();
      init_warnings();
      init_compatible_streams();
      init_error();
      init_zip_entry();
      init_options();
      ERR_DUPLICATED_NAME = "File already exists";
      ERR_INVALID_COMMENT = "Zip file comment exceeds 64KB";
      ERR_INVALID_COMMENT_TYPE = "Invalid zip file comment (must be a Uint8Array)";
      ERR_INVALID_ENTRY_COMMENT = "File entry comment exceeds 64KB";
      ERR_INVALID_ENTRY_COMMENT_TYPE = "Invalid file entry comment (must be a string)";
      ERR_INVALID_DATE = "Invalid date (must be a valid Date instance)";
      ERR_INVALID_ENTRY_NAME = "File entry name exceeds 64KB";
      ERR_INVALID_VERSION = "Version exceeds 65535";
      ERR_INVALID_ENCRYPTION_STRENGTH = "The strength must equal 1, 2, or 3";
      ERR_UNSUPPORTED_ENCRYPTION_USDZ = "Encryption is not supported in USDZ files";
      ERR_UNSUPPORTED_SPLIT_USDZ = "Split zip files are not supported in USDZ files";
      ERR_UNSUPPORTED_ENCRYPTION_PASS_THROUGH = "Encryption is not supported when the 'passThrough' option is set to true (use 'compressed' instead)";
      ERR_INVALID_EXTRAFIELD = "Invalid extra field (must be a Map)";
      ERR_INVALID_EXTRAFIELD_TYPE = "Invalid extra field type (must be integer 0..65535)";
      ERR_INVALID_EXTRAFIELD_DATA_TYPE = "Invalid extra field data (must be a Uint8Array)";
      ERR_INVALID_EXTRAFIELD_DATA = "Extra field data exceeds 64KB";
      MIN_UNIX_TIME = -2147483648;
      MAX_UNIX_TIME = 2147483647;
      MIN_NTFS_TIME = BigInt(0);
      MAX_NTFS_TIME = BigInt("0x7fffffffffffffff");
      ERR_UNSUPPORTED_FORMAT = "Zip64 is not supported (set the 'zip64' option to 'true')";
      ERR_UNDEFINED_UNCOMPRESSED_SIZE = "Undefined uncompressed size";
      ERR_UNDEFINED_COMPRESSION_METHOD = "Undefined compression method";
      ERR_UNDEFINED_CRC32 = "Undefined CRC32";
      ERR_UNDEFINED_READER = "Undefined reader";
      ERR_INVALID_READER = "Invalid reader (must be a Reader instance, a ReadableStream instance, or an object with a 'readable' property)";
      ERR_ZIP_NOT_EMPTY = "Zip file not empty";
      ERR_INVALID_UID = "Invalid uid (must be integer 0..2^32-1)";
      ERR_INVALID_GID = "Invalid gid (must be integer 0..2^32-1)";
      ERR_INVALID_UNIX_MODE = "Invalid UNIX mode (must be integer 0..65535)";
      ERR_INVALID_UNIX_EXTRA_FIELD_TYPE = "Invalid unixExtraFieldType (must be 'infozip' or 'unix')";
      ERR_INVALID_UNIX_ID_SIZE = "uid/gid must be 0..65535 for unixExtraFieldType 'unix' (use 'infozip' for larger ids)";
      ERR_INVALID_MSDOS_ATTRIBUTES = "Invalid msdosAttributesRaw (must be integer 0..255)";
      ERR_INVALID_MSDOS_DATA = "Invalid msdosAttributes (must be an object with boolean flags)";
      ERR_INVALID_LEVEL = "Invalid level (must be integer 0..9)";
      ERR_INVALID_UNCOMPRESSED_SIZE_OPTION = "Invalid uncompressedSize option (must be a non-negative integer)";
      ERR_INVALID_SIGNATURE_DATA = "Signature data exceeds 64KB";
      ERR_INVALID_ENTRY = "Invalid entry option (must be an entry returned by ZipReader#getEntries())";
      ERR_ZIP_CRYPTO_LAST_MOD_DATE = "The last modification date of an entry encrypted with ZipCrypto cannot be changed when passThrough is set";
      WARNING_COMPRESSION_UNAVAILABLE = "compression unavailable";
      WARNING_CLAMPED_LAST_MODIFICATION_DATE = "clamped last modification date";
      EXTRAFIELD_DATA_AES = new Uint8Array([7, 0, 2, 0, 65, 69, 3, 0, 0]);
      EXTRAFIELD_OFFSET_AES_VENDOR_VERSION = 4;
      EXTRAFIELD_OFFSET_AES_COMPRESSION_METHOD = 9;
      EXTRAFIELD_USDZ_MAX_LENGTH = 67;
      MIN_PRINTABLE_ASCII_CHARACTER_CODE = 32;
      MAX_PRINTABLE_ASCII_CHARACTER_CODE = 126;
      VENDOR_VERSION_AE_12 = 1;
      INFOZIP_EXTRA_FIELD_TYPE = "infozip";
      UNIX_EXTRA_FIELD_TYPE = "unix";
      LEVEL_BY_BITFLAG_LEVEL = [8, 9, 5, 3];
      MAX_LEVEL = 9;
      workers = 0;
      pendingEntries = [];
      ZipWriter = class {
        constructor(writer, options = {}) {
          writer = new GenericWriter(writer);
          const { availableSize = INFINITY_VALUE, maxSize = INFINITY_VALUE } = writer;
          const addSplitZipSignature = availableSize > 0 && availableSize !== INFINITY_VALUE && maxSize > 0 && maxSize !== INFINITY_VALUE;
          if (addSplitZipSignature && options[OPTION_USDZ]) {
            throw new Error(ERR_UNSUPPORTED_SPLIT_USDZ);
          }
          Object.assign(this, {
            writer,
            addSplitZipSignature,
            options,
            fileEntries: /* @__PURE__ */ new Map(),
            filenames: /* @__PURE__ */ new Set(),
            offset: options[OPTION_OFFSET] === UNDEFINED_VALUE ? writer.size || writer.writable.size || 0 : options[OPTION_OFFSET],
            initialOffset: options[OPTION_OFFSET] === UNDEFINED_VALUE ? 0 : options[OPTION_OFFSET] - (writer.size || writer.writable.size || 0),
            pendingAddFileCalls: /* @__PURE__ */ new Set(),
            pendingErrors: [],
            warnings: [],
            bufferedWrites: 0,
            directWrites: 0,
            lastFileEntry: UNDEFINED_VALUE,
            archiveClosed: false
          });
        }
        prependZip(reader) {
          return watchPromiseError(this, prependZipEntries(this, reader));
        }
        appendZip(reader, options = {}) {
          return watchPromiseError(this, appendZipEntries(this, reader, options));
        }
        add(name = "", reader, options = {}) {
          const zipWriter = this;
          const { pendingAddFileCalls } = zipWriter;
          const promiseAddFile = addFileEntry(zipWriter, name, reader, options);
          pendingAddFileCalls.add(promiseAddFile);
          const deletePendingAddFileCall = () => pendingAddFileCalls.delete(promiseAddFile);
          Promise.prototype.then.call(promiseAddFile, deletePendingAddFileCall, deletePendingAddFileCall);
          return watchPromiseError(zipWriter, promiseAddFile);
        }
        remove(entry) {
          const { filenames, fileEntries } = this;
          if (typeof entry == STRING_TYPE) {
            entry = fileEntries.get(entry);
          }
          if (entry && entry.filename !== UNDEFINED_VALUE) {
            const { filename } = entry;
            if (filenames.has(filename) && fileEntries.has(filename)) {
              filenames.delete(filename);
              fileEntries.delete(filename);
              return true;
            }
          }
          return false;
        }
        close(comment = EMPTY_UINT8_ARRAY, options = {}) {
          const zipWriter = this;
          if (zipWriter.archiveClosed) {
            return Promise.resolve(getWriterData(zipWriter.writer));
          }
          if (!zipWriter.pendingClose) {
            zipWriter.pendingClose = closeArchive(zipWriter, comment, options).finally(() => zipWriter.pendingClose = UNDEFINED_VALUE);
          }
          return zipWriter.pendingClose;
        }
        [SYMBOL_ASYNC_DISPOSE]() {
          return this.close();
        }
      };
      WatchedPromise = class extends Promise {
        then(onFulfilled, onRejected) {
          const { watcher } = this;
          if (watcher) {
            watcher.observed = true;
          }
          return super.then(onFulfilled, onRejected);
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/zip-core-writer.js
  var init_zip_core_writer = __esm({
    "node_modules/@zip.js/zip.js/lib/zip-core-writer.js"() {
      init_codec_worker_web();
      init_zip_writer();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/default-mime-type.js
  var init_default_mime_type = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/default-mime-type.js"() {
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/compression-methods.js
  var init_compression_methods = __esm({
    "node_modules/@zip.js/zip.js/lib/core/compression-methods.js"() {
      init_constants();
      init_configuration();
      init_codec_registry();
      init_zip_entry_stream();
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/version.js
  var init_version = __esm({
    "node_modules/@zip.js/zip.js/lib/core/version.js"() {
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/opfs-temp-stream.js
  var DEFAULT_THRESHOLD;
  var init_opfs_temp_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/opfs-temp-stream.js"() {
      DEFAULT_THRESHOLD = 1024 * 1024;
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/blob-temp-stream.js
  var DEFAULT_THRESHOLD2;
  var init_blob_temp_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/blob-temp-stream.js"() {
      init_compatible_streams();
      DEFAULT_THRESHOLD2 = 1024 * 1024;
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/util/sync-access-handle-temp-stream.js
  var DEFAULT_THRESHOLD3, READ_CHUNK_SIZE;
  var init_sync_access_handle_temp_stream = __esm({
    "node_modules/@zip.js/zip.js/lib/core/util/sync-access-handle-temp-stream.js"() {
      DEFAULT_THRESHOLD3 = 1024 * 1024;
      READ_CHUNK_SIZE = 512 * 1024;
    }
  });

  // node_modules/@zip.js/zip.js/lib/zip-core-base.js
  var import_meta;
  var init_zip_core_base = __esm({
    "node_modules/@zip.js/zip.js/lib/zip-core-base.js"() {
      init_configuration();
      init_zip_core_reader();
      init_zip_core_writer();
      init_io();
      init_options();
      init_default_mime_type();
      init_configuration();
      init_codec_registry();
      init_compression_methods();
      init_version();
      init_opfs_temp_stream();
      init_blob_temp_stream();
      init_sync_access_handle_temp_stream();
      import_meta = {};
      try {
        setDefaultConfiguration({ baseURI: import_meta.url });
      } catch {
      }
    }
  });

  // node_modules/@zip.js/zip.js/lib/core/streams/zlib-js/zlib-streams.min.js
  function M(e, t, n, r, i) {
    if (0 == i) return;
    let f2 = e instanceof p ? e : new p(e.buffer, e.byteOffset, e.byteLength), l = n instanceof p ? n.subarray(r, r + i) : new p(n.buffer, n.byteOffset + r, i);
    f2.set(l, t);
  }
  function Ve(e, t, n) {
    0 != n && (e instanceof p ? e : new p(e.buffer, e.byteOffset, e.byteLength)).fill(0, t, t + n);
  }
  function je() {
    return { next_in: Z2, next_in_index: 0, avail_in: 0, total_in: 0, next_out: Z2, next_out_index: 0, avail_out: 0, total_out: 0, msg: "", t: 0, i: 0, l: 0, _: void 0 };
  }
  function $e(e, t) {
    let n = 1 << t;
    return { o: e, u: new p(n), h: n, k: t, m: 0, v: 0, p: 0, T: 0 };
  }
  function te(e) {
    let t = [];
    for (let n = 0; n < e.length; n += 2) {
      let r = e[n], i = e[n + 1];
      for (let e2 = 0; e2 < i; e2++) t.push(r);
    }
    return new g(t);
  }
  function D_(e) {
    return J_[e < -6 || e > 2 ? 9 : 2 - e] || "";
  }
  function we(e, t) {
    try {
      e.msg = D_(t);
    } catch (n) {
      e.msg = "zlib error " + String(t) + " (" + n + ")";
    }
    return t;
  }
  function Qe(e, t) {
    let n = e >>> 0, r = 0;
    for (let e2 = 0; e2 < t; e2++) r = r << 1 | 1 & n, n >>>= 1;
    return r;
  }
  function T8(e, t) {
    e.D[e.j++] = t;
  }
  function Ae(e, t) {
    T8(e, 255 & t), T8(e, t >>> 8 & 255);
  }
  function e_(e, t, n) {
    let r = 255 & n, i = 65535 & t, f2 = e.A + e.N;
    return e.D[f2] = 255 & i, e.D[f2 + 1] = i >>> 8 & 255, e.D[f2 + 2] = r, e.N += 3, i = i - 1 & 65535, e.H[__[r] + ie + 1].R++, e.J[y_(i)].R++, e.N == e.U;
  }
  function De(e, t) {
    let n = 255 & t, r = e.A + e.N;
    return e.D[r] = 0, e.D[r + 1] = 0, e.D[r + 2] = n, e.N += 3, e.H[n].R++, e.N == e.U;
  }
  function ye(e) {
    return e.h - ae;
  }
  function y_(e) {
    return e < 256 ? A_[e] : A_[256 + (e >> 7)];
  }
  function v_(e) {
    let t = Ce + 7, n = 1 << t, r = (1 << t) - 1, i = O2.floor((t + I - 1) / I), f2 = 1 << 8 + Ce;
    return { ...$e(e, 15), o: e, Y: 42, P: 0, B: void 0, F: 32767, G: t, V: n, L: r, X: i, $: new g(32768), K: new g(n), ee: f2, D: new p(32768), te: 0, ne: 32768, j: 0, re: 0, ie: 0, fe: 0, le: 0, _e: 0, oe: -2, ae: 0, ue: 0, ce: 0, se: 0, he: 0, de: 0, we: 0, be: 0, ke: 0, ge: 0, me: 0, ve: 0, pe: 0, xe: 0, Te: new R2(2 * Te + 1), ye: new p(2 * Te + 1), Ie: new g(be + 1), N: 0, U: 0, Me: Z2, A: 0, ze: 0, Ce: 0, Ze: 8, We: 32768, qe: 0, Oe: 0, Se: 0, H: new k2(fe).fill(0).map(() => J()), J: new k2(2 * me + 1).fill(0).map(() => J()), De: new k2(2 * oe + 1).fill(0).map(() => J()), je: w_(), Ae: w_(), Qe: w_() };
  }
  function I_(e) {
    let t = [];
    for (let n = 0; n < e.length; n += 2) {
      let r = e[n], i = e[n + 1], f2 = J();
      f2.Ne = r, f2.Re = i, t.push(f2);
    }
    return t;
  }
  function J() {
    return { R: 0, Ne: 0, He: 0, Re: 0 };
  }
  function w_() {
    return new ne([], bn(null, Z2, 0, 0, 0));
  }
  function bn(e, t, n, r, i) {
    return new re(e, t, n, r, i);
  }
  function Q_() {
    let e = new k2(288).fill(0);
    for (let t = 0; t <= 143; t++) e[t] = 8;
    for (let t = 144; t <= 255; t++) e[t] = 9;
    for (let t = 256; t <= 279; t++) e[t] = 7;
    for (let t = 280; t <= 287; t++) e[t] = 8;
    return e;
  }
  function k_(e) {
    let { code: t, length: n } = sn(e), r = new g(2 * e.length), i = 0;
    for (let f2 = 0; f2 < e.length; f2++) {
      let e2 = n[f2] || 0, l = t[f2] || 0;
      r[i++] = e2 ? Qe(l, e2) : 0, r[i++] = e2;
    }
    return new g(r);
  }
  function et(e, t, n) {
    let r = 0;
    for (let n2 = 0; n2 < e.length; n2++) {
      let i2 = t[n2] ? 1 << t[n2] : 1, f3 = e[n2] + i2 - 1;
      f3 > r && (r = f3);
    }
    r < n && (r = n);
    let i = new p(r + 1);
    for (let n2 = 0; n2 <= r; n2++) for (let r2 = 0; r2 < e.length; r2++) {
      let f3 = t[r2] ? 1 << t[r2] : 1, l = e[r2];
      if (n2 >= l && n2 <= l + f3 - 1) {
        i[n2] = r2;
        break;
      }
    }
    let f2 = 0;
    for (let n2 = 0; n2 < e.length - 1; n2++) {
      let r2 = t[n2] ? 1 << t[n2] : 1, i2 = e[n2] + r2 - 1;
      i2 > f2 && (f2 = i2);
    }
    return i[f2] = e.length - 1, i;
  }
  function _t(e, t) {
    let n = 0;
    for (let r2 = 0; r2 < e.length; r2++) {
      let i = t[r2] ? 1 << t[r2] : 1, f2 = e[r2] + i - 1;
      f2 > n && (n = f2);
    }
    let r = new p(n + 1);
    for (let i = 0; i <= n; i++) for (let n2 = 0; n2 < e.length; n2++) {
      let f2 = t[n2] ? 1 << t[n2] : 1, l = e[n2];
      if (i >= l && i <= l + f2 - 1) {
        r[i] = n2;
        break;
      }
    }
    return r;
  }
  function tt(e) {
    let t = new p(512), n = e.length - 1;
    for (let r = 0; r < 256; r++) t[r] = r <= n ? e[r] : e[n];
    for (let r = 256; r <= n; r++) {
      let n2 = r >> 7;
      t[256 + (n2 > 255 ? 255 : n2)] = e[r];
    }
    for (let e2 = 257; e2 < 512; e2++) 0 == t[e2] && (t[e2] = t[e2 - 1]);
    return t;
  }
  function sn(e) {
    let t = O2.max(...e), n = new k2(t + 1).fill(0);
    for (let t2 of e) t2 > 0 && n[t2]++;
    let r = new k2(e.length).fill(0), i = new k2(t + 1).fill(0), f2 = 0;
    for (let e2 = 1; e2 <= t; e2++) f2 = f2 + n[e2 - 1] << 1, i[e2] = f2;
    for (let t2 = 0; t2 < e.length; t2++) {
      let n2 = e[t2];
      0 != n2 && (r[t2] = i[n2]++);
    }
    return { code: r, length: e };
  }
  function se(e, t, n) {
    if (void 0 === t || void 0 === n) return 1;
    let r = 65535 & e, i = e >>> 16 & 65535, f2 = 0;
    for (; n > 0; ) {
      let e2 = n > 2e3 ? 2e3 : n;
      n -= e2;
      do {
        r = r + t[f2++] | 0, i = i + r | 0;
      } while (--e2);
      r %= 65521, i %= 65521;
    }
    return (i << 16 | r) >>> 0;
  }
  function W2(e = 0, t, n) {
    if (!t) return 0;
    void 0 === n && (n = t.length);
    let r = 0 | ~e, i = 0;
    if ((n = O2.min(n, t.length)) >= 8) {
      let e2 = new DataView(t.buffer, t.byteOffset, n), f2 = n - 8;
      for (; i <= f2; i += 8) {
        let t2 = r ^ e2.getInt32(i, true), n2 = e2.getInt32(i + 4, true);
        r = Dn[255 & t2] ^ An[t2 >>> 8 & 255] ^ wn[t2 >>> 16 & 255] ^ Tn[t2 >>> 24 & 255] ^ gn[255 & n2] ^ En[n2 >>> 8 & 255] ^ Sn[n2 >>> 16 & 255] ^ ut[n2 >>> 24 & 255];
      }
    }
    for (; i < n; i++) r = r >>> 8 ^ ut[255 & (r ^ t[i])];
    return (4294967295 ^ r) >>> 0;
  }
  function xt(e) {
    16 == e.T ? (Ae(e, e.p), e.p = 0, e.T = 0) : e.T >= 8 && (T8(e, e.p), e.p >>= 8, e.T -= 8);
  }
  function pt(e) {
    e.T > 8 ? Ae(e, e.p) : e.T > 0 && T8(e, e.p), e.ze = 1 + (e.T - 1 & 7), e.p = 0, e.T = 0;
  }
  function yn(e, t, n) {
    let r, i, f2 = [], l = 0;
    for (r = 1; r <= be; r++) l = l + n[r - 1] << 1, f2[r] = l;
    for (i = 0; i <= t; i++) {
      let t2 = e[i].Re;
      0 != t2 && (e[i].Ne = Qe(f2[t2]++, t2));
    }
  }
  function C2(e, t, n) {
    e.T > Ue - n ? (e.p = 65535 & (e.p | t << e.T), Ae(e, e.p), e.p = t >> Ue - e.T & 65535, e.T += n - Ue) : (e.p = 65535 & (e.p | t << e.T), e.T += n);
  }
  function St(e) {
    for (let t = 0; t < e.H.length; t++) e.H[t].R = 0;
    for (let t = 0; t < e.J.length; t++) e.J[t].R = 0;
    for (let t = 0; t < e.De.length; t++) e.De[t].R = 0;
    e.H[ve].R = 1, e.ie = e.fe = 0, e.N = e.le = 0;
  }
  function Et(e) {
    if (e.H && e.H.length >= fe) for (let t = 0; t < fe; t++) e.H[t] = J();
    else {
      e.H = [];
      for (let t = 0; t < fe; t++) e.H.push(J());
    }
    if (e.J && e.J.length >= 2 * me + 1) for (let t = 0; t < 2 * me + 1; t++) e.J[t] = J();
    else {
      e.J = [];
      for (let t = 0; t < 2 * me + 1; t++) e.J.push(J());
    }
    if (e.De && e.De.length >= 2 * oe + 1) for (let t = 0; t < 2 * oe + 1; t++) e.De[t] = J();
    else {
      e.De = [];
      for (let t = 0; t < 2 * oe + 1; t++) e.De.push(J());
    }
    e.je = new ne(e.H, new re(Fe, a_, ie + 1, Te, be)), e.Ae = new ne(e.J, new re(R_, i_, 0, me, be)), e.Qe = new ne(e.De, new re(null, Be, 0, oe, 7)), e.p = 0, e.T = 0, e.ze = 0, St(e);
  }
  function vn(e, t, n) {
    return n = e.Te[he], e.Te[he] = e.Te[e.Oe--], z_(e, t, he), n;
  }
  function mt(e, t, n, r) {
    return e[t].R < e[n].R || e[t].R == e[n].R && r[t] <= r[n];
  }
  function z_(e, t, n) {
    let r = e.Te[n], i = n << 1;
    for (; i <= e.Oe && (i < e.Oe && mt(t, e.Te[i + 1], e.Te[i], e.ye) && i++, !mt(t, r, e.Te[i], e.ye)); ) e.Te[n] = e.Te[i], n = i, i <<= 1;
    e.Te[n] = r;
  }
  function In(e, t) {
    let n, r, i, f2, l, _, o = t.I, a = t.C, u = t.M.Z, c = t.M.W, s = t.M.q, h = t.M.S, d = 0;
    for (f2 = 0; f2 <= be; f2++) e.Ie[f2] = 0;
    for (o[e.Te[e.Se]].Re = 0, n = e.Se + 1; n < fe; n++) r = e.Te[n], f2 = o[o[r].He].Re + 1, f2 > h && (f2 = h, d++), o[r].Re = f2, !(r > a) && (e.Ie[f2]++, l = 0, r >= s && (l = c[r - s]), _ = o[r].R, e.ie += _ * (f2 + l), u && (e.fe += _ * (u[r].Re + l)));
    if (0 != d) {
      do {
        for (f2 = h - 1; 0 == e.Ie[f2]; ) f2--;
        e.Ie[f2]--, e.Ie[f2 + 1] += 2, e.Ie[h]--, d -= 2;
      } while (d > 0);
      for (f2 = h; 0 != f2; f2--) for (r = e.Ie[f2]; 0 != r; ) i = e.Te[--n], !(i > a) && (o[i].Re != f2 && (e.ie += (f2 - o[i].Re) * o[i].R, o[i].Re = f2), r--);
    }
  }
  function O_(e, t) {
    let n, r, i, f2 = t.I, l = t.M.Z, _ = t.M.O, o = -1;
    for (e.Oe = 0, e.Se = fe, n = 0; n < _; n++) 0 != f2[n].R ? (e.Te[++e.Oe] = o = n, e.ye[n] = 0) : f2[n].Re = 0;
    for (; e.Oe < 2; ) i = e.Te[++e.Oe] = o < 2 ? ++o : 0, f2[i].R = 1, e.ye[i] = 0, e.ie--, l && (e.fe -= l[i].Re);
    for (t.C = o, n = O2.floor(e.Oe / 2); n >= 1; n--) z_(e, f2, n);
    i = _;
    do {
      n = vn(e, f2, n), r = e.Te[he], e.Te[--e.Se] = n, e.Te[--e.Se] = r, f2[i].R = f2[n].R + f2[r].R, e.ye[i] = (e.ye[n] >= e.ye[r] ? e.ye[n] : e.ye[r]) + 1, f2[n].He = f2[r].He = i, e.Te[he] = i++, z_(e, f2, he);
    } while (e.Oe >= 2);
    e.Te[--e.Se] = e.Te[he], In(e, t), yn(f2, t.C, e.Ie);
  }
  function bt(e, t, n) {
    let r, i, f2 = -1, l = t[0].Re, _ = 0, o = 7, a = 4;
    for (0 == l && (o = 138, a = 3), t[n + 1].Re = 65535, r = 0; r <= n; r++) i = l, l = t[r + 1].Re, !(++_ < o && i == l) && (_ < a ? e.De[i].R += _ : 0 != i ? (i != f2 && e.De[i].R++, e.De[t_].R++) : _ <= 10 ? e.De[n_].R++ : e.De[r_].R++, _ = 0, f2 = i, 0 == l ? (o = 138, a = 3) : i == l ? (o = 6, a = 3) : (o = 7, a = 4));
  }
  function st(e, t, n) {
    let r, i = -1, f2 = t[0].Re, l = 0, _ = 7, o = 4;
    0 == f2 && (_ = 138, o = 3);
    for (let a = 0; a <= n; a++) if (r = f2, f2 = t[a + 1].Re, !(++l < _ && r == f2)) {
      if (l < o) do {
        C2(e, e.De[r].Ne, e.De[r].Re);
      } while (0 != --l);
      else 0 != r ? (r != i && (C2(e, e.De[r].Ne, e.De[r].Re), l--), C2(e, e.De[t_].Ne, e.De[t_].Re), C2(e, l - 3, 2)) : l <= 10 ? (C2(e, e.De[n_].Ne, e.De[n_].Re), C2(e, l - 3, 3)) : (C2(e, e.De[r_].Ne, e.De[r_].Re), C2(e, l - 11, 7));
      l = 0, i = r, 0 == f2 ? (_ = 138, o = 3) : r == f2 ? (_ = 6, o = 3) : (_ = 7, o = 4);
    }
  }
  function kn(e) {
    let t;
    for (bt(e, e.H, e.je.C), bt(e, e.J, e.Ae.C), O_(e, e.Qe), t = oe - 1; t >= 3 && 0 == e.De[pe[t]].Re; t--) ;
    return e.ie += 3 * (t + 1) + 5 + 5 + 4, t;
  }
  function Nn(e, t, n, r) {
    let i;
    for (C2(e, t - 257, 5), C2(e, n - 1, 5), C2(e, r - 4, 4), i = 0; i < r; i++) C2(e, e.De[pe[i]].Re, 3);
    st(e, e.H, t - 1), st(e, e.J, n - 1);
  }
  function Pe(e, t, n, r, i = 0) {
    C2(e, (ft << 1) + r, 3), pt(e), Ae(e, n), Ae(e, ~n), n && t && M(e.D, e.j, t, i, n), e.j += n;
  }
  function gt(e) {
    xt(e);
  }
  function Tt(e) {
    C2(e, N_ << 1, 3), C2(e, Fe[ve].Ne, Fe[ve].Re), xt(e);
  }
  function ht(e, t, n) {
    let r, i, f2, l, _ = 0;
    if (0 != e.N) do {
      r = 255 & e.Me[_], r += (255 & e.Me[_ + 1]) << 8, i = e.Me[_ + 2], _ += 3, 0 == r ? C2(e, t[i].Ne, t[i].Re) : (f2 = __[i], C2(e, t[f2 + ie + 1].Ne, t[f2 + ie + 1].Re), l = a_[f2], 0 != l && (i -= ge[f2], C2(e, i, l)), r--, f2 = y_(r), C2(e, n[f2].Ne, n[f2].Re), l = i_[f2], 0 != l && (r -= Ee[f2], C2(e, r, l)));
    } while (_ < e.N);
    C2(e, t[ve].Ne, t[ve].Re);
  }
  function Rn(e) {
    let t, n = 4093624447;
    for (t = 0; t <= 31; t++, n >>= 1) if (1 & n && 0 != e.H[t].R) return 0;
    if (0 != e.H[9].R || 0 != e.H[10].R || 0 != e.H[13].R) return 1;
    for (t = 32; t < ie; t++) if (0 != e.H[t].R) return 1;
    return 0;
  }
  function wt(e, t, n, r, i = 0) {
    let f2, l, _ = 0;
    e.ke > 0 ? (2 == e.o.t && (e.o.t = Rn(e)), O_(e, e.je), O_(e, e.Ae), _ = kn(e), f2 = e.ie + 3 + 7 >> 3, l = e.fe + 3 + 7 >> 3, (l <= f2 || 4 == e.ge) && (f2 = l)) : f2 = l = n + 5, n + 4 <= f2 && t ? Pe(e, t, n, r, i) : l == f2 ? (C2(e, (N_ << 1) + r, 3), ht(e, Fe, R_)) : (C2(e, (lt << 1) + r, 3), Nn(e, e.je.C + 1, e.Ae.C + 1, _ + 1), ht(e, e.H, e.J)), St(e), r && pt(e);
  }
  function vt() {
    let e = je();
    return e._ = v_(e), e;
  }
  function At(e) {
    return 2 * e - (e > 4 ? 9 : 0);
  }
  function l_(e, t, n) {
    return ((t << e.X ^ n) & e.L) >>> 0;
  }
  function u_(e, t) {
    e.be = l_(e, e.be, e.u[t + (I - 1)]);
    let n = e.$[t & e.F] = e.K[e.be];
    return e.K[e.be] = t, n;
  }
  function It(e) {
    e.K[e.V - 1] = 0, Ve(e.K, 0, (e.V - 1) * e.K.BYTES_PER_ELEMENT);
  }
  function Bn(e) {
    let t, n, r = e.h;
    for (t = e.V; t > 0; ) t--, n = e.K[t], e.K[t] = n >= r ? n - r : 0;
    for (t = r; t > 0; ) t--, n = e.$[t], e.$[t] = n >= r ? n - r : 0;
  }
  function H_(e, t, n, r) {
    let i = e.avail_in;
    return i > r && (i = r), 0 == i ? 0 : (e.avail_in -= i, M(t, n, e.next_in, e.next_in_index, i), 1 == e._.P ? e.i = se(e.i, new p(t.buffer, t.byteOffset + n, i), i) : 2 == e._.P && (e.i = W2(e.i, new p(t.buffer, t.byteOffset + n, i), i)), e.next_in_index += i, e.total_in += i, i);
  }
  function c_(e) {
    let t, n, r = e.h;
    do {
      if (n = e.We - e.ce - e.ue, 0 == n && 0 == e.ue && 0 == e.ce ? n = r : -1 == n && n--, e.ue >= r + ye(e) && (M(e.u, 0, e.u, r, r - n), e.qe -= r, e.ue -= r, e.ae -= r, e._e > e.ue && (e._e = e.ue), Bn(e), n += r), 0 == e.o.avail_in) break;
      if (t = H_(e.o, e.u, e.ue + e.ce, n), e.ce += t, e.ce + e._e >= I) {
        let t2 = e.ue - e._e;
        for (e.be = e.u[t2], e.be = l_(e, e.be, e.u[t2 + 1]); e._e && (e.be = l_(e, e.be, e.u[t2 + I - 1]), e.$[t2 & e.F] = e.K[e.be], e.K[e.be] = t2, t2++, e._e--, !(e.ce + e._e < I)); ) ;
      }
    } while (e.ce < ae && 0 != e.o.avail_in);
    if (e.m < e.We) {
      let t2, n2 = e.ue + e.ce;
      e.m < n2 ? (t2 = e.We - n2, t2 > He && (t2 = He), Ve(e.u, n2, t2), e.m = n2 + t2) : e.m < n2 + He && (t2 = n2 + He - e.m, t2 > e.We - e.m && (t2 = e.We - e.m), Ve(e.u, e.m, t2), e.m += t2);
    }
  }
  function kt(e, t, n = 8, r = 15, i = Ce, f2 = 0) {
    let l = 1;
    if (!e) return -2;
    if (e.msg = "", -1 == t && (t = 6), r < 0) {
      if (l = 0, r < -15) return -2;
      r = -r;
    } else r > 15 && (l = 2, r -= 16);
    if (i < 1 || i > rt || 8 != n || r < 8 || r > 15 || t < 0 || t > 9 || f2 < 0 || f2 > 4 || 8 == r && 1 != l) return -2;
    8 == r && (r = 9);
    let _ = v_(e);
    return _ ? (e._ = _, _.o = e, _.Y = 42, _.P = l, _.B = void 0, _.k = r, _.h = 1 << _.k, _.F = _.h - 1, _.G = i + 7, _.V = 1 << _.G, _.L = _.V - 1, _.X = (_.G + I - 1) / I, _.u = new p(2 * _.h), _.$ = new g(_.h), _.K = new g(_.V), _.m = 0, _.ee = 1 << i + 6, _.D = new p(_.ee * ot), _.ne = 4 * _.ee, _.u && _.$ && _.K && _.D ? (_.Me = _.D.subarray(_.ee), _.A = _.te + _.ee, _.U = 3 * (_.ee - 1), _.ke = t, _.ge = f2, _.Ze = n, Pn(e)) : (_.Y = 666, e.msg = D_(-4), P_(e), -4)) : -4;
  }
  function Z_(e) {
    if (null == e) return true;
    let t = e._;
    return !t || t.o != e || 42 != t.Y && 57 != t.Y && 69 != t.Y && 73 != t.Y && 91 != t.Y && 103 != t.Y && 113 != t.Y && 666 != t.Y;
  }
  function Fn(e) {
    let t;
    return Z_(e) ? -2 : (e.total_in = e.total_out = 0, e.msg = "", e.t = 2, t = e._, t.j = 0, t.re = t.te, t.P < 0 && (t.P = -t.P), t.Y = 2 == t.P ? 57 : 42, e.i = 2 == t.P ? W2(0) : se(0), t.oe = -2, Et(t), 0);
  }
  function Zn(e) {
    e.We = 2 * e.h, It(e), e.xe = Ye[e.ke].Ee, e.me = Ye[e.ke].Ue, e.ve = Ye[e.ke].Ye, e.pe = Ye[e.ke].Pe, e.ue = 0, e.ae = 0, e.ce = 0, e._e = 0, e.se = e.he = I - 1, e.we = 0, e.be = 0;
  }
  function Pn(e) {
    let t = Fn(e);
    return 0 == t && Zn(e._), t;
  }
  function Me(e, t) {
    T8(e, t >> 8), T8(e, 255 & t);
  }
  function q(e) {
    let t, n = e._;
    gt(n), t = n.j, t > e.avail_out && (t = e.avail_out), 0 != t && (M(e.next_out, e.next_out_index, n.D, n.re, t), e.next_out_index += t, n.re += t, e.total_out += t, e.avail_out -= t, n.j -= t, 0 == n.j && (n.re = n.te));
  }
  function Ie(e, t) {
    let n = e._;
    n.B && n.B.Be && (e.i = W2(e.i, new p(n.D.buffer, n.te + t, n.j - t), n.j - t));
  }
  function Nt(e, t) {
    let n, r = e._;
    if (Z_(e) || t > 5 || t < 0) return we(e, -2);
    if (!e.next_out || 0 != e.avail_in && !e.next_in || 666 == r.Y && 4 != t) return we(e, -2);
    if (0 == e.avail_out) return we(e, -5);
    if (n = r.oe, r.oe = t, 0 != r.j) {
      if (q(e), 0 == e.avail_out) return r.oe = Q, 0;
    } else if (0 == e.avail_in && At(t) <= At(n) && 4 != t) return we(e, -5);
    if (666 == r.Y && 0 != e.avail_in) return we(e, -5);
    if (42 == r.Y && 0 == r.P && (r.Y = 113), 42 == r.Y) {
      let t2, n2 = 8 + (r.k - 8 << 4) << 8;
      if (t2 = r.ge >= 2 || r.ke < 2 ? 0 : r.ke < 6 ? 1 : 6 == r.ke ? 2 : 3, n2 |= t2 << 6, 0 != r.ue && (n2 |= it), n2 += 31 - n2 % 31, Me(r, n2), 0 != r.ue && (Me(r, e.i >> 16), Me(r, 65535 & e.i)), e.i = 1, r.Y = 113, q(e), 0 != r.j) return r.oe = Q, 0;
    }
    if (57 == r.Y) {
      if (e.i = W2(0), T8(r, 31), T8(r, 139), T8(r, 8), r.B) T8(r, (r.B.Fe ? 1 : 0) + (r.B.Be ? 2 : 0) + (null == r.B.Ge ? 0 : 4) + (null == r.B.Ve ? 0 : 8) + (null == r.B.Le ? 0 : 16)), T8(r, 255 & r.B.Xe), T8(r, r.B.Xe >>> 8 & 255), T8(r, r.B.Xe >>> 16 & 255), T8(r, r.B.Xe >>> 24 & 255), T8(r, 9 == r.ke ? 2 : r.ge >= 2 || r.ke < 2 ? 4 : 0), T8(r, 255 & r.B.$e), null != r.B.Ge && (T8(r, 255 & r.B.Ke), T8(r, r.B.Ke >>> 8 & 255)), r.B.Be && (e.i = W2(e.i, r.D, r.j)), r.Ce = 0, r.Y = 69;
      else if (T8(r, 0), T8(r, 0), T8(r, 0), T8(r, 0), T8(r, 0), T8(r, 9 == r.ke ? 2 : r.ge >= 2 || r.ke < 2 ? 4 : 0), T8(r, at), r.Y = 113, q(e), 0 != r.j) return r.oe = Q, 0;
    }
    if (69 == r.Y) {
      if (r.B && null != r.B.Ge) {
        let t2 = r.j, n2 = (65535 & r.B.Ke) - r.Ce;
        for (; r.j + n2 > r.ne; ) {
          let i = r.ne - r.j;
          if (M(r.D, r.j, r.B.Ge, r.Ce, i), r.j = r.ne, Ie(e, t2), r.Ce += i, q(e), 0 != r.j) return r.oe = Q, 0;
          t2 = 0, n2 -= i;
        }
        M(r.D, r.j, r.B.Ge, r.Ce, n2), r.j += n2, Ie(e, t2), r.Ce = 0;
      }
      r.Y = 73;
    }
    if (73 == r.Y) {
      if (r.B && r.B.Ve && r.B.Ve.length) {
        let t2, n2 = r.j;
        do {
          if (r.j == r.ne) {
            if (Ie(e, n2), q(e), 0 != r.j) return r.oe = Q, 0;
            n2 = 0;
          }
          t2 = r.B.Ve[r.Ce++], T8(r, t2);
        } while (0 != t2);
        Ie(e, n2), r.Ce = 0;
      }
      r.Y = 91;
    }
    if (91 == r.Y) {
      if (r.B && r.B.Le && r.B.Le.length) {
        let t2, n2 = r.j;
        do {
          if (r.j == r.ne) {
            if (Ie(e, n2), q(e), 0 != r.j) return r.oe = Q, 0;
            n2 = 0;
          }
          t2 = r.B.Le[r.Ce++], T8(r, t2);
        } while (0 != t2);
        Ie(e, n2);
      }
      r.Y = 103;
    }
    if (103 == r.Y) {
      if (r.B && r.B.Be) {
        if (r.j + 2 > r.ne && (q(e), 0 != r.j)) return r.oe = Q, 0;
        T8(r, 255 & e.i), T8(r, e.i >>> 8 & 255), e.i = W2(0);
      }
      if (r.Y = 113, q(e), 0 != r.j) return r.oe = Q, 0;
    }
    if (0 != e.avail_in || 0 != r.ce || 0 != t && 666 != r.Y) {
      let n2 = 0 == r.ke ? Ot(r, t) : 2 == r.ge ? Yn(r, t) : 3 == r.ge ? Mn(r, t) : Ye[r.ke].Je(r, t);
      if ((2 == n2 || 3 == n2) && (r.Y = 666), 0 == n2 || 2 == n2) return 0 == e.avail_out && (r.oe = Q), 0;
      if (1 == n2 && (1 == t ? Tt(r) : 5 != t && (Pe(r, null, 0, 0), 3 == t && (It(r), 0 == r.ce && (r.ue = 0, r.ae = 0, r._e = 0))), q(e), 0 == e.avail_out)) return r.oe = Q, 0;
    }
    return 4 != t ? 0 : r.P <= 0 ? 1 : (2 == r.P ? (T8(r, 255 & e.i), T8(r, e.i >>> 8 & 255), T8(r, e.i >>> 16 & 255), T8(r, e.i >>> 24 & 255), T8(r, 255 & e.total_in), T8(r, e.total_in >>> 8 & 255), T8(r, e.total_in >>> 16 & 255), T8(r, e.total_in >>> 24 & 255)) : (Me(r, e.i >>> 16 & 65535), Me(r, 65535 & e.i)), q(e), r.P > 0 && (r.P = -r.P), 0 != r.j ? 0 : 1);
  }
  function P_(e) {
    if (Z_(e)) return -2;
    let t = e._, n = t.Y;
    return t.u = Z2, t.$ = qe, t.K = qe, t.D = Z2, t.Me = Z2, t.Te = new R2(0), t.ye = Z2, t.Ie = qe, t.H.length = 0, t.J.length = 0, t.De.length = 0, t.B = void 0, t.te = 0, t.re = 0, t.A = 0, 113 == n ? -3 : 0;
  }
  function Rt(e, t) {
    let n, r, i = e.pe, f2 = e.ue, l = e.he, _ = e.ve, o = e.ue > ye(e) ? e.ue - ye(e) : 0, a = e.$, u = e.F, c = e.u, s = e.ce, h = ee < s ? ee : s, d = c[f2], w = c[f2 + 1], b = c[f2 + l - 1], k3 = c[f2 + l];
    l >= e.me && (i >>= 2), _ > s && (_ = s);
    do {
      if (n = t, c[n + l] != k3 || c[n + l - 1] != b || c[n] != d || c[n + 1] != w) continue;
      let i2 = 2;
      for (; i2 < h && c[f2 + i2] == c[n + i2]; ) i2++;
      if (r = i2, r > l) {
        if (e.qe = t, l = r, r >= _) break;
        b = c[f2 + l - 1], k3 = c[f2 + l];
      }
    } while ((t = a[t & u]) > o && 0 != --i);
    return l <= s ? l : s;
  }
  function zt(e, t) {
    wt(e, e.u, e.ue - e.ae, t, e.ae), e.ae = e.ue, q(e.o);
  }
  function j2(e, t) {
    return zt(e, t ? 1 : 0), 0 == e.o.avail_out ? t ? 2 : 0 : null;
  }
  function ke(e, t) {
    return e < t ? e : t;
  }
  function Ot(e, t) {
    let n, r, i, f2 = ke(e.ne - 5, e.h), l = 0, _ = e.o.avail_in;
    do {
      if (n = Dt, i = e.T + 42 >> 3, e.o.avail_out < i || (i = e.o.avail_out - i, r = e.ue - e.ae, n > r + e.o.avail_in && (n = r + e.o.avail_in), n > i && (n = i), n < f2 && (0 == n && 4 != t || 0 == t || n != r + e.o.avail_in))) break;
      l = 4 == t && n == r + e.o.avail_in ? 1 : 0, Pe(e, null, 0, l), e.D[e.j - 4] = n, e.D[e.j - 3] = n >> 8, e.D[e.j - 2] = ~n, e.D[e.j - 1] = ~n >> 8, q(e.o), r && (r > n && (r = n), M(e.o.next_out, e.o.next_out_index, e.u, e.ae, r), e.o.next_out_index += r, e.o.avail_out -= r, e.o.total_out += r, e.ae += r, n -= r), n && (H_(e.o, e.o.next_out, e.o.next_out_index, n), e.o.next_out_index += n, e.o.avail_out -= n, e.o.total_out += n);
    } while (0 == l);
    if (_ -= e.o.avail_in, _) {
      if (_ >= e.h) {
        e.le = 2;
        let t2 = e.o.next_in_index - e.h;
        M(e.u, 0, e.o.next_in, t2, e.h), e.ue = e.h, e._e = e.ue;
      } else e.We - e.ue <= _ && (e.ue -= e.h, M(e.u, 0, e.u, e.h, e.ue), e.le < 2 && e.le++, e._e > e.ue && (e._e = e.ue)), M(e.u, e.ue, e.o.next_in, e.o.next_in_index - _, _), e.ue += _, e._e += ke(_, e.h - e._e);
      e.ae = e.ue;
    }
    return e.m < e.ue && (e.m = e.ue), l ? (e.ze = 8, 3) : 0 != t && 4 != t && 0 == e.o.avail_in && e.ue == e.ae ? 1 : (i = e.We - e.ue, e.o.avail_in > i && e.ae >= e.h && (e.ae -= e.h, e.ue -= e.h, M(e.u, 0, e.u, e.h, e.ue), e.le < 2 && e.le++, i += e.h, e._e > e.ue && (e._e = e.ue)), i > e.o.avail_in && (i = e.o.avail_in), i && (H_(e.o, e.u, e.ue, i), e.ue += i, e._e += ke(i, e.h - e._e)), e.m < e.ue && (e.m = e.ue), i = e.T + 42 >> 3, i = ke(e.ne - i, Dt), f2 = ke(i, e.h), r = e.ue - e.ae, (r >= f2 || (r || 4 == t) && 0 != t && 0 == e.o.avail_in && r <= i) && (n = ke(r, i), l = 4 == t && 0 == e.o.avail_in && n == r ? 1 : 0, Pe(e, e.u, n, l, e.ae), e.ae += n, q(e.o)), l && (e.ze = 8), l ? 2 : 0);
  }
  function U_(e, t) {
    let n, r = false;
    for (; ; ) {
      if (e.ce < ae) {
        if (c_(e), e.ce < ae && 0 == t) return 0;
        if (0 == e.ce) break;
      }
      if (n = 0, e.ce >= I && (n = u_(e, e.ue)), 0 != n && e.ue - n <= ye(e) && (e.se = Rt(e, n)), e.se >= I) if (e.ue, e.qe, e.se, r = e_(e, e.ue - e.qe, e.se - I), e.ce -= e.se, e.se <= e.xe && e.ce >= I) {
        e.se--;
        do {
          e.ue++, n = u_(e, e.ue);
        } while (0 != --e.se);
        e.ue++;
      } else e.ue += e.se, e.se = 0, e.be = e.u[e.ue], e.be = l_(e, e.be, e.u[e.ue + 1]);
      else r = De(e, e.u[e.ue]), e.ce--, e.ue++;
      if (r) {
        let t2 = j2(e, false);
        if (null != t2) return t2;
      }
    }
    if (e._e = e.ue < I - 1 ? e.ue : I - 1, 4 == t) {
      let t2 = j2(e, true);
      return null != t2 ? t2 : 3;
    }
    if (e.N) {
      let t2 = j2(e, false);
      if (null != t2) return t2;
    }
    return 1;
  }
  function Ne(e, t) {
    let n, r = false;
    for (; ; ) {
      if (e.ce < ae) {
        if (c_(e), e.ce < ae && 0 == t) return 0;
        if (0 == e.ce) break;
      }
      if (n = 0, e.ce >= I && (n = u_(e, e.ue)), e.he = e.se, e.de = e.qe, e.se = I - 1, 0 != n && e.he < e.xe && e.ue - n <= ye(e) && (e.se = Rt(e, n), e.se <= 5 && (1 == e.ge || e.se == I && e.ue - e.qe > nt) && (e.se = I - 1)), e.he >= I && e.se <= e.he) {
        let t2 = e.ue + e.ce - I;
        e.ue, e.de, e.he, r = e_(e, e.ue - 1 - e.de, e.he - I), e.ce -= e.he - 1, e.he -= 2;
        do {
          ++e.ue <= t2 && (n = u_(e, e.ue));
        } while (0 != --e.he);
        if (e.we = 0, e.se = I - 1, e.ue++, r) {
          let t3 = j2(e, false);
          if (null != t3) return t3;
        }
      } else if (e.we) {
        if (r = De(e, e.u[e.ue - 1]), r && zt(e, 0), e.ue++, e.ce--, 0 == e.o.avail_out) return 0;
      } else e.we = 1, e.ue++, e.ce--;
    }
    if (e.we && (r = De(e, e.u[e.ue - 1]), e.we = 0), e._e = e.ue < I - 1 ? e.ue : I - 1, 4 == t) {
      let t2 = j2(e, true);
      return null != t2 ? t2 : 3;
    }
    if (e.N) {
      let t2 = j2(e, false);
      if (null != t2) return t2;
    }
    return 1;
  }
  function Mn(e, t) {
    let n, r, i, f2;
    for (; ; ) {
      if (e.ce <= ee) {
        if (c_(e), e.ce <= ee && 0 == t) return 0;
        if (0 == e.ce) break;
      }
      if (e.se = 0, e.ce >= I && e.ue > 0 && (i = e.ue - 1, r = e.u[i], r == ++i && r == ++i && r == ++i)) {
        f2 = e.ue + ee;
        do {
        } while (r == ++i && r == ++i && r == ++i && r == ++i && r == ++i && r == ++i && r == ++i && r == ++i && i < f2);
        e.se = ee - (f2 - i), e.se > e.ce && (e.se = e.ce);
      }
      if (e.se >= I ? (e.ue, e.ue, e.se, n = e_(e, 1, e.se - I), e.ce -= e.se, e.ue += e.se, e.se = 0) : (n = De(e, e.u[e.ue]), e.ce--, e.ue++), n) {
        let t2 = j2(e, false);
        if (null != t2) return t2;
      }
    }
    if (e._e = 0, 4 == t) {
      let t2 = j2(e, true);
      return null != t2 ? t2 : 3;
    }
    if (e.N) {
      let t2 = j2(e, false);
      if (null != t2) return t2;
    }
    return 1;
  }
  function Yn(e, t) {
    let n = false;
    for (; ; ) {
      if (0 == e.ce && (c_(e), 0 == e.ce)) {
        if (0 == t) return 0;
        break;
      }
      if (e.se = 0, n = De(e, e.u[e.ue]), e.ce--, e.ue++, n) {
        let t2 = j2(e, false);
        if (null != t2) return t2;
      }
    }
    if (e._e = 0, 4 == t) {
      let t2 = j2(e, true);
      return null != t2 ? t2 : 3;
    }
    if (e.N) {
      let t2 = j2(e, false);
      if (null != t2) return t2;
    }
    return 1;
  }
  function qt(e, t) {
    return t % 2 ? e : e + 16;
  }
  function Vt(e, t) {
    return t % 2 ? e : e + 128;
  }
  function $t(e, t) {
    let n, r = e._, i = e.next_in_index, f2 = e.next_out_index, l = e.next_in, _ = e.next_out, o = r.u, a = r.p >>> 0, u = r.T >>> 0, c = r.et, s = r.tt, h = (1 << r.nt) - 1, d = (1 << r.rt) - 1, w = r.h >>> 0, b = r.m >>> 0, k3 = r.v >>> 0, g2 = r.it, m2 = f2 - (t - e.avail_out), v = f2 + (e.avail_out - 257), p2 = i + (e.avail_in - 5), x = 0, T9 = 0, y2 = 0, I2 = 0;
    e: do {
      for (; u < 15; ) {
        if (!(i < l.length)) break e;
        a += l[i++] << u, u += 8;
      }
      n = c[a & h];
      t: for (; ; ) {
        if (y2 = n >>> 16 & 255, a >>>= y2, u -= y2, y2 = n >>> 24, 0 == y2) {
          _[f2++] = 65535 & n;
          break;
        }
        if (16 & y2) {
          if (x = 65535 & n, y2 &= 15, y2) {
            for (; u < y2; ) {
              if (!(i < l.length)) {
                r.ft = 16200;
                break e;
              }
              a += l[i++] << u, u += 8;
            }
            x += a & (1 << y2) - 1, a >>>= y2, u -= y2;
          }
          for (; u < 15; ) {
            if (!(i < l.length)) {
              r.ft = 16200;
              break e;
            }
            a += l[i++] << u, u += 8;
          }
          n = s[a & d];
          n: for (; ; ) {
            if (y2 = n >>> 16 & 255, a >>>= y2, u -= y2, y2 = n >>> 24, 16 & y2) {
              if (T9 = 65535 & n, y2 &= 15, y2) {
                for (; u < y2; ) {
                  if (!(i < l.length)) {
                    r.ft = 16200;
                    break e;
                  }
                  a += l[i++] << u, u += 8;
                }
                T9 += a & (1 << y2) - 1, a >>>= y2, u -= y2;
              }
              let t2 = x, c2 = f2 - m2;
              if (T9 > c2) {
                let n2 = T9 - c2;
                if (n2 > b && g2) {
                  e.msg = "invalid distance too far back", r.ft = 16209;
                  break e;
                }
                if (0 == k3) {
                  if (I2 = w - n2, !(n2 < t2)) {
                    for (let e2 = 0; e2 < t2; ++e2) _[f2++] = o[I2++];
                    continue e;
                  }
                  for (let e2 = 0; e2 < n2; ++e2) _[f2++] = o[I2++];
                  t2 -= n2, I2 = f2 - T9;
                } else if (k3 < n2) {
                  I2 = w + k3 - n2;
                  let e2 = n2 - k3;
                  if (!(e2 < t2)) {
                    for (let e3 = 0; e3 < t2; ++e3) _[f2++] = o[I2++];
                    continue e;
                  }
                  for (let t3 = 0; t3 < e2; ++t3) _[f2++] = o[I2++];
                  if (t2 -= e2, I2 = 0, !(k3 < t2)) {
                    for (let e3 = 0; e3 < t2; ++e3) _[f2++] = o[I2++];
                    continue e;
                  }
                  for (let e3 = 0; e3 < k3; ++e3) _[f2++] = o[I2++];
                  t2 -= k3, I2 = f2 - T9;
                } else {
                  if (I2 = k3 - n2, !(n2 < t2)) {
                    for (let e2 = 0; e2 < t2; ++e2) _[f2++] = o[I2++];
                    continue e;
                  }
                  for (let e2 = 0; e2 < n2; ++e2) _[f2++] = o[I2++];
                  t2 -= n2, I2 = f2 - T9;
                }
                for (; t2 > 2; ) _[f2++] = _[I2++], _[f2++] = _[I2++], _[f2++] = _[I2++], t2 -= 3;
                t2 && (_[f2++] = _[I2++], t2 > 1 && (_[f2++] = _[I2++]));
              } else {
                for (I2 = f2 - T9; t2 > 2; ) _[f2++] = _[I2++], _[f2++] = _[I2++], _[f2++] = _[I2++], t2 -= 3;
                t2 && (_[f2++] = _[I2++], t2 > 1 && (_[f2++] = _[I2++]));
              }
              break;
            }
            if (64 & y2) {
              e.msg = "invalid distance code", r.ft = 16209;
              break e;
            }
            n = s[(65535 & n) + (a & (1 << y2) - 1)];
            continue n;
          }
          break;
        }
        if (64 & y2) {
          if (32 & y2) {
            r.ft = 16191;
            break e;
          }
          e.msg = "invalid literal/length code", r.ft = 16209;
          break e;
        }
        n = c[(65535 & n) + (a & (1 << y2) - 1)];
        continue t;
      }
    } while (i < p2 && f2 < v);
    let M2 = u >> 3;
    i -= M2, u -= M2 << 3, a &= (1 << u) - 1, e.next_in_index = i, e.next_out_index = f2, e.avail_in = i < p2 ? p2 - i + 5 : 5 - (i - p2), e.avail_out = f2 < v ? v - f2 + 257 : 257 - (f2 - v), r.p = a >>> 0, r.T = u >>> 0;
  }
  function M_(e, t) {
    let n = Gn, r = t ? ue + m_ : ue + d_;
    return { ...$e(e, 0), o: e, ft: 16180, lt: false, P: 0, _t: false, ot: 0, ut: 0, ct: 0, st: 0, u: Z2, ht: 0, dt: 0, Ge: 0, et: n, tt: n, nt: 0, rt: 0, wt: 0, bt: 0, kt: 0, gt: 0, vt: n, xt: new g(320), Tt: new g(288), yt: new R2(r), It: 0, it: true, Mt: 0, zt: 0, Ct: t };
  }
  function We(e, t, n) {
    return e << 24 | t << 16 | n;
  }
  function b_(e = 0, t = 0, n = 0) {
    return We(e, t, n);
  }
  function s_(e = 1) {
    return We(64, e, 0);
  }
  function Jt(e = 0) {
    return We(96, e, 0);
  }
  function Y_(e) {
    return ((255 & e) << 24 | (e >> 8 & 255) << 16 | (e >> 16 & 255) << 8 | e >> 24 & 255) >>> 0;
  }
  function Le(e, t, n, r, i, f2, l, _) {
    let o, a, u, c, s, h, d, w, b, k3, m2, v, p2, x, T9, y2, I2, M2, z2, C3 = new g(Oe + 1), Z3 = new g(Oe + 1), W3 = _ ? Vn : qn;
    for (o = 0; o <= Oe; o++) C3[o] = 0;
    for (a = 0; a < n; a++) C3[t[a]]++;
    for (s = i.Rt, c = Oe; c >= 1 && 0 == C3[c]; c--) ;
    if (s > c && (s = c), 0 == c) return W3.Nt ? (T9 = s_(1), r.Rt[0] = T9, r.Rt[1] = T9, i.Rt = 1, 0) : -1;
    for (u = 1; u < c && 0 == C3[u]; u++) ;
    for (s < u && (s = u), w = 1, o = 1; o <= Oe; o++) if (w <<= 1, w -= C3[o], w < 0) return -1;
    if (w > 0 && (0 == e || 1 != c)) return -1;
    for (Z3[1] = 0, o = 1; o < Oe; o++) Z3[o + 1] = Z3[o] + C3[o];
    for (a = 0; a < n; a++) 0 != t[a] && (f2[Z3[t[a]]++] = a);
    switch (e) {
      case 0:
        I2 = M2 = f2, z2 = W3.St;
        break;
      case 1:
        I2 = W3.Zt, M2 = W3.Wt, z2 = W3.Dt;
        break;
      default:
        I2 = W3.qt, M2 = W3.Ot, z2 = W3.jt;
    }
    if (k3 = 0, a = 0, o = u, y2 = l.Rt, h = s, d = 0, p2 = -1, b = 1 << s, x = b - 1, 1 == e && (W3.Qt ? b >= ue : b > ue) || 2 == e && (W3.Qt ? b >= W3.At : b > W3.At)) return 1;
    for (; ; ) {
      T9 = jn(f2, a, o, d, e, I2, M2, z2, W3.Ct), m2 = 1 << o - d, v = 1 << h, u = v;
      do {
        v -= m2;
        let e2 = (k3 >> d) + v;
        r.Rt[y2 + e2] = T9;
      } while (0 != v);
      for (m2 = 1 << o - 1; k3 & m2; ) m2 >>= 1;
      if (0 != m2 ? (k3 &= m2 - 1, k3 += m2) : k3 = 0, a++, 0 == --C3[o]) {
        if (o == c) break;
        o = t[f2[a]];
      }
      if (o > s && (k3 & x) != p2) {
        for (0 == d && (d = s), y2 += 1 << h, h = o - d, w = 1 << h; h + d < c && (w -= C3[h + d], !(w <= 0)); ) h++, w <<= 1;
        if (b += 1 << h, 1 == e && (W3.Qt ? b >= ue : b > ue) || 2 == e && (W3.Qt ? b >= W3.At : b > W3.At)) return 1;
        p2 = k3 & x, r.Rt[l.Rt + p2] = We(h, s, y2 - l.Rt);
      }
    }
    if (0 != k3) for (T9 = s_(o - d); 0 != k3; ) {
      for (0 != d && (k3 & x) != p2 && (d = 0, o = s, y2 = l.Rt, h = s, T9 = s_(o)), r.Rt[y2 + (k3 >> d)] = T9, m2 = 1 << o - 1; k3 & m2; ) m2 >>= 1;
      0 != m2 ? (k3 &= m2 - 1, k3 += m2) : k3 = 0;
    }
    return l.Rt += b, i.Rt = s, 0;
  }
  function jn(e, t, n, r, i, f2, l, _, o) {
    let a;
    if (o ? e[t] < _ : e[t] + 1 < _) a = b_(0, n - r, e[t]);
    else if (o ? e[t] > _ : e[t] >= _) if (o && 1 == i) {
      let i2 = e[t] - 257;
      a = b_(l[i2], n - r, f2[i2]);
    } else {
      let i2 = o ? e[t] : e[t] - _;
      a = b_(l[i2], n - r, f2[i2]);
    }
    else a = Jt(n - r);
    return a;
  }
  function Qt() {
    let e = je();
    return e._ = M_(e, false), e;
  }
  function Ge(e) {
    let t;
    return !(e && (t = e._, !(!t || t.o != e || t.Ct && (t.ft < 16191 || t.ft > 16209) || !t.Ct && (t.ft < 16180 || t.ft > 16211))));
  }
  function tr(e) {
    let t;
    return Ge(e) ? -2 : (t = e._, e.total_in = e.total_out = t.st = 0, e.msg = "", t.P && (e.i = 1 & t.P), t.ft = t.Ct ? 16191 : 16180, t.lt = false, t._t = false, t.ot = -1, t.ut = t.Ct ? 65536 : 32768, delete t.B, t.p = 0, t.T = 0, t.et = t.yt, t.tt = t.yt, t.vt = t.yt, t.it = true, t.Mt = -1, 0);
  }
  function nr(e) {
    let t;
    return Ge(e) ? -2 : (t = e._, t.h = 0, t.m = 0, t.v = 0, tr(e));
  }
  function rr(e, t) {
    let n, r;
    if (Ge(e)) return -2;
    if (r = e._, t < 0) {
      if (t < -16) return -2;
      n = 0, r.Ct = -16 == t, t = -t;
    } else n = 5 + (t >> 4), r.Ct = false, t < 48 && (t &= 15);
    let i = r.Ct ? 16 : 15;
    return t && (t < 8 || t > i) ? -2 : (r.u.length > 0 && r.k != t && (r.u = Z2), r.P = n, r.k = t, nr(e));
  }
  function en(e, t) {
    let n, r;
    if (!e) return -2;
    e.msg = "";
    let i = -16 == t;
    return r = M_(e, i), e._ = r, r.o = e, r.ft = i ? 16191 : 16180, n = rr(e, t), n;
  }
  function ar(e) {
    let t = e.Ct ? _r : er, n = { Rt: 0 };
    if (t.Ht) {
      let r, i, f2;
      for (r = 0; r < 144; ) e.xt[r++] = 8;
      for (; r < 256; ) e.xt[r++] = 9;
      for (; r < 280; ) e.xt[r++] = 7;
      for (; r < 288; ) e.xt[r++] = 8;
      t.Jt.fill(0), f2 = t.Jt, t.Ut = f2, i = 9;
      let l = { Rt: f2 }, _ = { Rt: i }, o = { Rt: 0 };
      for (Le(1, e.xt, 288, l, _, e.Tt, o, e.Ct), f2 = l.Rt, i = _.Rt, e.It = o.Rt, r = 0; r < 32; ) e.xt[r++] = 5;
      i = 5;
      let a = o.Rt, u = { Rt: f2 }, c = { Rt: i };
      n.Rt = a, Le(2, e.xt, 32, u, c, e.Tt, n, e.Ct), t.Et = f2.slice(a), t.Ht = false;
    }
    e.et = t.Ut, e.nt = 9, e.tt = t.Et, e.rt = 5, e.It = n.Rt;
  }
  function ir(e, t, n) {
    let r = e._;
    if (!(r.u && 0 != r.u.length || (r.u = new p(1 << r.k), r.u))) return 1;
    if (0 == r.h && (r.h = 1 << r.k, r.v = 0, r.m = 0), n >= r.h) M(r.u, 0, t, t.length - r.h, r.h), r.v = 0, r.m = r.h;
    else {
      let e2 = r.h - r.v;
      e2 > n && (e2 = n), M(r.u, r.v, t, t.length - n, e2), (n -= e2) ? (M(r.u, 0, t, t.length - n, n), r.v = n, r.m = r.h) : (r.v += e2, r.v == r.h && (r.v = 0), r.m < r.h && (r.m += e2));
    }
    return 0;
  }
  function _n(e, t) {
    let n, r, i, f2, l, _, o, a, u, c, s, h, d, w, b, k3, g2, m2 = new p(4);
    if (Ge(e) || !e.next_out || !e.next_in && 0 != e.avail_in) return -2;
    _ = 0, a = 0, o = 0, u = 0, r = Z2, i = 0, f2 = Z2, l = 0, n = e._, 16191 == n.ft && (n.ft = 16192), I2(), c = _, s = o, g2 = 0;
    try {
      for (; ; ) switch (n.ft) {
        case 16180:
          if (0 == n.P) {
            n.ft = 16192;
            break;
          }
          if (O3(16), 2 & n.P && 35615 == a) {
            0 == n.k && (n.k = 15), n.ct = W2(0), n.ct = T9(n.ct, a), C3(), n.ft = 16181;
            break;
          }
          if (n.B && (n.B.Yt = -1), !(1 & n.P) || ((S(8) << 8) + (a >> 8)) % 31) {
            e.msg = "incorrect header check", n.ft = 16209;
            break;
          }
          if (8 != S(4)) {
            e.msg = "unknown compression method", n.ft = 16209;
            break;
          }
          if (D(4), k3 = S(4) + 8, 0 == n.k && (n.k = k3), k3 > 15 || k3 > n.k) {
            e.msg = "invalid window size", n.ft = 16209;
            break;
          }
          n.ut = 1 << k3, n.ot = 0, e.i = n.ct = se(0), n.ft = 512 & a ? 16189 : 16191, C3();
          break;
        case 16181:
          if (O3(16), n.ot = a, 8 != (255 & n.ot)) {
            e.msg = "unknown compression method", n.ft = 16209;
            break;
          }
          if (57344 & n.ot) {
            e.msg = "unknown header flags set", n.ft = 16209;
            break;
          }
          n.B && (n.B.Fe = a >> 8 & 1), 512 & n.ot && 4 & n.P && (n.ct = T9(n.ct, a)), C3(), n.ft = 16182;
        case 16182:
          O3(32), n.B && (n.B.Xe = a), 512 & n.ot && 4 & n.P && (n.ct = y2(n.ct, a)), C3(), n.ft = 16183;
        case 16183:
          O3(16), n.B && (n.B.Pt = 255 & a, n.B.$e = a >> 8), 512 & n.ot && 4 & n.P && (n.ct = T9(n.ct, a)), C3(), n.ft = 16184;
        case 16184:
          1024 & n.ot ? (O3(16), n.ht = a, n.B && (n.B.Ke = a), 512 & n.ot && 4 & n.P && (n.ct = T9(n.ct, a)), C3()) : n.B && (n.B.Ge = Z2), n.ft = 16185;
        case 16185:
          if (1024 & n.ot && (h = n.ht, h > _ && (h = _), h && (n.B && n.B.Ge && n.B.Bt && (k3 = n.B.Ke - n.ht) < n.B.Bt && M(n.B.Ge, k3, r, i, h), 512 & n.ot && 4 & n.P && (n.ct = W2(n.ct, r.subarray(i, i + h), h)), _ -= h, i += h, n.ht -= h), n.ht)) return v();
          n.ht = 0, n.ft = 16186;
        case 16186:
          if (2048 & n.ot) {
            if (0 == _) return v();
            h = 0;
            do {
              k3 = r[i + h++], n.B && n.B.Ft && n.ht < n.B.Ft && (n.B.Ve[n.ht++] = k3);
            } while (k3 && h < _);
            if (512 & n.ot && 4 & n.P && (n.ct = W2(n.ct, r.subarray(i, i + h), h)), _ -= h, i += h, k3) return v();
          } else n.B && (n.B.Ve = Z2);
          n.ht = 0, n.ft = 16187;
        case 16187:
          if (4096 & n.ot) {
            if (0 == _) return v();
            h = 0;
            do {
              k3 = r[i + h++], n.B && n.B.Gt && n.ht < n.B.Gt && (n.B.Le[n.ht++] = k3);
            } while (k3 && h < _);
            if (512 & n.ot && 4 & n.P && (n.ct = W2(n.ct, r.subarray(i, i + h), h)), _ -= h, i += h, k3) return v();
          } else n.B && (n.B.Le = Z2);
          n.ft = 16188;
        case 16188:
          if (512 & n.ot) {
            if (O3(16), 4 & n.P && a != (65535 & n.ct)) {
              e.msg = "header crc mismatch", n.ft = 16209;
              break;
            }
            C3();
          }
          n.B && (n.B.Be = n.ot >> 9 & 1, n.B.Yt = 1), e.i = n.ct = W2(0), n.ft = 16191;
          break;
        case 16189:
          O3(32), e.i = n.ct = Y_(a), C3(), n.ft = 16190;
        case 16190:
          if (!n._t) return z2(), 2;
          e.i = n.ct = se(0), n.ft = 16191;
        case 16191:
          if (5 == t || 6 == t) return v();
        case 16192:
          if (n.lt) {
            j3(), n.ft = 16206;
            break;
          }
          switch (O3(3), n.lt = !!S(1), D(1), S(2)) {
            case 0:
              n.ft = 16193;
              break;
            case 1:
              if (ar(n), n.ft = 16199, 6 == t) return D(2), v();
              break;
            case 2:
              n.ft = 16196;
              break;
            case 3:
              e.msg = "invalid block type", n.ft = 16209;
          }
          D(2);
          break;
        case 16193:
          if (j3(), O3(32), (65535 & a) != (a >>> 16 ^ 65535)) {
            e.msg = "invalid stored block lengths", n.ft = 16209;
            break;
          }
          if (n.ht = 65535 & a, C3(), n.ft = 16194, 6 == t) return v();
        case 16194:
          n.ft = 16195;
        case 16195:
          if (h = n.ht, h) {
            if (h > _ && (h = _), h > o && (h = o), 0 == h) return v();
            M(f2, l, r, i, h), _ -= h, i += h, o -= h, l += h, n.ht -= h;
            break;
          }
          n.ft = 16191;
          break;
        case 16196:
          if (O3(14), n.bt = S(5) + 257, D(5), n.kt = S(5) + 1, D(5), n.wt = S(4) + 4, D(4), n.bt > 286 || !n.Ct && n.kt > 30) {
            e.msg = n.Ct ? "too many length" : "too many length or distance symbols", n.ft = 16209;
            break;
          }
          n.gt = 0, n.ft = 16197;
        case 16197:
          for (; n.gt < n.wt; ) O3(3), n.xt[pe[n.gt++]] = S(3), D(3);
          for (; n.gt < 19; ) n.xt[pe[n.gt++]] = 0;
          n.vt = n.yt, n.et = n.tt = n.vt, n.nt = 7;
          let c2 = { Rt: n.vt }, m3 = { Rt: n.nt }, p2 = { Rt: 0 };
          if (g2 = Le(0, n.xt, 19, c2, m3, n.Tt, p2, n.Ct), n.vt = c2.Rt, n.nt = m3.Rt, g2) {
            e.msg = "invalid code lengths set", n.ft = 16209;
            break;
          }
          n.gt = 0, n.ft = 16198;
        case 16198:
          for (; n.gt < n.bt + n.kt; ) {
            for (; w = n.et[S(n.nt)], !((w >>> 16 & 255) <= u); ) q2();
            if ((65535 & w) < 16) D(w >>> 16 & 255), n.xt[n.gt++] = 65535 & w;
            else {
              if (16 == (65535 & w)) {
                if (O3(2 + (w >>> 16 & 255)), D(w >>> 16 & 255), 0 == n.gt) {
                  e.msg = "invalid bit length repeat", n.ft = 16209;
                  break;
                }
                k3 = n.xt[n.gt - 1], h = 3 + S(2), D(2);
              } else 17 == (65535 & w) ? (O3(3 + (w >>> 16 & 255)), D(w >>> 16 & 255), k3 = 0, h = 3 + S(3), D(3)) : (O3(7 + (w >>> 16 & 255)), D(w >>> 16 & 255), k3 = 0, h = 11 + S(7), D(7));
              if (n.gt + h > n.bt + n.kt) {
                e.msg = "invalid bit length repeat", n.ft = 16209;
                break;
              }
              for (; h--; ) n.xt[n.gt++] = k3;
            }
          }
          if (16209 == n.ft) break;
          if (0 == n.xt[256]) {
            e.msg = "invalid code -- missing end-of-block", n.ft = 16209;
            break;
          }
          n.vt = n.yt, n.nt = 9;
          let A2 = { Rt: n.vt }, Q2 = { Rt: n.nt }, N2 = { Rt: 0 };
          g2 = Le(1, n.xt, n.bt, A2, Q2, n.Tt, N2, n.Ct), n.vt = A2.Rt, n.nt = Q2.Rt;
          let R3 = N2.Rt;
          if (n.et = n.vt.slice(0, R3), g2) {
            e.msg = "invalid literal/lengths set", n.ft = 16209;
            break;
          }
          n.rt = 6;
          let H3 = n.xt.subarray(n.bt, n.bt + n.kt), J2 = { Rt: n.vt }, U2 = { Rt: n.rt }, E = { Rt: R3 };
          if (g2 = Le(2, H3, n.kt, J2, U2, n.Tt, E, n.Ct), n.vt = J2.Rt, n.rt = U2.Rt, n.tt = n.vt.slice(R3), g2) {
            e.msg = "invalid distances set", n.ft = 16209;
            break;
          }
          if (n.ft = 16199, 6 == t) return v();
        case 16199:
          n.ft = 16200;
        case 16200:
          if (!n.Ct && _ >= 6 && o >= 258) {
            z2(), $t(e, s), I2(), 16191 == n.ft && (n.Mt = -1);
            break;
          }
          for (n.Mt = 0; w = n.et[S(n.nt)], !((w >>> 16 & 255) <= u); ) q2();
          if (w >>> 24 && !(w >>> 24 & 240)) {
            for (b = w; w = n.et[(65535 & b) + (S((b >>> 16 & 255) + (b >>> 24)) >> (b >>> 16 & 255))], !((b >>> 16 & 255) + (w >>> 16 & 255) <= u); ) q2();
            D(b >>> 16 & 255), n.Mt += b >>> 16 & 255;
          }
          if (D(w >>> 16 & 255), n.Mt += w >>> 16 & 255, n.ht = 65535 & w, !(w >>> 24)) {
            n.ft = 16205;
            break;
          }
          if (w >>> 24 & 32) {
            n.Mt = -1, n.ft = 16191;
            break;
          }
          if (w >>> 24 & 64) {
            e.msg = "invalid literal/length code", n.ft = 16209;
            break;
          }
          n.Ge = w >>> 24 & (n.Ct ? 31 : 15), n.ft = 16201;
        case 16201:
          n.Ge && (O3(n.Ge), n.ht += S(n.Ge), D(n.Ge), n.Mt += n.Ge), n.zt = n.ht, n.ft = 16202;
        case 16202:
          for (; w = n.tt[S(n.rt)], !((w >>> 16 & 255) <= u); ) q2();
          if (!(w >>> 24 & 240)) {
            for (b = w; w = n.tt[(65535 & b) + (S((b >>> 16 & 255) + (b >>> 24)) >> (b >>> 16 & 255))], !((b >>> 16 & 255) + (w >>> 16 & 255) <= u); ) q2();
            D(b >>> 16 & 255), n.Mt += b >>> 16 & 255;
          }
          if (D(w >>> 16 & 255), n.Mt += w >>> 16 & 255, w >>> 24 & 64) {
            e.msg = "invalid distance code", n.ft = 16209;
            break;
          }
          n.dt = 65535 & w, n.Ge = w >>> 24 & 15, n.ft = 16203;
        case 16203:
          n.Ge && (O3(n.Ge), n.dt += S(n.Ge), D(n.Ge), n.Mt += n.Ge), n.ft = 16204;
        case 16204:
          if (0 == o) return v();
          if (h = s - o, n.dt > h) {
            if (h = n.dt - h, h > n.m && n.it) {
              e.msg = "invalid distance too far back", n.ft = 16209;
              break;
            }
            h > n.v ? (h -= n.v, d = n.h - h) : d = n.v - h, h > n.ht && (h = n.ht), h > o && (h = o);
            for (let e2 = 0; e2 < h; ++e2) f2[l] = 255 & n.u[d], ++l, ++d;
          } else {
            d = l - n.dt, h = n.ht, h > o && (h = o);
            for (let e2 = 0; e2 < h; ++e2) f2[l] = f2[d], ++l, ++d;
          }
          h > o && (h = o), o -= h, n.ht -= h, 0 == n.ht && (n.ft = 16200);
          break;
        case 16205:
          if (0 == o) return v();
          f2[l++] = n.ht, o--, n.ft = 16200;
          break;
        case 16206:
          if (n.P) {
            if (O3(32), s -= o, e.total_out += s, n.st += s, 4 & n.P && s) {
              let t2 = f2.subarray(l - s, l);
              e.i = n.ct = x(n.ct, t2, s);
            }
            if (s = o, 4 & n.P && (n.ot ? a : Y_(a) >>> 0) != n.ct) {
              e.msg = "incorrect data check", n.ft = 16209;
              break;
            }
            C3();
          }
          n.ft = 16207;
        case 16207:
          if (n.P && n.ot) {
            if (O3(32), 4 & n.P && a != (4294967295 & n.st)) {
              e.msg = "incorrect length check", n.ft = 16209;
              break;
            }
            C3();
          }
          n.ft = 16208;
        case 16208:
          return g2 = 1, v();
        case 16209:
          return g2 = -3, v();
        case 16210:
          return -4;
        default:
          return -2;
      }
    } catch (e2) {
      if (e2 instanceof S_) return v();
      throw e2;
    }
    function v() {
      if (z2(), n.h || s != e.avail_out && n.ft < 16209 && ((n.Ct ? n.ft < 16208 : n.ft < 16206) || 4 != t)) {
        let t2 = s - e.avail_out;
        if (ir(e, e.next_out.subarray(e.next_out_index - t2, e.next_out_index), t2)) return n.ft = 16210, -4;
      }
      return c -= e.avail_in, s -= e.avail_out, e.total_in += c, e.total_out += s, n.st += s, 4 & n.P && s && (e.i = n.ct = x(n.ct, e.next_out.subarray(e.next_out_index - s, e.next_out_index), s)), e.t = n.T + (n.lt ? 64 : 0) + (16191 == n.ft ? 128 : 0) + (16199 == n.ft || 16194 == n.ft ? 256 : 0), (0 == c && 0 == s && 0 == g2 || 4 == t && 0 == g2) && (g2 = -5), g2;
    }
    function x(e2, t2, r2) {
      return n.ot ? W2(e2, t2, r2) : se(e2, t2, r2);
    }
    function T9(e2, t2) {
      return m2[0] = 255 & t2, m2[1] = t2 >>> 8 & 255, W2(e2, m2, 2) >>> 0;
    }
    function y2(e2, t2) {
      return m2[0] = 255 & t2, m2[1] = t2 >>> 8 & 255, m2[2] = t2 >>> 16 & 255, m2[3] = t2 >>> 24 & 255, W2(e2, m2, 4) >>> 0;
    }
    function I2() {
      f2 = e.next_out, l = e.next_out_index, o = e.avail_out, r = e.next_in, i = e.next_in_index, _ = e.avail_in, a = n.p, u = n.T;
    }
    function z2() {
      e.next_out = f2, e.next_out_index = l, e.avail_out = o, e.next_in = r, e.next_in_index = i, e.avail_in = _, n.p = a, n.T = u;
    }
    function C3() {
      a = 0, u = 0;
    }
    function q2() {
      if (0 == _) throw new S_();
      _--, a += (255 & r[i]) << u, i++, a >>>= 0, u += 8;
    }
    function O3(e2) {
      for (; u < e2; ) q2();
    }
    function S(e2) {
      return a & (1 << e2) - 1;
    }
    function D(e2) {
      a >>>= e2, u -= e2;
    }
    function j3() {
      a >>>= 7 & u, u -= 7 & u;
    }
  }
  function tn(e) {
    return Ge(e) ? -2 : 0;
  }
  function rn(e) {
    let t = new W_(32, X_), n = null;
    function r() {
      let t2 = e.Xt(), n2 = e.$t(t2);
      if (0 != n2 && 0 != n2) throw new z("init failed: " + n2);
      return { o: t2 };
    }
    function i(e2) {
      try {
        t.release(e2);
      } catch {
      }
    }
    return new H2({ start() {
    }, transform(f2, l) {
      n || (n = r());
      let _ = n.o;
      if (n.Kt) {
        if (f2.length) throw new z(nn);
        return;
      }
      let o = 0;
      for (; o < f2.length; ) {
        let r2 = O2.min(f2.length - o, or), a = f2.subarray(o, o + r2);
        for (_.next_in = a, _.next_in_index = 0, _.avail_in = a.length; _.avail_in > 0; ) {
          let r3 = t.acquire(), f3 = false;
          try {
            _.next_out = r3, _.next_out_index = 0, _.avail_out = r3.length;
            let i2 = e.en(_, 0), o2 = r3.length - _.avail_out;
            if (o2 > 0) {
              let e2 = false, n2 = { tn: r3.subarray(0, o2), release: () => {
                e2 || (e2 = true, t.release(r3));
              } };
              f3 = true, l.enqueue(n2);
            }
            if (1 == i2) {
              n.Kt = true;
              break;
            }
            if (0 != i2) throw new z("process error: " + i2);
          } finally {
            f3 || i(r3);
          }
        }
        if (n.Kt) {
          if (_.avail_in > 0 || o + r2 < f2.length) throw new z(nn);
          break;
        }
        o += r2;
      }
    }, flush(f2) {
      if (n && n.Kt) return;
      n || (n = r());
      let l = n.o;
      for (; ; ) {
        let n2 = t.acquire(), r2 = false;
        try {
          l.next_out = n2, l.next_out_index = 0, l.avail_out = n2.length;
          let i2 = e.en(l, 4), _2 = n2.length - l.avail_out;
          if (_2 > 0) {
            let e2 = false, i3 = { tn: n2.subarray(0, _2), release: () => {
              e2 || (e2 = true, t.release(n2));
            } };
            r2 = true, f2.enqueue(i3);
          }
          if (1 == i2) break;
          if (0 != i2) throw new z("finalization error: " + i2);
        } finally {
          r2 || i(n2);
        }
      }
      let _ = e.nn(l);
      if (0 != _ && 0 != _) throw new z("end failed: " + _);
    } });
  }
  function an() {
    return new H2({ start() {
    }, transform(e, t) {
      try {
        t.enqueue(e.tn.slice(0));
      } finally {
        e.release();
      }
    }, flush() {
    } });
  }
  function on(e, t) {
    let n = e.get(t);
    if (void 0 === n) throw new TypeError(`Unsupported format: ${t}`);
    return n;
  }
  function ur(e = "deflate", t) {
    let n = on(fr, e), r = t && "number" == typeof t.level ? t.level : -1;
    return rn({ Xt: () => vt(), $t: (e2) => kt(e2, r, 8, n, 8, 0), en: Nt, nn: P_ });
  }
  function cr(e = "deflate") {
    let t = on(lr, e);
    return rn({ Xt: () => Qt(), $t: (e2) => en(e2, t), en: _n, nn: tn });
  }
  var p, g, R2, H2, O2, z, k2, pe, Z2, qe, de, Se, Ee, ge, ne, re, Ce, I, ee, ae, nt, Ue, He, hn, ie, Te, me, oe, fe, be, rt, at, it, ot, ve, t_, n_, r_, ft, N_, lt, Q, J_, a_, i_, Be, xn, pn, Fe, R_, __, A_, Ze, ut, Sn, En, gn, Tn, wn, An, Dn, he, Ye, Dt, ue, d_, m_, Lt, Ct, Xn, Wn, Ut, Ht, Bt, Ft, Zt, Pt, Mt, Yt, Xt, Wt, Gt, Kt, Gn, Oe, qn, Vn, p_, er, _r, S_, X_, or, nn, W_, fr, lr, E_, g_;
  var init_zlib_streams_min = __esm({
    "node_modules/@zip.js/zip.js/lib/core/streams/zlib-js/zlib-streams.min.js"() {
      ({ Uint8Array: p, Uint16Array: g, Int32Array: R2, TransformStream: H2, Math: O2, Error: z, Array: k2 } = globalThis);
      pe = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
      Z2 = new p(0);
      qe = new g(0);
      de = [];
      for (let e = 0; e < 6; e++) de.push(e, 0 == e ? 8 : 4);
      de.push(0, 1);
      Se = [];
      for (let e = 0; e < 14; e++) Se.push(e, 0 == e ? 4 : 2);
      Ee = new g([0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072, 4096, 6144, 8192, 12288, 16384, 24576]);
      ge = new g([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 0]);
      ne = class {
        constructor(e, t) {
          this.I = e, this.M = t, this.C = 0;
        }
      };
      re = class {
        constructor(e, t, n, r, i) {
          this.Z = e, this.W = t, this.q = n, this.O = r, this.S = i;
        }
      };
      Ce = 8;
      I = 3;
      ee = 258;
      ae = ee + I + 1;
      nt = 4096;
      Ue = 16;
      He = ee;
      hn = 29;
      ie = 256;
      Te = ie + 1 + hn;
      me = 30;
      oe = 19;
      fe = 2 * Te + 1;
      be = 15;
      rt = 9;
      at = 255;
      it = 32;
      ot = 4;
      ve = 256;
      t_ = 16;
      n_ = 17;
      r_ = 18;
      ft = 0;
      N_ = 1;
      lt = 2;
      Q = -1;
      J_ = ["need dictionary", "stream end", "", "file error", "stream error", "data error", "insufficient memory", "buffer error", ""];
      a_ = te(de);
      i_ = te(Se);
      Be = new g(19);
      Be[16] = 2, Be[17] = 3, Be[18] = 7;
      xn = k_(Q_());
      pn = k_(new k2(30).fill(5));
      Fe = I_(xn);
      R_ = I_(pn);
      __ = et(ge, a_, ee);
      A_ = tt(_t(Ee, i_));
      Ze = [[], [], [], [], [], [], [], []];
      for (let e = 0; e < 256; e++) {
        let t = e;
        for (let e2 = 0; e2 < 8; e2++) t = 1 & t ? 3988292384 ^ t >>> 1 : t >>> 1;
        Ze[0][e] = t;
      }
      for (let e = 0; e < 256; e++) for (let t = 1; t < 8; t++) {
        let n = Ze[t - 1][e];
        Ze[t][e] = n >>> 8 ^ Ze[0][255 & n];
      }
      [ut, Sn, En, gn, Tn, wn, An, Dn] = Ze;
      he = 1;
      Ye = [{ Je: Ot, Ue: 0, Ee: 0, Ye: 0, Pe: 0 }, { Je: U_, Ue: 4, Ee: 4, Ye: 8, Pe: 4 }, { Je: U_, Ue: 4, Ee: 5, Ye: 16, Pe: 8 }, { Je: U_, Ue: 4, Ee: 6, Ye: 32, Pe: 32 }, { Je: Ne, Ue: 4, Ee: 4, Ye: 16, Pe: 16 }, { Je: Ne, Ue: 8, Ee: 16, Ye: 32, Pe: 32 }, { Je: Ne, Ue: 8, Ee: 16, Ye: 128, Pe: 128 }, { Je: Ne, Ue: 8, Ee: 32, Ye: 128, Pe: 256 }, { Je: Ne, Ue: 32, Ee: 128, Ye: 258, Pe: 1024 }, { Je: Ne, Ue: 32, Ee: 258, Ye: 258, Pe: 4096 }];
      Dt = 65535;
      ue = 852;
      d_ = 592;
      m_ = 594;
      Lt = Ee.map((e) => e + 1);
      Ct = ge.subarray(0, -1).map((e) => e + 3);
      Xn = [16, 1, 73, 1, 200, 1];
      Wn = [144, 1, 72, 1, 78, 1];
      Ut = Se.map(qt);
      Ht = Se.map(Vt);
      Ut.push(64, 2), Ht.push(142, 2);
      Bt = de.slice(0, -2).map(qt);
      Ft = de.slice(0, -2).map(Vt);
      Bt.push(...Xn), Ft.push(...Wn);
      Zt = new g([...Ct, 258, 0, 0]);
      Pt = new g([...Ct, 3, 0, 0]);
      Mt = te(Bt);
      Yt = te(Ft);
      Xt = new g([...Lt, 0, 0]);
      Wt = new g([...Lt, 32769, 49153]);
      Gt = te(Ut);
      Kt = te(Ht);
      Gn = new R2(0);
      Oe = 15;
      qn = { Ct: false, Zt, Wt: Mt, qt: Xt, Ot: Gt, St: 20, Dt: 257, jt: 0, At: d_, Qt: false, Nt: true };
      Vn = { Ct: true, Zt: Pt, Wt: Yt, qt: Wt, Ot: Kt, St: 19, Dt: 256, jt: -1, At: m_, Qt: true, Nt: false };
      p_ = new R2(0);
      er = { Ht: true, Jt: new R2(544), Ut: p_, Et: p_ };
      _r = { Ht: true, Jt: new R2(544), Ut: p_, Et: p_ };
      S_ = class extends z {
        constructor() {
          super("Need more input");
        }
      };
      X_ = 65536;
      or = 32768;
      nn = "trailing data after the end of the stream";
      W_ = class {
        constructor(e = 16, t = X_) {
          this.Vt = [], this.Lt = e;
          for (let n = 0; n < O2.min(e, 4); n++) this.Vt.push(new p(t));
        }
        acquire(e = X_) {
          for (let t = this.Vt.length - 1; t >= 0; t--) {
            let n = this.Vt[t];
            if (n.length >= e) return this.Vt.splice(t, 1), n;
          }
          return new p(e);
        }
        release(e) {
          this.Vt.length < this.Lt && this.Vt.push(e);
        }
      };
      fr = /* @__PURE__ */ new Map([["deflate", 15], ["gzip", 31], ["deflate-raw", -15]]);
      lr = /* @__PURE__ */ new Map([["deflate", 15], ["gzip", 31], ["deflate-raw", -15], ["deflate64-raw", -16]]);
      E_ = class {
        constructor(e = "deflate", t) {
          let n = ur(e, t);
          this.writable = n.writable, this.readable = n.readable.pipeThrough(an());
        }
      };
      g_ = class {
        constructor(e = "deflate") {
          let t = cr(e);
          this.writable = t.writable, this.readable = t.readable.pipeThrough(an());
        }
      };
    }
  });

  // node_modules/@zip.js/zip.js/lib/zip-module-native.js
  var init_zip_module_native = __esm({
    "node_modules/@zip.js/zip.js/lib/zip-module-native.js"() {
      init_configuration();
      init_zlib_streams_min();
      init_codec_pool();
      setDefaultConfiguration({
        workerURI: "./core/web-worker-native.js",
        wasmURI: null,
        CompressionStreamFallback: E_,
        DecompressionStreamFallback: g_
      });
    }
  });

  // node_modules/@zip.js/zip.js/lib/zip-core-native.js
  var init_zip_core_native = __esm({
    "node_modules/@zip.js/zip.js/lib/zip-core-native.js"() {
      init_zip_core_base();
      init_zip_module_native();
    }
  });

  // src/photo-diary-types.ts
  function validDiaryDimensions(width, height) {
    return Number.isSafeInteger(width) && Number.isSafeInteger(height) && width > 0 && height > 0 && width <= 32767 && height <= 32767 && width * height <= 4e7;
  }
  var init_photo_diary_types = __esm({
    "src/photo-diary-types.ts"() {
      "use strict";
    }
  });

  // src/photo-diary-backup.ts
  function imagePath(id, type) {
    return `images/${id}.${type === "image/webp" ? "webp" : "png"}`;
  }
  async function exportDiary() {
    const entries = await listDiaryEntries();
    const writer = new ZipWriter(new BlobWriter("application/zip"), { ...zipOptions, level: 0 });
    const manifest = [];
    for (const { image, ...entry } of entries) {
      const type = image.type;
      manifest.push({ ...entry, type });
      await writer.add(imagePath(entry.id, type), new BlobReader(image));
    }
    const json = JSON.stringify({ version: 1, entries: manifest });
    if (new Blob([json]).size > maxManifestBytes) throw new Error("The diary is too large for a single backup.");
    await writer.add(backupManifest, new TextReader(json));
    return writer.close();
  }
  function parseBackup(value) {
    if (!value || typeof value !== "object") throw new Error("The backup is missing its entry list.");
    const { version, entries } = value;
    if (version !== 1) throw new Error("This Picture Diary backup version is unsupported.");
    if (!Array.isArray(entries)) throw new Error("The backup is missing its entry list.");
    for (const entry of entries) {
      if (!entry || typeof entry !== "object" || !validDiaryWord(entry) || typeof entry.id !== "string" || !uuid.test(entry.id) || !Number.isSafeInteger(entry.createdAt) || entry.createdAt < 0 || entry.createdAt > 864e13 || !validDiaryDimensions(entry.width, entry.height) || entry.type !== "image/png" && entry.type !== "image/webp") {
        throw new Error("The backup contains an invalid diary entry.");
      }
    }
    if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error("The backup repeats a diary entry ID.");
    return entries;
  }
  function pngMatchesCrop(bytes, width, height) {
    if (bytes.byteLength < 33 || bytes.getUint32(0) !== 2303741511 || bytes.getUint32(4) !== 218765834 || bytes.getUint32(8) !== 13 || bytes.getUint32(12) !== 1229472850 || bytes.getUint32(16) !== width || bytes.getUint32(20) !== height) return false;
    for (let offset = 33; offset + 12 <= bytes.byteLength; ) {
      const length = bytes.getUint32(offset), tag = bytes.getUint32(offset + 4);
      offset += 12 + length;
      if (tag === 1633899596) return false;
      if (tag === 1229278788) return length === 0 && offset === bytes.byteLength;
    }
    return false;
  }
  function webpMatchesCrop(bytes, width, height) {
    if (bytes.byteLength < 25 || bytes.getUint32(0) !== 1380533830 || bytes.getUint32(4, true) + 8 !== bytes.byteLength || bytes.getUint32(8) !== 1464156752 || bytes.getUint32(12) !== 1448097868 || bytes.getUint8(20) !== 47) return false;
    const length = bytes.getUint32(16, true);
    const flags = bytes.getUint32(21, true);
    return length >= 5 && 20 + length + length % 2 === bytes.byteLength && flags >>> 29 === 0 && (flags & 16383) + 1 === width && (flags >>> 14 & 16383) + 1 === height;
  }
  async function validateImage(image, entry) {
    const { width, height } = entry;
    const bytes = new DataView(await image.arrayBuffer());
    const matches2 = entry.type === "image/png" ? pngMatchesCrop(bytes, width, height) : webpMatchesCrop(bytes, width, height);
    if (!matches2) throw new Error("The backup contains an invalid image crop.");
    const bitmap = await createImageBitmap(image);
    try {
      if (bitmap.width !== width || bitmap.height !== height) throw new Error("The backup contains an invalid image crop.");
    } finally {
      bitmap.close();
    }
  }
  async function readBackup(archive) {
    const reader = new ZipReader(new BlobReader(archive), {
      ...zipOptions,
      checkCrc32: true,
      checkOverlappingEntry: true,
      strictness: "strict"
    });
    try {
      const files = new Map((await reader.getEntries()).map((entry) => [entry.filename, entry]));
      const manifest = files.get(backupManifest);
      if (!manifest || manifest.directory || manifest.encrypted || manifest.compressionMethod !== 0 || manifest.uncompressedSize > maxManifestBytes) {
        throw new Error("Choose a K\u014D Picture Diary backup ZIP.");
      }
      const entries = parseBackup(JSON.parse(await manifest.getData(new TextWriter())));
      if (files.size !== entries.length + 1) throw new Error("The backup contains unexpected files.");
      const result = [];
      for (const entry of entries) {
        const file = files.get(imagePath(entry.id, entry.type));
        const maxBytes = entry.width * entry.height * 8 + 65536;
        if (!file || file.directory || file.encrypted || file.compressionMethod !== 0 || file.uncompressedSize > maxBytes) {
          throw new Error("The backup contains a missing or oversized image crop.");
        }
        const image = await file.getData(new BlobWriter(entry.type));
        await validateImage(image, entry);
        const { id, createdAt, word, reading, meaning, width, height } = entry;
        result.push({ id, createdAt, word, reading, meaning, width, height, image });
      }
      return result;
    } finally {
      await reader.close();
    }
  }
  async function importDiary(archive) {
    return mergeDiaryEntries(await readBackup(archive));
  }
  var backupManifest, maxManifestBytes, uuid, zipOptions;
  var init_photo_diary_backup = __esm({
    "src/photo-diary-backup.ts"() {
      "use strict";
      init_zip_core_native();
      init_photo_diary();
      init_photo_diary_types();
      backupManifest = "picture-diary.json";
      maxManifestBytes = 16 * 1024 * 1024;
      uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
      zipOptions = { useWebWorkers: false };
    }
  });

  // src/photo-diary-ui.ts
  function normalize2(value) {
    return hiragana(value.normalize("NFKC")).toLocaleLowerCase("en").trim();
  }
  function renderPictureDiary() {
    const element4 = node("section", "picture-diary");
    element4.setAttribute("aria-label", "Picture Diary");
    const actions = node("div", "picture-diary-actions");
    const backup = node("div", "picture-diary-backup");
    const label = node("label", "picture-diary-search", "Search Picture Diary");
    const search = node("input");
    search.type = "search";
    search.placeholder = "Japanese, reading, or English";
    label.append(search);
    const status2 = node("p", "picture-diary-status");
    status2.setAttribute("role", "status");
    const summary = node("p", "picture-diary-summary");
    const empty = node("div", "picture-diary-empty");
    const emptyTitle = node("h3");
    const emptyHelp = node("p");
    empty.append(emptyTitle, emptyHelp);
    empty.hidden = true;
    const list = node("ul", "picture-diary-results");
    const upload = node("input");
    upload.type = "file";
    upload.accept = ".zip,application/zip";
    upload.hidden = true;
    const importButton = button("Import diary", () => upload.click());
    const exportButton = button("Export diary", () => void run(async () => {
      const archive = await exportDiary();
      if (disposed) return;
      const url = URL.createObjectURL(archive);
      const link = node("a");
      link.href = url;
      link.download = `ko-picture-diary-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.zip`;
      element4.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3e4);
      status2.textContent = "Picture Diary exported.";
    }));
    backup.append(importButton, exportButton, upload);
    actions.append(label, backup);
    element4.append(node("h2", "picture-diary-heading", "Picture Diary"), actions, status2, summary, empty, list);
    let entries = [];
    const urls = [];
    let disposed = false;
    let busy = false;
    let revision = 0;
    const dateFormat = new Intl.DateTimeFormat(void 0, { dateStyle: "medium" });
    function releaseImages() {
      for (const url of urls.splice(0)) URL.revokeObjectURL(url);
    }
    function render2() {
      releaseImages();
      const query = normalize2(search.value);
      const matches2 = entries.filter(({ word, reading, meaning }) => [word, reading, meaning].some((value) => normalize2(value).includes(query)));
      const result = document.createDocumentFragment();
      for (const entry of matches2) {
        const card = node("li", "picture-diary-card");
        const image = node("div", "picture-diary-image");
        const img = node("img");
        img.alt = entry.meaning;
        img.loading = "lazy";
        img.src = URL.createObjectURL(entry.image);
        urls.push(img.src);
        image.append(img);
        const word = node("p", "picture-diary-word");
        word.lang = "ja";
        word.append(node("span", "", entry.word));
        if (entry.reading && entry.word !== entry.reading) word.append(node("small", "", entry.reading));
        const vocabulary = node("div", "picture-diary-entry");
        vocabulary.append(word, node("p", "", entry.meaning));
        const date = new Date(entry.createdAt);
        const time = node("time", "", dateFormat.format(date));
        time.dateTime = date.toISOString();
        const remove = button("Delete", () => void run(async () => {
          await deleteDiaryEntry(entry.id);
          if (disposed) return;
          await refresh();
          status2.textContent = `Removed ${entry.word} from Picture Diary.`;
          search.focus({ preventScroll: true });
        }), "picture-diary-remove");
        remove.setAttribute("aria-label", `Delete ${entry.word}`);
        const meta = node("div", "picture-diary-meta");
        meta.append(time, remove);
        card.append(image, vocabulary, meta);
        result.append(card);
      }
      list.replaceChildren(result);
      empty.hidden = matches2.length > 0;
      emptyTitle.textContent = entries.length ? "No matching entries" : "No saved pictures yet";
      emptyHelp.textContent = entries.length ? "Try another Japanese word, reading, or English meaning." : "Save a word from Photo Lookup to keep its picture here.";
      summary.textContent = matches2.length ? `${matches2.length} ${matches2.length === 1 ? "entry" : "entries"}` : "";
    }
    async function refresh() {
      const current = ++revision;
      try {
        const next = await listDiaryEntries();
        if (disposed || current !== revision) return;
        entries = next;
        render2();
      } catch {
        if (!disposed && current === revision) status2.textContent = "Could not open Picture Diary. Try again.";
      }
    }
    async function run(operation) {
      if (busy || disposed) return;
      busy = true;
      importButton.disabled = exportButton.disabled = true;
      status2.textContent = "Working\u2026";
      try {
        await operation();
      } catch (error) {
        if (!disposed) status2.textContent = error instanceof DOMException && error.name === "QuotaExceededError" ? "There is not enough browser storage. Delete some diary entries and try again." : error instanceof Error ? error.message : "Could not update Picture Diary. Try again.";
      } finally {
        busy = false;
        importButton.disabled = exportButton.disabled = false;
      }
    }
    search.oninput = render2;
    upload.onchange = () => {
      const file = upload.files?.[0];
      upload.value = "";
      if (file) void run(async () => {
        const { added, skipped } = await importDiary(file);
        if (disposed) return;
        await refresh();
        status2.textContent = `Imported ${added} ${added === 1 ? "entry" : "entries"}. Skipped ${skipped} already in the diary.`;
      });
    };
    return {
      element: element4,
      focus: () => search.focus(),
      refresh,
      dispose() {
        disposed = true;
        releaseImages();
      }
    };
  }
  var pictureDiaryStyles;
  var init_photo_diary_ui = __esm({
    "src/photo-diary-ui.ts"() {
      "use strict";
      init_playground_tools();
      init_shared();
      init_photo_diary();
      init_photo_diary_backup();
      pictureDiaryStyles = `
.picture-diary{--diary-line:#d4c5ab;--diary-card:#faf3e4;--diary-faint:#eee2cb;--diary-radius:4px;flex:1;overflow:auto;overscroll-behavior:contain;padding:clamp(14px,3vw,32px);min-height:0;color:var(--ink,#242b2d);font:14px/1.5 var(--body,system-ui)}
.picture-diary-heading{margin:0 0 16px;font:750 clamp(24px,3vw,31px)/1.22 var(--body,system-ui);letter-spacing:-.03em}
.picture-diary-actions{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:10px 16px;padding-bottom:14px;border-bottom:1px solid var(--diary-line)}
.picture-diary-backup{display:flex;gap:6px;flex-wrap:wrap}
.picture-diary-backup button,.picture-diary-remove{margin:0;border:1px solid #b7aa92;background:var(--diary-card);border-radius:var(--diary-radius);padding:7px 10px;color:var(--ink,#242b2d);font:650 12px/1.4 var(--body,system-ui);cursor:pointer}
.picture-diary-backup button:hover:not(:disabled),.picture-diary-remove:hover:not(:disabled){background:var(--diary-faint)}
.picture-diary-search{flex:1 1 240px;max-width:390px;display:grid;gap:5px;font-size:12px;font-weight:700}
.picture-diary-search input{width:100%;min-width:0;padding:8px 10px;border:1px solid #b7aa92;border-radius:var(--diary-radius);background:var(--diary-card);color:var(--ink,#242b2d);font:400 14px/1.4 var(--body,system-ui)}
.picture-diary-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:14px;list-style:none;margin:0;padding:0}
.picture-diary-card{display:flex;flex-direction:column;border:1px solid var(--diary-line);border-radius:var(--diary-radius);background:var(--diary-card);overflow:hidden;overflow-wrap:anywhere}
.picture-diary-image{aspect-ratio:4/3;display:grid;place-items:center;border-bottom:1px solid var(--diary-line);padding:8px;background:#e7ddc6}
.picture-diary-image img{width:100%;height:100%;min-height:0;display:block;object-fit:contain}
.picture-diary-entry{display:grid;gap:2px;align-content:start;min-width:0;padding:10px 12px 8px}
.picture-diary-card p,.picture-diary-card time{margin:0}
.picture-diary-word{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 7px;color:var(--accent,#234e64);font:750 22px/1.4 var(--body,system-ui)}
.picture-diary-word small{color:var(--muted,#625d50);font:600 12px/1.4 var(--body,system-ui)}
.picture-diary-meta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding:0 9px 7px 12px;margin-top:auto}
.picture-diary-card time,.picture-diary-summary,.picture-diary-status{color:var(--muted,#625d50);font-size:12px}
.picture-diary-remove{color:var(--seal,#9f3e2d);border-color:transparent;background:transparent;padding:5px 6px}
.picture-diary-summary,.picture-diary-status{margin:11px 0}
.picture-diary-status:empty,.picture-diary-summary:empty,.picture-diary-results:empty{display:none}
.picture-diary-empty{margin:15px 0;padding:21px;border:1px dashed #a89b83;border-radius:var(--diary-radius);background:var(--diary-card)}
.picture-diary-empty h3{font:750 16px/1.4 var(--body,system-ui);margin:0 0 4px}
.picture-diary-empty p{margin:0;color:var(--muted,#625d50);font-size:13px}
`;
    }
  });

  // src/playgrounds.ts
  var require_playgrounds = __commonJS({
    "src/playgrounds.ts"() {
      init_ui_theme();
      init_exploration();
      init_playground_browser();
      init_mimetic_playground();
      init_playground_data();
      init_photo_vision();
      init_photo_lookup();
      init_photo_diary_ui();
      init_photo_diary();
      var style = document.createElement("style");
      style.textContent = uiTheme + explorationStyles + playgroundBrowserStyles + photoLookupStyles + pictureDiaryStyles;
      document.head.append(style);
      function linkedDictionary(params) {
        const id = params.get("dictionaryId") ?? "", bucket = params.get("dictionaryBucket") ?? "";
        const headword = params.get("dictionaryWord") ?? "", reading = params.get("dictionaryReading") ?? "";
        const validText = (value) => value.length > 0 && value.length <= 80 && !/[\u0000-\u001f\u007f-\u009f]/u.test(value);
        if (/^\d{1,12}$/.test(id) && /^[a-f0-9]{2}$/.test(bucket) && validText(headword) && validText(reading)) return { id, bucket, headword, reading };
      }
      var worker;
      var nextId = 0;
      var pending = /* @__PURE__ */ new Map();
      function dictionary() {
        if (worker) return worker;
        const current = new Worker(chrome.runtime.getURL("tokenizer.js"));
        worker = current;
        current.onmessage = ({ data }) => {
          const job = pending.get(data.id);
          if (!job) return;
          pending.delete(data.id);
          job.cleanup();
          if (data.error || !Array.isArray(data.words) || data.words.some((words) => !Array.isArray(words))) job.reject(new Error("Could not analyze this word offline."));
          else job.resolve(data.words);
        };
        current.onerror = () => {
          current.terminate();
          if (worker === current) worker = void 0;
          for (const job of pending.values()) {
            job.cleanup();
            job.reject(new Error("The local dictionary could not finish. Try again."));
          }
          pending.clear();
        };
        return current;
      }
      var tokenize = (texts, signal) => {
        if (signal.aborted) return Promise.reject(new DOMException("Analysis cancelled", "AbortError"));
        if (!texts.length || texts.length > 4 || texts.some((text) => !text.length || text.length > 40)) return Promise.reject(new Error("Enter up to four words of 40 characters each."));
        return new Promise((resolve, reject) => {
          const current = dictionary(), id = ++nextId;
          const abort2 = () => {
            current.postMessage({ type: "worker-cancel", id });
            pending.delete(id);
            cleanup();
            reject(new DOMException("Analysis cancelled", "AbortError"));
          };
          const cleanup = () => signal.removeEventListener("abort", abort2);
          pending.set(id, { resolve: (words) => words.length === texts.length ? resolve(words) : reject(new Error("Incomplete local analysis.")), reject, cleanup });
          signal.addEventListener("abort", abort2, { once: true });
          try {
            current.postMessage({ id, key: "standalone:playground", texts, overrides: {}, includeWords: true });
          } catch (error) {
            pending.delete(id);
            cleanup();
            reject(error);
          }
        });
      };
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.showLegacyAnimations) setMimeticLegacyAnimations(changes.showLegacyAnimations.newValue);
      });
      async function main() {
        try {
          const state = await chrome.storage.local.get({ showLegacyAnimations: false });
          setMimeticLegacyAnimations(state.showLegacyAnimations);
        } catch {
        }
        const params = new URLSearchParams(location.search), tool = params.get("tool");
        const vision = createPhotoVision();
        let diary;
        const browser = renderPlaygroundBrowser({ tokenize, dictionaryEntry: linkedDictionary(params), initialTool: tool === "photo" || tool === "diary" ? tool : void 0, photo: {
          lookup: (dictionary2) => renderPhotoLookup({ data: playgroundData, dictionary: dictionary2, analyze: vision.analyze, save: async (image, crop, hit) => {
            await saveDiaryEntry(image, crop, { word: hit.headword, reading: hit.reading, meaning: hit.meaning });
          } }),
          diary: () => {
            const view = renderPictureDiary();
            diary = view;
            return { ...view, activate: () => void view.refresh() };
          }
        } });
        document.querySelector("#playground-host").replaceChildren(browser.element);
        browser.focus();
        window.addEventListener("focus", () => {
          if (diary && !diary.element.hidden) void diary.refresh();
        });
        window.addEventListener("pagehide", (event) => {
          if (event.persisted) return;
          browser.dispose();
          vision.dispose();
          worker?.terminate();
          for (const job of pending.values()) {
            job.cleanup();
            job.reject(new DOMException("Page closed", "AbortError"));
          }
          pending.clear();
        });
      }
      void main();
    }
  });
  require_playgrounds();
})();
//# sourceMappingURL=playgrounds.js.map
