/**
 * Disclosure rules for anything that leaves the private admin panel (reports, slides, papers).
 * These mirror the public API (api/research-summary.js): nothing below MIN_N valid responses, no single category below MIN_CELL,
 * small categories merged into "other_small", and the merge never exposes a remainder smaller than MIN_CELL.
 */
export const MIN_N = 10;
export const MIN_CELL = 5;
export const OTHER = 'other_small';
export type Counts = Record<string, number>;

/** Age groups from 18 up are reported as one bucket (a lone older respondent must not hide a larger group). */
export function bucketAge(counts: Counts): Counts {
  const out: Counts = {};
  for (const [code, n] of Object.entries(counts)) {
    const key = ['18_20', '21_25', '26_35', '36_plus'].includes(code) ? '18_plus' : code;
    out[key] = (out[key] ?? 0) + n;
  }
  return out;
}

export type Disclosed = { items: [string, number][]; merged: boolean };

/** Single-choice question: `counts` are all categories, `answered` everyone who answered. Returns null when it cannot be shown safely. */
export function discloseCounts(counts: Counts, answered: number, min = MIN_CELL): Disclosed | null {
  if (answered < min) return null;
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  const shown = entries.filter(([, n]) => n >= min);
  let rest = entries.filter(([, n]) => n < min).reduce((s, [, n]) => s + n, 0);
  if (rest === 0) return shown.length ? { items: shown, merged: false } : null;
  const keep = [...shown];
  if (rest < min) {
    if (keep.length < 2) return null;
    keep.sort((a, b) => a[1] - b[1]);
    rest += keep.shift()![1];
  }
  if (keep.length === 0) return null;
  return { items: [...keep, [OTHER, rest]], merged: true };
}

/** Multi-select question (a person can appear in several categories): categories below the threshold are simply left out. */
export function discloseMulti(counts: Counts, min = MIN_CELL): { items: [string, number][]; hidden: number } | null {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  const items = entries.filter(([, n]) => n >= min);
  return items.length ? { items, hidden: entries.length - items.length } : null;
}
