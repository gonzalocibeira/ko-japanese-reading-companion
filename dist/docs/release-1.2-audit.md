# Kō 1.2.0 RC1 release audit

Release candidate: **v1.2.0-rc.1**, 18 October 2026. The extension manifest and npm package versions are **1.2.0**. The repository’s default branch is **master**. GitHub prerelease publication and Chrome Web Store submission are separate; this RC does not submit or update the store.

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

- `ko-japanese-reading-companion-1.2.0.zip`: 31,614,883 bytes; SHA-256 `7f98ecb9b1b14339f7d7b248b3b0604b92cab8b0bba5fbc296a563b189916bee`.
- `ko-japanese-reading-companion-1.2.0-chrome-web-store.zip`: 31,613,403 bytes; SHA-256 `090193a449769ae39cf690ed6d1e0025933c6349cea7633575d8189949299ad6`.

The same hashes are saved in `SHA256SUMS` and `qa/release-1.2/packages.json`. RC1 is published as a GitHub prerelease; Chrome Web Store submission remains separate.

## Prior evidence

The initial 174-test adjective baseline, separate contextual-command runs, and art-generation/looping checks are historical and remain in `qa/release-1.2/` and `qa/mimetics-generation/README.md`. RC1 verification below supersedes those counts for this candidate. The [1.1 audit](chrome-web-store-audit.md) retains earlier live read-only Docs and original regression evidence.
