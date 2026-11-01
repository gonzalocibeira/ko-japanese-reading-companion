import type {MascotTextTarget} from './mascot-target';

interface TextSource {text:string;rect:(start:number,end:number)=>DOMRect|undefined}

// A Docs word may span multiple annotated canvas runs, even one per kanji.
// Recover only contiguous, visible glyphs on the pointed row before tokenizing.
export function docsHoverTarget(root:ParentNode,x:number,y:number,source:(element:Element)=>TextSource|undefined):MascotTextTarget|undefined {
  const glyphs=new Map<string,{text:string;rect:DOMRect;current:()=>DOMRect|undefined}>();
  let inspected=0,measured=0;
  for(const element of root.querySelectorAll('svg rect[aria-label]')) {
    if(++inspected>4096)return;
    const bounds=element.getBoundingClientRect();
    if(y<bounds.top || y>bounds.bottom || !element.checkVisibility({checkVisibilityCSS:true}))continue;
    const run=source(element);if(!run || run.text.length>1000)continue;
    let offset=0;
    for(const char of run.text) {
      if(++measured>4000)return;
      const start=offset,end=offset+char.length;offset=end;
      const rect=run.rect(start,end);
      if(!rect)continue;
      // Overlapping canvas tiles can repeat the same painted glyph.
      const key=[rect.left,rect.top,rect.right,rect.bottom].map(n=>Math.round(n*10)).join(',');
      const previous=glyphs.get(key);if(previous && previous.text!==char)return;
      glyphs.set(key,{text:char,rect,current:()=>run.rect(start,end)});
      if(glyphs.size>1000)return;
    }
  }
  const pointed=[...glyphs.values()].find(g=>x>=g.rect.left && x<=g.rect.right && y>=g.rect.top && y<=g.rect.bottom);
  if(!pointed)return;
  // Ink heights vary across characters. Keep their shared row as context even
  // when the pointer is above a shorter neighbouring glyph.
  const ordered=[...glyphs.values()].filter(g=>g.rect.top<pointed.rect.bottom && g.rect.bottom>pointed.rect.top).sort((a,b)=>a.rect.left-b.rect.left);
  const hit=ordered.indexOf(pointed);
  const adjacent=(a:typeof ordered[number],b:typeof ordered[number])=>b.rect.left-a.rect.right<=2;
  let first=hit,last=hit;
  while(first>0 && adjacent(ordered[first-1],ordered[first]))first--;
  while(last+1<ordered.length && adjacent(ordered[last],ordered[last+1]))last++;
  const parts=ordered.slice(first,last+1);
  if(parts.some((glyph,i)=>i>0 && glyph.rect.left<parts[i-1].rect.right-2))return;
  let text='',offset=0;
  const spans=parts.map((glyph,i)=>{
    const start=text.length;if(first+i===hit)offset=start;
    text+=glyph.text;return {start,end:text.length,current:glyph.current};
  });
  if(text.length>1000)return;
  return {text,offset,rects:(start,end)=>{
    const rects:DOMRect[]=[];
    for(const part of spans)if(part.start<end && part.end>start) {
      const rect=part.current();if(!rect)return [];rects.push(rect);
    }
    return rects;
  }};
}
