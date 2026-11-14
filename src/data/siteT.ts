import { appEn } from './site/app.en';
import { lcEn } from './site/lc.en';
import { infographicsEn } from './site/infographics.en';
import { brainEn } from './site/brain.en';
import { pathchooserEn } from './site/pathchooser.en';
import { finalsummaryEn } from './site/finalsummary.en';
import { feedbackEn } from './site/feedback.en';
import { reflectionEn } from './site/reflection.en';
import { glossaryEn } from './site/glossary.en';
import { siteenhEn } from './site/siteenh.en';

const dictionaries: Record<string, string>[] = [appEn, lcEn, infographicsEn, brainEn, pathchooserEn, finalsummaryEn, feedbackEn, reflectionEn, glossaryEn, siteenhEn];
export const siteEn: Record<string, string> = Object.assign({}, ...dictionaries);

/** Main-page text: `s` is the ET/RU string the caller chose; English maps the ET source string and falls back to it. */
export const T = (lang: 'et' | 'ru' | 'en', s: string): string => (lang === 'en' ? (siteEn[s] ?? s) : s);
