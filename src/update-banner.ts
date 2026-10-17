// One local dismissal per release; opening the menu or reading the notes does
// not dismiss the announcement. The build supplies the current release copy.
export async function setupUpdateBanner() {
  const banner=document.querySelector<HTMLElement>('#update-banner');
  if(!banner)return;
  const version=chrome.runtime.getManifest().version;
  const key=`dismissedUpdate:${version}`;
  const close=banner.querySelector<HTMLButtonElement>('#dismiss-update')!;
  const error=banner.querySelector<HTMLElement>('#update-error')!;
  const sync=(changes:Record<string,chrome.storage.StorageChange>,area:string)=>{
    if(area==='local' && changes[key])banner.hidden=changes[key].newValue===true;
  };
  chrome.storage.onChanged.addListener(sync);
  close.addEventListener('click',async()=>{
    close.disabled=true;error.hidden=true;
    try {
      await chrome.storage.local.set({[key]:true});
      banner.hidden=true;
      document.querySelector<HTMLInputElement>('#enabled')?.focus();
    } catch {
      error.textContent='Could not save dismissal. Try again.';error.hidden=false;
    } finally {close.disabled=false;}
  });
  try {
    const state=await chrome.storage.local.get(key);
    banner.hidden=state[key]===true;
  } catch { /* Keep the optional announcement hidden if storage is unavailable. */ }
}
