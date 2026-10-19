"""Decode every PS1 export and measure joins without claiming automated anatomy."""
from pathlib import Path
from collections import Counter
import hashlib,json,re,sys
import numpy as np
from PIL import Image

base=Path(__file__).resolve().parent
folder=base/'ps1'
manifest=json.loads((folder/'manifest.json').read_text())
spec=json.loads((folder/'spec.json').read_text())
runtime=folder/'runtime'
clips={c['id']:c for c in manifest['clips']}
assert len(clips)==56 and len(manifest['routines'])==24
assert Counter(c['mode'] for c in spec['clips'])=={'generate':40,'reverse':16}
assert manifest['limbCount']==4 and manifest['tailCount']==3
assert set(p.stem for p in runtime.glob('*.webp'))==set(clips)

frames={};premult={};checks=[]
def pixels(frame):
    values=np.array(frame,dtype=np.float32)/255
    values[:,:,:3]*=values[:,:,3:4]
    return values
def delta(a,b):return float(np.abs(a-b).mean())

for key,clip in clips.items():
    assert clip['frameCount']==12 and len(clip['frameRectangles'])==12
    assert sum(clip['frameDurationsMs'])==clip['durationMs']
    with Image.open(runtime/clip['file']) as strip:
        assert strip.mode=='RGBA' and strip.size==(3072,256)
        assert not getattr(strip,'is_animated',False)
        frames[key]=[]
        for n,rect in enumerate(clip['frameRectangles']):
            assert rect==[n*256,0,256,256]
            frame=Image.open(folder/'frames'/key/f'{n:02d}.png').convert('RGBA')
            assert frame.tobytes()==strip.crop((n*256,0,(n+1)*256,256)).tobytes(),(key,n,'lossless mismatch')
            alpha=frame.getchannel('A');low,high=alpha.getextrema()
            assert low==0 and high>=250,(key,n,'alpha range')
            assert all(alpha.getpixel(p)==0 for p in [(0,0),(255,0),(0,255),(255,255)])
            bounds=alpha.point(lambda a:255 if a>=16 else 0).getbbox()
            assert bounds and min(bounds[:2])>0 and max(bounds[2:])<256,(key,n,'clipped')
            frames[key].append(frame)
    premult[key]=[pixels(f) for f in frames[key]]
    steps=[delta(a,b) for a,b in zip(premult[key],premult[key][1:])]
    seam=delta(premult[key][-1],premult[key][0]) if clip['loop'] else None
    row={'id':key,'distinctFrames':len({hashlib.sha256(f.tobytes()).hexdigest() for f in frames[key]}),
         'maximumAdjacentDelta':max(steps),'medianAdjacentDelta':float(np.median(steps)),'loopSeamDelta':seam}
    if seam is not None:
        row['loopSeamToMedianRatio']=seam/max(float(np.median(steps)),1e-7)
        row['loopSeamOutlier']=seam>max(max(steps)*1.25,float(np.median(steps))*1.8)
    checks.append(row)

reverse_count=0
for clip in spec['clips']:
    key=clip['id']
    if clip['mode']=='reverse':
        assert all(a.tobytes()==b.tobytes() for a,b in zip(frames[key],reversed(frames[clip['deriveFrom']]))),key
        reverse_count+=1
    else:
        record=json.loads((folder/'generations'/f'{key}.json').read_text())
        assert record['technicalStatus']=='pass'
        assert (base/record['source']).is_file() and (base/record['prompt']).is_file()
        assert hashlib.sha256((base/record['source']).read_bytes()).hexdigest()==record['sourceSha256']
        if '--draft' not in sys.argv:
            assert record['anatomyReview']=='pass' and record['reviewedFrames']==list(range(12)),key
            selected=set(record.get('poseOrder',range(12)))
            assert selected<=set(record.get('acceptedFrames',record['reviewedFrames'])),key
            assert selected.isdisjoint(record.get('excludedFrames',[])),key
            assert record['limbCountMaximum']==4 and record['tailCount']==3
            assert clips[key]['anatomyReview']=='pass'

def canonical(state):
    standard={'standing':'attentive-idle-loop','seated':'seated-watch-loop','curled':'sleep-loop','hovering':'hover-idle-loop'}
    return standard.get(state) or state.removesuffix('-active').removesuffix('-travel')+'-loop'

endpoint_checks=0;phase_checks=0
for key,clip in clips.items():
    if not clip['loop']:
        assert frames[key][0].tobytes()==frames[canonical(clip['from'])][0].tobytes(),(key,'first pose')
        assert frames[key][-1].tobytes()==frames[canonical(clip['to'])][0].tobytes(),(key,'last pose')
        endpoint_checks+=2
for routine in manifest['routines']:
    ids=routine['clips']
    if len(ids)==3:
        assert frames[ids[0]][-1].tobytes()==frames[ids[1]][0].tobytes()
        assert frames[ids[2]][0].tobytes()==frames[ids[1]][0].tobytes()
        phase_checks+=2
    assert (base/routine['reviewPreview']).exists()
previews=list((folder/'previews').glob('*.webp'))
assert len(previews)==27
preview_frames=0
for path in previews:
    with Image.open(path) as animated:
        assert animated.is_animated and animated.size==(256,256)
        for i in range(animated.n_frames):
            animated.seek(i);alpha=animated.convert('RGBA').getchannel('A')
            assert alpha.getextrema()[0]==0
            assert all(alpha.getpixel(p)==0 for p in [(0,0),(255,0),(0,255),(255,255)])
            preview_frames+=1
fallback=Image.open(runtime/'static-fallback.png').convert('RGBA')
assert fallback.tobytes()==frames['attentive-idle-loop'][0].tobytes()
inventory=json.loads((folder/'asset-sha256.json').read_text())
assert len(inventory['files'])==58
for name,expected in inventory['files'].items():assert hashlib.sha256((runtime/name).read_bytes()).hexdigest()==expected,name
if '--draft' not in sys.argv:
    for name in inventory['files']:
        assert (runtime/name).read_bytes()==(base.parent.parent/'public/art/ko-kun'/name).read_bytes(),('installed asset mismatch',name)
rebuild_path=folder/'rebuild-verification.json'
rebuild=json.loads(rebuild_path.read_text()) if rebuild_path.exists() else None
if '--draft' not in sys.argv:assert rebuild and rebuild['status']=='pass' and rebuild['frameComparisons']==672
if '--draft' not in sys.argv:assert rebuild['assetInventorySha256']==hashlib.sha256((folder/'asset-sha256.json').read_bytes()).hexdigest()
page=base/'ps1-review.html'
if page.exists():
    for target in re.findall(r'(?:href|src)="([^"]+)"',page.read_text()):
        assert (base/target).exists(),('broken gallery link',target)

report={'status':'draft' if '--draft' in sys.argv else 'pass','routines':24,'clips':56,
        'frames':672,'generatedSourceSheets':40,'reverseClipsChecked':reverse_count,
        'losslessFrameComparisons':672,'exactEndpointChecks':endpoint_checks,'exactPhaseJoinChecks':phase_checks,
        'transparentAnimatedPreviews':27,'decodedPreviewFrames':preview_frames,
        'repeatExportFrameComparisons':rebuild['frameComparisons'] if rebuild else 0,
        'anatomyVerification':'Direct visual review of every accepted source pose; not inferred from pixel tests.',
        'excludedSourcePoses':{r['id']:r['excludedFrames'] for p in (folder/'generations').glob('*.json') if (r:=json.loads(p.read_text())).get('excludedFrames')},
        'loopSeamOutliers':[r['id'] for r in checks if r.get('loopSeamOutlier')],
        'clipMeasurements':checks}
(folder/'final-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='clipMeasurements'},indent=2))
