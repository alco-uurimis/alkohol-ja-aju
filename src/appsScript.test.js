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
