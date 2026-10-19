"""Slice generated art and encode review assets; no drawing or motion synthesis.

Only use layouts whose frame grid has been inspected. Original sheets remain
untouched. Export scale is uniform across a clip; recorded row padding corrects
uneven generated sheet spacing without changing any painted character pixels.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageOps
from sprite_components import extract_sprites

BASE = Path(__file__).resolve().parent
spec = json.loads((BASE / 'pilot-spec.json').read_text())
layouts = json.loads((BASE / 'pilot-layouts.json').read_text())
out = BASE / 'pilot'
out.mkdir(exist_ok=True)
clips = spec['clips'] + spec['additionalPilotTransitions']
clip_order = {c['id']: i for i,c in enumerate(clips)}
# Canonical loops are exported first so other clips can reuse exact endpoints.
clips = sorted(clips, key=lambda c: c['phase'] != 'loop')
manifest = {'version': 1, 'stage': 'pilot-review', 'character': 'proposal-a-bare-neck', 'characterApproved': True, 'pilotApproved': False, 'generator': 'Built-in image_gen tool', 'frameWidth': 256, 'frameHeight': 256, 'clips': [], 'sequences': []}
decoded = {}
checks = []
alternate_sources = {}

def override_frame(item):
    if 'file' in item:
        return Image.open(BASE / item['file']).convert('RGBA')
    source = item['source']
    if source not in alternate_sources:
        alternate_sources[source] = extract_sprites(Image.open(BASE / source).convert('RGBA'), strict=False)
    part = alternate_sources[source][item['index']]
    assert not part['clipped'], f'Override selects a clipped source pose: {item}'
    # Same fixed source scale as the clip. Only sheet spacing is corrected.
    canvas = Image.new('RGBA', (450,450))
    col, row = item['index']%3, item['index']//3
    rect = part['rect']
    canvas.paste(part['tile'], (round(44+rect[0]-col*362), round(44+rect[1]-row*362+item['paddingY'])))
    resized = canvas.resize((256,256), Image.Resampling.NEAREST)
    result = Image.new('RGBA',(256,256))
    result.paste(resized,(0,-3))
    return result

for clip in clips:
    key = clip['id']
    layout = layouts.get(key)
    if not layout:
        continue
    assert layout['gridReviewed'], f'{key}: inspect source frame grid first'
    sheet_path = BASE / layout['source']
    with Image.open(sheet_path) as source:
        assert source.mode == 'RGBA', f'{key}: no RGBA alpha'
        sheet = source.copy()
    cols, rows = layout['columns'], layout['rows']
    assert cols * rows == 12
    xcuts = layout.get('xcuts', [round(i*sheet.width/cols) for i in range(cols+1)])
    ycuts = layout.get('ycuts', [round(i*sheet.height/rows) for i in range(rows+1)])
    assert len(set(xcuts[i+1]-xcuts[i] for i in range(cols))) <= 2
    target = out / 'frames' / key
    target.mkdir(parents=True, exist_ok=True)
    extracted = extract_sprites(sheet, cols, rows) if layout.get('componentExtraction') else None
    frames = []
    rectangles = []
    source_rectangles = []
    bounds = []
    hashes = []
    for i in range(12):
        x, y = i % cols, i // cols
        rect = (xcuts[x], ycuts[y], xcuts[x+1], ycuts[y+1])
        tile = sheet.crop(rect)
        if extracted:
            rect = extracted[i]['rect']
            tile = extracted[i]['tile']
        alpha = tile.getchannel('A')
        hist = alpha.histogram()
        assert hist[0] > tile.width*tile.height*.1, f'{key}/{i}: insufficient transparent background'
        assert sum(hist[240:]) > tile.width*tile.height*.04, f'{key}/{i}: missing opaque subject'
        meaningful = alpha.point(lambda v: 255 if v >= 16 else 0).getbbox()
        assert meaningful, f'{key}/{i}: empty frame'
        edge = meaningful[0] == 0 or meaningful[1] == 0 or meaningful[2] == tile.width or meaningful[3] == tile.height
        assert not edge, f'{key}/{i}: meaningful artwork touches source cell edge: {meaningful}'
        canvas_size = layout.get('sourceCanvasSize', list(tile.size))
        canvas = Image.new('RGBA', tuple(canvas_size))
        row_padding = layout.get('rowPaddingY', [0]*rows)[y]
        if extracted:
            # Preserve each pose relative to its nominal source cell. Padding
            # accommodates punches that cross a nominal grid boundary.
            nominal_w, nominal_h = sheet.width/cols, sheet.height/rows
            px = round((canvas_size[0]-nominal_w)/2 + rect[0]-x*nominal_w)
            py = round((canvas_size[1]-nominal_h)/2 + rect[1]-y*nominal_h + row_padding)
            canvas.paste(tile, (px, py))
        else:
            canvas.paste(tile, ((canvas_size[0]-tile.width)//2, row_padding))
        size = round(256 * layout.get('scale', 1))
        fit = ImageOps.contain(canvas, (size, size), Image.Resampling.NEAREST)
        frame = Image.new('RGBA', (256, 256))
        dx, dy = layout.get('offset', [0, 0])
        frame.paste(fit, ((256-fit.width)//2 + dx, (256-fit.height)//2 + dy))
        if str(i) in layout.get('frameOverrides', {}):
            frame = override_frame(layout['frameOverrides'][str(i)])
        export_bounds = frame.getchannel('A').point(lambda v: 255 if v >= 16 else 0).getbbox()
        assert export_bounds and 0 < export_bounds[0] < export_bounds[2] < 256 and 0 < export_bounds[1] < export_bounds[3] < 256, f'{key}/{i}: export clipped'
        frame.save(target / f'{i:02d}.png')
        frames.append(frame)
        rectangles.append([i*256, 0, 256, 256])
        source_rectangles.append(list(rect))
        bounds.append(list(frame.getchannel('A').point(lambda v: 255 if v >= 16 else 0).getbbox()))
        hashes.append(hashlib.sha256(frame.tobytes()).hexdigest())
    assert len(set(hashes)) >= 6, f'{key}: insufficient distinct generated poses'
    strip = Image.new('RGBA', (256*12, 256))
    for i, frame in enumerate(frames):
        strip.paste(frame, (i*256, 0))
    strip_path = out / f'{key}.webp'
    strip.save(strip_path, 'WEBP', lossless=True, method=6, exact=True)
    timing = layout.get('frameDurationsMs', [clip['frameDurationMs']]*12)
    assert len(timing) == 12 and all(t > 0 for t in timing)
    preview_path = out / f'{key}-preview.webp'
    frames[0].save(preview_path, 'WEBP', save_all=True, append_images=frames[1:], duration=timing, loop=0, lossless=True, method=6, exact=True)
    with Image.open(strip_path) as check:
        assert check.size == (3072, 256) and check.mode == 'RGBA'
        assert check.tobytes() == strip.tobytes(), f'{key}: lossless strip mismatch'
    with Image.open(preview_path) as check:
        assert check.n_frames >= 6, f'{key}: animated preview lost frames'
        for n in range(check.n_frames):
            check.seek(n)
            assert check.convert('RGBA').getchannel('A').getextrema()[0] == 0
    entry = {k: clip[k] for k in ['id', 'routine', 'phase', 'from', 'to', 'loop']}
    entry.update({'file': f'{key}.webp', 'preview': f'{key}-preview.webp', 'frameCount': 12, 'frameRectangles': rectangles, 'frameDurationsMs': timing, 'durationMs': sum(timing), 'loopRange': [0, 11] if clip['loop'] else None, 'bodyAnchor': layout.get('bodyAnchor', [160, 174]), 'groundBaseline': layout.get('groundBaseline', 218), 'anchorStatus': 'nominal; visual pilot review required', 'facing': 'right', 'mirrorSupported': True, 'props': layout.get('props', []), 'intendedTravelSpeedPxPerSecondAt256': 40 if key.startswith('walk') else 0, 'source': layout['source'], 'sourceSize': list(sheet.size), 'sourceGrid': [cols, rows], 'exportTransform': {'scale': layout.get('scale', 1), 'offset': layout.get('offset', [0, 0]), 'uniformAcrossFrames': True}, 'visibleFrameBounds': bounds, 'reviewStatus': 'awaiting-user-pilot-review'})
    if key == 'walk-loop':
        entry['contactPhases'] = {'nearFrontAndFarRear': [0, 1, 2], 'farFrontAndNearRear': [6, 7, 8]}
        entry['contactStatus'] = 'choreography target; verify visually before runtime use'
    entry['sourceFrameRectangles'] = source_rectangles
    entry['frameSourceOverrides'] = layout.get('frameOverrides', {})
    entry['exportTransform']['uniformAcrossFrames'] = not bool(layout.get('frameOverrides'))
    if layout.get('frameOverrides'):
        entry['exportTransform']['note'] = 'Base source uses one uniform transform; explicit frame overrides reuse complete corrected poses and the shared generated endpoint.'
    entry['exportTransform'].update({'sourceCanvasSize': layout.get('sourceCanvasSize'), 'rowPaddingY': layout.get('rowPaddingY'), 'componentExtraction': layout.get('componentExtraction', False)})
    if clip['phase'] in ('entry', 'exit') and layout.get('props'):
        entry['propPresence'] = 'changes during clip; props are included in the painted frames'
    elif layout.get('props'):
        entry['propPresence'] = 'throughout'
    else:
        entry['propPresence'] = 'none'
    manifest['clips'].append(entry)
    decoded[key] = (frames, timing)
    checks.append({'id': key, 'frameCount': 12, 'distinctFrames': len(set(hashes)), 'alphaPreserved': True, 'meaningfulArtInsideCells': True, 'losslessStripRoundTrip': True})

manifest['clips'].sort(key=lambda c: clip_order[c['id']])
sequences = {
    'walking': ['attentive-idle-loop','walk-start','walk-loop','walk-loop','walk-stop','attentive-idle-loop'],
    'reading': ['read-entry','read-loop','read-loop','read-exit'],
    'adventurer': ['straw-hat-adventurer-entry','straw-hat-adventurer-loop','straw-hat-adventurer-loop','straw-hat-adventurer-exit'],
    'scholar-stroll': ['attentive-idle-loop','walk-start','walk-loop','walk-stop','sit-down','read-entry','read-loop','read-exit','stand-up','attentive-idle-loop']
}
for name, ids in sequences.items():
    if not all(key in decoded for key in ids):
        continue
    frames, timings = [], []
    for key in ids:
        fs, ts = decoded[key]
        frames.extend(fs)
        timings.extend(ts)
    file = f'sequence-{name}.webp'
    frames[0].save(out / file, 'WEBP', save_all=True, append_images=frames[1:], duration=timings, loop=0, lossless=True, method=6, exact=True)
    manifest['sequences'].append({'id': name, 'clips': ids, 'preview': file, 'durationMs': sum(timings), 'reviewStatus': 'awaiting-visual-connection-review'})

if manifest['clips']:
    board = Image.new('RGB', (1024, ((len(manifest['clips'])+3)//4)*288), '#eee7d8')
    draw = ImageDraw.Draw(board)
    for i, item in enumerate(manifest['clips']):
        x, y = i%4*256, i//4*288
        frame = decoded[item['id']][0][5]
        board.paste(frame, (x, y), frame.getchannel('A'))
        draw.text((x+8, y+258), item['id'], fill='#243344')
    board.save(out / 'contact-sheet.png')
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
(out / 'verification.json').write_text(json.dumps({'automatedChecks': checks, 'generatedClips': len(checks), 'expectedPilotClips': len(clips), 'visualReviewRequired': ['tail count and anatomy', 'identity consistency', 'foot contact', 'loop seams', 'entry/exit matching', 'prop continuity', '96–128 pixel readability'], 'pilotApproved': False}, indent=2)+'\n')
print(f'Packaged {len(checks)}/{len(clips)} pilot clips and {len(manifest["sequences"])} review sequences.')
