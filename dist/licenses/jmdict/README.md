# Bundled English JMdict

Kō uses the Japanese/English components of the **JMdict** dictionary, copyright
James William Breen and the Electronic Dictionary Research and Development Group
(EDRDG). Source: <https://www.edrdg.org/jmdict/j_jmdict.html>.

The snapshot and derived lookup shards are licensed under **Creative Commons
Attribution-ShareAlike 4.0**, separately from Kō's original code and assets.
See `CC-BY-SA-4.0.txt`, `edrdg-licence.html`, and `jmdict-documentation.html` here.
Kō's modifications consist of indexing spellings/readings and converting the
English entries to JSON shards. Source entry IDs, restrictions, usage labels,
and priority metadata are retained. No dictionary content is relicensed under
Kō's No-Resale License.

The v1.4 Dictionary Playground also includes a derived local Japanese-prefix and
English-gloss inverted index. Search summaries are built for valid spelling,
reading, and sense combinations, and retain source entry IDs. This index remains
under CC BY-SA 4.0 alongside the lookup shards.

`snapshot.json` records the official download URL, retrieval date, HTTP
Last-Modified value, and SHA-256 of `JMdict_e.gz`. This source archive stays in
the development repository; runtime packages contain generated shards and these
notices, not the source archive. The complete English snapshot is included,
without a common-word filter.

## Reproducible build

Install Python 3 in addition to the project's Node.js dependencies, then run
`npm run build`. The standard-library importer verifies the pinned checksum and
generates 256 gzip-compressed JSON shards plus a manifest under `dist/dictionaries/jmdict/` without
network access. A particular source snapshot always generates identical files.

## Refresh before releases

1. Download a fresh snapshot from the `source` HTTPS URL in `snapshot.json`.
   Keep TLS verification enabled; the official `www.edrdg.org` download path is
   used because the FTP hostname's HTTPS certificate can be invalid.
2. Replace `JMdict_e.gz` and update `snapshot.json` with the download date,
   Last-Modified value, and SHA-256. Review updated EDRDG licence/documentation
   and replace the bundled copies if changed.
3. Run the build and dictionary tests. Review entry-count changes, common-word
   checks, package size, and both package layouts. Include the snapshot update
   in the release's source changes. Refresh at every release; for active
   maintenance, review upstream updates at least monthly.

There is no background dictionary download, saved query history, or runtime
dependency on an online service for local English hits.
