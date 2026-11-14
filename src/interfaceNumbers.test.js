import { describe, expect, it } from 'vitest';
import { questions } from './data/content';
import { questionsEn } from './data/content.en';
import { questionsRu } from './data/content.ru';
import { readFileSync } from 'node:fs';

describe('numbers promised in the interface match the data', () => {
  it('the quiz has 10 statements in every language (the page says "10 questions")', () => {
    expect(questions).toHaveLength(10); expect(questionsRu).toHaveLength(10); expect(questionsEn).toHaveLength(10);
  });
  it('the fact strip numbers (8 topics, 3 games, 10 questions) are the ones the site actually has', () => {
    const motion = readFileSync(new URL('./components/Motion.tsx', import.meta.url), 'utf8');
    expect(motion).toMatch(/n: 8, et: 'teadusteemat'/); expect(motion).toMatch(/n: 3, et: 'minimängu'/); expect(motion).toMatch(/n: 10, et: 'küsimust viktoriinis'/);
    const vite = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
    const topicPages = ['acuteEffects', 'memoryBlackouts', 'adolescentBrain', 'selfControl', 'alcoholAndSleep', 'alcoholAndDriving', 'rewardAndHabits', 'recoveryAndBrain'];
    for (const t of topicPages) expect(vite).toContain(t + ':');
  });
});

import { readdirSync } from 'node:fs';
describe('deployment limits', () => {
  it('stays within the 12 serverless functions of the Vercel Hobby plan (files starting with _ are helpers, not functions)', () => {
    const fns = readdirSync(new URL('../api/', import.meta.url)).filter(f => f.endsWith('.js') && !f.startsWith('_'));
    expect(fns.length, fns.join(', ')).toBeLessThanOrEqual(12);
  });
});
