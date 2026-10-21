export type DefinitionLanguage='en'|'ja';
export interface DictionaryPage {
  status:'ok'|'missing'|'error';
  definitions:string[];
  title?:string;
  source?:'jmdict'|'wiktionary';
  entryIds?:string[];
  reason?:'network'|'structure'|'busy';
}
export type DictionaryReply=Record<DefinitionLanguage,DictionaryPage>;
export function dictionaryURL(language:DefinitionLanguage,word:string) {
  return `https://${language}.wiktionary.org/wiki/${encodeURIComponent(word)}#${language==='en'?'Japanese':'日本語'}`;
}
export function definitionSource(page:DictionaryPage,language:DefinitionLanguage,word:string) {
  if(page.source==='jmdict')return {
    url:'https://www.edrdg.org/jmdict/j_jmdict.html',label:'JMdict · offline ↗',
    notice:'JMdict · EDRDG · CC BY-SA 4.0 · Looked up on this device.'
  };
  return {url:dictionaryURL(language,page.title ?? word),label:language==='en'?'English Wiktionary ↗':'ウィクショナリー日本語版 ↗',
    notice:'Wiktionary · CC BY-SA · Only the lookup term and any spelling-reference terms are sent.'};
}
