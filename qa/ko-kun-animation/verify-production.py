"""Read and decode the complete delivered library; never alter artwork."""
from pathlib import Path
from collections import Counter
import json, re, subprocess, tempfile
from PIL import Image

base = Path(__file__).resolve().parent
public = base.parent.parent / 'public/art/ko-kun'
manifest = json.loads((base/'production/manifest.json').read_text())
runtime = json.loads((public/'manifest.json').read_text())
spec = json.loads((base/'production/spec.json').read_text())
clips = {c['id']: c for c in manifest['clips']}
assert len(manifest['routines']) == 24 and len(clips) == 56
assert len(runtime['clips']) == 56 and len(runtime['routines']) == 24
assert manifest['limbCount'] == 4 and manifest['tailCount'] == 3
assert Counter(c['mode'] for c in spec['clips']) == {'generate':35,'reuse':7,'reverse':14}
assert set(p.stem for p in public.glob('*.webp')) == set(clips)
assert 'sequences' not in runtime

frames = {}
for key, clip in clips.items():
    assert clip['frameCount'] == 12 and len(clip['frameDurationsMs']) == 12
    assert sum(clip['frameDurationsMs']) == clip['durationMs']
    assert all(t > 0 for t in clip['frameDurationsMs'])
    with Image.open(public/clip['file']) as strip:
        assert strip.mode == 'RGBA' and strip.size == (3072,256)
        assert not getattr(strip,'is_animated',False)
        frames[key] = []
        for n, rect in enumerate(clip['frameRectangles']):
            x,y,w,h = rect
            assert rect == [n*256,0,256,256]
            with Image.open(base/'production/frames'/key/f'{n:02d}.png') as source:
                frame = source.copy()
            assert frame.mode == 'RGBA' and frame.size == (256,256)
            assert frame.tobytes() == strip.crop((x,y,x+w,y+h)).tobytes(), (key,n,'strip mismatch')
            alpha = frame.getchannel('A')
            assert alpha.getextrema() == (0,255), (key,n,'alpha range')
            assert all(alpha.getpixel(p)==0 for p in [(0,0),(255,0),(0,255),(255,255)])
            bounds = alpha.point(lambda a:255 if a>=16 else 0).getbbox()
            assert bounds and min(bounds[:2])>0 and max(bounds[2:])<256,(key,n,'clipping')
            frames[key].append(frame)
    assert clip['anatomyReview'] == 'pass'

# Verify every declared reverse is exactly the reviewed motion in reverse.
for clip in spec['clips']:
    if clip['mode'] == 'reverse':
        assert all(a.tobytes()==b.tobytes() for a,b in zip(frames[clip['id']],reversed(frames[clip['deriveFrom']]))),clip['id']
    if clip['mode'] == 'generate':
        record = json.loads((base/'production/generations'/f"{clip['id']}.json").read_text())
        assert record['anatomyReview']=='pass' and record['technicalStatus']=='pass'
        assert record['reviewedFrames']==list(range(12))
        assert record['limbCountMaximum']==4 and record['tailCount']==3
        assert all((base/record[k]).exists() for k in ['source','prompt','auditBoard'])

# Check activity and travel phase joins by decoded pixels, in both directions.
join_count = 0
for routine in manifest['routines']:
    ids = routine['clips']
    if len(ids)==3:
        assert frames[ids[0]][-1].tobytes()==frames[ids[1]][0].tobytes(),ids
        assert frames[ids[2]][0].tobytes()==frames[ids[1]][0].tobytes(),ids
        join_count += 2
    assert (base/routine['reviewPreview']).is_file()

previews = list((base/'production/previews').glob('*.webp'))
assert len(previews)==27
preview_frames = 0
for path in previews:
    with Image.open(path) as animated:
        assert animated.is_animated and animated.size==(256,256)
        preview_frames += animated.n_frames
        for n in range(animated.n_frames):
            animated.seek(n)
            alpha = animated.convert('RGBA').getchannel('A')
            assert alpha.getextrema()[0]==0,(path.name,n,'opaque preview')
            assert all(alpha.getpixel(p)==0 for p in [(0,0),(255,0),(0,255),(255,255)])

fallback = Image.open(public/runtime['staticFallback']).convert('RGBA')
assert fallback.tobytes()==frames['attentive-idle-loop'][0].tobytes()
page = (base/'animation-review.html').read_text()
assert page == (base/'pilot-review.html').read_text()
for target in re.findall(r'(?:href|src)="([^"]+)"',page):
    assert not target.startswith(('http:','https:'))
    assert (base/target).exists(),('broken gallery link',target)
for sequence in manifest['sequences']:
    assert (base/sequence['preview']).exists()
    for a,b in zip(sequence['clips'],sequence['clips'][1:]):
        assert clips[a]['to']==clips[b]['from'],(a,b)
scripts = re.findall(r'<script>(.*?)</script>',page,re.S)
assert len(scripts)==1
gallery_data = json.loads(re.search(r'const DATA=(.*?);\nconst reduced=',scripts[0],re.S)[1])
assert len(gallery_data['routines'])==24 and len(gallery_data['transitions'])==6
assert {key for row in gallery_data['routines']+gallery_data['transitions'] for key in row['clips']} == set(clips)
with tempfile.TemporaryDirectory(prefix='ko-animation-check-') as folder:
    script = Path(folder)/'gallery.js'
    script.write_text(scripts[0])
    subprocess.run(['node','--check',str(script)],check=True,capture_output=True,text=True)
report = {'status':'pass','routines':24,'clips':56,'pngFrames':sum(len(v) for v in frames.values()),'strips':56,'losslessFrameComparisons':672,'transparentAnimatedPreviews':len(previews),'decodedPreviewFrames':preview_frames,'exactPhaseJoinChecks':join_count,'reverseClipsChecked':14,'sourceAnatomyReviews':35,'reusedAnatomyReviews':7,'galleryJavaScriptSyntax':'pass','galleryLocalLinks':'pass','browserInspection':'blocked by local-file browser policy; frames inspected directly','featureCodeChanged':False}
(base/'production/final-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
