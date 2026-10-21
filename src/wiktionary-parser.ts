import type {DefinitionLanguage} from './definitions';
export interface ParsedDefinition {status:'ok'|'reference'|'missing'|'unsupported';definitions:string[];target?:string}
// This runs only in the offscreen DOM. Nothing from remote HTML enters a live page.
export function parseWiktionary(html:string,language:DefinitionLanguage):ParsedDefinition {
  const template=document.createElement('template');template.innerHTML=html;
  const clean=(element:Element,preserveTables=false)=>{
    const copy=element.cloneNode(true) as Element;
    copy.querySelectorAll('script,style,iframe,img,video,audio,svg,ul,ol,dl,rt,rp,.mw-editsection,.reference,.citation-whole,.quotation,.h-usage-example'+(preserveTables?'':',table')).forEach(node=>node.remove());
    return (copy.textContent ?? '').replace(/\s+/g,' ').trim();
  };
  let japanese=false,seenJapanese=false,partOfSpeech=false,spelling=false;
  const definitions:string[]=[],targets=new Set<string>();
  let invalidReference=false;
  const reference=(link:Element)=>{
    const href=link.getAttribute('href');
    try {
      const url=new URL(href ?? '',`https://${language}.wiktionary.org`);
      if(!href || url.origin!==`https://${language}.wiktionary.org` || !url.pathname.startsWith('/wiki/') || url.search)throw new Error('Invalid reference');
      const target=decodeURIComponent(url.pathname.slice(6)).replace(/_/g,' ').trim().normalize('NFC');
      if(!/^[\p{L}\p{M}\p{N}々〆ー・\s'-]{1,80}$/u.test(target))throw new Error('Invalid target');
      targets.add(target);
    } catch {invalidReference=true;}
  };
  for(const element of template.content.querySelectorAll('h2,h3,h4,h5,h6,ol,table.ja-see')) {
    if(element.parentElement?.closest('table,dl,.toc'))continue;
    if(element.tagName==='H2') {
      japanese=clean(element)===(language==='en'?'Japanese':'日本語');
      seenJapanese ||= japanese;partOfSpeech=false;spelling=false;continue;
    }
    if(!japanese)continue;
    if(element.matches('table.ja-see')) {
      // ja-see tables summarize many unrelated links; only bracketed headword
      // links identify the canonical entry, never pronunciation or gloss links.
      const text=clean(element,true),names=[...text.matchAll(/[【〖]([^】〗]+)[】〗]/gu)].map(m=>m[1].trim());
      if(!names.length)invalidReference=true;
      for(const name of names) {
        const links=[...element.querySelectorAll('a[href]')].filter(a=>clean(a)===name);
        if(!links.length)invalidReference=true;
        for(const link of links)reference(link);
      }
      continue;
    }
    if(element.tagName!=='OL') {
      const heading=clean(element);
      spelling=language==='ja' && /^(和語の漢字表記|漢字表記|異表記|別表記)(?:\s|$)/u.test(heading);
      if(!/^語義(?:\s|$)/u.test(heading))partOfSpeech=/^(Noun|Proper noun|Verb|Adjective|Adverb|Pronoun|Particle|Conjunction|Interjection|Prefix|Suffix|Counter|Numeral|Determiner|Phrase|Proverb|Idiom|Affix|名詞|固有名詞|動詞|形容詞|形容動詞|副詞|代名詞|助詞|接続詞|感動詞|接頭辞|接尾辞|助数詞|数詞|連体詞|成句|熟語|ことわざ|熟字訓|語素)(?:\s|[:：0-9０-９]|$)/u.test(heading);
      continue;
    }
    if(element.parentElement?.closest('ol,ul'))continue;
    for(const item of element.children) {
      if(item.tagName!=='LI')continue;
      if(spelling) {
        const link=item.querySelector('b a[href],strong a[href]');
        if(link && clean(item)===`${clean(link)}の漢字表記。`)reference(link);
        else invalidReference=true;
      } else if(partOfSpeech) {
        const value=clean(item).slice(0,600);
        if(value && !definitions.includes(value) && definitions.length<4)definitions.push(value);
      }
    }
  }
  if(definitions.length)return {status:'ok',definitions};
  if(!invalidReference && targets.size===1)return {status:'reference',definitions:[],target:[...targets][0]};
  return {status:seenJapanese?'unsupported':'missing',definitions:[]};
}
