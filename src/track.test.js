import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/track.js';
import { parseEvent } from '../api/_stats.js';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const call = async (req) => { const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, end: () => res, json: b => { out.json = b; return res; } }; await handler({ method: 'POST', headers: { origin: 'https://alco-uurimis.github.io', 'x-forwarded-for': '203.0.113.' + Math.floor(Math.random() * 250) }, ...req }, res); return out; };

describe('usage counters', () => {
  it('accepts only known events, safe keys and the three languages; the day comes from the server', () => {
    const now = new Date('2026-11-14T10:00:00Z');
    expect(parseEvent({ e: 'page', k: 'home', l: 'ru' }, now)).toEqual({ day: '2026-11-14', event: 'page', key: 'home', lang: 'ru' });
    expect(parseEvent({ e: 'answer', k: 'x', l: 'et' })).toBeNull();
    expect(parseEvent({ e: 'page', k: 'Home Page', l: 'et' })).toBeNull();
    expect(parseEvent({ e: 'page', k: 'home', l: 'de' })).toBeNull();
    expect(parseEvent({ e: 'page', k: 'home', l: 'et', day: '1999-01-01' }).day).not.toBe('1999-01-01');
  });
  it('stores +1 through the database function and sends nothing that identifies the visitor', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://abc.supabase.co'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'k');
    const f = vi.fn(async () => ({ ok: true, status: 204 })); vi.stubGlobal('fetch', f);
    const r = await call({ body: '{"e":"section","k":"labor","l":"en"}' });
    expect(r.status).toBe(204);
    expect(f.mock.calls[0][0]).toBe('https://abc.supabase.co/rest/v1/rpc/bump_site_event');
    const sent = JSON.parse(f.mock.calls[0][1].body);
    expect(Object.keys(sent).sort()).toEqual(['p_day', 'p_event', 'p_key', 'p_lang']);
  });
  it('refuses other sites and bad bodies, and quietly does nothing when not configured', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f);
    expect((await call({ headers: { origin: 'https://evil.example' }, body: '{"e":"page","k":"home","l":"et"}' })).status).toBe(403);
    expect((await call({ body: '{"e":"page","k":"<script>","l":"et"}' })).status).toBe(400);
    expect((await call({ body: '{"e":"page","k":"home","l":"et"}' })).status).toBe(204);
    expect(f).not.toHaveBeenCalled();
  });
});
