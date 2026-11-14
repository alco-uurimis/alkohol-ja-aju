// Cookie-free usage counters. One row per day × event × key × language holds only a number:
// no IP address, no user agent, no identifier and nothing that links two counts to the same person.
import { target } from './_mirror.js';

export const EVENTS = new Set(['page', 'section', 'quiz', 'game', 'explore', 'survey', 'check', 'feedback']);
const KEY = /^[a-z0-9-]{1,40}$/;
const LANGS = new Set(['et', 'ru', 'en']);

/** Clean event or null. `day` is the server's UTC date, never sent by the browser. */
export function parseEvent(body, now = new Date()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const e = String(body.e ?? ''), k = String(body.k ?? ''), l = String(body.l ?? '');
  if (!EVENTS.has(e) || !KEY.test(k) || !LANGS.has(l)) return null;
  return { day: now.toISOString().slice(0, 10), event: e, key: k, lang: l };
}

const headers = t => ({ apikey: t.key, ...(t.key.startsWith('sb_') ? {} : { authorization: `Bearer ${t.key}` }), 'content-type': 'application/json' });

/** +1 for one counter through the bump_site_event function (see docs/supabase-analytics.sql). Never throws. */
export async function bump(ev, fetchImpl = fetch) {
  const t = target();
  if (!t) return { ok: false, configured: false };
  try {
    const r = await fetchImpl(`${t.base}/rest/v1/rpc/bump_site_event`, { method: 'POST', headers: headers(t), body: JSON.stringify({ p_day: ev.day, p_event: ev.event, p_key: ev.key, p_lang: ev.lang }) });
    return { ok: r.ok, configured: true, status: r.status };
  } catch { return { ok: false, configured: true }; }
}

/** All counters since `days` days ago (admin view). */
export async function readStats(days, fetchImpl = fetch) {
  const t = target();
  if (!t) return null;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  try {
    const r = await fetchImpl(`${t.base}/rest/v1/site_events?select=day,event,key,lang,count&day=gte.${since}&order=day.asc`, { headers: { ...headers(t), range: '0-9999' } });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) ? rows : null;
  } catch { return null; }
}
