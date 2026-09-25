// Cloudflare Worker example for the anonymous feedback form.
// Configure secrets in the Worker environment, never in the GitHub Pages frontend:
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
// Optional environment variable:
//   ALLOWED_ORIGIN=https://alco-uurimis.github.io

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = env.ALLOWED_ORIGIN || 'https://alco-uurimis.github.io';
    const cors = {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST' || origin !== allowed) return new Response('Forbidden', { status: 403, headers: cors });
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return new Response('Server not configured', { status: 500, headers: cors });

    let data;
    try { data = await request.json(); } catch { return new Response('Bad request', { status: 400, headers: cors }); }
    const clean = (v, max = 1000) => String(v ?? '').replace(/[<>]/g, '').slice(0, max);
    const message = [
      '📋 Alkohol ja aju — uus anonüümne tagasiside',
      `Keel / язык: ${clean(data.language, 10)}`,
      `Arusaadavus / понятность: ${clean(data.clarity, 10)}/5`,
      `Kasulikum osa / полезный раздел: ${clean(data.useful, 50)}`,
      `Soovitaks / рекомендация: ${clean(data.recommend, 20)}`,
      `Kommentaar / комментарий: ${clean(data.comment, 1000) || '—'}`,
      `Aeg / время: ${clean(data.submittedAt, 50)}`,
    ].join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message, disable_web_page_preview: true }),
    });
    if (!tg.ok) return new Response('Telegram error', { status: 502, headers: cors });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'content-type': 'application/json' } });
  },
};
