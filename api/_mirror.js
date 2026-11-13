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
        prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify(row),
      signal: controller.signal,
    });
    return { ok: res.ok, configured: true, status: res.status };
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
