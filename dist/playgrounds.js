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
    const rules = { simple: i ? "Keep \u3044 in the affirmative nonpast; otherwise replace it with \u304B\u3063\u305F, \u304F\u306A\u3044, or \u304F\u306A\u304B\u3063\u305F. Add \u3067\u3059 for polite speech." : "Add \u3060\uFF0F\u3067\u3059; use \u3060\u3063\u305F\uFF0F\u3067\u3057\u305F for past, and \u3067\u306F\u306A\u3044\uFF0F\u3067\u306F\u3042\u308A\u307E\u305B\u3093 for negatives.", prenominal: i ? "Keep the dictionary form before a noun." : "Add \u306A before a noun.", adverbial: i ? "Replace final \u3044 with \u304F to modify an action." : "Add \u306B to modify an action.", linking: i ? "Replace final \u3044 with \u304F\u3066 to connect descriptions." : "Add \u3067 to connect descriptions.", conditional: i ? "Replace final \u3044 with \u3051\u308C\u3070; for a negative condition use \u304F\u306A\u3051\u308C\u3070." : "Add \u306A\u3089; for a negative condition use \u3067\u306F\u306A\u3051\u308C\u3070.", conditionalTara: i ? "Replace final \u3044 with \u304B\u3063\u305F\u3089; for a negative condition use \u304F\u306A\u304B\u3063\u305F\u3089." : "Add \u3060\u3063\u305F\u3089; for a negative condition use \u3067\u306F\u306A\u304B\u3063\u305F\u3089.", become: i ? "Replace final \u3044 with \u304F and add \u306A\u308B. Conjugate \u306A\u308B for tense, negation, and politeness." : "Add \u306B and \u306A\u308B. Conjugate \u306A\u308B for tense, negation, and politeness.", make: i ? "Replace final \u3044 with \u304F and add \u3059\u308B. Conjugate \u3059\u308B for tense, negation, and politeness." : "Add \u306B and \u3059\u308B. Conjugate \u3059\u308B for tense, negation, and politeness." };
    const irregular = i && (base.reading === "\u3044\u3044" || base.goodCompound) && !["prenominal"].includes(state.family) && !(state.family === "simple" && !state.past && !state.negative);
    return `${base.lemma} \u2192 ${render(base.lemma, base, state)}. ${irregular ? `\u3044\u3044 changes to the \u3088\u3044 stem (${root}). ` : ""}${rules[state.family]}`;
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
    const te = elementary(base, "Te");
    if (family === "teIru") return make(add(te, "\u3044\u308B"));
    if (family === "teMiru") return make(add(te, "\u307F\u308B"));
    if (family === "teOku") return make(spoken ? { text: te.text.slice(0, -1) + (te.text.endsWith("\u3067") ? "\u3069\u304F" : "\u3068\u304F"), reading: te.reading.slice(0, -1) + (te.reading.endsWith("\u3067") ? "\u3069\u304F" : "\u3068\u304F") } : add(te, "\u304A\u304F"), "\u4E94\u6BB5\u30FB\u30AB\u884C\u30A4\u97F3\u4FBF");
    if (family === "teShimau") return make(spoken ? { text: te.text.slice(0, -1) + (te.text.endsWith("\u3067") ? "\u3058\u3083\u3046" : "\u3061\u3083\u3046"), reading: te.reading.slice(0, -1) + (te.reading.endsWith("\u3067") ? "\u3058\u3083\u3046" : "\u3061\u3083\u3046") } : add(te, "\u3057\u307E\u3046"), "\u4E94\u6BB5\u30FB\u30EF\u884C\u4FC3\u97F3\u4FBF");
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
      const te = elementary(base, "Te");
      return { text: te.text + pair.text.slice(te.text.length + 1), reading: te.reading + pair.reading.slice(te.reading.length + 1) };
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
    const at = (className, x, y2, children) => {
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
    const person = (x, y2, mood = "neutral", seated = false) => at("mimetic-person", x, y2, [
      face(0, 0, 14, mood),
      line("M0 15V43M0 24-15 38M0 24 15 38"),
      line(seated ? "M0 43H20V66M0 43-18 50-18 66" : "M0 43-12 67M0 43 12 67")
    ]);
    const clock = (x, y2) => at("", x, y2, [circle(0, 0, 13, { fill: "var(--paper)" }), line("M0-9V0L7 4")]);
    const bag = (x, y2) => at("", x, y2, [box(0, 0, 25, 30), line("M7 0V-6Q13-13 19-6V0M5 17H20")]);
    const heart = (x, y2) => at("mimetic-pulse", x, y2, [line("M0 13-17-3C-28-20-5-29 0-13C5-29 28-20 17-3Z", { fill: "var(--accent)" })]);
    const drop = (x, y2, r = 4) => at("mimetic-drop", x, y2, [line(`M0 ${-r * 2}Q${r * 2} ${r} 0 ${r}Q${-r * 2} ${r} 0 ${-r * 2}Z`, { fill: "var(--accent)", "stroke-width": 1 })]);
    const bubble = (x, y2, width = 34) => at("", x, y2, [line(`M0 0H${width}V21H14L6 29V21H0Z`, { fill: "var(--paper)" }), line(`M7 8H${width - 7}M7 14H${width - 12}`, { "stroke-width": 1 })]);
    const ground = () => line("M20 110H220", { class: "mimetic-trail" });
    const motion = (className, children) => group(className, children);
    const soundMarks = (x, y2, big = false) => at("mimetic-pulse", x, y2, [
      line(`M0-14 ${big ? 18 : 9}-24M3 0H${big ? 26 : 13}M0 14 ${big ? 18 : 9} 24`, { "stroke-width": big ? 3 : 1.5, stroke: "var(--accent)" })
    ]);
    const checklist = (x, y2) => at("", x, y2, [box(0, 0, 37, 46, { fill: "var(--paper)" }), line("M6 11 9 14 14 7M6 25 9 28 14 21M18 12H30M18 26H30M6 38H30", { stroke: "var(--accent)" })]);
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
      else svg.append(motion("mimetic-laugh", [svgNode("ellipse", { ...stroke, cx: 120, cy: 76, rx: 13, ry: 10, fill: "var(--accent)" })]), soundMarks(164, 61, true), at("", 76, 61, [line("M0-14-18-24M-3 0H-26M0 14-18 24", { "stroke-width": 3, stroke: "var(--accent)" })]));
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
        for (let n = 0; n < 3; n++) for (let k2 = 0; k2 < 2; k2++) svg.append(motion("mimetic-bob", [line(`M${61 + n * 44} ${36 + k2 * 40}q-6 12 2 17h16q9-6 0-17Z`, { fill: "var(--surface)" })]));
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
      const button2 = element("button", "mimetic-choice", variant.term);
      button2.type = "button";
      button2.lang = "ja";
      button2.addEventListener("click", () => update(index));
      controls.append(button2);
      return button2;
    });
    function update(index) {
      selected = index;
      const variant = entry.variants[index];
      for (const [i, button2] of buttons.entries()) button2.setAttribute("aria-pressed", String(i === index));
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
    const append = (parent, start, end) => {
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
      append(span, offset, part.start);
      const ruby = document.createElement("ruby");
      append(ruby, part.start, part.end);
      const rt = document.createElement("rt");
      rt.textContent = part.reading;
      ruby.append(rt);
      span.append(ruby);
      offset = part.end;
    }
    append(span, offset, text.length);
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
        const button2 = document.createElement("button");
        button2.type = "button";
        button2.textContent = familyList.find((family) => family.id === match.family)?.label ?? match.family;
        button2.addEventListener("click", () => {
          Object.assign(state, match);
          chosen = true;
          pristine = true;
          paintControls();
          render2();
          select.focus();
        });
        choices.append(button2);
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
    const status = node("p", "tool-status");
    status.setAttribute("role", "status");
    const results = node("div", "tool-results");
    catalog.append(status, results);
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
      const p = node("p", "tool-error", error2 instanceof Error ? error2.message : "Could not load local data.");
      p.setAttribute("role", "status");
      target.replaceChildren(p, button("Try again", retry));
    }
    return { root, scroller, backButton, catalog, status, results, detail, show, back, error };
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
  function renderDictionaryTool(options, initialWord = "") {
    const view = workspace("Dictionary"), { wrap, input } = labelInput("Search dictionary", "Japanese, reading, or English meaning");
    const form = node("form", "tool-search");
    form.append(wrap, button("Search locally", () => void search()));
    view.catalog.prepend(node("p", "playground-intro", "Search the bundled dictionaries. Online lookup is optional."), form);
    input.value = initialWord;
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
        if (hit.headword.length <= 40 && entry.senses.some((s) => s.pos.some((p) => /\bverb\b|adjectiv/.test(p)))) {
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
    async function search(append = false) {
      clearTimeout(timer);
      if (disposed || composing) return;
      const value = input.value.normalize("NFKC").trim();
      if (append && value !== query) return;
      const id = ++sequence;
      controller?.abort();
      controller = new AbortController();
      if (!append) {
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
        const result = await options.data({ op: "search", query: value, offset: append ? hits.length : 0 }, controller.signal);
        if (disposed || id !== sequence) return;
        hits = append ? [...hits, ...result.hits] : result.hits;
        total = result.total;
        view.status.textContent = `${total} entries \xB7 offline`;
        render2();
        if (!total) {
          view.status.textContent = japanese3(value) ? "No matching English dictionary entry in the bundled data." : "No matching English meaning. Try a shorter or different word.";
          if (japanese3(value)) {
            const local = node("section");
            view.results.append(local);
            const page = await options.data({ op: "japanese", word: value }, controller.signal);
            if (disposed || id !== sequence) return;
            if (page.status === "ok") {
              for (const definition of page.definitions) local.append(node("p", "", definition));
              source(local, page, "ja", value);
            } else onlineButton(options, local, value, "ja", () => active() && id === sequence);
            onlineButton(options, local, value, "en", () => active() && id === sequence);
          }
        }
        completedSequence = id;
        if (!append) void suggestions(value, id);
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
    if (initialWord) void search();
    else view.status.textContent = "Enter a Japanese word, reading, or English meaning.";
    return { element: view.root, focus: () => {
      formProbe?.();
      if (completedSequence === sequence) void suggestions(query, sequence);
      input.focus();
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
          if (options.presentation === "panel") {
            wrap.querySelectorAll(".grammar-highlight").forEach((el) => el.setAttribute("aria-pressed", String(el === part)));
          }
        }, "grammar-highlight");
        if (options.presentation === "panel") part.setAttribute("aria-pressed", "false");
        part.setAttribute("aria-label", `${segment.text}: explain construction`);
        part.append(text);
        sentence.append(part);
      } else if (segment.lemma) {
        const word = button("", () => options.dictionary(segment.lemma), "grammar-word");
        word.setAttribute("aria-label", `Look up ${segment.lemma}`);
        word.append(text);
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
    const normalize2 = (s) => s.normalize("NFKC").toLocaleLowerCase("en").replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 96));
    async function open(summary, origin) {
      const id = ++version, content = node("article");
      content.append(node("p", "", "Opening local grammar\u2026"));
      view.show(content, origin);
      try {
        const point = await options.data({ op: "grammar", id: summary.id });
        if (disposed || id !== version) return;
        const lens = node("p", "grammar-lens", panel ? "Select an underlined construction to see its role." : "Select an outlined construction to see its role.");
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
                clens.textContent = "Select the construction to inspect it.";
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
          const summary2 = index.find((p) => p.id === relatedId);
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
        lens.textContent = "Select an underlined construction to see its role.";
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
      const tokens = normalize2(input.value).trim().split(/\s+/u).filter((token) => token && !["a", "an", "the", "to", "of"].includes(token));
      matches2 = index.filter((p) => (level.value === "All" || p.level === level.value) && (!group.value || p.groups.includes(group.value)) && tokens.every((t) => normalize2([p.pattern, ...p.aliases, p.purpose, ...p.keywords].join(" ")).includes(t)));
      view.status.textContent = `${matches2.length} grammar points \xB7 offline`;
      view.results.replaceChildren();
      if (panel) {
        observer?.disconnect();
        rendered = 0;
        view.scroller.scrollTop = 0;
        filterSummary.textContent = `Filters \xB7 ${level.value === "All" ? "All levels" : level.value} \xB7 ${group.value || "All meanings"}`;
        appendBatch();
        view.catalog.append(sentinel);
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
  var japanese3, grammarSectionSequence, playgroundToolStyles;
  var init_playground_tools = __esm({
    "src/playground-tools.ts"() {
      "use strict";
      init_exploration();
      init_verb_playground();
      init_adjective_playground();
      init_definitions();
      init_playground_data();
      japanese3 = (q) => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(q);
      grammarSectionSequence = 0;
      playgroundToolStyles = `
.playground-workspaces,.legacy-playground{display:flex;flex-direction:column;flex:1;min-height:0;height:100%}
.playground-workspace{display:flex;flex:1;min-height:0;min-width:0;container-type:inline-size}.tool-scroll{overflow:auto;overscroll-behavior:contain;width:100%;padding:16px;min-height:0}
.tool-layout{display:grid;gap:20px;min-width:0}.tool-catalog,.tool-detail{min-width:0}.has-detail .tool-catalog{display:none}.tool-detail:focus{outline:none}
.tool-label{display:grid;gap:6px;font-size:12px;font-weight:600;margin-bottom:12px}.tool-label input,.tool-label select{font:13px/1.5 var(--body);padding:10px;background:var(--paper);color:var(--ink);border:1px solid var(--line);width:100%;min-width:0}
.tool-search>button{margin:0}.tool-status{font-size:12px;color:var(--muted)}.tool-results{display:grid;gap:8px}.tool-result{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:12px!important;white-space:normal;overflow-wrap:anywhere;margin:0!important}
.tool-result ruby,.tool-pattern{font-size:20px;font-weight:500;color:var(--accent)}.tool-sense-label,.tool-source{font-size:11px;color:var(--muted);font-weight:400}.tool-heading{font:700 25px/1.6 var(--body);margin:12px 0}.tool-reading{font-size:16px}.tool-back{margin:0!important;padding:5px 0!important;border:0!important;color:var(--accent);background:transparent!important}
.tool-detail p{overflow-wrap:anywhere}.tool-detail details{margin:14px 0;padding:10px 0;border-block:1px solid var(--surface)}.tool-detail summary{cursor:pointer;font-weight:600}.dictionary-senses{padding-left:22px}.dictionary-senses li{padding-bottom:8px}.dictionary-senses p{margin:4px 0}.dictionary-japanese{border-top:1px solid var(--line);margin-top:18px}.dictionary-more ol{padding-left:22px}
.grammar-filters{display:grid;grid-template-columns:1fr 1fr;gap:10px}.grammar-purpose{font-size:15px}.grammar-sentence{font:22px/2.5 var(--body);overflow-wrap:anywhere}.grammar-sentence button{display:inline!important;font:inherit!important;padding:1px 2px!important;margin:0!important;white-space:normal!important;border:0;background:transparent;color:inherit}
.grammar-sentence .grammar-highlight{outline:1px solid var(--seal);outline-offset:-1px;border-bottom:3px solid var(--seal);text-decoration:underline;text-underline-offset:5px;background:var(--surface)}.grammar-word{text-decoration:underline dotted;text-underline-offset:5px}.grammar-translation{font-size:14px}.grammar-lens{padding:10px;border-left:3px solid var(--accent);background:var(--surface);font-size:12px}.grammar-comparison{margin-top:24px;border-top:2px solid var(--line)}
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
.panel-grammar .grammar-sentence .grammar-highlight{outline:none;border-bottom:1px solid var(--seal);text-decoration:none;background:var(--surface)}
.panel-grammar .grammar-sentence .grammar-highlight[aria-pressed=true]{background:var(--surface);box-shadow:inset 0 -3px var(--seal)}
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
    const cancel = () => {
      request++;
      controller?.abort();
      controller = void 0;
      form.removeAttribute("aria-busy");
      submit.disabled = false;
    };
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      cancel();
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
        const button2 = element2("button", "", `Use ${choice.label}`);
        button2.type = "button";
        button2.addEventListener("click", () => {
          if (disposed) return;
          cancel();
          feedback.textContent = "";
          showVerb(choice, button2);
        });
        confirmation.append(button2);
      }
    };
    const check = async (value) => {
      cancel();
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
          const button2 = element2("button", "", `Use ${base.lemma} \xB7 ${base.reading} \xB7 ${base.kind === "i" ? "\u3044-adjective" : "\u306A-adjective"}`);
          button2.type = "button";
          button2.addEventListener("click", () => {
            if (disposed) return;
            cancel();
            feedback.textContent = "";
            const model2 = createAdjectivePlayground(base), panel = element2("div", "explore-panel");
            const original = element2("div", "playground-original");
            original.append(element2("p", "explore-source-label", "Original word"), annotated(model2.source, model2.sourceReading));
            panel.append(original, renderAdjectivePlayground(model2));
            showSelection(panel, button2);
          });
          confirmation.append(button2);
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
        const button2 = element2("button", "playground-entry");
        button2.type = "button";
        button2.append(element2("span", "playground-term", variant.term), element2("span", "playground-gloss", variant.gloss));
        button2.addEventListener("click", () => {
          if (disposed) return;
          cancel();
          confirmation.replaceChildren();
          feedback.textContent = "";
          const panel = element2("div", "explore-panel");
          panel.append(renderMimeticPlayground({ ...entry, initialVariant: index }));
          showSelection(panel, button2);
        });
        results.append(button2);
      }
      count.textContent = `${total} expressions`;
      if (!total) results.append(element2("p", "", "No matching expressions. Try another spelling, reading, or English word."));
    };
    const tabButtons = /* @__PURE__ */ new Map();
    const changeTab = (next) => {
      if (disposed) return;
      cancel();
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
      for (const [key, button2] of tabButtons) {
        button2.setAttribute("aria-selected", String(key === next));
        button2.tabIndex = key === next ? 0 : -1;
      }
      renderResults();
    };
    for (const [id, label] of [["verbs", "Word forms"], ["mimetics", "Mimetics"]]) {
      const button2 = element2("button", "", label);
      button2.type = "button";
      button2.setAttribute("role", "tab");
      button2.setAttribute("aria-selected", String(id === tab));
      button2.tabIndex = id === tab ? 0 : -1;
      button2.id = `${panelId}-${id}`;
      button2.setAttribute("aria-controls", panelId);
      button2.addEventListener("click", () => changeTab(id));
      button2.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "verbs" : event.key === "End" ? "mimetics" : tab === "verbs" ? "mimetics" : "verbs";
        changeTab(next);
        tabButtons.get(next)?.focus();
      });
      tabButtons.set(id, button2);
      tabs.append(button2);
    }
    search.addEventListener("input", renderResults);
    category.addEventListener("change", renderResults);
    input.addEventListener("input", () => {
      cancel();
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
      cancel();
      if (feedback.textContent === "Checking the bundled dictionary\u2026") feedback.textContent = "Check the word again to continue.";
    }, focus: () => {
      if (!disposed) (tab === "verbs" ? input : search).focus();
    } };
  }
  function renderPlaygroundBrowser(options) {
    const root = node("section", "playground-browser");
    root.setAttribute("aria-label", "Playgrounds");
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
      const tool = name === "dictionary" ? renderDictionaryTool(toolOptions) : name === "grammar" ? renderGrammarTool(toolOptions) : renderLegacyPlaygroundBrowser(options, name);
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
      for (const [name, b] of buttons) {
        b.setAttribute("aria-selected", String(name === next));
        b.tabIndex = name === next ? 0 : -1;
      }
      if (focus) current.focus();
    }
    const tools = [["dictionary", "Dictionary"], ["verbs", "Word forms"], ["grammar", "Grammar"], ["mimetics", "Mimetics"]];
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
        buttons.get(next).focus();
      });
    }
    picker.onchange = () => change(picker.value);
    root.append(tabs, pickerLabel, routeBack, host);
    change("verbs", false);
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

  // src/playgrounds.ts
  var require_playgrounds = __commonJS({
    "src/playgrounds.ts"() {
      init_ui_theme();
      init_exploration();
      init_playground_browser();
      init_mimetic_playground();
      var style = document.createElement("style");
      style.textContent = uiTheme + explorationStyles + playgroundBrowserStyles;
      document.head.append(style);
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
          const abort = () => {
            current.postMessage({ type: "worker-cancel", id });
            pending.delete(id);
            cleanup();
            reject(new DOMException("Analysis cancelled", "AbortError"));
          };
          const cleanup = () => signal.removeEventListener("abort", abort);
          pending.set(id, { resolve: (words) => words.length === texts.length ? resolve(words) : reject(new Error("Incomplete local analysis.")), reject, cleanup });
          signal.addEventListener("abort", abort, { once: true });
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
        const browser = renderPlaygroundBrowser({ tokenize });
        document.querySelector("#playground-host").replaceChildren(browser.element);
        browser.focus();
        window.addEventListener("pagehide", (event) => {
          if (event.persisted) return;
          browser.dispose();
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
