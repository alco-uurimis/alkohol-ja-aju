#!/usr/bin/env node
// One-off: copy the existing Google Sheet rows into the Supabase mirror tables.
//
//   1. In the sheet: tab "Responses" -> File -> Download -> Comma-separated values (.csv); same for tab "PrePost" (optional).
//   2. Dry run (default, writes nothing):
//        node scripts/backfill-supabase.mjs --responses Responses.csv --prepost PrePost.csv
//   3. Real run:
//        SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-supabase.mjs --responses Responses.csv --prepost PrePost.csv --apply
//
// Safe to repeat: rows already present (same response_id / token+phase) are skipped by the database.
// Run it on your own computer and delete the CSV afterwards; the CSV holds the research data and the key must not be shared.
import { readFileSync } from 'node:fs';
import { chunk, mapPrepost, mapResponse, parseCsv, toObjects } from './backfill-lib.mjs';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const apply = args.includes('--apply');
const files = { research_responses: opt('--responses'), prepost_submissions: opt('--prepost') };
if (!files.research_responses && !files.prepost_submissions) { console.error('Give --responses <csv> and/or --prepost <csv>.'); process.exit(1); }

const base = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const key = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
if (apply) {
  let host = ''; try { host = new URL(base).hostname; } catch {}
  if (!host.endsWith('.supabase.co') || !key) { console.error('--apply needs SUPABASE_URL (https://….supabase.co) and SUPABASE_SERVICE_ROLE_KEY.'); process.exit(1); }
}

const plan = [
  ['research_responses', 'response_id', mapResponse],
  ['prepost_submissions', 'token,phase', mapPrepost],
];
for (const [table, conflict, map] of plan) {
  const file = files[table];
  if (!file) continue;
  const objects = toObjects(parseCsv(readFileSync(file, 'utf8')));
  const rows = [], skipped = {};
  for (const o of objects) { const r = map(o); if (r.row) rows.push(r.row); else skipped[r.error] = (skipped[r.error] || 0) + 1; }
  console.log(`${table}: ${objects.length} CSV rows -> ${rows.length} valid, skipped ${JSON.stringify(skipped)}`);
  if (!apply) continue;
  let sent = 0;
  for (const part of chunk(rows, 200)) {
    const res = await fetch(`${base}/rest/v1/${table}?on_conflict=${conflict}`, {
      method: 'POST',
      headers: { apikey: key, ...(key.startsWith('sb_') ? {} : { authorization: `Bearer ${key}` }), 'content-type': 'application/json', prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify(part),
    });
    if (!res.ok) { console.error(`  batch failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`); process.exit(2); }
    sent += part.length;
  }
  console.log(`  sent ${sent} rows (existing ones are skipped by the database)`);
}
if (!apply) console.log('Dry run only. Add --apply to write.');
