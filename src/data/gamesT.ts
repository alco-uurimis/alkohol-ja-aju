import { gamesEn } from './games.en';

/** Text of the exercises: `s` is the ET/RU string the caller already chose; English maps the ET source string and falls back to it. */
export const T = (lang: 'et' | 'ru' | 'en', s: string): string => (lang === 'en' ? (gamesEn[s] ?? s) : s);
