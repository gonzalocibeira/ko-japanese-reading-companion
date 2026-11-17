import type {DictionaryHit,PlaygroundDataProvider} from './playground-data';
import type {PlaygroundTool} from './playground-tools';
import {decodePhoto,type PhotoAnalysis,type PhotoDetection,type PhotoRectangle} from './photo-vision';
import {countPhotoObjects,photoCounterGuide} from './photo-counters';
import {normalizePhotoLabel,photoVocabulary} from './photo-vocabulary';

export const photoLookupStyles=`
.photo-lookup,.photo-lookup-results{--photo-line:#d4c5ab;--photo-card:#faf3e4;--photo-faint:#eee2cb;--photo-radius:4px;color:var(--ink,#242b2d);font:14px/1.5 var(--body,system-ui);min-width:0;overflow-wrap:anywhere}
.photo-lookup[hidden],.photo-lookup [hidden],.photo-lookup-results [hidden],.photo-lookup-stage [hidden]{display:none}
.photo-lookup-scroll{overflow:auto;min-height:0;flex:1;padding:clamp(14px,3vw,32px);overscroll-behavior:contain}
.photo-lookup-heading{display:flex;align-items:center;justify-content:space-between;gap:8px 16px;flex-wrap:wrap;padding-bottom:17px}
.photo-lookup-heading h2{margin:0;font:750 clamp(24px,3vw,31px)/1.22 var(--body,system-ui);letter-spacing:-.03em}
.photo-lookup-results,.photo-lookup-empty{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(255px,1fr);align-items:start;gap:clamp(12px,2vw,22px)}
.photo-lookup-results.is-detached{display:block}
.photo-lookup-input{display:grid;place-content:center;justify-items:center;gap:10px;min-height:clamp(200px,42vh,380px);padding:22px;background:var(--photo-card);border:1px dashed #a89b83;border-radius:var(--photo-radius);text-align:center}
.photo-lookup-scroll.is-dragging .photo-lookup-input{background:var(--photo-faint);border-color:var(--seal,#9f3e2d);outline:2px solid var(--seal,#9f3e2d);outline-offset:-3px}
.photo-lookup-scroll.is-dragging .photo-lookup-media{outline:2px solid var(--seal,#9f3e2d);outline-offset:2px}
.photo-lookup-input p{margin:0;color:var(--muted,#625d50);font-size:13px}
.photo-lookup-source{display:inline-flex;position:relative;max-width:100%}
.photo-lookup-source input{clip-path:inset(50%);width:1px;height:1px;position:absolute;overflow:hidden;white-space:nowrap}
.photo-lookup-source span,.photo-lookup-results button{display:inline-block;color:var(--ink,#242b2d);background:transparent;border:1px solid var(--photo-line);border-radius:var(--photo-radius);padding:7px 10px;font:650 12px/1.4 var(--body,system-ui);margin:0;cursor:pointer;text-align:start}
.photo-lookup-source span{background:var(--photo-card);border-color:#b7aa92;padding:8px 12px}
.photo-lookup-input .photo-lookup-source span,.photo-lookup-results button.photo-primary{background:var(--seal,#9f3e2d);color:var(--paper,#f4ecd8);border-color:var(--seal,#9f3e2d)}
.photo-lookup-source:hover span,.photo-lookup-results button:hover:not(:disabled){background:var(--photo-faint)}
.photo-lookup-input .photo-lookup-source:hover span,.photo-lookup-results button.photo-primary:hover:not(:disabled){background:#813225;border-color:#813225}
.photo-lookup-source input:focus-visible + span,.photo-lookup-results button:focus-visible,.photo-lookup-results input:focus-visible{outline:2px solid var(--accent,#234e64);outline-offset:2px}
.photo-lookup-results button:disabled{opacity:.55;cursor:default}
.photo-lookup-inspector{display:grid;gap:12px;align-content:start;min-width:0;min-height:138px;padding:15px;background:var(--photo-card);border:1px solid var(--photo-line);border-radius:var(--photo-radius)}
.photo-lookup-results.is-detached .photo-lookup-inspector{border:0;background:transparent;padding:0;min-height:0;gap:10px}
.photo-lookup-inspector h3{margin:0;font:750 15px/1.4 var(--body,system-ui)}
.photo-lookup-inspector p,.photo-lookup-heading p{margin:0}
.photo-lookup-controls{display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:8px}
.photo-lookup-actions,.photo-lookup-choices{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.photo-lookup-results button[aria-pressed=true]{color:var(--paper,#f4ecd8);background:var(--accent,#234e64);border-color:var(--accent,#234e64)}
.photo-lookup-results button[aria-pressed=true]:hover{background:#17394b}
.photo-lookup-objects{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,110px),1fr));gap:6px}
.photo-lookup-objects button{min-width:0;overflow-wrap:anywhere}
.photo-lookup-choices:not(:empty){margin-top:6px}
.photo-lookup-media{display:grid;place-items:center;min-width:0;min-height:clamp(200px,48vh,530px);margin:0;background:#262928;border-radius:var(--photo-radius);border:1px solid #262928;overflow:hidden}
.photo-lookup-stage{position:relative;width:100%;margin:0;overflow:hidden;aspect-ratio:var(--photo-aspect,1);max-width:min(100%,var(--photo-limit,100%));cursor:crosshair;touch-action:none;user-select:none}
.photo-lookup-stage.is-detached{height:100%;max-width:none;aspect-ratio:auto;background:transparent}
.photo-lookup-stage canvas,.photo-lookup-stage svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.photo-lookup-stage canvas{display:block}
.photo-lookup-shape{fill:none;stroke:#fff3da;stroke-width:1px;stroke-opacity:.42;vector-effect:non-scaling-stroke}
.photo-lookup-stage.is-detached .photo-lookup-shape{stroke:#234e64;stroke-opacity:.56}
.photo-lookup-stage .is-active .photo-lookup-shape{fill:#d48a5d24;stroke:#ffbd8e;stroke-width:2.5px;stroke-opacity:1}
.photo-lookup-stage.is-detached .is-active .photo-lookup-shape{stroke:#9f3e2d;fill:#9f3e2d26}
.photo-lookup-stage .is-hovered .photo-lookup-shape{stroke:#ffe2ba;stroke-width:2px;stroke-opacity:1}
.photo-lookup-stage.is-detached .is-hovered .photo-lookup-shape{stroke:#9f3e2d;stroke-opacity:1}
.photo-lookup-drawn-crop{fill:#fff3da22;stroke:#ffe2ba;stroke-width:2px;stroke-dasharray:5 3;vector-effect:non-scaling-stroke}
.photo-lookup-stage.is-detached .photo-lookup-drawn-crop{stroke:#9f3e2d}
.photo-lookup-card{display:grid;min-width:0;gap:9px;border:1px solid var(--photo-line);border-inline-start:3px solid var(--seal,#9f3e2d);border-radius:var(--photo-radius);background:#fff9ed;padding:12px}
.photo-lookup-card:empty,.photo-lookup-feedback:empty,.photo-lookup-count:empty,.photo-lookup-choices:empty,.photo-lookup-objects:empty{display:none}
.photo-lookup-label{font:700 13px/1.4 var(--body,system-ui);color:var(--muted,#625d50)}
.photo-lookup-feedback{color:var(--muted,#625d50);font-size:13px}
.photo-lookup-scroll>.photo-lookup-feedback:not(:empty){margin:0 0 12px}
.photo-lookup-word{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 8px;color:var(--accent,#234e64);font:750 30px/1.34 var(--body,system-ui);letter-spacing:-.02em}
.photo-lookup-word small{font:600 14px/1.45 var(--body,system-ui);color:var(--muted,#625d50);letter-spacing:normal}
.photo-lookup-gloss{font-size:14px;color:var(--ink,#242b2d)}
.photo-lookup-results .photo-lookup-edit-button{border-color:transparent;color:var(--muted,#625d50);text-decoration:underline;text-underline-offset:2px}
.photo-lookup-count{padding:7px 9px;background:#e6ebea;border-radius:var(--photo-radius);color:var(--accent,#234e64);font-weight:650}
.photo-lookup-count small{display:block;margin-top:3px;font-size:12px;font-weight:400;color:var(--muted,#625d50)}
.photo-lookup-count-tools{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;margin-top:5px}
.photo-lookup-count-tools a{font:600 12px/1.4 var(--body,system-ui);color:var(--accent,#234e64);text-underline-offset:2px}
.photo-lookup-edit{display:flex;flex-wrap:wrap;gap:6px;align-items:end;margin:0}
.photo-lookup-edit label{display:grid;gap:3px;min-width:0;flex:1 1 120px;font-size:12px}
.photo-lookup-edit input{min-width:0;width:100%;padding:6px;color:var(--ink,#242b2d);background:var(--paper,#f4ecd8);border:1px solid var(--photo-line);border-radius:var(--photo-radius);font:inherit}
@container(max-width:690px){.photo-lookup-results,.photo-lookup-empty{grid-template-columns:minmax(0,1fr)}.photo-lookup-media{min-height:0}.photo-lookup-inspector{min-height:0}}
@media(max-width:540px){.photo-lookup-results,.photo-lookup-empty{grid-template-columns:minmax(0,1fr)}.photo-lookup-media{min-height:0}}
`;

type Point={x:number;y:number};
interface PhotoSource {preview:HTMLCanvasElement;width:number;height:number}
interface PhotoResultOptions {
  data:PlaygroundDataProvider;
  dictionary:(hit:DictionaryHit)=>void;
  analyze:(crop:PhotoRectangle|undefined,signal:AbortSignal)=>Promise<PhotoAnalysis>;
  save:(crop:PhotoRectangle,hit:DictionaryHit)=>Promise<void>;
  source?:PhotoSource;
  detachStage?:boolean;
  initialAnalysis?:PhotoAnalysis;
  onObjectSelect?:()=>void;
}
interface PhotoLookupOptions {
  data:PlaygroundDataProvider;
  dictionary:(hit:DictionaryHit)=>void;
  analyze:(image:Blob,crop:PhotoRectangle|undefined,signal:AbortSignal)=>Promise<PhotoAnalysis>;
  save:(image:Blob,crop:PhotoRectangle,hit:DictionaryHit)=>Promise<void>;
  initialImage?:Blob;
}

function element<K extends keyof HTMLElementTagNameMap>(tag:K,className?:string,content?:string):HTMLElementTagNameMap[K] {
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(content!==undefined)node.textContent=content;
  return node;
}

function button(label:string,action:()=>void):HTMLButtonElement {
  const el=element('button','',label);
  el.type='button';
  el.addEventListener('click',action);
  return el;
}

function svgElement<K extends keyof SVGElementTagNameMap>(tag:K):SVGElementTagNameMap[K] {
  return document.createElementNS('http://www.w3.org/2000/svg',tag);
}

function status(className:string):HTMLParagraphElement {
  const feedback=element('p',className);
  feedback.setAttribute('role','status');
  return feedback;
}

function formatWord(word:string,reading:string) {
  const japanese=element('span');
  japanese.lang='ja';
  japanese.textContent=word===reading || !reading?word:`${word}（${reading}）`;
  return japanese;
}

function polygonContains(point:Point,polygon:number[][]):boolean {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [x,y]=polygon[i],[previousX,previousY]=polygon[j];
    if((y>point.y)!==(previousY>point.y) && point.x<(previousX-x)*(point.y-y)/(previousY-y)+x)inside=!inside;
  }
  return inside;
}

function hitTest(point:Point,detection:PhotoDetection):boolean {
  if(detection.polygons?.length)return detection.polygons.some(polygon=>polygonContains(point,polygon));
  const {x,y,width,height}=detection.box;
  return point.x>=x && point.x<=x+width && point.y>=y && point.y<=y+height;
}

export function renderPhotoResults(options:PhotoResultOptions):PlaygroundTool & {stage:HTMLElement;setStageAvailable:(available:boolean)=>void} {
  const root=element('section',`photo-lookup-results${options.detachStage?' is-detached':''}`);
  root.setAttribute('aria-label','Object lookup');
  const stage=element('div',`photo-lookup-stage${options.detachStage?' is-detached':''}`);
  if(options.source)stage.append(options.source.preview);
  const svg=svgElement('svg'),overlays=svgElement('g'),drawn=svgElement('rect');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('preserveAspectRatio','none');
  drawn.classList.add('photo-lookup-drawn-crop');
  drawn.style.display='none';
  svg.append(overlays,drawn);
  stage.append(svg);

  const actions=element('div','photo-lookup-actions'),feedback=status('photo-lookup-feedback');
  const countOutput=status('photo-lookup-count'),objects=element('div','photo-lookup-objects');
  countOutput.tabIndex=-1;
  const countGuide=element('a','','Counter guide');
  countGuide.href=photoCounterGuide;countGuide.target='_blank';countGuide.rel='noopener noreferrer';
  const overlaps=element('div','photo-lookup-choices'),card=element('div','photo-lookup-card');
  objects.setAttribute('role','group');
  objects.setAttribute('aria-label','Detected objects');
  overlaps.setAttribute('role','group');
  overlaps.setAttribute('aria-label','Overlapping objects');
  card.setAttribute('aria-label','Selected object');

  let disposed=false,counting=false,useGeneralCount=false,cropping=false,busy=false,stageAvailable=true;
  let width=options.source?.width ?? 0,height=options.source?.height ?? 0;
  let detections:PhotoDetection[]=[];
  let active:PhotoDetection|undefined,selection=new Set<string>();
  let analysis:AbortController|undefined,lookup:AbortController|undefined;
  let retryRegion:PhotoRectangle|undefined;
  let crop:PhotoRectangle|undefined,drag:{start:Point;pointer:number}|undefined;
  const editedLabels=new Map<string,string>();
  const numbers=new Map<string,number>();
  const words=new Map<string,DictionaryHit[]>();
  const items=new Map<string,HTMLButtonElement>();
  const shapes=new Map<string,SVGGElement>();

  const countButton=button('Count',()=>{
    counting=!counting;
    useGeneralCount=false;
    countButton.setAttribute('aria-pressed',String(counting));
    selection=new Set(counting && active?[active.id]:[]);
    refreshSelections();
  });
  countButton.setAttribute('aria-pressed','false');
  const drawButton=button('Crop and retry',()=>setCropping(true));
  const runCrop=button('Analyze crop',()=>{
    if(!crop)return;
    const region=crop;
    setCropping(false);
    void analyze(region);
  });
  const cancelCrop=button('Cancel crop',()=>setCropping(false));
  const retry=button('Try again',()=>void analyze(retryRegion));
  runCrop.classList.add('photo-primary');
  runCrop.hidden=cancelCrop.hidden=retry.hidden=true;
  countButton.hidden=true;
  drawButton.disabled=!width || !height;
  actions.append(countButton,drawButton,runCrop,cancelCrop,retry);
  const controls=element('div','photo-lookup-controls');
  controls.append(element('h3','','Objects'),actions);
  const inspector=element('aside','photo-lookup-inspector');
  inspector.append(controls,feedback,countOutput,overlaps,card,objects);
  if(!options.detachStage) {
    const media=element('figure','photo-lookup-media');
    media.append(stage);
    root.append(media);
  }
  root.append(inspector);

  const labelFor=(object:PhotoDetection)=>editedLabels.get(object.id) ?? object.label;
  const displayObject=(object:PhotoDetection)=>numbers.has(object.id)?`${labelFor(object)} ${numbers.get(object.id)}`:labelFor(object);

  function dimensions(nextWidth:number,nextHeight:number) {
    width=nextWidth;
    height=nextHeight;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    stage.style.setProperty('--photo-aspect',`${width} / ${height}`);
    stage.style.setProperty('--photo-limit',`calc(62vh * ${width/height})`);
  }

  function refreshSelections() {
    for(const [id,item] of items) {
      const selected=counting?selection.has(id):active?.id===id;
      item.setAttribute('aria-pressed',String(selected));
      shapes.get(id)?.classList.toggle('is-active',selected);
    }
    countOutput.replaceChildren();
    if(!counting)return;
    const labels=detections.filter(object=>selection.has(object.id)).map(labelFor);
    const japanese=countPhotoObjects(labels,useGeneralCount);
    const tools=element('div','photo-lookup-count-tools');
    if(japanese.kind==='empty') {
      countOutput.textContent='Select objects to see their Japanese counter.';
    } else {
      countOutput.append(`${labels.length} selected`);
      if(japanese.kind==='word' || japanese.kind==='general') {
        countOutput.append(' · ',formatWord(japanese.word,japanese.reading));
        if(japanese.kind==='general')countOutput.append(element('small','','General count for things.'));
      } else {
        const hint={
          mixed:'Choose objects that share a counter.',
          unsupported:'Counter unavailable for this selection.',
          'out-of-range':'Select up to 99 objects to see the Japanese count.',
          'offer-general':'Use the general count for inanimate objects.',
        }[japanese.kind];
        countOutput.append(element('small','',hint));
        if(japanese.kind==='offer-general')tools.append(button('Count as things',()=>{
          useGeneralCount=true;
          refreshSelections();
          countOutput.focus({preventScroll:true});
        }));
      }
    }
    tools.append(countGuide);
    countOutput.append(tools);
  }

  function markHover(id?:string) {
    for(const [key,shape] of shapes)shape.classList.toggle('is-hovered',key===id);
  }

  function setCropping(value:boolean) {
    if(value && !stageAvailable)return;
    cropping=value;
    stage.classList.toggle('is-cropping',value);
    crop=undefined;
    drag=undefined;
    drawn.style.display='none';
    runCrop.hidden=cancelCrop.hidden=!value;
    drawButton.hidden=value || !stageAvailable;
    runCrop.disabled=true;
    overlaps.replaceChildren();
    feedback.textContent=value?'Drag a rectangle around the object, then choose Analyze crop.':'';
    if(!value && stageAvailable)drawButton.focus({preventScroll:true});
  }

  function select(object:PhotoDetection) {
    overlaps.replaceChildren();
    feedback.textContent='';
    useGeneralCount=false;
    if(counting && selection.has(object.id)) {
      selection.delete(object.id);
      if(active?.id===object.id) {
        active=detections.find(item=>selection.has(item.id));
        if(active)void lookupObject(active);
        else {lookup?.abort();card.replaceChildren();}
      }
    } else {
      if(counting)selection.add(object.id);
      if(active?.id!==object.id)options.onObjectSelect?.();
      active=object;
      void lookupObject(object);
    }
    refreshSelections();
  }

  function selectAt(point:Point) {
    const matches=detections.filter(object=>hitTest(point,object));
    if(matches.length===1){select(matches[0]);return;}
    overlaps.replaceChildren();
    if(!matches.length) {
      feedback.textContent='No detected object here. You can draw a smaller crop and retry.';
      return;
    }
    feedback.textContent='Choose the object you meant.';
    for(const object of matches)overlaps.append(button(displayObject(object),()=>{
      select(object);
      items.get(object.id)?.focus({preventScroll:true});
    }));
    (overlaps.firstElementChild as HTMLButtonElement).focus({preventScroll:true});
  }

  function labelEditor(object:PhotoDetection) {
    const form=element('form','photo-lookup-edit'),label=element('label','','English label');
    const input=element('input');
    input.value=labelFor(object);
    input.maxLength=80;
    input.required=true;
    input.autocomplete='off';
    label.append(input);
    const submit=element('button','','Update label');
    submit.type='submit';
    form.append(label,submit,button('Cancel',()=>void lookupObject(object)));
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const corrected=input.value.trim();
      if(!corrected || !/\p{Script=Latin}/u.test(corrected)) {
        input.setCustomValidity('Enter an English object label.');
        input.reportValidity();
        return;
      }
      editedLabels.set(object.id,corrected);
      useGeneralCount=false;
      const item=items.get(object.id);
      if(item)item.textContent=displayObject(object);
      refreshSelections();
      void lookupObject(object);
    });
    input.addEventListener('input',()=>input.setCustomValidity(''));
    card.querySelector('.photo-lookup-edit')?.remove();
    card.append(form);
    input.focus();
    input.select();
  }

  async function lookupObject(object:PhotoDetection) {
    lookup?.abort();
    const controller=new AbortController();
    lookup=controller;
    const label=labelFor(object);
    const controls=element('div','photo-lookup-actions'),edit=button('Edit label',()=>labelEditor(object));
    edit.classList.add('photo-lookup-edit-button');
    controls.append(edit);
    const meaning=element('div'),result=status('photo-lookup-feedback');
    const modelLabel=element('p','photo-lookup-label',label);
    card.replaceChildren(modelLabel,meaning,controls,result);
    result.textContent='Looking up Japanese…';
    const current=()=>!disposed && !controller.signal.aborted;

    function showHit(hit:DictionaryHit,focus=false) {
      const name=element('p','photo-lookup-word');
      name.lang='ja';
      name.append(element('span','',hit.headword));
      if(hit.reading && hit.reading!==hit.headword)name.append(element('small','',hit.reading));
      const gloss=element('p','photo-lookup-gloss',hit.meaning);
      const save=button('Save to Picture Diary',()=>{
        save.disabled=true;
        result.textContent='Saving crop…';
        void options.save(object.box,hit).then(()=>{
          if(current())result.textContent='Saved to Picture Diary.';
        },error=>{
          if(!current())return;
          save.disabled=false;
          result.textContent=error instanceof Error?error.message:'Could not save the crop. Try again.';
        });
      });
      save.classList.add('photo-primary');
      const dictionary=button('Open Dictionary',()=>options.dictionary(hit));
      modelLabel.hidden=normalizePhotoLabel(hit.meaning).split(' (')[0]===normalizePhotoLabel(label);
      meaning.replaceChildren(name,gloss);
      controls.replaceChildren(save,dictionary,edit);
      result.textContent='';
      if(focus)dictionary.focus({preventScroll:true});
    }

    try {
      const key=normalizePhotoLabel(label);
      const hits=words.get(key) ?? await photoVocabulary(options.data,label,controller.signal);
      if(!current())return;
      if(!words.has(key))words.set(key,hits);
      result.textContent='';
      if(hits.length===1){showHit(hits[0]);return;}
      if(!hits.length){result.textContent='No reliable match in the local Japanese dictionary.';return;}
      const choices=element('div','photo-lookup-choices');
      choices.setAttribute('role','group');
      choices.setAttribute('aria-label','Japanese word choices');
      for(const hit of hits) {
        const choice=button('',()=>showHit(hit,true));
        choice.append(formatWord(hit.headword,hit.reading),` · ${hit.meaning}`);
        choices.append(choice);
      }
      meaning.append(element('p','','Choose the Japanese word that fits.'),choices);
    } catch {
      if(!current())return;
      result.textContent='The local dictionary could not finish.';
      controls.append(button('Retry lookup',()=>void lookupObject(object)));
    }
  }

  function applyAnalysis(result:PhotoAnalysis) {
    dimensions(result.width,result.height);
    lookup?.abort();
    detections=result.detections;
    active=undefined;
    selection.clear();
    numbers.clear();
    editedLabels.clear();
    items.clear();
    shapes.clear();
    objects.replaceChildren();
    overlays.replaceChildren();
    overlaps.replaceChildren();
    card.replaceChildren();
    const groups=new Map<string,PhotoDetection[]>();
    for(const detection of detections) {
      const list=groups.get(detection.label) ?? [];
      list.push(detection);
      groups.set(detection.label,list);
    }
    for(const group of groups.values()) {
      if(group.length>1)group.forEach((detection,index)=>numbers.set(detection.id,index+1));
    }
    for(const detection of detections) {
      const item=button(displayObject(detection),()=>select(detection)),shape=svgElement('g');
      item.addEventListener('focus',()=>markHover(detection.id));
      item.addEventListener('blur',()=>markHover());
      item.addEventListener('pointerenter',()=>markHover(detection.id));
      item.addEventListener('pointerleave',()=>markHover());
      if(detection.polygons?.length) {
        for(const polygon of detection.polygons) {
          const outline=svgElement('polygon');
          outline.setAttribute('points',polygon.map(point=>point.join(',')).join(' '));
          outline.classList.add('photo-lookup-shape');
          shape.append(outline);
        }
      } else {
        const box=svgElement('rect');
        box.classList.add('photo-lookup-shape');
        for(const [key,value] of Object.entries(detection.box))box.setAttribute(key,String(value));
        shape.append(box);
      }
      objects.append(item);
      overlays.append(shape);
      items.set(detection.id,item);
      shapes.set(detection.id,shape);
    }
    countButton.hidden=!detections.length;
    drawButton.disabled=false;
    refreshSelections();
    feedback.textContent=detections.length?'Select an object in the image or list.':'No objects detected. Try a clearer photo or a tighter crop.';
  }

  async function analyze(region:PhotoRectangle|undefined) {
    if(disposed)return;
    analysis?.abort();
    const controller=new AbortController();
    analysis=controller;
    busy=true;
    drawButton.disabled=true;
    retry.hidden=true;
    feedback.textContent='Looking for objects on this device…';
    try {
      const result=await options.analyze(region,controller.signal);
      if(!disposed && !controller.signal.aborted)applyAnalysis(result);
    } catch(error) {
      if(disposed || controller.signal.aborted)return;
      retryRegion=region;
      retry.hidden=false;
      feedback.textContent=error instanceof Error?error.message:'Photo Lookup could not analyze the image.';
    } finally {
      if(analysis===controller) {
        busy=false;
        drawButton.disabled=!width || !height;
      }
    }
  }

  function stagePoint(event:MouseEvent):Point {
    const bounds=stage.getBoundingClientRect();
    return {
      x:Math.min(width,Math.max(0,(event.clientX-bounds.left)*width/bounds.width)),
      y:Math.min(height,Math.max(0,(event.clientY-bounds.top)*height/bounds.height)),
    };
  }

  function drawTo(point:Point) {
    if(!drag)return;
    const x=Math.floor(Math.min(drag.start.x,point.x)),y=Math.floor(Math.min(drag.start.y,point.y));
    crop={x,y,width:Math.ceil(Math.max(drag.start.x,point.x))-x,height:Math.ceil(Math.max(drag.start.y,point.y))-y};
    drawn.style.display='';
    for(const [key,value] of Object.entries(crop))drawn.setAttribute(key,String(value));
    runCrop.disabled=crop.width<4 || crop.height<4;
  }

  stage.addEventListener('pointerdown',event=>{
    if(!cropping || event.button!==0)return;
    event.preventDefault();
    drag={start:stagePoint(event),pointer:event.pointerId};
    stage.setPointerCapture(event.pointerId);
    drawTo(drag.start);
  });
  stage.addEventListener('pointermove',event=>{
    if((!cropping && !busy) || (cropping && drag?.pointer===event.pointerId)) {
      const point=stagePoint(event);
      if(cropping)drawTo(point);else markHover(detections.find(object=>hitTest(point,object))?.id);
    }
  });
  stage.addEventListener('pointerup',event=>{
    if(!cropping || drag?.pointer!==event.pointerId)return;
    drawTo(stagePoint(event));
    drag=undefined;
  });
  stage.addEventListener('pointercancel',()=>{
    if(!drag)return;
    drag=undefined;
    crop=undefined;
    drawn.style.display='none';
    runCrop.disabled=true;
  });
  stage.addEventListener('pointerleave',()=>markHover());
  stage.addEventListener('click',event=>{
    if(!cropping && !busy && width && height)selectAt(stagePoint(event));
  });
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape' && cropping){event.preventDefault();event.stopPropagation();setCropping(false);}
  });

  if(width && height)dimensions(width,height);
  if(options.initialAnalysis)applyAnalysis(options.initialAnalysis);
  else queueMicrotask(()=>void analyze(undefined));

  return {
    element:root,stage,
    focus:()=>{const first=items.values().next().value as HTMLButtonElement|undefined;(first ?? drawButton).focus({preventScroll:true});},
    setStageAvailable:available=>{
      stageAvailable=available;
      if(!available && cropping)setCropping(false);
      drawButton.hidden=!available || cropping;
    },
    dispose:()=>{disposed=true;analysis?.abort();lookup?.abort();},
  };
}

export function renderPhotoLookup(options:PhotoLookupOptions):PlaygroundTool {
  const root=element('section','playground-workspace photo-lookup');
  const scroll=element('div','photo-lookup-scroll'),drop=element('div','photo-lookup-input');
  const heading=element('div','photo-lookup-heading');
  heading.append(element('h2','','Photo Lookup'));
  const label=element('label','photo-lookup-source'),input=element('input'),labelText=element('span','','Choose an image');
  input.type='file';
  input.accept='image/*';
  label.append(input,labelText);
  const feedback=status('photo-lookup-feedback'),host=element('div');
  const empty=element('div','photo-lookup-empty'),inspector=element('aside','photo-lookup-inspector');
  inspector.append(element('h3','','Objects'),element('p','photo-lookup-feedback','Select an object to see its Japanese name. Photos stay on this device.'));
  drop.append(label,element('p','','You can also paste or drop an image.'));
  empty.append(drop,inspector);
  host.append(empty);
  scroll.append(heading,feedback,host);
  root.append(scroll);

  let disposed=false,revision=0;
  let result:ReturnType<typeof renderPhotoResults>|undefined;

  async function open(blob:Blob) {
    if(disposed)return;
    if(blob.type && !blob.type.startsWith('image/')) {
      feedback.textContent='Choose an image file.';
      return;
    }
    const request=++revision;
    feedback.textContent='Opening the image…';
    let image:ImageBitmap|undefined;
    try {
      image=await decodePhoto(blob);
      if(disposed || request!==revision)return;
      const canvas=element('canvas');
      canvas.setAttribute('aria-hidden','true');
      const scale=Math.min(1,1600/Math.max(image.width,image.height));
      canvas.width=Math.max(1,Math.round(image.width*scale));
      canvas.height=Math.max(1,Math.round(image.height*scale));
      const context=canvas.getContext('2d');
      if(!context)throw new Error('Kō could not display this image.');
      context.drawImage(image,0,0,canvas.width,canvas.height);
      result?.dispose();
      result=renderPhotoResults({
        data:options.data,dictionary:options.dictionary,
        source:{preview:canvas,width:image.width,height:image.height},
        analyze:(crop,signal)=>options.analyze(blob,crop,signal),
        save:(crop,hit)=>options.save(blob,crop,hit),
      });
      if(label.parentElement!==heading) {
        const focused=document.activeElement===input;
        heading.append(label);
        labelText.textContent='Change image';
        if(focused)input.focus({preventScroll:true});
      }
      host.replaceChildren(result.element);
      feedback.textContent='';
    } catch(error) {
      if(!disposed && request===revision)feedback.textContent=error instanceof Error?error.message:'This image could not be opened.';
    } finally {
      image?.close();
    }
  }

  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    input.value='';
    if(file)void open(file);
  });
  scroll.addEventListener('dragover',event=>{
    if(!event.dataTransfer?.types.includes('Files'))return;
    event.preventDefault();
    event.dataTransfer.dropEffect='copy';
    scroll.classList.add('is-dragging');
  });
  scroll.addEventListener('dragleave',event=>{
    if(!(event.relatedTarget instanceof Node) || !scroll.contains(event.relatedTarget))scroll.classList.remove('is-dragging');
  });
  scroll.addEventListener('drop',event=>{
    event.preventDefault();
    scroll.classList.remove('is-dragging');
    const file=event.dataTransfer?.files[0];
    if(file)void open(file);
  });
  const paste=(event:ClipboardEvent)=>{
    if(!root.isConnected || !root.getClientRects().length)return;
    const file=Array.from(event.clipboardData?.files ?? []).find(item=>item.type.startsWith('image/'));
    if(file){event.preventDefault();void open(file);}
  };
  document.addEventListener('paste',paste);
  if(options.initialImage)void open(options.initialImage);

  return {element:root,focus:()=>input.focus({preventScroll:true}),dispose:()=>{
    disposed=true;
    document.removeEventListener('paste',paste);
    result?.dispose();
  }};
}
