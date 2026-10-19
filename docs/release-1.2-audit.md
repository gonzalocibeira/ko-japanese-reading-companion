# Kō 1.2.0 release audit

Announced launch date: **28 October 2026**. Prepared on **18 October 2026** from RC1 and published on GitHub that day under **v1.2.0**. The 1.2 release assets retain manifest and npm versions **1.2.0**. The primary branch now contains **1.3 WIP**; this audit and its hashes describe the historical 1.2 artifacts. Chrome Web Store upload and review are tracked separately below.

## Scope

The release retains RC1 functionality and all 90 mimetic animation strips. The newer `public/art/ko-kun/` character library is excluded by the build and rejected by package verification. The local Kō-kun artwork and QA workspace are preserved for future work and are not committed with this release.

The 1.2 release's README, notes, bundled About, offline history, technical notes, and store guidance identify 1.2.0 and 28 October 2026. Download links target the published full-release tag. Its privacy policy retains its effective date, 18 October 2026. Original project material retains the Kō No-Resale License 1.0; third-party terms and previously distributed MIT copies remain unchanged.

## Final preparation verification

- Release build and `npm run typecheck`: pass.
- Release-announcement tests: **2 passed**; run outside the sandbox after the sandbox blocked browser launch.
- Offline About, privacy, and history: **12 checks passed** at 1280, 700, 390, and 320 px, with no overflow, remote requests, or page errors. Evidence: `qa/release-1.2/stable-docs.json`.
- Both archives: **143 matching runtime files**, including **90 mimetic strips** and **zero Kō-kun files**. Source maps and development material are absent.
- Executable JavaScript is byte-identical to RC1. The historical 186-test suite is retained as RC1 evidence; it was not rerun for this documentation and packaging promotion.
- `git diff --check`: pass.

Final archive sizes and SHA-256 digests:


- `ko-japanese-reading-companion-1.2.0.zip`: 31,616,623 bytes; `6c107f7d8662f1cab8a2c9407ea78b46b67272919e0127b09f1502af70c1a6df`.

- `ko-japanese-reading-companion-1.2.0-chrome-web-store.zip`: 31,615,143 bytes; `4319aaa433f647f3a47b4ba8a4a5552d8e2974024fdf31f3b252cedde9b42ed1`.

## Publication status

- GitHub: published as the stable **v1.2.0** release on **18 October 2026**, verified again on 19 October. This source-only 1.3 WIP update does not change that tag or its assets.
- Chrome Web Store: **1.2.0 uploaded and submitted for review on 18 October 2026**, revision `00003`. The dashboard confirms **Pending review**, with published version **1.1.0**. Automatic publication after review was explicitly unchecked. The listing was updated for adjective forms, 90 mimetics, and current license terms. No launch date has been scheduled in the console; its pending-review state exposes no date picker.
- Both ZIPs must match the same built runtime byte-for-byte; the store layout has `manifest.json` at its root, and the manual layout has a `dist/` prefix. No Kō-kun files, source maps, development docs, tests, or QA files may appear.

The user cancelled the Codex launch follow-up. No follow-up automation remains. The announced launch date is **28 October 2026**; store launch still requires publication after approval. The store status above is the 18 October submission snapshot, not a fresh dashboard check. Store submission evidence is retained locally in `qa/release-1.2/store-submission-1.2.0.png` (excluded from Git because the dashboard includes account details).

## Historical RC1 evidence

### RC1 release audit

Release candidate: **v1.2.0-rc.1**, 18 October 2026. The extension manifest and npm package versions are **1.2.0**. The repository’s default branch is **master**. GitHub prerelease publication and Chrome Web Store submission are separate; this RC does not submit or update the store.

## License revision · 18 October 2026

The republished RC1 uses the Kō No-Resale License 1.0 for original project code, documentation, and assets. Free use (including at work), modification, and free sharing are permitted. Paid distribution, paid access, and inclusion in paid products require Gonzalo Cibeira's written permission, including for modified or rebranded copies. Third-party terms are unchanged. Earlier MIT-distributed copies, including the initial RC1 publication, retain their permissions.

This documentation/license revision passed build, typecheck, both existing release-announcement browser tests, and package parity/checksum verification. Executable JavaScript is unchanged from the preceding RC1 build; the 186-test and three-regression results below describe the prior runtime verification rather than a full-suite rerun for this license revision. The updated About, privacy, and release-history pages also passed all 12 offline viewport checks.

## Included changes

- Shared Word forms input for dictionary-form verbs and い／な adjectives, inline adjective exploration, exact-original Reset, applicable controls, furigana, and How this form is built explanations.
- Bounded dictionary-backed command recovery for 受け取れ and 知れ at supported text, line, and sentence-ending boundaries. Ambiguous forms and unsupported continuations retain their original analysis.
- 90 mimetic expressions in 45 comparisons, including 30 new expressions. All 90 have original examples, translations, usage notes, references, and bundled twelve-frame ukiyo-e-inspired pixel animations. Scenes loop automatically with a held final pose. Reduced motion displays a representative still; About’s Show legacy animations preference restores looping line animations and updates open cards.
- Standalone Playgrounds tab from the popup, also available with automatic readings paused or on protected pages, using the same offline workspace as the reading panel.
- Compact outlined Correct reading action beside the pronunciation, using the available horizontal space in word details.
- Compact per-version update announcement, persistent local dismissal, retry after save failure, visible About changelog with offline history, and a dedicated GitHub feature-suggestion link.

No dependencies, permissions, host access, CSP origins, accounts, runtime services, or learning history are added. Only the bundled `art/mimetics/*.webp` strips are added as web-accessible resources for HTTP/HTTPS reading panels; settings, scripts, dictionaries, and user data are not exposed by that rule. The new persisted values are the legacy-animation preference and one dismissal boolean per version. Existing settings and correction backups remain compatible. Dictionary-reading, adjective-alternative, and command-alternative metadata use bounded in-memory caches. The privacy policy, effective 18 October 2026, describes the saved preferences, banner dismissals, and public GitHub suggestions.

## Verification

- `npm run build` and `npm run typecheck`: pass.
- `npx playwright test`: **186 passed**, no skips (1.5 minutes), including native-toolbar-popup verification.
- `npx playwright test --config qa/release-1.1/playwright.config.ts`: **3 passed**, no skips (5.0 seconds).
- Full logs: `qa/release-1.2/rc1-full-suite.log` and `qa/release-1.2/rc1-prior-regressions.log`.
- Offline About, privacy, and full-history pages pass all **12 checks** at 1280, 700, 390, and 320 px, with no overflow, remote requests, or page errors. Evidence: `qa/release-1.2/rc1-docs.json`. About and the current mimetic preview were visually inspected.
- All 44 local Markdown/HTML references in README and top-level docs resolve; `git diff --check` passes.
- Original full-suite executable hashes are retained in `qa/release-1.2/rc1-tested-runtime.json`. The subsequent word-details layout update passed build, typecheck, and the existing offline correction/restoration test; its packaged executable hashes are retained in `qa/release-1.2/rc1-layout-runtime.json`.

Coverage includes real-dictionary adjective classes and generated-form round trips, lexical good-compound stems, inflected source spans, correction overlaps, imperative recovery, offline operation, cancellation, source/layout preservation, definitions, concurrent settings, keyboard/focus handling, 280–720 px panels, short viewports, all 90 local animation strips, both animation styles, reduced motion, and the native toolbar popup. Release-announcement checks cover earlier-version dismissal isolation, persistence across browser restart, synchronized menus, failure/retry behavior, and offline changelog navigation. Controlled webpage and Google Docs fixtures exercise compatibility; live Google Docs editing was not exercised for this RC.

## Documentation and screenshots

README, About, privacy, release notes, technical notes, exploration notes, and store-preparation guidance describe the complete 1.2 RC. The About notes, offline history, popup summary, and GitHub release body derive from `docs/release-notes.md`. Historical 1.1 notes and verification stay labeled as historical. Current installation links point to RC1; stable Chrome Web Store availability may differ.

The [Word forms input](screenshots/word-forms-input-1.2.png), [Adjective Playground](screenshots/adjective-420-1.2.png), and [mimetic comparison](screenshots/mimetics-eating-1.2.png) use controlled webpage fixtures. The [native update banner](screenshots/native-popup-update.png) and [About changelog](screenshots/about-1.2-rc1.png) show RC1. The original README’s four real-use screenshots show 1.0 and remain labeled. The generated-art review gallery, original prompts, layout metadata, contact boards, and validation history are retained under `qa/mimetics-generation/`; original large PNG sheets remain local and ignored. The legacy SVG contact sheets remain in docs/screenshots.

## Packages

Both ZIPs use the same runtime allowlist: the manual ZIP keeps `dist/`, and the store ZIP places `manifest.json` at its root. Both include the complete offline changelog, About, privacy policy, dictionaries, 90 local animation strips, and third-party notices. Source maps, screenshots, development documentation, test fixtures, generation source sheets, and store artwork are excluded.

Both ZIPs contain the same **143 runtime files**, including **90 animation strips**, and match the final built distribution byte-for-byte. Run `python3 qa/release-1.2/verify-packages.py` from the repository root to recheck contents, exclusions, parity, and checksums.

- `ko-japanese-reading-companion-1.2.0.zip`: 31,616,514 bytes; SHA-256 `551d0a5f3f4b9e8433781a30935c5243e3880cefbe8e30420694b583f3732eb1`.
- `ko-japanese-reading-companion-1.2.0-chrome-web-store.zip`: 31,615,034 bytes; SHA-256 `0cfc4e9f066723cbc8bf8f5aadd12bcb45b7b5621d961e3d1909221ac93e6fa3`.

The same hashes are saved in `SHA256SUMS` and `qa/release-1.2/packages.json`. RC1 is published as a GitHub prerelease; Chrome Web Store submission remains separate.

## Prior evidence

The initial 174-test adjective baseline, separate contextual-command runs, and art-generation/looping checks are historical and remain in `qa/release-1.2/` and `qa/mimetics-generation/README.md`. RC1 verification below supersedes those counts for this candidate. The [1.1 audit](chrome-web-store-audit.md) retains earlier live read-only Docs and original regression evidence.
