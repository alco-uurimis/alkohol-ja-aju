import type * as EnBundle from './enBundle';

/**
 * The English texts are a separate chunk that Estonian and Russian readers never need (same idea as ru.ts).
 * It is loaded before the first render when English is requested (see whenReadyEn), or when the reader switches to EN.
 * Components read it through getEn() inside their `lang === 'en'` branches, which only run once it is loaded.
 */
let loaded: typeof EnBundle | null = null;
let pending: Promise<typeof EnBundle> | null = null;

export function loadEn(): Promise<typeof EnBundle> {
  if (loaded) return Promise.resolve(loaded);
  pending ??= import('./enBundle').then(m => (loaded = m), e => { pending = null; throw e; });
  return pending;
}

export function getEn(): typeof EnBundle {
  if (!loaded) throw new Error('English content is not loaded yet');
  return loaded;
}

/** Same rule the pages use to pick the initial language: ?lang= first, then the saved choice. */
export function wantsEn(): boolean {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'ru' || q === 'et' || q === 'en') return q === 'en';
    return localStorage.getItem('alkohol-ja-aju:language') === 'en';
  } catch { return false; }
}
