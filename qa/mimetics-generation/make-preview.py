"""Assemble existing generated frames into a small comparison reel for review."""
from pathlib import Path
from PIL import Image, ImageDraw

base = Path(__file__).resolve().parent
assets = base.parent.parent / 'public/art/mimetics'
pairs = [
    [('rain-0', 'Gentle drizzle'), ('rain-1', 'Heavy rain')],
    [('eating-0', 'Taking eager bites'), ('eating-1', 'Chewing with a closed mouth')],
    [('knocking-0', 'Light taps'), ('knocking-1', 'Heavy bangs')],
]
strips = {key: Image.open(assets / f'{key}.webp').convert('RGB') for pair in pairs for key, _ in pair}
frames = []
for frame in range(12):
    board = Image.new('RGB', (768, 660), '#f3e7ce')
    draw = ImageDraw.Draw(board)
    for row, pair in enumerate(pairs):
        for col, (key, label) in enumerate(pair):
            board.paste(strips[key].crop((frame*384, 0, (frame+1)*384, 192)), (col*384, row*220+26))
            draw.text((col*384+12, row*220+8), label, fill='#243344')
    frames.append(board)
palette_source = Image.new('RGB', (768, 660*12))
for i, frame in enumerate(frames):
    palette_source.paste(frame, (0, i*660))
palette = palette_source.quantize(colors=192)
frames = [frame.quantize(palette=palette) for frame in frames]
frames[0].save(base / 'animated-comparisons.gif', save_all=True, append_images=frames[1:], duration=200, loop=0, disposal=2)
print('Saved comparison animation: rain, taking bites/chewing, and light/heavy knocks.')
