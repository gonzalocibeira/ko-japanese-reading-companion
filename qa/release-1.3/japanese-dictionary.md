# Offline Japanese dictionary verification — 22 October 2026

## Implemented behavior

Both English and Japanese meanings use bundled local dictionaries first. Japanese
uses Japanese Wiktionary data extracted by Kaikki/Wiktextract. A local hit sends
no lookup term to an external service; only local misses or local asset failures
use the corresponding online Wiktionary edition. No runtime request goes to
Kaikki. Companion preferences, request shape, tokenizer, and lemma recovery are
unchanged. Reading-panel languages render independently; retries reload only the
failed language. Source links identify offline Japanese results and their
canonical source entry.

## Source and coverage

- Official raw Japanese-edition extract: https://kaikki.org/dictionary/downloads/ja/ja-extract.jsonl.gz.
- Retrieved 22 October 2026; HTTP Last-Modified: Sat, 03 Oct 2026 08:24:52 GMT.
  The raw endpoint is separate from the newer postprocessed website data.
- Original raw gzip SHA-256: `92b85a0c09e2013e9bad4258de9e0226d23e0a20011cb66c3ba7fed33d39ee90`.
- Pinned Japanese-only JSONL SHA-256: `5ca3f3c93ec9c089f407723d2f6ae0c4db0bbbd3eedc3005861ad480437658dd`.
- 150,505 source records with `lang_code=ja`; other languages
  and Classical Japanese are excluded.
- 124,195 usable headwords, including 11,252
  resolved spelling references and 120,219 canonical entries.
- 1,535 candidate words have unresolved references and
  remain online fallbacks. No-gloss and unexpanded template senses are omitted.
- 256 gzip shards and one manifest: 9,882,817 bytes (9.42 MiB).
- Source part of speech, readings, sense context/labels, and canonical titles
  are retained. Examples, translations, audio and other unused fields are not
  bundled in runtime data. Japanese Wiktionary contributor/Kaikki attribution,
  CC BY-SA 4.0 licence, snapshot metadata and refresh instructions are bundled.

Unique explicit spelling references resolve at build time (for example 飲む →
のむ and 食べる → たべる). The importer requires agreement between structured
reference metadata and the gloss, accepts quoted reference targets and preceding
explanations, detects cycles, and limits chains to eight hops. Ambiguous,
contradictory or missing targets are not guessed. Reading aliases are not inferred
because they can conflate unrelated kanji homophones. Extraction coverage and
quality remain incomplete; this is not a commercial Japanese dictionary.

The existing shared shard cache retains at most 16 shards across both providers
with an 8 MiB source-text cache weight limit (parsed object overhead is additional).
The 256-result cache, five-minute negative TTL, eight-job concurrency limit,
online response/deadline protections, and lack of persisted query history remain.

## Validation

- Final focused run: **74 passed** across English/Japanese importer and resolver,
  reading-panel, companion, exploration, geometry and security regressions.
- Real companion shows Japanese meanings for 飲む and inflected 食べました with
  zero external definition requests. Production resolver tests cover 飲む, のむ,
  食べる, 学校, ありがとう, 図書館 and 近代化 offline.
- Real reading panel shows both local languages, preserves local English during
  a slow Japanese miss, retries only the failed Japanese lookup, and ignores
  stale responses. 学生生活 and 学校生活 exercise genuine Japanese coverage gaps.
- Importer tests cover deterministic compressed output, pinned-checksum rejection,
  hierarchical gloss context, unique/quoted/multi-hop references, mismatched
  references, ambiguity, cycles, missing targets, no-gloss/template entries,
  language filtering, NFC and homophone separation.
- Typecheck and whitespace checks passed. Final offline About/privacy/changelog
  checks passed all 12 page/viewport combinations at four widths with no overflow,
  remote requests or page errors.
- Final offline package build and package parity/checksum validation passed:
  728 identical runtime files in each layout, including both
  definition dictionaries and their notices. Pinned source archives are excluded
  from runtime packages. No release or store publication was performed.

## Lookup timings

Node resolver harness with real compressed shards and filesystem-backed fetch;
excludes browser messaging, rendering, and hover delay. External requests: **0**.
Cached values rounded to 0.00 ms are below the reported precision.

| Lookup | Cold ms | Cached ms | Source title |
| --- | ---: | ---: | --- |
| 飲む | 4.61 | 0.01 | のむ |
| のむ | 1.33 | 0.00 | のむ |
| 食べる | 1.38 | 0.00 | たべる |
| 学校 | 0.98 | 0.00 | 学校 |
| ありがとう | 1.43 | 0.00 | ありがとう |
| 近代化 | 1.20 | 0.01 | 近代化 |

## Packages

| ZIP | Bytes | MiB |
| --- | ---: | ---: |
| ko-japanese-reading-companion-1.3.0.zip | 102,623,651 | 97.87 |
| ko-japanese-reading-companion-1.3.0-chrome-web-store.zip | 102,616,251 | 97.86 |

Current hashes are in `SHA256SUMS` and `qa/release-1.3/packages.json`.
Rebuild with `npm run package:release`; verify with
`python3 qa/release-1.3/verify-packages.py`. Refresh source data using
`data/jawiktionary/README.md` before releases.
