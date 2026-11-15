import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { adminEt } from './adminEt';

describe('Estonian admin page', () => {
  it('has an Estonian text for every Russian string in the admin view and the printed report', () => {
    const missing = [];
    for (const f of ['AdminData.tsx', 'AdminReport.tsx', 'adminLabels.ts']) {
      const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
      for (const m of src.matchAll(/A\('((?:\\.|[^'\\])*)'/g)) { const k = m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\'); if (!(k in adminEt)) missing.push(`${f}: ${k}`); }
    }
    expect(missing).toEqual([]);
  });
  it('keeps the placeholders and contains no Russian', () => {
    for (const [ru, et] of Object.entries(adminEt)) {
      expect(et, ru).not.toMatch(/[А-Яа-яЁё]/);
      expect((et.match(/\{\d\}/g) ?? []).sort(), ru).toEqual((ru.match(/\{\d\}/g) ?? []).sort());
    }
  });
  it('leaves no Russian text outside A() in the admin files', () => {
    for (const f of ['AdminData.tsx', 'AdminReport.tsx', 'adminLabels.ts']) {
      const src = readFileSync(new URL(`./${f}`, import.meta.url), 'utf8').replace(/A\('(?:\\.|[^'\\])*'/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
      const left = src.split('\n').filter(l => /[А-Яа-яЁё]/.test(l));
      expect(left, f).toEqual([]);
    }
  });
});
