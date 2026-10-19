# Kōkun PS1 animation production

The user approved `references/approved-design.png` and requested the complete
animation library in that style, with four limbs, smooth transitions, good loops
and high quality animation.

## Deliverable contract

- All 24 existing routines, 56 clips, 12 RGBA frames per clip at 256 × 256.
- Cream angular PS1 fox, vermilion markings, charcoal paws, three separate tails.
- Four actual limbs throughout. In prop actions the forelegs become the arms;
  there must never be two working arms above four grounded legs.
- Orthographic right-facing view; same proportions, camera and lighting.
- Real transparency, no floor, baked shadow, text, bubble or permanent costume.
- Clear anticipation, action and recovery. Activity loops run at most twice in
  the existing runtime. A word reading takes immediate animation priority.
- Runtime idle plays the authored blink/breathing loops while standing or seated;
  sleep retains a held frame. Word lookups immediately start the open-scroll
  loop, taking priority over the current routine, then play its normal exit.
  An airborne reader settles while animating. No added art poses.
- Shared connection poses for standing, seated, curled, hovering and every
  activity/travel state. Reversed exits/stops retain the same source poses.

## Production and review

`spec.json` contains the individual prompts and actions; `prompts/` retains the
exact accepted prompt for each generated sheet. Sources are made with
the built-in image generation tool, not an API/CLI fallback. Each generation
record retains its exact prompt and source path. `sheets/` preserves generated
pixels; extraction applies only cropping, uniform nearest-neighbor scaling and
placement. The original artwork remains under `../production/` for history.

All **40 source sheets / 480 authored poses** have received direct visual
anatomy and pose-order review. Five thinking-source poses that added a fourth
tail are explicitly excluded. That gesture uses seven verified head-tilt poses
and a deliberate thoughtful hold; the packager refuses any excluded pose.
Thus 475 source poses are eligible for export. Sixteen clips reverse accepted entries or shared
transitions. Rejected variants remain under `rejected/`; current accepted
sources are under `sheets/`. Pixel checks do not establish limb or tail counts.

Export registration eases scale and placement corrections into shared endpoint
poses. It does not draw or interpolate intermediate artwork. Hovering poses are
stabilized because the runtime supplies continuous flight and bobbing. The
adventurer's source poses are reordered to place anticipation before the punch
and recovery before the hat-tip seam; provenance records the exact order.

`source-frames/` contains the extracted source cuts. `frames/` contains final
registered timeline frames. The packager always reads source cuts, so repeating
an export cannot apply pose ordering or registration twice.

`runtime/` contains the same 58 files installed under `public/art/ko-kun/`.
`previews/` contains 24 animated routines and three connected sequences. Open
[the offline gallery](../ps1-review.html) to play, slow, step, mirror and resize
all clips on different backgrounds.

## Rebuild and checks

Run from the repository root, with Python, Pillow and NumPy available:

```sh
python qa/ko-kun-animation/stage-ps1.py --force
python qa/ko-kun-animation/package-ps1.py --install
python qa/ko-kun-animation/package-ps1.py --verify-rebuild
python qa/ko-kun-animation/write-ps1-gallery.py
python qa/ko-kun-animation/verify-ps1.py
node qa/ko-kun-animation/check-ps1-gallery.cjs
npm run build
npx playwright test tests/mascot-motion.spec.ts tests/mascot-playback.spec.ts tests/mascot.spec.ts tests/mascot-dictionary.spec.ts
npm run package:release
python qa/release-1.3/verify-packages.py
```

`package-ps1.py` refuses to install pending or technically invalid sources.
`--draft` creates QA-only exports and cannot be combined with `--install`.
`asset-sha256.json` binds the release packages to this accepted library.

`final-validation.json` records 672 lossless frame comparisons, 76 exact
endpoint checks, 26 exact phase-join checks, 16 reverse-clip comparisons, and
27 transparent animated previews. Loop measurements compare premultiplied
pixels, so invisible RGB data cannot create false seam failures. Browser
runtime tests additionally compare all 672 frames in both directions and
exercise all routines at the three supported mascot sizes. Smoothness and
anatomy also require visual judgment; these pixel checks are supporting evidence.
