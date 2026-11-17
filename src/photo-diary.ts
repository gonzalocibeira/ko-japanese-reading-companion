import type {DiaryCrop, DiaryImage} from './photo-diary-types';

export type {DiaryCrop} from './photo-diary-types';

export interface DiaryWord { word: string; reading: string; meaning: string }
export interface DiaryEntry extends DiaryWord, DiaryImage { id: string; createdAt: number }
type CropReply = DiaryImage | { error: string };

const databaseName = 'ko-picture-diary';
const storeName = 'entries';
export function validDiaryWord(value: Partial<DiaryWord>): boolean {
  const valid = (text: unknown, limit: number) => typeof text === 'string' && text.trim().length > 0 && text.length <= limit;
  return valid(value.word, 256) && valid(value.reading, 256) && valid(value.meaning, 1024);
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    let blocked = false;
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, {keyPath: 'id'});
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(new Error('Close other Picture Diary tabs and try again.'));
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      if (blocked) request.result.close();
      else resolve(request.result);
    };
  });
}

async function transaction<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const db = await openDatabase();
  try {
    const transaction = db.transaction(storeName, mode);
    const finished = new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error ?? new Error('Picture Diary storage was interrupted.'));
    });
    // Await the commit as well as the request so a quota or late commit failure is visible to the caller.
    try {
      const [value] = await Promise.all([operation(transaction.objectStore(storeName)), finished]);
      return value;
    } catch (error) {
      // A synchronous add error does not abort IndexedDB's other pending writes by itself.
      try { transaction.abort(); } catch { /* The transaction already finished. */ }
      await finished.catch(() => {});
      throw error;
    }
  } finally {
    db.close();
  }
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function encodeCrop(image: Blob, crop: DiaryCrop): Promise<DiaryImage> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(chrome.runtime.getURL('photo-diary-worker.js'), {type: 'module'});
    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('The crop took too long to save. Try a smaller crop.'));
    }, 30000);
    const cleanup = () => {
      clearTimeout(timer);
      worker.terminate();
    };
    worker.onmessage = ({data}: MessageEvent<CropReply>) => {
      cleanup();
      if ('error' in data) reject(new Error(data.error));
      else resolve(data);
    };
    worker.onerror = () => {
      cleanup();
      reject(new Error('Could not save the image crop. Try again.'));
    };
    try {
      worker.postMessage({image, crop});
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

export async function saveDiaryEntry(image: Blob, crop: DiaryCrop, word: DiaryWord): Promise<DiaryEntry> {
  if (!validDiaryWord(word)) throw new Error('Choose a Japanese word before saving.');
  const encoded = await encodeCrop(image, crop);
  const entry: DiaryEntry = {
    ...encoded, id: crypto.randomUUID(), createdAt: Date.now(),
    word: word.word.trim(), reading: word.reading.trim(), meaning: word.meaning.trim(),
  };
  await transaction('readwrite', async store => requestValue(store.add(entry)));
  return entry;
}

export async function listDiaryEntries(): Promise<DiaryEntry[]> {
  const entries: DiaryEntry[] = await transaction('readonly', async store => requestValue(store.getAll()));
  return entries.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id));
}

export async function deleteDiaryEntry(id: string): Promise<void> {
  await transaction('readwrite', async store => requestValue(store.delete(id)));
}

export async function mergeDiaryEntries(entries: DiaryEntry[]): Promise<{added: number; skipped: number}> {
  return transaction('readwrite', async store => {
    let added = 0;
    for (const entry of entries) {
      if (await requestValue(store.getKey(entry.id)) !== undefined) continue;
      await requestValue(store.add(entry));
      added++;
    }
    return {added, skipped: entries.length - added};
  });
}
