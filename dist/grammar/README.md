# Kō grammar collection

Kō's N5–N1 explanations, usage notes, examples, translations, comparisons, and
activities are independently authored original material under Kō's licence.
No JLPT Sensei lesson prose, examples, images, audio, or downloadable books are
copied or bundled. `coverage.json` records topic identities and source URLs from
the public indexes consulted on 22 October 2026, not an imported lesson database.
JLPT Sensei's indexes are supplementary references, not an official exam syllabus.

There are 848 source references and 847 canonical points. The explanatory のです
reference is reconciled with んです; its formal spelling remains searchable.
Identical-looking constructions with distinct functions remain separate, including
the two N4 のに and two そうだ entries. Each canonical point has three original
examples. Eighteen comparison families contain 41 complete authored sentence
variants and 18 optional explanatory activities, in addition to the 2,541 lesson
examples.

The ten additional families cover ている / てある / ておく, ように / ために,
ことにする / ことになる, はずだ / べきだ, たところ / たばかり, のに / ても,
らしい / ようだ / みたいだ, わけではない / とは限らない, さえ / まで,
and うちに / 間に. Their notes explain overlaps and substitution limits rather
than forcing an artificial difference in every context. See the independent
reviews in the source files `comparisons-expansion-a-review.md` and
`comparisons-expansion-b-review.md`.

## Authoring and review

The five level modules contain original content and review notes record editorial
checks and material corrections. An example's ASCII brackets mark the construction
spans; remove brackets to recover the sentence exactly. Discontinuous constructions
use multiple bracketed spans. `readings` overrides resolve context-dependent or
compound readings. Ordinary vocabulary annotations use the pinned tokenizer and
retain dictionary targets; no runtime sentence analysis is required for examples.

Run `node scripts/build-grammar.mjs` after dependencies are installed. It reads only
local modules and the pinned tokenizer dictionary, validates reference reconciliation,
required notes, three distinct examples, nonempty balanced spans, and related links,
and comparison/activity integrity, then creates `dist/grammar/`. Families declare
their canonical point links directly; a point can link to several families without
losing related points. Index metadata records both lesson and comparison digests.
`npm run build` includes this step. It never downloads
grammar content. Runtime uses a small index and lazy per-point/comparison files.

Content review checks meaning, naturalness, formation, register, translation, and
construction boundaries. Automated validation checks structure and cannot certify
native-speaker quality. Review notes distinguish author self-review from independent
agent review; no native-speaker certification is claimed.

## Maintenance

Update topic reconciliation explicitly when reference coverage changes. Never replace
original content with scraped lessons. Add tests for corrected readings or construction
distinctions, rebuild, and inspect the Sentence Lens at wide and narrow widths.
Vocabulary and source attribution links are optional navigation; grammar itself has
no runtime dependency on the referenced sites.
