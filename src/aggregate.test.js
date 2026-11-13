import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { adminAggregate, diff, publicAggregate } from '../api/_aggregate.js';

// Run the REAL Apps Script source against a fake spreadsheet and compare with the Supabase-side code.
const source = readFileSync(new URL('../docs/research-google-sheet-webhook.gs', import.meta.url), 'utf8');
const HEADERS = ['submitted_at','response_id','language','version','ageEligible15Plus','consent','ageGroup','ownUse','last30_legacy','typicalUnits','sixPlus','contexts','peerNorm','closeExposure','closeRelations','closeHousehold','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','extraResponsibility','overallImpact','pressure','refusalNormal','helpKnowledge','supportChoice','minorConsent'];
const PREPOST_HEADERS = ['submitted_at', 'token', 'phase', 'language', 'score', 'total', 'blackout', 'attention', 'reaction', 'sleep', 'decisions', 'development'];
const ITEMS = PREPOST_HEADERS.slice(6);

function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

function makeResponses(count, seed) {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const resp = {
      submitted_at: new Date(1750000000000 + i * 86400000).toISOString(), response_id: `research_t${i.toString(36).padStart(8, '0')}`,
      language: pick(r, ['et', 'ru']), version: pick(r, [4, 4, 4, 4, 3, 2]),
      ageEligible15Plus: pick(r, ['yes', 'yes', 'yes', 'no']), consent: pick(r, ['yes', 'yes', 'yes', 'no']),
      ageGroup: pick(r, ['15_17', '15_17', '18_20', '21_25', '26_35', '36_plus', 'prefer_not']),
      ownUse: pick(r, ['never', 'less_monthly', 'monthly', 'two_four_month', 'prefer_not']),
      typicalUnits: pick(r, ['', '1_2', '3_4']), sixPlus: pick(r, ['', 'never', 'monthly']),
      contexts: pick(r, [[], ['friends'], ['friends', 'family'], ['prefer_not']]),
      peerNorm: pick(r, ['rare', 'some', 'common']), closeExposure: pick(r, ['never', 'rare', 'often']),
      closeRelations: pick(r, [[], ['partner'], ['family', 'friend']]), closeHousehold: pick(r, ['', 'yes', 'no']),
      overallImpact: pick(r, ['none', 'slight', 'moderate', 'strong', 'prefer_not']), helpKnowledge: pick(r, ['yes', 'partly', 'no']),
      supportChoice: pick(r, ['friend', 'school', 'none']), minorConsent: pick(r, ['', 'yes']), worry: pick(r, ['', 'rare', 'often']),
    };
    if (r() < 0.1) resp.last30 = pick(r, ['0', '1_2']);
    return resp;
  });
}
const toDbRow = ({ response_id, submitted_at, language, version, ...answers }) => ({ response_id, submitted_at, language, version, answers });
const joinList = v => (Array.isArray(v) ? v.join(' | ') : (v ?? ''));
function toSheetRow(r) {
  const by = { ...r, last30_legacy: r.last30 || '', ageEligible15Plus: r.ageEligible15Plus || r.adult || '', contexts: joinList(r.contexts), closeRelations: joinList(r.closeRelations) };
  return HEADERS.map(h => by[h] ?? '');
}

function makePrepost(seed) {
  const r = rng(seed);
  const rows = [];
  for (let i = 0; i < 40; i++) {
    const token = (i.toString(16).padStart(2, '0')).repeat(16);
    for (const phase of ['pre', 'post']) {
      if (phase === 'post' && r() < 0.4) continue;
      const correct = Object.fromEntries(ITEMS.map(id => [id, r() < (phase === 'post' ? 0.7 : 0.5) ? 1 : 0]));
      rows.push({ token, phase, lang: pick(r, ['et', 'ru', 'en']), correct, score: Object.values(correct).reduce((a, b) => a + b, 0), total: 6 });
    }
  }
  return rows;
}

function loadScript(responseRows, prepostRows) {
  const table = (headers, rows) => ({ headers, rows });
  const resp = table(HEADERS, responseRows), pre = table(PREPOST_HEADERS, prepostRows);
  const fakeSheet = (t, parent) => ({
    getLastColumn: () => t.headers.length, getLastRow: () => t.rows.length + 1,
    getParent: () => parent,
    getRange: (row, col, nr = 1, nc = 1) => {
      const grid = [t.headers, ...t.rows].slice(row - 1, row - 1 + nr).map(line => line.slice(col - 1, col - 1 + nc));
      const display = grid.map(line => line.map(v => String(v)));
      return { getDisplayValues: () => display, getValues: () => grid };
    },
  });
  const book = {}; const sheets = { Responses: fakeSheet(resp, book), PrePost: fakeSheet(pre, book) };
  book.getSheetByName = name => sheets[name] ?? null;
  const ctx = vm.createContext({ ContentService: {}, PropertiesService: {}, LockService: {}, SpreadsheetApp: {}, Date, console });
  vm.runInContext(source, ctx);
  return { aggregate: ctx.aggregate, adminAggregate: ctx.adminAggregate, sheet: sheets.Responses };
}

describe('Supabase-side aggregates equal the Apps Script ones', () => {
  for (const [label, count, seed] of [['150 mixed responses', 150, 7], ['9 valid-ish responses (below the public threshold)', 9, 3], ['400 responses', 400, 11]]) {
    it(label, () => {
      const responses = makeResponses(count, seed);
      const prepost = makePrepost(seed);
      const script = loadScript(responses.map(toSheetRow), prepost.map(p => [new Date().toISOString(), p.token, p.phase, p.lang, p.score, p.total, ...ITEMS.map(id => p.correct[id])]));
      const db = responses.map(toDbRow);
      const clean = o => JSON.parse(JSON.stringify(o));
      const sheetAdmin = clean(script.adminAggregate(script.sheet));
      expect(sheetAdmin.n).toBeGreaterThan(0); // guard against a vacuous comparison
      expect(sheetAdmin.excluded).toBeGreaterThan(0);
      expect(sheetAdmin.prepost.matched).toBeGreaterThan(0);
      expect(diff(clean(script.adminAggregate(script.sheet)), clean(adminAggregate(db, prepost)))).toEqual([]);
      expect(diff(clean(script.aggregate(script.sheet)), clean(publicAggregate(db)))).toEqual([]);
    });
  }

  it('actually detects a difference', () => {
    expect(diff({ n: 3, fields: { a: { x: 1 } } }, { n: 4, fields: { a: { x: 1 } } })).toEqual(['n: sheet=3 supabase=4']);
  });
});
