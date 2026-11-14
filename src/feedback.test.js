import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/feedback.js';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const run = async body => {
  const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, json: b => { out.json = b; return res; }, end: () => res };
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '192.0.2.' + Math.floor(Math.random() * 250) }, body }, res);
  return out;
};
const quick = language => ({ feedbackVersion: 'quick', language, clarity: '4', learned: 'yes', recommend: 'maybe', useful: 'memory', comment: 'ok' });

describe('feedback API', () => {
  it('accepts English feedback and tells the owner the language', async () => {
    vi.stubEnv('BOT_TOKEN', 't'); vi.stubEnv('CHAT_ID', 'c');
    const f = vi.fn(async () => ({ ok: true })); vi.stubGlobal('fetch', f);
    const r = await run(quick('en'));
    expect(r.status).toBe(200);
    const text = JSON.parse(f.mock.calls[0][1].body).text;
    expect(text).toContain('EN');
    expect(text).toContain('Mäluharjutus'); // labels stay readable for the Estonian/Russian-speaking owner, not the raw code
    expect(text).not.toContain(': memory');
  });
  it('still rejects an unknown language', async () => {
    vi.stubEnv('BOT_TOKEN', 't'); vi.stubEnv('CHAT_ID', 'c');
    expect((await run(quick('de'))).json.error).toBe('invalid_language');
  });
});
