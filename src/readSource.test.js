import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import summary from '../api/research-summary.js';
import adminData from '../api/admin-data.js';
import del from '../api/admin-delete-response.js';
import { resetSnapshotCache } from '../api/_source.js';

const env = { ...process.env };
const call = async (handler, req) => {
  let out = { headers: {} };
  const res = { setHeader: (k, v) => { out.headers[k] = v; }, status: code => { out.status = code; return res; }, json: body => { out.json = body; return res; }, end: () => res };
  await handler({ method: 'GET', headers: {}, ...req }, res);
  return out;
};
const valid = i => ({ response_id: `research_s${String(i).padStart(8, '0')}`, submitted_at: '2026-01-01T00:00:00Z', language: 'et', version: 4,
  answers: { ageEligible15Plus: 'yes', consent: 'yes', ageGroup: i % 2 ? '15_17' : '18_20', ownUse: 'never', overallImpact: 'none', helpKnowledge: 'yes' } });
const rows = Array.from({ length: 12 }, (_, i) => valid(i));

beforeEach(() => {
  process.env = { ...env, SUPABASE_URL: 'https://abc.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'k', ADMIN_EMAILS: 'a@x.ee', SUPABASE_ANON_KEY: 'anon' };
  delete process.env.SHEET_WEBHOOK_URL; delete process.env.SHEET_WEBHOOK_SECRET; delete process.env.READ_SOURCE;
  resetSnapshotCache();
});
afterEach(() => { process.env = { ...env }; vi.unstubAllGlobals(); });

const supabaseFetch = (responses = rows, prepost = []) => vi.fn(async url => {
  const u = String(url);
  if (u.includes('/rest/v1/research_responses')) return { ok: true, json: async () => responses };
  if (u.includes('/rest/v1/prepost_submissions')) return { ok: true, json: async () => prepost };
  if (u.includes('/auth/v1/user')) return { ok: true, json: async () => ({ email: 'a@x.ee', email_confirmed_at: 'x' }) };
  return { ok: false, status: 500, json: async () => ({}), text: async () => '' };
});

describe('READ_SOURCE=supabase', () => {
  it('serves the public summary from Supabase, with the privacy rules still applied', async () => {
    process.env.READ_SOURCE = 'supabase';
    vi.stubGlobal('fetch', supabaseFetch());
    const r = await call(summary, {});
    expect(r.status).toBe(200);
    expect(r.headers['X-Data-Source']).toBe('supabase');
    expect(r.json.n).toBe(12);
    expect(r.json.publishable).toBe(true);
    expect(r.json.ownUse).toEqual({ never: 12 });
  });

  it('withholds charts below the public threshold exactly as before', async () => {
    process.env.READ_SOURCE = 'supabase';
    vi.stubGlobal('fetch', supabaseFetch(rows.slice(0, 6)));
    const r = await call(summary, {});
    expect(r.json.publishable).toBe(false);
    expect(r.json.ownUse).toBeUndefined();
  });

  it('serves the admin summary from Supabase and labels the source', async () => {
    process.env.READ_SOURCE = 'supabase';
    vi.stubGlobal('fetch', supabaseFetch());
    const r = await call(adminData, { headers: { authorization: 'Bearer t' } });
    expect(r.status).toBe(200);
    expect(r.json.source).toBe('supabase');
    expect(r.json.n).toBe(12);
    expect(r.json.fields.ageGroup).toEqual({ '15_17': 6, '18_20': 6 });
  });

  it('falls back to the Sheet when Supabase cannot be read', async () => {
    process.env.READ_SOURCE = 'supabase';
    process.env.SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/x/exec'; process.env.SHEET_WEBHOOK_SECRET = 's';
    vi.stubGlobal('fetch', vi.fn(async url => String(url).includes('supabase.co')
      ? { ok: false, status: 500, json: async () => ({}) }
      : new Response(JSON.stringify({ ok: true, n: 3, publishable: false, minimumGroupSize: 10 }))));
    const r = await call(summary, {});
    expect(r.headers['X-Data-Source']).toBe('sheet');
    expect(r.json.n).toBe(3);
  });

  it('stays on the Sheet by default', async () => {
    process.env.SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/x/exec'; process.env.SHEET_WEBHOOK_SECRET = 's';
    const f = vi.fn(async () => new Response(JSON.stringify({ ok: true, n: 2, publishable: false, minimumGroupSize: 10 })));
    vi.stubGlobal('fetch', f);
    const r = await call(summary, {});
    expect(r.headers['X-Data-Source']).toBe('sheet');
    expect(f.mock.calls.every(([u]) => !String(u).includes('supabase.co'))).toBe(true);
  });

  it('deletes through Supabase alone when the Sheet is not configured', async () => {
    process.env.READ_SOURCE = 'supabase';
    vi.stubGlobal('fetch', vi.fn(async (url, init) => {
      const u = String(url);
      if (u.includes('/auth/v1/user')) return { ok: true, json: async () => ({ email: 'a@x.ee', email_confirmed_at: 'x' }) };
      if (init?.method === 'DELETE') return { ok: true, json: async () => [{ response_id: 'research_s00000001' }] };
      return { ok: false, json: async () => ({}) };
    }));
    const r = await call(del, { method: 'POST', headers: { authorization: 'Bearer t' }, body: { responseId: 'research_s00000001' } });
    expect(r.status).toBe(200);
    expect(r.json).toMatchObject({ ok: true, deleted: true, mirror: 'ok', sheet: 'off' });
  });
});

describe('Supabase as the primary store for writes', () => {
  it('accepts a pre/post submission when the Sheet is missing, and reports duplicates', async () => {
    const { default: handler } = await import('../api/prepost.js');
    process.env.READ_SOURCE = 'supabase';
    let inserted = true;
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, status: 201, json: async () => (inserted ? [{ token: 'x' }] : []) })));
    const body = { token: 'd'.repeat(32), phase: 'pre', lang: 'et', answers: { blackout: true, attention: true, reaction: false, sleep: false, decisions: true, development: false } };
    const run = async () => { const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, json: b => { out.json = b; return res; }, end: () => res }; await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.' + Math.floor(Math.random() * 200) }, body }, res); return out; };
    const first = await run();
    expect(first.status).toBe(200); expect(first.json).toEqual({ ok: true, duplicate: false });
    inserted = false;
    expect((await run()).json).toEqual({ ok: true, duplicate: true });
  });

  it('fails the save when Supabase is down, even if a Sheet exists', async () => {
    const { default: handler } = await import('../api/prepost.js');
    process.env.READ_SOURCE = 'supabase';
    process.env.SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/x/exec'; process.env.SHEET_WEBHOOK_SECRET = 's';
    vi.stubGlobal('fetch', vi.fn(async url => (String(url).includes('supabase.co') ? { ok: false, status: 500, json: async () => ({}) } : new Response(JSON.stringify({ ok: true })))));
    const body = { token: 'e'.repeat(32), phase: 'post', lang: 'ru', answers: { blackout: true, attention: false, reaction: false, sleep: false, decisions: true, development: false } };
    const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, json: b => { out.json = b; return res; }, end: () => res };
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.250' }, body }, res);
    expect(out.status).toBe(502); expect(out.json.error).toBe('store_failed');
  });

  it('survey: success follows Supabase, not the Sheet, once Supabase is primary (and the Sheet may be broken)', async () => {
    const { default: handler } = await import('../api/research.js');
    process.env.READ_SOURCE = 'supabase';
    process.env.SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/x/exec'; process.env.SHEET_WEBHOOK_SECRET = 's';
    vi.stubGlobal('fetch', vi.fn(async url => (String(url).includes('supabase.co')
      ? { ok: true, status: 201, json: async () => [{ response_id: 'r' }] }
      : new Response('boom', { status: 500 }))));
    const answers = {
      ageEligible15Plus: 'yes', ageGroup: '18_20', consent: 'yes', ownUse: 'never',
      peerNorm: 'rare', closeExposure: 'never', closeConflict: 'never', closeUnsafe: 'never', worry: 'never', sleep: 'never', study: 'never',
      mood: 'never', avoid: 'never', unsafe: 'never', extraResponsibility: 'never', overallImpact: 'none',
      pressure: 'never', refusalNormal: 'yes', helpKnowledge: 'yes', supportChoice: 'friend',
    };
    const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, json: b => { out.json = b; return res; } };
    await handler({ method: 'POST', headers: {}, body: { schemaVersion: 4, language: 'et', answers } }, res);
    expect(out.status).toBe(200);
    expect(out.json.ok).toBe(true);
  });

  it('survey: fails the save when Supabase is down even though the Sheet works', async () => {
    const { default: handler } = await import('../api/research.js');
    process.env.READ_SOURCE = 'supabase';
    process.env.SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/x/exec'; process.env.SHEET_WEBHOOK_SECRET = 's';
    vi.stubGlobal('fetch', vi.fn(async url => (String(url).includes('supabase.co') ? { ok: false, status: 500, json: async () => ({}) } : new Response(JSON.stringify({ ok: true })))));
    const answers = {
      ageEligible15Plus: 'yes', ageGroup: '18_20', consent: 'yes', ownUse: 'never',
      peerNorm: 'rare', closeExposure: 'never', closeConflict: 'never', closeUnsafe: 'never', worry: 'never', sleep: 'never', study: 'never',
      mood: 'never', avoid: 'never', unsafe: 'never', extraResponsibility: 'never', overallImpact: 'none',
      pressure: 'never', refusalNormal: 'yes', helpKnowledge: 'yes', supportChoice: 'friend',
    };
    const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, json: b => { out.json = b; return res; } };
    await handler({ method: 'POST', headers: {}, body: { schemaVersion: 4, language: 'et', answers } }, res);
    expect(out.status).toBe(502);
    expect(out.json.ok).toBe(false);
  });
});
