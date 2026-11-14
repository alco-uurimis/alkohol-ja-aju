import { describe, expect, it } from 'vitest';
import { releases, SITE_VERSION, SITE_YEAR } from './releases';

const day = (d: string) => { const [dd, mm, yy] = d.split('.').map(Number); return Date.UTC(yy, mm - 1, dd); };

describe('release notes', () => {
  it('lists unique versions, newest first, with text in all three languages', () => {
    expect(new Set(releases.map(r => r.v)).size).toBe(releases.length);
    for (let i = 1; i < releases.length; i++) expect(day(releases[i - 1].date)).toBeGreaterThanOrEqual(day(releases[i].date));
    for (const r of releases) for (const t of [r.et, r.ru, r.en]) expect(t.length).toBeGreaterThan(30);
  });
  it('shows the newest release as the site version, and package.json agrees', async () => {
    expect(SITE_VERSION).toBe(releases[0].v);
    expect(SITE_YEAR).toMatch(/^\d{4}$/);
    const pkg = (await import('../../package.json')).default as { version: string };
    expect(`v${pkg.version.split('.').slice(0, 2).join('.')}`).toBe(SITE_VERSION);
  });
});
