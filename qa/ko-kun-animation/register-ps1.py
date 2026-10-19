"""Register tool-generated source art and preserve superseded variants."""
from pathlib import Path
import hashlib,json,shutil,sys

base=Path(__file__).resolve().parent/'ps1'
(base/'rejected').mkdir(exist_ok=True)
(base/'prompts').mkdir(exist_ok=True)
spec=json.loads((base/'spec.json').read_text())
clips={c['id']:c for c in spec['clips']}
for row in json.loads(sys.argv[1]):
    key=row['id'];source=Path(row['source']);target=base/'sheets'/f'{key}.png'
    record_path=base/'generations'/f'{key}.json'
    if target.exists() and target.read_bytes()!=source.read_bytes():
        suffix=hashlib.sha256(target.read_bytes()).hexdigest()[:10]
        shutil.copy2(target,base/'rejected'/f'{key}-{suffix}.png')
        if record_path.exists():shutil.copy2(record_path,base/'rejected'/f'{key}-{suffix}.json')
    if source.resolve()!=target.resolve():shutil.copy2(source,target)
    prompt=row.get('prompt',clips[key]['prompt'])
    prompt_path=base/'prompts'/f'{key}.txt';prompt_path.write_text(prompt+'\n')
    record={'id':key,'source':f'ps1/sheets/{key}.png','generator':'built-in image_gen',
            'prompt':f'ps1/prompts/{key}.txt','sourceSha256':hashlib.sha256(target.read_bytes()).hexdigest(),
            'references':row.get('references',['ps1/references/approved-design.png']),
            'anatomyReview':'pending','technicalStatus':'pending'}
    if 'layout' in row:record['layout']=row['layout']
    record_path.write_text(json.dumps(record,indent=2)+'\n')
    print(key)
