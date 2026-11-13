/** Small, dependency-free statistics for the admin report. */

/** Exact two-sided sign test: with `up` improvements and `down` deteriorations (ties dropped), P(result this lopsided | no effect). */
export function signTestP(up: number, down: number): number | null {
  const n = up + down;
  if (n <= 0) return null;
  const k = Math.min(up, down);
  // P(X <= k) for X ~ Binomial(n, 1/2), computed in log space so large n stays finite.
  let logC = -n * Math.LN2; // log(C(n,0) / 2^n)
  let sum = Math.exp(logC);
  for (let i = 1; i <= k; i++) {
    logC += Math.log((n - i + 1) / i);
    sum += Math.exp(logC);
  }
  return Math.min(1, 2 * sum);
}

/** Wilson 95% interval for a proportion. */
export function wilson(successes: number, n: number, z = 1.96): [number, number] | null {
  if (n <= 0) return null;
  const p = successes / n;
  const z2 = z * z;
  const centre = (p + z2 / (2 * n)) / (1 + z2 / n);
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / (1 + z2 / n);
  return [Math.max(0, centre - half), Math.min(1, centre + half)];
}
