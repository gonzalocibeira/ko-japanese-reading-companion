# Offline Japanese definitions

Kō's Japanese definitions are derived from **Japanese Wiktionary contributors**,
extracted by **Wiktextract / Kaikki.org**. Source pages and their contributor
histories are available at `https://ja.wiktionary.org/wiki/<word>` and each
result links to its source entry. Data is distributed under **CC BY-SA 4.0**,
separately from Kō's original code/assets. The licence is included here.

- Project and attribution: <https://kaikki.org/jawiktionary/>
- Raw extracts and format: <https://kaikki.org/dictionary/rawdata.html>
- Wiktionary licensing: <https://ja.wiktionary.org/wiki/Wiktionary:著作権>
- Extraction code: <https://github.com/tatuylonen/wiktextract>

`source.jsonl.gz` preserves the original JSONL rows whose `lang_code` is `ja`.
Other languages, including Classical Japanese, are excluded. `snapshot.json`
records the full extract's URL/checksum/Last-Modified value and the filtered
snapshot's checksum. The raw endpoint's date can differ from the newer
postprocessed Kaikki website; the pinned raw bytes are authoritative.

Kō's changes are a language filter, NFC normalization, removal of examples,
translations/audio and other unused runtime fields, plain-text sense indexing,
and resolution of unique explicit spelling references such as 飲む → のむ.
Source part of speech, sense tags and readings are retained. General reading
aliases are not added because they can conflate unrelated kanji homophones.
Ambiguous, cyclic, missing or excessively long reference chains fall back to
online lookup. Unexpanded template markup and entries with no gloss are omitted.
This extraction has incomplete coverage and can contain source/extraction errors;
it is not a full commercial Japanese dictionary.

## Build and refresh

Ordinary builds use only this pinned snapshot and Python 3's standard library:
`python3 scripts/import-jawiktionary.py`. They produce 256 deterministic gzip
shards and a manifest, without downloading anything. Runtime packages contain
these shards and notices, not the large source JSONL snapshot.

For a refresh, download the raw Japanese-edition extract from the URL in
`snapshot.json`; record its HTTPS Last-Modified header, retrieval date, SHA-256
under `rawSha256`, and dump date in a metadata JSON file. Run:

```
python3 scripts/prepare-jawiktionary.py --raw /path/ja-extract.jsonl.gz --metadata /path/metadata.json
npm run package:release
```

The preparation script verifies the full raw checksum, preserves Japanese rows,
and records the filtered checksum. Review word counts and spelling-reference
coverage, run importer/lookup/browser regressions and package parity checks,
and refresh the source/attribution documentation when necessary. Do this before
releases. The application never downloads dictionary updates in the background
or saves lookup history.
