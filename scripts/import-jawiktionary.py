"""Build offline Japanese definitions from pinned Japanese Wiktionary JSONL.

Python standard library only. Ordinary builds never download or execute source data.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import re
import unicodedata


def normalize(text):
    return unicodedata.normalize('NFC', text).strip()


def bucket(term):
    value = 2166136261
    for char in term:
        value = ((value ^ ord(char)) * 16777619) & 0xffffffff
    return f'{value & 255:02x}'


def pack(path, value):
    text = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n'
    with path.open('wb') as file:
        with gzip.GzipFile(filename='', mode='wb', fileobj=file, mtime=0) as stream:
            stream.write(text.encode('utf-8'))


def generate(source, output, metadata):
    if hashlib.sha256(source.read_bytes()).hexdigest() != metadata['sha256']:
        raise ValueError('Japanese Wiktionary snapshot checksum mismatch')
    by_word = {}
    source_rows = 0
    with gzip.open(source, 'rt', encoding='utf-8') as stream:
        for number, line in enumerate(stream):
            row = json.loads(line)
            if row.get('lang_code') != 'ja':
                continue
            source_rows += 1
            word = normalize(row.get('word', ''))
            if not word or len(word) > 80:
                continue
            definitions, references = [], set()
            for sense in row.get('senses', []):
                glosses = [normalize(g) for g in sense.get('glosses', []) if isinstance(g, str) and g.strip()]
                if not glosses or 'no-gloss' in sense.get('tags', []):
                    continue
                targets = {normalize(ref.get('word', '')) for ref in sense.get('form_of', []) + sense.get('alt_of', []) if ref.get('word')}
                if targets:
                    # Resolve only explicit spelling references, never guess from
                    # arbitrary links, translations, inflected forms or examples.
                    if len(targets) == 1 and re.search(r'(?:^|[。\s「『【])' + re.escape(next(iter(targets))) + r'[」』】]?の(?:漢字表記|異表記|別表記)[。.]?$', ' '.join(glosses)):
                        references.update(targets)
                    else:
                        references.add('')  # Keep ambiguity unresolved.
                    continue
                text = ' '.join(glosses)
                if '{{' in text or '[[' in text:
                    continue  # Unexpanded source markup is not a definition.
                definitions.append(dict(text=text, tags=sense.get('tags', []), rawTags=sense.get('raw_tags', []), topics=sense.get('topics', [])))
            if not definitions and not references:
                continue
            readings = sorted({normalize(form['form']) for form in row.get('forms', [])
                               if isinstance(form.get('form'), str) and set(form.get('tags', [])) == {'transliteration'}
                               and re.fullmatch(r'[ぁ-ゖァ-ヺー・ ]+', normalize(form['form']))})
            entry = dict(id=f'ja:{number}', title=word, pos=row.get('pos', ''), senses=definitions, references=sorted(references), readings=readings)
            by_word.setdefault(word, []).append(entry)

    # No alias-by-reading expansion: it would conflate unrelated kanji homophones.
    # Canonical kana pages themselves remain directly searchable.
    def resolve(word, trail=()):
        if word in trail or len(trail) > 8:
            return None
        entries = by_word.get(word, [])
        direct = [entry for entry in entries if entry['senses']]
        if direct:
            return direct
        targets = {target for entry in entries for target in entry['references']}
        if len(targets) != 1 or '' in targets:
            return None
        return resolve(next(iter(targets)), trail + (word,))

    shards = [{'terms': {}, 'entries': {}} for _ in range(256)]
    usable = 0
    aliases = 0
    unique_entries = set()
    for word in sorted(by_word):
        resolved = resolve(word)
        if not resolved:
            continue
        shard = shards[int(bucket(word), 16)]
        shard['terms'][word] = [entry['id'] for entry in resolved]
        for entry in resolved:
            shard['entries'][entry['id']] = {key: value for key, value in entry.items() if key != 'references'}
            unique_entries.add(entry['id'])
        usable += 1
        aliases += int(all(entry['title'] != word for entry in resolved))
    output.mkdir(parents=True, exist_ok=True)
    for index, shard in enumerate(shards):
        pack(output / f'{index:02x}.json.gz', shard)
    manifest = dict(schema=1, shards=256, language='ja', words=usable, entries=len(unique_entries),
                    resolvedSpellings=aliases, unresolvedWords=len(by_word)-usable, sourceRows=source_rows,
                    snapshot=metadata, license='CC BY-SA 4.0')
    (output / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2, sort_keys=True) + '\n')
    return manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=Path('data/jawiktionary/source.jsonl.gz'))
    parser.add_argument('--metadata', type=Path, default=Path('data/jawiktionary/snapshot.json'))
    parser.add_argument('--output', type=Path, default=Path('dist/dictionaries/jawiktionary'))
    args = parser.parse_args()
    print(json.dumps(generate(args.source, args.output, json.loads(args.metadata.read_text())), indent=2))
