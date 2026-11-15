import { adminEt } from './adminEt';

/** Language of the admin page (Russian source text, Estonian translation). Changing it reloads the page, so every label is rebuilt. */
const KEY = 'alkohol-ja-aju:admin-lang';
export type AdminLang = 'ru' | 'et';
export const adminLang: AdminLang = (() => { try { return localStorage.getItem(KEY) === 'et' ? 'et' : 'ru'; } catch { return 'ru'; } })();
export const adminLocale = adminLang === 'et' ? 'et-EE' : 'ru-RU';

export function setAdminLang(l: AdminLang) {
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  location.reload();
}

/** Admin text: `s` is the Russian source; {0}, {1}… are filled from `args`. Missing Estonian keys fall back to Russian. */
export function A(s: string, ...args: unknown[]): string {
  let t = adminLang === 'et' ? (adminEt[s] ?? s) : s;
  args.forEach((v, i) => { t = t.split(`{${i}}`).join(String(v)); });
  return t;
}
