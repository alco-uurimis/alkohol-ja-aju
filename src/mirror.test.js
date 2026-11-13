import { afterEach, describe, expect, it } from 'vitest';
import { mirrorPrepost, mirrorResponse } from '../api/_mirror.js';

const env = { ...process.env };
afterEach(() => { process.env = { ...env }; });

describe('supabase mirror', () => {
  it('does nothing without configuration', async () => {
    delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    let called = false;
    const r = await mirrorResponse({ response_id: 'research_x', submitted_at: 'now', language: 'et', version: 4, ownUse: 'never' }, async () => { called = true; return { ok: true }; });
    expect(r).toEqual({ ok: false, configured: false });
    expect(called).toBe(false);
  });
  it('refuses a non-supabase host', async () => {
    process.env.SUPABASE_URL = 'https://evil.example.com'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';
    expect((await mirrorPrepost({ token: 'a'.repeat(32), phase: 'pre', lang: 'et', correct: {}, score: 1, total: 6 }, async () => ({ ok: true }))).configured).toBe(false);
  });
  it('sends one idempotent row with the key in headers only', async () => {
    process.env.SUPABASE_URL = 'https://abc.supabase.co/'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'secret-key';
    let seen;
    const r = await mirrorResponse({ response_id: 'research_x', submitted_at: '2026-01-01T00:00:00Z', language: 'ru', version: 4, ownUse: 'never', peerNorm: 'rare' }, async (url, init) => { seen = { url, init }; return { ok: true, status: 201 }; });
    expect(r.ok).toBe(true);
    expect(seen.url).toBe('https://abc.supabase.co/rest/v1/research_responses?on_conflict=response_id');
    expect(seen.init.headers.prefer).toContain('ignore-duplicates');
    const row = JSON.parse(seen.init.body);
    expect(row).toEqual({ response_id: 'research_x', submitted_at: '2026-01-01T00:00:00Z', language: 'ru', version: 4, answers: { ownUse: 'never', peerNorm: 'rare' } });
    expect(seen.init.body).not.toContain('secret-key');
  });
  it('never throws when the network fails', async () => {
    process.env.SUPABASE_URL = 'https://abc.supabase.co'; process.env.SUPABASE_SERVICE_ROLE_KEY = 'k';
    const r = await mirrorPrepost({ token: 'b'.repeat(32), phase: 'post', lang: 'et', correct: {}, score: 2, total: 6 }, async () => { throw new Error('down'); });
    expect(r).toEqual({ ok: false, configured: true, error: 'unreachable' });
  });
});
