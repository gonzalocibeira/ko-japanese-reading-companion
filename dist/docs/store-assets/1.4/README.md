# Kō 1.4 store submission notes

Kō 1.4.0 is the GitHub release dated 1 November 2026. These notes prepare a future
store submission; no upload, review submission, listing change, or store publication
is performed as part of the GitHub release. Retain manual publication rather than
enabling automatic publication after review.

## Package and disclosures

Use `ko-japanese-reading-companion-1.4.0-chrome-web-store.zip` from the
[GitHub release](https://github.com/gonzalocibeira/ko-japanese-reading-companion/releases/tag/v1.4.0).
It contains `manifest.json` at its root. The manual-install ZIP has a `dist/` prefix.
Both contain the same 1,599 runtime files; check the attached `SHA256SUMS`.

The manifest retains the existing permissions, host access, and network origins.
Dictionary search and Grammar lessons run locally. Dictionary Playground contacts a
Wiktionary edition only after selecting that language’s online action. Reading-view
and enabled Kōくん definitions retain automatic local-first fallback. No search
history or learning progress is saved. Use the current [privacy policy](../../privacy-policy.md).

## Reviewer walkthrough

1. Open Playgrounds from the extension popup. The standalone page works with
   automatic readings disabled and without a supported source webpage.
2. Choose Dictionary and search `平和`, `タベル`, or `peace`. Open a result for
   English senses, restrictions, source attribution, and available local Japanese
   definitions. Searches work offline.
3. For a missing Japanese term, verify that online English/Japanese lookup is
   optional and selecting one language preserves the other language’s control.
4. Choose Grammar, search `dake` or `ている`, and inspect a highlighted construction.
   Dotted vocabulary opens Dictionary; Return restores the grammar view. Compare
   sentence variants and use the optional Choose the meaning activity.
5. In a Japanese webpage or compatible Google Doc, enable Reading view and open
   Playgrounds → Grammar. Scroll to load more results and use Example, Usage,
   Compare, and Previous/Next. Verify keyboard access and a narrow panel.
6. Existing Word forms, 90 mimetics, corrections, and optional Kōくん remain
   available. Reduced motion is respected. Reload open tabs after an update.

All 276 automated checks passed, including native popup sizing and scrolling. See
the [release audit](../../release-1.4-audit.md) for evidence and scope. Approved 1.3
store screenshots remain in their existing directory; they are not new 1.4 captures.
