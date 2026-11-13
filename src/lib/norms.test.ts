import { describe, expect, it } from 'vitest';
import { lowUseShare } from './norms';

describe('lowUseShare', () => {
  const base = { never: 30, less_monthly: 20, monthly: 10, two_four_month: 6, prefer_not: 5 };
  it('computes the share of those who answered', () => expect(lowUseShare({ ownUse: base })).toEqual({ percent: 70, base: 71 }));
  it('needs both categories to be published', () => {
    expect(lowUseShare({ ownUse: { never: 30, monthly: 20, other_small: 8 } })).toBeNull();
    expect(lowUseShare({ ownUse: { less_monthly: 30, monthly: 20 } })).toBeNull();
  });
  it('is withheld when it is not a majority', () => expect(lowUseShare({ ownUse: { never: 5, less_monthly: 5, monthly: 20, two_four_month: 20 } })).toBeNull());
  it('is withheld for tiny bases and missing data', () => {
    expect(lowUseShare({ ownUse: { never: 5, less_monthly: 4 } })).toBeNull();
    expect(lowUseShare({})).toBeNull();
  });
});
