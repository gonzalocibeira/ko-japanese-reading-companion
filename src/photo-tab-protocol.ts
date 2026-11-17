import type {PhotoRectangle} from './photo-vision';

export const photoTabUnavailable = 'This tab is unavailable for Photo Lookup. Open Photo Lookup to paste or choose an image.';
export const photoTabExpired = 'The selected area is no longer available. Choose it again from the toolbar.';
export const photoTabMoved = 'The page moved. Select the area again.';
export const photoTabNeedsGesture = 'To capture this tab, use Look up from this tab in the Kō toolbar menu, or your Photo Lookup browser shortcut.';

export interface PhotoViewport {width:number;height:number}
export interface PhotoTabSelection {rect:PhotoRectangle; viewport:PhotoViewport}
export interface PhotoTabSession {id:string;tabId:number;windowId:number;documentId?:string}
export interface PhotoTabOwner extends PhotoTabSession {documentId:string}

export function validPhotoSize(value:unknown):value is PhotoViewport {
  if(!value || typeof value !== 'object')return false;
  const {width,height}=value as PhotoViewport;
  return Number.isFinite(width) && width>0 && width<=32768 && Number.isFinite(height) && height>0 && height<=32768;
}

export function validPhotoRectangle(value:unknown):value is PhotoRectangle {
  if(!validPhotoSize(value))return false;
  const {x,y}=value as PhotoRectangle;
  return Number.isFinite(x) && x>=0 && x<=32768 && Number.isFinite(y) && y>=0 && y<=32768;
}

export function validPhotoTabSelection(value:unknown):value is PhotoTabSelection {
  if(!value || typeof value !== 'object')return false;
  const {rect,viewport}=value as PhotoTabSelection;
  return validPhotoRectangle(rect) && validPhotoSize(viewport) && rect.width>=16 && rect.height>=16 &&
    rect.x+rect.width<=viewport.width && rect.y+rect.height<=viewport.height;
}

export function screenshotCrop(selection:PhotoTabSelection,bitmap:PhotoViewport):PhotoRectangle {
  const {rect,viewport}=selection;
  // captureVisibleTab returns bitmap pixels. Ratios also cover browser zoom
  // and captures for which devicePixelRatio differs from the output density.
  const xScale=bitmap.width/viewport.width,yScale=bitmap.height/viewport.height;
  const x=Math.floor(rect.x*xScale),y=Math.floor(rect.y*yScale);
  const right=Math.min(bitmap.width,Math.ceil((rect.x+rect.width)*xScale));
  const bottom=Math.min(bitmap.height,Math.ceil((rect.y+rect.height)*yScale));
  return {x,y,width:right-x,height:bottom-y};
}
