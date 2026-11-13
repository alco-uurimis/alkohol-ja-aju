/**
 * Social-norm figure from the public aggregate: share of respondents who drank "less than monthly or never" in the last 12 months.
 * It is computed only from categories the public API already published (so it can never expose a hidden small group),
 * and it is withheld unless it is a majority — a widget that tells teenagers "most of them drink often" would normalise drinking.
 */
export type NormInput = { ownUse?: Record<string, number>; answered?: { ownUse?: number }; n?: number };
export type Norm = { percent: number; base: number };

export function lowUseShare(data: NormInput): Norm | null {
  const g = data.ownUse;
  if (!g || typeof g !== 'object') return null;
  const never = g.never, less = g.less_monthly;
  if (!Number.isInteger(never) || !Number.isInteger(less)) return null; // one of them is hidden or merged: not exactly known
  const base = Object.values(g).reduce((s, c) => s + (Number.isInteger(c) ? c : 0), 0);
  if (base < 10) return null;
  const percent = Math.round(((never + less) / base) * 100);
  return percent >= 50 ? { percent, base } : null;
}
