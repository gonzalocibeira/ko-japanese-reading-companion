# Independent N5/N4 content review — 2026-10-22

A second author reviewed all 84 N5 and 132 N4 source lessons after initial authoring. The review checked naturalness, stated formation, translation alignment, source-sense separation, and construction boundaries. This is an agent editorial cross-review, not a native-speaker certification.

## Material corrections

- **n5-045:** changed an unqualified third-person たい assertion about the brother to a first-person desire. This now agrees with the perspective rule taught in n5-067.
- **n4-057:** clarified noun + に気がつく versus clause + のに気がつく. The former formation could misleadingly attach の after a noun.
- **n4-124:** clarified verb + 予定だ versus noun + の予定だ. The former compact notation could misleadingly attach の after a dictionary-form verb.
- **n4-104:** replaced the repetitive 水をやってやった with a natural example of moving potted flowers into sunlight while retaining the benefactive てやる construction.
- **n4-073, n4-074:** supplied the irregular する and 来る causative / causative-passive forms and made the godan contraction’s attachment explicit.
- **Construction boundaries:** included the required noun/な-adjective linkers in n5-046, n5-053, n5-058, n5-084, n4-062, and n4-081. Included the negative form in n4-105’s negative-relief example.

## Furigana review

Direct kuromoji inspection found material contextual reading errors: temporal 十分 became じゅうぶん; 九時 became きゅうじ; 一人 and 二人 became いちにん and ににん; 行った in a bicycle-trip example became おこなった. Authored per-example reading maps now cover those cases, plus 七時, 三十分, 二十分, 何時, and the intended 開い reading in shop/window examples. The maps require the builder’s longest-surface override support for compounds that the tokenizer splits.

Reading maps were added to 7 N5, 14 N4, and 21 additional N3 examples. N3 already had one temporal 十分 override. Source characters, highlighted ranges, and translations remain aligned.

## Validation

Re-imported all three modules and checked reference coverage, unique IDs, three examples per point, mandatory fields, nonempty paired construction brackets, and reading maps against actual sentence surfaces. All passed: N5 84/84 references and 252 examples; N4 132/132 and 396 examples; N3 182/182 and 546 examples.

The distinct N4 pairs were retained: concessive versus purpose のに (n4-062/063), hearsay versus appearance そうだ (n4-081/082), ability られる versus passive 受身形 (n4-069/119), and the three action stages たところ / ているところ / dictionary-form ところ (n4-085/106/116).

## Comparison expansion follow-up — 2026-10-22

- `n5-029` now explicitly distinguishes endpoint まで from additive “even” まで;
  its third example supplies the additional meaning used in the inclusion comparison.
  Two original endpoint examples remain. Independent N1-agent review passed the
  Japanese, translations, and endpoint/deadline distinction.
- `n4-001` and `n4-002` now override highlighted 間 and 間に to あいだ and あいだに.
  The comparison author found that separately tokenizing those highlight spans can
  produce ま; the interval reading is now authored in all six lesson examples.
  Concession-comparison 間に合う retains its correct まにあう reading.
- Meaning check: [TUFS, 副助詞](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/095.html),
  sections VIII/IX, confirms additive まで and さえ while distinguishing endpoint まで.
  No source sentences or prose were imported.
