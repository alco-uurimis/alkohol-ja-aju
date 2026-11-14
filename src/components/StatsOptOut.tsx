import { useState } from 'react';
import { OPT_OUT_KEY, setStatsOptOut } from '../lib/analytics';

const t = {
  et: {
    title: 'Külastuste loendamine (ilma küpsisteta)',
    body: 'Loendame, mitu korda avati lehti ja põhilehe osi ning mitu korda lõpetati harjutusi, viktoriin, küsitlus või kontroll. Server hoiab ainult päeva kogusummasid: ilma küpsiste, IP-aadresside ja tunnusteta, ilma vastuste ja tulemusteta. Kui brauseris on sisse lülitatud jälgimiskeeld (Global Privacy Control või Do Not Track), ei saadeta midagi.',
    box: 'Ära loenda minu külastusi selles brauseris', browser: 'Sinu brauser palub juba mitte jälgida: midagi ei saadeta.',
  },
  ru: {
    title: 'Подсчёт посещений (без cookie)',
    body: 'Мы считаем, сколько раз открывались страницы и разделы главной и сколько раз завершались упражнения, викторина, опрос или проверка. Сервер хранит только суммы за день: без cookie, IP-адресов и идентификаторов, без ответов и результатов. Если в браузере включён запрет отслеживания (Global Privacy Control или Do Not Track), ничего не отправляется.',
    box: 'Не учитывать мои посещения в этом браузере', browser: 'Ваш браузер уже просит не отслеживать: ничего не отправляется.',
  },
  en: {
    title: 'Counting visits (without cookies)',
    body: 'We count how many times pages and main-page sections were opened and how many times the exercises, quiz, survey or check were completed. The server keeps only daily totals: no cookies, IP addresses or identifiers, no answers and no scores. If your browser asks not to be tracked (Global Privacy Control or Do Not Track), nothing is sent.',
    box: 'Do not count my visits in this browser', browser: 'Your browser already asks not to be tracked: nothing is sent.',
  },
} as const;

/** The paragraph for the data policy page, with a per-browser opt-out. */
export default function StatsOptOut({ lang }: { lang: 'et' | 'ru' | 'en' }) {
  const s = t[lang];
  const [off, setOff] = useState(() => { try { return localStorage.getItem(OPT_OUT_KEY) === '1'; } catch { return false; } });
  const n = typeof navigator !== 'undefined' ? navigator as Navigator & { globalPrivacyControl?: boolean } : null;
  const browserSays = !!n && (n.globalPrivacyControl === true || n.doNotTrack === '1');
  return <>
    <h2>{s.title}</h2>
    <p>{s.body}</p>
    {browserSays ? <p><b>{s.browser}</b></p> : (
      <label className="stats-optout"><input type="checkbox" checked={off} onChange={e => { setOff(e.target.checked); setStatsOptOut(e.target.checked); }} /> <span>{s.box}</span></label>
    )}
  </>;
}
