# Mimetics: ukiyo-e / low-poly animation set

90 expression-specific animations were generated with the built-in `image_gen` tool, using the approved gentle-rain sample in `../mimetics-style-sample/` as the style reference. Each prompt emphasizes the selected expression’s action or sensation. Language examples and usage notes retain their existing authored meanings.

- Final assets: `../../public/art/mimetics/` (also copied to `../../dist/art/mimetics/`).
- Exact prompt set and motion choreography: `prompts.json`.
- Complete local comparison gallery: `preview.html`.
- Short animated comparison reel: `animated-comparisons.gif`.
- Visual review boards covering all 90 expressions: `contact-1.jpg` through `contact-5.jpg`.
- Source-grid metadata: `source-layouts.json`; playback metadata: `manifest.json`.
- `prepare-prompts.cjs` prepares prompts; `assemble.py` only slices and encodes generated frames. `make-preview.py` composes existing frames into the review reel. No API fallback was used.

Original generated PNG sheets are retained locally in the ignored `sheets/` directory; only compact WebP strips are bundled with the extension. Each strip has twelve 384×192 frames. Some source sheets transpose the requested grid; assembly detects the layout and preserves aspect ratios.

Playback starts automatically and loops continuously, with 2.4-second cycles including a held final pose. There is no replay button. Static/reduced-motion views show a representative pose. New artwork is the default. About → **Show legacy animations** stores a local boolean and updates open cards without resetting their chosen words or focus.

Validation: build and typecheck passed. The regression run passed 182 tests, including offline decoding of all 90 packaged assets, restrictive image CSP, 280–720 px layouts, keyboard operation, reduced motion, and persistent/live switching. Four focused checks passed again after the final-frame timing adjustment. The unchanged native-toolbar-popup test could not complete because this desktop would not activate its test browser window.

Looping update: all 86 targeted mimetics, playground-browser, and reading-panel checks passed. All 90 expressions in both the generated and legacy styles start infinite playback immediately; reduced-motion mode disables playback, and no replay controls are rendered. Build and typecheck passed.

Current release-candidate verification supersedes the historical test counts and window-activation limitation above; see the [1.2 RC audit](../../docs/release-1.2-audit.md).
