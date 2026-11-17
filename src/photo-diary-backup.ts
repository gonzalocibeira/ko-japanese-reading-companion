import {BlobReader, BlobWriter, TextReader, TextWriter, ZipReader, ZipWriter} from '@zip.js/zip.js/lib/zip-core-native.js';
import {listDiaryEntries, mergeDiaryEntries, validDiaryWord, type DiaryEntry, type DiaryWord} from './photo-diary';
import {validDiaryDimensions} from './photo-diary-types';

type DiaryImageType = 'image/png' | 'image/webp';
interface DiaryBackupEntry extends DiaryWord {
  id: string;
  createdAt: number;
  type: DiaryImageType;
  width: number;
  height: number;
}

const backupManifest = 'picture-diary.json';
const maxManifestBytes = 16 * 1024 * 1024;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/;
const zipOptions = {useWebWorkers: false};

function imagePath(id: string, type: DiaryImageType): string {
  return `images/${id}.${type === 'image/webp' ? 'webp' : 'png'}`;
}

export async function exportDiary(): Promise<Blob> {
  const entries = await listDiaryEntries();
  const writer = new ZipWriter(new BlobWriter('application/zip'), {...zipOptions, level: 0});
  const manifest: DiaryBackupEntry[] = [];
  for (const {image, ...entry} of entries) {
    const type = image.type as DiaryImageType;
    manifest.push({...entry, type});
    // Each crop is already compressed and can be restored byte for byte.
    await writer.add(imagePath(entry.id, type), new BlobReader(image));
  }
  const json = JSON.stringify({version: 1, entries: manifest});
  if (new Blob([json]).size > maxManifestBytes) throw new Error('The diary is too large for a single backup.');
  await writer.add(backupManifest, new TextReader(json));
  return writer.close();
}

function parseBackup(value: unknown): DiaryBackupEntry[] {
  if (!value || typeof value !== 'object') throw new Error('The backup is missing its entry list.');
  const {version, entries} = value as {version?: unknown; entries?: unknown};
  if (version !== 1) throw new Error('This Picture Diary backup version is unsupported.');
  if (!Array.isArray(entries)) throw new Error('The backup is missing its entry list.');
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || !validDiaryWord(entry) ||
      typeof entry.id !== 'string' || !uuid.test(entry.id) || !Number.isSafeInteger(entry.createdAt) || entry.createdAt < 0 || entry.createdAt > 8.64e15 ||
      !validDiaryDimensions(entry.width, entry.height) || (entry.type !== 'image/png' && entry.type !== 'image/webp')) {
      throw new Error('The backup contains an invalid diary entry.');
    }
  }
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('The backup repeats a diary entry ID.');
  return entries;
}

function pngMatchesCrop(bytes: DataView, width: number, height: number): boolean {
  if (bytes.byteLength < 33 || bytes.getUint32(0) !== 0x89504e47 || bytes.getUint32(4) !== 0x0d0a1a0a ||
    bytes.getUint32(8) !== 13 || bytes.getUint32(12) !== 0x49484452 ||
    bytes.getUint32(16) !== width || bytes.getUint32(20) !== height) return false;
  for (let offset = 33; offset + 12 <= bytes.byteLength;) {
    const length = bytes.getUint32(offset), tag = bytes.getUint32(offset + 4);
    offset += 12 + length;
    if (tag === 0x6163544c) return false; // acTL denotes an animated PNG.
    if (tag === 0x49454e44) return length === 0 && offset === bytes.byteLength; // IEND
  }
  return false;
}

function webpMatchesCrop(bytes: DataView, width: number, height: number): boolean {
  if (bytes.byteLength < 25 || bytes.getUint32(0) !== 0x52494646 || bytes.getUint32(4, true) + 8 !== bytes.byteLength ||
    bytes.getUint32(8) !== 0x57454250 || bytes.getUint32(12) !== 0x5650384c || bytes.getUint8(20) !== 0x2f) return false;
  const length = bytes.getUint32(16, true);
  const flags = bytes.getUint32(21, true);
  return length >= 5 && 20 + length + (length % 2) === bytes.byteLength && flags >>> 29 === 0 &&
    (flags & 0x3fff) + 1 === width && ((flags >>> 14) & 0x3fff) + 1 === height;
}

async function validateImage(image: Blob, entry: DiaryBackupEntry): Promise<void> {
  const {width, height} = entry;
  const bytes = new DataView(await image.arrayBuffer());
  const matches = entry.type === 'image/png' ? pngMatchesCrop(bytes, width, height) : webpMatchesCrop(bytes, width, height);
  if (!matches) throw new Error('The backup contains an invalid image crop.');
  const bitmap = await createImageBitmap(image);
  try {
    if (bitmap.width !== width || bitmap.height !== height) throw new Error('The backup contains an invalid image crop.');
  } finally {
    bitmap.close();
  }
}

async function readBackup(archive: Blob): Promise<DiaryEntry[]> {
  const reader = new ZipReader(new BlobReader(archive), {
    ...zipOptions, checkCrc32: true, checkOverlappingEntry: true, strictness: 'strict',
  });
  try {
    const files = new Map((await reader.getEntries()).map(entry => [entry.filename, entry]));
    const manifest = files.get(backupManifest);
    if (!manifest || manifest.directory || manifest.encrypted || manifest.compressionMethod !== 0 || manifest.uncompressedSize > maxManifestBytes) {
      throw new Error('Choose a Kō Picture Diary backup ZIP.');
    }
    const entries = parseBackup(JSON.parse(await manifest.getData(new TextWriter())));
    if (files.size !== entries.length + 1) throw new Error('The backup contains unexpected files.');
    const result: DiaryEntry[] = [];
    for (const entry of entries) {
      const file = files.get(imagePath(entry.id, entry.type));
      const maxBytes = entry.width * entry.height * 8 + 65536;
      if (!file || file.directory || file.encrypted || file.compressionMethod !== 0 || file.uncompressedSize > maxBytes) {
        throw new Error('The backup contains a missing or oversized image crop.');
      }
      const image = await file.getData(new BlobWriter(entry.type));
      await validateImage(image, entry);
      const {id, createdAt, word, reading, meaning, width, height} = entry;
      result.push({id, createdAt, word, reading, meaning, width, height, image});
    }
    return result;
  } finally {
    await reader.close();
  }
}

export async function importDiary(archive: Blob): Promise<{added: number; skipped: number}> {
  return mergeDiaryEntries(await readBackup(archive));
}
