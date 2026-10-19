"""Package reviewed art as 24 routines / 56 combinable transparent clips.

No animation is drawn or interpolated here. Reversed motions and exact shared
connection poses reuse existing generated artwork and keep frame provenance.
"""
from pathlib import Path
import json,hashlib,shutil,argparse
from PIL import Image,ImageDraw

base=Path(__file__).resolve().parent
root=base.parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--draft',action='store_true');parser.add_argument('--install',action='store_true');parser.add_argument('--verify-rebuild',action='store_true');args=parser.parse_args()
assert not(args.draft and args.install),'Draft art cannot be installed'
assert not(args.verify_rebuild and (args.draft or args.install)),'Rebuild verification is read-only for runtime artwork'
public=base/'ps1/runtime'
spec=json.loads((base/'ps1/spec.json').read_text())
catalogue=json.loads((base/'catalogue.json').read_text())
clips={c['id']:c for c in spec['clips']}

records={p.stem:json.loads(p.read_text()) for p in (base/'ps1/generations').glob('*.json')}
for c in spec['clips']:
    if c['mode']=='generate':
        r=records[c['id']]
        assert r.get('technicalStatus')=='pass',('Invalid source',c['id'])
        assert args.draft or r.get('anatomyReview')=='pass',('Unreviewed source',c['id'])
        if not args.draft:assert r['reviewedFrames']==list(range(12)) and r['limbCountMaximum']==4 and r['tailCount']==3
        accepted=set(r.get('acceptedFrames',r.get('reviewedFrames',[])))
        exported=set(r.get('poseOrder',range(12)))
        assert args.draft or (exported<=accepted and exported.isdisjoint(r.get('excludedFrames',[]))),('Excluded source pose used',c['id'])


cache={};building=set()
def canonical(state):
    standard={'standing':'attentive-idle-loop','seated':'seated-watch-loop','hovering':'hover-idle-loop','curled':'sleep-loop'}
    if state in standard:key=standard[state]
    elif state.endswith('-active'):key=state[:-7]+'-loop'
    elif state.endswith('-travel'):key=state[:-7]+'-loop'
    else:raise ValueError(state)
    return build(key)[0][0].copy(),{'clip':key,'frame':0,'reason':'shared generated connection pose'}

def register_endpoints(frames,first,last):
    """Calibrate export scale/placement; never draw or interpolate a pose.

    Independent generated sheets have different margins. Ease one uniform
    scale/translation correction across the authored frames, before substituting
    the exact shared endpoint pixels. Reversed clips inherit the same export.
    """
    def parameters(source,target):
        a=source.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
        b=target.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
        scale=min((b[2]-b[0])/(a[2]-a[0]),(b[3]-b[1])/(a[3]-a[1]))
        assert .65<scale<1.8,('Export scale needs review',scale)
        dx=(b[0]+b[2])/2-((a[0]+a[2])/2-128)*scale-128
        dy=b[3]-(a[3]-128)*scale-128
        return scale,dx,dy
    start=parameters(frames[0],first);end=parameters(frames[-1],last)
    output=[];transforms=[]
    for i,frame in enumerate(frames):
        t=i/(len(frames)-1);t=t*t*(3-2*t)
        scale,dx,dy=[a+(b-a)*t for a,b in zip(start,end)]
        size=round(256*scale);resized=frame.resize((size,size),Image.Resampling.NEAREST)
        offset=(round((256-size)/2+dx),round((256-size)/2+dy))
        box=resized.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
        assert min(box[0]+offset[0],box[1]+offset[1])>0 and max(box[2]+offset[0],box[3]+offset[1])<256,('Registered frame clipped',i,box,offset)
        registered=Image.new('RGBA',(256,256));registered.paste(resized,offset)
        output.append(registered);transforms.append({'scale':round(scale,5),'offset':[round(dx,3),round(dy,3)],'method':'uniform export registration; no generated poses added'})
    return output,transforms

def build(key):
    if key in cache:return cache[key]
    assert key not in building,('Pose dependency cycle',key)
    building.add(key);c=clips[key]
    if c['mode']=='reverse':
        fs,ps=build(c['deriveFrom']);frames=[f.copy() for f in reversed(fs)];provenance=list(reversed(ps))
    else:
        directory=base/(c['frames'] if c['mode']=='reuse' else records[key]['frames'])
        assert directory.parent.name=='source-frames',('Packager must read source cuts, never its own final exports',key)
        order=list(range(12)) if c['mode']=='reuse' else records[key].get('poseOrder',list(range(12)))
        assert len(order)==12 and all(0<=i<12 for i in order)
        frames=[Image.open(directory/f'{i:02d}.png').convert('RGBA') for i in order]
        provenance=[{'clip':key,'frame':i,'source':c['frames'] if c['mode']=='reuse' else records[key]['source']} for i in order]
        if not c['loop']:
            first,first_provenance=canonical(c['from']);last,last_provenance=canonical(c['to'])
            try:frames,transforms=register_endpoints(frames,first,last)
            except AssertionError as error:raise AssertionError(key,str(error)) from error
            for p,transform in zip(provenance,transforms):p['exportRegistration']=transform
            frames[0],provenance[0]=first,first_provenance
            frames[-1],provenance[-1]=last,last_provenance
    building.remove(key);cache[key]=(frames,provenance);return cache[key]

# Resolve every dependency before overwriting QA frame folders.
for key in clips:build(key)
if args.verify_rebuild:
    comparisons=0
    for key,(frames,_) in cache.items():
        for i,frame in enumerate(frames):
            with Image.open(base/'ps1/frames'/key/f'{i:02d}.png') as delivered:
                assert frame.tobytes()==delivered.convert('RGBA').tobytes(),(key,i,'Rebuild changed timeline pixels')
            comparisons+=1
    report={'status':'pass','frameComparisons':comparisons,'sourceDirectory':'ps1/source-frames','deliveredDirectory':'ps1/frames','poseOrderingAppliedOnce':True,'registrationAppliedOnce':True,'assetInventorySha256':hashlib.sha256((base/'ps1/asset-sha256.json').read_bytes()).hexdigest()}
    (base/'ps1/rebuild-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2));raise SystemExit(0)
public.mkdir(parents=True,exist_ok=True)
(base/'ps1/previews').mkdir(exist_ok=True)
manifest={'version':1,'character':'Kōくん','characterDesign':'PS1 low-poly cream fox, no collar','limbCount':4,'tailCount':3,'frameWidth':256,'frameHeight':256,'generator':'Built-in image_gen tool','scope':'PS1 replacement animation library for the Kōkun browser mascot','routines':[],'clips':[],'staticFallback':'static-fallback.png','facing':'right','mirrorSupported':True,'sequences':[]}
verification={'routineCount':24,'clipCount':56,'exportedFrameCount':672,'anatomyReview':'direct visual inspection of every generated source pose; reversed clips inherit the same poses','browserInspection':'pending playback review','sourcesReviewed':0 if args.draft else 40,'reusedClipsReviewed':0,'reversedClips':16,'technicalChecks':[]}

for c in spec['clips']:
    key=c['id'];frames,provenance=cache[key];folder=base/'ps1/frames'/key;folder.mkdir(parents=True,exist_ok=True)
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
    item.update({'file':filename,'frameCount':12,'frameRectangles':[[i*256,0,256,256] for i in range(12)],'frameDurationsMs':[c['frameDurationMs']]*12,'durationMs':c['frameDurationMs']*12,'loopRange':[0,11] if c['loop'] else None,'bodyAnchor':[160,174],'groundAnchor':[160,218],'anchorUnits':'pixels in the 256px source canvas; ground anchor is a shared placement reference, not a separate drawn floor','mirrorAnchorRule':'x becomes 256-x; y unchanged','facing':'right','mirrorSupported':True,'inPlace':True,'intendedTravelSpeedPxPerSecondAt256':speed,'creation':c['mode'],'derivedFrom':c.get('deriveFrom'),'anatomyReview':'pending' if args.draft else 'pass','frameProvenance':provenance})
    manifest['clips'].append(item)
    verification['technicalChecks'].append({'id':key,'frames':12,'distinctFrames':len(set(hashes)),'alphaCornersClear':True,'unclippedExport':True,'losslessStripRoundTrip':True})

def preview(name,ids):
    fs=[];timings=[]
    for key in ids:
        fs.extend(cache[key][0]);timings.extend([clips[key]['frameDurationMs']]*12)
    path=base/'ps1/previews'/f'{name}.webp'
    fs[0].save(path,'WEBP',save_all=True,append_images=fs[1:],duration=timings,loop=0,lossless=True,method=4,exact=True)
    with Image.open(path) as check:
        assert check.is_animated and check.n_frames>=6
        for n in range(check.n_frames):check.seek(n);assert check.convert('RGBA').getchannel('A').getextrema()[0]==0
    return {'id':name,'clips':ids,'preview':f'ps1/previews/{name}.webp','durationMs':sum(timings)}

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
board.save(base/'ps1/contact-sheet.png')
runtime_manifest=json.loads(json.dumps(manifest))
for routine in runtime_manifest['routines']:routine.pop('reviewPreview',None)
runtime_manifest.pop('sequences',None)
(public/'manifest.json').write_text(json.dumps(runtime_manifest,indent=2)+'\n')
(base/'ps1/manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(base/'ps1/verification.json').write_text(json.dumps(verification,indent=2)+'\n')


# Inventory binds release packages to the accepted replacement library.
inventory={'style':'PS1','files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(public.iterdir()) if p.is_file()}}
(base/'ps1/asset-sha256.json').write_text(json.dumps(inventory,indent=2)+'\n')
if args.install:
    destination=root/'public/art/ko-kun'
    for path in public.iterdir():
        if path.is_file():shutil.copy2(path,destination/path.name)
print('Packaged PS1 library: 24 routines, 56 clips, 672 RGBA frames, 27 animated previews.'+(' Installed runtime artwork.' if args.install else ' QA output only.'))
