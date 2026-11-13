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
