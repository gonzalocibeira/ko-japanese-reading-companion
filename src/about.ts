import {uiTheme} from './ui-theme';

const theme=document.createElement('style');
theme.textContent=uiTheme;
document.head.append(theme);
const version=document.querySelector<HTMLButtonElement>('#version')!;
version.textContent=`Version ${chrome.runtime.getManifest().version}`;
let versionClicks=0;
version.addEventListener('click',()=>{
  if(++versionClicks===5) {
    versionClicks=0;
    location.href=chrome.runtime.getURL('animations.html');
  }
});

const legacy=document.querySelector<HTMLInputElement>('#show-legacy-animations')!;
const status=document.querySelector<HTMLElement>('#animation-status')!;
let saved=false;
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==='local' && changes.showLegacyAnimations) {
    saved=changes.showLegacyAnimations.newValue===true;legacy.checked=saved;
  }
});
void chrome.storage.local.get({showLegacyAnimations:false}).then(state=>{
  saved=state.showLegacyAnimations===true;legacy.checked=saved;legacy.disabled=false;
}).catch(()=>{status.textContent='Could not load the animation setting. Reload this page to try again.';});
legacy.addEventListener('change',async()=>{
  const value=legacy.checked;legacy.disabled=true;status.textContent='';
  try {
    await chrome.storage.local.set({showLegacyAnimations:value});saved=value;
    status.textContent=value?'Legacy animations are on.':'New mimetic animations are on.';
  } catch {
    legacy.checked=saved;status.textContent='Could not save the animation setting. Try again.';
  } finally {legacy.disabled=false;}
});
