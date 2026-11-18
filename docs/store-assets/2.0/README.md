# Kō 2.0.0 Chrome Web Store listing

Use `ko-japanese-reading-companion-2.0.0-chrome-web-store.zip` from the [GitHub release](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v2.0.0). The archive has `manifest.json` at its root and includes the Mirage runtime and model, local WebP encoder, and relevant licenses. Use the [listing description](listing-description.txt) alongside the [privacy policy](../../privacy-policy.md).

## Privacy disclosures

- **Single purpose.** Help users read Japanese and learn Japanese vocabulary on webpages, in Google Docs, and from images they choose. Kō adds local furigana, dictionary and grammar tools, photo vocabulary lookup, counters, and a local Picture Diary.
- **Active tab.** After the user selects a visible region and confirms Photo Lookup, Kō captures the active tab once, crops it in the extension, and discards the full screenshot. Crops and object detection are processed on this device. Saving to Picture Diary is optional and local.
- **Offscreen.** The offscreen document runs bundled workers for Japanese tokenization, dictionary and grammar tools, Photo Lookup, and lossless image encoding. It also parses bounded Wiktionary responses for the existing definition lookup. The model, code, and WebAssembly are packaged with the extension.

## Reviewer instructions

No account or API key is required. Open Playgrounds → Photo Lookup and choose a photo of everyday objects. Select a detected object to view its Japanese word, reading, and English meaning. Use Count on matching items. Save a crop to Picture Diary, then open the diary to export and reimport a ZIP. For a webpage, open Kō’s toolbar popup and choose Look up from this tab, draw a rectangle and confirm. Call Kōくん to see his photo-and-loupe animation. Image processing works offline. The README and privacy policy describe the existing local-first definition lookup and Wiktionary fallback.
