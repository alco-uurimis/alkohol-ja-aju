const ALLOWED_ORIGINS = new Set([
  'https://alco-uurimis.github.io',
  'https://alkohol-ja-aju.vercel.app',
]);

const USEFUL_SECTIONS = new Set(['brain', 'memory', 'attention', 'quiz']);
const RECOMMEND_VALUES = new Set(['yes', 'no']);
const LANGUAGES = new Set(['et', 'ru']);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

function labelUseful(value, language) {
  const labels = {
    et: {
      brain: 'Aju ja alkohol',
      memory: 'Mäluharjutus',
      attention: 'Tähelepanuharjutus',
      quiz: 'Müüt või fakt',
    },
    ru: {
      brain: 'Мозг и алкоголь',
      memory: 'Упражнение на память',
      attention: 'Упражнение на внимание',
      quiz: 'Миф или факт',
    },
  };
  return labels[language]?.[value] ?? value;
}

export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ ok: false, error: 'origin_not_allowed' });
  }

  const length = Number(req.headers['content-length'] || 0);
  if (length > 6000) {
    return res.status(413).json({ ok: false, error: 'payload_too_large' });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  if (!botToken || !chatId) {
    return res.status(500).json({ ok: false, error: 'server_not_configured' });
  }

  let body;
  try {
    body = readBody(req);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_json' });
  }

  const clarity = String(body.clarity ?? '');
  const useful = String(body.useful ?? '');
  const recommend = String(body.recommend ?? '');
  const language = String(body.language ?? '');
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';

  if (!['1', '2', '3', '4', '5'].includes(clarity)) {
    return res.status(400).json({ ok: false, error: 'invalid_clarity' });
  }
  if (!USEFUL_SECTIONS.has(useful)) {
    return res.status(400).json({ ok: false, error: 'invalid_useful_section' });
  }
  if (!RECOMMEND_VALUES.has(recommend)) {
    return res.status(400).json({ ok: false, error: 'invalid_recommendation' });
  }
  if (!LANGUAGES.has(language)) {
    return res.status(400).json({ ok: false, error: 'invalid_language' });
  }
  if (comment.length > 1000) {
    return res.status(400).json({ ok: false, error: 'comment_too_long' });
  }

  const isRu = language === 'ru';
  const lines = [
    '🧠 Alkohol ja aju — uus küsitluse vastus',
    '',
    `Keel / Язык: ${language.toUpperCase()}`,
    `Arusaadavus / Понятность: ${clarity}/5`,
    `Kasulikum osa / Полезный раздел: ${labelUseful(useful, language)}`,
    `Soovitaks / Рекомендует: ${recommend === 'yes' ? (isRu ? 'Да' : 'Jah') : (isRu ? 'Нет' : 'Ei')}`,
  ];

  if (comment) {
    lines.push('', isRu ? 'Комментарий:' : 'Kommentaar:', comment);
  }

  lines.push('', `Aeg / Время: ${new Date().toISOString()}`);

  try {
    const telegram = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        disable_web_page_preview: true,
      }),
    });

    if (!telegram.ok) {
      return res.status(502).json({ ok: false, error: 'telegram_delivery_failed' });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'telegram_unreachable' });
  }
}
