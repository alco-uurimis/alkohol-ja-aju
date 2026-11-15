import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const data = {
  n: 40, excluded: 3, lastUpdated: '2026-11-15T10:00:00Z',
  fields: { ageGroup: { '15_17': 25, '18_20': 15 }, ownUse: { never: 20, monthly: 12, less_monthly: 8 }, contexts: { friends: 9, family: 6 } },
  answered: { ageGroup: 40, ownUse: 40 },
  prepost: { nPre: 20, nPost: 14, matched: 12, meanPre: 3.1, meanPost: 4.2, improved: 8, same: 3, worse: 1, total: 6, items: [{ id: 'blackout', pre: 0.5, post: 0.8 }] },
};

async function render(lang: 'ru' | 'et') {
  vi.resetModules();
  vi.stubGlobal('localStorage', { getItem: (k: string) => (k === 'alkohol-ja-aju:admin-lang' ? lang : null), setItem() {}, removeItem() {} });
  const { AdminReport } = await import('./AdminReport');
  return renderToStaticMarkup(createElement(AdminReport, { data } as never));
}

describe('printed report', () => {
  it('renders fully in Estonian', async () => {
    const html = await render('et');
    expect(html).toContain('Uuringu aruanne');
    expect(html).toContain('Vanuserühmad');
    expect(html).toContain('Kontroll „enne ja pärast“');
    expect(html.replace(/<[^>]+>/g, ' ')).not.toMatch(/[А-Яа-яЁё]/);
  });
  it('still renders in Russian', async () => {
    const html = await render('ru');
    expect(html).toContain('Отчёт по исследованию');
  });
});
