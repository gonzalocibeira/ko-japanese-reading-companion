# Store artwork

These original Kō assets are retained with the source for store-listing maintenance. They are not included in the extension ZIPs and do not publish or change the Chrome Web Store listing.

## PS1 promotional artwork

The preferred Kōくん visual style is applied throughout the scene, logo treatment, and lettering in these promotional tiles:

- [`ps1/ko-small-promo-440x280.jpg`](ps1/ko-small-promo-440x280.jpg): small promotional tile, 440 × 280 pixels.
- [`ps1/ko-marquee-promo-1400x560.jpg`](ps1/ko-marquee-promo-1400x560.jpg): marquee promotional tile, 1400 × 560 pixels.

Both are opaque 24-bit RGB JPEGs. Each was separately composed with the built-in image generation tool, using the approved PS1 social banner and the approved character design as references. Full-resolution PNG sources are in `ps1/sources/`; generation prompts are saved as `ps1/small-prompt.txt` and `ps1/wide-prompt.txt`. These files have not been uploaded or submitted to the store.

The current JPEGs use the `-v2.png` sources. Their copy describes readings, definitions, and word forms, reflecting Kō's broader feature set. The original generation sources remain available; the follow-up text-edit prompts are `ps1/small-copy-edit-prompt.txt` and `ps1/wide-copy-edit-prompt.txt`.

## Existing artwork and screenshots

- `ko-small-promo-440x280.png` is the promotional tile. `small-promo.html` is its authoring preview and resolves artwork from the repository's `public/` folder.
- `screenshots/01-*` through `04-*` are 1280 × 800 images of the 1.0 webpage readings, Google Docs readings, reading panel, and word definitions. They show existing features, not the new 1.1 playgrounds.
- The main README now uses the approved 1.3 captures documented in [`../screenshots/README.md`](../screenshots/README.md), covering Google Docs readings, Reading view, definitions, word forms, mimetics, and Kōくん. These 1440 × 1000 documentation captures have not replaced the store listing images. Earlier 1.1 and 1.2 previews remain in `docs/screenshots/`.
- `screenshots/render.html` is an authoring canvas for fitting a selected image; it intentionally has no source image until configured.

Open authoring HTML from the source checkout. Copies under `dist/docs/` are documentation artifacts; repository-relative authoring paths are not a standalone installed-extension preview. Check that listing text, screenshots, privacy disclosures, and the submitted version agree when updating the store.
