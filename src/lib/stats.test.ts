import { describe, expect, it } from 'vitest';
import { signTestP, wilson } from './stats';

describe('signTestP', () => {
  it('is null without any non-tied pair', () => expect(signTestP(0, 0)).toBeNull());
  it('is 1 for a perfect split', () => expect(signTestP(5, 5)).toBe(1));
  it('matches the exact binomial value', () => {
    expect(signTestP(9, 1)).toBeCloseTo(0.021484375, 9); // 2 * (1 + 10) / 1024
    expect(signTestP(10, 0)).toBeCloseTo(2 / 1024, 9);
  });
  it('is symmetric', () => expect(signTestP(2, 8)).toBeCloseTo(signTestP(8, 2)!, 12));
  it('stays finite for large samples', () => expect(signTestP(900, 800)).toBeGreaterThan(0));
});

describe('wilson', () => {
  it('is null for n = 0', () => expect(wilson(0, 0)).toBeNull());
  it('brackets the proportion', () => {
    const [lo, hi] = wilson(7, 10)!;
    expect(lo).toBeLessThan(0.7); expect(hi).toBeGreaterThan(0.7);
    expect(lo).toBeCloseTo(0.397, 2); expect(hi).toBeCloseTo(0.892, 2);
  });
  it('stays inside [0,1]', () => { const [lo, hi] = wilson(10, 10)!; expect(lo).toBeGreaterThan(0); expect(hi).toBe(1); });
});
