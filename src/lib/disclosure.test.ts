import { describe, expect, it } from 'vitest';
import { bucketAge, discloseCounts, discloseMulti, OTHER } from './disclosure';

describe('disclosure rules for reports', () => {
  it('buckets ages from 18 up', () => {
    expect(bucketAge({ '15_17': 65, '18_20': 29, '36_plus': 1 })).toEqual({ '15_17': 65, '18_plus': 30 });
  });
  it('shows everything when nothing is small', () => {
    expect(discloseCounts({ a: 20, b: 10 }, 30)).toEqual({ items: [['a', 20], ['b', 10]], merged: false });
  });
  it('merges small categories into one row when together they reach the threshold', () => {
    expect(discloseCounts({ a: 20, b: 3, c: 2 }, 25)).toEqual({ items: [['a', 20], [OTHER, 5]], merged: true });
  });
  it('never exposes a remainder below the threshold: the smallest shown category joins it', () => {
    expect(discloseCounts({ a: 20, b: 8, c: 1 }, 29)).toEqual({ items: [['a', 20], [OTHER, 9]], merged: true });
  });
  it('withholds when nothing safe is left', () => {
    expect(discloseCounts({ a: 20, c: 1 }, 21)).toBeNull();
    expect(discloseCounts({ a: 2, b: 2 }, 4)).toBeNull();
  });
  it('leaves out small categories of multi-select questions without merging', () => {
    expect(discloseMulti({ a: 9, b: 4, c: 1 })).toEqual({ items: [['a', 9]], hidden: 2 });
    expect(discloseMulti({ a: 2 })).toBeNull();
  });
});
