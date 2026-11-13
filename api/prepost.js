// Receives one anonymous before/after knowledge-check submission and stores it through the sheet webhook.
// No account, no name, no IP is stored by this code: the record is a random browser-made token plus six answers.
import { ITEMS, KEY } from './_prepost-key.js';
import { mirrorPrepost } from './_mirror.js';

const ALLOWED_ORIGINS = new Set(['https://alco-uurimis.github.io', 'https://alkohol-ja-aju.vercel.app']);
function cors(req, res) { const origin = req.headers?.origin; if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Cache-Control', 'no-store'); }
async function request(url, body) { const options = { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), redirect: 'manual' }; const first = await fetch(url, options); if (![301, 302, 303, 307, 308].includes(first.status)) return first; const location = first.headers.get('location'); if (!location) throw new Error('missing_redirect'); const destination = new URL(location, url).toString(); return [307, 308].includes(first.status) ? fetch(destination, options) : fetch(destination, { headers: { accept: 'application/json' } }); }

// Best-effort abuse brake. Counters live only in this instance's memory and are never written anywhere:
// no IP is stored, the key is hashed-by-truncation and forgotten after the window.
const WINDOW_MS = 10 * 60 * 1000, MAX_PER_WINDOW = 150; // a whole school class often shares one public IP
const hits = new Map();
export function tooMany(req, now = Date.now()) {
  const raw = String(req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const key = raw.slice(0, 64);
  if (hits.size > 5000) { for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k); if (hits.size > 5000) hits.clear(); }
  const entry = hits.get(key);
  if (!entry || now - entry.start > WINDOW_MS) { hits.set(key, { start: now, count: 1 }); return false; }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/** Returns a clean record or null when the body is not exactly what the check page sends. */
export function parseSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const { token, phase, lang, answers } = body;
  if (typeof token !== 'string' || !/^[a-f0-9]{32}$/.test(token)) return null;
  if (phase !== 'pre' && phase !== 'post') return null;
  if (!['et', 'ru', 'en'].includes(lang)) return null;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return null;
  const keys = Object.keys(answers);
  if (keys.length !== ITEMS.length || !keys.every(k => ITEMS.includes(k)) || !ITEMS.every(k => typeof answers[k] === 'boolean')) return null;
  const correct = {}; let score = 0;
  for (const id of ITEMS) { const ok = answers[id] === KEY[id]; correct[id] = ok ? 1 : 0; score += ok ? 1 : 0; }
  return { token, phase, lang, correct, score, total: ITEMS.length };
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  const origin = req.headers?.origin; if (origin && !ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ ok: false, error: 'origin_not_allowed' });
  if (tooMany(req)) { res.setHeader('Retry-After', '600'); return res.status(429).json({ ok: false, error: 'too_many_requests' }); }
  const record = parseSubmission(req.body);
  if (!record) return res.status(400).json({ ok: false, error: 'invalid_submission' });
  const url = process.env.SHEET_WEBHOOK_URL, secret = process.env.SHEET_WEBHOOK_SECRET;
  if (!url || !secret) return res.status(503).json({ ok: false, error: 'not_configured' });
  try {
    const parsed = new URL(String(url).trim()); if (parsed.protocol !== 'https:' || parsed.hostname !== 'script.google.com') return res.status(503).json({ ok: false, error: 'not_configured' });
    const [response] = await Promise.all([request(parsed.toString(), { secret, prepost: record }), mirrorPrepost(record)]);
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.ok !== true) return res.status(502).json({ ok: false, error: 'store_failed_or_script_outdated' });
    return res.status(200).json({ ok: true, duplicate: data.duplicate === true });
  } catch { return res.status(502).json({ ok: false, error: 'store_unreachable' }); }
}
