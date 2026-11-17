import {build} from 'esbuild';
import {chromium,expect,test,type Browser,type Page} from '@playwright/test';
import {countPhotoObjects,photoCounterGuide} from '../src/photo-counters';
import {photoVocabulary} from '../src/photo-vocabulary';
import type {DictionaryHit,PlaygroundDataProvider} from '../src/playground-data';

const word=(headword:string,reading:string,meaning:string,common=true):DictionaryHit=>({
  id:headword,bucket:'00',headword,reading,meaning,common,pos:['noun (common) (futsuumeishi)'],
});

test('photo vocabulary uses object senses and keeps legitimate choices',async()=>{
  const records:Record<string,DictionaryHit[]>={
    傘:[word('傘','かさ','umbrella; parasol')],
    本:[word('本','もと','origin; source'),word('本','ほん','book; volume')],
    山:[word('山','やま','mountain; hill; mine')],
    カップ:[word('カップ','カップ','cup (drinking vessel, measure)')],
    コップ:[word('コップ','コップ','cop; police officer'),word('洋杯','コップ','glass (drinking vessel); tumbler')],
    マウス:[word('マウス','マウス','mouse (esp. a laboratory mouse); (computer) mouse')],
    fork:[word('分岐','ぶんき','branching; fork (of a road)'),word('フォーク','フォーク','fork (for eating); fork')],
    license:[word('免許','めんきょ','authorization; licence; license')],
  };
  const data=(async(query:{query:string})=>({hits:records[query.query] ?? []})) as PlaygroundDataProvider;
  const lookup=(label:string)=>photoVocabulary(data,label,new AbortController().signal);
  expect(await lookup('Umbrella')).toMatchObject([{headword:'傘',reading:'かさ',meaning:'umbrella'}]);
  expect(await lookup('books')).toMatchObject([{headword:'本',reading:'ほん'}]);
  expect(await lookup('mountain')).toMatchObject([{headword:'山',reading:'やま'}]);
  expect(await lookup('cup')).toMatchObject([{headword:'カップ'},{headword:'コップ',meaning:'glass (drinking vessel)'}]);
  expect(await lookup('computer mouse')).toMatchObject([{meaning:'(computer) mouse'}]);
  expect(await lookup('fork')).toMatchObject([{headword:'フォーク'}]);
  expect(await lookup('license plate')).toEqual([]);
});

test('photo counters use shared object categories and the correct readings above ten',()=>{
  expect(countPhotoObjects(['Bottle','bottles','bottle'])).toEqual({kind:'word',word:'三本',reading:'さんぼん'});
  expect(countPhotoObjects(['cat','cat','cat'])).toEqual({kind:'word',word:'三匹',reading:'さんびき'});
  expect(countPhotoObjects(Array(8).fill('book'))).toEqual({kind:'word',word:'八冊',reading:'はっさつ'});
  expect(countPhotoObjects(['photo'])).toEqual({kind:'word',word:'一枚',reading:'いちまい'});
  expect(countPhotoObjects(Array(4).fill('car'))).toEqual({kind:'word',word:'四台',reading:'よんだい'});
  expect(countPhotoObjects(['Buses','red pickup truck','small blue cars'])).toEqual({kind:'word',word:'三台',reading:'さんだい'});
  expect(countPhotoObjects(['person'])).toEqual({kind:'word',word:'一人',reading:'ひとり'});
  expect(countPhotoObjects(['man','child'])).toEqual({kind:'word',word:'二人',reading:'ふたり'});
  expect(countPhotoObjects(Array(14).fill('person'))).toEqual({kind:'word',word:'十四人',reading:'じゅうよにん'});
  expect(countPhotoObjects(['people','child','man','woman'])).toEqual({kind:'word',word:'四人',reading:'よにん'});
  expect(countPhotoObjects(Array(8).fill('horse'))).toEqual({kind:'word',word:'八頭',reading:'はっとう'});
  expect(countPhotoObjects(['bird','geese','duck'])).toEqual({kind:'word',word:'三羽',reading:'さんわ'});
  expect(countPhotoObjects(['pair of shoes','pair of socks','pair of boots'])).toEqual({kind:'word',word:'三足',reading:'さんぞく'});
  expect(countPhotoObjects(Array(10).fill('egg'))).toEqual({kind:'word',word:'十個',reading:'じゅっこ'});
  expect(countPhotoObjects(Array(11).fill('egg'))).toEqual({kind:'word',word:'十一個',reading:'じゅういっこ'});
  expect(countPhotoObjects(Array(20).fill('bottle'))).toEqual({kind:'word',word:'二十本',reading:'にじゅっぽん'});
  expect(countPhotoObjects(['book','notebook'])).toEqual({kind:'word',word:'二冊',reading:'にさつ'});
});

test('the general count is available for things and stays separate from animate counts',()=>{
  expect(countPhotoObjects([])).toEqual({kind:'empty'});
  expect(countPhotoObjects(['backpack','backpack','backpack','backpack'])).toEqual({kind:'general',word:'四つ',reading:'よっつ'});
  expect(countPhotoObjects(Array(10).fill('backpack'))).toEqual({kind:'general',word:'十',reading:'とお'});
  expect(countPhotoObjects(Array(12).fill('backpack'))).toEqual({kind:'general',word:'十二',reading:'じゅうに'});
  expect(countPhotoObjects(['bottle','book','statue'])).toEqual({kind:'offer-general'});
  expect(countPhotoObjects(['bottle','book','statue'],true)).toEqual({kind:'general',word:'三つ',reading:'みっつ'});
  expect(countPhotoObjects(['car','person'],true)).toEqual({kind:'mixed'});
  expect(countPhotoObjects(['sky'],true)).toEqual({kind:'unsupported'});
});

test.describe('Photo Lookup interaction',()=>{
  let source:string,browser:Browser;
  const initial={width:100,height:100,detections:[
    {id:'1',label:'bottle',score:.9,box:{x:10,y:8,width:24,height:24},polygons:[[[10,8],[34,8],[10,32]]]},
    {id:'2',label:'bottle',score:.9,box:{x:15,y:10,width:24,height:24}},
    {id:'3',label:'bottle',score:.9,box:{x:60,y:10,width:20,height:20}},
    {id:'4',label:'umbrella',score:.8,box:{x:60,y:60,width:25,height:25}},
  ]};

  test.beforeAll(async()=>{
    const bundle=await build({entryPoints:['src/photo-lookup.ts'],bundle:true,write:false,platform:'browser',target:'chrome116',format:'iife',globalName:'photoModule'});
    source=bundle.outputFiles[0].text;
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true});
  });
  test.afterAll(async()=>{await browser?.close();});

  async function setup(page:Page,detached:boolean,scene=initial) {
    await page.context().setOffline(true);
    await page.setContent('<!doctype html><meta charset="utf-8"><main></main><div id="overlay" style="width:200px;height:200px"></div>');
    await page.addScriptTag({content:source});
    return page.evaluate(({initial,detached})=>{
      const m=(window as any).photoModule;
      const style=document.createElement('style');style.textContent=m.photoLookupStyles;document.head.append(style);
      const vocabulary:Record<string,{headword:string;reading:string;meaning:string}>={
        瓶:{headword:'瓶',reading:'びん',meaning:'bottle; jar'},
        ボトル:{headword:'ボトル',reading:'ボトル',meaning:'bottle'},
        傘:{headword:'傘',reading:'かさ',meaning:'umbrella'},
        猫:{headword:'猫',reading:'ねこ',meaning:'cat'},
      };
      const saveLog:unknown[]=[],dictionaryLog:unknown[]=[],analysisLog:unknown[]=[];
      (window as any).lookupLog={saveLog,dictionaryLog,analysisLog};
      const data=async({query}:{query:string})=>({hits:vocabulary[query]?[{...vocabulary[query],id:query,bucket:'00',pos:['noun (common)'],common:true}]:[]});
      const dictionary=(hit:{id:string})=>dictionaryLog.push(hit.id);
      const analyze=async(crop:unknown)=>{analysisLog.push(crop ?? null);return crop?{...initial,detections:[initial.detections[3]]}:initial;};
      const save=async(crop:unknown,hit:{id:string})=>{saveLog.push({crop,id:hit.id});};
      if(detached) {
        const app=m.renderPhotoResults({data,dictionary,analyze,save,detachStage:true,initialAnalysis:initial});
        document.querySelector('main')!.append(app.element);
        document.querySelector('#overlay')!.append(app.stage);
        return '';
      }
      const app=m.renderPhotoLookup({data,dictionary,analyze:(_blob:Blob,crop:unknown)=>analyze(crop),save:(_blob:Blob,crop:unknown,hit:{id:string})=>save(crop,hit)});
      document.querySelector('main')!.append(app.element);
      const canvas=document.createElement('canvas');canvas.width=canvas.height=100;
      return canvas.toDataURL('image/png').split(',')[1];
    },{initial:scene,detached});
  }

  test('chooses a photo, selects with a keyboard, counts, edits, opens Dictionary and saves',async()=>{
    const page=await browser.newPage();
    try {
      const image=await setup(page,false);
      await page.getByLabel('Choose an image').setInputFiles({name:'sample.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
      const objects=page.getByRole('group',{name:'Detected objects'});
      const umbrella=objects.getByRole('button',{name:'umbrella'});
      await umbrella.focus();await page.keyboard.press('Enter');
      await expect(page.locator('.photo-lookup-word span')).toHaveText('傘');
      await expect(page.locator('.photo-lookup-word small')).toHaveText('かさ');
      await expect(page.locator('.photo-lookup-gloss')).toHaveText('umbrella');
      await page.getByRole('button',{name:'Open Dictionary'}).click();
      await page.getByRole('button',{name:'Save to Picture Diary'}).click();
      await expect(page.getByText('Saved to Picture Diary.')).toBeVisible();
      await page.getByRole('button',{name:'Edit label'}).click();
      await page.getByLabel('English label').fill('cat');await page.getByRole('button',{name:'Update label'}).click();
      await expect(page.locator('.photo-lookup-word span')).toHaveText('猫');
      await expect(page.locator('.photo-lookup-word small')).toHaveText('ねこ');
      await expect(page.locator('.photo-lookup-gloss')).toHaveText('cat');
      await page.getByRole('button',{name:'Count',exact:true}).click();
      await objects.getByRole('button',{name:'cat'}).click();
      for(let index=1;index<=3;index++)await objects.getByRole('button',{name:`bottle ${index}`}).click();
      await expect(page.locator('.photo-lookup-count')).toContainText('3 selected · 三本（さんぼん）');
      await page.getByRole('group',{name:'Japanese word choices'}).getByRole('button',{name:'瓶（びん） · bottle'}).click();
      await expect(page.locator('.photo-lookup-word span')).toHaveText('瓶');
      await expect(page.locator('.photo-lookup-word small')).toHaveText('びん');
      await expect(page.locator('.photo-lookup-gloss')).toHaveText('bottle');
      await objects.getByRole('button',{name:'cat'}).click();
      await expect(page.locator('.photo-lookup-count')).toContainText('4 selected');
      await expect(page.getByText('Choose objects that share a counter.')).toBeVisible();
      const log=await page.evaluate(()=>(window as any).lookupLog);
      expect(log.analysisLog).toEqual([null]);
      expect(log.dictionaryLog).toEqual(['傘']);
      expect(log.saveLog).toEqual([{crop:initial.detections[3].box,id:'傘'}]);
      const media=page.locator('.photo-lookup-media'),inspector=page.locator('.photo-lookup-inspector');
      const wideMedia=(await media.boundingBox())!,wideInspector=(await inspector.boundingBox())!;
      expect(wideMedia.x).toBeLessThan(wideInspector.x);
      expect(wideMedia.y).toBe(wideInspector.y);
      await page.setViewportSize({width:390,height:845});
      const narrowMedia=(await media.boundingBox())!,narrowInspector=(await inspector.boundingBox())!;
      expect(narrowMedia.x).toBe(narrowInspector.x);
      expect(narrowMedia.y).toBeLessThan(narrowInspector.y);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(390);
    } finally {await page.close();}
  });

  test('four cars show 四台 in current-tab lookup and general counts require a choice for mixed things',async()=>{
    const page=await browser.newPage();
    try {
      const carDetections=initial.detections.map(detection=>({...detection,label:'car'}));
      const box={x:5,y:40,width:20,height:20};
      await setup(page,true,{...initial,detections:[...carDetections,
        {id:'5',label:'statue',score:.9,box},{id:'6',label:'person',score:.9,box},
      ]});
      const objects=page.getByRole('group',{name:'Detected objects'});
      const count=page.locator('.photo-lookup-count');
      await page.getByRole('button',{name:'Count',exact:true}).click();
      await expect(count).toContainText('Select objects to see their Japanese counter.');
      await expect(page.getByRole('link',{name:'Counter guide'})).toHaveAttribute('href',photoCounterGuide);
      for(let index=1;index<=4;index++)await objects.getByRole('button',{name:`car ${index}`,exact:true}).click();
      await expect(count).toContainText('4 selected · 四台（よんだい）');
      await objects.getByRole('button',{name:'statue'}).click();
      await expect(count).toContainText('5 selected');
      await page.getByRole('button',{name:'Count as things'}).click();
      await expect(count).toContainText('5 selected · 五つ（いつつ）');
      await objects.getByRole('button',{name:'person'}).click();
      await expect(count).toContainText('Choose objects that share a counter.');
      await expect(page.getByRole('button',{name:'Count as things'})).toHaveCount(0);
    } finally {await page.close();}
  });

  test('disambiguates overlapping outlines and redraws a crop at display scale',async()=>{
    const page=await browser.newPage();
    try {
      await setup(page,true);
      const stage=page.locator('.photo-lookup-stage');
      await stage.click({position:{x:34,y:22}});
      const overlapping=page.getByRole('group',{name:'Overlapping objects'});
      await expect(overlapping.getByRole('button')).toHaveCount(2);
      await overlapping.getByRole('button',{name:'bottle 2'}).click();
      await expect(overlapping).toBeHidden();
      await expect(page.getByRole('group',{name:'Detected objects'}).getByRole('button',{name:'bottle 2'})).toHaveAttribute('aria-pressed','true');
      await page.getByRole('button',{name:'Crop and retry'}).click();
      const rect=(await stage.boundingBox())!;
      await page.mouse.move(rect.x+120,rect.y+120);await page.mouse.down();
      await page.mouse.move(rect.x+180,rect.y+180);await page.mouse.up();
      await page.getByRole('button',{name:'Analyze crop'}).click();
      await expect(page.getByRole('group',{name:'Detected objects'}).getByRole('button')).toHaveCount(1);
      expect(await page.evaluate(()=>(window as any).lookupLog.analysisLog)).toEqual([{x:60,y:60,width:30,height:30}]);
    } finally {await page.close();}
  });
});
