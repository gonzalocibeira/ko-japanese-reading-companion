# Kōくん animation asset handoff

Status: ready for future v1.3 integration. The completed delivery contains 24 routines, 56 clips, and 672 transparent frames. The browser-pet feature is not implemented.

## Start here

- Runtime asset folder: `public/art/ko-kun/` from the repository root.
- Runtime manifest: `public/art/ko-kun/manifest.json`.
- Review gallery: `qa/ko-kun-animation/animation-review.html`.
- Validation: `qa/ko-kun-animation/production/final-validation.json`.
- Asset integrity: `qa/ko-kun-animation/production/asset-sha256.json`.
- Source artwork, prompts, audit boards, and rebuild instructions: this directory and `README.md`.

Use the production manifest and delivered strips for integration. Earlier proposal and pilot files are retained for provenance; some original rejected sheets intentionally remain in the archive.

## Playback contract

Each WebP is a static horizontal sprite strip containing twelve 256 × 256 frames. Use the manifest's frame rectangles and per-frame durations to play it. The animated WebP previews in the QA directory are demonstrations, not the runtime strips. Resolve `file` and `staticFallback` relative to the runtime manifest's directory.

Choose a routine through its ordered `clips` list. Match each clip's `from` state to the current state, and use its `to` state after completion. Activity entries establish the prop/costume state, loops sustain it, and exits remove it. Finish an activity's exit before switching to an unrelated routine. Shared transition clips have `routine: "transition"` and connect standing, seated, curled, and hovering states.

For example, standing → sit-down → read-entry → read-loop → read-exit → stand-up returns to standing. Standing → take-off → hover-idle-loop → floating-travel-start → floating-travel-loop → floating-travel-stop → land also returns to standing. Repeat loops as needed; these are asset sequences, not a prescribed behavior scheduler.

All travel is in place and faces right. Move the eventual pet container separately. The manifest provides advisory travel speeds at 256 px, mirroring rules, and nominal placement anchors. Scale speeds and anchors with the displayed size. Ground anchors are placement references; per-paw contact timing is not supplied.

Use `static-fallback.png` for a still presentation, loading fallback, or reduced-motion mode. Preserve transparent alpha. The permanent design is proposal A, no collar: exactly four limbs total and three tails.

## Future feature work

The consuming feature will own page positioning, movement bounds, random routine selection, interruptions, preloading, and reduced-motion behavior. These assets do not install or activate a pet. Review the connected previews and transition states when that feature is implemented.

The final checks passed lossless strip/frame comparisons, alpha transparency, phase connections, reversed-motion provenance, and gallery syntax/local links. Anatomy was checked directly on frame boards. Browser playback inspection was blocked by the local-file browser policy; that limitation is recorded in `production/browser-audit.json`.

After deliberately rebuilding or changing assets, rerun the verification commands in `README.md` and regenerate the asset checksum inventory.
