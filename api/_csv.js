// CSV export of the Supabase tables (backup / spreadsheet use). Columns match the Sheet, so a backup can be re-imported with
// scripts/backfill-supabase.mjs. Cells that start with = + - @ are prefixed with an apostrophe so a spreadsheet never runs them as formulas.
import { flatten, PREPOST_ITEMS } from './_aggregate.js';

export const RESPONSE_COLUMNS = ['submitted_at','response_id','language','version','ageEligible15Plus','consent','ageGroup','ownUse','last30_legacy','typicalUnits','sixPlus','contexts','peerNorm','closeExposure','closeRelations','closeHousehold','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','extraResponsibility','overallImpact','pressure','refusalNormal','helpKnowledge','supportChoice','minorConsent'];
export const PREPOST_COLUMNS = ['submitted_at', 'token', 'phase', 'language', 'score', 'total', ...PREPOST_ITEMS];

const esc = v => {
  let s = v === undefined || v === null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const line = cells => cells.map(esc).join(',');

export function responsesCsv(rows) {
  return [line(RESPONSE_COLUMNS), ...rows.map(r => { const f = flatten(r); f.submitted_at = r.submitted_at; return line(RESPONSE_COLUMNS.map(c => f[c])); })].join('\n') + '\n';
}
export function prepostCsv(rows) {
  return [line(PREPOST_COLUMNS), ...rows.map(r => line(PREPOST_COLUMNS.map(c => c === 'submitted_at' ? r.created_at : c === 'language' ? r.lang : PREPOST_ITEMS.includes(c) ? (r.correct?.[c] === 1 ? 1 : 0) : r[c])))].join('\n') + '\n';
}
