"""Extract disconnected sprites from a sheet without repainting their pixels.

Run-length connected components avoid a SciPy dependency. Used when generated
poses extend across nominal cell boundaries but do not touch other sprites.
"""
import numpy as np
from PIL import Image, ImageFilter


def extract_sprites(sheet, columns=3, rows=4, strict=True, extras_by_cell=False):
    alpha = np.array(sheet.getchannel('A'))
    parents = []
    runs = []
    previous = []

    def root(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    for y, line in enumerate(alpha >= 16):
        edges = np.flatnonzero(np.diff(np.pad(line.astype(np.int8), (1, 1))))
        current = []
        j = 0
        for start, stop in zip(edges[::2], edges[1::2]):
            idx = len(parents)
            parents.append(idx)
            start, stop = int(start), int(stop)
            while j < len(previous) and previous[j][1] <= start:
                j += 1
            k = j
            while k < len(previous) and previous[k][0] < stop:
                parents[root(idx)] = root(previous[k][2])
                k += 1
            current.append((start, stop, idx))
            runs.append((y, start, stop, idx))
        previous = current

    groups = {}
    for y, start, stop, idx in runs:
        group = groups.setdefault(root(idx), {'area': 0, 'box': [sheet.width, sheet.height, 0, 0], 'runs': []})
        group['area'] += stop-start
        box = group['box']
        box[0], box[1] = min(box[0], start), min(box[1], y)
        box[2], box[3] = max(box[2], stop), max(box[3], y+1)
        group['runs'].append((y, start, stop))
    actors = sorted(groups.values(), key=lambda g: g['area'], reverse=True)[:columns*rows]
    assert len(actors) == columns*rows and min(g['area'] for g in actors) > 1000
    primary_ids = {id(g) for g in actors}
    centers = [((g['box'][0]+g['box'][2])/2, (g['box'][1]+g['box'][3])/2) for g in actors]
    for extra in groups.values():
        if id(extra) in primary_ids or extra['area'] < 40:
            continue
        ex, ey = (extra['box'][0]+extra['box'][2])/2, (extra['box'][1]+extra['box'][3])/2
        candidates=list(range(len(actors)))
        if extras_by_cell:
            cell=(min(columns-1,int(ex*columns/sheet.width)),min(rows-1,int(ey*rows/sheet.height)))
            matching=[i for i,(cx,cy) in enumerate(centers) if (min(columns-1,int(cx*columns/sheet.width)),min(rows-1,int(cy*rows/sheet.height)))==cell]
            if matching:candidates=matching
        nearest = min(candidates, key=lambda i: (centers[i][0]-ex)**2+(centers[i][1]-ey)**2)
        owner = actors[nearest]
        owner['runs'].extend(extra['runs'])
        owner['area'] += extra['area']
        owner['box'] = [min(owner['box'][0],extra['box'][0]), min(owner['box'][1],extra['box'][1]), max(owner['box'][2],extra['box'][2]), max(owner['box'][3],extra['box'][3])]
    actors.sort(key=lambda g: (g['box'][1]+g['box'][3])/2)
    ordered = []
    for row in range(rows):
        ordered.extend(sorted(actors[row*columns:(row+1)*columns], key=lambda g: g['box'][0]))
    result = []
    for actor in ordered:
        x0, y0, x1, y1 = actor['box']
        clipped = not (0 < x0 < x1 < sheet.width and 0 < y0 < y1 < sheet.height)
        if strict:
            assert not clipped, ('source actor clipped', actor['box'])
        rect = (max(0,x0-3), max(0,y0-3), min(sheet.width,x1+3), min(sheet.height,y1+3))
        mask = np.zeros((rect[3]-rect[1], rect[2]-rect[0]), dtype=np.uint8)
        for y, start, stop in actor['runs']:
            mask[y-rect[1], start-rect[0]:stop-rect[0]] = 255
        # Retain the source's antialiased fringe; do not add or repaint pixels.
        core = mask.copy()
        mask = np.array(Image.fromarray(mask).filter(ImageFilter.MaxFilter(5)))
        tile = sheet.crop(rect)
        original_alpha = np.array(tile.getchannel('A'))
        own_pixels = (core > 0) | ((mask > 0) & (original_alpha < 16))
        tile.putalpha(Image.fromarray(np.where(own_pixels, original_alpha, 0).astype(np.uint8)))
        result.append({'tile': tile, 'rect': rect, 'actorBounds': actor['box'], 'area': actor['area'], 'clipped': clipped})
    return result
