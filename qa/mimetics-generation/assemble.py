"""Package imagegen's 3x4 sheets as compact horizontal animation strips.

This only slices and encodes the generated frames; it does not alter the art.
Run with the bundled Python runtime (Pillow).
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageOps
import numpy as np

base = Path(__file__).resolve().parent
project = base.parent.parent
output = project / 'public/art/mimetics'
output.mkdir(parents=True, exist_ok=True)
plan = json.loads((base / 'prompts.json').read_text())
missing = []
layouts = {}
for item in plan:
    key = f"{item['id']}-{item['index']}"
    source = base / 'sheets' / f'{key}.png'
    target = output / f'{key}.webp'
    if not source.exists():
        missing.append(key)
        continue
    if target.exists() and target.stat().st_mtime > max(source.stat().st_mtime, Path(__file__).stat().st_mtime):
        continue
    sheet = Image.open(source).convert('RGB')
    if sheet.size != (1536, 1024):
        raise ValueError(f'{key}: unexpected sheet size {sheet.size}')
    # Imagegen sometimes transposes the requested grid. Detect the repeated
    # frame layout before slicing, rather than cutting through whole scenes.
    def repetition_error(layout):
        cols, rows = layout
        tiles = np.stack([np.array(sheet.crop((round(c*1536/cols), round(r*1024/rows), round((c+1)*1536/cols), round((r+1)*1024/rows))).resize((96,64))).astype(float) for r in range(rows) for c in range(cols)])
        return np.abs(tiles - np.median(tiles, axis=0)).mean()
    cols, rows = min([(3,4), (4,3)], key=repetition_error)
    layouts[key] = [cols, rows]
    strip = Image.new('RGB', (384 * 12, 192), '#f3e7ce')
    for frame in range(12):
        c, r = frame % cols, frame // cols
        tile = sheet.crop((round(c*1536/cols), round(r*1024/rows), round((c+1)*1536/cols), round((r+1)*1024/rows)))
        # Preserve the native proportions; never squash a face or cut off a slab.
        tile = ImageOps.contain(tile, (384,192), Image.Resampling.NEAREST)
        strip.paste(tile, (frame*384 + (384-tile.width)//2, (192-tile.height)//2))
    strip.save(target, 'WEBP', quality=84, method=6)

manifest = {
    'generator': 'Built-in image_gen tool',
    'frames': 12, 'frameWidth': 384, 'frameHeight': 192,
    'durationMs': 2400, 'loop': True, 'layout': 'horizontal',
    'expressions': [{k: item[k] for k in ['id', 'index', 'term', 'action']} for item in plan],
}
(base / 'gallery-data.js').write_text('window.mimeticGallery=' + json.dumps(json.loads((base / 'entries.json').read_text()), ensure_ascii=False).replace('<', '\\u003c') + ';\n')
(base / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
layout_path = base / 'source-layouts.json'
previous_layouts = json.loads(layout_path.read_text()) if layout_path.exists() else {}
layout_path.write_text(json.dumps({**previous_layouts, **layouts}, indent=2) + '\n')
print(f'Packaged {len(plan)-len(missing)}/90 animations; {len(missing)} pending.')

# Contact sheets use a meaningful middle pose, plus the selected use in English.
for batch in range(5):
    subset = plan[batch * 18:(batch + 1) * 18]
    board = Image.new('RGB', (1152, 6 * 250), '#f3e7ce')
    draw = ImageDraw.Draw(board)
    for offset, item in enumerate(subset):
        key = f"{item['id']}-{item['index']}"
        source = output / f'{key}.webp'
        x, y = offset % 3 * 384, offset // 3 * 250
        if source.exists():
            strip = Image.open(source)
            board.paste(strip.crop((5 * 384, 0, 6 * 384, 192)), (x, y))
        draw.text((x+8, y+196), f"{item['id']} / {item['index']+1}", fill='#243344')
        # Use the short English gloss so the board works without Japanese fonts.
        gloss = item['gloss']
        words = gloss.split()
        lines = ['']
        for word in words:
            if len(lines[-1] + word) > 55:
                lines.append('')
            lines[-1] += word + ' '
        for line, text in enumerate(lines[:3]):
            draw.text((x+8, y+211+line*12), text, fill='#243344')
    board.save(base / f'contact-{batch+1}.jpg', quality=90)
