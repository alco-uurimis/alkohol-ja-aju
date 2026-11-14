import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getResearchSteps } from './researchData';
import { researchUiEn } from './data/researchUi.en';

const lit = `('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|\`(?:[^\`\\\\]|\\\\.)*\`)`;
const pair = new RegExp(`T\\(lang,ru\\s*\\?\\s*${lit}\\s*:\\s*${lit}\\)`, 'g');

describe('English survey', () => {
  it('has an English text for every Estonian UI string', () => {
    const missing = [];
    for (const f of ['ResearchApp.tsx', 'ResearchExperience.tsx']) {
      const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
      for (const m of src.matchAll(pair)) { const et = m[2].slice(1, -1); if (!researchUiEn[et]) missing.push(et); }
    }
    expect(missing).toEqual([]);
  });

  it('keeps the same questions, option values and conditions as the ET/RU form', () => {
    const et = getResearchSteps('et'), en = getResearchSteps('en');
    expect(en).toHaveLength(et.length);
    et.forEach((step, i) => {
      expect(en[i].questions.map(q => q.id)).toEqual(step.questions.map(q => q.id));
      step.questions.forEach((q, j) => {
        const e = en[i].questions[j];
        expect(e.type).toBe(q.type);
        expect(e.showWhen).toEqual(q.showWhen);
        expect(e.optional).toBe(q.optional);
        expect(e.options.map(o => o.value)).toEqual(q.options.map(o => o.value));
        expect(e.title).toMatch(/[A-Za-z]/);
        expect(Boolean(e.hint)).toBe(Boolean(q.hint));
        for (const o of e.options) expect(o.label, `${q.id}.${o.value}`).toMatch(/\S/);
      });
    });
  });

  it('contains no Estonian or Russian leftovers in the English form', () => {
    const text = JSON.stringify(getResearchSteps('en')) + JSON.stringify(researchUiEn.valikuline);
    expect(text).not.toMatch(/[А-Яа-яЁё]/);
    expect(text).not.toMatch(/[õäöüÕÄÖÜ]/);
  });
});

describe('English exercises', () => {
  it('has an English text for every Estonian string in Memory, Attention and Lab', async () => {
    const { gamesEn } = await import('./data/games.en');
    const pairT = new RegExp(`T\\(lang,ru\\s*\\?\\s*${lit}\\s*:\\s*${lit}\\)`, 'g');
    const missing = [];
    for (const f of ['Memory', 'Attention', 'Lab']) {
      const src = readFileSync(new URL(`./sections/${f}.tsx`, import.meta.url), 'utf8');
      for (const m of src.matchAll(pairT)) { const et = m[2].slice(1, -1); if (!gamesEn[et]) missing.push(f + ': ' + et); }
    }
    expect(missing).toEqual([]);
  });
  it('keeps the word pool the same size as the Estonian and Russian ones', async () => {
    const { wordsEn } = await import('./data/games.en');
    const { words } = await import('./data/words');
    expect(wordsEn).toHaveLength(words.length);
    expect(new Set(wordsEn).size).toBe(wordsEn.length);
  });
});

describe('English “What to do in real life”', () => {
  it('has an English text for every Estonian string and the same four scenarios', async () => {
    const { actionEn, scenariosEn } = await import('./data/action.en');
    const src = readFileSync(new URL('./sections/ActionHub.tsx', import.meta.url), 'utf8');
    const pairT = new RegExp(`T\\(lang,ru\\s*\\?\\s*${lit}\\s*:\\s*${lit}\\)`, 'g');
    const missing = [...src.matchAll(pairT)].map(m => m[2].slice(1, -1)).filter(et => !actionEn[et]);
    expect(missing).toEqual([]);
    expect(scenariosEn.map(s => s.id)).toEqual(['friend', 'journey', 'pressure', 'warning']);
    for (const s of scenariosEn) { expect(s.steps).toHaveLength(4); expect(JSON.stringify(s)).not.toMatch(/[А-Яа-яõäöü]/); }
  });
});

describe('English classroom kit', () => {
  it('has an English text for every Estonian string and complete lesson data', async () => {
    const { classroomEn, lessonEn, objectivesEn, promptsEn, ticketQuestionsEn } = await import('./data/classroom.en');
    const src = readFileSync(new URL('./sections/ClassroomKit.tsx', import.meta.url), 'utf8');
    const pairT = new RegExp(`T\\(lang,ru\\s*\\?\\s*${lit}\\s*:\\s*${lit}\\)`, 'g');
    const missing = [...src.matchAll(pairT)].map(m => m[2].slice(1, -1).replace(/\\n/g, '\n')).filter(et => !classroomEn[et]);
    expect(missing).toEqual([]);
    expect(lessonEn).toHaveLength(6);
    expect(objectivesEn).toHaveLength(3); expect(promptsEn).toHaveLength(4); expect(ticketQuestionsEn).toHaveLength(4);
    expect(JSON.stringify([lessonEn, objectivesEn, promptsEn, ticketQuestionsEn, Object.values(classroomEn)])).not.toMatch(/[А-Яа-яõäöü]/);
  });
});

describe('English main page', () => {
  const files = ['App.tsx', 'sections/LearningCenter.tsx', 'sections/Closing.tsx', 'sections/Infographics.tsx', 'sections/Brain.tsx', 'components/PathChooser.tsx', 'components/FinalSummary.tsx', 'components/FeedbackSurvey.tsx', 'components/Reflection.tsx', 'components/ReferenceGlossary.tsx', 'components/SiteEnhancements.tsx'];
  it('has an English text for every Estonian string in the main-page components', async () => {
    const { siteEn } = await import('./data/siteT');
    const pairT = new RegExp(`T\\(lang,ru\\s*\\?\\s*${lit}\\s*:\\s*${lit}\\)`, 'g');
    const missing = [];
    for (const f of files) {
      const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
      for (const m of src.matchAll(pairT)) { const et = m[2].slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n'); if (!siteEn[et]) missing.push(f + ': ' + et); }
    }
    expect(missing).toEqual([]);
  });
  it('has no Estonian or Russian in the English values', async () => {
    const { siteEn } = await import('./data/siteT');
    for (const [k, v] of Object.entries(siteEn)) expect(v, k).not.toMatch(/[А-Яа-яЁё]|[õäöüÕÄÖÜ]/);
    const en = await import('./data/content.en');
    expect(JSON.stringify([en.topicsEn, en.knowledgeCardsEn, en.scienceEn, en.takeawaysEn, en.sourcesEn.map(s => [s.organization, s.title, s.note])])).not.toMatch(/[А-Яа-яЁё]|[õäöüÕÄÖÜ]/);
  });
  it('translates every search-index entry', async () => {
    const { searchIndex } = await import('./data/searchIndex');
    for (const e of searchIndex) if (e.kind !== 'term') expect(e.en && e.en !== e.et, e.et).toBeTruthy();
  });
});
