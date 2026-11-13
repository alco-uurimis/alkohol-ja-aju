// Pure helpers for backfill-supabase.mjs: CSV parsing and row mapping (kept separate so they can be unit-tested).

/** RFC 4180-style CSV parser: quoted fields, doubled quotes, newlines inside quotes, CRLF, BOM. */
export function parseCsv(text) {
  const rows = []; let row = [], field = '', quoted = false;
  const src = String(text).replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim() !== ''));
}

export function toObjects(rows) {
  if (!rows.length) return [];
  const head = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const MULTI = new Set(['contexts', 'closeRelations']);
const META = new Set(['submitted_at', 'response_id', 'language', 'version']);

function isoOrNull(v) {
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : s.replace(' ', 'T') + 'Z'); // sheet exports often drop the zone: read as UTC
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** One Responses-sheet row -> research_responses row, or { error }. Same shape as api/_mirror.js writes live. */
export function mapResponse(o) {
  const response_id = o.response_id;
  if (!/^research_[a-z0-9_-]{8,90}$/i.test(response_id || '')) return { error: 'bad_response_id' };
  const submitted_at = isoOrNull(o.submitted_at);
  if (!submitted_at) return { error: 'bad_date' };
  if (!['et', 'ru'].includes(o.language)) return { error: 'bad_language' };
  const version = Number.parseInt(o.version, 10);
  if (!Number.isInteger(version)) return { error: 'bad_version' };
  const answers = {};
  for (const [k, v] of Object.entries(o)) {
    if (META.has(k) || v === '' || k === '') continue;
    const key = k === 'last30_legacy' ? 'last30' : k;
    answers[key] = MULTI.has(key) ? v.split('|').map(x => x.trim()).filter(Boolean) : v;
  }
  return { row: { response_id, submitted_at, language: o.language, version, answers } };
}

const ITEMS = ['blackout', 'attention', 'reaction', 'sleep', 'decisions', 'development'];

/** One PrePost-sheet row -> prepost_submissions row, or { error }. */
export function mapPrepost(o) {
  if (!/^[a-f0-9]{32}$/.test(o.token || '')) return { error: 'bad_token' };
  if (!['pre', 'post'].includes(o.phase)) return { error: 'bad_phase' };
  if (!['et', 'ru', 'en'].includes(o.language)) return { error: 'bad_language' };
  const correct = {};
  for (const id of ITEMS) { if (o[id] !== '0' && o[id] !== '1') return { error: 'bad_item' }; correct[id] = Number(o[id]); }
  const score = Number.parseInt(o.score, 10), total = Number.parseInt(o.total, 10);
  if (!Number.isInteger(score) || !Number.isInteger(total)) return { error: 'bad_score' };
  return { row: { token: o.token, phase: o.phase, lang: o.language, correct, score, total } };
}

export const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
