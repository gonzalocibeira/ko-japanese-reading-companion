import {readFileSync} from 'node:fs';

// Keep installation and command checks on the same security baseline.
const {engines:{node:required}}=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const floors=required.split(' || ').map(range=>{
  const match=/^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
  if(!match)throw new Error('Review the Node.js security check after changing the engine range.');
  return match.slice(1).map(Number);
});

export function supportsNodeVersion(version) {
  const match=/^v?(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if(!match)return false;
  const [major,minor,patch]=match.slice(1).map(Number);
  return floors.some(([line,minMinor,minPatch])=>major===line && (minor>minMinor || (minor===minMinor && patch>=minPatch)));
}

if(!supportsNodeVersion(process.versions.node))throw new Error(
  `Node.js ${process.versions.node} is outside the security baseline (${required}). Run "nvm install" and "nvm use" in the repository, then retry. See docs/security-review-2026-10.md.`
);
