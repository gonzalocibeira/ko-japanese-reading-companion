# Repository social preview

## PS1 redesign preview

`github-social-preview-ps1.jpg` is the latest proposed social card, with the complete scene and lettering restyled to match Kōくん. It is 1280 × 640 pixels and has not been uploaded. The full-resolution source is `github-social-preview-ps1.png`; the built-in image generation prompt is `github-social-preview-ps1-prompt.txt`. It uses the previous banner as an edit target and the project's approved character design as the identity/style reference. Await user approval before uploading.

## Previous composition

`github-social-preview.jpg` is the version-neutral banner for sharing the repository online. It uses the existing Kō identity and the project's original PS1-style Kōくん artwork from `public/art/ko-kun/static-fallback.png`. The character is placed directly into the composition without AI redrawing. No website or app screenshots are included.

The upload asset is 1280 × 640 pixels. In GitHub repository **Settings → General → Social preview → Edit → Upload an image**, select this file. GitHub stores the social preview separately from the README banner; committing an image alone does not configure link previews.

Only the decorative background was created with the built-in image generation tool. Its prompt is saved in `github-social-preview-prompt.txt`. `banner.html` combines the background, original SVG logo, live text, and original character file. To regenerate the JPG, run `node docs/social/render.cjs` with Playwright's Chromium installed, or set `CHROMIUM_PATH` to an installed Chromium-based browser.
