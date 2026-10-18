# Kō 1.2.0 · 28 October 2026

Explore adjective forms offline, discover 30 more mimetic expressions, and see how Japanese word forms are built.

Full release **1.2.0**, scheduled for **28 October 2026** with GitHub tag **v1.2.0**. The release is prepared as a draft until launch. Chrome Web Store availability depends on review and publication. The future Kō-kun character animations are excluded; the RC1 mimetic animations remain included.

- **License:** original Kō code, documentation, and assets now use the [Kō No-Resale License 1.0](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/LICENSE). Free use, including at work, modification, and free sharing remain permitted. Selling Kō or modified or rebranded copies, charging for access, or including Kō in a paid product requires written permission from Gonzalo Cibeira. Earlier MIT-distributed copies, including the initially published RC1, retain their original permissions. Third-party licenses are unchanged.
- **Word forms:** one shared tab accepts dictionary-form verbs and い／な adjectives, with local confirmation of the word, reading, and grammatical class. Existing verb forms remain available.
- **Adjective Playground:** explore basic predicates, forms before nouns, adverbial and linking forms, conditions, and become/make constructions. Applicable Past, Negative, and Polite switches update the form and furigana. Dictionary evidence handles な-adjectives ending in い and supported いい compounds; Reset restores the exact original phrase.
- **Try word forms:** supported verbs and adjectives open the same controls inline from word details, alongside definitions. Supported inflected phrases retain their complete original span. Unsupported longer constructions are declined.
- **How this form is built:** short class-aware rules explain every supported verb/adjective output from its dictionary form. Highlighted changes still compare against the original passage.
- **More mimetics:** 90 expressions across 45 original illustrated comparisons, including 30 new expressions for food and texture, everyday sounds, and daily actions. Each includes an original Japanese example, translation, usage notes, and reference. New ukiyo-e-inspired pixel scenes start automatically and loop with a held final pose; reduced motion shows a still pose. About → Show legacy animations restores the original line style, with the choice saved on this device.
- **Contextual commands:** recover dictionary-verified imperatives such as 受け取れ and 知れ at text, line, or sentence-ending boundaries. Word details uses the corrected dictionary form for lookup, and Word forms opens Direct command. Comma-separated clauses and ambiguous particle-attached stems keep their original analysis.
- **Word details:** a compact outlined Correct reading button sits beside the pronunciation, keeping corrections easy to find without taking a separate row.
- **Release updates:** a small announcement in the extension menu links to the About changelog. Dismiss it once per version on this device. About also links directly to GitHub to suggest a feature or improvement.
- No new dependencies, permissions, accounts, API keys, remote assets, or learning history. Existing settings and correction backups remain compatible.

### Verification

RC1 passed **186 automated tests** and **3 prior release-audit regressions**, including the native toolbar popup, looping animations, legacy-style preference, and update-announcement persistence/failure recovery. Package and documentation checks are recorded in the [1.2 release audit](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/release-1.2-audit.md). Controlled webpage and Google Docs fixtures cover offline operation and source preservation; live Docs editing was not exercised for RC1. Final preparation checks are recorded separately in the audit.

### Updating

Load the rebuilt `dist/` folder or the extracted manual-install ZIP, reload the extension, then reload open tabs. Keep the existing installation to retain preferences and corrections. At launch on 28 October 2026, download the manual-install ZIP, store-layout ZIP, and SHA256SUMS from the [1.2.0 release](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v1.2.0). The manual ZIP contains dist/; the store ZIP has manifest.json at its root. See the [1.2 release audit](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/release-1.2-audit.md) for validation and packaging evidence.
