// Computes, from Supabase rows, the same summaries the Apps Script builds from the Sheet
// (aggregate, adminAggregate, prepostAggregate in docs/research-google-sheet-webhook.gs).
// Stage 1 of moving reads to Supabase: these numbers are only COMPARED with the Sheet's, never shown instead of them.
// Keep this file a line-for-line mirror of the script's rules; api/admin-mirror-status.js reports every difference.

export const PUBLIC_MIN_N = 10, PUBLIC_MIN_GROUP = 5, CURRENT_SCHEMA_VERSION = '4';
const ADMIN_SINGLE = ['language','ageGroup','ownUse','typicalUnits','sixPlus','peerNorm','closeExposure','closeHousehold','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','extraResponsibility','overallImpact','pressure','refusalNormal','helpKnowledge','supportChoice'];
const ADMIN_MULTI = ['contexts', 'closeRelations'];
export const PREPOST_ITEMS = ['blackout', 'attention', 'reaction', 'sleep', 'decisions', 'development'];

const cell = v => (v === undefined || v === null ? '' : Array.isArray(v) ? v.join(' | ') : String(v)).trim();

/** research_responses row -> the flat string cells the Sheet would hold. */
export function flatten(row) {
  const flat = { response_id: cell(row.response_id), language: cell(row.language), version: cell(row.version) };
  for (const [k, v] of Object.entries(row.answers || {})) flat[k === 'last30' ? 'last30_legacy' : k] = cell(v);
  return flat;
}

export const isValid = f => f.version === CURRENT_SCHEMA_VERSION && f.ageEligible15Plus === 'yes' && f.consent === 'yes' && Boolean(f.response_id);
const ageBucket = code => (['18_20', '21_25', '26_35', '36_plus'].includes(code) ? '18_plus' : code);

function countField(rows, name, bucket) {
  const counts = {};
  for (const r of rows) { const raw = cell(r[name]); if (!raw) continue; const code = bucket ? bucket(raw) : raw; counts[code] = (counts[code] || 0) + 1; }
  const published = {};
  for (const code of Object.keys(counts).sort()) if (counts[code] >= PUBLIC_MIN_GROUP) published[code] = counts[code];
  return published;
}
const countAnswered = (rows, name) => rows.filter(r => Boolean(cell(r[name]))).length;

export function publicAggregate(dbRows) {
  const rows = dbRows.map(flatten).filter(isValid);
  const n = rows.length;
  const base = { ok: true, schemaVersion: Number(CURRENT_SCHEMA_VERSION), n, publishable: n >= PUBLIC_MIN_N, minimumGroupSize: PUBLIC_MIN_N };
  if (n < PUBLIC_MIN_N) return base;
  const keys = ['ageGroup', 'ownUse', 'overallImpact', 'helpKnowledge'];
  return {
    ...base,
    ageGroup: countField(rows, 'ageGroup', ageBucket), ownUse: countField(rows, 'ownUse'), overallImpact: countField(rows, 'overallImpact'), helpKnowledge: countField(rows, 'helpKnowledge'),
    answered: Object.fromEntries(keys.map(k => [k, countAnswered(rows, k)])),
  };
}

export function prepostAggregate(prepostRows) {
  const empty = { nPre: 0, nPost: 0, matched: 0, meanPre: null, meanPost: null, improved: 0, same: 0, worse: 0, items: [], total: PREPOST_ITEMS.length };
  if (!prepostRows.length) return empty;
  const pre = {}, post = {};
  for (const r of prepostRows) (r.phase === 'pre' ? pre : post)[r.token] = { score: Number(r.score), items: PREPOST_ITEMS.map(id => Number(r.correct?.[id] === 1 ? 1 : 0)) };
  const tokens = Object.keys(pre).filter(t => post[t]);
  const sum = a => a.reduce((x, y) => x + y, 0);
  const mean = f => (tokens.length ? sum(tokens.map(f)) / tokens.length : null);
  return {
    nPre: Object.keys(pre).length, nPost: Object.keys(post).length, matched: tokens.length, total: PREPOST_ITEMS.length,
    meanPre: mean(t => pre[t].score), meanPost: mean(t => post[t].score),
    improved: tokens.filter(t => post[t].score > pre[t].score).length,
    same: tokens.filter(t => post[t].score === pre[t].score).length,
    worse: tokens.filter(t => post[t].score < pre[t].score).length,
    items: PREPOST_ITEMS.map((id, i) => ({ id, pre: mean(t => pre[t].items[i]), post: mean(t => post[t].items[i]) })),
  };
}

export function adminAggregate(dbRows, prepostRows = []) {
  const all = dbRows.map(flatten);
  const rows = all.filter(isValid);
  const fields = {}, answered = {};
  for (const name of ADMIN_SINGLE.concat(ADMIN_MULTI)) {
    const multi = ADMIN_MULTI.includes(name);
    const counts = {}; let people = 0;
    for (const r of rows) {
      const raw = cell(r[name]); if (!raw) continue; people += 1;
      for (const code of (multi ? raw.split('|') : [raw]).map(v => v.trim()).filter(Boolean)) counts[code] = (counts[code] || 0) + 1;
    }
    fields[name] = counts; answered[name] = people;
  }
  return { ok: true, n: rows.length, excluded: all.length - rows.length, fields, answered, prepost: prepostAggregate(prepostRows) };
}

/** Human-readable list of differences between two summaries (order of keys and `lastUpdated` are ignored). */
export function diff(a, b, path = '') {
  if (path === 'lastUpdated' || path.endsWith('.lastUpdated')) return [];
  const isObj = v => v && typeof v === 'object';
  if (!isObj(a) || !isObj(b)) {
    const close = typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9;
    return a === b || close ? [] : [`${path || '(root)'}: sheet=${JSON.stringify(a)} supabase=${JSON.stringify(b)}`];
  }
  if (Array.isArray(a) !== Array.isArray(b)) return [`${path}: type differs`];
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].flatMap(k => diff(a[k], b[k], path ? `${path}.${k}` : k));
}
