/** Site languages. Estonian is the base; Russian and English are full or partial translations (see README). */
export type Lang = 'et' | 'ru' | 'en';
export const LANGS: readonly Lang[] = ['et', 'ru', 'en'];
export const LANGUAGE_KEY = 'alkohol-ja-aju:language';

export const isLang = (v: unknown): v is Lang => v === 'et' || v === 'ru' || v === 'en';

/** ?lang= wins, then the saved choice, then Estonian. */
export function readLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (isLang(q)) return q;
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (isLang(saved)) return saved;
  } catch { /* storage unavailable */ }
  return 'et';
}

/** Pick a string by language. */
export const pick = <T,>(lang: Lang, v: { et: T; ru: T; en: T }): T => v[lang];
