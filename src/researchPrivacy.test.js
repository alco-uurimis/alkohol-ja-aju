import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicSummary } from '../api/research-summary.js';
import submit from '../api/research.js';

describe('public research summary', () => {
  const summarize = publicSummary;
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

  it('publishes categories of 5 or more and merges anything smaller', () => {
    expect(publicSummary({ n: 40, ownUse: { never: 20, monthly: 5 }, answered: { ownUse: 25 } }).ownUse).toEqual({ never: 20, monthly: 5 });
    // a category of 4 is not shown on its own; with the 5 hidden before it, the remainder 4 is merged with the smallest shown category
    const r = publicSummary({ n: 40, ownUse: { never: 20, monthly: 6 }, answered: { ownUse: 30 } });
    expect(r.ownUse).toEqual({ never: 20, other_small: 10 });
    for (const count of Object.values(r.ownUse)) expect(count).toBeGreaterThanOrEqual(5);
  });

  it('still requires 10 valid responses overall', () => {
    expect(publicSummary({ n: 9, ownUse: { never: 9 }, answered: { ownUse: 9 } })).not.toHaveProperty('ownUse');
  });

  it('withholds when nothing would remain besides the merged row', () => {
    expect(publicSummary({ n: 40, ageGroup: { '18_20': 12 }, answered: { ageGroup: 15 } }).ageGroup).toEqual({});
    expect(publicSummary({ n: 40, ageGroup: { '18_20': 12 }, answered: { ageGroup: 14 } }).ageGroup).toEqual({});
  });

  it('keeps the old behaviour when the upstream sends no answered counts', () => {
    expect(publicSummary({ n: 30, overallImpact: { none: 12, slight: 10 } }).overallImpact).toEqual({});
    expect(publicSummary({ n: 30, overallImpact: { none: 12 } }).overallImpact).toEqual({});
  });
});

import { isAdminUser } from '../api/admin-data.js';
describe('admin access', () => {
  const user = { email: 'Owner@Example.com', email_confirmed_at: '2026-01-01T00:00:00Z' };
  it('allows a confirmed e-mail on the list, ignoring case and spaces', () => {
    expect(isAdminUser(user, ' owner@example.com , other@example.com')).toBe(true);
  });
  it('rejects unlisted, unconfirmed or missing users and an empty list', () => {
    expect(isAdminUser({ ...user, email: 'x@example.com' }, 'owner@example.com')).toBe(false);
    expect(isAdminUser({ email: 'owner@example.com' }, 'owner@example.com')).toBe(false);
    expect(isAdminUser(null, 'owner@example.com')).toBe(false);
    expect(isAdminUser(user, '')).toBe(false);
  });
});

import deleteResponse from '../api/admin-delete-response.js';
describe('admin delete (Google sign-in only)', () => {
  const ID = 'research_abcdefgh1234';
  const env = () => {
    vi.stubEnv('ADMIN_EMAILS', 'owner@example.com');
    vi.stubEnv('SUPABASE_URL', 'https://x.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('SHEET_WEBHOOK_URL', 'https://script.google.com/macros/s/test/exec');
    vi.stubEnv('SHEET_WEBHOOK_SECRET', 'secret');
  };
  const call = async (headers, body, fetchImpl) => {
    env();
    vi.stubGlobal('fetch', fetchImpl ?? vi.fn());
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
    await deleteResponse({ method: 'POST', headers, body }, res);
    return { status: res.status.mock.calls[0]?.[0], json: res.json.mock.calls[0]?.[0] };
  };
  const supabaseUser = email => new Response(JSON.stringify({ email, email_confirmed_at: '2026-01-01T00:00:00Z' }), { status: 200 });

  it('rejects requests without a token and no longer accepts a shared password', async () => {
    expect((await call({}, { responseId: ID })).status).toBe(401);
    const r = await call({ authorization: 'Bearer some-old-password' }, { responseId: ID }, vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    expect(r.status).toBe(401);
  });
  it('rejects a signed-in account that is not on the list', async () => {
    const r = await call({ authorization: 'Bearer t' }, { responseId: ID }, vi.fn().mockResolvedValue(supabaseUser('stranger@example.com')));
    expect(r.status).toBe(403);
  });
  it('validates the response id before touching the sheet', async () => {
    const fetchMock = vi.fn().mockResolvedValue(supabaseUser('owner@example.com'));
    const r = await call({ authorization: 'Bearer t' }, { responseId: '../etc' }, fetchMock);
    expect(r.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the Supabase identity check
  });
  it('deletes through the sheet webhook for an allow-listed admin', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(supabaseUser('Owner@Example.com'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, deleted: true })));
    const r = await call({ authorization: 'Bearer t' }, { responseId: ID }, fetchMock);
    expect(r).toEqual({ status: 200, json: { ok: true, deleted: true, mirror: 'off' } });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ adminAction: 'deleteResponse', responseId: ID, secret: 'secret' });
  });
});
