import type {DictionaryPage,DefinitionLanguage} from './definitions';

export interface DictionarySpelling {text:string;priority:string[];info:string[]}
export interface DictionaryReading extends DictionarySpelling {restrict:string[];noKanji:boolean}
export interface DictionarySense {glosses:string[];spellings:string[];readings:string[];pos:string[];field:string[];misc:string[];dialect:string[];info:string[]}
export interface DictionaryEntry {id:string;spellings:DictionarySpelling[];readings:DictionaryReading[];senses:DictionarySense[]}
export interface DictionaryHit {id:string;bucket:string;headword:string;reading:string;meaning:string;pos:string[];common:boolean}
export type GrammarLevel='N5'|'N4'|'N3'|'N2'|'N1';
export const grammarGroups=['time','reasons','conditions','comparison','certainty','wishes and obligations','connecting ideas','social tone'] as const;
export type GrammarGroup=typeof grammarGroups[number];
export interface GrammarSegment {text:string;reading?:string;lemma?:string;role?:string}
export interface GrammarExample {segments:GrammarSegment[];translation:string;note:string}
export interface GrammarSummary {id:string;pattern:string;aliases:string[];level:GrammarLevel;purpose:string;groups:GrammarGroup[];keywords:string[];comparisons:string[]}
export interface GrammarPoint extends GrammarSummary {formation:string[];register:string;restrictions:string;mistake:string;related:string[];examples:GrammarExample[]}
export interface GrammarComparison {id:string;title:string;pointIds:string[];variants:{label:string;example:GrammarExample;change:string}[];question:string;answers:string[];correct:number;feedback:string}
export type PlaygroundQuery=
 | {op:'search';query:string;offset:number}
 | {op:'entry';id:string;bucket:string}
 | {op:'japanese';word:string}
 | {op:'grammar-index'}
 | {op:'grammar';id:string}
 | {op:'comparison';id:string}
 | {op:'online';word:string;language:DefinitionLanguage};
export interface PlaygroundResults {
 search:{hits:DictionaryHit[];total:number};entry:DictionaryEntry;japanese:DictionaryPage;
 'grammar-index':GrammarSummary[];grammar:GrammarPoint;comparison:GrammarComparison;online:DictionaryPage;
}
export type PlaygroundDataProvider=<Q extends PlaygroundQuery>(query:Q,signal?:AbortSignal)=>Promise<PlaygroundResults[Q['op']]>;

/** Shared transport: only online operations may perform external requests. */
export const playgroundData:PlaygroundDataProvider=async(query,signal)=>{
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 const reply=await chrome.runtime.sendMessage({type:'playground-data',query});
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 if(!reply || reply.error)throw new Error(reply?.error ?? 'Local playground data is unavailable.');
 return reply.value;
};
