import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The header is position:fixed, so #root needs padding-top. CSS chunk order is decided by Vite,
// so only the header stylesheets may set #root padding (components/projector.css resets it in projector mode).
describe('fixed header offset', () => {
  it('no stylesheet zeroes or overrides #root padding', () => {
    const owners = new Set(['sticky-header.css', 'mobile-simple.css', 'mobile-design-fix.css']);
    const bad = [];
    for (const f of readdirSync('src').filter((n) => n.endsWith('.css') && !owners.has(n))) {
      const css = readFileSync(`src/${f}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      for (const m of css.matchAll(/([^{}]*#root[^{}]*)\{([^}]*)\}/g)) {
        if (/(^|;)\s*padding(-top)?\s*:/.test(m[2])) bad.push(`${f}: ${m[1].trim()}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
