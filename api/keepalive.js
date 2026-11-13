// Called by a Vercel cron (vercel.json) twice a week: one cheap read keeps a free Supabase project from being paused for inactivity.
// Exposes nothing: the answer is just ok/not ok.
import { mirrorCount } from './_mirror.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false });
  const r = await mirrorCount('research_responses');
  return res.status(r.configured && r.ok ? 200 : 503).json({ ok: Boolean(r.configured && r.ok) });
}
