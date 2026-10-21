"""Build deterministic, lazy lookup shards from the pinned English JMdict snapshot.

Python 3 standard library only. Never downloads data; see data/jmdict/README.md.
"""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import unicodedata
import xml.etree.ElementTree as ET


def bucket(term):
    value = 2166136261
    for char in term:
        value = ((value ^ ord(char)) * 16777619) & 0xffffffff
    return f'{value & 255:02x}'


def texts(element, tag):
    return [unicodedata.normalize('NFC', node.text or '') for node in element.findall(tag)]


def generate(source, output, metadata):
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    if digest != metadata['sha256']:
        raise ValueError('JMdict snapshot checksum mismatch')
    shards = [{ 'terms': {}, 'entries': {} } for _ in range(256)]
    count = 0
    with gzip.open(source, 'rb') as stream:
        # iterparse expands the file's internal DTD entities; no external entities
        # or network access are supported by ElementTree.
        events = ET.iterparse(stream, events=('start', 'end'))
        _, root = next(events)
        for event, node in events:
            if event != 'end' or node.tag != 'entry':
                continue
            spellings = [dict(text=unicodedata.normalize('NFC', k.findtext('keb')), priority=texts(k, 'ke_pri'), info=texts(k, 'ke_inf')) for k in node.findall('k_ele')]
            readings = [dict(text=unicodedata.normalize('NFC', r.findtext('reb')), restrict=texts(r, 're_restr'), noKanji=r.find('re_nokanji') is not None,
                             priority=texts(r, 're_pri'), info=texts(r, 're_inf')) for r in node.findall('r_ele')]
            senses = []
            pos = []
            for sense in node.findall('sense'):
                pos = texts(sense, 'pos') or pos
                glosses = [g.text or '' for g in sense.findall('gloss') if g.get('{http://www.w3.org/XML/1998/namespace}lang', 'eng') == 'eng']
                if glosses:
                    senses.append(dict(glosses=glosses, spellings=texts(sense, 'stagk'), readings=texts(sense, 'stagr'),
                                       pos=pos, field=texts(sense, 'field'), misc=texts(sense, 'misc'), dialect=texts(sense, 'dial'), info=texts(sense, 's_inf')))
            if senses:
                identifier = node.findtext('ent_seq')
                entry = dict(id=identifier, spellings=spellings, readings=readings, senses=senses)
                terms = {unicodedata.normalize('NFC', item['text']) for item in spellings + readings}
                for term in sorted(terms):
                    shard = shards[int(bucket(term), 16)]
                    shard['terms'].setdefault(term, []).append(identifier)
                    shard['entries'][identifier] = entry
                count += 1
            root.clear()
    output.mkdir(parents=True, exist_ok=True)
    for index, shard in enumerate(shards):
        text = json.dumps(shard, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n'
        compressed = io.BytesIO()
        with gzip.GzipFile(filename='', mode='wb', fileobj=compressed, mtime=0) as stream:
            stream.write(text.encode('utf-8'))
        (output / f'{index:02x}.json.gz').write_bytes(compressed.getvalue())
    with gzip.open(source, 'rt', encoding='utf-8') as stream:
        header = stream.read(20000)
    created = re.search(r'JMdict created: ([^\n]+)', header)
    manifest = dict(schema=1, shards=256, entries=count, snapshot=metadata,
                    created=created.group(1).strip() if created else metadata['retrieved'], license='CC BY-SA 4.0')
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + '\n', encoding='utf-8')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=Path('data/jmdict/JMdict_e.gz'))
    parser.add_argument('--metadata', type=Path, default=Path('data/jmdict/snapshot.json'))
    parser.add_argument('--output', type=Path, default=Path('dist/dictionaries/jmdict'))
    args = parser.parse_args()
    print(json.dumps(generate(args.source, args.output, json.loads(args.metadata.read_text())), indent=2))
