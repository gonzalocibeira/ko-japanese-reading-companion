"""Compose review boards from existing exported frames and measure seams."""
from pathlib import Path
import json
import textwrap
import numpy as np
from PIL import Image, ImageDraw

base=Path(__file__).resolve().parent
out=base/'pilot'
manifest=json.loads((out/'manifest.json').read_text())
assert len(manifest['clips']) == 12, 'Pilot packaging is incomplete'
assert sum(c['frameCount'] for c in manifest['clips']) == 144
assert len(manifest['sequences']) == 4
by_id={c['id']:c for c in manifest['clips']}
def frame(key,index):
    return Image.open(out/'frames'/key/f'{index:02d}.png').convert('RGBA')
def visible_pixels(im):
    arr=np.array(im,dtype=np.float32)/255
    arr[:,:,:3]*=arr[:,:,3:4]
    return arr
def delta(a,b):
    return float(np.abs(visible_pixels(a)-visible_pixels(b)).mean())

joins=[('attentive-idle-loop','walk-start'),('walk-start','walk-loop'),('walk-loop','walk-stop'),('walk-stop','attentive-idle-loop'),('read-entry','read-loop'),('read-loop','read-exit'),('straw-hat-adventurer-entry','straw-hat-adventurer-loop'),('straw-hat-adventurer-loop','straw-hat-adventurer-exit'),('straw-hat-adventurer-exit','attentive-idle-loop'),('sit-down','read-entry'),('read-exit','stand-up'),('stand-up','attentive-idle-loop')]
board=Image.new('RGB',(1024,600),'#eee7d8');draw=ImageDraw.Draw(board);metrics={'method':'Mean premultiplied RGBA difference on the fixed 256px canvas; descriptive only, not artistic acceptance.','loopSeams':[],'joins':[],'pilotApproved':False}
for i,(a,b) in enumerate(joins):
    x,y=i%4*256,i//4*200
    for j,pic in enumerate([frame(a,11),frame(b,0)]):
        pic=pic.resize((128,128),Image.Resampling.NEAREST);board.paste(pic,(x+j*128,y),pic.getchannel('A'))
    caption=f'{a} end -> {b} start'
    for line_index,line in enumerate(textwrap.wrap(caption,width=34)):
        draw.text((x+5,y+132+line_index*13),line,fill='#243344')
    metrics['joins'].append({'from':a,'to':b,'visiblePixelDelta':round(delta(frame(a,11),frame(b,0)),6)})
board.save(out/'joins.png')
for clip in manifest['clips']:
    if not clip['loop']:continue
    fs=[frame(clip['id'],i) for i in range(12)]
    ordinary=[delta(fs[i],fs[i+1]) for i in range(11)]
    seam=delta(fs[-1],fs[0]);median=float(np.median(ordinary))
    metrics['loopSeams'].append({'id':clip['id'],'lastToFirstDelta':round(seam,6),'medianAdjacentDelta':round(median,6),'seamToMedianRatio':round(seam/max(median,1e-9),3)})
(out/'continuity-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')

keys=['attentive-idle-loop','walk-loop','read-loop','straw-hat-adventurer-loop']
board=Image.new('RGB',(960,360),'#fffaf0');draw=ImageDraw.Draw(board)
for i,key in enumerate(keys):
    x=i*240
    for size,top,color in [(128,28,'#ffffff'),(96,208,'#1e2835')]:
        draw.rectangle((x,top,x+239,top+size+18),fill=color)
        pic=frame(key,7 if key.startswith('straw') else 0).resize((size,size),Image.Resampling.NEAREST)
        board.paste(pic,(x+(240-size)//2,top+8),pic.getchannel('A'))
        draw.text((x+10,top+size+22),f'{size}px',fill='#243344')
    draw.text((x+8,8),key,fill='#243344')
board.save(out/'readability.png')
assert delta(frame('read-entry',11),frame('read-loop',0)) == 0, 'Shared reading endpoint changed'
(out/'static-fallback.png').write_bytes((out/'frames/attentive-idle-loop/00.png').read_bytes())
manifest['staticFallback'] = 'static-fallback.png'
manifest['fallbackSource'] = 'frames/attentive-idle-loop/00.png'
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(metrics,indent=2))
