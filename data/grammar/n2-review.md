# N2 content review — 2026-10-22

- Authored 197 points matching `coverage.json` IDs `n2-001`–`n2-197`, with 591 distinct original Japanese sentences, translations, and contextual notes.
- Every point has its own purpose, formation, register, scope restriction, and common-mistake note. Every example contains one or more balanced construction highlights. No example sentence is duplicated within this module.
- Self-review covered conjugation, noun/adjective attachment, negative polarity, first-person intention versus inference, aspect, register, translation, and highlighted spans. This is author self-review, not an independent native-speaker certification.
- Added reading overrides for 得る/得ない, 上（じょう/うえ）, 甲斐, 下（もと）, and ambiguous numeric compounds such as 一人, 九時, 一週間, and temporal 十分 where context can defeat a word-level reading. The optional fourth example tuple also accepts explicit reading maps.
- Corrected an authoring-time confusion for `n2-067`: the exact source target really is **も当然だ**, with **のも当然だ / ても当然だ**, expressing a natural consequence. It is not **も同然だ**, which expresses practical equivalence. The exported point retains the correct inventory pattern; no coverage-ledger correction is needed.
- `n2-178` covers concessive **くとも / なくとも** as well as emphatic sentence-final **とも**, distinguishing their attachment and function. `n2-190` is the formal starting-point/source **より**, rather than comparative より. `n2-003` is approximate-quantity **ばかり**, rather than exclusive ばかり.
- `n2-023` uses **こんな / そんな / あんな / どんなふうに**, avoiding nonstandard demonstrative attachment. `n2-193` explicitly explains that よう/う belongs to the volitional verb form.

## Targeted reference verification

The collection is independently worded; no reference lesson prose, translations, or examples are included in the module. These exact public teaching references were inspected to resolve sense/attachment uncertainty:

- [JLPT Sensei: も当然だ](https://jlptsensei.com/learn-japanese-grammar/%E3%82%82%E5%BD%93%E7%84%B6%E3%81%A0-mo-touzen-da-meaning/) — verified the coverage entry’s intended sense and distinction from 同然.
- [JLPT Sensei: とも](https://jlptsensei.com/learn-japanese-grammar/%E3%81%A8%E3%82%82-tomo-meaning/) — verified that the reference spans concessive and affirmative uses.
- [JLPT Sensei: N2 ばかり](https://jlptsensei.com/learn-japanese-grammar/n2-%E3%81%B0%E3%81%8B%E3%82%8A-bakari-meaning/) — verified approximate rather than exclusive use.
- [Bunpro: ふうに](https://bunpro.jp/ja/grammar_points/423) — verified demonstrative attachment.

## Mechanical check

A Node import and validation against `coverage.json` passed: **197 expected IDs, 197 unique exported IDs, 591 complete examples, no missing required fields, no malformed/empty highlights, no duplicate example sentences**.

## Independent editorial cross-review

A second agent read all 197 lessons, including all 591 examples, and checked formation, intended meaning, translation, and construction boundaries. The review preserved the author’s checked distinctions for も当然だ versus 同然, concessive versus affirmative とも, and formal starting-point より.

Material fixes:

- **n2-029:** translated 一応 as an initial/provisional reading check rather than adding the unsupported literal frequency “at least once.” Checked the adverb against [NINJAL’s dictionary entry](https://mmsrv.ninjal.ac.jp/kamus/data/item1064.html); no dictionary prose or examples copied.
- **n2-056:** changed “food-loving father” to a father who loves cooking, matching 料理好き and the following action.
- **n2-084:** corrected the mistaken description of なおさら as concessive; it intensifies degree (“all the more”).
- **n2-114:** aligned the purpose with the taught formal location, means, and endpoint uses, including the closing formula これにて.
- **n2-010:** replaced the less usual 雨が漏らない with idiomatic 雨漏りしない while preserving the saving-feature comparison.
- **n2-062:** included なら inside all three ならまだしも construction highlights.
- **n2-081:** clarified attachment for the qualified-negative forms くはない / くもない and なくはない / なくもない.

Direct tokenizer checks found contextual 開い readings for open shops/windows, 八つ当たり incorrectly split as やっつ + あたり, and 一行 incorrectly split with こう. Added context-specific reading overrides for n2-030, n2-043, n2-061, n2-168, and n2-186. Kept 開いて for opening a book as ひらいて. The lesson helper now filters inherited override maps to actual sentence surfaces, avoiding irrelevant point-wide keys on the other examples.

Re-import and strict structural validation passed after these edits: **197 unique expected IDs, 591 complete examples, balanced nonempty spans, and every exported reading-map surface present in its sentence**. This is an independent agent editorial review, not native-speaker certification.
