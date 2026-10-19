"""Extract generated poses for direct visual inspection; never invent motion."""
from pathlib import Path
import argparse,json,statistics,sys
import numpy as np
from PIL import Image,ImageDraw
from sprite_components import extract_sprites

base=Path(__file__).resolve().parent
spec=json.loads((base/'production/spec.json').read_text())
by_id={c['id']:c for c in spec['clips']}
parser=argparse.ArgumentParser();parser.add_argument('ids',nargs='*');parser.add_argument('--force',action='store_true');args=parser.parse_args()
files=[base/'production/generations'/f'{key}.json' for key in args.ids] if args.ids else sorted((base/'production/generations').glob('*.json'))
for file in files:
    record=json.loads(file.read_text());key=record['id'];clip=by_id[key]
    if record.get('technicalStatus')=='pass' and not args.force:continue
    try:
        sheet=Image.open(base/record['source']);assert sheet.mode=='RGBA'
        sprites=extract_sprites(sheet)
        areas=[p['area'] for p in sprites]
        assert min(areas)>.3*statistics.median(areas),'Missing or merged actor: inspect source components'
        w,h=sheet.width/3,sheet.height/4
        assert all(p['actorBounds'][2]-p['actorBounds'][0]<w*1.35 and p['actorBounds'][3]-p['actorBounds'][1]<h*1.3 for p in sprites),'Source sprites overlap or props extend across actors'
        # One uniform scale per generated sheet. Row corrections repair sheet
        # spacing only for grounded clips; preserve vertical flight motion.
        canvas_size=round(max(w,h)*450/362)
        floating=clip['routine'] in ['hover-idle','floating-travel'] or key=='take-off'
        row_offsets=[0]*4 if floating else [round(h*345/362-statistics.median(p['actorBounds'][3]-r*h for p in sprites[r*3:(r+1)*3])) for r in range(4)]
        config=record.get('layout',{})
        row_offsets=config.get('rowOffsets',row_offsets)
        scale=config.get('scale',1)
        dx,dy=config.get('offset',[0,-3])
        target=base/'production/frames'/key;target.mkdir(parents=True,exist_ok=True)
        board=Image.new('RGB',(1536,568),'#eee7d8');draw=ImageDraw.Draw(board)
        frame_bounds=[]
        for i,p in enumerate(sprites):
            c,r=i%3,i//3;rect=p['rect'];canvas=Image.new('RGBA',(canvas_size,canvas_size))
            x=round((canvas_size-w)/2+rect[0]-c*w);y=round((canvas_size-h)/2+rect[1]-r*h+row_offsets[r])
            canvas.paste(p['tile'],(x,y))
            size=round(256*scale);small=canvas.resize((size,size),Image.Resampling.NEAREST);frame=Image.new('RGBA',(256,256));frame.paste(small,((256-size)//2+dx,(256-size)//2+dy))
            box=frame.getchannel('A').point(lambda v:255 if v>=16 else 0).getbbox()
            assert box and box[0]>0 and box[1]>0 and box[2]<256 and box[3]<256,(i,'export clipped',box)
            assert frame.getchannel('A').histogram()[0]>256*256*.2
            frame.save(target/f'{i:02d}.png');frame_bounds.append(list(box))
            bx,by=i%6*256,i//6*284;board.paste(frame,(bx,by),frame.getchannel('A'));draw.text((bx+8,by+258),f'{key} / {i+1}',fill='#243344')
        board.save(base/'production/audit'/f'{key}.png')
        record.update({'technicalStatus':'pass','sourceSize':list(sheet.size),'sourceRects':[list(p['rect']) for p in sprites],'sourceActorBounds':[p['actorBounds'] for p in sprites],'exportBounds':frame_bounds,'rowOffsets':row_offsets,'canvasSize':canvas_size,'exportScale':scale,'exportOffset':[dx,dy],'frames':'production/frames/'+key,'auditBoard':'production/audit/'+key+'.png'})
        print(key,'staged for anatomy review')
    except Exception as exc:
        record['technicalStatus']='failed';record['technicalError']=str(exc);print(key,'FAILED',str(exc))
    file.write_text(json.dumps(record,indent=2)+'\n')
