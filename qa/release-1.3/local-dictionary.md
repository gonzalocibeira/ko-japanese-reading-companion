# Local-first definitions verification — 21 October 2026

## Root causes

The English 飲む page returns a `table.ja-see` with its canonical link to のむ
inside a nested table, rather than numbered senses under a part-of-speech
heading. Japanese 飲む uses `和語の漢字表記` and an ordered spelling-reference
list. The original extractor ignored both structures, despite HTTP 200, then
cached the empty result as a missing definition. MediaWiki's `redirects=1`
handles wiki redirects, not these editorial references. Kuromoji's existing
local data provides readings and morphology rather than English meanings.

Exact API HTML for both layouts is preserved with attribution under
`tests/fixtures/dictionary/`. Both resolve to のむ in the final regression tests.

## Result

- Complete English JMdict snapshot: 218,942 entries; retrieved 21 October 2026.
- Pinned source SHA-256: `3ef56db3b7459d3a29b0983781a171c8e4aeef0b87d840b4949a042b1a14bc23`.
- 256 gzip-compressed lookup shards, approximately 37 MiB total on disk.
- English local hits send no external requests. English misses/local failures
  fall back to English Wiktionary; Japanese uses Japanese Wiktionary.
- The reading panel renders languages independently; failed-language retry
  preserves successful English. Companion defaults and tokenizer behavior stay
  compatible.
- Online extraction occurs only in the offscreen DOM. Replies contain plain
  text and source metadata. Editorial references are restricted to the same
  edition, two hops, cycle detection, and a single eight-second deadline.
- Missing entries expire after five minutes, structure/network failures are
  retryable and uncached, and shared caches/concurrency are bounded.
- JMdict data/notices retain their separate CC BY-SA licence; both ZIP layouts
  include the same dictionary and attribution files.

## Checks completed

- `npm run typecheck` and `git diff --check` passed.
- Browser/dictionary/security/reading-panel/exploration run: 69 tests passed.
- Final dictionary/importer/cancellation/playground-channel run: 15 tests
  passed, including the new concurrency/cache-limit check and both captured
  live reference layouts. The two runs overlap; counts are not additive.
- Reproducible small-source import, source checksum rejection, inherited POS,
  reading/spelling/sense restrictions, kana homographs, NFC normalization, shard
  eviction, fallback after missing assets, request validation, same-edition
  reference validation, cycles/hop limits, unsafe HTML, missing-cache expiry,
  retry, timeout during parsing, and response-size limits were covered.
- Real companion checks confirm 飲む and inflected 飲みました show local “to
  drink” meanings with no definition network requests. Reading-panel checks
  confirm local English remains visible during slow/failed Japanese requests
  and retry requests only the failed language.
- Final `npm run package:release` completed offline from pinned dictionary data.
- `python3 qa/release-1.3/verify-packages.py` passed: 467 runtime files match
  byte-for-byte in both layouts, including all 256 dictionary shards, manifest,
  source metadata, documentation, and licence files. Raw source gzip excluded.

## Source-integration checks · 22 October 2026

The final dictionary/importer/security rerun passed 12 tests. Offline About,
privacy, and changelog pages passed all 12 page/viewport combinations across
four widths with no overflow, remote requests, or page errors. Typecheck,
whitespace checks, and package-content parity passed again.

## Measured lookup times

Final Node harness timings use the production resolver, real compressed shards,
filesystem-backed fetch, and the system clock. They exclude content-script
messaging and the companion's hover delay; they are not browser UI benchmarks.

| Word | Cold (ms) | Cached (ms) |
| --- | ---: | ---: |
| 飲む | 5.14 | 0.09 |
| のむ | 5.18 | 0.09 |
| 食べる | 4.50 | 0.10 |
| 学校 | 7.07 | 0.09 |
| ありがとう | 4.30 | 0.08 |

## Packages

| Layout | Bytes | Approx. MiB |
| --- | ---: | ---: |
| Manual install (`dist/` root) | 91,894,811 | 87.64 |
| Chrome Web Store (manifest at root) | 91,890,041 | 87.63 |

Hashes are recorded in `SHA256SUMS` and `qa/release-1.3/packages.json`.
These measurements describe the earlier English-dictionary integration stage. Stable 1.3.0 package sizes and checksums are recorded in `packages.json`; see the [final release audit](../../docs/release-1.3-audit.md).
