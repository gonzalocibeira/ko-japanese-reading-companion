// Original Kō Sentence Lens variants. All substitutions are complete sentences.
const e=(text,translation,note,readings)=>({text,translation,note,...(readings?{readings}:{})});
export default [
 {
  id:'concession',
  title:'An unexpected fact or a condition that changes nothing',
  pointIds:['n4-062','n4-107'],
  variants:[
   {
    label:'のに · actual contrast',
    example:e('電車が遅れ[たのに]、会議に[間に合いました]。','Although the train was delayed, I made it to the meeting.','You are describing a delay that really happened and the unexpectedly successful arrival.'),
    change:'のに treats the delay as an established fact and presents the arrival as contrary to what that fact would suggest. The completed main predicate 間に合いました reports the actual result. This is concessive のに, not the のに used for a tool’s purpose or usefulness.'
   },
   {
    label:'ても · even if',
    example:e('電車が遅れ[ても]、会議に[間に合います]。','Even if the train is delayed, I will make it to the meeting.','Before traveling, you reassure someone that your schedule allows enough time.'),
    change:'ても keeps the conclusion valid under the delay condition. Here the nonpast main predicate makes it a reassurance about a possible delay, so both predicates change. ても can also concede a real event; it does not always mean hypothetical. Swapping it for のに here would present the delay as fact and change the speaker’s stance.'
   }
  ],
  question:'Which version reports a delay that actually happened and an unexpectedly successful arrival?',
  answers:['電車が遅れたのに、会議に間に合いました。','電車が遅れても、会議に間に合います。'],
  correct:0,
  feedback:'The のに version presents both the delay and successful arrival as facts. In the ても version, the speaker says that a possible delay will not alter the outcome. In other contexts, ても can also refer to an actual event.'
 },
 {
  id:'inference',
  title:'Share information or express your own impression',
  pointIds:['n4-070','n4-125','n4-044'],
  variants:[
   {
    label:'らしい · apparently',
    example:e('駅前のパン屋は、今日は休み[らしい]。','Apparently, the bakery by the station is closed today.','A neighbor mentioned that the bakery was taking a day off; you pass on the information tentatively.'),
    change:'らしい can present information gathered from elsewhere, as it does here, and can also express an inference from signs. A noun such as 休み attaches directly: 休みらしい. This lens concerns reporting and inference, not the separate “typical of” use in 春らしい.'
   },
   {
    label:'ようだ · considered impression',
    example:e('駅前のパン屋は、今日は休み[のようだ]。','It seems that the bakery by the station is closed today.','You reach the shop, see the dark interior, and find the door locked; you draw a conclusion.'),
    change:'ようだ presents the speaker’s judgment from the situation. The noun now needs の: 休みのようだ. The contrast is the chosen basis and framing of this report, not a rule that らしい can never use direct clues or that ようだ guarantees certainty.'
   },
   {
    label:'みたいだ · conversational impression',
    example:e('駅前のパン屋は、今日は休み[みたいだ]。','Looks like the bakery by the station is closed today.','You share the same conclusion with a friend in an ordinary conversation.'),
    change:'みたいだ is a conversational way to give an impression similar to ようだ here. It attaches directly to the noun: 休みみたいだ. The evidence need not change, and the form does not impose a fixed confidence ranking. In a formal report, ようだ is generally a better fit.'
   }
  ],
  question:'When the same visible clues support 休みのようだ and 休みみたいだ, what does choosing みたいだ change most clearly?',
  answers:['It makes the phrasing more conversational without requiring different evidence.','It turns the impression into a confirmed fact.','It requires the speaker to have heard the information from someone else.'],
  correct:0,
  feedback:'みたいだ is conversational and can express the same inference. ようだ, らしい, and みたいだ are not three fixed percentages of certainty; context and the information used matter.'
 },
 {
  id:'qualified-denial',
  title:'Reject an inference or deny a guarantee',
  pointIds:['n3-167','n3-153'],
  variants:[
   {
    label:'わけではない · correct a conclusion',
    example:e('高い品物は、必ず長持ちする[わけではない]。','A high price does not mean an item will always last a long time.','Someone has treated an expensive price as proof of durability; you correct that conclusion.'),
    change:'わけではない rejects the conclusion that a high price guarantees durability. It need not deny that some expensive items last well. In this generalization context, it overlaps substantially with とは限らない; the contrast is how the speaker frames the correction.'
   },
   {
    label:'とは限らない · allow exceptions',
    example:e('高い品物は、必ず長持ちする[とは限らない]。','Expensive items do not necessarily last a long time.','You warn a shopper that price alone is not a reliable rule.'),
    change:'とは限らない denies that the rule holds without exception. Here it can replace わけではない with a closely related meaning. The overlap has limits: 嫌いなわけではない can reject “I dislike it” as an explanation; 嫌いだとは限らない instead leaves that dislike uncertain rather than straightforwardly denying it.'
   }
  ],
  question:'What can you safely conclude from either sentence about expensive items?',
  answers:['Price alone does not guarantee durability; some expensive items may still last well.','Every expensive item wears out quickly.','The speaker has proved that cheaper items always last longer.'],
  correct:0,
  feedback:'Both versions reject the blanket guarantee. Neither says that every expensive item is poor or that every cheaper item is better. わけではない also has explanatory-correction uses that do not freely substitute with とは限らない.'
 },
 {
  id:'unexpected-inclusion',
  title:'Include a surprising extreme case',
  pointIds:['n3-099','n5-029'],
  variants:[
   {
    label:'さえ · even this case',
    example:e('この難問には、先生[さえ]答えられなかった。','Even the teacher could not answer this difficult question.','You expected the teacher to manage a question the learners found difficult.'),
    change:'さえ selects the teacher as a striking case: if even this knowledgeable person could not answer, the difficulty is remarkable. さえ does not always require a negative predicate, and this is not the sufficient-condition construction さえ〜ば.'
   },
   {
    label:'まで · extends even to',
    example:e('この難問には、先生[まで]答えられなかった。','Even the teacher could not answer this difficult question.','The group unable to answer extends unexpectedly to the teacher as well.'),
    change:'Inclusion まで extends the scope even to the teacher, beyond the people you would normally expect. Both variants work in this scene; there is no universal stronger-or-weaker ranking. This is an additional “even” use of まで, distinct from an endpoint such as 五時まで and from an extreme measure such as 借りてまで.'
   }
  ],
  question:'What does 先生まで答えられなかった add in this scene?',
  answers:['The people unable to answer include even the teacher, unexpectedly.','The teacher had until a stated deadline to answer.','The teacher answered only after all the learners had answered.'],
  correct:0,
  feedback:'まで includes the teacher as an unexpected extension of the group. It does not set a deadline here. さえ also highlights the surprising teacher case, but foregrounds it as a telling extreme example.'
 },
 {
  id:'opportunity-window',
  title:'Use an opportunity before it changes or act within an interval',
  pointIds:['n3-160','n4-002'],
  variants:[
   {
    label:'うちに · before the opportunity changes',
    example:e('父が出かけている[うちに]、誕生日の飾りを作ろう。','Let us make the birthday decorations while Dad is still out.','You are preparing a surprise and want to finish before he comes back.'),
    change:'うちに makes Dad’s absence an opportunity that will end. The aim is to act before that state changes. It does not itself state an exact duration or require panic; the surprise-party context supplies the reason to finish now.'
   },
   {
    label:'間に · within that interval',
    example:e('父が出かけている[間に]、誕生日の飾りを作ろう。','Let us make the birthday decorations during the time Dad is out.','His outing gives you a time window in which to make the decorations.',{'間に':'あいだに'}),
    change:'間に places the action within the outing interval. It can also describe using an opportunity, so both versions are natural here; うちに more strongly foregrounds doing it before the situation changes. They are not interchangeable everywhere: 忘れないうちに naturally means before forgetting. The gradual-change use of うちに is outside this comparison.'
   }
  ],
  question:'Which interpretation best captures the extra focus of うちに in the surprise-party scene?',
  answers:['Make use of Dad’s absence before he returns and the opportunity changes.','Keep making decorations continuously for every moment of his absence.','Wait until Dad has returned, then start the decorations.'],
  correct:0,
  feedback:'うちに foregrounds acting while the useful state still holds. 間に locates an event within a time interval; it does not require that the action fill the entire interval. Both work naturally for these decorations.'
 }
];
