import {execFileSync} from 'node:child_process';
import {readFile,rm,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
await import('./build.mjs');
const {version}=JSON.parse(await readFile('dist/manifest.json','utf8'));
const output=resolve(`ko-japanese-reading-companion-${version}-chrome-web-store.zip`);
await rm(output,{force:true});
// Explicit allowlist: exclude source maps, screenshots, development notes, and
// previous archives. Chrome expects manifest.json at the ZIP root.
export const packageFiles=['manifest.json','background.js','content.js','docs-bridge.js','offscreen.js','tokenizer.js','playground-data-worker.js','grammar','popup.js','popup.html','playgrounds.html','playgrounds.js','offscreen.html','privacy.html','about.html','about.js','animations.html','animations.js','release-notes.html','art','icons','dict','dictionaries','licenses','LICENSE'];
async function rejectNestedManifests(directory) {
  for(const entry of await readdir(directory,{withFileTypes:true})) {
    const path=resolve(directory,entry.name);
    if(entry.isDirectory())await rejectNestedManifests(path);
    else if(entry.name==='manifest.json')throw new Error(`Nested extension manifest in package: ${path}`);
  }
}
for(const directory of ['art','icons','dict','dictionaries','grammar','licenses'])await rejectNestedManifests(resolve('dist',directory));
execFileSync('zip',['-q','-r',output,...packageFiles],{cwd:resolve('dist')});
console.log(`Chrome Web Store package: ${output}`);
