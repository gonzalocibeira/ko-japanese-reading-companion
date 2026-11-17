export interface DiaryCrop { x: number; y: number; width: number; height: number }
export interface DiaryImage { image: Blob; width: number; height: number }

export function validDiaryDimensions(width: number, height: number): boolean {
  return Number.isSafeInteger(width) && Number.isSafeInteger(height) &&
    width > 0 && height > 0 && width <= 32767 && height <= 32767 && width * height <= 40_000_000;
}
