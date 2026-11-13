// Which store the READ side (public charts, admin view, delete) uses.
//   READ_SOURCE unset or "sheet"  -> Google Sheet through the Apps Script (default, unchanged behaviour)
//   READ_SOURCE=supabase          -> Supabase rows, summarised by _aggregate.js; if Supabase cannot be read the caller
//                                    falls back to the Sheet, so a Supabase outage never blanks the public page.
// Flip it in Vercel (Settings -> Environment Variables) and redeploy; flip back the same way. Writes always go to both stores.
import { mirrorFetchAll } from './_mirror.js';

export const readSource = () => (String(process.env.READ_SOURCE || '').trim().toLowerCase() === 'supabase' ? 'supabase' : 'sheet');

const TTL_MS = 20000;
let memo = null;

/** { responses, prepost } from Supabase, or null when it cannot be read completely. Cached for a few seconds so a busy public page does not hammer the database. */
export async function supabaseSnapshot(now = Date.now()) {
  if (memo && now - memo.at < TTL_MS) return memo.value;
  const [responses, prepost] = await Promise.all([mirrorFetchAll('research_responses'), mirrorFetchAll('prepost_submissions')]);
  const value = responses && prepost ? { responses, prepost } : null;
  if (value) memo = { at: now, value };
  return value;
}
export const resetSnapshotCache = () => { memo = null; };

/**
 * Delivery result the API judges success by. With READ_SOURCE=supabase the Supabase insert is the primary store and the
 * Sheet (if still configured) is a best-effort second copy; otherwise the Sheet stays primary as before.
 */
export function primaryDelivery(sheet, mirror) {
  if (readSource() !== 'supabase') return sheet;
  return { ok: Boolean(mirror?.ok), configured: Boolean(mirror?.configured), duplicate: mirror?.duplicate === true, error: mirror?.ok ? undefined : 'supabase_delivery_failed' };
}

/** Waits for `promise` but gives up after `ms` (the result is then `fallback`); used so a slow Sheet never delays a Supabase-primary save. */
export function withDeadline(promise, ms, fallback) {
  let timer;
  const deadline = new Promise(resolve => { timer = setTimeout(() => resolve(fallback), ms); });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}
