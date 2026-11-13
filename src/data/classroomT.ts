import { classroomEn } from './classroom.en';

/** `s` is the ET/RU string the caller chose; English maps the ET source string and falls back to it. */
export const T = (lang: 'et' | 'ru' | 'en', s: string): string => (lang === 'en' ? (classroomEn[s] ?? s) : s);
