import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

// The Google Apps Script is deployed by hand, so its counting rules are tested here by evaluating the real file.
const context = vm.createContext({});
vm.runInContext(readFileSync(new URL('../docs/research-google-sheet-webhook.gs', import.meta.url), 'utf8'), context);
const countField = vm.runInContext('countField', context);
const publicAgeBucket = vm.runInContext('publicAgeBucket', context);
const rows = (counts) => Object.entries(counts).flatMap(([code, n]) => Array.from({ length: n }, () => [code]));
const headers = ['ageGroup'];

describe('public age buckets in the Apps Script', () => {
  it('folds every group from 18 up into "18_plus", so one lone older respondent never hides a bigger group', () => {
    expect(countField(rows({ '15_17': 65, '18_20': 29, '36_plus': 1 }), headers, 'ageGroup', publicAgeBucket)).toEqual({ '15_17': 65, '18_plus': 30 });
  });
  it('still suppresses a bucket smaller than 5', () => {
    expect(countField(rows({ '15_17': 40, '18_20': 1, '21_25': 2 }), headers, 'ageGroup', publicAgeBucket)).toEqual({ '15_17': 40 });
  });
  it('keeps "prefer_not" separate and the admin view unbucketed', () => {
    expect(countField(rows({ '15_17': 9, prefer_not: 6 }), headers, 'ageGroup', publicAgeBucket)).toEqual({ '15_17': 9, prefer_not: 6 });
    expect(countField(rows({ '15_17': 9, '18_20': 7 }), headers, 'ageGroup')).toEqual({ '15_17': 9, '18_20': 7 });
  });
});

describe('before/after check storage in the Apps Script', () => {
  it('aggregates matched pairs only and reports per-item correctness', () => {
    const rowsData = [
      // submitted_at, token, phase, language, score, total, 6 item columns
      ['t', 'a'.repeat(32), 'pre', 'en', 2, 6, 1, 1, 0, 0, 0, 0],
      ['t', 'a'.repeat(32), 'post', 'en', 5, 6, 1, 1, 1, 1, 1, 0],
      ['t', 'b'.repeat(32), 'pre', 'et', 3, 6, 1, 1, 1, 0, 0, 0],
      ['t', 'c'.repeat(32), 'pre', 'ru', 4, 6, 1, 1, 1, 1, 0, 0], // no post: not matched
    ];
    const sheet = { getLastRow: () => rowsData.length + 1, getRange: () => ({ getValues: () => rowsData }) };
    const spreadsheet = { getSheetByName: () => sheet };
    const agg = vm.runInContext('prepostAggregate', context)(spreadsheet);
    expect(agg).toMatchObject({ nPre: 3, nPost: 1, matched: 1, meanPre: 2, meanPost: 5, improved: 1, same: 0, worse: 0, total: 6 });
    expect(agg.items.find(i => i.id === 'reaction')).toEqual({ id: 'reaction', pre: 0, post: 1 });
  });
  it('returns an empty summary when nobody has used the check yet', () => {
    expect(vm.runInContext('prepostAggregate', context)({ getSheetByName: () => null })).toMatchObject({ nPre: 0, nPost: 0, matched: 0, meanPre: null });
  });
});
