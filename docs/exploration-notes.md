# Kō 1.2 exploration notes

Word-level tools operate on the reading panel's existing visible-text snapshot. The Playgrounds button also opens shared local dictionary-form word input and bundled mimetic examples. These tools do not extract additional document pages, fetch examples, make model requests, or save learning history. The original phrase stays visible above word-form experiments; generated forms are demonstrations rather than replacement document text.

## Verb Playground

The Form selector moves between reviewed constructions. Simple finite, potential, passive, causative, full causative-passive, ～たい, ～ている, ～てみる, ～ておく, and ～てしまう support Past, Negative, and Polite. Connecting ～て／～なくて and ～ば support Negative; ～たら supports Negative and Polite, without a separate Past switch. Volitional supports Polite, requests support Negative, and ～ないで, imperative, and prohibition have fixed forms. Spoken shortening is available for ～ている, ～ておく, and ～てしまう. Constructions cannot be freely stacked.

The source's spelling, reading, contiguous boundaries, and terminal morphology must match a reviewed form. Analysis is bounded to 12 starts, 12 tokens, 80 characters, and 128 variants per candidate. Unsupported continuations cannot be discarded to expose a shorter phrase. Saved corrections suppress overlapping grammatical exploration. Reset restores the exact original, including recognized desire-negative and imperative aliases.

Godan, ichidan, する, and 来る are supported where analysis is reliable. Standard potential uses 食べられる, 読める, できる, and 来られる. Potential/passive/honorific surface overlaps show grammatical possibilities and require a choice before assigning a label. Fused forms such as 読める may have their own dictionary lemma; a possible base must be verified locally and explicitly chosen. Unresolved derived verbs and ある have a restricted family set. Typed いる, くる, and する offer explicit senses rather than assuming the tokenizer selected the intended class. Regular godan homophones such as 繰る and 刷る retain their own conjugations and readings. Verified shortened-potential inputs such as 見れる are declined; use the intended dictionary base instead. Honorific rewriting, dialect, ら抜き potential, shortened causatives, and arbitrary chains remain outside scope. Selected lexical exceptions are declined. Bare 来られる may still be declined when IPADIC assigns the classical reading きたられる.

Conjugation generation uses reviewed class-aware recipes and only verified elementary operations from bundled, pinned [kamiya-codec 4.16.1](https://github.com/fasiha/kamiya-codec), under the [Unlicense](https://github.com/fasiha/kamiya-codec/blob/main/UNLICENSE). Its unrestricted auxiliary generation and brute-force deconjugation are not used. Sources include [TUFS desire forms](https://www.coelang.tufs.ac.jp/mt/ja/gmod/courses/c02/lesson33/), [TUFS ～ておく／～てみる](https://www.coelang.tufs.ac.jp/mt/ja/gmod/contents/explanation/088.html), and Tae Kim's guides to [conditionals](https://guidetojapanese.org/learn/grammar/conditionals), [requests](https://guidetojapanese.org/learn/grammar/requests), and [potential](https://guidetojapanese.org/learn/grammar/potential).

## Mimetic Playground

Forty-five authored scenes compare ninety attested expressions. The original thirty comparisons are listed below; the fifteen 1.2 additions are described in the adjective and expansion section. The six original comparisons are ころころ/ごろごろ (rolling), くるくる/ぐるぐる (rotation), きらきら/ぎらぎら (light), しとしと/ざあざあ (rain), さらさら/ざらざら (texture), and にこにこ/にやにや (smiling). The other twenty-four comparisons are:

| Area | Related expressions |
| --- | --- |
| Feelings | わくわく/どきどき, いらいら/むかむか, ほっと/すっきり, はらはら/おろおろ |
| Body | うとうと/ぐっすり, くたくた/ぐったり, ずきずき/ちくちく, ぺこぺこ/ぱんぱん, ふらふら/よろよろ, ぽかぽか/ひんやり |
| Movement | のろのろ/すたすた, ばたばた/てきぱき, うろうろ/ぶらぶら |
| People | じっと/じろじろ, くすくす/げらげら, しくしく/わんわん |
| Texture | ふわふわ/もちもち, しっとり/じっとり, ねばねば/べたべた, つるつる/ぬるぬる, さくさく/かりかり, からから/かさかさ |
| Sound | がやがや/ざわざわ, とんとん/どんどん |

Each variant has an original Japanese example, translation, caption, other-uses note, reference, and a bundled twelve-frame ukiyo-e-inspired pixel animation. Scenes start automatically and loop with a held final pose; reduced-motion mode shows a representative still frame. About → Show legacy animations switches all sites to the original line animations, which also loop automatically. The choice is stored locally and updates open cards. There is no replay button. Hiragana, full-/half-width katakana, and composed/decomposed dakuten normalize for exact matching; contiguous token boundaries may be joined. The attested ざーざー/ザーザー rain spelling is an explicit alias for ざあざあ ([Japan Foundation](https://www.erin.jpf.go.jp/jp/lesson/08/onomatopoeia/)). Aliases do not increase the ninety-word count. Arbitrary elongations, small-kana changes, substrings, and derivatives are not inferred. External reference illustrations, manga, audio, and corpora are not packaged.

Scenes illustrate a specific use, not an automatic interpretation of the selected passage. Polysemy matters: ごろごろ can describe rolling, thunder, purring, stomach noises, or lounging. Comparisons are not universal rules that voiced sounds always mean heavier objects, or that every expression can be freely substituted for its neighbor.

The authored descriptions are checked against [NINJAL's mimetic-word reference](https://www2.ninjal.ac.jp/Onomatope/) and publisher dictionary references linked from individual cards. The new comparisons include overlapping expressions rather than a universal severity ladder or set of opposites. For example, どきどき includes excitement and exertion as well as anxiety; むかむか also describes nausea; わんわん also describes barking. A scene illustrates one named use, not an automatic interpretation of the source passage.

## Local browser

Playgrounds in the reading-panel header opens a full-height workspace without selecting a word. The Word forms tab shows free input directly, with no preset verb list or verb search. Enter a dictionary-form verb or adjective of up to forty characters for offline checking and confirm its dictionary form, reading, and class, or click a supported verb or adjective in the reading panel and choose **Try word forms**, or **Open playgrounds** when other tools are available. **← Change word** returns to input with its previous value selected for replacement. Supported noun＋する compounds are accepted; unknown forms, sentences, and inflected input are rejected with guidance. Ambiguous entries and possible underlying bases offer explicit choices.

The Mimetic tab searches ninety expressions by Japanese, reading, or authored English keywords and offers category filters. **← Examples** restores its catalogue position and focus. Input/examples and the selected tool use separate views with one scrolling area. **← Reading view** restores your reading position. Escape returns from a tool to word input or mimetic examples, then to reading. Verb controls use fixed-size checkboxes and unbroken labels. Browser state and typed queries remain in memory.

## Meaning Forks

Recognition is limited to contiguous morphology for ichidan/来る ～られる and causative ～せる/させる chains with supported tense, polarity, and polite endings. Ordinary lexical endings such as 流れる, 荒れる, and 見せる must not trigger. Conditional, contracted, causative-passive, and longer unsupported chains are declined.

The diagrams show common grammatical functions, not a contextual parse, ranking, exhaustive inventory, or sentence translation. Honorific respect toward the actor differs from ～ます politeness toward the listener. Passive effects can be indirect. The tense and negation badges describe the actual source ending; the diagram explains the underlying role relation.

References: Tae Kim's [potential forms](https://guidetojapanese.org/learn/complete/potential) and [passive, causative, and honorific forms](https://guidetojapanese.org/learn/grammar/causepass). Explanations and diagrams are authored for Kō.

## Data flow and verification

Part of speech, conjugation class/form, adjective dictionary alternatives, and dictionary reading are added to in-memory word metadata. Existing worker sender validation, extraction limits, and local storage formats remain in effect. Explicit playground tokenization has a separate purpose channel, with at most four nonempty strings of forty characters each. Cancellation is isolated by document and purpose, and caches by tab/purpose, so checking a typed word does not replace page readings. Closing or replacing an exploration invalidates pending results. Activating a reading-panel word automatically looks up its definitions on Wiktionary. Using word-level playground controls and the Playgrounds browser makes no additional definition requests. Reference links contact their destination only when followed.

Checks cover real bundled dictionary analysis, generated form round trips, false positives, exact source spans, role alternatives, all mimetic pairs, keyboard controls, reduced motion, narrow panels, offline operation, source preservation, manual corrections, and stale UI after edits. Lexical kana homographs such as いれる retain their forms while unsupported shortened potentials remain declined. A prior live smoke check on a public, read-only Google Doc also verified readings and both playgrounds without changing source annotations. Live editing was not exercised. The current [1.2 release audit](release-1.2-audit.md) records verification, including the native toolbar popup; the [1.1 audit](chrome-web-store-audit.md) retains historical evidence. Google's undocumented annotation surface can change.

## Adjective forms in 1.2

The same Word forms input accepts dictionary-form い-adjectives and bare な-adjective stems (静か, without な). Confirm the dictionary form, reading, and class. Word details offers Try word forms inline for supported adjectives, including recognized inflected phrases. Both entry points share generation, controls, furigana, Reset, and How this form is built explanations.

Basic predicates offer Past, Negative, and Polite. Before-a-noun, adverbial, and linking forms have no switches. Conditions (～ければ／～なら and ～たら) offer Negative. Become and Make use ～く／～に + なる／する; their switches conjugate the resulting verb. な predicates use だ／です, plain negatives ではない, and polite negatives ではありません. い polite negatives use ～くないです. Common source aliases such as じゃなかった or ～くありません preserve the exact original on Reset.

Classification uses known dictionary entries, including alternatives for 嫌い and な-adjectives ending in い. いい／良い and supported lexical ～いい compounds have the よ stem; かわいい／可愛い remain regular. Attributive-only 大きな／小さな and unsupported longer constructions are excluded. These are grammatical demonstrations; context can make a generated construction unnatural or require changes to particles and participants. Appearance ～そう, degree, nominalization, quizzes, and learning history remain outside this release.

The catalog now contains 90 expressions in 45 comparisons: the original 30 comparisons plus six food/texture, five everyday-sound, and four daily-action comparisons. Reference pages were checked during release preparation; no runtime fetching is introduced. Current validation is recorded in the [1.2 audit](release-1.2-audit.md).

## Contextual command recovery

When Kuromoji analyzes a known independent verb as an incomplete ichidan stem, word metadata can recover one dictionary-verified imperative alternative with identical spelling and reading. Recovery applies only at text end, line end, or before sentence-ending punctuation, with optional horizontal whitespace. Whole-token dictionary lookup is limited to forty characters, eight imperative candidate entries, and a 256-entry in-memory cache. Existing imperative generation must validate the base, class, spelling, and reading. More than one supported interpretation leaves the original analysis unchanged.

For 痛みを受け取れ and 痛みを知れ, word details and lookup use 受け取る and 知る, and Try word forms opens Direct command. Source readings, pronunciation, and token positions are unchanged. Auxiliary continuations such as 受け取れない／受け取れます and conditional 受け取れば retain their existing analysis. Comma-separated clauses, ambiguous particle-attached stems, and unsupported 食べ remain outside recovery.
