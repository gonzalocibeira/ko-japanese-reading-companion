# Kō 1.3.0 · Development build (WIP)

Meet **Kōくん**, an optional browser companion who roams, rests, and helps read Japanese words. Turn him on in the extension menu; he starts off.

### Kōくん

- A PS1-inspired transparent character: chunky cream polygons, vermilion markings, pixel textures, four limbs, and three tails. All 24 routines use the new artwork across 56 composable clips, with shared connection poses and short activity loops.
- Blinks and breathes while standing or seated, with regular walks between nearby spots around the last drop area and occasional floating trips. Sleep stays still and requires at least three active minutes and three walking trips. Activity loops run at most twice before exiting; repeated closing seams are softened during playback.
- Click him, or press Enter or Space when focused, to wake him with a greeting for one minute. Repeated activation refreshes that minute. Awake rests shorten to 8–16 seconds; ordinary idle pauses last 12–24 seconds, rounded up to a complete animation cycle. Dragging does not wake him, and reduced motion takes precedence.
- Drag him anywhere in the webpage viewport, or focus him and use arrow keys. The last drop area is remembered per site. Choose Small, Default, or Large.
- Hover over a Japanese word for 600 ms, or choose Highlight in settings. The bubble closes automatically when the pointer leaves a hovered word. It follows Kōくん while his animation and movement continue.
- Immediately starts his open-scroll reading animation when a word reading appears, taking priority over idle, sleep, travel, and activities. The animation keeps running with the bubble open and finishes its normal exit after one cycle.
- Dialogue adapts to word length, wraps within the viewport, and uses a muted, dithered JRPG frame with a bundled Japanese pixel font. No runtime font service is used.
- Definitions start off. English meanings now use the complete bundled JMdict dictionary; missing English meanings and Japanese definitions use Wiktionary online. Readings remain available if definitions fail.
- Supports ordinary webpage text, exposed Google Docs text geometry, and words in Kō’s reading view. Use Reading view when Docs cannot expose a reliable editor target. Embedded-frame lookup, arbitrary canvas/image text, browser-protected pages, and browser PDF viewers are excluded.
- His switch works independently of automatic page furigana. Pause on this site hides him. Hidden tabs pause animations; reduced motion shows a still character. Printing and fullscreen hide him.
- About easter egg: activate the version number five times to open a small offline animation gallery. Thirty tiles automatically play all 24 routines and six transitions, including every one of the 56 clips. There are no controls; system reduced motion shows still previews.

### Local-first word definitions

- The complete English JMdict dictionary works offline in word details and Kōくん. Japanese definitions and missing English meanings automatically fall back to Wiktionary. Local English appears immediately while Japanese loads.
- Follow recognized spelling-reference entries, including 飲む → のむ. Unsupported page layouts offer retry instead of reporting a missing word. Retry only reloads failed languages.
- Each result identifies its source. JMdict data remains under CC BY-SA 4.0 with EDRDG attribution and bundled documentation. No accounts or API keys are required.

### Development and updating

This is work in progress on the repository's primary branch, **master**, not a published 1.3 release. The manifest displays **1.3.0 WIP** while retaining numeric version **1.3.0**. No 1.3 tag, GitHub release, store submission, or launch date is set. Load the rebuilt **dist** folder or a locally generated development ZIP, then reload the extension and existing tabs. Existing settings and corrections remain; Kōくん stays off until enabled.
