"""Pin the Japanese-language rows of an already downloaded Kaikki raw extract."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--raw', type=Path, required=True)
parser.add_argument('--metadata', type=Path, required=True)
parser.add_argument('--output', type=Path, default=Path('data/jawiktionary'))
args = parser.parse_args()
metadata = json.loads(args.metadata.read_text())
digest = hashlib.sha256(args.raw.read_bytes()).hexdigest()
if digest != metadata['rawSha256']:
    raise ValueError('Raw Wiktionary snapshot checksum mismatch')
args.output.mkdir(parents=True, exist_ok=True)
source = args.output / 'source.jsonl.gz'
count = 0
with gzip.open(args.raw, 'rb') as incoming, source.open('wb') as output:
    with gzip.GzipFile(filename='', mode='wb', fileobj=output, mtime=0) as packed:
        for line in incoming:
            if json.loads(line).get('lang_code') == 'ja':
                packed.write(line)
                count += 1
metadata.pop('extracted', None)  # Processed-site dates need not match the raw export.
metadata.update(sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                filter={'lang_code': 'ja'}, sourceEntries=count, bytes=source.stat().st_size)
(args.output / 'snapshot.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(metadata, indent=2))
