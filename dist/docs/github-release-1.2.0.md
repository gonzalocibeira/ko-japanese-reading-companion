# Kō 1.2.0 · 18 October 2026 · RC1

Explore adjective forms offline, discover 30 more mimetic expressions, and see how Japanese word forms are built.

Release candidate **RC1**, published for testing as **v1.2.0-rc.1** on GitHub. The extension manifest version is **1.2.0**. Chrome Web Store submission and availability are separate.

- **Word forms:** one shared tab accepts dictionary-form verbs and い／な adjectives, with local confirmation of the word, reading, and grammatical class. Existing verb forms remain available.
- **Adjective Playground:** explore basic predicates, forms before nouns, adverbial and linking forms, conditions, and become/make constructions. Applicable Past, Negative, and Polite switches update the form and furigana. Dictionary evidence handles な-adjectives ending in い and supported いい compounds; Reset restores the exact original phrase.
- **Try word forms:** supported verbs and adjectives open the same controls inline from word details, alongside definitions. Supported inflected phrases retain their complete original span. Unsupported longer constructions are declined.
- **How this form is built:** short class-aware rules explain every supported verb/adjective output from its dictionary form. Highlighted changes still compare against the original passage.
- **More mimetics:** 90 expressions across 45 original illustrated comparisons, including 30 new expressions for food and texture, everyday sounds, and daily actions. Each includes an original Japanese example, translation, usage notes, and reference. New ukiyo-e-inspired pixel scenes start automatically and loop with a held final pose; reduced motion shows a still pose. About → Show legacy animations restores the original line style, with the choice saved on this device.
- **Contextual commands:** recover dictionary-verified imperatives such as 受け取れ and 知れ at text, line, or sentence-ending boundaries. Word details uses the corrected dictionary form for lookup, and Word forms opens Direct command. Comma-separated clauses and ambiguous particle-attached stems keep their original analysis.
- **Release updates:** a small announcement in the extension menu links to the About changelog. Dismiss it once per version on this device. About also links directly to GitHub to suggest a feature or improvement.
- No new dependencies, permissions, accounts, API keys, remote assets, or learning history. Existing settings and correction backups remain compatible.

### Verification

Build and typecheck pass. All **186 automated tests** and **3 prior release-audit regressions** pass, including the native toolbar popup, looping animations, legacy-style preference, and update-announcement persistence/failure recovery. Package and documentation checks are recorded in the [1.2 release audit](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/release-1.2-audit.md). Controlled webpage and Google Docs fixtures cover offline operation and source preservation; live Docs editing was not exercised for RC1.

### Updating

Load the rebuilt `dist/` folder or the extracted manual-install ZIP, reload the extension, then reload open tabs. Keep the existing installation to retain preferences and corrections. Download the manual-install ZIP, store-layout ZIP, and SHA256SUMS from the [1.2.0 RC1 prerelease](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v1.2.0-rc.1). The manual ZIP contains dist/; the store ZIP has manifest.json at its root. See the [1.2 release audit](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/release-1.2-audit.md) for validation and packaging evidence.
