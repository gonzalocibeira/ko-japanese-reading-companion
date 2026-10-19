"""Inspect proposal alpha and production catalogue; never modify artwork."""
import json
from pathlib import Path
from PIL import Image

base = Path(__file__).resolve().parent
catalogue = json.loads((base / 'catalogue.json').read_text())
ids = [item['id'] for item in catalogue['routines']]
assert len(ids) == len(set(ids)) == 24
assert not set(catalogue['excludedRoutines']) & set(ids)
assert len(catalogue['transitions']) == 6
clip_count = sum(len(catalogue['clipExpansion'][r['kind']]) for r in catalogue['routines']) + len(catalogue['transitions'])
assert clip_count == 56
assert catalogue['characterApproved'] is True
assert catalogue['approvedProposal'] == 'a'
assert catalogue['pilotApproved'] is False
current_manifest = base / 'production' / 'manifest.json'
if not current_manifest.exists():
    current_manifest = base / 'pilot' / 'manifest.json'
generated = len(json.loads(current_manifest.read_text())['clips']) if current_manifest.exists() else 0
report = {'stage': catalogue['stage'], 'routineCount': len(ids), 'plannedClipCount': clip_count, 'generatedAnimationClips': generated, 'proposals': [], 'limitations': 'Alpha checks cannot establish identity, anatomy, tail count, or edge quality. See production source-frame visual reviews and animation-review.html.'}
for name in ['proposal-a', 'proposal-b']:
    path = base / 'design' / f'{name}.png'
    with Image.open(path) as im:
        assert im.mode == 'RGBA', (name, im.mode)
        assert im.width == im.height
        alpha = im.getchannel('A')
        histogram = alpha.histogram()
        assert histogram[0] > im.width * im.height * 0.1, name
        # Image generation may encode solid paint at 250–254 alpha; require
        # substantial near-opaque foreground instead of exactly 255 everywhere.
        assert sum(histogram[250:]) > im.width * im.height * 0.1, name
        assert all(alpha.getpixel(p) == 0 for p in [(0, 0), (im.width-1, 0), (0, im.height-1), (im.width-1, im.height-1)])
        bounds = alpha.getbbox()
        assert bounds and bounds[0] > 0 and bounds[1] > 0 and bounds[2] < im.width and bounds[3] < im.height, (name, bounds)
        report['proposals'].append({'file': str(path.relative_to(base)), 'size': list(im.size), 'mode': im.mode, 'alphaRange': list(alpha.getextrema()), 'transparentPixelFraction': round(histogram[0]/(im.width*im.height), 4), 'visibleBounds': list(bounds), 'allCornersTransparent': True, 'unclippedBounds': True})
(base / 'design' / 'verification.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
