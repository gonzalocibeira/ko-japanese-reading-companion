export interface MascotPosition {x:number;y:number}
export interface MascotPreferences {
  enabled:boolean;
  trigger:'hover'|'highlight';
  definitions:'off'|'en'|'ja';
  size:96|128|160;
  motion:'system'|'reduced';
  positions:Record<string,MascotPosition>;
}
export type MascotPatch=Partial<Omit<MascotPreferences,'positions'>>;
export function mascotPreferences(value:unknown):MascotPreferences {
  const v=value && typeof value==='object' && !Array.isArray(value)?value as Partial<MascotPreferences>:{};
  const positions:Record<string,MascotPosition>=Object.create(null);
  if(v.positions && typeof v.positions==='object' && !Array.isArray(v.positions)) {
    for(const [site,p] of Object.entries(v.positions).slice(-200)) {
      if(!site || site.length>253 || /[\s/\\?#]/u.test(site) || !p || typeof p!=='object')continue;
      if(typeof p.x==='number' && Number.isFinite(p.x) && typeof p.y==='number' && Number.isFinite(p.y))positions[site]={x:Math.max(0,Math.min(1,p.x)),y:Math.max(0,Math.min(1,p.y))};
    }
  }
  return {enabled:v.enabled===true,trigger:v.trigger==='highlight'?'highlight':'hover',definitions:v.definitions==='en' || v.definitions==='ja'?v.definitions:'off',size:v.size===96 || v.size===160?v.size:128,motion:v.motion==='reduced'?'reduced':'system',positions};
}
