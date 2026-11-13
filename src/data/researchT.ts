import { researchUiEn } from './researchUi.en';
import type { Lang } from '../researchData';

export const languageKey = 'alkohol-ja-aju:language';

/** Survey UI text: `s` is the ET/RU string already chosen by the caller; English maps the ET source string, falling back to it. */
export const T = (lang: Lang, s: string): string => (lang === 'en' ? (researchUiEn[s] ?? s) : s);

/** ?lang=… in the address wins, then the stored choice. */
export function readSurveyLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    const v = q ?? localStorage.getItem(languageKey);
    return v === 'ru' || v === 'en' ? v : 'et';
  } catch { return 'et'; }
}
