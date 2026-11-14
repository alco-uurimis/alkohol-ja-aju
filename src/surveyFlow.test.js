import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/research.js';
import { getResearchSteps } from './researchData';

// Walk the survey exactly like ResearchApp does (visibility rules, required questions, multi-select rules) with random answers,
// then send the result to the real API handler: every flow a visitor can complete must be accepted by the server.
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function rng(seed) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }
const visible = (q, a) => !q.showWhen || !q.showWhen.notIn.includes(String(a[q.showWhen.field] ?? ''));

function fillRandomly(lang, r) {
  const steps = getResearchSteps(lang);
  const answers = {};
  for (const step of steps) for (const q of step.questions) {
    if (!visible(q, answers)) continue;
    if (q.type === 'radio') answers[q.id] = q.options[Math.floor(r() * q.options.length)].value;
    else {
      if (q.optional && r() < 0.3) continue;
      const picked = q.options.filter(() => r() < 0.4).map(o => o.value);
      const list = picked.length ? picked : [q.options[0].value];
      answers[q.id] = list.includes('prefer_not') ? ['prefer_not'] : list;
    }
  }
  return answers;
}
// the same gate ResearchApp applies before the first step can be left
const gatePasses = a => a.ageEligible15Plus === 'yes' && a.ageGroup && a.consent === 'yes' && (a.ageGroup !== '15_17' || a.minorConsent === 'yes');

const send = async (body) => {
  const out = {}; const res = { setHeader() {}, status: c => { out.status = c; return res; }, json: b => { out.json = b; return res; }, end: () => res };
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.' + Math.floor(Math.random() * 250) }, body }, res);
  return out;
};

describe('every survey flow the form allows is accepted by the server', () => {
  for (const lang of ['et', 'ru', 'en']) {
    it(`${lang}: 400 random completed surveys`, async () => {
      vi.stubEnv('SHEET_WEBHOOK_URL', 'https://script.google.com/macros/s/test/exec'); vi.stubEnv('SHEET_WEBHOOK_SECRET', 's');
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }))));
      const r = rng(lang === 'et' ? 1 : lang === 'ru' ? 2 : 3);
      let accepted = 0; const rejected = [];
      for (let i = 0; i < 400 && accepted < 120; i++) {
        const answers = fillRandomly(lang, r);
        if (!gatePasses(answers)) continue;
        const out = await send({ schemaVersion: 4, language: lang, answers });
        if (out.status === 200) accepted++; else rejected.push(`${out.json?.error} ${JSON.stringify(answers).slice(0, 120)}`);
      }
      expect(rejected.slice(0, 3)).toEqual([]);
      expect(accepted).toBeGreaterThan(50);
    });
  }
});
