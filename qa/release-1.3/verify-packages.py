"""Verify release layouts, runtime parity, exclusions and SHA256SUMS from repo root."""
from pathlib import Path
import hashlib
import json
import re
import zipfile

root = Path(__file__).resolve().parents[2]
version = json.loads((root / 'public/manifest.json').read_text())['version']
package_script = (root / 'scripts/package-store.mjs').read_text()
allowlist = re.search(r'export const packageFiles=\[([^\]]+)\]', package_script).group(1)
expected = {}
for name in re.findall(r"'([^']+)'", allowlist):
    path = root / 'dist' / name
    for entry in sorted(path.rglob('*')) if path.is_dir() else [path]:
        if entry.is_file():
            expected[entry.relative_to(root / 'dist').as_posix()] = entry.read_bytes()
assert sum(name.startswith('art/mimetics/') and name.endswith('.webp') for name in expected) == 90
assert {'animations.html', 'animations.js'} <= expected.keys(), 'Animation gallery missing from packages'
assert b'animations.js' in expected['animations.html']
assert json.loads(expected['manifest.json'])['version_name'] == '1.3.0 WIP'
mascot = json.loads(expected['art/ko-kun/manifest.json'])
assert len(mascot['clips']) == 56 and len(mascot['routines']) == 24
assert sum(name.startswith('art/ko-kun/') and name.endswith('.webp') for name in expected) == 56
assert 'art/ko-kun/' + mascot['staticFallback'] in expected
assert expected['art/fonts/DotGothic16-Regular.ttf'] == (root / 'public/art/fonts/DotGothic16-Regular.ttf').read_bytes()
assert b'SIL OPEN FONT LICENSE' in expected['art/fonts/OFL.txt']
inventory = json.loads((root / 'qa/ko-kun-animation/ps1/asset-sha256.json').read_text())
assert mascot['characterDesign'].startswith('PS1')
for name, digest in inventory['files'].items():
    assert hashlib.sha256(expected['art/ko-kun/' + name]).hexdigest() == digest, f'Mascot asset changed: {name}'
for clip in mascot['clips']:
    path = 'art/ko-kun/' + clip['file']
    assert path in expected
    assert expected[path] == (root / 'public' / path).read_bytes()

assert json.loads(expected['manifest.json']) == json.loads((root / 'public/manifest.json').read_text())
dictionary = json.loads(expected['dictionaries/jmdict/manifest.json'])
assert dictionary['schema'] == 1 and dictionary['shards'] == 256
assert dictionary['entries'] >= 200_000, 'Complete English JMdict snapshot missing'
assert sum(path.startswith('dictionaries/jmdict/') and path.endswith('.json.gz') and path != 'dictionaries/jmdict/compounds.json.gz' for path in expected) == 256
assert 'dictionaries/jmdict/compounds.json.gz' in expected
snapshot = json.loads((root / 'data/jmdict/snapshot.json').read_text())
assert dictionary['snapshot'] == snapshot
assert hashlib.sha256((root / 'data/jmdict/JMdict_e.gz').read_bytes()).hexdigest() == snapshot['sha256']
assert 'licenses/jmdict/JMdict_e.gz' not in expected, 'Source archive must not ship twice'
for notice in ['README.md', 'snapshot.json', 'CC-BY-SA-4.0.txt', 'edrdg-licence.html', 'jmdict-documentation.html']:
    assert expected['licenses/jmdict/' + notice] == (root / 'data/jmdict' / notice).read_bytes()
checksums = dict(line.split()[::-1] for line in (root / 'SHA256SUMS').read_text().splitlines())
report = []
for suffix, prefix in [('', 'dist/'), ('-chrome-web-store', '')]:
    name = f'ko-japanese-reading-companion-{version}{suffix}.zip'
    archive = root / name
    with zipfile.ZipFile(archive) as package:
        files = [info.filename for info in package.infolist() if not info.is_dir()]
        assert len(files) == len(set(files)), 'Duplicate ZIP entries'
        assert all(path.startswith(prefix) for path in files)
        contents = {path[len(prefix):]: package.read(path) for path in files}
        assert contents.keys() == expected.keys(), f'Unexpected or missing runtime files in {name}'
        for path, data in contents.items():
            assert data == expected[path], f'{name}: {path} differs from dist'
            assert not path.endswith('.map')
            assert not path.startswith(('docs/', 'qa/', 'tests/'))
    sha = hashlib.sha256(archive.read_bytes()).hexdigest()
    assert checksums[name] == sha
    report.append(dict(name=name, bytes=archive.stat().st_size, files=len(expected), sha256=sha))
(root / 'qa/release-1.3/packages.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
print('Both layouts match the same built runtime byte-for-byte; 90 mimetic strips and 56 mascot clips included.')
