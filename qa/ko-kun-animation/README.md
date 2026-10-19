# Kōくん v1.3 animation library

The current library uses the approved **PS1 low-poly design**: 24 routines,
56 clips and 672 exported frames. Open [ps1-review.html](ps1-review.html) for
the complete interactive gallery. [PS1 production notes](ps1/README.md) link
the source sheets, exact prompts, visual reviews and reproducible export tools.
The new artwork is integrated into the browser companion.

## Historical original production

The following notes describe the earlier asset-only production, preserved for
provenance. Its design and feature scope are superseded by the PS1 library and
the implemented browser companion.

Completed animation assets: **24 routines, 56 composable clips, 672 exported frames**. Proposal **A, no collar** is the approved character design. This work adds artwork and a local review gallery; it does not implement the browser-pet feature or random behavior.

The library is ready for future integration. See `HANDOFF.md` for the entry points and playback contract, and `production/asset-sha256.json` for the delivered runtime-file checksums.

Open `animation-review.html` or reload the existing `pilot-review.html` page. Both now show the complete library, with frame stepping, slow playback, mirrored views, size controls, and checkerboard/light/dark/green backgrounds. The gallery includes three connected sequences. It works offline with local files.

## Anatomy correction

Kō has **four limbs total: two forelimbs and two hindlimbs**, and exactly three tails. When handling props, the forelimbs become the arms. An extra pair of arms above four grounded legs is prohibited.

The straw-hat entry and loop were regenerated using a clean upright reference; the exit reverses the corrected entry. The clean seated reference follows the same rule. Every pose in all 35 new source sheets and the seven reused pilot clips was inspected directly. Rejected drafts are retained as provenance, but are excluded from the delivered strips. Samurai, fan dance, thinking, and tail play received additional corrective generations for clipping, tail count, or anatomy.

Browser inspection was attempted but the browser tool denied the local `file://` page. No browser inspection is claimed. The visual audit used the extracted frame boards directly; technical checks cover decoded exports and the gallery's local links and JavaScript. `production/browser-audit.json` records this limitation.

The user's instruction to “Fix and implement all the animation” superseded the earlier pilot approval gate. Character approval remains recorded separately; the catalogue does not claim the user approved the pilot or final animation quality.

## Delivered files

- `../../public/art/ko-kun/`: 56 lossless WebP sprite strips, `static-fallback.png`, and the asset manifest.
- `production/frames/`: all 672 transparent 256 × 256 PNG frames.
- `production/previews/`: 24 transparent animated routine previews and three connected sequences.
- `production/contact-sheet.png`: overview of all 24 routines.
- `production/verification.json` and `production/final-validation.json`: packaging and independent export checks.
- `production/generations/`: current source, exact prompt, extraction layout, and anatomy review for every generated clip.
- `production/audit/`: all twelve source poses per board, with opaque review backgrounds only. The actual frames and animation exports retain alpha transparency.

Original proposals, references, source sheets, rejected versions, and prompts remain under `design/`, `references/`, `sheets/`, `prompts/`, and `production/`. Earlier pilot preview paths now contain corrected delivered artwork. Historical pilot-generation scripts and reports are retained for provenance; use the production manifest and gallery for the current library.

## Routines and reuse

The library covers attentive idle, walk, trot, hover, floating travel, seated watch, thinking, reading, writing, insight, grooming, stretching, tail play, greeting, sleep, meditation, samurai practice, ninja sneaking, spirit magic, straw-hat adventurer, fishing, bamboo flute, tea break, and fan dance. Paper-plane and broom-riding routines are excluded.

Travel has start/loop/stop clips, and prop activities have entry/loop/exit clips. Six shared transitions connect standing, seated, curled, and hovering poses. Samurai uses a real steel katana. The straw-hat routine keeps the red-banded hat, red vest, and elastic paw reference. There is no permanent collar, pendant, or halo.

Thirty-five clips use new generated sheets, seven reuse inspected pilot artwork, and fourteen reuse motion in reverse: activity exits, travel stops, waking, and landing. Tail play is seated to preserve four-limb anatomy. Thinking holds six suitable generated poses across twelve frames; unrelated gestures from that source sheet are omitted. The manifest retains frame-level provenance. No artwork or in-between motion is synthesized by the packaging scripts.

## Asset contract

- Each clip has twelve 256 × 256 RGBA frames in one 3072 × 256 lossless WebP strip.
- The manifest supplies frame rectangles, durations, loop ranges, connection states, prop lists, facing, mirror support, and nominal placement anchors.
- Non-loop clips share exact generated endpoint poses with their declared states. Entry/loop/exit clips can be combined through those states; the manifest does not implement scheduling.
- Travel is in place, facing right. Intended translation speeds are advisory at 256 px: walk 40 px/s, trot 70 px/s, floating travel 30 px/s. Mirror the artwork and anchor x coordinates for leftward travel.
- Anchors are shared placement references, not measured per-paw contacts. Runtime placement and random behavior remain future feature work.
- Exports contain only Kō and bounded props/effects, with transparent corners and padding. There is no painted floor or background.

## Rebuild and verification

Use Python with Pillow and NumPy, plus Node.js for the gallery syntax check. Source artwork is generated with the built-in image generation tool; extraction and packaging do not call an external image-generation service.

```sh
python stage-production.py
python package-production.py
python write-animation-gallery.py
python verify-production.py
python verify.py
```

Packaging requires all source anatomy reviews to pass. `stage-production.py` checks source extraction and clipping; it never approves anatomy automatically. Rebuilding packaging preserves exact shared endpoints and reverse-motion provenance. `prepare-production.py` is an initial planning scaffold, not a rebuild step for the final reviewed specification.

Automated alpha and decoding checks cannot certify anatomy, aesthetics, or motion quality. The per-source visual reviews and the frame-inspectable gallery provide that separate review evidence.
