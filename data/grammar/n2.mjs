// Independently authored Kō grammar explanations and examples. Reference names: coverage.json.
const readingOverrides={'n2-003':{'十分':'じゅっぷん'},'n2-020':{'得ない':'えない'},'n2-021':{'得る':'える'},'n2-038':{'上':'じょう'},'n2-044':{'甲斐':'かい'},'n2-062':{'十分':'じゅっぷん'},'n2-116':{'下':'もと'},'n2-183':{'上':'うえ'},'n2-030':{'開い':'あい'},'n2-043':{'開い':'あい'},'n2-061':{'八つ当たり':'やつあたり'},'n2-168':{'一行':'いちぎょう'},'n2-186':{'開い':'あい'}};
const commonReadings={'一人暮らし':'ひとりぐらし','一人':'ひとり','九時':'くじ','一日':'いちにち','三日':'みっか','一晩':'ひとばん','一歩':'いっぽ','一冊':'いっさつ','一言':'ひとこと','一週間':'いっしゅうかん'};
const p=(id,purpose,formation,register,restrictions,mistake,examples)=>({id,purpose,formation:[formation],register,restrictions,mistake,examples:examples.map(([text,translation,note,readings={}])=>({text,translation,note,readings:Object.fromEntries(Object.entries({...commonReadings,...readingOverrides[id],...readings}).filter(([surface])=>text.replace(/[\[\]]/g,'').includes(surface)))}))});
export default [
p('n2-001','Describe an unwelcome outcome after a long process.','Vた / Nの + あげく','Neutral; often written','Normally evaluates the final outcome negatively.','Use 末に for a neutral or successful outcome.',[
['何時間も迷った[あげく]、何も買わなかった。','After hours of indecision, I bought nothing.','The long process ends disappointingly.'],
['議論を重ねた[あげく]、計画は中止になった。','After repeated discussions, the plan was canceled.','The outcome defeats the effort.'],
['無理をした[あげく]、体を壊してしまった。','After pushing myself too hard, I ended up damaging my health.','A negative result follows sustained behavior.']]),
p('n2-002','Offer alternatives, or introduce another possibility.','A、あるいはB / あるいは + clause','Formal or written','Can mean either “or” or “possibly”; context distinguishes them.','Do not assume both alternatives must occur.',[
['申請書は郵送、[あるいは]窓口で提出してください。','Please submit the application by mail or at the counter.','Two submission choices.'],
['明日の会議は延期、[あるいは]中止になるかもしれない。','Tomorrow’s meeting may be postponed or canceled.','Alternative outcomes.'],
['返事がないのは、[あるいは]旅行中だからかもしれない。','Perhaps there is no reply because they are traveling.','Introduces a tentative explanation.']]),
p('n2-003','Indicate an approximate amount or duration.','Quantity + ばかり','Neutral','Here ばかり means approximately, rather than only or just finished.','Do not read an approximate quantity as a strict limit.',[
['十分[ばかり]ここで待ってください。','Please wait here for about ten minutes.','An approximate duration.'],
['五人[ばかり]の学生が残った。','About five students stayed behind.','An approximate count.'],
['駅から二キロ[ばかり]歩いた。','I walked about two kilometers from the station.','An approximate distance.']]),
p('n2-004','Describe a change that keeps moving in one direction.','V dictionary + ばかりだ','Neutral; often concerned','Usually presents an ongoing worsening trend.','This is a continuing trend, not Vたばかり “just did”.',[
['修理費は増える[ばかりだ]。','The repair costs keep increasing.','An unwelcome trend.'],
['説明を聞いても、疑問は深まる[ばかりだ]。','Even after the explanation, my doubts only deepen.','The change continues despite intervention.'],
['何もしなければ、状況は悪くなる[ばかりだ]。','If we do nothing, the situation will only get worse.','Predicts a continuing direction.']]),
p('n2-005','Add a more striking fact to an already notable one.','Plain clause / N / な-adjectiveな + ばかりか','Neutral to formal','The second clause escalates or broadens the first.','Use an additive relationship, not an unrelated contrast.',[
['この店は安い[ばかりか]、配達も無料だ。','This shop is not only inexpensive; delivery is free too.','Adds another benefit.'],
['彼は謝らない[ばかりか]、私を責めた。','He not only failed to apologize but blamed me.','Escalates the criticism.'],
['祖母は英語[ばかりか]、中国語も話せる。','My grandmother speaks not only English but Chinese too.','Adds another language.']]),
p('n2-006','Blame one circumstance for an unfortunate consequence.','Plain clause / Nである / な-adjectiveな + ばかりに','Neutral','Carries regret or a sense that this cause was decisive.','Use ので for a neutral reason without blame.',[
['住所を間違えた[ばかりに]、荷物が届かなかった。','Because I got the address wrong, the parcel never arrived.','Regrets one decisive error.'],
['安いという理由だけで選んだ[ばかりに]、すぐ壊れてしまった。','Because I chose it solely for its price, it broke straight away.','Blames the selection criterion.'],
['一言余計なことを言った[ばかりに]、友達を怒らせた。','One unnecessary remark made my friend angry.','A small cause has an unwanted result.']]),
p('n2-007','Add a relevant side note to the current topic.','ちなみに + sentence','Conversational and written','The addition should connect to the preceding topic.','Use a topic-changing expression for an unrelated subject.',[
['会場は駅の隣です。[ちなみに]、駐車場はありません。','The venue is beside the station. Incidentally, there is no parking.','Adds useful venue information.'],
['この本は姉が書きました。[ちなみに]、表紙も姉の絵です。','My sister wrote this book. She also painted the cover, incidentally.','Adds related background.'],
['参加費は千円です。[ちなみに]、学生は半額です。','The fee is one thousand yen. Students pay half, by the way.','Adds a relevant exception.']]),
p('n2-008','Emphasize that something is not true at all.','ちっとも + negative predicate','Conversational','Normally pairs with a negative expression.','Do not combine it with an ordinary positive predicate.',[
['この椅子は[ちっとも]快適では[ない]。','This chair is not comfortable at all.','Strong negative evaluation.'],
['説明を読んでも、[ちっとも]分から[ない]。','Even after reading the explanation, I do not understand at all.','No improvement in understanding.'],
['彼女は失敗を[ちっとも]気にしてい[ない]。','She is not bothered by the mistake at all.','Emphasizes absence of concern.']]),
p('n2-009','Explain a result as fitting someone’s ability or circumstances.','Plain clause / N / な-adjectiveな + だけあって','Neutral; often appreciative','Typically confirms an expectation based on a relevant fact.','Connect the praise to a concrete basis.',[
['料理人[だけあって]、包丁の使い方が上手だ。','As you would expect of a chef, he handles a knife skillfully.','Occupation explains the skill.'],
['毎日練習している[だけあって]、発音がきれいだ。','Her pronunciation is clear, as you would expect from daily practice.','Effort explains the result.'],
['評判の店[だけあって]、開店前から列ができていた。','As expected of a popular shop, there was a line before opening.','Reputation explains the crowd.']]),
p('n2-010','Find a relative positive in an imperfect situation.','Plain clause + だけましだ','Neutral; conversational','The situation is better than an implied or stated worse alternative.','It does not mean the situation is good without qualification.',[
['古い部屋だが、雨漏りしない[だけましだ]。','The room is old, but at least the roof does not leak.','Identifies one saving feature.'],
['遅れたけれど、今日中に届いた[だけましだ]。','It was late, but at least it arrived today.','Compares with a worse delay.'],
['席は遠いが、舞台が見える[だけましだ]。','Our seats are far away, but at least we can see the stage.','An imperfect view still has value.']]),
p('n2-011','Stress that a particular circumstance makes a result especially strong.','Plain clause / N / な-adjectiveな + だけに','Neutral','The fact provides an especially relevant reason or expectation.','Do not confuse this causal use with “only”.',[
['期待していた[だけに]、中止は残念だ。','Because I had been looking forward to it, the cancellation is especially disappointing.','Expectation intensifies disappointment.'],
['専門家[だけに]、説明が的確だ。','As a specialist, her explanation is especially precise.','Expertise supports the evaluation.'],
['家族が遠くにいる[だけに]、連絡がないと心配だ。','Because my family lives far away, I worry especially when there is no contact.','Distance strengthens the concern.']]),
p('n2-012','Judge that an effort, reputation, or expense was justified.','Plain clause / N + だけのことはある','Neutral; appreciative','Usually confirms value after seeing the result.','Do not use it for an outcome that failed to meet expectations.',[
['三年練習した[だけのことはある]。演奏が安定している。','Those three years of practice have paid off. The performance is steady.','Effort is visible in the result.'],
['値段が高い[だけのことはある]。この靴は歩きやすい。','These shoes justify their high price. They are comfortable to walk in.','Expense proves worthwhile.'],
['人気の宿[だけのことはある]。細かい気配りがうれしい。','The inn deserves its popularity. Its thoughtful touches are lovely.','Experience confirms the reputation.']]),
p('n2-013','Single out a minimum action or one especially important item.','N / plain clause + だけは','Neutral','Focus depends on context: at least this, or this in particular.','Do not interpret は as adding another item.',[
['忙しくても、朝食[だけは]食べる。','Even when busy, I at least eat breakfast.','Protects a minimum habit.'],
['結果は分からないが、応募する[だけは]してみよう。','I do not know what will happen, but I will at least apply.','Commits to the action despite uncertainty.'],
['秘密[だけは]守ってください。','Please keep this secret, at least.','Singles out a crucial request.']]),
p('n2-014','Include an unexpected case or justify a casual response.','N + だって / だって + reason','Casual','Nだって means even or also; sentence-initial だって gives a reason, often defensive.','Avoid the defensive reason use in formal explanations.',[
['私[だって]その仕事はできます。','I can do that job too.','Includes the speaker emphatically.'],
['子ども[だって]違いに気づく。','Even a child notices the difference.','Includes an unexpected case.'],
['行きたくないよ。[だって]、明日は早いんだ。','I do not want to go. After all, I have an early start tomorrow.','Casual justification.']]),
p('n2-015','Reduce something to no more than a stated category.','N + でしかない','Neutral to formal','Often dismisses status, importance, or certainty.','This evaluates the noun; it is not a location marked by で.',[
['それはまだ推測[でしかない]。','That is still only a guess.','Limits the strength of the claim.'],
['私はこの町では一人の旅行者[でしかない]。','In this town, I am merely a traveler.','Limits the speaker’s role.'],
['高価でも、使わなければ飾り[でしかない]。','However expensive it is, if unused it is just an ornament.','Reduces practical value.']]),
p('n2-016','Explain that circumstances leave no room for an activity.','N / V dictionary + どころではない','Neutral','A stronger concern or constraint prevents the activity.','This is stronger than simply not wanting to do something.',[
['締め切り前で、旅行[どころではない]。','With the deadline approaching, I cannot possibly think about a trip.','Work leaves no room for travel.'],
['熱が高くて、勉強する[どころではない]。','My fever is so high that studying is out of the question.','Physical condition prevents the action.'],
['店が混んでいて、休憩[どころではなかった]。','The shop was so busy that a break was out of the question.','Past circumstances prevented a break.']]),
p('n2-017','Replace an expectation with a much more extreme or opposite fact.','Plain clause / N + どころか','Neutral','The second clause overturns or greatly exceeds the first.','Keep the contrast or escalation clear.',[
['涼しい[どころか]、寒くて上着が必要だ。','Far from being cool, it is cold enough to need a jacket.','Escalates the temperature description.'],
['彼は泳げる[どころか]、大会で優勝したこともある。','He can do much more than swim; he has won a competition.','Exceeds a modest expectation.'],
['休む[どころか]、週末も働いていた。','Far from resting, she was working at the weekend too.','Contradicts the expected action.']]),
p('n2-018','Draw a tentative conclusion from available signs.','どうやら + clause; often ようだ / らしい','Neutral','Suggests inference rather than direct certainty.','Do not present it as conclusive proof.',[
['[どうやら]電車は止まっているようだ。','It looks as though the trains have stopped.','An inference from the situation.'],
['[どうやら]道を一本間違えたらしい。','It seems I took the wrong street.','A conclusion from surrounding clues.'],
['足音がしない。[どうやら]みんな帰ったようだ。','There are no footsteps. Apparently everyone has gone home.','Evidence supports a tentative conclusion.']]),
p('n2-019','Treat an outcome as settled regardless of effort or choice.','どうせ + clause','Conversational','Can sound resigned or dismissive; どうせなら proposes making the most of something.','Use carefully when speaking about another person’s efforts.',[
['[どうせ]待つなら、座って待とう。','If we have to wait anyway, let us sit down.','Makes the best of a fixed situation.'],
['[どうせ]雨だから、今日は家で映画を見よう。','It is raining anyway, so let us watch a film at home today.','Treats the weather as settled.'],
['[どうせ]無理だと、始める前から決めないで。','Do not decide it is impossible before you even start.','Warns against a resigned assumption.']]),
p('n2-020','State that an event or explanation is not possible.','Vます stem + 得ない','Formal or written','得ない is read えない and concerns possibility, not personal skill.','Do not read the negative as うない.',[
['その時刻に二つの場所にいることはあり[得ない]。','It is impossible to be in two places at that time.','Logical impossibility.'],
['この条件では成功し[得ない]。','Success is impossible under these conditions.','Conditions rule out the outcome.'],
['全員が同時に満足する案は考え[得ない]。','I cannot conceive of a proposal that satisfies everyone at once.','An imaginable possibility is denied.']]),
p('n2-021','Describe what could happen in principle.','Vます stem + 得る','Formal or written','Dictionary form permits える or うる; inflections use え, as in 得ない.','Use the ordinary potential form for someone’s learned ability.',[
['小さな誤差でも、結果を変え[得る]。','Even a small error can change the result.','Possible influence, not skill.'],
['誰にでも起こり[得る]事故だ。','It is an accident that could happen to anyone.','General possibility.'],
['現時点で考え[得る]方法を並べた。','I listed the methods conceivable at present.','The range of possible ideas.']]),
p('n2-022','Say that an event happens again after an earlier occurrence.','再び + predicate','Neutral to formal','Often marks a renewed event after an interval.','For an immediate repetition, もう一度 may be more conversational.',[
['十年後、私たちは[再び]同じ駅で会った。','Ten years later, we met again at the same station.','A renewed meeting after an interval.'],
['雨がやみ、太陽が[再び]顔を出した。','The rain stopped, and the sun appeared again.','An event resumes.'],
['閉鎖されていた道が[再び]通れるようになった。','The closed road became passable again.','A previous state is restored.']]),
p('n2-023','Describe a manner, appearance, or way of doing something.','こんな / そんな / あんな / どんな + ふうに; clause + ふうに','Neutral','ふう refers to manner; ふうな modifies a noun.','Use に before a predicate and な before a noun.',[
['こんな[ふうに]角を折ってください。','Please fold the corner like this.','Demonstrates a method.'],
['どんな[ふうに]説明すれば伝わるだろう。','How could I explain it so it gets across?','Asks about manner.'],
['責めている[ふうに]聞こえたら、ごめんなさい。','I am sorry if that sounded as though I was blaming you.','Describes perceived tone.']]),
p('n2-024','Identify the event that started a lasting change.','N + がきっかけで / をきっかけに','Neutral','The trigger starts a new activity, relationship, or direction.','Do not use it for every routine cause and result.',[
['一冊の絵本[がきっかけで]、日本語に興味を持った。','A picture book sparked my interest in Japanese.','A small event starts a new interest.'],
['引っ越し[をきっかけに]、自転車通勤を始めた。','Moving house prompted me to start commuting by bicycle.','A life change starts a habit.'],
['友人の紹介[がきっかけで]、この仕事に就いた。','A friend’s introduction led me to this job.','Identifies the starting event.']]),
p('n2-025','Describe an outward sign of a feeling or state.','い-adjective stem / な-adjective stem + げ; selected V stems + げ','Neutral; descriptive','Attaches to selected words such as 悲しげ, 不安げ, and 言いたげ.','Do not freely attach げ to every adjective or noun.',[
['子どもは不安[げ]に入口を見ていた。','The child looked toward the entrance anxiously.','Infers a feeling from appearance.'],
['彼女は何か言いた[げ]だった。','She looked as though she wanted to say something.','Visible intention.'],
['猫は満足[げ]な顔で眠っている。','The cat is asleep with a contented expression.','げな modifies a noun.']]),
p('n2-026','Show a result or viewpoint opposite to the expected direction.','逆に + clause','Neutral','Requires a meaningful reversal or contrast.','It does not simply mean “on the other hand” for unrelated facts.',[
['急いで直したら、[逆に]壊してしまった。','I rushed to fix it and ended up breaking it instead.','Reverses the intended result.'],
['注意したつもりが、[逆に]励ましたことになった。','I meant to warn her, but it actually encouraged her.','Unexpected opposite effect.'],
['都会は便利だが、[逆に]静かな場所を探しにくい。','Cities are convenient, but conversely it is hard to find somewhere quiet.','Looks at the reverse side.']]),
p('n2-027','Present two contrasting sides of the same thing.','Plain clause / Nである / な-adjectiveな + 反面','Neutral to formal','Usually contrasts properties of one subject.','Use 一方で for broader contrasts between different subjects.',[
['この町は便利な[反面]、家賃が高い。','This town is convenient, but rents are high.','Two sides of the same location.'],
['在宅勤務は自由な[反面]、孤独を感じることもある。','Working from home offers freedom but can also feel lonely.','A benefit and a drawback.'],
['彼は厳しい[反面]、困った時には親身になる。','He is strict, but he is also caring when you need help.','Contrasting traits.']]),
p('n2-028','Question an uncertain outcome or mark its confirmation.','果たして + question / outcome clause','Formal; narrative','Questions often express genuine doubt; statements can confirm an expectation.','Do not translate it as a certainty in every context.',[
['この方法で[果たして]間に合うだろうか。','Will this method really get us there in time?','Emphasizes uncertainty.'],
['[果たして]誰が最後まで残るのか。','Who, in the end, will stay to the finish?','Raises suspense.'],
['予報どおり、夕方には[果たして]雪が降り始めた。','Sure enough, as forecast, snow began falling in the evening.','Confirms the predicted outcome.']]),
p('n2-029','Mark a provisional action or a minimum standard met.','一応 + clause','Neutral','Often leaves room for revision or further work.','It may qualify confidence; it does not always mean completion.',[
['資料は[一応]全部読みました。','I have read through all the materials for an initial check.','Completion is cautiously qualified.'],
['雨は降らなさそうだが、[一応]傘を持っていく。','It does not look like rain, but I will take an umbrella just in case.','A precaution.'],
['[一応]予約したが、人数は後で変えられる。','I made a provisional booking, but we can change the number later.','A temporary arrangement.']]),
p('n2-030','Exclude a specified item from a set.','N + 以外; clause + 以外に','Neutral','Often combines with negative predicates to mean nothing except.','Keep the excluded item distinct from the remaining set.',[
['日曜日[以外]は毎日開いている。','It is open every day except Sunday.','Excludes one day.'],
['水[以外]は飲まない。','I drink nothing except water.','Negative predicate limits the set.'],
['本人[以外]に鍵を渡さないでください。','Please do not give the key to anyone other than the person concerned.','Restricts recipients.']]),
p('n2-031','Say that something exceeds a stated comparison point.','N / plain clause + 以上に','Neutral','The comparison can be a quantity, person, or expectation.','Use 以上 for an inclusive numerical threshold without comparative emphasis.',[
['予想[以上に]道が混んでいた。','The roads were more crowded than expected.','Exceeds an expectation.'],
['今回は前回[以上に]準備が必要だ。','This time we need even more preparation than last time.','Exceeds a previous occasion.'],
['想像していた[以上に]山頂は寒かった。','The summit was colder than I had imagined.','A clause supplies the comparison.']]),
p('n2-032','Accept a premise and state the obligation that follows.','Plain clause / Nである + 以上は','Formal or firm','The conclusion commonly expresses duty, resolve, or judgment.','Do not use it as a neutral time sequence.',[
['引き受けた[以上は]、最後まで責任を持つ。','Now that I have accepted, I will take responsibility to the end.','Acceptance creates an obligation.'],
['参加する[以上は]、規則を守ってください。','If you are participating, please follow the rules.','Participation brings a requirement.'],
['約束である[以上は]、簡単には変えられない。','Since it is a promise, we cannot change it lightly.','A stated premise supports a judgment.']]),
p('n2-033','Describe something happening abruptly without preparation.','いきなり + predicate','Neutral; conversational','Emphasizes the lack of warning or intervening steps.','Do not use it merely for a fast action with clear preparation.',[
['静かな部屋で、電話が[いきなり]鳴った。','The phone suddenly rang in the quiet room.','No warning.'],
['初対面の人に[いきなり]住所を聞かれて驚いた。','I was surprised when someone I had just met abruptly asked my address.','An unexpected social move.'],
['準備運動なしで[いきなり]走らないで。','Do not start running without warming up.','Skips a preparatory step.']]),
p('n2-034','Describe doing something in one sustained burst.','一気に + predicate','Neutral','Emphasizes momentum or completion without substantial interruption.','This is not simply a synonym for suddenly.',[
['短い小説を[一気に]読み終えた。','I finished the short novel in one sitting.','Uninterrupted completion.'],
['階段を[一気に]駆け上がった。','I ran up the stairs in one burst.','Sustained movement.'],
['気温が[一気に]十度下がった。','The temperature dropped ten degrees in one go.','A rapid substantial change.']]),
p('n2-035','Show a parallel or contrasting aspect.','Plain clause / Nである / な-adjectiveな + 一方で','Neutral to formal','Can contrast groups or show two activities of one person.','Do not confuse 一方で with 一方だ, a continuing trend.',[
['利用者が増える[一方で]、職員は減っている。','While user numbers are rising, staff numbers are falling.','Contrasting simultaneous trends.'],
['彼女は研究する[一方で]、子ども向けの本も書いている。','Alongside her research, she writes books for children.','Parallel activities.'],
['ネットは便利な[一方で]、情報の確認が欠かせない。','The internet is convenient, but checking information is essential.','Two aspects of one subject.']]),
p('n2-036','Introduce a commonly used name or category.','いわゆる + N','Neutral to formal','Signals a familiar label, sometimes with distance from that label.','It does not itself prove the label is accurate.',[
['これは[いわゆる]発酵食品です。','This is what is known as a fermented food.','Introduces a category.'],
['彼は[いわゆる]朝型で、夜は早く寝る。','He is what people call a morning person and goes to bed early.','Uses a familiar description.'],
['[いわゆる]成功だけを目標にしたくない。','I do not want to aim only at so-called success.','Distances the speaker from a conventional label.']]),
p('n2-037','Mark the approach of an awaited decisive stage.','いよいよ + clause','Neutral','Often implies buildup, anticipation, or an intensifying situation.','Use 突然 for an event with no buildup.',[
['来週は[いよいよ]初めての発表会だ。','Next week is finally my first recital.','An anticipated occasion arrives.'],
['空が暗くなり、[いよいよ]嵐が近づいてきた。','The sky darkened, and the storm was now drawing near.','A developing situation becomes decisive.'],
['[いよいよ]出発の時間になった。','At last, it was time to leave.','The awaited moment.']]),
p('n2-038','Specify a domain in which a statement applies.','N + 上; read じょう','Formal or technical','Common with 制度, 法律, 安全, and 仕事; denotes a domain or viewpoint.','Do not read this suffix as うえ in compounds such as 法律上.',[
['安全[上]、この扉は閉めておく。','For safety reasons, this door is kept closed.','The relevant consideration is safety.'],
['法律[上]は問題がない。','There is no problem legally.','Limits the claim to the legal domain.'],
['仕事[上]、海外へ行くことが多い。','I often travel abroad for work.','Work-related circumstances.']]),
p('n2-039','Describe an appearance as though an unreal situation were true.','Plain clause + かのように; Nである + かのように','Neutral to literary','Often marks a vivid comparison rather than a factual claim.','Retain である after a noun in the standard formal pattern.',[
['彼は何も知らない[かのように]笑った。','He smiled as though he knew nothing.','Appearance does not establish the truth.'],
['湖は鏡である[かのように]空を映していた。','The lake reflected the sky as though it were a mirror.','A vivid comparison.'],
['昨日のことだった[かのように]覚えている。','I remember it as though it happened yesterday.','Describes the vividness of memory.']]),
p('n2-040','Describe a striking change immediately after an observed event.','Vた + かと思ったら','Neutral','Usually reports observed events, rather than the speaker’s deliberate sequence.','Use てから for an ordinary planned sequence.',[
['雨がやんだ[かと思ったら]、また降り始めた。','Just when I thought the rain had stopped, it started again.','A quick reversal.'],
['猫は起きた[かと思ったら]、すぐに眠ってしまった。','The cat woke up, then immediately fell asleep again.','A rapid observed change.'],
['電気がついた[かと思ったら]、突然消えた。','The light came on and then suddenly went out.','Closely successive events.']]),
p('n2-041','Place an event on the very boundary of another.','V dictionary + か + Vない + かのうちに','Neutral; descriptive','Uses the same verb twice and means almost before the first event is complete.','Do not use it for events separated by a substantial interval.',[
['席に着く[か]着か[ないかのうちに]、料理が運ばれてきた。','The food arrived almost before we had sat down.','The boundary of sitting down.'],
['ベルが鳴る[か]鳴ら[ないかのうちに]、子どもたちは外へ出た。','The children went outside almost as soon as the bell rang.','Barely any interval.'],
['目を閉じる[か]閉じ[ないかのうちに]、眠ってしまった。','I fell asleep almost before closing my eyes.','Immediate transition.']]),
p('n2-042','Describe a result contrary to what seemed helpful or likely.','かえって + clause','Neutral','The outcome runs against an expectation established by context.','Use むしろ for a preference that need not involve an unexpected result.',[
['詳しく説明したら、[かえって]混乱させてしまった。','My detailed explanation actually made things more confusing.','The helpful action backfires.'],
['心配して電話したのに、[かえって]心配された。','I called out of concern, but ended up making them worry about me.','Reversal of roles.'],
['少し離れて見た方が、[かえって]模様が分かりやすい。','The pattern is actually easier to see from a little farther away.','Contrary to the expected advantage of proximity.']]),
p('n2-043','Set a boundary in time, conditions, knowledge, or effort.','V dictionary / Vている / Vない + 限り; Nの + 限り','Neutral to formal','Meaning depends on the boundary: as long as, as far as, or to the limit.','State which kind of limit the context supplies.',[
['電車が動いている[限り]、帰る方法はある。','As long as the trains are running, there is a way home.','A continuing condition.'],
['私が知っている[限り]、この店は日曜も開いている。','As far as I know, this shop is open on Sundays too.','Limits the speaker’s knowledge.'],
['声の[限り]、助けを呼んだ。','I called for help at the top of my voice.','Uses the full available extent.']]),
p('n2-044','Say that an effort was worth making.','Vた / Nの + 甲斐がある','Neutral','The outcome gives value to the effort; 甲斐がない denies that value.','Use 甲斐 for an effort and its payoff, not simple ability.',[
['早起きした[甲斐があった]。美しい日の出が見えた。','Getting up early was worth it. I saw a beautiful sunrise.','A reward justifies effort.'],
['練習の[甲斐があって]、最後まで弾けた。','The practice paid off, and I played to the end.','Effort contributes to success.'],
['遠くまで来た[甲斐がある]景色だ。','This view makes the long journey worthwhile.','Evaluates the payoff.']]),
p('n2-045','Warn that an unwelcome possibility could become real.','Vます stem + かねない','Neutral to formal','Normally predicts a negative or concerning outcome.','Do not confuse かねない “might” with かねる “cannot readily”.',[
['その言い方は誤解を招き[かねない]。','That wording could lead to misunderstanding.','A communication risk.'],
['疲れたまま運転すると、事故を起こし[かねない]。','Driving while tired could cause an accident.','Warns of a serious consequence.'],
['確認を省けば、個人情報が漏れ[かねない]。','Skipping the checks could expose personal information.','An avoidable risk.']]),
p('n2-046','Politely state that an action is difficult to accept or perform.','Vます stem + かねる','Formal; service language','Often signals reluctance, policy limits, or inability to comply.','Use できない for straightforward lack of skill; かねない has a different meaning.',[
['個別の事情については、お答えし[かねます]。','We are unable to answer questions about individual circumstances.','A formal limit on disclosure.'],
['領収書がない場合、返金はいたし[かねます]。','Without a receipt, we are unable to issue a refund.','A policy-based refusal.'],
['その条件では、賛成し[かねます]。','Under those conditions, I cannot agree.','A considered refusal.']]),
p('n2-047','Evaluate something from a specified criterion.','N + から言うと / から言えば / から言って','Neutral','The noun supplies the basis of evaluation, often price, quality, or position.','Use a meaningful criterion rather than a physical departure point.',[
['値段[から言うと]、こちらの方が買いやすい。','In terms of price, this one is more affordable.','Price is the criterion.'],
['栄養[から言えば]、野菜も必要だ。','From a nutritional viewpoint, vegetables are needed too.','Evaluates nutritional balance.'],
['結論[から言うと]、計画は延期です。','To start with the conclusion, the plan is postponed.','Begins with the key judgment.']]),
p('n2-048','Emphasize a reason as precisely what makes the result true.','Plain clause + からこそ','Neutral; emphatic','こそ focuses the reason as especially decisive.','Do not use it when no causal emphasis is intended.',[
['大切に思う[からこそ]、本当のことを伝えた。','I told you the truth precisely because I care about you.','Care explains a potentially difficult action.'],
['失敗した[からこそ]、準備の大切さが分かった。','It was precisely because I failed that I understood the importance of preparation.','The difficult experience has a distinctive value.'],
['毎日続けた[からこそ]、ここまで来られた。','Continuing every day is exactly what brought me this far.','Highlights the decisive effort.']]),
p('n2-049','State a viewpoint or infer from observable evidence.','N + から見ると / から見れば / から見て','Neutral','The noun may be an observer or a clue supporting judgment.','Do not treat a viewpoint as objective proof.',[
['子ども[から見ると]、この階段はとても高い。','From a child’s perspective, these steps are very high.','An observer’s viewpoint.'],
['足跡[から見て]、誰かが先に来たようだ。','Judging from the footprints, someone seems to have arrived first.','Physical evidence supports an inference.'],
['経験者[から見れば]、簡単な作業かもしれない。','To an experienced person, it may be a simple task.','Evaluation depends on the observer.']]),
p('n2-050','Treat a fact or commitment as requiring a corresponding response.','Plain clause + からには; N / な-adjectiveである + からには','Firm; neutral to formal','Usually followed by duty, determination, or a strong expectation.','Use から alone for a neutral causal statement.',[
['参加すると決めた[からには]、準備をしよう。','Now that we have decided to take part, let us prepare.','A decision entails action.'],
['借りた[からには]、期限までに返すべきだ。','Since you borrowed it, you should return it by the deadline.','An action creates an obligation.'],
['代表である[からには]、皆の意見を聞きたい。','As the representative, I want to hear everyone’s views.','The role guides the response.']]),
p('n2-051','Use one telling detail as evidence for a wider judgment.','N + からして','Neutral; emphatic','Often means even this starting detail, suggesting more follows.','Do not assume the single example proves every wider claim.',[
['この店は入口[からして]おしゃれだ。','Even the entrance of this shop is stylish.','A first detail sets the impression.'],
['彼の説明は前提[からして]間違っている。','His explanation is wrong from its very premise.','Questions the starting foundation.'],
['名前[からして]、辛そうな料理だ。','Judging even by its name, the dish sounds spicy.','One clue suggests a broader character.']]),
p('n2-052','Judge from a viewpoint or a piece of evidence.','N + からすると / からすれば','Neutral','Can present someone’s perspective or the basis of an inference.','An inference needs evidence; a perspective is not universal fact.',[
['この足跡[からすると]、動物はかなり大きい。','Judging from these tracks, the animal is fairly large.','Infers from evidence.'],
['親[からすれば]、子どもの安全が一番だ。','From a parent’s perspective, a child’s safety comes first.','An interested party’s viewpoint.'],
['予算[からすると]、この案は難しい。','Given the budget, this proposal is difficult.','A practical criterion.']]),
p('n2-053','Reject an inference that a stated fact might invite.','Plain clause + からと言って','Neutral','Commonly followed by a negative or limited conclusion.','The premise may be true; it is the automatic conclusion that is rejected.',[
['高い[からと言って]、必ず長持ちするとは限らない。','A high price does not necessarily mean something will last.','Rejects a price-based assumption.'],
['一度失敗した[からと言って]、諦める必要はない。','Failing once is no reason to give up.','Rejects an excessive response.'],
['親しい[からと言って]、何を言ってもいいわけではない。','Being close does not mean you can say anything you like.','Sets limits despite the premise.']]),
p('n2-054','Strongly dismiss a possibility.','Vます stem + っこない','Casual; emphatic','Expresses the speaker’s conviction, often an exaggerated judgment.','Avoid in formal writing or when a respectful refusal is needed.',[
['一人でこの机を運べ[っこない]。','There is no way I can carry this desk alone.','A strongly denied possibility.'],
['そんな細かいこと、全部覚え[っこない]よ。','There is no way I can remember every tiny detail like that.','Conversational emphasis.'],
['黙っていたら、気持ちは伝わり[っこない]。','If you stay silent, your feelings will never get across.','Strong advice through impossibility.']]),
p('n2-055','Give direct advice about a useful action or restraint.','V dictionary / Vない + ことだ','Firm; often advisory','Usually advice from someone speaking with experience or authority.','May sound patronizing when directed at a superior.',[
['上達したいなら、短くても毎日練習する[ことだ]。','If you want to improve, practice every day, even briefly.','A recommended action.'],
['疲れている時は、無理をしない[ことだ]。','When you are tired, the thing to do is avoid overexerting yourself.','Advises restraint.'],
['道に迷ったら、早めに人に聞く[ことだ]。','If you get lost, ask someone before too long.','Practical guidance.']]),
p('n2-056','Predict behavior based on a person’s familiar character.','Nの + ことだから','Neutral','Usually relies on a character trait shared with the listener.','It is not a general substitute for every use of だから.',[
['慎重な彼女の[ことだから]、もう確認しただろう。','Knowing how careful she is, she has probably checked already.','Character supports a prediction.'],
['料理好きの父の[ことだから]、きっと喜んで作ってくれる。','Knowing my father, who loves cooking, he will gladly cook for us.','A familiar preference predicts behavior.'],
['責任感の強い森さんの[ことだから]、連絡なしには休まないはずだ。','Knowing responsible Mori, they would not miss work without contacting us.','Known character informs an expectation.']]),
p('n2-057','Express the great degree of a feeling or experience.','Question word + plain clause + ことか','Emotional; often written','Typically combines with どれほど, 何度, or どんなに.','This is an exclamation, not an ordinary request for an answer.',[
['帰る日をどれほど待った[ことか]。','How eagerly I waited for the day I could return!','Emphasizes a strong feeling.'],
['何度この坂を登った[ことか]。','How many times I have climbed this hill!','Exclaims over repeated experience.'],
['無事だと聞いて、どんなに安心した[ことか]。','What a relief it was to hear they were safe!','An emotional retrospective.']]),
p('n2-058','Describe an action occurring without another action.','V dictionary + ことなく','Formal or written','Often emphasizes uninterrupted conduct or an omitted action.','Attach to dictionary form, not Vない.',[
['彼は休む[ことなく]歩き続けた。','He kept walking without resting.','Uninterrupted action.'],
['誰にも告げる[ことなく]、町を離れた。','She left town without telling anyone.','An action is omitted.'],
['最後まで諦める[ことなく]取り組んだ。','We worked on it without giving up to the end.','Sustained determination.']]),
p('n2-059','Introduce the speaker’s emotional evaluation of a fact.','Emotion adjective / Vた + ことに','Neutral to formal','Often uses 驚いた, 困った, 嬉しい, 残念な.','Use な with a な-adjective, as in 残念なことに.',[
['驚いた[ことに]、鍵は冷蔵庫の中にあった。','To my surprise, the key was in the refrigerator.','Emotion frames the following fact.'],
['残念な[ことに]、展示は昨日で終わっていた。','Unfortunately, the exhibition had ended yesterday.','A regrettable discovery.'],
['うれしい[ことに]、昔の友人から手紙が届いた。','To my delight, a letter arrived from an old friend.','A welcome event.']]),
p('n2-060','Deny that one action or fact amounts to another.','Plain clause + ことにはならない','Neutral','Rejects equivalence or a claimed consequence.','This is different from a decision expressed with ことになる.',[
['謝っただけでは、責任を取った[ことにはならない]。','An apology alone does not amount to taking responsibility.','Rejects an insufficient substitute.'],
['資料を集めても、内容を理解した[ことにはならない]。','Collecting materials does not mean you have understood them.','Separates collection from understanding.'],
['黙っていたからといって、同意した[ことにはならない]。','Remaining silent does not constitute agreement.','Rejects an inference.']]),
p('n2-061','Criticize a contradiction between someone’s position and behavior.','Plain clause / Nの / な-adjectiveな + くせして','Casual; blaming','Targets an inconsistency and can sound insulting.','Use のに for a neutral unexpected contrast.',[
['知っている[くせして]、教えてくれない。','You know, yet you refuse to tell me.','An accusatory contradiction.'],
['自分も遅れた[くせして]、私だけを責めないで。','You were late too, so do not blame only me.','Challenges unfair criticism.'],
['大人の[くせして]、子どもに八つ当たりした。','Despite being an adult, he took his frustration out on a child.','Blames behavior inconsistent with a role.']]),
p('n2-062','Treat one alternative as tolerable compared with a worse one.','N / plain clause + ならまだしも','Neutral','The second situation is usually judged unacceptable or surprising.','Do not read it as approval of the first situation.',[
['十分[ならまだしも]、一時間は待てない。','Ten minutes might be tolerable, but I cannot wait an hour.','Compares acceptable and excessive duration.'],
['子ども[ならまだしも]、大人が知らないのは困る。','It might be understandable for a child, but an adult needs to know.','Different expectations for roles.'],
['雨[ならまだしも]、雪では自転車で行けない。','Rain might be manageable, but I cannot cycle in snow.','A worse condition rules out the plan.']]),
p('n2-063','Express a firm intention not to act or a negative prediction.','V dictionary + まい; group 2 also stem + まい','Formal, literary, or resolute','First-person contexts often mean “will not”; third-person contexts often mean “probably will not”.','する may become すまい; do not confuse prediction with prohibition.',[
['同じ失敗は二度と繰り返す[まい]。','I will never make the same mistake again.','A firm personal resolution.'],
['この雨では、客はあまり来る[まい]。','In this rain, few customers will probably come.','A negative prediction.'],
['もう人のうわさはす[まい]と決めた。','I decided not to gossip about people anymore.','The irregular する form.']]),
p('n2-064','Follow what circumstances, instructions, or impulses dictate.','V dictionary / V passive / Nの + ままに','Neutral to literary','Conveys yielding to a direction or doing freely as prompted.','Distinguish from a state left unchanged, as in 開けたまま.',[
['案内される[ままに]、奥の部屋へ進んだ。','I went into the back room as I was guided.','Follows another’s direction.'],
['心の[ままに]色を選んでみよう。','Let us choose colors as our hearts suggest.','Follows an inner impulse.'],
['思いつく[ままに]、言葉を紙に書いた。','I wrote words on paper as they came to me.','Unrestricted spontaneous action.']]),
p('n2-065','Completely negate a state or action.','全く + negative predicate','Neutral; emphatic','With a positive predicate, 全く can instead mean entirely or truly.','The negative ending is necessary for “not at all”.',[
['この話は[全く]知ら[ない]。','I know nothing at all about this story.','Complete absence of knowledge.'],
['二つの結果は[全く]一致してい[ない]。','The two results do not agree at all.','Complete disagreement.'],
['昨日は忙しくて、[全く]休め[なかった]。','I was so busy yesterday that I could not rest at all.','Negates any opportunity to rest.']]),
p('n2-066','Describe acting without regard for a circumstance.','N / plain clauseの + もかまわず','Neutral; often critical','The ignored factor would normally merit consideration.','It often implies disregard, rather than considerate indifference.',[
['彼は周囲の迷惑[もかまわず]大声で話した。','He spoke loudly without caring about the disturbance to others.','Ignores other people’s comfort.'],
['服がぬれるの[もかまわず]、子どもを助けに川へ入った。','She entered the river to help the child, heedless of getting her clothes wet.','Disregard can also show dedication.'],
['夜中なの[もかまわず]、工事が続いた。','Construction continued regardless of it being the middle of the night.','Ignores an inconvenient circumstance.']]),
p('n2-067','Recognize a reaction or consequence as entirely understandable.','Plain clause + のも当然だ; Vて + も当然だ','Neutral; evaluative','のも and ても acknowledge that the consequence is natural in context.','Do not confuse 当然 “natural or expected” with 同然 “practically equivalent”.',[
['地図が古いのだから、道に迷った[のも当然だ]。','With an old map like this, it is no wonder you got lost.','The circumstances explain the outcome.'],
['休まず走ったのだから、疲れる[のも当然だ]。','After running without a break, feeling tired is only natural.','A physical response is understandable.'],
['連絡を忘れたのだから、相手が不安になっ[ても当然だ]。','Since I forgot to contact them, it is understandable that they became anxious.','ても recognizes an unsurprising reaction.']]),
p('n2-068','Give a personal reason with an emotional or defensive tone.','Plain clause + もの / もん; often んだもの','Casual; expressive','Often sentence-final; もん is especially informal.','Avoid in formal explanations or respectful apologies.',[
['今日は歩きたくない。足が痛いんだ[もの]。','I do not want to walk today. My feet hurt, you see.','A personal justification.'],
['うれしいよ。ずっと欲しかったんだ[もん]。','Of course I am happy. I have wanted it for ages.','An affectionate informal reason.'],
['早く帰ろうよ。明日は試験なんだ[もの]。','Let us go home early. We have an exam tomorrow, after all.','Reason supports a request.']]),
p('n2-069','Reflect on a general tendency, memory, or strong impression.','Plain clause + ものだ; habitual memory uses Vた + ものだ','Reflective; neutral','The meaning depends on tense and context: general truth, recollection, or wonder.','Do not treat every ものだ as a past habit.',[
['人の好みは変わる[ものだ]。','People’s tastes do change.','A general observation.'],
['子どもの頃、川でよく遊んだ[ものだ]。','When I was a child, I used to play in the river a lot.','A fond recollection.'],
['時間がたつのは早い[ものだ]。','How quickly time passes!','Reflective wonder.']]),
p('n2-070','Explain an unavoidable or personal reason, often apologetically.','Plain clause / Nな / な-adjectiveな + ものだから','Conversational; explanatory','Often explains a past action and can sound like an excuse.','Use な, not だ, after nouns in the standard form.',[
['電車が止まった[ものだから]、遅れてしまいました。','The trains stopped, so I ended up arriving late.','An apologetic explanation.'],
['初めてな[ものだから]、勝手が分からなくて。','It is my first time, so I do not know how things work.','Explains inexperience.'],
['あまりに静かな[ものだから]、誰もいないと思った。','It was so quiet that I thought no one was there.','Explains a mistaken inference.']]),
p('n2-071','State a general norm against an action.','V dictionary + ものではない','Advisory; firm','Usually warns that an action is inappropriate; not a simple factual negation.','Can sound moralizing or patronizing.',[
['人の失敗を笑う[ものではない]。','You should not laugh at other people’s mistakes.','A social norm.'],
['見た目だけで人を決めつける[ものではない]。','You should not judge people by appearance alone.','Warns against a habit.'],
['借りた物を勝手に捨てる[ものではない]。','You should not throw away something you borrowed without permission.','General behavioral guidance.']]),
p('n2-072','Express that something has a strongly felt quality.','V dictionary / い-adjective / な-adjectiveな + ものがある','Neutral to formal','Often used for personal impressions such as moving, difficult, or convincing.','It means a felt quality, not possession of a physical object.',[
['彼女の言葉には心を動かす[ものがある]。','There is something moving about her words.','An emotional effect.'],
['この静けさには不思議な[ものがある]。','There is something mysterious about this silence.','A strongly felt quality.'],
['一人で全部背負うのは厳しい[ものがある]。','Taking it all on alone is quite demanding.','A considered evaluation.']]),
p('n2-073','Strongly reject an intention or a proposition.','Plain clause + ものか / もんか; Nな + ものか','Emotional; casual','Rhetorical question expresses a strong negative, not a real request.','Can sound confrontational; もんか is more colloquial.',[
['こんなことで諦める[ものか]。','I will not give up over something like this.','Determined refusal.'],
['何も聞かずに信じる[もんか]。','There is no way I will believe it without asking anything.','Strong colloquial rejection.'],
['一度の失敗で全部終わる[ものか]。','One failure certainly does not mean everything is over.','Rejects a pessimistic proposition.']]),
p('n2-074','Imagine an unlikely possibility or warn of a consequence.','Potential V + ものなら; V volitional + ものなら','Neutral; emphatic','Potential forms often express a wish or challenge; volitional forms often introduce danger.','Check the preceding verb form before interpreting the conditional.',[
['戻れる[ものなら]、あの日に戻りたい。','If I could, I would like to return to that day.','An unlikely wish.'],
['一人でできる[ものなら]、やってみてください。','If you really can do it alone, go ahead and try.','A challenge to a claimed ability.'],
['ここで火を使おう[ものなら]、大事故になる。','If anyone were to use fire here, it would cause a major accident.','Volitional form warns of a dangerous consequence.']]),
p('n2-075','Acknowledge a fact before presenting an unexpected limitation.','Plain clause / Nである / な-adjectiveな + ものの','Written; neutral to formal','Often concedes an action or state that did not deliver the expected result.','Use it for contrast, not a simple chronological sequence.',[
['本を買った[ものの]、まだ開いていない。','Although I bought the book, I have not opened it yet.','The expected follow-up did not happen.'],
['駅は近い[ものの]、坂が急だ。','Although the station is near, the hill is steep.','A benefit has a limitation.'],
['説明は丁寧な[ものの]、用語が難しい。','Although the explanation is thorough, the terminology is difficult.','Concedes one positive feature.']]),
p('n2-076','Qualify a previous statement with a relevant caveat.','もっとも + sentence','Neutral; often written','Introduces an exception, limitation, or corrective afterthought.','Distinguish conjunction もっとも from 最も “most”.',[
['参加は自由です。[もっとも]、予約は必要です。','Anyone may attend. Reservations are required, though.','Adds a requirement to a broad statement.'],
['歩いて行けます。[もっとも]、一時間ほどかかりますが。','You can walk there, though it takes about an hour.','Qualifies practical convenience.'],
['彼は料理が得意だ。[もっとも]、お菓子は作らない。','He is good at cooking, although he does not make sweets.','Limits the scope of a claim.']]),
p('n2-077','Describe coming close to an event or threshold.','もう少しで + Vところだった / potential / threshold','Neutral','With ところだった it often describes an event narrowly avoided.','The near event need not actually have happened.',[
['[もう少しで]電車に乗り遅れるところだった。','I nearly missed the train.','A narrowly avoided event.'],
['[もう少しで]頂上に着く。','We are almost at the summit.','Approaching a destination.'],
['[もう少しで]百点だったのに、一問間違えた。','I was so close to a perfect score, but got one question wrong.','Near a threshold.']]),
p('n2-078','Express an urge or reaction that cannot be suppressed.','Vない + ではいられない','Neutral','Describes inner compulsion rather than an external rule.','For する, use しないではいられない.',[
['その話を聞くと、笑わ[ないではいられない]。','Whenever I hear that story, I cannot help laughing.','An involuntary reaction.'],
['困っている姿を見て、助け[ないではいられなかった]。','Seeing them struggle, I could not help offering assistance.','An irresistible impulse.'],
['結末が気になって、続きを読ま[ないではいられない]。','I am so curious about the ending that I cannot stop myself reading on.','Curiosity creates an urge.']]),
p('n2-079','State that one condition is necessary before a result is possible.','Vない + ことには + negative clause','Neutral','The following clause is negative in meaning: cannot, impossible, or no result.','Do not follow it with an unrelated affirmative result.',[
['現場を見[ないことには]、判断でき[ない]。','I cannot judge without seeing the site.','Inspection is a prerequisite.'],
['本人に聞か[ないことには]、理由は分から[ない]。','We cannot know the reason without asking the person.','Information requires a direct question.'],
['道具がそろわ[ないことには]、修理を始められ[ない]。','We cannot start repairs until the tools are ready.','Resources are necessary first.']]),
p('n2-080','Place an action amid circumstances, or identify a comparison set.','Nの / plain clause + 中を; Nの + 中では','Neutral; polite with thanks','中を often acknowledges difficult circumstances; 中では restricts comparison to a group.','These share 中 but have different roles; choose the particle for the intended relation.',[
['お忙しい[中を]、来てくださってありがとうございます。','Thank you for coming despite being busy.','Acknowledges the visitor’s circumstances.'],
['雨が降る[中を]、選手たちは走り続けた。','The athletes kept running in the rain.','Action proceeds amid a situation.'],
['この三冊の[中では]、これが一番読みやすい。','Of these three books, this is the easiest to read.','Defines the comparison set.']]),
p('n2-081','Cautiously admit a limited possibility or degree.','い-adjective stem + くはない / くもない; Vない stem + なくはない / なくもない','Neutral; hesitant','Double negation offers qualified rather than enthusiastic agreement.','Do not interpret it as an unqualified positive.',[
['その気持ちは分から[なくもない]。','I can understand that feeling to some extent.','Partial sympathy.'],
['歩いて行け[なくはない]が、かなり遠い。','It is not impossible to walk there, but it is quite far.','A possible but unattractive option.'],
['この案も悪[くはない]。','This proposal is not bad either.','Restrained approval.']]),
p('n2-082','Say that an otherwise necessary action can be avoided.','Vなくて + 済む','Neutral','Often expresses relief at avoiding effort, cost, or trouble.','済む describes the situation being resolved without the action.',[
['電子版があるので、印刷し[なくて済む]。','There is a digital version, so we do not need to print it.','Avoids an unnecessary task.'],
['友人が迎えに来てくれて、タクシーを呼ば[なくて済んだ]。','A friend came to collect me, so I did not have to call a taxi.','A helpful alternative avoids expense.'],
['早めに連絡すれば、並ば[なくて済みます]。','If you contact us early, you will not have to queue.','An action prevents inconvenience.']]),
p('n2-083','Soften or object to an unnecessary action.','何も + Vなくてもいい / negative necessity expression','Conversational','This use means “there is no need to”; ordinary 何もない simply means nothing.','Do not confuse lack of necessity with prohibition.',[
['[何も]今日中に決め[なくてもいい]。','There is no need to decide today.','Removes unnecessary urgency.'],
['[何も]そんなに怒ら[なくてもいい]でしょう。','There is no need to get so angry.','Challenges an excessive reaction.'],
['[何も]全部一人で背負う必要は[ない]。','You do not have to shoulder everything alone.','Rejects an unnecessary burden.']]),
p('n2-084','Add supplementary information or indicate a continuing state.','なお + sentence / predicate','Formal or written','As a connector it adds a note; as an adverb it means still or further.','Distinguish supplementary なお from なおさら, which means all the more.',[
['受付は九時からです。[なお]、身分証をご持参ください。','Reception begins at nine. Please also bring identification.','An additional notice.'],
['原因は[なお]不明だ。','The cause remains unknown.','A state continues.'],
['改良すれば、[なお]使いやすくなる。','With improvements, it will become even easier to use.','A further increase in degree.']]),
p('n2-085','Express a strong obligation or necessity.','Vない stem + ねばならない; する → せねばならない','Formal or literary','Equivalent in core obligation to なければならない.','する becomes せねば, not しねば.',[
['約束は守ら[ねばならない]。','Promises must be kept.','A firm obligation.'],
['原因を確認せ[ねばならない]。','We must establish the cause.','Irregular する form.'],
['次の世代に森を残さ[ねばならない]。','We must preserve the forest for the next generation.','A strong collective duty.']]),
p('n2-086','Mark preparation or conduct at an important occasion.','N / V dictionary + にあたって','Formal; announcements','Typically used for significant starts or planned occasions.','Avoid for trivial daily events such as opening a drawer.',[
['開店[にあたって]、近所の方々に挨拶した。','Before opening the shop, we greeted the neighbors.','Preparations for a major start.'],
['留学する[にあたって]、保険を確認した。','In preparing to study abroad, I checked my insurance.','A planned life event.'],
['応募[にあたって]、注意事項をお読みください。','Please read the instructions before applying.','Formal procedural guidance.']]),
p('n2-087','Emphatically identify the essential cause or identity.','N + にほかならない','Formal; explanatory','Often equivalent to “nothing other than” or “precisely”.','Use にほかならない after a noun phrase, not directly after an adjective.',[
['成功の理由は、皆の協力[にほかならない]。','The reason for the success is none other than everyone’s cooperation.','Identifies the decisive cause.'],
['この手紙は感謝の表れ[にほかならない]。','This letter is precisely an expression of gratitude.','Defines the essential meaning.'],
['彼を動かしたのは好奇心[にほかならない]。','What drove him was nothing other than curiosity.','Emphasizes the true motivation.']]),
p('n2-088','Extend a statement beyond one named group.','N + に限らず','Neutral to formal','The second part includes a broader or additional set.','Make clear which wider group is included.',[
['週末[に限らず]、平日も混んでいる。','It is busy on weekdays as well as weekends.','Extends the time range.'],
['学生[に限らず]、社会人も応募できる。','Working adults as well as students can apply.','Broadens eligibility.'],
['この問題は都市[に限らず]、地方でも起きている。','This problem occurs in rural areas as well as cities.','Extends geographical scope.']]),
p('n2-089','Recommend something as the best choice, or restrict a category.','N / V dictionary / Vない + に限る','Neutral','Recommendation means “nothing beats”; notices may instead restrict eligibility.','Read context to distinguish a preference from an official restriction.',[
['暑い日は冷たい麦茶[に限る]。','Nothing beats cold barley tea on a hot day.','A strong personal recommendation.'],
['疲れた時は、早く寝る[に限る]。','When you are tired, going to bed early is best.','Recommends a course of action.'],
['参加は十八歳以上[に限る]。','Participation is limited to people aged eighteen or over.','A formal eligibility restriction.']]),
p('n2-090','Single out an exception, an unfortunate occasion, or someone trusted.','N + に限って','Neutral; emphatic','Can mean only on this occasion, especially at a bad moment, or “this person surely would not”.','Do not assume every に限って expresses a rule or recommendation.',[
['傘を持たない日[に限って]、雨が降る。','It always seems to rain precisely on days when I have no umbrella.','An unfortunate coincidence.'],
['本日[に限って]、入場料は無料です。','Admission is free today only.','A limited exception.'],
['彼女[に限って]、約束を忘れるはずがない。','She, of all people, would never forget a promise.','Strong trust in one person.']]),
p('n2-091','State that a condition does not affect the outcome.','N / paired alternatives + にかかわらず','Neutral to formal','Means regardless of; no particular result is predicted by the condition.','Distinguish にもかかわらず, which means despite a fact.',[
['年齢[にかかわらず]、どなたでも参加できます。','Anyone may participate regardless of age.','Age does not affect eligibility.'],
['雨かどうか[にかかわらず]、室内で行います。','We will hold it indoors whether it rains or not.','Weather does not change the location.'],
['好き嫌い[にかかわらず]、全員が同じ課題に取り組む。','Everyone works on the same task regardless of preference.','Preference does not change the requirement.']]),
p('n2-092','Indicate a matter connected to something significant.','N + にかかわる','Neutral to formal','Often concerns important matters such as life, trust, rights, or reputation.','Not every minor connection warrants this weighty expression.',[
['命[にかかわる]事故を防ぎたい。','We want to prevent life-threatening accidents.','An issue affecting life.'],
['これは会社の信用[にかかわる]問題だ。','This is a matter affecting the company’s credibility.','A significant consequence for reputation.'],
['個人情報[にかかわる]書類は厳重に管理する。','We carefully control documents relating to personal information.','Sensitive subject matter.']]),
p('n2-093','Express strong personal certainty about a conclusion.','Plain clause / N / な-adjective + に決まっている','Conversational; assertive','Presents the speaker’s conviction, which may still be wrong.','Do not use this assertive expression as evidence by itself.',[
['こんなに練習したのだから、上達する[に決まっている]。','After this much practice, of course you will improve.','Confident encouragement.'],
['鍵は机の上[に決まっている]と思ったが、違った。','I was certain the key was on the desk, but I was wrong.','Certainty can be mistaken.'],
['自分で作った料理の方がうれしい[に決まっている]。','Of course a meal you made yourself will make them happier.','A strongly asserted judgment.']]),
p('n2-094','Recommend the preferable option even if alternatives are possible.','V dictionary / Vない / い-adjective + に越したことはない; Nである + に越したことはない','Neutral','Means “it is best if”; usually practical advice rather than absolute necessity.','Do not confuse preference with a mandatory condition.',[
['準備は早い[に越したことはない]。','The earlier the preparation, the better.','A practical preference.'],
['荷物は少ない[に越したことはない]。','It is best to have less luggage.','A preferable degree.'],
['夜道は一人で歩かない[に越したことはない]。','It is best not to walk alone at night.','Recommends avoiding a risk.']]),
p('n2-095','Describe a response to a request, expectation, or support.','N + に応えて','Neutral to formal','The action answers an external wish or expectation.','Use に応じて for adjustment to changing conditions.',[
['要望[に応えて]、営業時間を延ばした。','In response to requests, we extended our opening hours.','Responds to a request.'],
['声援[に応えて]、選手は手を振った。','The athlete waved in response to the cheers.','Responds to support.'],
['期待[に応えられる]よう、準備を重ねたい。','I want to prepare thoroughly so I can live up to expectations.','Potential form expresses meeting expectations.']]),
p('n2-096','Add another factor to an existing one.','N + に加えて','Neutral to formal','The added factor points toward a combined evaluation or total.','Use a noun or nominalized clause before に加えて.',[
['家賃[に加えて]、管理費も必要だ。','In addition to rent, a maintenance fee is required.','Adds another cost.'],
['雨[に加えて]、風も強くなった。','On top of the rain, the wind grew stronger.','Accumulating adverse conditions.'],
['経験[に加えて]、丁寧な説明も評価された。','Along with her experience, her careful explanations were valued.','Adds another positive factor.']]),
p('n2-097','Base an action or judgment on an authoritative foundation.','N + に基づいて','Formal','Common foundations include facts, rules, data, and plans.','Use をもとに for material creatively adapted rather than a governing basis.',[
['調査結果[に基づいて]、計画を修正した。','We revised the plan on the basis of the survey results.','Data guides the decision.'],
['契約[に基づいて]、料金を請求します。','We will charge the fee in accordance with the contract.','A formal governing basis.'],
['事実[に基づいた]説明を求めた。','We requested an explanation based on facts.','Attributive form modifies a noun.']]),
p('n2-098','Orient movement, speech, or effort toward a target.','N + に向かって','Neutral','The target may be spatial, interpersonal, or an aim.','It marks direction; it does not guarantee reaching the target.',[
['鳥は海[に向かって]飛んでいった。','The bird flew toward the sea.','A physical direction.'],
['客[に向かって]失礼なことを言わないで。','Do not say rude things to a customer.','The person addressed.'],
['目標[に向かって]、少しずつ進もう。','Let us advance little by little toward our goal.','A figurative target.']]),
p('n2-099','Adjust something to match a condition or need.','N + に応じて','Neutral to formal','Often shows variation according to size, ability, circumstances, or demand.','Use に応えて for answering a request or expectation.',[
['人数[に応じて]、部屋の広さを変える。','We change the room size according to the number of people.','A quantity determines the adjustment.'],
['経験[に応じて]、担当する仕事が変わる。','Assigned work varies according to experience.','A person’s background affects assignment.'],
['必要[に応じて]、休憩を入れてください。','Please take breaks as needed.','Adjustment follows need.']]),
p('n2-100','Mark a formal occasion when a relevant action is taken.','N / V dictionary + に際して','Formal; ceremonial','Used for important events, transitions, or procedures, including difficult occasions.','Avoid for trivial everyday events.',[
['出発[に際して]、旅程を家族に伝えた。','On departure, I told my family the itinerary.','Preparation for an important event.'],
['契約する[に際して]、条件を確認した。','When entering the contract, I checked the terms.','A significant procedure.'],
['開会[に際して]、主催者が挨拶した。','At the opening, the organizer gave a greeting.','A formal ceremonial occasion.']]),
p('n2-101','Place an action before an important upcoming event.','N / V dictionary + に先立ち / に先立って','Formal','Usually describes preparation before a planned significant occasion.','Use 前に for an ordinary everyday sequence.',[
['公演[に先立ち]、避難経路をご案内します。','Before the performance, we will explain the evacuation routes.','Formal preliminary guidance.'],
['工事[に先立って]、周辺の住民に説明した。','Before construction, we explained the project to local residents.','Preparatory communication.'],
['調査を始める[に先立ち]、参加者の同意を得た。','Before beginning the study, we obtained the participants’ consent.','A necessary preliminary step.']]),
p('n2-102','Concede a condition while maintaining the main judgment.','Plain clause / N / な-adjective + にせよ / にしろ','Neutral to formal','Often means even if or granted that; noun attachment can also include である.','The concession does not cancel the main requirement.',[
['急ぐ[にせよ]、安全確認は必要だ。','Even if we are in a hurry, safety checks are necessary.','A requirement survives the concession.'],
['冗談[にしろ]、その言い方はよくない。','Even as a joke, that way of speaking is not acceptable.','Concedes a possible explanation.'],
['失敗した[にせよ]、挑戦したことには意味がある。','Even though it failed, making the attempt has value.','Acknowledges a fact while preserving an evaluation.']]),
p('n2-103','Give a conclusion that holds for either alternative.','AにしろBにしろ + common conclusion','Neutral','Alternatives may be nouns, predicates, or positive and negative forms.','The same conclusion must apply to both.',[
['行く[にしろ]行かない[にしろ]、今日中に知らせて。','Whether you go or not, let me know today.','Both choices require communication.'],
['電車[にしろ]バス[にしろ]、予約した方がいい。','Whether you take the train or the bus, you should book.','Two transport options share advice.'],
['簡単[にしろ]難しい[にしろ]、一度やってみよう。','Whether it is easy or difficult, let us try it once.','Difficulty does not change the proposal.']]),
p('n2-104','Imagine how a situation feels from another person’s position.','Person N + にしたら / にすれば','Neutral; empathetic','Presents that person’s viewpoint, often an inferred feeling.','Do not confuse the viewpoint with a conditional action using したら.',[
['子ども[にしたら]、一週間は長い。','For a child, a week is a long time.','An age-dependent perspective.'],
['作った人[にすれば]、使ってもらえるのが一番うれしい。','For the person who made it, having it used is the greatest pleasure.','Imagines the creator’s feelings.'],
['初めて来た人[にしたら]、この案内は分かりにくい。','For a first-time visitor, these directions are hard to understand.','Adopts a newcomer’s viewpoint.']]),
p('n2-105','Apply a shared judgment to two representative alternatives.','AにしてもBにしても + common judgment','Neutral','The alternatives illustrate a wider range, not necessarily an exhaustive list.','Do not put contradictory conclusions after the two examples.',[
['読む[にしても]書く[にしても]、漢字の知識は役立つ。','Whether reading or writing, knowing kanji is useful.','Two skills share a resource.'],
['海[にしても]山[にしても]、天気の確認は大切だ。','Whether going to the sea or the mountains, checking the weather matters.','Different destinations share a precaution.'],
['値段[にしても]使いやすさ[にしても]、この道具がよさそうだ。','In terms of both price and ease of use, this tool looks good.','Two evaluation criteria.']]),
p('n2-106','Follow a route, policy, intention, or agreed direction.','N + に沿って','Neutral to formal','Can be literal along a line or figurative in accordance with guidance.','For a strict legal basis, に基づいて may be more precise.',[
['川[に沿って]、遊歩道が続いている。','A walking path runs along the river.','A physical line.'],
['計画[に沿って]、作業を進めた。','We proceeded with the work according to the plan.','An agreed direction.'],
['お客様の希望[に沿った]提案を用意します。','We will prepare a proposal suited to the customer’s wishes.','Attributive form describes a matched proposal.']]),
p('n2-107','Express a confident formal conclusion.','Plain clause / N / な-adjective + に相違ない','Formal; written','Often based on a reasoned inference rather than direct observation.','This form expresses conviction, not absolute proof.',[
['この筆跡は、祖父のもの[に相違ない]。','This handwriting must be my grandfather’s.','A confident identification.'],
['皆の協力がなければ、完成しなかった[に相違ない]。','Without everyone’s help, it surely would not have been completed.','A strong retrospective inference.'],
['現場には深刻な問題がある[に相違ない]。','There must be a serious problem at the site.','Formal conviction about a situation.']]),
p('n2-108','Limit the significance or extent of something.','Plain clause / N + に過ぎない','Neutral to formal','Often means no more than, only, or merely.','The limitation is the speaker’s framing and may understate significance.',[
['これは私の意見[に過ぎない]。','This is only my opinion.','Limits authority.'],
['調査はまだ始まった[に過ぎない]。','The investigation has only just begun.','Limits progress.'],
['参加者は全体の一割[に過ぎなかった]。','Participants accounted for only one tenth of the total.','Limits quantity.']]),
p('n2-109','Link a change or action to another developing circumstance.','N / V dictionary + に伴って','Formal','Often presents accompanying changes or consequences.','Do not use it for every unrelated pair of simultaneous events.',[
['人口の増加[に伴って]、学校が増えた。','As the population increased, more schools were built.','A development brings an accompanying change.'],
['気温が上がる[に伴って]、雪が解け始めた。','As temperatures rose, the snow began to melt.','Linked physical changes.'],
['移転[に伴う]費用を計算した。','We calculated the costs associated with relocation.','Attributive form describes an accompanying factor.']]),
p('n2-110','Describe a recurring emotional response, or include opposite circumstances.','V dictionary + につけ; paired N / predicates + につけ','Reflective; neutral to written','Single use often means whenever; repeated use includes both occasions.','Interpret the pattern through its recurrence or paired alternatives.',[
['この曲を聞く[につけ]、故郷を思い出す。','Whenever I hear this song, I remember my hometown.','A recurring emotional trigger.'],
['写真を見る[につけ]、あの日の寒さがよみがえる。','Whenever I look at the photograph, the cold of that day returns to me.','Recollection triggered repeatedly.'],
['良い[につけ]悪い[につけ]、結果は伝えてほしい。','Whether good or bad, I want you to tell me the result.','Both alternatives are included.']]),
p('n2-111','State a formal reason or an amount per unit.','N + につき; quantity unit + につき','Formal; notices','The reason use means because of; the unit use means per.','Do not confuse it with topic marker について.',[
['本日は休業[につき]、電話対応はできません。','As we are closed today, we cannot answer calls.','A formal reason in a notice.'],
['一人[につき]二枚まで購入できます。','Each person may buy up to two tickets.','A per-person limit.'],
['清掃中[につき]、別の入口をご利用ください。','Cleaning is in progress; please use another entrance.','A notice gives the reason for a request.']]),
p('n2-112','Describe an extent covering a substantial time or area.','N + にわたって / にわたり; N + にわたる + N','Neutral to formal','Emphasizes the whole span, often a long period or broad range.','Use にかけて when rough endpoints matter more than full coverage.',[
['会議は三時間[にわたって]続いた。','The meeting continued for three hours.','The full duration.'],
['広い範囲[にわたって]停電が起きた。','A power outage affected a wide area.','Broad geographical extent.'],
['十年[にわたる]調査が終わった。','The decade-long investigation ended.','Attributive form describes the span.']]),
p('n2-113','Contrast a real circumstance with an unexpected result.','Plain clause / N / な-adjective + にもかかわらず','Formal','Often includes である after nouns and な-adjectives.','Do not confuse with にかかわらず, “regardless of”.',[
['雨[にもかかわらず]、多くの人が集まった。','Despite the rain, many people gathered.','The real condition did not prevent attendance.'],
['確認した[にもかかわらず]、間違いが残っていた。','Despite checking, errors remained.','An expected result failed to follow.'],
['初心者である[にもかかわらず]、見事に演奏した。','Despite being a beginner, she played beautifully.','Contrasts status with performance.']]),
p('n2-114','Mark a location, means, or endpoint in formal language.','N + にて','Formal; notices or announcements','Often replaces で in locations and means; not every で use transfers naturally.','Avoid treating it as a universal polite replacement for で.',[
['説明会は二階の会議室[にて]行います。','The information session will be held in the second-floor meeting room.','A formal venue announcement.'],
['結果はメール[にて]お知らせします。','We will notify you of the result by email.','Means of communication.'],
['本日の受付は、これ[にて]終了いたします。','Registration for today is now closed.','A conventional closing formula.']]),
p('n2-115','Recognize someone’s reaction as understandable.','Plain clause + のももっともだ','Neutral; empathetic','もっとも evaluates a response as reasonable under the circumstances.','It does not necessarily endorse every action caused by the feeling.',[
['何も聞かされていなければ、驚く[のももっともだ]。','If no one had told her anything, it is understandable that she was surprised.','Circumstances explain the reaction.'],
['三時間も待ったのだから、怒る[のももっともだ]。','After waiting three hours, it is understandable that he is angry.','Validates a feeling.'],
['初めての海外旅行なら、不安になる[のももっともだ]。','For a first trip abroad, feeling anxious is perfectly understandable.','A situation makes the emotion natural.']]),
p('n2-116','Identify the guidance, conditions, or authority under which something occurs.','N + の下で / の下に','Formal; descriptive','下 is read もと; often refers to supervision or shared conditions.','Use 下（した） for an ordinary physical location below something.',[
['先生の指導[の下で]、実験を行った。','We conducted the experiment under our teacher’s guidance.','Supervision.'],
['同じ条件[の下で]、二つの方法を比べた。','We compared the two methods under identical conditions.','Controlled circumstances.'],
['厳しい規則[の下で]、生活していた。','They lived under strict rules.','A governing framework.']]),
p('n2-117','Limit a claim to a particular domain or formal representation.','N + の上では','Neutral to formal','Common with 書類, 数字, 法律, and 理論; may contrast with practice.','This domain use is not the sequence Vた上で “after doing”.',[
['数字[の上では]、目標を達成している。','In numerical terms, we have met the target.','Limits the measure of success.'],
['書類[の上では]、まだ旧住所のままだ。','On the paperwork, the address is still the old one.','Formal record rather than actual residence.'],
['理論[の上では]可能だが、実行は難しい。','It is possible in theory, but difficult in practice.','Contrasts theoretical and practical domains.']]),
p('n2-118','Restrict a statement to one item in formal language.','N / plain clause + のみ','Formal; notices and writing','Often equivalent to だけ; can follow particles such as で.','It is more formal than ordinary spoken だけ.',[
['入口は東側[のみ]です。','The entrance is on the east side only.','A formal restriction.'],
['応募はメールで[のみ]受け付けます。','Applications are accepted only by email.','Restricts the method.'],
['今は回復を待つ[のみ]だ。','For now, all we can do is wait for recovery.','Only one action remains.']]),
p('n2-119','Expand a statement beyond the first named item.','N / plain clause / な-adjectiveである + のみならず','Formal or written','Often paired with も in the additional clause.','The additional statement should extend the same overall point.',[
['国内[のみならず]、海外でも評価された。','It was acclaimed abroad as well as at home.','Broadens the area.'],
['彼は研究する[のみならず]、後輩の指導も続けた。','He not only conducted research but continued mentoring junior colleagues.','Adds a parallel contribution.'],
['この道具は軽い[のみならず]、丈夫でもある。','This tool is not only light but also sturdy.','Adds another advantage.']]),
p('n2-120','Negate an action in literary or fixed expressions.','Vない stem + ぬ; する → せぬ','Literary; fixed phrases','A classical negative still used in expressions such as 知らぬ and 思わぬ.','For する use せぬ, not しぬ, which is a different verb.',[
['思わ[ぬ]ところで、昔の友人に会った。','I met an old friend in an unexpected place.','A common fixed adjective-like expression.'],
['知ら[ぬ]間に、庭の花が咲いていた。','The garden flowers had bloomed before I noticed.','A fixed expression for unnoticed change.'],
['見[ぬ]ふりをして通り過ぎた。','He passed by pretending not to see.','Literary negative in a familiar phrase.']]),
p('n2-121','Leave something out of an action or discussion.','N + 抜きで / 抜きにして','Neutral','Can omit an ingredient, participant, procedure, or consideration.','抜きにしても may mean even leaving that factor aside.',[
['今日は冗談[抜きで]話したい。','Today I want to talk seriously, without jokes.','Omits a usual conversational element.'],
['玉ねぎ[抜きで]作ってもらえますか。','Could you make it without onions?','An ingredient is omitted.'],
['値段を[抜きにして]も、この形が好きだ。','Even leaving the price aside, I like this shape.','Excludes a factor from evaluation.']]),
p('n2-122','Emphasize completing an action despite difficulty.','Vます stem + 抜く','Neutral; resolute','Often implies persistence through hardship until the end.','It means carrying through, not merely removing something.',[
['苦しくても、最後まで走り[抜いた]。','Even though it was hard, I ran all the way to the end.','Endurance through difficulty.'],
['何度も考え[抜いて]、この答えを選んだ。','After thinking it through thoroughly, I chose this answer.','Exhaustive mental effort.'],
['仲間と一緒に厳しい冬を生き[抜いた]。','Together with my companions, I survived the harsh winter.','Persists through adverse conditions.']]),
p('n2-123','Identify an event that initiates a significant new development.','N + を契機に / を契機として','Formal; reports','Often used for organizational or substantial changes.','For a casual personal trigger, をきっかけに is often more natural.',[
['事故[を契機に]、安全規則が見直された。','The accident prompted a review of safety rules.','A serious event initiates reform.'],
['移転[を契機に]、古い設備を一新した。','We used the relocation as an opportunity to replace the old equipment.','A major occasion starts renewal.'],
['国際大会[を契機として]、交流が広がった。','The international tournament led to wider exchanges.','A public event starts lasting development.']]),
p('n2-124','Center debate, conflict, or activity on a disputed topic.','N + をめぐって; N + をめぐる + N','Neutral to formal','Common with discussions, disputes, and competing interests.','Use について for a neutral topic without surrounding activity.',[
['新しい道路[をめぐって]、住民の意見が分かれた。','Residents were divided over the new road.','A controversial topic.'],
['予算[をめぐる]議論が続いている。','Debate over the budget continues.','Attributive form links the topic to debate.'],
['一枚の絵[をめぐって]、所有権が争われた。','Ownership of a painting was disputed.','Competing claims center on one object.']]),
p('n2-125','Use material or experience as the starting basis for something new.','N + をもとに / をもとにして','Neutral','Often describes creative adaptation or development from source material.','It need not mean every detail of the source is reproduced.',[
['祖母の話[をもとに]、短い小説を書いた。','I wrote a short novel based on my grandmother’s stories.','Creative adaptation.'],
['利用者の意見[をもとに]、画面を改善した。','We improved the screen using users’ feedback.','Information informs design.'],
['古い地図[をもとに]、昔の町を再現した。','We reconstructed the old town using an old map.','Reference material guides reconstruction.']]),
p('n2-126','Remove a specified exception from a broader statement.','N + を除いて; N + を除く + N','Neutral to formal','The rest of the relevant set is included.','Keep the exception clearly defined.',[
['月曜日[を除いて]、毎日見学できる。','You can visit every day except Monday.','An exception to opening days.'],
['送料[を除いた]金額を教えてください。','Please tell me the amount excluding shipping.','Attributive form describes an excluded cost.'],
['一部の地域[を除いて]、配送は翌日です。','Delivery is next day except in certain areas.','A limited geographical exception.']]),
p('n2-127','Say that a category does not limit eligibility or applicability.','N + を問わず','Formal; notices','Common with age, nationality, experience, time, and gender.','Use a category capable of variation, rather than an unrelated fact.',[
['経験の有無[を問わず]、応募できます。','You may apply whether or not you have experience.','Experience does not restrict eligibility.'],
['国籍[を問わず]、誰でも利用できる。','Anyone may use it regardless of nationality.','Nationality does not restrict access.'],
['昼夜[を問わず]、相談を受け付けています。','We accept inquiries day and night.','The service is not limited by time of day.']]),
p('n2-128','Make a formal request for someone’s action.','お + Vます stem + 願う; ご + Sino-Japanese N + 願う','Formal; service requests','Commonly ends 願います or 願えますか and uses established honorific forms.','Do not attach お mechanically to every verb or foreign word.',[
['こちらに[お]座り[願えますか]。','Would you please sit here?','A formal request for movement.'],
['申込書に[ご]記入[願います]。','Please fill out the application form.','ご with a Sino-Japanese action noun.'],
['少々[お]待ち[願います]。','Please wait a moment.','A conventional service request.']]),
p('n2-129','Add a further positive or negative factor with emphasis.','おまけに + clause','Conversational','The addition reinforces the same overall evaluation.','It often conveys a bonus or an extra burden, not a neutral contrast.',[
['この宿は安い。[おまけに]朝食もおいしい。','This inn is inexpensive, and the breakfast is delicious too.','An extra benefit.'],
['電車が遅れた。[おまけに]傘まで忘れた。','The train was late, and on top of that I forgot my umbrella.','An added inconvenience.'],
['道は狭いし、[おまけに]街灯もない。','The road is narrow, and there are no streetlights either.','Reinforces a negative assessment.']]),
p('n2-130','Present a likely conclusion without claiming certainty.','恐らく + clause; often だろう / はずだ','Neutral to formal','Marks probability rather than directly verified fact.','Do not pair it with an unjustified claim of absolute certainty.',[
['[恐らく]明日の朝には着くだろう。','It will probably arrive by tomorrow morning.','A tentative prediction.'],
['鍵は[恐らく]受付にある。','The key is probably at reception.','A likely location.'],
['この道は[恐らく]昔の街道だ。','This road is probably an old highway.','An informed but uncertain identification.']]),
p('n2-131','Warn of an undesirable possibility.','V dictionary / Nの + 恐れがある','Formal; reports and warnings','Normally concerns a negative outcome, not a welcome possibility.','Use 可能性がある for a neutral or positive possibility.',[
['強風で看板が落ちる[恐れがある]。','Strong winds may cause the sign to fall.','A physical hazard.'],
['このままでは水不足の[恐れがある]。','At this rate, there is a risk of a water shortage.','A developing adverse possibility.'],
['古い機器では、データが失われる[恐れがあります]。','With old equipment, there is a risk of losing data.','A formal caution.']]),
p('n2-132','Join items in a formal list.','N + 及び + N','Formal; administrative or technical','Corresponds to “and”; often joins items of comparable rank.','Use と or や in ordinary casual conversation.',[
['氏名[及び]住所をご記入ください。','Please enter your name and address.','A formal list of required information.'],
['館内[及び]敷地内は禁煙です。','Smoking is prohibited inside the building and on the grounds.','Two coordinated areas.'],
['水[及び]食料を備蓄している。','We keep reserves of water and food.','Two coordinated supplies.']]),
p('n2-133','Emphasize that an action is not done adequately.','ろくに + negative predicate','Conversational; often critical','Means not properly or barely, rather than complete nonexistence.','Usually requires a negative predicate.',[
['忙しくて、[ろくに]食事も取れ[なかった]。','I was so busy that I barely managed to eat.','Insufficient opportunity.'],
['説明を[ろくに]読まずに操作した。','I operated it without properly reading the instructions.','ず provides the negative.'],
['昨夜は[ろくに]眠れ[なかった]。','I barely slept last night.','Inadequate rest.']]),
p('n2-134','Introduce a fortunate fact or outcome.','幸いなことに + clause','Neutral to formal','The following information is welcome from the speaker’s viewpoint.','Do not use it for another person’s misfortune without a clear reason.',[
['[幸いなことに]、けが人はいなかった。','Fortunately, nobody was injured.','A welcome outcome after danger.'],
['[幸いなことに]、予備の鍵を持っていた。','Fortunately, I had a spare key.','A helpful circumstance.'],
['[幸いなことに]、雨は出発前にやんだ。','Fortunately, the rain stopped before departure.','Good timing.']]),
p('n2-135','Suggest an uncertain cause for a usually negative observation.','Plain clause / Nの / な-adjectiveな + せいか','Neutral','か makes the causal attribution tentative; often negative but not always.','Do not present a guessed cause as established fact.',[
['寝不足の[せいか]、頭が重い。','Perhaps because I have not slept enough, my head feels heavy.','Tentative physical cause.'],
['雨の[せいか]、客が少ない。','Perhaps because of the rain, there are few customers.','A plausible but unconfirmed cause.'],
['久しぶりに会った[せいか]、少し緊張した。','Perhaps because we had not met for a long time, I felt a little nervous.','Speculates about a feeling.']]),
p('n2-136','Value a special opportunity or effort.','せっかく + clause; often ので / なら / のに; せっかくの + N','Neutral','ので and なら make use of an opportunity; のに marks wasted effort or disappointment.','Choose the ending to show whether the opportunity is used or lost.',[
['[せっかく]海まで来たのだから、少し歩こう。','Since we have come all the way to the sea, let us take a short walk.','Makes use of a special opportunity.'],
['[せっかく]作ったのに、誰も食べなかった。','I went to the trouble of making it, but no one ate it.','Regrets wasted effort.'],
['[せっかく]の休日だから、ゆっくりしたい。','It is a precious day off, so I want to relax.','Values an unusual occasion.']]),
p('n2-137','Ask for or identify a minimum acceptable amount.','せめて + minimum; often だけ / でも','Neutral; pleading or hopeful','The minimum is less than the ideal but still worth securing.','It does not mean a maximum limit.',[
['[せめて]名前だけでも覚えて帰ってください。','Please at least remember my name before you leave.','A minimum request.'],
['忙しくても、[せめて]一日は休みたい。','Even if I am busy, I want at least one day off.','A modest desired minimum.'],
['[せめて]電話で無事を伝えよう。','Let us at least call to say we are safe.','The smallest useful action.']]),
p('n2-138','Promise an action immediately after a prerequisite is completed.','Vます stem + 次第','Formal; business or announcements','The second action is normally intentional and often future-oriented.','Use Vたら for an ordinary past sequence.',[
['届き[次第]、ご連絡します。','I will contact you as soon as it arrives.','A promised immediate follow-up.'],
['準備ができ[次第]、出発します。','We will leave as soon as we are ready.','A prerequisite controls the start.'],
['詳細が分かり[次第]、お知らせします。','We will let you know as soon as we have the details.','A formal commitment.']]),
p('n2-139','Make the result depend on a variable factor.','N + 次第で / 次第だ','Neutral','Often implies that changing the factor changes the outcome.','Unlike Vます stem + 次第, this use is not “as soon as”.',[
['天気[次第で]、行き先を変える。','We will change the destination depending on the weather.','A condition determines the choice.'],
['使い方[次第で]、長く使える。','It can last a long time depending on how you use it.','Method influences durability.'],
['参加するかどうかは、あなた[次第だ]。','Whether to participate is up to you.','A person controls the decision.']]),
p('n2-140','Describe a gradual change over time.','次第に + change predicate','Neutral to formal','Highlights incremental development, not an immediate jump.','Do not confuse the adverb 次第に with dependency marker 次第で.',[
['空が[次第に]明るくなった。','The sky gradually grew lighter.','A gradual physical change.'],
['練習するうちに、[次第に]自信がついた。','As I practiced, I gradually gained confidence.','A developing internal state.'],
['町の音が[次第に]遠ざかっていった。','The sounds of the town gradually faded into the distance.','Change unfolds over time.']]),
p('n2-141','Add a fact that strengthens the same evaluation.','しかも + clause','Neutral','Often highlights an additional striking feature.','Use a contrasting connector when the second fact points the other way.',[
['この鞄は軽い。[しかも]雨に強い。','This bag is light. What is more, it stands up well to rain.','Adds a second advantage.'],
['彼は遅刻した。[しかも]連絡もしなかった。','He was late. What is more, he did not contact us.','Adds a second criticism.'],
['駅が近く、[しかも]家賃が安い。','It is near the station, and the rent is low too.','Reinforcing features.']]),
p('n2-142','Add another item to an existing set of circumstances.','その上 + clause','Neutral','The additional item reinforces a positive or negative situation.','This conjunction is not a physical “on top of it”.',[
['部屋が広い。[その上]、窓から海が見える。','The room is spacious. On top of that, you can see the sea from the window.','Additional benefit.'],
['雨が降り、[その上]風も強くなった。','It started raining, and on top of that the wind grew stronger.','Accumulating difficult conditions.'],
['道具を貸してくれた。[その上]、使い方まで教えてくれた。','She lent me the tools. She even showed me how to use them.','Additional helpful action.']]),
p('n2-143','Connect a real fact to an outcome that contradicts expectation.','Sentence + それなのに + sentence','Neutral; often emotional','Refers back to the whole preceding circumstance.','Do not use it when the second result naturally follows the first.',[
['十分寝た。[それなのに]、まだ眠い。','I slept enough. Even so, I am still sleepy.','A condition fails to yield the expected result.'],
['何度も練習した。[それなのに]、本番で間違えた。','I practiced many times. Nevertheless, I made a mistake in the performance.','Disappointment despite preparation.'],
['天気予報は晴れだった。[それなのに]、朝から雨だ。','The forecast said it would be sunny. Yet it has rained since morning.','A contradiction with expectation.']]),
p('n2-144','Respond to newly stated circumstances with a proposal or conclusion.','Sentence + それなら + response','Conversational; neutral','Treats the listener’s information as the condition for a response.','Use それなのに for unexpected contrast, not それなら.',[
['今日は休みなの？[それなら]、一緒に散歩しよう。','You have today off? In that case, let us go for a walk.','New information enables a proposal.'],
['電車が止まったんだね。[それなら]、バスを調べよう。','So the trains have stopped. In that case, let us check the buses.','A situation prompts an alternative.'],
['辛い物が苦手ですか。[それなら]、こちらがお勧めです。','You do not like spicy food? Then I recommend this.','Adapts advice to new information.']]),
p('n2-145','Return to a topic with a strong reaction despite accepting the context.','それにしても + comment','Neutral; conversational','Often emphasizes surprise, excess, or concern after a concession.','It is not simply an additive equivalent of それに.',[
['夏だから暑い。[それにしても]、今日は特に暑い。','It is hot because it is summer. Even so, today is especially hot.','A degree exceeds expectations.'],
['準備に時間がかかるのは分かる。[それにしても]遅すぎる。','I know preparation takes time. Still, this is taking too long.','Concedes context but maintains criticism.'],
['[それにしても]、よく一人でここまで運べたね。','Still, I am amazed you managed to carry it all this way alone.','A reflective expression of surprise.']]),
p('n2-146','Introduce a recollection prompted by the conversation.','そう言えば + recalled information','Conversational','The current topic triggers something remembered.','It is not a formal statement that somebody said those exact words.',[
['[そう言えば]、駅前に新しい店ができたね。','Come to think of it, a new shop opened by the station.','A related recollection.'],
['[そう言えば]、まだお礼を伝えていなかった。','Come to think of it, I have not thanked them yet.','Remembers an unfinished action.'],
['旅行の話で思い出した。[そう言えば]、写真を見せていなかったね。','Talking about the trip reminded me: I have not shown you the photos.','The current topic prompts memory.']]),
p('n2-147','Present the consequence of a preceding action or assumption.','Sentence + そうすると + consequence','Neutral','Can describe a sequence or an inference from what was just said.','Unlike そう言えば, it develops a consequence rather than recalling a topic.',[
['このボタンを押してください。[そうすると]、画面が変わります。','Press this button. Then the screen will change.','An operational consequence.'],
['明日は店が休みです。[そうすると]、今日買う必要がありますね。','The shop is closed tomorrow. Then we need to buy it today.','An inference from new information.'],
['窓を開けた。[そうすると]、冷たい風が入ってきた。','I opened the window. Then a cold breeze came in.','A narrated consequence.']]),
p('n2-148','Give the outcome after a long or difficult process.','Vた / Nの + 末に','Neutral to formal','The outcome may be positive or negative; emphasizes the preceding process.','Use あげく for an explicitly regrettable result.',[
['何度も相談した[末に]、引っ越すことにした。','After many discussions, we decided to move.','A considered decision.'],
['長い交渉の[末に]、合意に達した。','After lengthy negotiations, we reached an agreement.','A successful outcome after effort.'],
['悩んだ[末に]、今回は応募を見送った。','After much deliberation, I decided not to apply this time.','A decision after uncertainty.']]),
p('n2-149','Deny even a small degree of a state.','少しも + negative predicate','Neutral; emphatic','Usually negates degree, change, or emotional response.','Use a negative predicate for “not in the slightest”.',[
['説明を聞いても、[少しも]安心でき[ない]。','Even after hearing the explanation, I do not feel reassured at all.','No degree of reassurance.'],
['祖父は昔と[少しも]変わってい[ない]。','My grandfather has not changed at all.','No noticeable change.'],
['難しい問題だが、[少しも]退屈では[ない]。','It is a difficult problem, but not at all boring.','Completely denies one evaluation.']]),
p('n2-150','Set a lower bound on an amount or a claim.','少なくとも + quantity / clause','Neutral','May state a numerical minimum or the narrowest claim the speaker can support.','It establishes a minimum, not an exact total.',[
['完成には[少なくとも]三日かかる。','Completion will take at least three days.','A minimum duration.'],
['[少なくとも]私は、その案に賛成だ。','At least I support that proposal.','Limits the claim to the speaker.'],
['[少なくとも]水だけは持っていこう。','Let us at least take water.','A minimum provision.']]),
p('n2-151','Require or describe action without delay.','直ちに + predicate','Formal; urgent notices','Often used for urgent responses, procedures, or immediate consequences.','It sounds firmer and more official than すぐ.',[
['異常を感じたら、[直ちに]使用を中止してください。','If you notice anything abnormal, stop using it immediately.','An urgent instruction.'],
['警報を聞き、全員が[直ちに]避難した。','On hearing the alarm, everyone evacuated immediately.','A prompt response to danger.'],
['確認が取れ次第、[直ちに]連絡する。','I will contact you immediately once confirmation is obtained.','Immediate action after a prerequisite.']]),
p('n2-152','Give an authoritative instruction using an older command form.','Vます stem + たまえ','Old-fashioned; authoritative','Often heard in fiction or speech from a superior; can sound condescending.','For ordinary polite requests, use てください.',[
['まずは落ち着いて話し[たまえ]。','First, calm down and tell me what happened.','An authoritative fictional voice.'],
['分からないことは遠慮なく聞き[たまえ]。','Ask freely if there is anything you do not understand.','Permission framed as an instruction from a superior.'],
['君の考えをここに書き[たまえ]。','Write your thoughts here.','A firm older-style command.']]),
p('n2-153','Explain that one cannot keep doing only the current activity.','Vて + ばかりはいられない','Neutral','Circumstances require moving on to another responsibility.','It is not simply a ban on the activity itself.',[
['悲しんで[ばかりはいられない]。明日の準備をしよう。','We cannot keep grieving. Let us prepare for tomorrow.','A responsibility requires moving forward.'],
['遊んで[ばかりはいられない]ので、午後は勉強する。','I cannot spend all my time playing, so I will study this afternoon.','Balances enjoyment with duty.'],
['人に頼って[ばかりはいられない]。自分でも調べよう。','I cannot keep relying on others. I will investigate it myself too.','Moves toward independent action.']]),
p('n2-154','Express determination to act even through an extreme measure.','Vて + でも','Neutral; emphatic','The measure is presented as a price the speaker is willing to pay.','Do not confuse it with ても “even if”.',[
['少し無理をし[てでも]、家族に会いに帰りたい。','I want to go home to see my family, even if it means pushing myself a little.','Determination accepts a cost.'],
['仕事を休ん[ででも]、この講演を聞きたい。','I want to attend this lecture even if I have to take time off work.','An exceptional measure is acceptable.'],
['借り[てでも]、必要な道具をそろえる。','I will get the necessary tools, even if I have to borrow them.','A means chosen despite inconvenience.']]),
p('n2-155','Show that a state has continued since a defining event.','Vて + 以来','Neutral to formal','The event sets the starting point of a continuing state or repeated activity.','For a one-off later event, use てから rather than て以来.',[
['この町に来[て以来]、毎朝川沿いを歩いている。','Since coming to this town, I have walked along the river every morning.','A repeated activity continues.'],
['卒業し[て以来]、彼には会っていない。','I have not seen him since graduation.','An absence continues from a starting point.'],
['その本を読ん[で以来]、宇宙に興味を持っている。','I have been interested in space since reading that book.','A lasting interest begins at an event.']]),
p('n2-156','Warn of a bad result if a state or behavior continues.','Vていて + は','Neutral; advisory','Often predicts trouble from continued behavior.','Do not use it as a neutral positive conditional without context.',[
['返事を待っ[ていては]、間に合わない。','If we keep waiting for a reply, we will not make it in time.','Waiting would cause failure.'],
['毎晩遅くまで働い[ていては]、体がもたない。','If you keep working late every night, your health will not hold up.','Continued behavior carries a risk.'],
['文句ばかり言っ[ていては]、何も変わらない。','If we keep doing nothing but complain, nothing will change.','A habit blocks progress.']]),
p('n2-157','Identify an action as essential to a meaningful result.','Vて + こそ','Neutral; emphatic','The action is a necessary foundation for the result’s value or realization.','It is stronger than a simple chronological “after”.',[
['実際に使っ[てこそ]、便利さが分かる。','Only by actually using it can you appreciate its convenience.','Experience is essential to understanding.'],
['互いに話し合っ[てこそ]、誤解を解ける。','Only by discussing it with each other can we resolve the misunderstanding.','Dialogue is the key prerequisite.'],
['健康でい[てこそ]、旅を楽しめる。','It is only when we are healthy that we can enjoy traveling.','A state supports the value of another action.']]),
p('n2-158','Describe an action as going to a notable or excessive extent.','Vて + まで','Neutral; often questioning or critical','Often questions whether the cost or sacrifice is justified.','Unlike てでも, it does not necessarily express positive determination.',[
['徹夜し[てまで]、今日終わらせる必要はない。','There is no need to stay up all night just to finish it today.','Questions an excessive cost.'],
['友人にうそをつい[てまで]、勝ちたくない。','I do not want to win at the cost of lying to my friends.','Rejects an unacceptable means.'],
['遠くから来[てまで]会いたかった理由を聞いた。','I asked why she had wanted to meet so badly that she came from far away.','Highlights the extent of effort.']]),
p('n2-159','Describe an overwhelming spontaneous feeling.','Vて / い-adjectiveくて / な-adjectiveで + ならない','Neutral; reflective','Common with emotions, perceptions, concern, and spontaneous thoughts.','Do not confuse this with prohibition てはならない.',[
['故郷の家族が心配[でならない]。','I am terribly worried about my family back home.','An uncontrollable concern.'],
['彼の言葉が本当のように思え[てならない]。','I cannot shake the feeling that what he said is true.','An insistent impression.'],
['子どもの頃の写真を見ると、懐かしく[てならない]。','When I see childhood photos, I feel overwhelmingly nostalgic.','A strong spontaneous emotion.']]),
p('n2-160','Express an intense feeling, sensation, or desire.','Vて / い-adjectiveくて / な-adjectiveで + たまらない','Neutral; expressive','Often conveys something hard to bear because of its intensity.','This is intensity, not a prohibition.',[
['のどが渇い[てたまらない]。','I am unbearably thirsty.','Strong physical sensation.'],
['結果が知りたく[てたまらない]。','I am desperate to know the result.','Intense desire.'],
['久しぶりに会えるので、うれしく[てたまらない]。','I am incredibly happy that we can finally meet again.','Intense positive emotion.']]),
p('n2-161','Judge a result as natural or deserved under the circumstances.','Vて / い-adjectiveくて / な-adjectiveで + 当然だ','Neutral; evaluative','May express a natural consequence or a norm of fairness.','It can sound judgmental when applied to another person’s failure.',[
['初めてなのだから、間違え[て当然だ]。','It is your first time, so mistakes are only natural.','Normalizes a beginner’s error.'],
['これだけ練習したのだから、自信があっ[て当然だ]。','After this much practice, feeling confident is only natural.','Effort supports the reaction.'],
['借りた物は返し[て当然だ]。','Of course you should return things you borrow.','A behavioral norm.']]),
p('n2-162','Warn that a condition leads to an undesirable outcome.','Vては / い-adjectiveくては / な-adjectiveでは / Nでは','Neutral','Often followed by a negative judgment such as 困る, 無理だ, or できない.','Do not confuse conditional ては with repeated-action ては…ては.',[
['今出発し[ては]、早すぎる。','If we leave now, it will be too early.','An unsuitable action.'],
['こんなに高く[ては]、毎日は買えない。','If it is this expensive, I cannot buy it every day.','A condition prevents a desired action.'],
['この人数[では]、作業が終わらない。','With this number of people, we will not finish the work.','A noun condition yields a bad result.']]),
p('n2-163','State that circumstances prevent continuing an action or state.','Vて + はいられない','Neutral; urgent','Usually means one cannot afford to keep doing something.','Do not interpret it only as physical inability.',[
['もう待っ[てはいられない]。先に出発しよう。','We cannot wait any longer. Let us leave first.','Urgency ends waiting.'],
['いつまでも落ち込ん[ではいられない]。','I cannot stay discouraged forever.','Circumstances require recovery.'],
['締め切りが近いので、のんびりし[てはいられない]。','The deadline is close, so we cannot take it easy.','A time constraint demands action.']]),
p('n2-164','State a firm prohibition.','Vて + はならない','Formal; rules or serious advice','Expresses that an action must not be done.','Unlike なくてはならない, this prohibits the action rather than requiring it.',[
['非常口の前に物を置い[てはならない]。','Objects must not be placed in front of the emergency exit.','A safety rule.'],
['人の個人情報を勝手に公開し[てはならない]。','You must not publish someone’s personal information without permission.','A firm ethical restriction.'],
['この失敗を忘れ[てはならない]。','We must not forget this failure.','Serious guidance rather than a posted rule.']]),
p('n2-165','Describe two actions recurring in a repeated cycle.','Vては…Vては…','Neutral; narrative','The recurring sequence is central; often the same pair repeats.','This is not the negative-result conditional in every ては sentence.',[
['書い[ては]消し、書い[ては]消して、手紙が進まない。','I keep writing and erasing, writing and erasing, and the letter goes nowhere.','A repeated revision cycle.'],
['波は寄せ[ては]返し、寄せ[ては]返していた。','The waves kept rolling in and receding, again and again.','A natural recurring cycle.'],
['子どもは積み木を積ん[では]崩し、積ん[では]崩して遊んだ。','The child played by repeatedly stacking blocks and knocking them down.','A repeated play sequence.']]),
p('n2-166','Connect simultaneous events or two concurrent roles.','V dictionary / N + と同時に; Nである + と同時に','Neutral to formal','Can mean at the same instant or simultaneously in another capacity.','Do not assume every example describes one split-second event.',[
['ドアが開く[と同時に]、猫が飛び出した。','The cat dashed out the instant the door opened.','Two closely simultaneous events.'],
['彼女は医師である[と同時に]、作家でもある。','She is both a doctor and a writer.','Two concurrent roles.'],
['卒業[と同時に]、一人暮らしを始めた。','I began living alone upon graduating.','A life transition coincides with another.']]),
p('n2-167','Give representative examples of a broader category.','AやB + といった + N','Neutral','The list is illustrative rather than exhaustive.','Do not interpret it as a closed list of all possibilities.',[
['京都や奈良[といった]古い都を訪ねた。','I visited old capitals such as Kyoto and Nara.','Examples of a category.'],
['紙や布[といった]身近な材料を使う。','We use familiar materials such as paper and cloth.','Illustrates suitable materials.'],
['登山や水泳[といった]運動が好きだ。','I like activities such as hiking and swimming.','Representative interests.']]),
p('n2-168','Describe a manner or paraphrase a way of understanding something.','Quoted content + というふうに','Neutral; explanatory','Can present wording, procedure, or an interpretation as one way of doing it.','It does not necessarily claim an exact verbatim quotation.',[
['「一日一行」[というふうに]、目標を小さく決めた。','I set a small target, something like “one line a day.”','A concrete way of framing a goal.'],
['まず洗い、次に切る[というふうに]進める。','We proceed by washing first and then cutting.','Summarizes a procedure.'],
['今回は練習だ[というふうに]考えると、気が楽になる。','If you think of this as practice, you can relax.','A way of interpreting the occasion.']]),
p('n2-169','Draw out the implication of a stated fact.','Plain clause + ということは','Neutral','Often introduces an inference, reformulation, or check of understanding.','An inferred implication may still need confirmation.',[
['今日は休館だ[ということは]、中には入れないんだね。','The museum is closed today, so that means we cannot go inside, right?','Checks a practical implication.'],
['全員そろった[ということは]、始めてもいいですね。','Everyone is here, which means we can begin, right?','Draws a procedural conclusion.'],
['鍵がない[ということは]、誰かが使っているのかもしれない。','The key is missing, which may mean someone is using it.','A tentative inference.']]),
p('n2-170','Evaluate something as the very definition of a quality.','Plain clause / N + というものだ','Neutral; emphatic','Common in judgments of fairness, kindness, reasonableness, or selfishness.','This evaluates a situation; it is not merely naming an object.',[
['何も説明せずに責めるのは、不公平[というものだ]。','Blaming someone without explaining anything is simply unfair.','An emphatic evaluation.'],
['困った時に助け合うのが、仲間[というものだ]。','Helping each other in trouble is what being companions means.','Defines the essence of a relationship.'],
['一人だけに任せるのは、無理[というものだ]。','Leaving it all to one person is simply unreasonable.','Judges a demand excessive.']]),
p('n2-171','Reject a simplistic general rule.','Plain clause + というものではない','Neutral; explanatory','Often argues that one condition alone does not guarantee a result.','It does not necessarily deny every individual instance.',[
['長く勉強すればいい[というものではない]。','It is not simply a matter of studying for a long time.','Quality also matters.'],
['安ければ売れる[というものではない]。','A low price alone does not guarantee sales.','Rejects a single-factor rule.'],
['謝れば全て元に戻る[というものではない]。','An apology does not simply put everything back as it was.','Limits an assumed remedy.']]),
p('n2-172','Present a reasoned interpretation or conclusion.','Plain clause + と考えられる','Formal; reports','Frames a conclusion as one supported by reasoning or evidence.','Provide a basis; the passive-style wording alone does not make a claim objective.',[
['この傷は、運搬中についた[と考えられる]。','This damage is thought to have occurred during transport.','A reasoned explanation.'],
['人口の変化が影響した[と考えられる]。','Population changes are considered to have had an effect.','An analytical inference.'],
['この方法は、小規模な調査に適している[と考えられる]。','This method is considered suitable for small-scale studies.','A cautiously framed evaluation.']]),
p('n2-173','Report a reason or piece of information without firm verification.','Plain clause + とかで; plain clause + とか','Conversational; hearsay','とかで often gives a vaguely recalled reported reason.','Do not use vague hearsay where verified information is required.',[
['橋の工事がある[とかで]、バスは遠回りした。','The bus took a detour because, apparently, there was work on the bridge.','A reported reason with uncertainty.'],
['妹は試験が近い[とかで]、今日は来ない。','My sister is not coming today because she apparently has exams soon.','A loosely reported explanation.'],
['あの店は来月移転する[とか]。','I hear that shop is moving next month.','Sentence-final hearsay.']]),
p('n2-174','Emphasize that something happened long before now.','とっくに + completed predicate','Conversational; emphatic','Often implies the listener is late to notice or ask.','Use with a completed event or already-established state.',[
['その映画は[とっくに]見たよ。','I saw that film ages ago.','A long-completed experience.'],
['受付は[とっくに]終わっている。','Registration closed long ago.','A completed event still affects the present.'],
['彼は[とっくに]出発したと思っていた。','I thought he had left long ago.','An earlier assumption about completion.']]),
p('n2-175','Describe an event that almost happened but was avoided.','V dictionary + ところだった','Neutral','Often paired with もう少しで, 危うく, or a counterfactual condition.','Context must distinguish a near miss from a literal stage of an action.',[
['危うく財布を忘れる[ところだった]。','I almost forgot my wallet.','A narrowly avoided mistake.'],
['あと一歩で、穴に落ちる[ところだった]。','One more step and I would have fallen into the hole.','A near accident.'],
['知らせがなければ、無駄に駅へ行く[ところだった]。','Without the notice, I would have gone to the station for nothing.','A counterfactual avoided action.']]),
p('n2-176','Locate an intervening event at a particular moment.','V dictionary / Vている / Vた + ところに','Neutral','An external event arrives at the stage described by ところ.','The preceding aspect shows whether the action is about to start, ongoing, or finished.',[
['出かけようとしていた[ところに]、電話が来た。','Just as I was about to go out, a call came.','An interruption before departure.'],
['一人で困っていた[ところに]、友人が来てくれた。','While I was struggling alone, a friend came to help.','A welcome intervention.'],
['片付けが終わった[ところに]、新しい荷物が届いた。','Just after we finished tidying up, another delivery arrived.','An event at the completion boundary.']]),
p('n2-177','Infer a situation from an observed action or fact.','Plain clause + ところを見ると','Neutral','The preceding observation provides a visible basis for inference.','It does not mean literally looking at a location.',[
['傘を持っている[ところを見ると]、外は雨らしい。','Judging by the umbrella she is carrying, it seems to be raining outside.','An observed object supports an inference.'],
['何度も時計を見る[ところを見ると]、急いでいるのだろう。','Judging by his repeatedly checking the time, he must be in a hurry.','Behavior reveals a likely state.'],
['皿が空になった[ところを見ると]、料理は好評だったようだ。','Judging by the empty plates, the food seems to have been popular.','A result supports an evaluation.']]),
p('n2-178','Maintain a conclusion despite a condition, or affirm a statement strongly.','い-adjectiveく / Vなく + とも; sentence-final とも','Written for concessions; affirmative ending can sound old-fashioned','Concessive とも is close to ても; sentence-final とも instead gives assurance.','Read the attachment carefully: the conditional and affirmative uses are different.',[
['道は遠く[とも]、必ず会いに行く。','Even if the journey is long, I will certainly go to see you.','くとも concedes a condition.'],
['声に出さなく[とも]、文字で気持ちを伝えられる。','Even without saying it aloud, you can convey your feelings in writing.','なくとも concedes the absence of an action.'],
['「手伝ってくれる？」「もちろん、手伝う[とも]。」','“Will you help?” “Of course I will.”','Sentence-final とも affirms confidently.']]),
p('n2-179','Deny even a single instance.','Minimum quantity + として + negative predicate','Formal; emphatic','Common with 一人, 一日, 一度, and 一つ.','The quantity is minimal and the conclusion must be negative.',[
['一人[として]反対する人はい[なかった]。','Not a single person opposed it.','Negates every individual instance.'],
['その日を一日[として]忘れたことは[ない]。','Not a single day has passed when I have forgotten that day.','Emphasizes uninterrupted memory.'],
['一つ[として]同じ形の石は[ない]。','Not a single stone has exactly the same shape.','No matching instance exists.']]),
p('n2-180','Accept a hypothetical premise without changing the main conclusion.','Plain clause / N / な-adjectiveだ + としても','Neutral','Means even assuming that; need not concede an established fact.','Unlike として, this is a concessive conditional.',[
['今出発した[としても]、間に合わない。','Even if we left now, we would not arrive in time.','An insufficient hypothetical action.'],
['無料だ[としても]、必要なければ受け取らない。','Even if it is free, I will not take it if I do not need it.','A condition does not alter the choice.'],
['反対された[としても]、理由は説明したい。','Even if they oppose me, I want to explain my reasons.','A resolution survives a hypothetical obstacle.']]),
p('n2-181','Describe simultaneous actions or a contradiction with awareness.','Vます stem + つつ; Vます stem + つつも','Written; formal','Simultaneous actions normally share a subject; つつも often concedes knowingly contrary behavior.','Use つつある for ongoing change, a different construction.',[
['音楽を聞き[つつ]、旅の計画を立てた。','I planned the trip while listening to music.','Two activities by one person.'],
['悪いと知り[つつ]、返事を先延ばしにした。','Knowing it was wrong, I kept putting off the reply.','Awareness conflicts with behavior.'],
['不安を感じ[つつも]、一歩を踏み出した。','Although feeling anxious, I took the first step.','A simultaneous feeling is overcome.']]),
p('n2-182','Describe a gradual change currently underway.','Vます stem + つつある','Formal; reports','Typically used with change processes rather than a static state or routine activity.','It is not a formal replacement for every Vている.',[
['町の景色は変わり[つつある]。','The townscape is changing.','An ongoing transformation.'],
['新しい技術が広まり[つつある]。','The new technology is gradually spreading.','A developing trend.'],
['失われた習慣が戻り[つつある]。','A lost custom is gradually returning.','A process of recovery.']]),
p('n2-183','State a firm duty or determination once a premise is accepted.','V dictionary / Vた + 上は','Formal; resolute','Commonly followed by responsibility, resolve, or an unavoidable consequence.','Read 上 as うえ; this is not the domain suffix じょう.',[
['約束した[上は]、必ず守る。','Having made the promise, I will certainly keep it.','A commitment entails responsibility.'],
['代表を務める[上は]、皆の意見を聞くべきだ。','If you serve as representative, you should hear everyone’s views.','A role creates a duty.'],
['秘密を知った[上は]、黙っているわけにはいかない。','Now that I know the secret, I cannot simply remain silent.','Knowledge creates a perceived obligation.']]),
p('n2-184','Treat the first item as obvious and add a wider one.','N + はもとより','Formal or written','Often paired with も in the second phrase.','The first item is included, not excluded or set aside.',[
['学生[はもとより]、地域の人も利用できる。','Local residents as well as students may use it.','Broadens access beyond the obvious group.'],
['味[はもとより]、盛り付けも美しい。','The food tastes good, of course, and its presentation is beautiful too.','Adds another merit.'],
['国内[はもとより]、海外からも注文が来る。','Orders come from overseas as well as from within the country.','Expands the geographical reach.']]),
p('n2-185','Set one issue aside to focus on another.','N + はともかく; question clause + はともかく','Neutral','Does not decide whether the first issue is good, true, or important.','Unlike はもとより, it suspends consideration rather than adding inclusively.',[
['値段[はともかく]、使い心地はいい。','Leaving the price aside, it feels good to use.','Focuses on a separate evaluation.'],
['行けるかどうか[はともかく]、まず予定を聞こう。','Whether we can go or not, let us first ask about the schedule.','Postpones one decision.'],
['見た目[はともかく]、味には自信がある。','Whatever it looks like, I am confident about the taste.','Separates appearance from quality.']]),
p('n2-186','Emphasize a very small amount or a faint degree.','わずかに + predicate; わずか + quantity','Neutral to formal','May describe a slight difference or a surprisingly small number.','Use わずかな before a noun and わずかに before a predicate.',[
['窓が[わずかに]開いていた。','The window was slightly open.','A small degree.'],
['二つの色は[わずかに]違う。','The two colors differ slightly.','A subtle difference.'],
['参加者は[わずか]三人だった。','There were only three participants.','An unexpectedly small count.']]),
p('n2-187','Place an event after some time or at the end of a developing process.','やがて + clause','Neutral; narrative','Can mean before long or eventually; the interval depends on context.','It does not promise immediate action in the way 直ちに does.',[
['[やがて]雨は雪に変わった。','Before long, the rain turned to snow.','A developing change.'],
['小さな苗は、[やがて]大きな木になる。','The little seedling will eventually become a large tree.','A long-term outcome.'],
['話し声がやみ、[やがて]部屋は静かになった。','The voices died away, and eventually the room fell quiet.','A narrative transition.']]),
p('n2-188','List assorted examples amid a busy, mixed, or emotional situation.','N / plain predicate + やら + N / plain predicate + やら','Neutral; conversational','Often conveys a jumble or mixed feelings; the list is not exhaustive.','Use と for a simple complete list without this mixed impression.',[
['引っ越しの日は、荷造り[やら]掃除[やら]で忙しかった。','On moving day, I was busy packing, cleaning, and everything else.','A jumble of tasks.'],
['うれしい[やら]寂しい[やら]で、うまく話せなかった。','I felt both happy and lonely and could not speak well.','Mixed emotions.'],
['机の上には、本[やら]紙[やら]が積んである。','Books, papers, and all sorts of things are piled on the desk.','An assorted untidy collection.']]),
p('n2-189','Indicate a striking degree or a strong inferred reason.','よほど / よっぽど + predicate','Neutral; よっぽど is casual','Can intensify a comparison or infer a great degree from behavior.','The strength of the inference remains the speaker’s judgment.',[
['何度も読み返すなんて、[よほど]気に入ったんだね。','You keep rereading it; you must really like it.','Behavior suggests a strong feeling.'],
['電車の方が歩くより[よっぽど]速い。','Taking the train is much faster than walking.','Emphatic casual comparison.'],
['[よほど]の理由がなければ、予定は変えない。','Unless there is a very good reason, I will not change the plan.','A substantial threshold.']]),
p('n2-190','Mark a starting point in formal notices or correspondence.','Time / place / source N + より','Formal','This use corresponds to から, rather than the comparison “than”.','Context distinguishes a source or start from a comparison standard.',[
['受付は午前九時[より]開始します。','Registration begins at nine in the morning.','A formal starting time.'],
['東京駅[より]臨時バスが出ます。','A special bus departs from Tokyo Station.','A departure point.'],
['詳しくは担当者[より]ご案内します。','The person in charge will provide further details.','A formal source of communication.']]),
p('n2-191','Say that no practical alternative remains.','V dictionary + よりほかない','Neutral to formal','Can also appear as よりほかはない or よりほかにない.','This expresses constrained choice, not necessarily a preferred action.',[
['鍵が見つからないので、管理人を呼ぶ[よりほかない]。','We cannot find the key, so we have no choice but to call the caretaker.','Other options are exhausted.'],
['今は結果を待つ[よりほかない]。','For now, there is nothing to do but wait for the result.','A situation permits only waiting.'],
['橋が流された以上、引き返す[よりほかない]。','Since the bridge has been washed away, we have no choice but to turn back.','An obstacle removes alternatives.']]),
p('n2-192','Warn that the described state would make a good result impossible.','Plain clause / Nの / な-adjectiveな + ようでは','Neutral; critical or advisory','Often followed by a negative consequence or concern about ability.','This evaluates a problematic state; it is not a neutral comparison.',[
['毎回遅れる[ようでは]、信用を失ってしまう。','If you are late every time, you will lose people’s trust.','Warns about a repeated habit.'],
['この程度で諦める[ようでは]、最後まで続かない。','If you give up over this much, you will not make it to the end.','Questions readiness.'],
['説明がこんなに曖昧な[ようでは]、誰も判断できない。','If the explanation is this vague, no one can make a judgment.','A state prevents an outcome.']]),
p('n2-193','Invite a group to commit to a shared action.','V volitional + ではないか / じゃないか','Formal or rhetorical; じゃないか is conversational','The よう in the reference label belongs to the volitional verb form.','Do not add よう after an already volitional form.',[
['まずは相手の話を聞こ[うではないか]。','Let us first listen to the other person’s side.','A rhetorical collective invitation.'],
['できることから始め[ようではないか]。','Let us begin with what we can do.','Group 2 volitional form.'],
['もう一度、一緒に考え[ようじゃないか]。','Let us think it through together once more.','Conversational encouragement.']]),
p('n2-194','Express indecision about whether to act.','V volitional + か + V dictionary + まいか','Neutral; reflective','The same action appears in affirmative intention and negative intention.','For する, するまいか or すまいか may occur; maintain matching action meanings.',[
['本当のことを言お[うか]言う[まいか]、迷っている。','I am undecided about whether to tell the truth.','Two opposed intentions.'],
['傘を持っていこ[うか]持っていく[まいか]、空を見て考えた。','I looked at the sky, wondering whether to take an umbrella.','A practical decision.'],
['その手紙を出そ[うか]出す[まいか]、一晩悩んだ。','I spent the night wondering whether to send the letter.','An unresolved personal choice.']]),
p('n2-195','Condense the essential point of preceding information.','要するに + summary','Neutral','The summary should faithfully represent the preceding details.','It is not a connector for adding an unrelated new fact.',[
['[要するに]、全員の確認が取れるまで始められない。','In essence, we cannot begin until everyone has confirmed.','States the core constraint.'],
['[要するに]、小さく試してから広げようという提案だ。','In short, the proposal is to test it on a small scale before expanding.','Condenses a longer proposal.'],
['[要するに]、時間より続けることが大切なんですね。','So, in essence, consistency matters more than duration.','Checks the main point understood.']]),
p('n2-196','Explain that circumstances force an unwanted or reluctant action.','Vない stem + ざるを得ない; する → せざるを得ない','Formal; explanatory','Usually implies reluctance or a lack of alternatives.','する becomes せざる, not しざる.',[
['大雪で道路が閉鎖され、予定を変え[ざるを得なかった]。','Heavy snow closed the roads, so we had no choice but to change our plans.','External conditions force a change.'],
['証拠を見て、間違いを認め[ざるを得なかった]。','After seeing the evidence, I had to admit my mistake.','Evidence compels acceptance.'],
['人手が足りず、延期せ[ざるを得ない]。','We are short-staffed and have no choice but to postpone.','Irregular する form.']]),
p('n2-197','Describe resolving a situation without an otherwise necessary action.','Vない stem + ずに済む; する → せずに済む','Neutral to formal','Often expresses relief or an avoided burden.','する becomes せず, not しず.',[
['予約していたので、待た[ずに済んだ]。','Because I had a reservation, I did not have to wait.','Avoids an inconvenience.'],
['バックアップがあり、入力し直さ[ずに済んだ]。','There was a backup, so I did not have to reenter the data.','Avoids repeating work.'],
['近くに図書館があるので、本を購入せ[ずに済む]。','There is a library nearby, so I do not have to buy books.','Irregular する negative.']]),
];
