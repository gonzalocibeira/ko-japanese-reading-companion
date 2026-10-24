"""Build a local prefix/gloss index from the already verified JMdict shards."""
import gzip
import json
from pathlib import Path
import re
import unicodedata


def normalize(value):
    value = unicodedata.normalize('NFKC', value).lower().strip()
    return ''.join(chr(ord(char) - 0x60) if '\u30a1' <= char <= '\u30f6' else char for char in value)


def build(root):
    records = {}
    for path in sorted(root.glob('[0-9a-f][0-9a-f].json.gz')):
        with gzip.open(path, 'rt') as stream:
            for identifier, entry in json.load(stream)['entries'].items():
                records.setdefault(identifier, (entry, path.name[:2]))
    entries, terms, english = [], set(), {}
    for identifier, (entry, bucket) in sorted(records.items(), key=lambda item: int(item[0])):
        for reading in entry['readings']:
            compatible = [] if reading['noKanji'] else [s for s in entry['spellings'] if not reading['restrict'] or s['text'] in reading['restrict']]
            for spelling in compatible or [None]:
                headword = spelling['text'] if spelling else reading['text']
                senses = [sense for sense in entry['senses']
                          if (not sense['spellings'] or spelling and headword in sense['spellings'])
                          and (not sense['readings'] or reading['text'] in sense['readings'])]
                if not senses:
                    continue
                glosses = [g for sense in senses for g in sense['glosses']]
                index = len(entries)
                entries.append(dict(id=identifier, bucket=bucket, headword=headword, reading=reading['text'],
                                    meaning='; '.join(glosses[:3])[:240], pos=list(dict.fromkeys(p for s in senses for p in s['pos'])),
                                    common=bool(reading['priority'] or spelling and spelling['priority'])))
                for term in {headword, reading['text']}:
                    terms.add((normalize(term), index))
                for word in set(re.findall(r'[^\W_]+', normalize(' '.join(glosses)), re.UNICODE)):
                    english.setdefault(word, []).append(index)
    data = dict(entries=entries, terms=sorted(terms), english=dict(sorted(english.items())))
    with (root / 'search.json.gz').open('wb') as file:
        with gzip.GzipFile(fileobj=file, filename='', mode='wb', mtime=0) as stream:
            stream.write(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode())
    print(f'Dictionary search: {len(entries)} entries, {len(terms)} terms, {len(english)} English tokens')


if __name__ == '__main__':
    build(Path('dist/dictionaries/jmdict'))
