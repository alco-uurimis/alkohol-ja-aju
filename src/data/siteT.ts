import { getEn } from './en';

/** Main-page text: `s` is the ET/RU string the caller chose; English maps the ET source string and falls back to it. */
export const T = (lang: 'et' | 'ru' | 'en', s: string): string => (lang === 'en' ? (getEn().siteEn[s] ?? s) : s);
