// Cookie-free usage counters. What is sent: an event name, a short key (page or section id) and the page language.
// What is never sent: cookies, identifiers, answers, scores of the research survey, free text. The server keeps only daily totals.
// Nothing is sent when the browser asks not to be tracked (Global Privacy Control / Do Not Track) or after the opt-out on the data page.

const ENDPOINT = 'https://alkohol-ja-aju.vercel.app/api/track';
export const OPT_OUT_KEY = 'alkohol-ja-aju:no-stats';
const SENT_KEY = 'alkohol-ja-aju:stats-sent';

type Ev = 'page' | 'section' | 'quiz' | 'game' | 'explore' | 'survey' | 'check' | 'feedback';

export function statsAllowed(): boolean {
  try {
    const n = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (n.globalPrivacyControl || n.doNotTrack === '1') return false;
    if (localStorage.getItem(OPT_OUT_KEY) === '1') return false;
  } catch { /* storage blocked: still respect the browser signals above */ }
  return import.meta.env.PROD && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1';
}

export function setStatsOptOut(off: boolean) {
  try { if (off) localStorage.setItem(OPT_OUT_KEY, '1'); else localStorage.removeItem(OPT_OUT_KEY); } catch { /* ignore */ }
}

const pageLang = () => { const l = document.documentElement.lang; return l === 'ru' || l === 'en' ? l : 'et'; };

/** Counts an event at most once per browser session (a reload or a second visit to the same section is not counted again). */
export function trackOnce(e: Ev, k: string) {
  if (!/^[a-z0-9-]{1,40}$/.test(k) || !statsAllowed()) return;
  try {
    const seen = new Set<string>(JSON.parse(sessionStorage.getItem(SENT_KEY) || '[]'));
    const id = `${e}:${k}`;
    if (seen.has(id)) return;
    seen.add(id);
    sessionStorage.setItem(SENT_KEY, JSON.stringify([...seen]));
  } catch { return; } // without sessionStorage we cannot avoid double counting, so we do not count
  const body = JSON.stringify({ e, k, l: pageLang() });
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
    void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, headers: { 'content-type': 'text/plain' } }).catch(() => {});
  } catch { /* offline or blocked: counters are optional */ }
}

/** Page key from the address: '' -> home, 'start/?mode=full' -> start-full, 'en/practice.html' -> en-practice. */
export function pageKey(pathname: string, search: string, base: string): string {
  let p = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  p = p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '');
  let key = (p || 'home').replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '');
  if (new URLSearchParams(search).get('mode') === 'full') key += '-full';
  if (new URLSearchParams(search).has('start') && key === 'science') key = 'science-form';
  return key.slice(0, 40) || 'home';
}

/** One page view per page per session, sent after the page has set its language. */
export function trackPage() {
  if (location.pathname.includes('/admin/')) return;
  setTimeout(() => trackOnce('page', pageKey(location.pathname, location.search, import.meta.env.BASE_URL)), 1500);
}
