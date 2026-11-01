import {test,expect} from '@playwright/test';
import {docsHoverTarget} from '../src/docs-hover';

interface Run {text:string;x:number;y?:number;inkTop?:number;hidden?:boolean;connected?:boolean}
function fixture(runs:Run[]) {
  const box=(x:number,y:number,width:number)=>({left:x,right:x+width,top:y,bottom:y+24,width,height:24}) as DOMRect;
  const elements=runs.map(run=>({
    getBoundingClientRect:()=>box(run.x,run.y ?? 0,[...run.text].length*24),
    checkVisibility:()=>!run.hidden
  }));
  const root={querySelectorAll:()=>elements} as unknown as ParentNode;
  const source=(element:Element)=>{
    const i=elements.indexOf(element as unknown as typeof elements[number]),run=runs[i];
    return {text:run.text,rect:(start:number,end:number)=>{
      if(run.connected===false)return;
      const left=[...run.text.slice(0,start)].length*24,width=[...run.text.slice(start,end)].length*24;
      const rect=box(run.x+left,run.y ?? 0,width);
      return {...rect,top:rect.top+(run.inkTop ?? 0),height:rect.height-(run.inkTop ?? 0)} as DOMRect;
    }};
  };
  return (x:number,y=12)=>docsHoverTarget(root,x,y,source);
}

test('Docs hover reconstructs split words in visual order and removes repeated canvas glyphs',()=>{
  const target=fixture([{text:'機',x:48},{text:'洗',x:0},{text:'濯',x:24},{text:'洗濯',x:0}]);
  for(const [x,offset] of [[12,0],[36,1],[60,2]]) {
    const result=target(x)!;
    expect({text:result.text,offset:result.offset}).toEqual({text:'洗濯機',offset});
    expect(result.rects!(0,3)).toHaveLength(3);
    expect(result.rects!(1,2)).toHaveLength(1);
  }
  expect(target(90)).toBeUndefined();
  expect(fixture([{text:'洗',x:0,inkTop:8},{text:'濯',x:24},{text:'機',x:48,inkTop:4}])(36,2)?.text).toBe('洗濯機');
});

test('Docs hover keeps missing glyphs, hidden runs and separate rows out of the word',()=>{
  expect(fixture([{text:'洗',x:0},{text:'機',x:48}])(60)?.text).toBe('機');
  expect(fixture([{text:'洗',x:0},{text:'濯',x:24,hidden:true},{text:'機',x:48}])(12)?.text).toBe('洗');
  expect(fixture([{text:'洗濯',x:0},{text:'機',x:48,y:40}])(12)?.text).toBe('洗濯');
  expect(fixture([{text:'洗',x:0},{text:'濯',x:0}])(12)).toBeUndefined();
  expect(fixture([{text:'洗濯機',x:0},{text:'機',x:12}])(60)).toBeUndefined();
});

test('Docs hover preserves UTF-16 offsets and discards stale word hit areas',()=>{
  const runs=[{text:'𠮷',x:0,connected:true},{text:'野',x:24,connected:true}];
  const result=fixture(runs)(36)!;
  expect({text:result.text,offset:result.offset}).toEqual({text:'𠮷野',offset:2});
  expect(result.rects!(0,2)).toHaveLength(1);
  runs[0].connected=false;
  expect(result.rects!(0,3)).toEqual([]);
});
