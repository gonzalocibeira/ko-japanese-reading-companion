// Original lesson modules are the sole runtime content source. No network access.
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import kuromoji from 'kuromoji';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import comparisonSource from '../data/grammar/comparisons.mjs';
import {validateGrammarComparisons} from './grammar-comparisons.mjs';

const groups={time:/time|ongoing|completion|simultaneous|sequence|before|after|duration|occasion|recurr|habit|start|finish|continu|past|future|experience|earlier|later|again|sudden/i,reasons:/reason|cause|because|consequence|thanks|result|outcome/i,conditions:/condition|unless|if |hypothe|provided|regardless/i,comparison:/compar|contrast|limit|only|degree|extent|preference|example|alternative|similar|same|different|excess|restrict/i,certainty:/certain|expect|predict|infer|seem|evidence|possib|likely|appear|assum|report|hear|denial|deny|suppos|unlikely|impossib/i,'wishes and obligations':/wish|want|desire|oblig|must |necess|permission|prohibit|advise|advice|recommend|intend|intention|need|request|invite|invitation|proposal|propose|offer|determination/i,'connecting ideas':/connect|add |list|topic|identify|include|clarif|explain|restate|quote|refer|route|mark|subject|object|purpose|method/i,'social tone':/polite|respect|humble|honorific|feeling|reaction|emphasi|agreement|confirm|critic|regret|admiration|surprise|modest|courteous/i};
const hiragana=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
const coverage=JSON.parse(await readFile('data/grammar/coverage.json','utf8'));
const tokenizer=await new Promise((resolve,reject)=>kuromoji.builder({dicPath:'node_modules/kuromoji/dict/'}).build((error,value)=>error?reject(error):resolve(value)));
const aliasMap={'n5-053':'n5-046'};
validateGrammarComparisons(comparisonSource,new Set(coverage.entries.map(row=>row.reference).filter(id=>!aliasMap[id])));
function annotate(text,overrides={}) {
 const keys=Object.keys(overrides).sort((a,b)=>b.length-a.length);
 if(keys.length) {
  const expression=new RegExp(keys.map(key=>key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gu');
  const result=[];let cursor=0;
  for(const match of text.matchAll(expression)) {
   result.push(...annotate(text.slice(cursor,match.index)));result.push({text:match[0],reading:hiragana(overrides[match[0]])});cursor=match.index+match[0].length;
  }
  if(cursor){result.push(...annotate(text.slice(cursor)));return result;}
 }
 const result=[];let cursor=0;
 for(const token of tokenizer.tokenize(text)) {
  const start=text.indexOf(token.surface_form,cursor);if(start<0)throw new Error('Tokenizer alignment failed');
  if(start>cursor)result.push({text:text.slice(cursor,start)});cursor=start+token.surface_form.length;
  const segment={text:token.surface_form};
  const reading=overrides[token.surface_form] ?? token.reading;
  if(/[\p{Script=Han}]/u.test(segment.text) && reading && reading!=='*')segment.reading=hiragana(reading);
  if(token.word_type==='KNOWN' && ['名詞','動詞','形容詞','副詞'].includes(token.pos) && token.pos_detail_1!=='非自立')segment.lemma=token.basic_form && token.basic_form!=='*'?token.basic_form:token.surface_form;
  result.push(segment);
 }
 if(cursor<text.length)result.push({text:text.slice(cursor)});return result;
}
function example(raw,point) {
 if(!raw || !raw.translation?.trim() || !raw.note?.trim() || typeof raw.text!=='string')throw new Error(`${point.id}: incomplete example`);
 const segments=[];let cursor=0,count=0;
 for(const match of raw.text.matchAll(/\[([^\[\]]+)\]/gu)) {
  segments.push(...annotate(raw.text.slice(cursor,match.index),raw.readings));
  const tokens=annotate(match[1],raw.readings),segment={text:match[1],role:`${point.purpose} ${point.formation.join(' ')}`};
  if(/[\p{Script=Han}]/u.test(segment.text))segment.reading=tokens.map(token=>token.reading ?? token.text).join('');segments.push(segment);
  cursor=match.index+match[0].length;count++;
 }
 segments.push(...annotate(raw.text.slice(cursor),raw.readings));
 if(!count || segments.some(s=>/[\[\]]/.test(s.text)))throw new Error(`${point.id}: missing or unbalanced construction spans`);
 return {segments,translation:raw.translation,note:raw.note};
}
const authored=[];
for(const level of ['n5','n4','n3','n2','n1']) {
 const {default:points}=await import(pathToFileURL(resolve(`data/grammar/${level}.mjs`)).href);
 authored.push(...points);
}
const seen=new Set();const refs=new Map(coverage.entries.map(row=>[row.reference,row]));
for(const point of authored) {
 if(seen.has(point.id) || !refs.has(point.id))throw new Error(`Unknown/duplicate grammar ID: ${point.id}`);seen.add(point.id);
 for(const key of ['purpose','register','restrictions','mistake'])if(typeof point[key]!=='string' || !point[key].trim())throw new Error(`${point.id}: missing ${key}`);
 if(!Array.isArray(point.formation) || !point.formation.length || point.formation.some(f=>!f.trim()) || point.examples.length!==3)throw new Error(`${point.id}: require formation and three examples`);
 if(new Set(point.examples.map(e=>e.text)).size!==3)throw new Error(`${point.id}: examples must differ`);
}
const missing=coverage.entries.filter(row=>!seen.has(row.reference));if(missing.length)throw new Error(`Missing ${missing.length} grammar references: ${missing.slice(0,10).map(r=>r.reference).join(', ')}`);
await rm('dist/grammar',{recursive:true,force:true});await mkdir('dist/grammar/points',{recursive:true});await mkdir('dist/grammar/comparisons',{recursive:true});
const records=[];
for(const point of authored) {
 if(aliasMap[point.id])continue;
 const ref=refs.get(point.id),aliases=[ref.romaji,...(ref.pattern.match(/（([^）]+)）/g) ?? []).map(a=>a.slice(1,-1))];
 let pattern=point.pattern ?? ref.pattern;
 const duplicates=authored.filter(p=>aliasMap[p.id]===point.id);
 for(const duplicate of duplicates){const other=refs.get(duplicate.id);aliases.push(other.pattern,other.romaji);}
 if(point.id==='n5-046')pattern='んです / のです';
 if(point.id==='n5-003')aliases.push('しか～ない','しかない','shika nai');
 if(point.aliases)aliases.push(...point.aliases);
 const groupOverrides={'n5-029':['time','comparison'],'n5-058':['reasons'],'n4-050':['time'],'n1-197':['reasons'],'n1-106':['conditions']};
 const assigned=point.groups ?? groupOverrides[point.id] ?? Object.entries(groups).filter(([,regex])=>regex.test(point.purpose)).map(([name])=>name);
 if(!assigned.length)assigned.push('connecting ideas');
 const families=comparisonSource.filter(family=>family.pointIds.includes(point.id));
 const intents={time:'talk about time sequence duration habits',reasons:'give explain a reason cause result',conditions:'if unless condition circumstances',comparison:'compare things limit choices differences',certainty:'express certainty uncertainty possibility expectations','wishes and obligations':'express wishes wants obligation permission request advice','connecting ideas':'connect ideas explain identify things','social tone':'express feelings speak politely show respect'};
 const keywords=[...assigned,...assigned.map(group=>intents[group]),...point.formation,...point.examples.map(e=>e.translation)];
 for(const family of families)keywords.push(family.title,...family.variants.map(variant=>variant.label));
 if(/soften|soft |gentle/i.test([point.purpose,point.restrictions,point.mistake].join(' ')))keywords.push('soften a statement gentle explanation');
 const summary={id:point.id,pattern,aliases,level:ref.level,purpose:point.purpose,groups:assigned,keywords,comparisons:families.map(family=>family.id)};
 const examples=duplicates.length?[...point.examples.slice(0,2),duplicates[0].examples[0]]:point.examples;
 const record={...summary,formation:point.formation,register:point.register,restrictions:point.restrictions,mistake:point.mistake,related:[...new Set(families.flatMap(family=>family.pointIds))].filter(id=>id!==point.id),examples:examples.map(e=>example(e,point))};
 records.push(record);await writeFile(`dist/grammar/points/${point.id}.json`,JSON.stringify(record)+'\n');
}
const compiledComparisons=[];
for(const data of comparisonSource) {
 const result={...data,variants:data.variants.map(v=>({...v,example:example(v.example,{id:data.id,purpose:v.change,formation:[]})}))};
 compiledComparisons.push(result);
 await writeFile(`dist/grammar/comparisons/${data.id}.json`,JSON.stringify(result)+'\n');
}
for(const record of records)for(const id of record.related)if(!records.some(r=>r.id===id))throw new Error(`Broken related link: ${id}`);
const index=records.map(({formation,register,restrictions,mistake,related,examples,...summary})=>summary);
await writeFile('dist/grammar/index.json',JSON.stringify(index)+'\n');
await writeFile('dist/grammar/README.md',await readFile('data/grammar/README.md'));
const ledger={...coverage,entries:coverage.entries.map(row=>({...row,pointId:aliasMap[row.reference] ?? row.reference,status:aliasMap[row.reference]?'alias':'authored'}))};
await writeFile('dist/grammar/coverage.json',JSON.stringify(ledger,null,2)+'\n');
await writeFile('dist/grammar/index-metadata.json',JSON.stringify({schema:1,referenceDate:coverage.referenceDate,referenceEntries:coverage.entries.length,points:records.length,examples:records.reduce((n,r)=>n+r.examples.length,0),comparisons:compiledComparisons.length,comparisonExamples:compiledComparisons.reduce((count,family)=>count+family.variants.length,0),sha256:createHash('sha256').update(JSON.stringify(records)).digest('hex'),comparisonSha256:createHash('sha256').update(JSON.stringify(compiledComparisons)).digest('hex')},null,2)+'\n');
console.log(`Grammar: ${records.length} canonical points, ${coverage.entries.length} references, ${records.length*3} original examples, ${compiledComparisons.length} comparisons`);
