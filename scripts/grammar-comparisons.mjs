// Validate authored comparisons before the build writes any grammar assets.
export function validateGrammarComparisons(families,pointIds) {
 const nonempty=value=>typeof value==='string' && value.trim().length>0;
 const ids=new Set();
 if(!Array.isArray(families) || !families.length)throw new Error('Require comparison families');
 for(const family of families) {
  const fail=message=>{throw new Error(`Comparison ${family?.id ?? '(missing ID)'}: ${message}`);};
  if(!family || typeof family.id!=='string' || !/^[a-z0-9-]{1,64}$/.test(family.id) || ids.has(family.id))fail('invalid or duplicate ID');
  ids.add(family.id);
  for(const field of ['title','question','feedback'])if(!nonempty(family[field]))fail(`missing ${field}`);
  if(!Array.isArray(family.pointIds) || !family.pointIds.length || new Set(family.pointIds).size!==family.pointIds.length || family.pointIds.some(id=>!pointIds.has(id)))fail('invalid canonical point links');
  if(!Array.isArray(family.variants) || family.variants.length<2)fail('require at least two variants');
  const labels=new Set(),sentences=new Set();
  for(const variant of family.variants) {
   if(!variant || !nonempty(variant.label) || labels.has(variant.label) || !nonempty(variant.change))fail('invalid variant label or explanation');
   labels.add(variant.label);
   const example=variant.example;
   if(!example || !nonempty(example.text) || !nonempty(example.translation) || !nonempty(example.note))fail('incomplete example');
   const sentence=example.text.replace(/\[([^\[\]]+)\]/gu,'$1');
   if(sentence===example.text || /[\[\]]/u.test(sentence))fail('missing or unbalanced construction spans');
   if(sentences.has(sentence))fail('variants must have distinct sentences');
   sentences.add(sentence);
   if(example.readings && (typeof example.readings!=='object' || Array.isArray(example.readings) || Object.entries(example.readings).some(([surface,reading])=>!surface || !sentence.includes(surface) || !nonempty(reading) || /[^\p{Script=Hiragana}\p{Script=Katakana}ー]/u.test(reading))))fail('invalid contextual reading');
  }
  if(!Array.isArray(family.answers) || family.answers.length<2 || family.answers.some(answer=>!nonempty(answer)) || new Set(family.answers).size!==family.answers.length || !Number.isInteger(family.correct) || family.correct<0 || family.correct>=family.answers.length)fail('invalid activity answers');
 }
}
