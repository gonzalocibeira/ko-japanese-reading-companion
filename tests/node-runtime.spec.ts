import {test,expect} from '@playwright/test';
import {execFileSync} from 'node:child_process';

// Run the actual ESM guard without Playwright's CommonJS transformation.
function checkVersions(versions:string[]) {
  return JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',`
    import {supportsNodeVersion} from './scripts/check-node.mjs';
    console.log(JSON.stringify(${JSON.stringify(versions)}.map(supportsNodeVersion)));
  `],{encoding:'utf8'})) as boolean[];
}

test('Node security baseline rejects affected releases and unreviewed release lines',()=>{
  const versions=['18.20.8','20.20.2','22.23.3','24.22.0','26.10.0','26.12.0','25.9.0','27.0.0','28.0.0','26.12.1-rc.1','invalid'];
  expect(checkVersions(versions)).toEqual(versions.map(()=>false));
});

test('Node security baseline accepts fixed releases and subsequent updates in supported lines',()=>{
  const versions=['22.23.4','22.23.5','22.24.0','24.22.1','24.22.2','24.23.0','26.12.1','v26.12.1','26.12.2','26.13.0'];
  expect(checkVersions(versions)).toEqual(versions.map(()=>true));
});
