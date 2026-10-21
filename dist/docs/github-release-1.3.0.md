# Kō 1.3.0 · 22 October 2026

Meet **Kōくん**, your optional Japanese-reading companion. Enable him in the extension menu to try him.

### Kōくん

- A PS1-inspired transparent character: chunky cream polygons, vermilion markings, pixel textures, four limbs, and three tails. All 24 routines use the new artwork across 56 composable clips, with shared connection poses and short activity loops.
- Blinks and breathes while standing or seated, with regular walks between nearby spots around the last drop area and occasional floating trips. Sleep stays still and requires at least three active minutes and three walking trips. Activity loops run at most twice before exiting; repeated closing seams are softened during playback.
- Click him, or press Enter or Space when focused, to wake him with a greeting for one minute. Repeated activation refreshes that minute. Awake rests shorten to 8–16 seconds; ordinary idle pauses last 12–24 seconds, rounded up to a complete animation cycle. Dragging does not wake him, and reduced motion takes precedence.
- Drag him anywhere in the webpage viewport, or focus him and use arrow keys. The last drop area is remembered per site. Choose Small, Default, or Large.
- Hover over a Japanese word for 600 ms, or choose Highlight in settings. The bubble closes automatically when the pointer leaves a hovered word. It follows Kōくん while his animation and movement continue.
- Immediately starts his open-scroll reading animation when a word reading appears, taking priority over idle, sleep, travel, and activities. The animation keeps running with the bubble open and finishes its normal exit after one cycle.
- Dialogue adapts to word length, wraps within the viewport, and uses a muted, dithered JRPG frame with a bundled Japanese pixel font. No runtime font service is used.
- Definitions start off. English meanings use complete bundled JMdict and Japanese definitions use a bundled Japanese Wiktionary snapshot. Missing meanings use Wiktionary online. Readings remain available if definitions fail.
- Supports ordinary webpage text, exposed Google Docs text geometry, and words in Kō’s reading view. Use Reading view when Docs cannot expose a reliable editor target. Embedded-frame lookup, arbitrary canvas/image text, browser-protected pages, and browser PDF viewers are excluded.
- His switch works independently of automatic page furigana. Pause on this site hides him. Hidden tabs pause animations; reduced motion shows a still character. Printing and fullscreen hide him.
- About easter egg: activate the version number five times to open a small offline animation gallery. Thirty tiles automatically play all 24 routines and six transitions, including every one of the 56 clips. There are no controls; system reduced motion shows still previews.

### Local-first word definitions

- English JMdict and Japanese Wiktionary definitions work offline in word details and Kōくん. The Japanese snapshot covers 124,195 headwords, including 11,252 resolved spelling references. Missing entries automatically fall back to the corresponding Wiktionary edition. Each language appears independently.
- Follow recognized spelling-reference entries, including 飲む → のむ. Unsupported page layouts offer retry instead of reporting a missing word. Retry only reloads failed languages.
- Each result identifies its source and whether it was looked up locally. JMdict and Japanese Wiktionary data remain under CC BY-SA 4.0 with separate attribution, source metadata, and bundled notices. No accounts or API keys are required.

### Reading reliability and invitation

- Dictionary-backed kanji noun compounds remain complete in readings and reading-panel word buttons.
- Kōくん Highlight lookup follows supported Google Docs painted selection geometry, including selection changes without native browser selection events. Ambiguous and multi-line selections are declined.
- Content scripts safely skip direct SVG/XML documents.
- A compact popup invitation opens Kōくん settings and focuses his switch. He remains off until you enable him. Close the announcement once to keep it dismissed for this version on this device.

### Downloads and updating

Download the manual-install ZIP, store-layout ZIP, and SHA256SUMS from the [1.3.0 release](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v1.3.0). The manual ZIP contains **dist/**; the store ZIP has **manifest.json** at its root. Reload the existing extension and open tabs to retain settings and corrections. Kōくん stays off until enabled. Chrome Web Store submission and publication are managed separately.

See the [1.3 release audit](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/release-1.3-audit.md) for validation, dictionary attribution, package parity, and compatibility limits.
