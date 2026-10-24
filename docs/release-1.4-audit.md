# Kō 1.4 validation audit

Local implementation prepared on 22 October 2026. Publication and store submission
are separate actions; no external release is claimed here.

## WIP merge verification on 24 October 2026

The owner authorized merging the 1.4 work and the Node.js security patch as work in progress, without publishing a release. The changelog explicitly marks 1.4 **Unreleased (WIP)**; the published stable version remains 1.3.0.

The current source built and typechecked with Node.js 26.12.1. All 273 unique tests were covered successfully across two runs: the sandbox run passed 89 checks, then the affected browser suites passed all 190 selected checks with permitted browser/localhost access (six checks repeated). This includes the native toolbar popup test. The initial sandbox failures were browser-launch/listen permission errors. Counts and environment details are recorded in `qa/release-1.4/wip-security-validation.json`.

The archive and checksum records below refer to the local candidate packages prepared on 22 October. Those archives were not rebuilt or published during this WIP merge; parity with the updated development documentation is not claimed.

After regenerating the WIP notes, the native popup and both update-announcement tests passed again (3/3).

## Content and behavior

- Dictionary searches all 218,942 pinned JMdict entries through 325,142 valid
  spelling/reading combinations, with Japanese prefix and English inverted indexes.
  Results deduplicate entry IDs and retain reading/sense restrictions.
- Grammar reconciles all 848 reference entries into 847 canonical points, including
  the のです / んです alias. Each canonical point has three examples: 2,541 total.
- Eighteen authored comparison families include 41 complete sentence variants and
  18 explanatory activities. The ten-family expansion adds aspect, purpose, decisions,
  expectations/obligations, recency, concession, inference, qualified negatives,
  unexpected inclusion, and opportunity/interval comparisons. Complete variants
  preserve appropriate surrounding grammar. Each new family received author review
  and two independent agent editorial reviews; evidence is in
  `data/grammar/comparisons-expansion-*-review.md`.
- The expansion broadens purpose/cause ために and endpoint/inclusion まで in their
  linked lessons, and corrects interval 間/間に readings to あいだ/あいだに. The
  847-point / 2,541-lesson-example totals remain unchanged. Comparison variants are
  additional examples. All family links, rather than a single first match, remain
  reachable from a point; related points are deduplicated.
- All five level modules received author review and independent agent editorial
  review. Evidence is in `data/grammar/*review.md`; no native-speaker certification
  is claimed. Structural validation does not substitute for linguistic review.
- Grammar is entirely local. Dictionary Playground invokes Wiktionary only through
  an explicit language-specific button. Reading view and Kōくん retain their existing
  local-first fallback behavior.
- Four tools share both entry points and session state. Linked exploration restores
  the previous view. No study progress or query history is persisted.

## Validation

Typecheck and deterministic build pass. Focused browser/data checks cover restrictions,
ranking, homographs, pagination, IME, stale responses, verified inflection suggestions,
explicit network opt-in, linked return state, and small-container navigation.

Final verification on 22 October 2026:

- `npm run typecheck`: passed.
- `npm run package:release`: passed; packaging finished before the full suite.
- Complete Playwright suite: **261/262 passed in 2.9 minutes**. See the [full log](../qa/release-1.4/full-tests.log).
- All grammar/data/playground checks passed in the final full run, including all ten new comparison families, keyboard switching, 280px layouts, real 320px Reading-view transport, Dictionary return state, retry/stale responses, and the restored Time/Comparison grouping for まで.
- The sole failing test was `tests/native-popup.spec.ts`: macOS left the temporary Brave window unfocused before the native popup could open. An isolated retry and the final full run hit the same focus failure. No assertion was removed or weakened. See the [isolated retry log](../qa/release-1.4/native-popup-focus-failure.log). Native popup sizing is therefore unverified in this run.
- `python3 qa/release-1.4/verify-packages.py`: passed. Both ZIPs contain the same **1,599 byte-identical runtime files** in the correct layouts. SHA-256 values and sizes are recorded in `qa/release-1.4/packages.json` and root `SHA256SUMS`.
- `git diff --check`: passed.
- Visual inspection covered the standalone comparison, a 280px standalone layout, and the real Reading-view integration at 320px inside a desktop viewport. The wide layout keeps the catalog visible while details scroll independently; narrow layouts use two tab rows and list/detail navigation.

The first sandbox browser launch was blocked by the environment; browser checks were rerun with permitted access to temporary Brave profiles. Initial runs exposed worker resource resolution, search ranking/restrictions, cancellation, focus, and layout regressions, which were corrected and are covered in the current suite. Four legacy layout tests were updated to inspect the active cached tool and its visible scroller.

All five level modules received an independent agent editorial review in addition to author review. This does not certify native-speaker accuracy. No manual live Google Docs editing, native-speaker user study, GitHub publication, or store submission was performed.

## Packaging and provenance

`npm run package:release` rebuilds once and packages the same allowlist in manual
`dist/` and store-root layouts. `qa/release-1.4/verify-packages.py` checks exact runtime
parity, checksums, complete grammar assets, both dictionary notices, nested-manifest
exclusion, 90 mimetic strips, and 56 Kōくん clips. Source maps, tests, QA files, and
dictionary source archives are excluded. Grammar and dictionary assets use index
metadata names, avoiding nested extension manifests.

JLPT Sensei’s public topic indexes are a dated coverage reference. Explanations,
translations, examples, and comparisons are original Kō material. JMdict-derived
search data remains CC BY-SA 4.0, separately from Kō’s original licence. Ordinary
builds use local pinned sources and perform no grammar or dictionary downloads.


## Preview captures

- [Expanded three-choice comparison](../qa/release-1.4/comparison-expansion.png)
- [Expanded comparison at 280px](../qa/release-1.4/comparison-expansion-narrow.png)
- [Expanded comparison in Reading view](../qa/release-1.4/comparison-expansion-reading-panel.png)
- [Standalone Sentence Lens](../qa/release-1.4/sentence-lens.png)
- [Narrow Grammar detail](../qa/release-1.4/grammar-narrow.png)
- [Grammar catalog](../qa/release-1.4/grammar-catalog.png)
- [Reading-view integration](../qa/release-1.4/grammar-reading-panel.png)
