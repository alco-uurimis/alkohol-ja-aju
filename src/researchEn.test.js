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
