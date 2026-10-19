<p align="center">
  <img src="docs/hero-banner.png" alt="Kō — Japanese Reading Companion, showing furigana on Japanese Wikipedia and the Google Docs reading view against an ukiyo-e-inspired landscape" width="100%">
</p>

<h1 align="center">Kō — Japanese Reading Companion</h1>
<p align="center"><strong>Japanese reading companion.</strong></p>
<p align="center">Automatic Japanese readings for webpages and Google Docs.<br>Furigana runs on your device. Optional word definitions use Wiktionary online.</p>
<p align="center"><strong>1.3.0 development build</strong> · Local build; not published</p>
<p align="center">
  <a href="https://chromewebstore.google.com/detail/khhdlbblmannlpbkmhmppakldpjhaiok">Install from the Chrome Web Store</a> ·
  <a href="#see-it-in-action">See it in action</a> ·
  <a href="#make-it-yours">Make it yours</a> ·
  <a href="#help-and-compatibility">Get help</a> ·
  <a href="#release-notes">Release notes</a>
</p>

![Furigana above Japanese text on Wikipedia, with the extension menu showing automatic readings enabled](docs/screenshots/webpage-live.png)

<p align="center"><em>Read Japanese where you already browse. Readings appear automatically above the kanji.</em></p>

| Read as you browse | Keep your work intact | Stay in control |
| --- | --- | --- |
| Furigana appears automatically on visible Japanese text. | Original webpage text and Google Docs formatting stay unchanged. | Pause a site, adjust the appearance, or save your own readings. |
| **Offline furigana** uses bundled reading dictionaries. | **Reading panel for webpages and Google Docs** adds extra spacing and optional online word definitions. | **No extension account or API key** needed. Settings and corrections are saved on this device. |

## Release notes

### 1.3.0 · Development build (WIP)

**Kōくん** is an optional browser companion. Enable him in the extension popup; he starts off. He blinks and breathes while idle, takes regular walks around his drop area, and waits at least three active minutes and three walking trips before he can sleep. Awake pauses last about 12–24 seconds; sleeping stays still. Special routines retain a 5–10 minute cooldown. **Click him to wake him for one minute**: he greets you and becomes more active, with 8–16 second rests between actions. Clicking again refreshes that minute; dragging does not wake him. Enter or Space also wakes him when focused. The minute expires even while his tab is in the background, and a routine already underway finishes its normal exit.

His PS1-inspired design uses chunky cream polygons, vermilion markings, pixel textures, four limbs, and three tails. All 24 routines have been rebuilt as 56 transparent clips. [Preview the animation library](qa/ko-kun-animation/ps1-review.html).

He walks gently around his drop area and occasionally takes off, floats, and lands back at his ground height. Physical specials have small movements matched to their poses; quiet activities stay planted. Activities run for at most two loop iterations. Drag him to move him; the visible drop location becomes his new ground position and is remembered per site. Use arrow keys when focused for keyboard repositioning. He has no permanent window or controls.

Hover over a Japanese word for 600 ms to open his speech bubble, or choose **Highlight** in his settings. Hover bubbles close when you leave the word. The content-sized pixel dialogue follows him while his animation keeps running. A word reading immediately starts his open-scroll animation, taking priority over roaming and other activities. Readings work offline, including on exposed Google Docs text and in Reading view. Definitions start off; optionally enable English or Japanese Wiktionary definitions. Only the lookup word is sent to that edition. His switch works with automatic page furigana off; **Pause on this site** hides him. Sizes and a still-character option are in the popup, and system reduced motion is respected.

Use Reading view when Google Docs does not expose enough editor text. Mascot lookups do not cover embedded frames, browser-protected pages, browser PDF viewers, or arbitrary image/canvas text. No needs, feeding, sound, or progression are included.

The primary branch, `master`, contains this work in progress. Load [`dist/`](dist/) or a locally generated 1.3.0 ZIP, then reload the extension and existing tabs. The numeric manifest version is `1.3.0`, with the display version `1.3.0 WIP`. There is no v1.3 release, tag, store submission, or launch date. See the [v1.3 verification notes](docs/release-1.3-audit.md) and [full changelog](docs/release-notes.md).

### 1.2.0 · 28 October 2026

- **Word forms:** one input for verbs and い／な adjectives, with dictionary-backed class and reading confirmation.
- **Adjective Playground:** predicates, forms before nouns, adverbial and linking forms, conditions, and become/make constructions, with applicable tense, negative, and polite controls.
- **Try word forms** opens supported verb/adjective controls inline from word details. Exact-original Reset, furigana, and change highlighting work in both entry points.
- **How this form is built** explains each verb/adjective ending from its dictionary form.
- **Contextual commands:** dictionary-verified forms such as 受け取れ open Direct command and look up 受け取る at supported sentence and line boundaries.
- **90 mimetic expressions in 45 illustrated comparisons**, with original examples, usage notes, references, and new ukiyo-e-inspired pixel animations. Scenes loop automatically; reduced motion shows a still pose. About → **Show legacy animations** restores the original line style.
- **Release announcements:** a compact banner summarizes each version, links to the About changelog, and stays dismissed on this device after closing it. About also opens GitHub to **Suggest a feature or improvement**.

Version 1.2.0 was published on GitHub on 18 October 2026 under `v1.2.0`; its announced launch date is 28 October. Chrome Web Store review and publication are managed separately. These download links contain the 1.2 runtime; the primary branch and its bundled `dist/` now contain 1.3 WIP.

RC1 verification: all **186 tests** and **3 prior release-audit regressions** passed. Final release preparation checks are recorded in the audit. See the [1.2 audit](docs/release-1.2-audit.md) for scope and limits.

Download [1.2.0](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v1.2.0), or load the rebuilt [`dist/`](dist/) folder. The release includes a manual-install ZIP, a store-layout ZIP, and SHA256SUMS. See the [1.2 audit](docs/release-1.2-audit.md) for current verification and [full release notes](docs/release-notes.md) for supported behavior and updating.

**About Kō → What’s new · Changelog** displays the current notes and links to the full offline history. The GitHub release body, bundled About page, and history use the same [changelog](docs/release-notes.md). Close the menu’s update announcement to hide that version on this device; a later version gets a new announcement. **Suggest a feature or improvement** opens a new GitHub issue.

### 1.1.0 · 17 October 2026

The [previous stable release](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v1.1.0) introduced the expanded Verb Playground, 60 mimetic expressions in 30 illustrated comparisons, direct offline verb input, Meaning Forks, automatic bilingual word definitions, and reading reliability fixes. Its historical verification and live read-only Docs checks are recorded in the [1.1 audit](docs/chrome-web-store-audit.md).

### 1.0.0 · 14 October 2026

- **Kō — Japanese Reading Companion.** The new name and vermilion 考 seal share the same identity. The interface uses warm paper, ink, indigo, and vermilion inspired by ukiyo-e prints.
- **Brutalist interface.** Square controls, bold headings, ink borders, and an ukiyo-e-inspired palette across the popup, reading panel, definitions, and corrections.
- **Per-tab 考 icon.** See whether readings are active, paused, or unavailable without opening the menu. Hover over the icon for details.
- **Reading view on webpages and Google Docs.** Enable the panel per website. It follows visible text after scrolling settles, including wrapped webpage paragraphs and kana-only words.
- **Choose your reading size and panel width.** Select 16–32 px text in the popup, or drag the panel’s left edge to resize. Text size, spacing, and width are remembered across sites.
- **Correct readings where you read.** Open a word’s detail card, choose **Correct reading**, and save its preferred pronunciation—even when online definitions fail. Restore the automatic reading from the same form.
- **Find and back up corrections.** Search by word or reading, export a JSON backup, and import it on another installation. Imports keep existing readings when words match and validate the entire backup before saving.

Read the [full release notes](docs/release-notes.md) for details and update instructions. After updating, reload the extension and your open tabs.

## Install in Chrome

**[Install Kō from the Chrome Web Store](https://chromewebstore.google.com/detail/khhdlbblmannlpbkmhmppakldpjhaiok).** Click **Add to Chrome**, confirm the installation, then reload your open tabs to start reading. Store installations receive updates automatically.

The working tree contains **1.3.0 development**. Build locally for Kōくん. The historical 1.2 download links below are separate from this unpublished build; store availability depends on review and publication.

**Tip:** Pin **Kō — Japanese Reading Companion** from Chrome's puzzle-piece **Extensions** menu. Look for the warm-paper **考** (think) on a vermilion seal.

### Manual installation

You can also load the ready-to-use extension from [`dist/`](dist/). No Node.js, npm, or build step needed.

1. **Download the [1.2.0 extension ZIP](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v1.2.0/ko-japanese-reading-companion-1.2.0.zip).** It contains the ready-to-load `dist` folder. You can also download the full source from [the repository](https://github.com/gonzalocibeira/ko-japanese-reading-companion) using **Code → Download ZIP**. Release assets include [SHA-256 checksums](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/download/v1.2.0/SHA256SUMS).
2. **Extract and keep the folder.** Put it somewhere permanent, such as `Documents/Ko`.
3. **Open Chrome's extensions page.** Enter `chrome://extensions` in the address bar and turn on **Developer mode**.
4. **Load the extension.** Click **Load unpacked** and select the extracted folder containing `manifest.json`. For a repository/source download, this is the **`dist` folder**. A `chrome-web-store.zip` package has `manifest.json` directly in its extracted root.
5. **Reload your tabs and read.** Furigana starts automatically. The first page may take a moment while the bundled reading dictionary loads.

<details>
<summary><strong>Which folder should I select?</strong></summary>

```text
ko-japanese-reading-companion-1.2.0/
└── dist/                  ← Select this folder in “Load unpacked”
    ├── manifest.json
    ├── content.js
    ├── background.js
    ├── dict/
    └── icons/
```

Select the extracted folder containing `manifest.json`, not the ZIP or repository root. Keep that folder in place and leave Developer mode enabled. Managed work or school browsers may restrict unpacked extensions.

The manual-install ZIP and repository/source downloads both contain a `dist` folder. The separate `ko-japanese-reading-companion-1.2.0-chrome-web-store.zip` asset is intended for store submission and has `manifest.json` directly at its root; if loading that package manually, select its extracted root instead.

See [Chrome's official instructions for loading unpacked extensions](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

</details>

## See it in action

### Interface and toolbar status

The popup and reading panel use square controls, ink borders, warm paper surfaces, indigo, and vermilion accents. All reading settings, corrections, and backups remain available in the expandable sections.

| Toolbar icon | Meaning |
| --- | --- |
| **Vermilion 考** | Readings are enabled and available on this tab, even with no visible kanji. |
| **Sand-colored 考 with pause bars** | Readings are paused globally or for this hostname. |
| **Outlined 考 with a slash** | The page is unavailable, processing failed, or the tab needs a reload. Hover over the icon for the reason. |

Scrolling, typing, and background-tab suspension do not change an otherwise active icon. Click any icon state to open the menu.

### On the web

The Wikipedia example above shows furigana added directly above Japanese text. Open the extension menu to pause a site, customize readings, or check the page status.

### Kōくん word lookups · 1.3 development

![Kōくん beside Japanese text, with a pixel-style speech bubble showing 海賊, its reading かいぞく, and the English Wiktionary definition of pirate](docs/screenshots/ko-kun-word-lookup.png)

Kōくん shows a word’s reading in a speech bubble. Enable optional English or Japanese definitions to see its meaning from Wiktionary, as shown here for **海賊** (かいぞく, pirate).

### In Google Docs

Readings appear over the visible document text while you keep working in the original editor.

![A live Google Doc with furigana above Japanese sentences and the extension menu open](docs/screenshots/google-docs-live.png)

### More room to read

Open the optional **Extra-space reading view** for a separate, selectable panel with roomier spacing. Your document keeps its original layout.

![Google Docs beside the extension's reading panel, showing larger Japanese text and furigana with extra line spacing](docs/screenshots/google-docs-reading-view-live.png)

1. Open a webpage or Google Doc and click the extension icon.
2. Expand **Reading view** and enable **Extra-space reading view**.
3. Choose **Comfortable**, **Roomy**, or **Spacious** line spacing and your preferred **Text size**.
4. Drag the panel’s left edge to resize it, or focus the edge with Tab and use the arrow keys.

The panel follows visible webpage text, or the active Docs page, after scrolling or editing settles, keeping the current text visible while an update waits. Unchanged document redraws preserve your selection, reading position, and open definition. Continue editing in Docs; click the panel’s **×** close button to return to overlay readings. Panel activation is saved per hostname. Text size, spacing, and width apply across sites. Existing Google Docs panel preferences are preserved when upgrading.

### Look up a word

Click a word in the reading panel to automatically see its English and Japanese definitions, reading, and available local tools. For inflected words, the card also shows the dictionary form used for lookup. Supported verbs and adjectives offer **Try word forms** inline; **Open playgrounds** remains available for other local tools, including Mimetic Playground and Meaning Forks; these tools require no internet connection.

Choose **Playgrounds** in the extension menu to open a standalone tab, or use the **Playgrounds** button in Reading view. The standalone tab works with automatic readings off and on browser-protected pages; it does not enable Reading view. Both entry points use the same offline workspace without selecting a page word. In **Word forms**, enter a dictionary-form verb or adjective such as 書く, 高い, or 静か and confirm its local analysis. There is no preset word list. Use **← Change word** to return to input. In **Mimetics**, search 90 expressions by Japanese, reading, or English and filter by category; **← Examples** restores your list position. **← Reading view** returns to your reading position. Experiments and typed words remain in memory; the source page is never rewritten. Preview the [shared input](docs/screenshots/word-forms-input-1.2.png), [Adjective Playground](docs/screenshots/adjective-420-1.2.png), and [new mimetic comparison](docs/screenshots/mimetics-eating-1.2.png). These 1.2 previews use controlled webpage fixtures. Previous 1.1 live previews remain in the screenshots directory.

![Google Docs beside the reading panel, with 海賊 selected and its reading かいぞく, English and Japanese definitions, and Wiktionary source links visible](docs/screenshots/google-docs-dictionary-live.png)

Here, **海賊** has the reading **かいぞく** and the meaning **pirate**, with definitions in both languages loaded automatically when clicked. The original Google Doc stays visible beside the panel. Follow either Wiktionary source link to read the full entry.

Definitions come from the English and Japanese editions of Wiktionary and require an internet connection. Activating a word sends only its dictionary form; cached definitions can be shown without another request. Opening the Playgrounds browser and using exploration controls makes no definition requests. Each language shows its own unavailable or missing-entry message when necessary. Failed lookups offer **Retry definitions online**.

You can also focus a word with Tab and open it with Enter or Space. Exploration switches and comparison buttons work with the keyboard. Mimetic scenes loop automatically. Press Escape or the word card's **×** button to dismiss it and return to reading.

These screenshots show Kō 1.0 in use on Japanese Wikipedia and in Google Docs. The reading panel is text-only: tables and formatting may be simplified, and images are omitted.

## Make it yours

| In the extension menu | What you can do |
| --- | --- |
| **Automatic readings** | Turn readings on or pause them everywhere. |
| **Pause on this site** | Pause the current hostname while keeping other sites active. |
| **Reading appearance** | Choose Small, Default, Large, or Extra large readings, with page colors or high contrast. Preferences are saved per hostname. |
| **Reading view** | Open a panel for this website, choose line spacing and text size, and drag its left edge to resize. |
| **Local reading corrections** | Save, search, edit, remove, export, or import preferred readings. Up to 200 corrections apply across sites. |
| **On this page** | Check reading status, including tight spacing or unavailable Docs text. |

To correct a reading directly, click a kanji word in the panel and choose **Correct reading**. The word and current reading are filled in; both can be edited. A saved correction offers **Restore automatic reading**. Corrections work offline even if word definitions cannot load.

Under **Local reading corrections**, search by word or hiragana/katakana reading. **Export backup** downloads only your corrections as JSON; **Import backup** merges a version 1 backup, keeping existing readings on conflicts. Invalid backups or imports exceeding 200 corrections make no changes.

For isolated vocabulary and translation lines such as `出口 = salida`, readings prefer a matching common-noun dictionary entry when the tokenizer selects a proper name. Saved corrections take priority; add one when you intend a standalone surname or another preferred reading.

Readings shrink or are omitted when space is tight to preserve the original line spacing. Try a smaller reading size or the extra-space reading panel when you need more room.

## Privacy and online lookups

Open **About Kō** from the popup or Chrome’s extension options for the project summary, privacy policy, and GitHub links. Reading settings remain in the toolbar popup. Read the dedicated [privacy policy](docs/privacy-policy.md), also available from the extension popup. See the [Chrome Web Store submission audit](docs/chrome-web-store-audit.md) for permission explanations and release steps.

**Furigana readings run on your device.** The extension uses bundled Kuromoji/IPADIC reading dictionaries and sends no text to an external service to generate furigana.

**Word definitions use Wiktionary online.** Kōくん definitions are off by default; when enabled, hovering or highlighting sends the dictionary form to only the selected language. Clicking a word in the reading panel, or activating it with Enter or Space, automatically sends that word's dictionary form to the English and Japanese Wiktionary services. Wiktionary receives the lookup word and normal connection information, including your IP address. The extension does not send the surrounding sentence or full document. Lookups require an internet connection; cached definitions stay in extension memory. Furigana and all exploration tools run locally, and experiments are not saved.

The extension has no analytics or account requirement. It saves your settings, reading corrections, animation-style choice, and per-version update-announcement dismissals to local storage.

<details>
<summary><strong>Permissions and local storage explained</strong></summary>

Japanese readings are processed locally with bundled Kuromoji/IPADIC dictionaries in an extension worker. No runtime dictionary download is needed for readings. Activating a reading-panel word automatically requests definitions from `en.wiktionary.org` and `ja.wiktionary.org`, without credentials or a referrer. Definitions are cached in memory for up to 100 words per panel and are not saved to local storage. Wiktionary receives the requested word and the normal connection information, including your IP address. Exploration uses bundled code and original artwork; it makes no requests and saves no history.

- The extension needs access to HTTP/HTTPS pages to add readings automatically without a per-page click. You can narrow access using Chrome's extension site-access controls; it will only run on permitted sites.
- It requests local storage for preferences and user-entered corrections, plus an offscreen document for the tokenizer worker.
- Extracted text, reading caches, and definition caches stay in extension memory. Only settings and the corrections you enter are persisted in `chrome.storage.local`.
- It does not request access to your Google account or the Google Docs API.
- The website or Google Docs itself continues using its normal network connection.

Original text nodes, editor values, and document formatting remain unchanged. Overlays ignore mouse input and are hidden during printing. The separate reading panel allows text selection and is also hidden in print.

</details>

## Help and compatibility

<details>
<summary><strong>Missing readings, incorrect names, or installation trouble?</strong></summary>

| Symptom | What to check |
| --- | --- |
| “Manifest file is missing or unreadable” | Extract the ZIP first, then select the folder containing `manifest.json`: `dist` for source downloads, or the extracted root of a store package. |
| “Extension context invalidated” after an update or extension reload | Reload the affected webpage or Google Docs tab so it uses the current content script. |
| No furigana after installation or an update | Reload the extension and the webpage. Check the main switch, site pause, Chrome site access, and popup status. |
| Some words have no readings | The dictionary may not know the word, or there may be insufficient space. Add a local correction, reduce the reading size, or try the reading view. |
| A name is read incorrectly | Add its preferred reading under **Local reading corrections**. |
| Google Docs text is unavailable | Reload the document. If the status persists, that editor version may not expose compatible text geometry. |
| No readings in a PDF, image, browser settings page, or another canvas app | These surfaces are unsupported. Google Docs has a dedicated text adapter. |
| Cannot find **Load unpacked** | Enable Developer mode. If the control is unavailable, check whether your browser is managed. |

Webpage text inside editable controls or existing ruby is skipped. Vertical writing, rotated text, and closed shadow roots are unsupported. Overlay readings skip words fragmented across lines; the reading panel can reflow wrapped webpage text. The panel reads the top-level page, without combining embedded-frame text. Very dense or complex viewports can exceed discovery limits.

</details>

<details>
<summary><strong>How Google Docs support works</strong></summary>

The overlay processes only the active page's visible text, or the editor viewport in pageless documents. It does not analyze every page in a long document. The reading panel replaces overlays while active and does not change document formatting or line spacing.

Docs support depends on undocumented annotated SVG text geometry supplied by Google's canvas editor. Google can change or omit that surface. The reading panel and overlays use the same extraction method, so the panel cannot recover text when that geometry is unavailable.

Browser tests cover paged and pageless fixtures, editing, IME input, and page switching; they do not guarantee compatibility with every live Google Doc.

</details>

<details>
<summary><strong>Update or uninstall</strong></summary>

**Chrome Web Store installation:** Chrome updates Kō automatically when a new release is available. After an update, reload open webpages and Google Docs tabs.

**Manual installation:** Download and extract the latest repository ZIP, replace the contents of your existing extension folder, then click the extension's **Reload** icon on `chrome://extensions`. Reload open webpages and Google Docs tabs too. Keeping the same folder and reloading the existing installation helps retain preferences and corrections.

**To uninstall:** Click **Remove** on the extension's card in `chrome://extensions`. If you installed manually, you can then delete its local folder.

</details>

## Why I built this

I couldn't find a good option for adding furigana in Google Docs. I wanted readings to appear automatically, work offline, and leave the original document unchanged. That grew into this extension: a little help while browsing, with extra room to read when you need it. The reading panel works on webpages and also offers optional online word definitions from Wiktionary.

## For developers

<details>
<summary><strong>Build and test</strong></summary>

Run these commands from the repository root if you want to develop the extension:

```sh
npm ci
npm run build
npm run typecheck
npm test
```

For release downloads, run `npm run package:release`. It rebuilds `dist`, creates a manual-install ZIP containing `dist/`, creates the store ZIP with `manifest.json` at its root, and writes `SHA256SUMS`. Both ZIPs use the same runtime allowlist and exclude source maps, tests, screenshots, and development documentation. Packaging does not publish to GitHub or the Chrome Web Store.

`npm run build` regenerates the included `dist/` folder. Development dependency installation requires internet access. Furigana readings require no external service; optional word definitions contact Wiktionary and require an internet connection.

The test suite also covers per-version announcement dismissal across browser restarts, failure/retry behavior, offline changelog access, and the GitHub suggestion link. It covers automatic annotations, unchanged source/layout, a 100,000-node webpage, a 100-page Docs fixture, cancellation, IME handling, settings, corrections, vocabulary/name disambiguation, local exploration and real-dictionary form round trips, keyboard and reduced-motion behavior, the reading panel, debounced refreshes, automatic bilingual word definitions on word activation, toolbar state and lifecycle, and expanded popup forms. Browser integration tests use a temporary profile and localhost server. The native toolbar-popup regression opens a temporary visible browser window to verify Chrome’s popup sizing and wheel scrolling. They default to Brave's standard macOS executable; set `CHROMIUM_PATH` to an extension-capable Chromium executable elsewhere. Chrome distributions that disable command-line extension loading cannot run these integration tests. Your normal browser profile and Google account are not used.

The four inline 1.0 screenshots supplied by the project owner cover webpage overlays, Google Docs overlays, the reading panel, and bilingual word definitions. The Kōくん word-lookup capture was supplied by the project owner for the 1.3 development build. Linked 1.1 playground previews were captured during a live public read-only Google Docs smoke test. Earlier fixture captures remain in [`docs/screenshots/`](docs/screenshots/). Regenerated browser captures are written to `test-results/` during tests.

</details>

<details>
<summary><strong>Performance and architecture</strong></summary>

Furigana work is bounded to visible content. Reading analysis pauses in background tabs, waits for scrolling/editing to settle, and cancels stale queued work. Docs measurements are cached within each scan; collision checks inspect nearby glyphs. Reading caches and analysis batches have fixed limits. The reading panel is capped at 16,000 characters / 2,000 runs and 500 reading candidates. Typed verbs use a separate bounded local analysis channel. Activating a word automatically requests its definitions; up to 100 lookup results are cached in panel memory.

See [technical notes](docs/technical-notes.md) for the architecture, exact budgets, and compatibility details.

</details>

## License

Kō 1.2.0 and later use the [Kō No-Resale License 1.0](LICENSE) for original project code, documentation, and assets. You may use Kō freely, including at work, inspect and modify its source, and share copies for free. Selling Kō, charging for access, or including it in a paid product requires written permission from Gonzalo Cibeira. This applies to modified and rebranded copies too. Independent paid support, training, and custom development are permitted under the license's conditions.

Kō is source available under these terms. Earlier copies distributed under MIT, including the initially published RC1, retain their MIT permissions; this change does not revoke them. Check the `LICENSE` supplied with your copy.

### Third-party notices

Bundled dependency licenses are included in [`dist/licenses/`](dist/licenses/), including Kuromoji (Apache 2.0), IPADIC's notice, async, doublearray, zlibjs, lodash, and kamiya-codec (Unlicense). These dependencies retain their own licenses; the Kō No-Resale License does not replace them.

DotGothic16, the bundled Japanese pixel font for Kōくん dialogue, is by The DotGothic16 Project Authors and is distributed under its [SIL Open Font License](public/art/fonts/OFL.txt). It remains separate from Kō’s project license. Source: [Google Fonts](https://github.com/google/fonts/tree/main/ofl/dotgothic16).
