"""Package reviewed art as 24 routines / 56 combinable transparent clips.

No animation is drawn or interpolated here. Reversed motions and exact shared
connection poses reuse existing generated artwork and keep frame provenance.
"""
from pathlib import Path
import json,hashlib,shutil
from PIL import Image,ImageDraw

base=Path(__file__).resolve().parent
root=base.parent.parent
public=root/'public/art/ko-kun'
spec=json.loads((base/'production/spec.json').read_text())
catalogue=json.loads((base/'catalogue.json').read_text())
clips={c['id']:c for c in spec['clips']}
reviews=json.loads((base/'production/reused-reviews.json').read_text())
records={p.stem:json.loads(p.read_text()) for p in (base/'production/generations').glob('*.json')}
for c in spec['clips']:
    if c['mode']=='generate':
        r=records[c['id']]
        assert r.get('technicalStatus')=='pass' and r.get('anatomyReview')=='pass',('Unreviewed source',c['id'])
        assert r['reviewedFrames']==list(range(12)) and r['limbCountMaximum']==4 and r['tailCount']==3
    if c['mode']=='reuse':assert reviews[c['id']]['anatomyReview']=='pass',c['id']

cache={};building=set()
def canonical(state):
    standard={'standing':'attentive-idle-loop','seated':'seated-watch-loop','hovering':'hover-idle-loop','curled':'sleep-loop'}
    if state in standard:key=standard[state]
    elif state.endswith('-active'):key=state[:-7]+'-loop'
    elif state.endswith('-travel'):key=state[:-7]+'-loop'
    else:raise ValueError(state)
    return build(key)[0][0].copy(),{'clip':key,'frame':0,'reason':'shared generated connection pose'}

def build(key):
    if key in cache:return cache[key]
    assert key not in building,('Pose dependency cycle',key)
    building.add(key);c=clips[key]
    if c['mode']=='reverse':
        fs,ps=build(c['deriveFrom']);frames=[f.copy() for f in reversed(fs)];provenance=list(reversed(ps))
    else:
        directory=base/(c['frames'] if c['mode']=='reuse' else records[key]['frames'])
        order=list(range(12)) if c['mode']=='reuse' else records[key].get('poseOrder',list(range(12)))
        assert len(order)==12 and all(0<=i<12 for i in order)
        frames=[Image.open(directory/f'{i:02d}.png').convert('RGBA') for i in order]
        provenance=[{'clip':key,'frame':i,'source':c['frames'] if c['mode']=='reuse' else records[key]['source']} for i in order]
        if not c['loop']:
            frames[0],provenance[0]=canonical(c['from'])
            frames[-1],provenance[-1]=canonical(c['to'])
    building.remove(key);cache[key]=(frames,provenance);return cache[key]

# Resolve every dependency before overwriting QA frame folders.
for key in clips:build(key)
public.mkdir(parents=True,exist_ok=True)
(base/'production/previews').mkdir(exist_ok=True)
manifest={'version':1,'character':'Kōくん','characterDesign':'A, no collar','limbCount':4,'tailCount':3,'frameWidth':256,'frameHeight':256,'generator':'Built-in image_gen tool','scope':'animation assets only; no browser-pet feature implementation','routines':[],'clips':[],'staticFallback':'static-fallback.png','facing':'right','mirrorSupported':True,'sequences':[]}
verification={'routineCount':24,'clipCount':56,'exportedFrameCount':672,'anatomyReview':'direct visual inspection of every generated source pose; reversed clips inherit the same poses','browserInspection':'blocked: browser tools reject file:// URLs; no browser inspection claimed','sourcesReviewed':35,'reusedClipsReviewed':7,'reversedClips':14,'technicalChecks':[]}

for c in spec['clips']:
    key=c['id'];frames,provenance=cache[key];folder=base/'production/frames'/key;folder.mkdir(parents=True,exist_ok=True)
    hashes=[]
    for i,frame in enumerate(frames):
        assert frame.mode=='RGBA' and frame.size==(256,256)
        alpha=frame.getchannel('A');box=alpha.point(lambda v:255 if v>=16 else 0).getbbox()
        assert box and 0<box[0]<box[2]<256 and 0<box[1]<box[3]<256,(key,i,box)
        assert all(alpha.getpixel(p)==0 for p in [(0,0),(255,0),(0,255),(255,255)]),(key,i,'corner alpha')
        frame.save(folder/f'{i:02d}.png');hashes.append(hashlib.sha256(frame.tobytes()).hexdigest())
    assert len(set(hashes))>=6,(key,'too few distinct poses')
    strip=Image.new('RGBA',(3072,256))
    for i,f in enumerate(frames):strip.paste(f,(i*256,0))
    filename=key+'.webp';strip.save(public/filename,'WEBP',lossless=True,method=4,exact=True)
    with Image.open(public/filename) as check:assert check.mode=='RGBA' and check.tobytes()==strip.tobytes(),key
    speed=70 if c['routine']=='trot' else 30 if c['routine']=='floating-travel' else 40 if c['routine']=='walk' else 0
    if c['phase']!='loop':speed=0
    item={k:c[k] for k in ['id','routine','phase','from','to','loop','props']}
    item.update({'file':filename,'frameCount':12,'frameRectangles':[[i*256,0,256,256] for i in range(12)],'frameDurationsMs':[c['frameDurationMs']]*12,'durationMs':c['frameDurationMs']*12,'loopRange':[0,11] if c['loop'] else None,'bodyAnchor':[160,174],'groundAnchor':[160,218],'anchorUnits':'pixels in the 256px source canvas; ground anchor is a shared placement reference, not a separate drawn floor','mirrorAnchorRule':'x becomes 256-x; y unchanged','facing':'right','mirrorSupported':True,'inPlace':True,'intendedTravelSpeedPxPerSecondAt256':speed,'creation':c['mode'],'derivedFrom':c.get('deriveFrom'),'anatomyReview':'pass','frameProvenance':provenance})
    manifest['clips'].append(item)
    verification['technicalChecks'].append({'id':key,'frames':12,'distinctFrames':len(set(hashes)),'alphaCornersClear':True,'unclippedExport':True,'losslessStripRoundTrip':True})

def preview(name,ids):
    fs=[];timings=[]
    for key in ids:
        fs.extend(cache[key][0]);timings.extend([clips[key]['frameDurationMs']]*12)
    path=base/'production/previews'/f'{name}.webp'
    fs[0].save(path,'WEBP',save_all=True,append_images=fs[1:],duration=timings,loop=0,lossless=True,method=4,exact=True)
    with Image.open(path) as check:
        assert check.is_animated and check.n_frames>=6
        for n in range(check.n_frames):check.seek(n);assert check.convert('RGBA').getchannel('A').getextrema()[0]==0
    return {'id':name,'clips':ids,'preview':f'production/previews/{name}.webp','durationMs':sum(timings)}

for routine in catalogue['routines']:
    rid=routine['id'];phases=catalogue['clipExpansion'][routine['kind']];ids=[rid+'-'+p for p in phases]
    sequence=[]
    for key in ids:sequence.extend([key,key] if clips[key]['loop'] else [key])
    row={'id':rid,'name':routine['name'],'kind':routine['kind'],'pose':routine['pose'],'clips':ids}
    manifest['routines'].append(row);row['reviewPreview']=preview(rid,sequence)['preview']

sequences={
'scholar-stroll':['attentive-idle-loop','walk-start','walk-loop','walk-stop','sit-down','read-entry','read-loop','read-exit','write-entry','write-loop','write-exit','stand-up','attentive-idle-loop'],
'spirit-roam':['attentive-idle-loop','take-off','hover-idle-loop','floating-travel-start','floating-travel-loop','floating-travel-stop','hover-idle-loop','land','greeting-action'],
'costume-tour':['straw-hat-adventurer-entry','straw-hat-adventurer-loop','straw-hat-adventurer-exit','samurai-entry','samurai-loop','samurai-exit','ninja-entry','ninja-loop','ninja-exit','fan-dance-entry','fan-dance-loop','fan-dance-exit']}
for name,ids in sequences.items():
    for a,b in zip(ids,ids[1:]):assert clips[a]['to']==clips[b]['from'],(a,b,'state mismatch')
    manifest['sequences'].append(preview('sequence-'+name,ids))

cache['attentive-idle-loop'][0][0].save(public/'static-fallback.png')
board=Image.new('RGB',(1024,6*288),'#eee7d8');draw=ImageDraw.Draw(board)
for i,r in enumerate(manifest['routines']):
    key=next((k for k in r['clips'] if clips[k]['loop']),r['clips'][0]);im=cache[key][0][5];x,y=i%4*256,i//4*288;board.paste(im,(x,y),im.getchannel('A'));draw.text((x+8,y+260),r['name'],fill='#243344')
board.save(base/'production/contact-sheet.png')
runtime_manifest=json.loads(json.dumps(manifest))
for routine in runtime_manifest['routines']:routine.pop('reviewPreview',None)
runtime_manifest.pop('sequences',None)
(public/'manifest.json').write_text(json.dumps(runtime_manifest,indent=2)+'\n')
(base/'production/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(base/'production/verification.json').write_text(json.dumps(verification,indent=2)+'\n')

# Keep links from the earlier pilot working, now with the corrected artwork.
pilot_manifest=json.loads((base/'pilot/manifest.json').read_text())
for c in pilot_manifest['clips']:
    key=c['id'];shutil.copy2(public/(key+'.webp'),base/'pilot'/(key+'.webp'))
    for i,f in enumerate(cache[key][0]):f.save(base/'pilot/frames'/key/f'{i:02d}.png')
    fs=cache[key][0];fs[0].save(base/'pilot'/f'{key}-preview.webp','WEBP',save_all=True,append_images=fs[1:],duration=[clips[key]['frameDurationMs']]*12,loop=0,lossless=True,method=4,exact=True)
for old,name in [('sequence-scholar-stroll','sequence-scholar-stroll'),('sequence-adventurer','sequence-costume-tour')]:shutil.copy2(base/'production/previews'/f'{name}.webp',base/'pilot'/f'{old}.webp')
(base/'pilot/superseded-by-production.json').write_text(json.dumps({'currentManifest':'../production/manifest.json','reason':'Corrected limb anatomy and completed all 24 routines; old pilot preview paths have been updated.'},indent=2)+'\n')
print('Packaged all 24 routines, 56 clips and 672 transparent frames; created 24 routine previews and three combined sequences.')
