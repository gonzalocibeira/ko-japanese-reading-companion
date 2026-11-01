# Kō 1.4.1 · 1 November 2026

Hover over any character in multi-kanji words in Google Docs to see the complete word and its reading.

- Reconstruct adjacent canvas text runs before word lookup, including words exposed as one run per kanji. 洗濯機 now resolves as せんたくき from every character.
- Deduplicate repeated canvas tiles and preserve character positions. Missing, hidden, or ambiguous overlapping glyphs are kept out of reconstructed words.
- Verified with 25 companion and reading regression checks, additional final Docs browser checks, type checking, and a rebuilt extension. No permissions or dependencies changed.
- This patch includes the Dictionary and Grammar playgrounds from 1.4.0. Chrome Web Store review and publication are managed separately from GitHub.
