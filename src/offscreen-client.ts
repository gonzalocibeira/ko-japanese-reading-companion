let creating:Promise<void>|undefined;
export async function ensureOffscreen() {
  const contexts=await chrome.runtime.getContexts({contextTypes:[chrome.runtime.ContextType.OFFSCREEN_DOCUMENT]});
  if(contexts.length)return;
  if(!creating)creating=chrome.offscreen.createDocument({url:'offscreen.html',
    reasons:[chrome.offscreen.Reason.WORKERS,chrome.offscreen.Reason.DOM_PARSER],
    justification:'Run the offline Japanese tokenizer and safely extract dictionary text.'}).finally(()=>{creating=undefined;});
  await creating;
}
