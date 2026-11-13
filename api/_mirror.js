// Optional second copy of every stored record in Supabase (Postgres), next to the Google Sheet.
// Off unless SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set. It never throws and never changes an API response:
// the Sheet stays the source of truth until the data has been compared and the reads are switched over deliberately.
// Server-side only: the service-role key must never reach the browser (the tables have row level security and no policies).

const TIMEOUT_MS = 4000;

function target() {
  const base = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!base || !key) return null;
  try { const u = new URL(base); if (u.protocol !== 'https:' || !u.hostname.endsWith('.supabase.co')) return null; } catch { return null; }
  return { base, key };
}

async function insertIgnoringDuplicates(table, conflict, row, fetchImpl = fetch) {
  const t = target();
  if (!t) return { ok: false, configured: false };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(`${t.base}/rest/v1/${table}?on_conflict=${conflict}`, {
      method: 'POST',
      headers: {
        apikey: t.key,
        // Legacy service_role keys are JWTs and go in Authorization too; the newer sb_secret_… keys are sent as apikey only.
        ...(t.key.startsWith('sb_') ? {} : { authorization: `Bearer ${t.key}` }),
        'content-type': 'application/json',
        prefer: 'resolution=ignore-duplicates,return=representation',
      },
      body: JSON.stringify(row),
      signal: controller.signal,
    });
    // return=representation lets us tell a new row (one row back) from an ignored duplicate (none back).
    const rows = res.ok ? await res.json().catch(() => null) : null;
    return { ok: res.ok, configured: true, status: res.status, duplicate: res.ok && Array.isArray(rows) && rows.length === 0 };
  } catch {
    return { ok: false, configured: true, error: 'unreachable' };
  } finally { clearTimeout(timer); }
}

/** `response` is the exact object sent to the Sheet (response_id, submitted_at, language, version, ...answers). */
export function mirrorResponse(response, fetchImpl) {
  const { response_id, submitted_at, language, version, ...answers } = response;
  return insertIgnoringDuplicates('research_responses', 'response_id', { response_id, submitted_at, language, version, answers }, fetchImpl);
}

/** `record` comes from parseSubmission in prepost.js: { token, phase, lang, correct, score, total }. */
export function mirrorPrepost(record, fetchImpl) {
  const { token, phase, lang, correct, score, total } = record;
  return insertIgnoringDuplicates('prepost_submissions', 'token,phase', { token, phase, lang, correct, score, total }, fetchImpl);
}

/** Removes the copy of one response (called by the admin delete, so erasing a row in the Sheet erases it here too). */
export async function mirrorDelete(responseId, fetchImpl = fetch) {
  const t = target();
  if (!t) return { ok: false, configured: false };
  if (!/^research_[a-z0-9_-]{8,90}$/i.test(String(responseId))) return { ok: false, configured: true, error: 'invalid_id' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(`${t.base}/rest/v1/research_responses?response_id=eq.${encodeURIComponent(responseId)}`, {
      method: 'DELETE',
      headers: { apikey: t.key, ...(t.key.startsWith('sb_') ? {} : { authorization: `Bearer ${t.key}` }), prefer: 'return=representation' },
      signal: controller.signal,
    });
    const rows = res.ok ? await res.json().catch(() => []) : [];
    return { ok: res.ok, configured: true, deleted: Array.isArray(rows) && rows.length > 0 };
  } catch { return { ok: false, configured: true, error: 'unreachable' }; }
  finally { clearTimeout(timer); }
}

/** Exact row count of a mirror table, from PostgREST's Content-Range header. */
export async function mirrorCount(table, fetchImpl = fetch) {
  const t = target();
  if (!t) return { ok: false, configured: false };
  if (!['research_responses', 'prepost_submissions'].includes(table)) return { ok: false, configured: true };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(`${t.base}/rest/v1/${table}?select=*`, {
      method: 'HEAD',
      headers: { apikey: t.key, ...(t.key.startsWith('sb_') ? {} : { authorization: `Bearer ${t.key}` }), prefer: 'count=exact', range: '0-0' },
      signal: controller.signal,
    });
    const total = Number(String(res.headers?.get?.('content-range') ?? '').split('/')[1]);
    return { ok: res.ok && Number.isFinite(total), configured: true, count: Number.isFinite(total) ? total : null };
  } catch { return { ok: false, configured: true, error: 'unreachable' }; }
  finally { clearTimeout(timer); }
}

/** Every row of a mirror table (pages of 1000). Returns null if anything goes wrong, so callers never compare partial data. */
export async function mirrorFetchAll(table, fetchImpl = fetch) {
  const t = target();
  if (!t || !['research_responses', 'prepost_submissions'].includes(table)) return null;
  const rows = [];
  for (let from = 0; from < 200000; from += 1000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS * 2);
    try {
      const res = await fetchImpl(`${t.base}/rest/v1/${table}?select=*&order=created_at.asc`, {
        headers: { apikey: t.key, ...(t.key.startsWith('sb_') ? {} : { authorization: `Bearer ${t.key}` }), range: `${from}-${from + 999}` },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const page = await res.json();
      if (!Array.isArray(page)) return null;
      rows.push(...page);
      if (page.length < 1000) return rows;
    } catch { return null; } finally { clearTimeout(timer); }
  }
  return null;
}
