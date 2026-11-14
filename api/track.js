// Receives one usage counter from the website (sent with navigator.sendBeacon as text/plain, so no preflight).
// Stores only "+1" on a daily total: no cookie, no IP, no identifier. Silently does nothing when not configured.
import { parseEvent, bump } from './_stats.js';
import { limited } from './_ratelimit.js';

const ALLOWED_ORIGINS = new Set(['https://alco-uurimis.github.io', 'https://alkohol-ja-aju.vercel.app']);

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); return res.status(204).end(); }
  if (req.method !== 'POST') return res.status(405).end();
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return res.status(403).end();
  if (Number(req.headers?.['content-length'] || 0) > 300) return res.status(413).end();
  if (limited(req, 'track', 600)) return res.status(429).end();
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).end(); } }
  const ev = parseEvent(body);
  if (!ev) return res.status(400).end();
  await bump(ev);
  return res.status(204).end();
}
