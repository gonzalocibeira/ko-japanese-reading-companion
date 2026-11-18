# Kō 2.0.0 · 18 November 2026

Look up objects in photos and webpages, practice Japanese counters, and keep useful vocabulary in your Picture Diary.

- **Photo Lookup** runs bundled Mirage on your device and matches object names to Japanese words, readings, and English meanings in JMdict. Paste or drop a photo into Playgrounds, or select an area with **Look up from this tab**. Click an outline or choose an object from the keyboard-accessible list. You can adjust a label and retry with a tighter crop.
- **Kōくん image inspection** follows the lookup. He raises a photo and loupe while you choose an area, follows the loupe as it scans, reacts when objects appear, and refocuses when you pick one. He lowers the photo when the selector closes. His still-character option and system reduced-motion preference show static cues.
- **Count** shows Japanese readings for 17 counters across more than 300 image labels. Four cars give 四台（よんだい）. Use **Count as things** for an eligible inanimate selection without a shared counter. The counter panel links to the Tokyo University of Foreign Studies reference.
- **Picture Diary** saves lossless object crops and vocabulary on your device. Search by word, kana, or English. ZIP backups preserve images and merge entries by ID when imported.
- **Tab capture** starts only after you confirm a selection. Same-document URL changes preserve the lookup. If the page scrolls after capture, the vocabulary remains available in the object list.

### Downloads and updating

Extract the [manual-install ZIP](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v2.0.0/ko-japanese-reading-companion-2.0.0.zip) and load its `dist` folder in Chrome. The [store-layout ZIP](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v2.0.0/ko-japanese-reading-companion-2.0.0-chrome-web-store.zip) places `manifest.json` at the archive root. See [SHA256SUMS](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v2.0.0/SHA256SUMS) to verify either archive. Keep your existing installation to retain settings and Picture Diary entries. Reload the extension and refresh existing tabs after updating.

### Privacy and verification

Photo Lookup adds temporary active-tab access for user-confirmed captures. The Mirage runtime and model are included in the package. See the [privacy policy](https://github.com/gonzalocibeira/ko-japanese-reading-companion/blob/master/docs/privacy-policy.md) for how image processing and diary storage work.

All 302 automated tests passed on the 2.0.0 runtime. Real Mirage inference was verified offline in Chromium. The suite also covered the mascot animation and reduced motion, counters, screenshot alignment, and lossless diary backup and restore. Both package layouts contain the same 1,611 runtime files.
