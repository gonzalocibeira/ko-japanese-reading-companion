// Complete original variants: changes include every necessary surrounding form.
import expansionA from './comparisons-expansion-a.mjs';
import expansionB from './comparisons-expansion-b.mjs';
const e=(text,translation,note)=>({text,translation,note});
export default [
 {id:'topic-subject',pointIds:['n5-079','n5-011'],title:'Set a topic or identify a subject',variants:[
  {label:'は · topic',example:e('私[は]学生です。','As for me, I am a student.','Answering a general question about yourself.'),change:'は sets me as the topic and says something about me. It can also create a contrast.'},
  {label:'が · identification',example:e('私[が]学生です。','I am the one who is a student.','Identifying yourself among possible people.'),change:'が identifies me as the relevant subject. The focus depends on the question and context; this is not a universal replacement rule.'}
 ],question:'Someone asks which person is the student. Which response most directly identifies the person?',answers:['私が学生です。','私は学生です。'],correct:0,feedback:'In this identification context, が focuses on the person who fits. は is useful for introducing or contrasting a topic.'},
 {id:'place',pointIds:['n5-048','n5-005'],title:'Locate an action or a state',variants:[
  {label:'で · action',example:e('図書館[で]勉強しています。','I am studying at the library.','Locate the studying activity.'),change:'で marks where studying takes place. The predicate names an action.'},
  {label:'に · presence',example:e('図書館[に]います。','I am at the library.','Locate the person’s presence.'),change:'に marks the location of existence with いる. The predicate also changes: the sentence now states presence.'}
 ],question:'Which sentence says where the studying happens?',answers:['図書館で勉強しています。','図書館にいます。'],correct:0,feedback:'Action-location で locates studying. Existence-location に locates a person with いる.'},
 {id:'only',pointIds:['n5-003'],title:'Restrict a choice with だけ or しか～ない',variants:[
  {label:'だけ',example:e('朝はコーヒー[だけ]飲みます。','In the morning, I drink only coffee.','The drink is restricted to coffee.'),change:'だけ limits the drink to coffee. This use can accompany an affirmative predicate.'},
  {label:'しか～ない',example:e('朝はコーヒー[しか]飲み[ません]。','In the morning, I drink nothing but coffee.','Other drinks are excluded.'),change:'しか works with the negative predicate 飲みません in this construction. Together they emphasize excluding other options; the whole sentence still means only coffee.'}
 ],question:'What does コーヒーしか飲みません mean?',answers:['I drink nothing but coffee.','I do not drink coffee.'],correct:0,feedback:'しか and the negative predicate form a single restrictive construction. Negating the verb alone would give the wrong interpretation.'},
 {id:'reason',pointIds:['n5-023','n5-058'],title:'Present a reason as an assertion or background',variants:[
  {label:'から',example:e('雨が降っている[から]、中で待ちます。','I will wait inside because it is raining.','The speaker states a reason for a decision.'),change:'から presents the rain directly as the speaker’s reason. Tone and context still matter.'},
  {label:'ので',example:e('雨が降っている[ので]、中で待ちます。','Since it is raining, I will wait inside.','The same reason is framed as explanatory background.'),change:'ので frames the rain as background leading to the decision. It can soften an explanation; it does not make the statement automatically objective.'}
 ],question:'With a noun reason such as 休み, which form correctly precedes ので?',answers:['休みなので','休みだので'],correct:0,feedback:'Nouns and な-adjectives use な before ので: 休みなので. Verb clauses such as 降っている attach directly.'},
 {id:'conditions',pointIds:['n4-108','n4-005','n4-088','n4-054'],title:'Choose a conditional that fits the situation',variants:[
  {label:'と · regular consequence',example:e('雨が降る[と]、道が滑りやすくなります。','When it rains, the road becomes slippery.','A regular consequence.'),change:'と presents a predictable consequence. It ordinarily does not introduce a personal request or invitation as that consequence.'},
  {label:'ば · condition',example:e('雨が降れ[ば]、道が滑りやすくなります。','If it rains, the road becomes slippery.','Focus on the condition for the result.'),change:'ば foregrounds the condition under which the result holds. Restrictions on volitional continuations depend on the clause and subject.'},
  {label:'たら · once / if',example:e('雨が降っ[たら]、滑りにくい靴を履いてください。','If it rains, please wear shoes that do not slip easily.','An instruction for after the condition is met.'),change:'たら can introduce an instruction for when the condition is met. The full main clause changes to make that use visible.'},
  {label:'なら · given that',example:e('雨が降る[なら]、先に靴を替えましょう。','If it is going to rain, let us change shoes first.','A forecast becomes the premise for preparation.'),change:'なら takes the proposed rain as a premise. The preparation can occur before the rain itself.'}
 ],question:'Which construction naturally frames a forecast as a premise for doing something beforehand?',answers:['雨が降るなら、先に靴を替えましょう。','雨が降ると、先に靴を替えましょう。'],correct:0,feedback:'なら can take a proposed situation as a premise for advice or preparation. Regular-consequence と is unsuitable for this ordinary invitation.'},
 {id:'sou',pointIds:['n4-081','n4-082'],title:'Distinguish signs from reported information',variants:[
  {label:'降りそう · appearance',example:e('雨が[降りそう]です。','It looks about to rain.','A judgment from visible signs.'),change:'The verb stem 降り takes そう. The speaker judges an imminent event from signs.'},
  {label:'降るそう · hearsay',example:e('雨が[降るそう]です。','I hear it will rain.','Information from a forecast or another source.'),change:'The plain verb 降る takes hearsay そう. The source of the information changes even though the sentences look similar.'}
 ],question:'A forecast tells you rain is expected. Which form reports that information?',answers:['雨が降るそうです。','雨が降りそうです。'],correct:0,feedback:'Plain clause + そう reports heard or read information. Stem + そう describes appearance or imminent signs.'},
 {id:'kaneru',pointIds:['n2-045','n2-046'],title:'A polite inability and an undesirable possibility',variants:[
  {label:'かねる · cannot readily',example:e('この案には賛成し[かねます]。','I am unable to agree to this proposal.','A formal refusal or difficulty.'),change:'Stem + かねる expresses difficulty or inability to do something, often as a polite refusal.'},
  {label:'かねない · might',example:e('急いで決めると、失敗し[かねません]。','If we decide hastily, we might fail.','A warning about the same decision-making situation.'),change:'かねない expresses an undesirable possibility. It is not simply a stronger refusal. The complete example changes to show a suitable use.'}
 ],question:'What does 失敗しかねない mean?',answers:['It could result in failure.','It is impossible to fail.'],correct:0,feedback:'かねない warns that an undesirable result is possible. Its negative-looking form must be interpreted as the complete construction.'},
 {id:'circumstances',pointIds:['n1-197','n1-106'],title:'Make circumstances a reason or a setting',variants:[
  {label:'とあって · reason',example:e('厳しい状況[とあって]、慎重な対応が求められた。','Because the situation was difficult, a careful response was required.','A circumstance motivates the result.'),change:'とあって treats the noteworthy circumstances as the reason for what followed. It is common in explanatory reports.'},
  {label:'にあって · setting',example:e('厳しい状況[にあって]、慎重な対応が求められた。','In the difficult circumstances, a careful response was required.','A formal background setting.'),change:'にあって locates the event within the circumstances. It need not itself assert the causal link expressed by とあって.'}
 ],question:'Which construction explicitly treats the circumstance as the reason for the result?',answers:['とあって','にあって'],correct:0,feedback:'とあって presents a noteworthy circumstance as a cause. にあって sets the situation or environment in which something occurs.'},
 ...expansionA,...expansionB
];
