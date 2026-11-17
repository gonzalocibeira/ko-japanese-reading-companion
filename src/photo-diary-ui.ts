import {button, node} from './playground-tools';
import {hiragana} from './shared';
import {deleteDiaryEntry, listDiaryEntries, type DiaryEntry} from './photo-diary';
import {exportDiary, importDiary} from './photo-diary-backup';

export const pictureDiaryStyles = `
.picture-diary{--diary-line:#d4c5ab;--diary-card:#faf3e4;--diary-faint:#eee2cb;--diary-radius:4px;flex:1;overflow:auto;overscroll-behavior:contain;padding:clamp(14px,3vw,32px);min-height:0;color:var(--ink,#242b2d);font:14px/1.5 var(--body,system-ui)}
.picture-diary-heading{margin:0 0 16px;font:750 clamp(24px,3vw,31px)/1.22 var(--body,system-ui);letter-spacing:-.03em}
.picture-diary-actions{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:10px 16px;padding-bottom:14px;border-bottom:1px solid var(--diary-line)}
.picture-diary-backup{display:flex;gap:6px;flex-wrap:wrap}
.picture-diary-backup button,.picture-diary-remove{margin:0;border:1px solid #b7aa92;background:var(--diary-card);border-radius:var(--diary-radius);padding:7px 10px;color:var(--ink,#242b2d);font:650 12px/1.4 var(--body,system-ui);cursor:pointer}
.picture-diary-backup button:hover:not(:disabled),.picture-diary-remove:hover:not(:disabled){background:var(--diary-faint)}
.picture-diary-search{flex:1 1 240px;max-width:390px;display:grid;gap:5px;font-size:12px;font-weight:700}
.picture-diary-search input{width:100%;min-width:0;padding:8px 10px;border:1px solid #b7aa92;border-radius:var(--diary-radius);background:var(--diary-card);color:var(--ink,#242b2d);font:400 14px/1.4 var(--body,system-ui)}
.picture-diary-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:14px;list-style:none;margin:0;padding:0}
.picture-diary-card{display:flex;flex-direction:column;border:1px solid var(--diary-line);border-radius:var(--diary-radius);background:var(--diary-card);overflow:hidden;overflow-wrap:anywhere}
.picture-diary-image{aspect-ratio:4/3;display:grid;place-items:center;border-bottom:1px solid var(--diary-line);padding:8px;background:#e7ddc6}
.picture-diary-image img{width:100%;height:100%;min-height:0;display:block;object-fit:contain}
.picture-diary-entry{display:grid;gap:2px;align-content:start;min-width:0;padding:10px 12px 8px}
.picture-diary-card p,.picture-diary-card time{margin:0}
.picture-diary-word{display:flex;align-items:baseline;flex-wrap:wrap;gap:0 7px;color:var(--accent,#234e64);font:750 22px/1.4 var(--body,system-ui)}
.picture-diary-word small{color:var(--muted,#625d50);font:600 12px/1.4 var(--body,system-ui)}
.picture-diary-meta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;padding:0 9px 7px 12px;margin-top:auto}
.picture-diary-card time,.picture-diary-summary,.picture-diary-status{color:var(--muted,#625d50);font-size:12px}
.picture-diary-remove{color:var(--seal,#9f3e2d);border-color:transparent;background:transparent;padding:5px 6px}
.picture-diary-summary,.picture-diary-status{margin:11px 0}
.picture-diary-status:empty,.picture-diary-summary:empty,.picture-diary-results:empty{display:none}
.picture-diary-empty{margin:15px 0;padding:21px;border:1px dashed #a89b83;border-radius:var(--diary-radius);background:var(--diary-card)}
.picture-diary-empty h3{font:750 16px/1.4 var(--body,system-ui);margin:0 0 4px}
.picture-diary-empty p{margin:0;color:var(--muted,#625d50);font-size:13px}
`;

function normalize(value: string): string {
  return hiragana(value.normalize('NFKC')).toLocaleLowerCase('en').trim();
}

export function renderPictureDiary() {
  const element = node('section', 'picture-diary');
  element.setAttribute('aria-label', 'Picture Diary');
  const actions = node('div', 'picture-diary-actions');
  const backup = node('div', 'picture-diary-backup');
  const label = node('label', 'picture-diary-search', 'Search Picture Diary');
  const search = node('input');
  search.type = 'search';
  search.placeholder = 'Japanese, reading, or English';
  label.append(search);
  const status = node('p', 'picture-diary-status');
  status.setAttribute('role', 'status');
  const summary = node('p', 'picture-diary-summary');
  const empty = node('div', 'picture-diary-empty');
  const emptyTitle = node('h3');
  const emptyHelp = node('p');
  empty.append(emptyTitle, emptyHelp);
  empty.hidden = true;
  const list = node('ul', 'picture-diary-results');
  const upload = node('input');
  upload.type = 'file';
  upload.accept = '.zip,application/zip';
  upload.hidden = true;
  const importButton = button('Import diary', () => upload.click());
  const exportButton = button('Export diary', () => void run(async () => {
    const archive = await exportDiary();
    if (disposed) return;
    const url = URL.createObjectURL(archive);
    const link = node('a');
    link.href = url;
    link.download = `ko-picture-diary-${new Date().toISOString().slice(0, 10)}.zip`;
    element.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
    status.textContent = 'Picture Diary exported.';
  }));
  backup.append(importButton, exportButton, upload);
  actions.append(label, backup);
  element.append(node('h2', 'picture-diary-heading', 'Picture Diary'), actions, status, summary, empty, list);

  let entries: DiaryEntry[] = [];
  const urls: string[] = [];
  let disposed = false;
  let busy = false;
  let revision = 0;
  const dateFormat = new Intl.DateTimeFormat(undefined, {dateStyle: 'medium'});

  function releaseImages() {
    for (const url of urls.splice(0)) URL.revokeObjectURL(url);
  }

  function render() {
    releaseImages();
    const query = normalize(search.value);
    const matches = entries.filter(({word, reading, meaning}) => [word, reading, meaning].some(value => normalize(value).includes(query)));
    const result = document.createDocumentFragment();
    for (const entry of matches) {
      const card = node('li', 'picture-diary-card');
      const image = node('div', 'picture-diary-image');
      const img = node('img');
      img.alt = entry.meaning;
      img.loading = 'lazy';
      img.src = URL.createObjectURL(entry.image);
      urls.push(img.src);
      image.append(img);
      const word = node('p', 'picture-diary-word');
      word.lang = 'ja';
      word.append(node('span', '', entry.word));
      if (entry.reading && entry.word !== entry.reading) word.append(node('small', '', entry.reading));
      const vocabulary = node('div', 'picture-diary-entry');
      vocabulary.append(word, node('p', '', entry.meaning));
      const date = new Date(entry.createdAt);
      const time = node('time', '', dateFormat.format(date));
      time.dateTime = date.toISOString();
      const remove = button('Delete', () => void run(async () => {
        await deleteDiaryEntry(entry.id);
        if (disposed) return;
        await refresh();
        status.textContent = `Removed ${entry.word} from Picture Diary.`;
        search.focus({preventScroll: true});
      }), 'picture-diary-remove');
      remove.setAttribute('aria-label', `Delete ${entry.word}`);
      const meta = node('div', 'picture-diary-meta');
      meta.append(time, remove);
      card.append(image, vocabulary, meta);
      result.append(card);
    }
    list.replaceChildren(result);
    empty.hidden = matches.length > 0;
    emptyTitle.textContent = entries.length ? 'No matching entries' : 'No saved pictures yet';
    emptyHelp.textContent = entries.length ? 'Try another Japanese word, reading, or English meaning.' : 'Save a word from Photo Lookup to keep its picture here.';
    summary.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'}` : '';
  }

  async function refresh() {
    const current = ++revision;
    try {
      const next = await listDiaryEntries();
      if (disposed || current !== revision) return;
      entries = next;
      render();
    } catch {
      if (!disposed && current === revision) status.textContent = 'Could not open Picture Diary. Try again.';
    }
  }

  async function run(operation: () => Promise<void>) {
    if (busy || disposed) return;
    busy = true;
    importButton.disabled = exportButton.disabled = true;
    status.textContent = 'Working…';
    try {
      await operation();
    } catch (error) {
      if (!disposed) status.textContent = error instanceof DOMException && error.name === 'QuotaExceededError' ?
        'There is not enough browser storage. Delete some diary entries and try again.' :
        error instanceof Error ? error.message : 'Could not update Picture Diary. Try again.';
    } finally {
      busy = false;
      importButton.disabled = exportButton.disabled = false;
    }
  }

  search.oninput = render;
  upload.onchange = () => {
    const file = upload.files?.[0];
    upload.value = '';
    if (file) void run(async () => {
      const {added, skipped} = await importDiary(file);
      if (disposed) return;
      await refresh();
      status.textContent = `Imported ${added} ${added === 1 ? 'entry' : 'entries'}. Skipped ${skipped} already in the diary.`;
    });
  };

  return {
    element,
    focus: () => search.focus(),
    refresh,
    dispose() {
      disposed = true;
      releaseImages();
    },
  };
}
