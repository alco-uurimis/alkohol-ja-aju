import type * as RuContent from './content.ru';
import { loadEn, wantsEn } from './en';

/**
 * The Russian lesson content is a separate chunk that Estonian readers never need.
 * It is loaded on demand: before the first render when Russian is requested (see wantsRu), or when the reader switches to RU.
 * Components read it through getRu() inside their `ru ? … : …` branches, which only run once it is loaded.
 */
let loaded: typeof RuContent | null = null;
let pending: Promise<typeof RuContent> | null = null;

export function loadRu(): Promise<typeof RuContent> {
  pending ??= import('./content.ru').then(m => { loaded = m; return m; });
  return pending;
}

export function getRu(): typeof RuContent {
  if (!loaded) throw new Error('Russian content is not loaded yet');
  return loaded;
}

/** Same rule the pages use to pick the initial language: ?lang= first, then the saved choice. */
export function wantsRu(): boolean {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'ru' || q === 'et' || q === 'en') return q === 'ru';
    return localStorage.getItem('alkohol-ja-aju:language') === 'ru';
  } catch { return false; }
}

/** Run `render` once the content the first screen needs is available. */
export function whenReady(render: () => void): void {
  if (wantsEn()) { loadEn().then(render, () => { try { localStorage.setItem('alkohol-ja-aju:language', 'et'); const url = new URL(location.href); url.searchParams.delete('lang'); history.replaceState(null, '', url); } catch { /* ignore */ } render(); }); return; }
  if (!wantsRu()) { render(); return; }
  loadRu().then(render, () => {
    // Russian content could not be fetched (offline on a first visit): fall back to Estonian instead of a broken page.
    try {
      localStorage.setItem('alkohol-ja-aju:language', 'et');
      const url = new URL(location.href);
      url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    } catch { /* ignore */ }
    render();
  });
}
