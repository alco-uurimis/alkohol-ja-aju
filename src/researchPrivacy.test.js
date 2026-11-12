import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicSummary } from '../api/research-summary.js';
import { publicSummary as legacySummary } from '../alkohol-ja-aju/api/research-summary.js';
import submit from '../api/research.js';

describe.each([publicSummary, legacySummary])('public research summary', summarize => {
  it.each([1, 9])('withholds distributions at N=%i even if the upstream minimum is one', n => {
    const result = summarize({ n, minimumGroupSize: 1, ageGroup: { '15_17': n } });
    expect(result).toMatchObject({ publishable: false, minimumGroupSize: 10 });
    expect(result).not.toHaveProperty('ageGroup');
  });

  it('publishes a complete distribution at the threshold', () => {
    expect(summarize({ n: 10, ageGroup: { '18_20': 10 } }).ageGroup).toEqual({ '18_20': 10 });
  });

  it('withholds incomplete distributions that would reveal a small group by subtraction', () => {
    expect(summarize({ n: 11, ageGroup: { '18_20': 10, '15_17': 1 } }).ageGroup).toEqual({});
    expect(summarize({ n: 11, ageGroup: { '18_20': 10 } }).ageGroup).toEqual({});
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('stores only applicable answers and sends Telegram a notification without response details', async () => {
  vi.stubEnv('SHEET_WEBHOOK_URL', 'https://script.google.com/macros/s/test/exec');
  vi.stubEnv('SHEET_WEBHOOK_SECRET', 'test');
  vi.stubEnv('BOT_TOKEN', 'test');
  vi.stubEnv('CHAT_ID', 'test');
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  vi.stubGlobal('fetch', fetch);
  const answers = {
    ageEligible15Plus: 'yes', ageGroup: '18_20', consent: 'yes', minorConsent: 'yes',
    ownUse: 'never', typicalUnits: '10_plus', sixPlus: 'weekly', contexts: ['alone'],
    peerNorm: 'rare', closeExposure: 'never', closeRelations: ['family'], closeHousehold: 'yes',
    closeConflict: 'never', closeUnsafe: 'never', worry: 'never', sleep: 'never', study: 'never',
    mood: 'never', avoid: 'never', unsafe: 'never', extraResponsibility: 'never', overallImpact: 'none',
    pressure: 'never', refusalNormal: 'yes', helpKnowledge: 'yes', supportChoice: 'friend',
  };
  const req = { method: 'POST', headers: {}, body: { schemaVersion: 4, language: 'et', answers } };
  const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
  await submit(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(fetch).toHaveBeenCalledTimes(2);
  const [sheet, telegram] = fetch.mock.calls.map(([, init]) => JSON.parse(init.body));
  expect(sheet.response).toMatchObject({
    ownUse: 'never', typicalUnits: '', sixPlus: '', contexts: [],
    closeRelations: [], closeHousehold: '', minorConsent: '',
  });
  expect(telegram).toEqual({
    chat_id: 'test',
    text: 'Alkohol ja aju: uus vastus salvestatud / новый ответ сохранён.',
    disable_web_page_preview: true,
  });
});

describe('skipped questions (answered base)', () => {
  it('publishes a distribution whose gap to N is explained by skipped answers', () => {
    const r = publicSummary({ n: 30, overallImpact: { none: 12, slight: 10 }, answered: { overallImpact: 22 } });
    expect(r.overallImpact).toEqual({ none: 12, slight: 10 });
    expect(r.answered).toEqual({ overallImpact: 22 });
  });

  it('merges hidden small categories into one row when together they reach the threshold', () => {
    expect(publicSummary({ n: 30, overallImpact: { none: 12 }, answered: { overallImpact: 22 } }).overallImpact).toEqual({ none: 12, other_small: 10 });
  });

  it('never exposes a remainder below the threshold: the smallest shown category joins it', () => {
    const r = publicSummary({ n: 40, ageGroup: { '18_20': 12, '21_25': 15 }, answered: { ageGroup: 31 } });
    expect(r.ageGroup).toEqual({ '21_25': 15, other_small: 16 });
    for (const count of Object.values(r.ageGroup)) expect(count).toBeGreaterThanOrEqual(10);
  });

  it('withholds when nothing would remain besides the merged row', () => {
    expect(publicSummary({ n: 40, ageGroup: { '18_20': 12 }, answered: { ageGroup: 15 } }).ageGroup).toEqual({});
  });

  it('keeps the old behaviour when the upstream sends no answered counts', () => {
    expect(publicSummary({ n: 30, overallImpact: { none: 12, slight: 10 } }).overallImpact).toEqual({});
    expect(publicSummary({ n: 30, overallImpact: { none: 12 } }).overallImpact).toEqual({});
  });
});
