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
/** Merged English dictionary of the main page (loaded lazily through enBundle). */
export const siteEn: Record<string, string> = Object.assign({}, ...dictionaries);
