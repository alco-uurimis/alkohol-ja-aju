import { describe, expect, it } from 'vitest';
import { pageKey } from './analytics';

describe('page keys', () => {
  const b = '/alkohol-ja-aju/';
  it('maps addresses to short, safe keys', () => {
    expect(pageKey('/alkohol-ja-aju/', '', b)).toBe('home');
    expect(pageKey('/alkohol-ja-aju/start/', '?mode=full', b)).toBe('start-full');
    expect(pageKey('/alkohol-ja-aju/start/', '', b)).toBe('start');
    expect(pageKey('/alkohol-ja-aju/en/practice.html', '', b)).toBe('en-practice');
    expect(pageKey('/alkohol-ja-aju/science/results/', '', b)).toBe('science-results');
    expect(pageKey('/alkohol-ja-aju/science/', '?start=1&lang=en', b)).toBe('science-form');
    expect(pageKey('/alkohol-ja-aju/worksheet/et/index.html', '', b)).toBe('worksheet-et');
    expect(pageKey('/check/', '', './')).toBe('check');
  });
  it('never produces anything the server would reject', () => {
    for (const p of ['/alkohol-ja-aju/%20weird//path/', '/alkohol-ja-aju/' + 'x'.repeat(80)]) expect(pageKey(p, '', b)).toMatch(/^[a-z0-9-]{1,40}$/);
  });
});
