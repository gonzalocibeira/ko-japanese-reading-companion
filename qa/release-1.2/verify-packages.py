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
assert json.loads(expected['manifest.json']) == json.loads((root / 'public/manifest.json').read_text())
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
(root / 'qa/release-1.2/packages.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
print('Both layouts match the same built runtime byte-for-byte; 90 animation strips included.')
