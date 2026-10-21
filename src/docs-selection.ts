import type {MascotTextTarget} from './mascot-target';

// Docs paints selections separately from its annotated canvas text. Neither
// window.getSelection() nor selectionchange describes those selections.
export const docsSelectionSelector='.kix-canvas-tile-selection,.kix-selection-overlay,.kix-selection-overlay-content';
interface TextSource {text:string;rect:(start:number,end:number)=>DOMRect|undefined}
export function docsSelectedTarget(source:(element:Element,clip:DOMRect)=>TextSource|undefined):MascotTextTarget|undefined {
  const editor=document.querySelector('.kix-appview-editor');if(!editor)return;
  const clip=editor.getBoundingClientRect();
  const boxes=[...editor.querySelectorAll('.kix-canvas-tile-selection svg rect,.kix-selection-overlay,.kix-selection-overlay-content')]
    .filter(el=>!el.querySelector('.kix-selection-overlay-content,svg rect'))
    .filter(el=>el.checkVisibility({checkVisibilityCSS:true}))
    .map(el=>el.getBoundingClientRect())
    .filter(r=>r.width>1 && r.height>0);
  if(!boxes.length || boxes.length>32)return;
  // A word lookup must not silently truncate a multi-line/offscreen selection.
  const row=boxes[0];
  if(boxes.some(r=>r.top>=row.bottom || r.bottom<=row.top || r.top<Math.max(0,clip.top) || r.bottom>Math.min(innerHeight,clip.bottom) || r.left<clip.left || r.right>clip.right))return;
  const glyphs=new Map<string,{text:string;rect:DOMRect}>();
  let inspected=0;
  for(const element of editor.querySelectorAll('svg rect[aria-label]')) {
    if(++inspected>4096)return;
    const bounds=element.getBoundingClientRect();
    if(!boxes.some(r=>bounds.left<r.right && bounds.right>r.left && bounds.top<r.bottom && bounds.bottom>r.top))continue;
    const run=source(element,clip);if(!run)return;
    let offset=0;
    for(const char of run.text) {
      const rect=run.rect(offset,offset+char.length);offset+=char.length;
      if(!rect || !boxes.some(r=>rect.left+rect.width/2>=r.left && rect.left+rect.width/2<r.right && rect.top<r.bottom && rect.bottom>r.top))continue;
      // Adjacent canvas tiles can expose the same glyph twice.
      const key=[rect.left,rect.top,rect.right,rect.bottom].map(n=>Math.round(n*10)).join(',');
      const previous=glyphs.get(key);if(previous && previous.text!==char)return;
      glyphs.set(key,{text:char,rect});if(glyphs.size>80)return;
    }
  }
  const ordered=[...glyphs.values()].sort((a,b)=>a.rect.left-b.rect.left);
  if(!ordered.length)return;
  for(let i=1;i<ordered.length;i++) {
    const gap=ordered[i].rect.left-ordered[i-1].rect.right;
    if(Math.abs(gap)>2)return; // Reject missing text and ambiguous overlapping runs.
  }
  if(boxes.some(r=>r.left<ordered[0].rect.left-2 || r.right>ordered.at(-1)!.rect.right+2))return;
  const text=ordered.map(g=>g.text).join('');
  if(/\s/u.test(text) || !/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆]/u.test(text))return;
  return {text,offset:0,selection:true};
}
