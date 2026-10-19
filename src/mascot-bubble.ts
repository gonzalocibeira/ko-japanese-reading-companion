import {definitionText,dictionaryURL,type DictionaryPage} from './definitions';
import type {MascotWord} from './mascot-target';
export const mascotBubbleStyles=`
.bubble{position:absolute;width:max-content;max-width:min(480px,calc(100vw - 16px));max-height:min(340px,55vh);overflow:auto;pointer-events:auto;padding:12px 16px;background-color:#d3d5bd;background-image:repeating-conic-gradient(#475d5010 0% 25%,transparent 0% 50%);background-size:4px 4px;color:#263d46;border:2px solid #30454c;border-radius:0;box-shadow:inset 2px 2px #f4efce,inset -2px -2px #9da98f,4px 4px #30454c;font:16px/1.5 KoKunDotGothic16,'MS Gothic',monospace;overflow-wrap:anywhere;user-select:text;-webkit-font-smoothing:none}
.bubble[hidden]{display:none}.bubble header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.bubble ruby{display:inline-grid;grid-template-columns:minmax(0,1fr);min-width:0;max-width:100%;font:32px/1.2 KoKunDotGothic16,'MS Gothic',monospace;text-align:center}.bubble .surface{grid-column:1;grid-row:2;min-width:0;overflow-wrap:anywhere}.bubble rt{display:block;grid-column:1;grid-row:1;min-width:0;white-space:normal;overflow-wrap:anywhere;font:16px/1.5 KoKunDotGothic16,'MS Gothic',monospace;color:#536651}
.bubble button{font:inherit;cursor:pointer;color:inherit;background:#c4cbb0;border:2px solid #536651;border-radius:0;box-shadow:inset 2px 2px #f4efce,inset -2px -2px #9da98f;padding:2px 8px}.bubble .close{flex:none;display:grid;place-items:center;width:24px;height:24px;font:16px/1 KoKunDotGothic16,monospace;padding:0;margin-top:4px}.bubble p{margin:8px 0}.bubble ol{padding-left:24px;margin:8px 0;max-width:42ch}.bubble a{color:#314b64;text-underline-offset:3px}.bubble small{display:block;font:12px/1.5 KoKunDotGothic16,'MS Gothic',monospace;color:#536651;margin-top:8px}.bubble :focus-visible{outline:2px solid #314b64;outline-offset:3px}
.bubble:after{content:'';position:fixed;width:12px;height:12px;background:#9da98f;clip-path:polygon(0 0,100% 0,100% 33.33%,66.67% 33.33%,66.67% 66.67%,33.33% 66.67%,33.33% 100%,0 100%);left:var(--tail-x);top:var(--tail-y);pointer-events:none}.bubble.below:after{transform:scaleY(-1)}
`;
let pixelFont:Promise<unknown>|undefined;
function loadPixelFont() {
  if(!pixelFont) {
    const face=new FontFace('KoKunDotGothic16',`url("${chrome.runtime.getURL('art/fonts/DotGothic16-Regular.ttf')}")`);
    pixelFont=face.load().then(font=>document.fonts.add(font)).catch(()=>{});
  }
}
export class MascotBubble {
  readonly element=document.createElement('section');
  private version=0;
  private cache=new Map<string,DictionaryPage>();
  constructor(private send:(request:unknown)=>Promise<any>,close:()=>void) {
    this.element.className='bubble';this.element.hidden=true;this.element.setAttribute('aria-label','Kōくん word reading');this.element.setAttribute('aria-live','polite');
    this.element.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    this.close=close;
  }
  private close:()=>void;
  get open() {return !this.element.hidden;}
  hide() {this.version++;this.element.hidden=true;this.element.replaceChildren();}
  show(word:MascotWord,language:'off'|'en'|'ja') {
    loadPixelFont();
    this.hide();const version=this.version;this.element.hidden=false;
    const header=document.createElement('header'),ruby=document.createElement('ruby'),surface=document.createElement('span');ruby.lang='ja';surface.className='surface';surface.textContent=word.surface;ruby.append(surface);
    if(word.reading) {const rt=document.createElement('rt');rt.textContent=word.reading;ruby.append(rt);}
    const close=document.createElement('button');close.type='button';close.className='close';close.textContent='×';close.setAttribute('aria-label','Close Kōくん bubble');close.onclick=this.close;
    header.append(ruby,close);this.element.append(header);
    if(!word.reading) {const message=document.createElement('p');message.textContent='Reading unavailable.';this.element.append(message);}
    if(word.lemma!==word.surface) {const base=document.createElement('p');base.lang='ja';base.textContent=`辞書形: ${word.lemma}`;this.element.append(base);}
    if(language==='off')return;
    const body=document.createElement('div');body.className='meaning';body.lang=language;this.element.append(body);
    const lookup=async()=>{
      body.textContent='Looking up definition…';body.setAttribute('aria-busy','true');
      const key=JSON.stringify([word.lemma,language]);let page=this.cache.get(key);
      if(!page) {
        try {const reply=await this.send({type:'define-word',word:word.lemma,language});page=reply?.[language] ?? {status:'error'};}
        catch {page={status:'error'};}
        if(page!.status!=='error') {this.cache.set(key,page!);if(this.cache.size>100)this.cache.delete(this.cache.keys().next().value!);}
      }
      if(this.version!==version || !this.open)return;
      body.replaceChildren();body.setAttribute('aria-busy','false');
      const definitions=definitionText(page!.html ?? '',language).slice(0,2);
      if(definitions.length) {
        const list=document.createElement('ol');for(const text of definitions) {const item=document.createElement('li');item.textContent=text;list.append(item);}body.append(list);
      } else {
        const message=document.createElement('p');message.textContent=page!.status==='error'?'Definition unavailable. Check your connection.':'No definition found in this language.';body.append(message);
      }
      if(page!.status==='error') {const retry=document.createElement('button');retry.type='button';retry.textContent='Retry definition';retry.onclick=()=>void lookup();body.append(retry);}
      const source=document.createElement('a');source.href=dictionaryURL(language,page!.title ?? word.lemma);source.target='_blank';source.rel='noopener noreferrer';source.textContent=language==='en'?'English Wiktionary ↗':'ウィクショナリー日本語版 ↗';
      const notice=document.createElement('small');notice.textContent='Wiktionary · CC BY-SA · Only this word is sent.';body.append(source,notice);
    };
    void lookup();
  }
}
