# Kō 1.4.0 · 1 November 2026

Explore Japanese words and N5–N1 grammar in two new offline playgrounds, with dictionary search and Sentence Lens comparisons.

- **Dictionary:** search Japanese spellings, readings, and English meanings in bundled JMdict. Browse separate entries and expandable senses with reading restrictions, parts of speech, usage labels, source attribution, and local Japanese definitions. Show more loads the next 30 results.
- **Explicit online lookup:** Dictionary Playground makes no automatic online requests. Missing definitions offer a language-specific action sending only the selected Japanese term to Wiktionary. Reading view and Kōくん retain their existing local-first fallback policy.
- **Grammar — Sentence Lens:** 847 original Kō grammar points reconcile 848 N5–N1 reference entries, with three original annotated examples each. Browse levels and meaning groups, search Japanese/kana/romaji/English, inspect highlighted constructions, and expand formation and usage notes.
- **Compare meaning:** 18 original comparison families cover particles, conditionals, reasons, aspect, purpose, decisions, expectations and obligations, recent completion, concession, inference, qualified negatives, unexpected inclusion, and time windows. Complete authored sentence variants show all necessary surrounding changes. Optional activities give explanatory feedback without scores or progression.
- **Connected exploration:** Dictionary, Word forms, Grammar, and Mimetics share standalone and Reading-view access. Tools retain their state during the session; grammar vocabulary links to Dictionary and returns to the same example and comparison.
- **Grammar in Reading view:** browse results with automatic batch loading, then switch between Example, Usage, and Compare. Previous/Next steps through a point’s three examples. Highlighted grammar explains its role; dotted vocabulary opens Dictionary. The list, selected example, comparison, and reading position are restored when you return.
- **Reliability and keyboard access:** Grammar resumes correctly when its first load finishes in a hidden tool. Keyboard switching into panel Grammar focuses the visible playground picker. English and Japanese online dictionary lookups keep their controls and results independent.
- Grammar content and indexes are bundled. Ordinary builds use pinned local sources without downloading lessons or dictionaries. JLPT Sensei topic indexes guide coverage; original explanations and examples are Kō material. JLPT levels are supplementary study references.
- No new dependencies, extension permissions, saved searches, or learning history. Existing settings and corrections remain compatible. GitHub release and store publication are managed separately.

See the [1.4 validation audit](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/release-1.4-audit.md) for exact coverage and validation results.

### Downloads and updating

Download the [manual-install ZIP](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v1.4.0/ko-japanese-reading-companion-1.4.0.zip), extract it, and load its `dist` folder. The [store-layout ZIP](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v1.4.0/ko-japanese-reading-companion-1.4.0-chrome-web-store.zip) has `manifest.json` at its root. Verify downloads with [SHA256SUMS](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v1.4.0/SHA256SUMS). Reload the extension and existing webpage/Google Docs tabs after updating, keeping the existing installation to retain settings and corrections. GitHub publication does not submit or publish a Chrome Web Store update.

### Verification

All **276 automated tests** pass, including the native toolbar popup, offline dictionaries and grammar, Google Docs fixtures, IME, keyboard access, narrow layouts, and the three release-pass regressions. Type checking and release-package validation pass. Both ZIP layouts contain the same 1,599 runtime files. Live Google Docs was not manually smoke-tested for this release; grammar content has editorial and agent review rather than native-speaker certification.
