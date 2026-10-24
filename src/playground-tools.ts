import {annotated,type PlaygroundTokenizer} from './exploration';
import {buildVerbPlayground,dictionaryVerbCandidates} from './verb-playground';
import {buildAdjectivePlayground,dictionaryAdjectiveCandidates} from './adjective-playground';
import {definitionSource,type DefinitionLanguage,type DictionaryPage} from './definitions';
import {grammarGroups,type DictionaryEntry,type DictionaryHit,type GrammarExample,type GrammarPoint,type GrammarSummary,type PlaygroundDataProvider} from './playground-data';

export interface PlaygroundTool {element:HTMLElement;dispose():void;focus():void}
export interface ToolOptions {presentation?:'panel'|'page';data:PlaygroundDataProvider;tokenize:PlaygroundTokenizer;dictionary:(word:string)=>void;forms:(word:string)=>void}
export function node<K extends keyof HTMLElementTagNameMap>(tag:K,className='',text?:string):HTMLElementTagNameMap[K] {
 const el=document.createElement(tag);el.className=className;if(text!==undefined)el.textContent=text;return el;
}
export function button(label:string,action:()=>void,className=''):HTMLButtonElement {
 const el=node('button',className,label);el.type='button';el.addEventListener('click',action);return el;
}
function labelInput(label:string,placeholder:string) {
 const wrap=node('label','tool-label',label),input=node('input');input.type='search';input.maxLength=80;input.placeholder=placeholder;input.autocomplete='off';input.spellcheck=false;wrap.append(input);return {wrap,input};
}
function workspace(name:string) {
 const root=node('section','playground-workspace');root.setAttribute('aria-label',name);
 const scroller=node('div','tool-scroll'),layout=node('div','tool-layout'),catalog=node('div','tool-catalog'),detail=node('section','tool-detail');
 detail.hidden=true;detail.tabIndex=-1;detail.setAttribute('aria-label',`${name} details`);
 const status=node('p','tool-status');status.setAttribute('role','status');
 const results=node('div','tool-results');catalog.append(status,results);layout.append(catalog,detail);scroller.append(layout);root.append(scroller);
 let origin:HTMLElement|undefined,scroll=0;
 function back(restoreFocus=true) {detail.hidden=true;root.classList.remove('has-detail');scroller.scrollTop=scroll;if(restoreFocus)origin?.focus({preventScroll:true});root.dispatchEvent(new Event('tool-results'));}
 const backButton=button('← Results',()=>back(),'tool-back');
 backButton.setAttribute('aria-label','Results');
 root.addEventListener('keydown',e=>{if(e.key==='Escape' && !detail.hidden){e.preventDefault();e.stopPropagation();back();}});
 function show(content:HTMLElement,from?:HTMLElement) {
  if(detail.hidden)scroll=scroller.scrollTop;else if(from && catalog.contains(from))scroll=catalog.scrollTop;
  if(from && catalog.contains(from))origin=from;detail.replaceChildren(backButton,content);detail.hidden=false;root.classList.add('has-detail');scroller.scrollTop=0;catalog.scrollTop=scroll;detail.scrollTop=0;detail.focus({preventScroll:true});
 }
 function error(target:HTMLElement,error:unknown,retry:()=>void) {
  const p=node('p','tool-error',error instanceof Error?error.message:'Could not load local data.');p.setAttribute('role','status');target.replaceChildren(p,button('Try again',retry));
 }
 return {root,scroller,backButton,catalog,status,results,detail,show,back,error};
}
const japanese=(q:string)=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(q);
function source(target:HTMLElement,page:DictionaryPage,language:DefinitionLanguage,word:string) {
 const attribution=definitionSource(page,language,word),link=node('a','tool-source',attribution.label);link.href=attribution.url;link.target='_blank';link.rel='noopener noreferrer';target.append(link,node('p','tool-source',attribution.notice));
}
function onlineButton(options:ToolOptions,target:HTMLElement,word:string,language:DefinitionLanguage,alive:()=>boolean) {
 const action=button(`Look up ${language==='en'?'English':'Japanese'} online`,()=>{
  action.disabled=true;target.setAttribute('aria-busy','true');
  void options.data({op:'online',word,language}).then(page=>{
   if(!alive())return;
   const content=node('div');
   content.append(node('p','',page.status==='ok'?'Online definitions':page.status==='missing'?'No Japanese entry was found in this Wiktionary edition.':'Online lookup could not finish. Try again.'));
   for(const definition of page.definitions)content.append(node('p','',definition));
   if(page.status==='ok')source(content,page,language,word);target.replaceChildren(content);
   if(page.status==='error')onlineButton(options,target,word,language,alive);
  }).catch(error=>{if(alive()){target.replaceChildren(node('p','tool-error',String(error)));onlineButton(options,target,word,language,alive);}}).finally(()=>{target.removeAttribute('aria-busy');});
 });
 target.append(node('p','tool-source',`Sends “${word}” to ${language==='en'?'English':'Japanese'} Wiktionary only when selected.`),action);
}

export function renderDictionaryTool(options:ToolOptions,initialWord=''):PlaygroundTool {
 const view=workspace('Dictionary'),{wrap,input}=labelInput('Search dictionary','Japanese, reading, or English meaning');
 const form=node('form','tool-search');form.append(wrap,button('Search locally',()=>void search()));view.catalog.prepend(node('p','playground-intro','Search the bundled dictionaries. Online lookup is optional.'),form);
 input.value=initialWord;
 let disposed=false,composing=false,timer:ReturnType<typeof setTimeout>|undefined,sequence=0,detailVersion=0,total=0,hits:DictionaryHit[]=[],query='',controller:AbortController|undefined;
 let formProbe:(()=>void)|undefined,completedSequence=-1,suggestedSequence=-1;
 const active=()=>!disposed;
 const more=button('Show more',()=>void search(true));more.hidden=true;
 async function open(hit:DictionaryHit,origin:HTMLElement) {
  const version=++detailVersion,content=node('article');formProbe=undefined;content.append(node('p','','Loading local entry…'));view.show(content,origin);
  try {
   const entry=await options.data({op:'entry',id:hit.id,bucket:hit.bucket});if(disposed || version!==detailVersion)return;
   content.replaceChildren(node('h2','tool-heading',hit.headword),node('p','tool-reading',hit.reading));
   const spellings=node('details');spellings.append(node('summary','','Spellings and readings'));
   for(const reading of entry.readings) {
    const allowed=reading.noKanji?[]:entry.spellings.filter(s=>!reading.restrict.length || reading.restrict.includes(s.text));
    spellings.append(node('p','',`${allowed.map(s=>s.text).join(' / ') || 'Kana only'} — ${reading.text}${reading.info.length?` · ${reading.info.join('; ')}`:''}`));
   }
   for(const spelling of entry.spellings)if(spelling.info.length)spellings.append(node('p','',`${spelling.text}: ${spelling.info.join('; ')}`));content.append(spellings);
   content.append(node('h3','','English senses'));
   const senses=node('ol','dictionary-senses');
   entry.senses.forEach((sense,index)=>{
    const li=node('li');li.append(node('p','tool-sense-label',sense.pos.join(' · ')),node('p','',sense.glosses.join('; ')));
    const labels=[...sense.field,...sense.misc,...sense.dialect,...sense.info];if(labels.length)li.append(node('p','tool-source',labels.join(' · ')));
    if(sense.spellings.length || sense.readings.length)li.append(node('p','tool-source',`Applies to: ${[...sense.spellings,...sense.readings].join(' / ')}`));
    if(index<4)senses.append(li);else {
     let extra=content.querySelector<HTMLDetailsElement>('.dictionary-more');if(!extra){extra=node('details','dictionary-more');extra.append(node('summary','','More senses'),node('ol'));content.append(extra);}extra.querySelector('ol')!.append(li);
    }
   });content.insertBefore(senses,content.querySelector('.dictionary-more'));
   source(content,{status:'ok',definitions:[],source:'jmdict'},'en',hit.headword);
   if(hit.headword.length<=40 && entry.senses.some(s=>s.pos.some(p=>/\bverb\b|adjectiv/.test(p)))) {
    let probed=false;
    formProbe=()=>{
     if(view.root.hidden || probed || disposed || version!==detailVersion)return;probed=true;
     void options.tokenize([hit.headword],new AbortController().signal).then(words=>{
      if(disposed || version!==detailVersion)return;
      if(dictionaryVerbCandidates(hit.headword,words[0] ?? []).length || dictionaryAdjectiveCandidates(hit.headword,words[0] ?? []).length)content.append(button('Try word forms',()=>options.forms(hit.headword)));
     }).catch(()=>{});
    };formProbe();
   }
   const ja=node('section','dictionary-japanese');ja.append(node('h3','','Japanese definitions'),node('p','','Checking the local Japanese dictionary…'));content.append(ja);
   const showJapanese=async()=>{
    try {
     const page=await options.data({op:'japanese',word:hit.headword});if(disposed || version!==detailVersion)return;
     ja.replaceChildren(node('h3','','Japanese definitions'));
     if(page.status==='ok'){for(const definition of page.definitions)ja.append(node('p','',definition));source(ja,page,'ja',hit.headword);}
     else {ja.append(node('p','','No bundled Japanese definition for this word.'));onlineButton(options,ja,hit.headword,'ja',()=>active() && version===detailVersion);}
    }catch(error){if(active() && version===detailVersion)view.error(ja,error,()=>void showJapanese());}
   };void showJapanese();
  } catch(error) {if(active() && version===detailVersion)view.error(content,error,()=>void open(hit,origin));}
 }
 function render() {
  view.results.replaceChildren();
  for(const hit of hits){const item=button('',()=>void open(hit,item),'tool-result');item.append(annotated(hit.headword,hit.reading),node('span','tool-sense-label',hit.pos.join(' · ')),node('span','',hit.meaning));view.results.append(item);}
  more.hidden=hits.length>=total;view.results.append(more);
 }
 async function suggestions(value:string,id:number) {
  if(view.root.hidden || suggestedSequence===id || !japanese(value) || value.length>40 || !/^[\p{L}々ー]+$/u.test(value))return;suggestedSequence=id;
  const signal=controller!.signal;
  try {
   const words=(await options.tokenize([value],signal))[0] ?? [];
   if(disposed || id!==sequence)return;
   const candidates=new Set<string>();
   for(const [i] of words.entries()) {
    const verb=buildVerbPlayground(value,words,i),adjective=buildAdjectivePlayground(value,words,i);
    if(verb && verb.start===0 && verb.end===value.length)candidates.add((verb.base.prefix ?? '')+verb.base.lemma);
    if(adjective && adjective.start===0 && adjective.end===value.length)candidates.add(adjective.base.lemma);
   }
   for(const candidate of candidates) {
    const result=await options.data({op:'search',query:candidate,offset:0},signal);if(disposed || id!==sequence)return;
    if(result.hits.some(h=>h.headword===candidate))view.results.append(button(`Look up dictionary form: ${candidate}`,()=>{input.value=candidate;void search();}));
   }
  }catch{/* Suggestions are optional; a failed tokenizer never hides search results. */}
 }
 async function search(append=false) {
  clearTimeout(timer);if(disposed || composing)return;
  const value=input.value.normalize('NFKC').trim();if(append && value!==query)return;
  const id=++sequence;controller?.abort();controller=new AbortController();
  if(!append){detailVersion++;view.back(false);hits=[];total=0;view.results.replaceChildren();}query=value;
  if(!value){view.status.textContent='Enter a Japanese word, reading, or English meaning.';return;}
  view.status.textContent='Searching on this device…';more.disabled=true;
  try {
   const result=await options.data({op:'search',query:value,offset:append?hits.length:0},controller.signal);if(disposed || id!==sequence)return;
   hits=append?[...hits,...result.hits]:result.hits;total=result.total;view.status.textContent=`${total} entries · offline`;render();
   if(!total) {
    view.status.textContent=japanese(value)?'No matching English dictionary entry in the bundled data.':'No matching English meaning. Try a shorter or different word.';
    if(japanese(value)) {
     const local=node('section');view.results.append(local);
     const page=await options.data({op:'japanese',word:value},controller.signal);if(disposed || id!==sequence)return;
     if(page.status==='ok'){for(const definition of page.definitions)local.append(node('p','',definition));source(local,page,'ja',value);}
     else onlineButton(options,local,value,'ja',()=>active() && id===sequence);
     onlineButton(options,local,value,'en',()=>active() && id===sequence);
    }
   }
   completedSequence=id;if(!append)void suggestions(value,id);
  }catch(error){if(active() && id===sequence)view.error(view.results,error,()=>void search());}
  finally {if(id===sequence)more.disabled=false;}
 }
 form.addEventListener('submit',e=>{e.preventDefault();void search();});
 input.addEventListener('compositionstart',()=>{composing=true;clearTimeout(timer);controller?.abort();sequence++;});
 input.addEventListener('compositionend',()=>{composing=false;void search();});
 input.addEventListener('input',()=>{clearTimeout(timer);controller?.abort();sequence++;if(!composing)timer=setTimeout(()=>void search(),180);});
 if(initialWord)void search();else view.status.textContent='Enter a Japanese word, reading, or English meaning.';
 return {element:view.root,focus:()=>{formProbe?.();if(completedSequence===sequence)void suggestions(query,sequence);input.focus();},dispose:()=>{disposed=true;sequence++;detailVersion++;clearTimeout(timer);controller?.abort();}};
}

export function renderGrammarExample(example:GrammarExample,options:ToolOptions,lens:HTMLElement):HTMLElement {
 const wrap=node('div','grammar-example'),sentence=node('p','grammar-sentence');
 for(const segment of example.segments) {
  const text=segment.reading?annotated(segment.text,segment.reading):document.createTextNode(segment.text);
  if(segment.role){const part=button('',()=>{lens.textContent=segment.role!;if(options.presentation==='panel'){wrap.querySelectorAll('.grammar-highlight').forEach(el=>el.setAttribute('aria-pressed',String(el===part)));}},'grammar-highlight');if(options.presentation==='panel')part.setAttribute('aria-pressed','false');part.setAttribute('aria-label',`${segment.text}: explain construction`);part.append(text);sentence.append(part);}
  else if(segment.lemma){const word=button('',()=>options.dictionary(segment.lemma!),'grammar-word');word.setAttribute('aria-label',`Look up ${segment.lemma}`);word.append(text);sentence.append(word);}
  else sentence.append(text);
 }
 wrap.append(sentence,node('p','grammar-translation',example.translation),node('p','tool-source',example.note));return wrap;
}

let grammarSectionSequence=0;
export function renderGrammarTool(options:ToolOptions):PlaygroundTool {
 const panel=options.presentation==='panel';
 const view=workspace('Grammar'),{wrap,input}=labelInput('Search grammar','Pattern, reading, romaji, or what you want to express');
 const filters=node('div','grammar-filters'),levelLabel=node('label','tool-label','Level'),level=node('select');level.setAttribute('aria-label','Grammar level');
 for(const value of ['All','N5','N4','N3','N2','N1']){const opt=node('option','',value==='All'?'All levels':value);opt.value=value;level.append(opt);}level.value='N5';levelLabel.append(level);
 const groupLabel=node('label','tool-label','Meaning group'),group=node('select');group.setAttribute('aria-label','Grammar meaning group');const all=node('option','','All meanings');all.value='';group.append(all);
 for(const value of grammarGroups){const opt=node('option','',value);opt.value=value;group.append(opt);}groupLabel.append(group);filters.append(levelLabel,groupLabel);
 view.catalog.prepend(node('p','playground-intro','Sentence Lens · explore what grammar changes in a sentence.'),wrap,filters);
 const filterSummary=node('summary');
 if(panel) {
  view.root.classList.add('panel-grammar');
  const controls=node('div','grammar-controls'),disclosure=node('details','grammar-filter-disclosure');
  disclosure.append(filterSummary,filters);controls.append(wrap,disclosure,view.status);
  view.catalog.querySelector('.playground-intro')?.remove();view.catalog.prepend(controls);
  view.backButton.textContent='← Back to results';view.backButton.setAttribute('aria-label','Back to results');
 }
 let disposed=false,index:GrammarSummary[]=[],version=0,composing=false,limit=30;
 view.root.addEventListener('tool-results',()=>{version++;});
 let matches:GrammarSummary[]=[],rendered=0;
 const sentinel=node('p','grammar-list-end');
 function appendBatch() {
  if(disposed || !panel || !view.detail.hidden || view.root.getClientRects().length===0)return;
  const end=Math.min(rendered+30,matches.length),fragment=document.createDocumentFragment();
  for(const summary of matches.slice(rendered,end))fragment.append(result(summary));
  view.results.append(fragment);rendered=end;
  view.status.textContent=`${rendered} of ${matches.length} grammar points · offline`;
  sentinel.textContent=rendered===matches.length && matches.length?'End of results':'';
  observer?.unobserve(sentinel);
  if(rendered<matches.length)observer?.observe(sentinel);
 }
 const observer=panel?new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting) && sentinel.getBoundingClientRect().top<=view.scroller.getBoundingClientRect().bottom+300)appendBatch();
 },{root:view.scroller,rootMargin:'0px 0px 300px 0px'}):undefined;
 function result(summary:GrammarSummary) {
  const b=button('',()=>void open(summary,b),'tool-result');
  b.append(node('span','tool-pattern',summary.pattern),node('span','tool-source',summary.level),node('span','',summary.purpose));return b;
 }
 const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('en').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
 async function open(summary:GrammarSummary,origin:HTMLElement) {
  const id=++version,content=node('article');content.append(node('p','','Opening local grammar…'));view.show(content,origin);
  try {
   const point=await options.data({op:'grammar',id:summary.id});if(disposed || id!==version)return;
   const lens=node('p','grammar-lens',panel?'Select an underlined construction to see its role.':'Select an outlined construction to see its role.');lens.setAttribute('role','status');
   content.replaceChildren(node('p','tool-source',`${point.level} · study reference`),node('h2','tool-heading',point.pattern),node('p','grammar-purpose',point.purpose));
   content.append(renderGrammarExample(point.examples[0],options,lens),lens);
   const extra=node('details','grammar-examples');extra.append(node('summary','','More examples'));for(const example of point.examples.slice(1))extra.append(renderGrammarExample(example,options,lens));content.append(extra);
   const details=node('details','grammar-notes');details.append(node('summary','','Formation and usage'));
   details.append(node('h3','','How it is formed'));for(const rule of point.formation)details.append(node('p','',rule));
   details.append(node('h3','','Register'),node('p','',point.register),node('h3','','Usage limits'),node('p','',point.restrictions),node('h3','','Watch out'),node('p','',point.mistake));content.append(details);
   for(const comparisonId of point.comparisons) {
    const comparison=node('section','grammar-comparison');content.append(comparison);
    const loadComparison=async()=>{
     try {
      const data=await options.data({op:'comparison',id:comparisonId});if(disposed || id!==version)return;
      const output=node('div'),explanation=node('p','grammar-change'),choices=node('div','grammar-switches'),clens=node('p','grammar-lens');clens.setAttribute('role','status');explanation.setAttribute('aria-live','polite');
      const familyOption=content.querySelector<HTMLOptionElement>(`select[aria-label="Comparison family"] option[value="${point.comparisons.indexOf(comparisonId)}"]`);if(familyOption)familyOption.textContent=data.title;
      comparison.setAttribute('aria-label',data.title);choices.setAttribute('role','group');choices.setAttribute('aria-label',`Compare: ${data.title}`);
      comparison.replaceChildren(node('h3','',`Compare: ${data.title}`),choices,output,explanation,clens);
      const buttons:HTMLButtonElement[]=[];
      const choose=(n:number)=>{output.replaceChildren(renderGrammarExample(data.variants[n].example,options,clens));explanation.textContent=`What changed? ${data.variants[n].change}`;clens.textContent='Select the construction to inspect it.';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));};
      data.variants.forEach((variant,n)=>{const b=button(variant.label,()=>choose(n));buttons.push(b);choices.append(b);});choose(0);
      const activity=node('details','grammar-activity'),feedback=node('p');feedback.setAttribute('role','status');activity.append(node('summary','','Choose the meaning'),node('p','',data.question));
      data.answers.forEach((answer,n)=>activity.append(button(answer,()=>{feedback.textContent=`${n===data.correct?'Yes.':'Try another interpretation.'} ${data.feedback}`;})));activity.append(feedback);comparison.append(activity);
     }catch(error){if(!disposed && id===version)view.error(comparison,error,()=>void loadComparison());}
    };void loadComparison();
   }
   const related=node('nav','grammar-related');related.setAttribute('aria-label','Related grammar');
   for(const relatedId of point.related){const summary=index.find(p=>p.id===relatedId);if(summary){const b=button(summary.pattern,()=>void open(summary,b));related.append(b);}}if(related.childElementCount)content.append(node('h3','','Related grammar'),related);
   content.append(node('p','tool-source','Original Kō explanations and examples. JLPT levels are study references, not an official syllabus.'));
   if(panel)panelDetails(content,point,lens);
  }catch(error){if(!disposed && id===version)view.error(content,error,()=>void open(summary,origin));}
 }
 function panelDetails(content:HTMLElement,point:GrammarPoint,lens:HTMLElement) {
  const toolbar=node('div','grammar-detail-toolbar'),tabs=node('div','grammar-section-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Grammar sections');
  const heading=content.querySelector<HTMLElement>('.tool-heading')!,levelInfo=content.querySelector<HTMLElement>('.tool-source')!;
  toolbar.append(view.backButton,heading,levelInfo,tabs);
  const example=node('section'),usage=node('section'),compare=node('section');
  const purpose=content.querySelector<HTMLElement>('.grammar-purpose')!;
  const exampleHost=node('div'),exampleNav=node('div','grammar-example-nav'),count=node('span');count.setAttribute('role','status');
  let selected=0;
  const previous=button('Previous',()=>showExample(selected-1)),next=button('Next',()=>showExample(selected+1));
  function showExample(n:number) {
   selected=n;exampleHost.replaceChildren(renderGrammarExample(point.examples[n],options,lens));
   lens.textContent='Select an underlined construction to see its role.';
   count.textContent=`${n+1} / ${point.examples.length}`;previous.disabled=n===0;next.disabled=n===point.examples.length-1;
  }
  exampleNav.append(previous,count,next);example.append(purpose,exampleHost,lens,exampleNav);showExample(0);
  const notes=content.querySelector('.grammar-notes')!;notes.querySelector('summary')?.remove();usage.append(...Array.from(notes.childNodes));
  const related=content.querySelector('.grammar-related');if(related)usage.append(node('h3','','Related grammar'),related);
  const families=Array.from(content.querySelectorAll<HTMLElement>('.grammar-comparison'));
  if(families.length>1) {
   const label=node('label','tool-label','Comparison'),select=node('select');select.setAttribute('aria-label','Comparison family');
   point.comparisons.forEach((_,i)=>{const option=node('option','',`Comparison ${i+1}`);option.value=String(i);select.append(option);});
   select.onchange=()=>families.forEach((family,i)=>{family.hidden=i!==Number(select.value);});label.append(select);compare.append(label);
  }
  families.forEach((family,i)=>{family.hidden=i!==0;compare.append(family);});
  const sections:[string,HTMLElement][]=[['Example',example],['Usage',usage],...(families.length?[['Compare',compare] as [string,HTMLElement]]:[])];
  const buttons:HTMLButtonElement[]=[],positions=new Map<HTMLElement,number>();let active=example;
  function choose(n:number,focus=false) {
   positions.set(active,view.scroller.scrollTop);active=sections[n][1];
   sections.forEach(([,section],i)=>{section.hidden=i!==n;buttons[i].setAttribute('aria-selected',String(i===n));buttons[i].tabIndex=i===n?0:-1;});
   view.scroller.scrollTop=positions.get(active) ?? 0;if(focus)buttons[n].focus();
  }
  const prefix=`grammar-section-${++grammarSectionSequence}`;
  sections.forEach(([name,section],i)=>{
   const b=button(name,()=>choose(i));b.setAttribute('role','tab');b.id=`${prefix}-${i}`;section.id=`${prefix}-${i}-pane`;
   b.setAttribute('aria-controls',section.id);section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',b.id);
   b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();choose(e.key==='Home'?0:e.key==='End'?sections.length-1:(i+(e.key==='ArrowRight'?1:-1)+sections.length)%sections.length,true);};
   buttons.push(b);tabs.append(b);
  });
  const attribution=content.lastElementChild!;content.replaceChildren(toolbar,...sections.map(([,section])=>section),attribution);choose(0);
 }
 function render(reset=true) {
  if(composing || disposed)return;if(reset)limit=30;
  const tokens=normalize(input.value).trim().split(/\s+/u).filter(token=>token && !['a','an','the','to','of'].includes(token));
  matches=index.filter(p=>(level.value==='All' || p.level===level.value) && (!group.value || p.groups.includes(group.value as typeof grammarGroups[number])) && tokens.every(t=>normalize([p.pattern,...p.aliases,p.purpose,...p.keywords].join(' ')).includes(t)));
  view.status.textContent=`${matches.length} grammar points · offline`;view.results.replaceChildren();
  if(panel) {
   observer?.disconnect();rendered=0;view.scroller.scrollTop=0;
   filterSummary.textContent=`Filters · ${level.value==='All'?'All levels':level.value} · ${group.value || 'All meanings'}`;
   appendBatch();view.catalog.append(sentinel);
  } else {
   for(const summary of matches.slice(0,limit))view.results.append(result(summary));
   if(matches.length>limit)view.results.append(button('Show more',()=>{limit+=30;render(false);}));
  }
  if(!matches.length)view.results.append(node('p','','No matches. Try All levels, another spelling, or a meaning such as “reason”.'));
 }
 async function load() {view.status.textContent='Opening the local grammar collection…';try{index=await options.data({op:'grammar-index'});if(!disposed)render();}catch(error){if(!disposed)view.error(view.results,error,()=>void load());}}
 input.addEventListener('input',()=>render());input.addEventListener('compositionstart',()=>{composing=true;});input.addEventListener('compositionend',()=>{composing=false;render();});
 level.addEventListener('change',()=>{version++;view.back(false);render();});group.addEventListener('change',()=>{version++;view.back(false);render();});void load();
 return {element:view.root,focus:()=>{if(panel && !view.detail.hidden)view.detail.focus({preventScroll:true});else input.focus({preventScroll:true});},dispose:()=>{disposed=true;version++;observer?.disconnect();}};
}

export const playgroundToolStyles=`
.playground-workspaces,.legacy-playground{display:flex;flex-direction:column;flex:1;min-height:0;height:100%}
.playground-workspace{display:flex;flex:1;min-height:0;min-width:0;container-type:inline-size}.tool-scroll{overflow:auto;overscroll-behavior:contain;width:100%;padding:16px;min-height:0}
.tool-layout{display:grid;gap:20px;min-width:0}.tool-catalog,.tool-detail{min-width:0}.has-detail .tool-catalog{display:none}.tool-detail:focus{outline:none}
.tool-label{display:grid;gap:6px;font-size:12px;font-weight:600;margin-bottom:12px}.tool-label input,.tool-label select{font:13px/1.5 var(--body);padding:10px;background:var(--paper);color:var(--ink);border:1px solid var(--line);width:100%;min-width:0}
.tool-search>button{margin:0}.tool-status{font-size:12px;color:var(--muted)}.tool-results{display:grid;gap:8px}.tool-result{display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;padding:12px!important;white-space:normal;overflow-wrap:anywhere;margin:0!important}
.tool-result ruby,.tool-pattern{font-size:20px;font-weight:500;color:var(--accent)}.tool-sense-label,.tool-source{font-size:11px;color:var(--muted);font-weight:400}.tool-heading{font:700 25px/1.6 var(--body);margin:12px 0}.tool-reading{font-size:16px}.tool-back{margin:0!important;padding:5px 0!important;border:0!important;color:var(--accent);background:transparent!important}
.tool-detail p{overflow-wrap:anywhere}.tool-detail details{margin:14px 0;padding:10px 0;border-block:1px solid var(--surface)}.tool-detail summary{cursor:pointer;font-weight:600}.dictionary-senses{padding-left:22px}.dictionary-senses li{padding-bottom:8px}.dictionary-senses p{margin:4px 0}.dictionary-japanese{border-top:1px solid var(--line);margin-top:18px}.dictionary-more ol{padding-left:22px}
.grammar-filters{display:grid;grid-template-columns:1fr 1fr;gap:10px}.grammar-purpose{font-size:15px}.grammar-sentence{font:22px/2.5 var(--body);overflow-wrap:anywhere}.grammar-sentence button{display:inline!important;font:inherit!important;padding:1px 2px!important;margin:0!important;white-space:normal!important;border:0;background:transparent;color:inherit}
.grammar-sentence .grammar-highlight{outline:1px solid var(--seal);outline-offset:-1px;border-bottom:3px solid var(--seal);text-decoration:underline;text-underline-offset:5px;background:var(--surface)}.grammar-word{text-decoration:underline dotted;text-underline-offset:5px}.grammar-translation{font-size:14px}.grammar-lens{padding:10px;border-left:3px solid var(--accent);background:var(--surface);font-size:12px}.grammar-comparison{margin-top:24px;border-top:2px solid var(--line)}
.grammar-switches,.grammar-related{display:flex;gap:6px;flex-wrap:wrap}.grammar-switches button,.grammar-related button{margin:0!important}.grammar-switches [aria-pressed=true]{background:var(--accent);color:var(--paper)}.grammar-change{font-size:12px}.grammar-activity button{display:block;margin:8px 0!important;text-align:left}.playground-route-back{margin:0!important;padding:8px 16px!important;text-align:left;font-size:12px}
.panel-playground-picker{display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:1px solid var(--line);font-size:12px;flex:none}
.panel-playground-picker select{flex:1;min-width:0;padding:6px;font:inherit;background:var(--paper);color:var(--ink);border:1px solid var(--line)}
.panel-grammar .tool-scroll{padding:0 12px 12px;scroll-padding-top:160px}
.panel-grammar .tool-layout{display:block}.panel-grammar .grammar-controls{position:sticky;top:0;z-index:2;background:var(--paper);padding:10px 0 6px;border-bottom:1px solid var(--surface)}
.panel-grammar .tool-label{margin-bottom:6px}.panel-grammar .tool-label input,.panel-grammar .tool-label select{padding:6px}
.panel-grammar .grammar-filter-disclosure{font-size:12px}.panel-grammar summary{cursor:pointer;min-height:32px;padding:6px 0}
.panel-grammar .tool-status{margin:6px 0}.panel-grammar .tool-results{gap:0}
.panel-grammar .tool-result{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;padding:9px 2px!important;background:transparent;border:0;border-bottom:1px solid var(--surface);width:100%;font:14px/1.5 var(--body)}
.panel-grammar .tool-result>:last-child{grid-column:1/-1}.panel-grammar .tool-pattern{font-size:18px}.panel-grammar .tool-result:hover{background:var(--surface)}
.panel-grammar .grammar-list-end{font-size:12px;color:var(--muted);min-height:1px}
.panel-grammar .grammar-detail-toolbar{position:sticky;top:0;z-index:2;background:var(--paper);padding:6px 0;border-bottom:1px solid var(--line)}
.panel-grammar .tool-heading{font-size:22px;line-height:1.4;margin:2px 0}.panel-grammar .grammar-detail-toolbar>.tool-source{margin:2px 0 6px}
.panel-grammar .grammar-section-tabs,.panel-grammar .grammar-example-nav{display:flex;align-items:center;gap:6px}
.panel-grammar .grammar-section-tabs button{flex:1;margin:0}.panel-grammar .grammar-section-tabs [aria-selected=true]{background:var(--accent);color:var(--paper)}
.panel-grammar button{min-height:32px}.panel-grammar .grammar-sentence button{min-height:0}
.panel-grammar .grammar-example-nav{justify-content:space-between}.panel-grammar .grammar-example-nav button{margin:0}
.panel-grammar .tool-detail{font-size:14px}.panel-grammar .grammar-sentence{font-size:20px;line-height:2.5;overflow-wrap:normal;line-break:strict;word-break:normal}
.panel-grammar .grammar-sentence .grammar-highlight{outline:none;border-bottom:1px solid var(--seal);text-decoration:none;background:var(--surface)}
.panel-grammar .grammar-sentence .grammar-highlight[aria-pressed=true]{background:var(--surface);box-shadow:inset 0 -3px var(--seal)}
.panel-grammar .grammar-lens{font-size:14px}.panel-grammar .grammar-comparison{margin-top:12px;border-top:0}
@container(min-width:740px){.has-detail .tool-scroll{overflow:hidden}.has-detail .tool-catalog{display:block;overflow:auto;overscroll-behavior:contain}.has-detail .tool-layout{height:100%;grid-template-columns:minmax(230px,1fr) minmax(0,1.8fr)}.has-detail .tool-detail{overflow:auto;overscroll-behavior:contain;border-left:1px solid var(--line);padding-left:20px}}
@container(max-width:440px){.playground-tabs{display:grid;grid-template-columns:1fr 1fr}.grammar-filters{grid-template-columns:1fr}.grammar-sentence{font-size:20px}}
@media(max-width:440px){.playground-tabs{display:grid;grid-template-columns:1fr 1fr}.grammar-filters{grid-template-columns:1fr}.grammar-sentence{font-size:20px}}
`;
