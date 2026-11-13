import { describe, expect, it, vi } from 'vitest';
import { PREPOST_ITEMS, PREPOST_KEY } from './prepost';
import { questions } from './data/content';
import { questionsEn } from './data/content.en';
import { ITEMS, KEY } from '../api/_prepost-key.js';
import handler, { parseSubmission } from '../api/prepost.js';

describe('before/after check: one answer key everywhere', () => {
  it('matches the quiz facts in the Estonian and English content and the server copy', () => {
    expect([...PREPOST_ITEMS]).toEqual(ITEMS);
    expect(PREPOST_KEY).toEqual(KEY);
    for (const list of [questions, questionsEn]) for (const id of PREPOST_ITEMS) expect(list.find(q => q.id === id)?.fact).toBe(PREPOST_KEY[id]);
  });
  it('English and Estonian quizzes cover the same ids with the same answers and sources', () => {
    expect(questionsEn.map(q => [q.id, q.fact, q.refs])).toEqual(questions.map(q => [q.id, q.fact, q.refs]));
  });
});

const good = () => ({ token: 'a'.repeat(32), phase: 'pre', lang: 'en', answers: { blackout: true, attention: true, reaction: false, sleep: false, decisions: true, development: false } });

describe('api/prepost', () => {
  it('accepts exactly the six boolean answers and scores them on the server', () => {
    expect(parseSubmission(good())).toMatchObject({ phase: 'pre', score: 6, total: 6 });
    expect(parseSubmission({ ...good(), answers: { ...good().answers, reaction: true } })).toMatchObject({ score: 5 });
  });
  it.each([
    ['bad token', { ...good(), token: 'xyz' }],
    ['bad phase', { ...good(), phase: 'during' }],
    ['bad language', { ...good(), lang: 'de' }],
    ['missing item', { ...good(), answers: { blackout: true } }],
    ['extra field in answers', { ...good(), answers: { ...good().answers, name: 'x' } }],
    ['non-boolean answer', { ...good(), answers: { ...good().answers, sleep: 'false' } }],
    ['array body', []],
  ])('rejects %s', (_n, body) => { expect(parseSubmission(body)).toBeNull(); });

  it('stores nothing but token, phase, language, score and correctness, and forwards it with the secret', async () => {
    vi.stubEnv('SHEET_WEBHOOK_URL', 'https://script.google.com/macros/s/test/exec');
    vi.stubEnv('SHEET_WEBHOOK_SECRET', 's');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, duplicate: false })));
    vi.stubGlobal('fetch', fetchMock);
    const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
    await handler({ method: 'POST', headers: { origin: 'https://alco-uurimis.github.io' }, body: good() }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(Object.keys(sent.prepost).sort()).toEqual(['correct', 'lang', 'phase', 'score', 'token', 'total']);
    vi.unstubAllEnvs(); vi.unstubAllGlobals();
  });
});

describe('prepost rate limit', () => {
  it('lets a classroom through and brakes a flood from one address', async () => {
    const { tooMany } = await import('../api/prepost.js');
    const req = { headers: { 'x-forwarded-for': '203.0.113.9' } };
    const t0 = 1_000_000;
    let blocked = 0;
    for (let i = 0; i < 200; i++) if (tooMany(req, t0 + i)) blocked++;
    expect(blocked).toBe(50);
    expect(tooMany({ headers: { 'x-forwarded-for': '203.0.113.10' } }, t0)).toBe(false);
    expect(tooMany(req, t0 + 11 * 60 * 1000)).toBe(false); // window over
  });
});
