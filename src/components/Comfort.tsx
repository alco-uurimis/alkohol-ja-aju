import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './comfort.css';

type Lang = 'et' | 'ru';
const T = {
  et: {
    open: 'Lugemine', title: 'Lugemise seaded', close: 'Sulge',
    easy: 'Lihtne lugemine', easyHint: 'Suurem kiri, avaram rida, rahulik paigutus.',
    calm: 'Rahulik režiim', calmHint: 'Lülitab animatsioonid välja.',
    read: 'Loe osa ette', stop: 'Peata', readHint: 'Loeb valitud teksti või ekraanil oleva jaotise.',
    novoice: 'Selles seadmes pole eestikeelset häält. Proovi teist brauserit või seadet.',
    nothing: 'Ei leidnud midagi ettelugemiseks.',
    saved: 'Seaded jäävad selle brauseri meelde.',
  },
  ru: {
    open: 'Чтение', title: 'Настройки чтения', close: 'Закрыть',
    easy: 'Лёгкое чтение', easyHint: 'Крупнее шрифт, шире строки, спокойная вёрстка.',
    calm: 'Спокойный режим', calmHint: 'Отключает анимации.',
    read: 'Прочитать раздел', stop: 'Остановить', readHint: 'Читает выделенный текст или раздел на экране.',
    novoice: 'На этом устройстве нет русского голоса. Попробуйте другой браузер или устройство.',
    nothing: 'Не нашёл, что читать.',
    saved: 'Настройки запоминаются в этом браузере.',
  },
} as const;

const KEY = 'alkohol-ja-aju:comfort';
type Prefs = { easy: boolean; calm: boolean };
const load = (): Prefs => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return { easy: !!v.easy, calm: !!v.calm }; } catch { return { easy: false, calm: false }; } };
const apply = (p: Prefs) => { const c = document.documentElement.classList; c.toggle('easy-read', p.easy); c.toggle('calm', p.calm); };
const pageLang = (): Lang => (document.documentElement.lang === 'ru' ? 'ru' : 'et');

/** Text of the section that fills most of the viewport (used when nothing is selected). */
function visibleSectionText(): string {
  let best: { el: Element; area: number } | null = null;
  for (const el of Array.from(document.querySelectorAll('main section[id], section[id]'))) {
    const r = el.getBoundingClientRect();
    const area = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
    if (area > (best?.area ?? 0)) best = { el, area };
  }
  return (best?.el as HTMLElement | undefined)?.innerText ?? '';
}

const Icon = () => (<b className="comfort__aa" aria-hidden="true">Aa</b>);

/** Reading comfort: easy-read layout, calm (no animation) mode, and read-aloud through the browser's own voices. */
export default function Comfort() {
  const [lang, setLang] = useState<Lang>(pageLang);
  const [prefs, setPrefs] = useState<Prefs>(load);
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [note, setNote] = useState('');
  const [hosts, setHosts] = useState<{ bar: HTMLElement | null; menu: HTMLElement | null }>({ bar: null, menu: null });
  const dialog = useRef<HTMLDialogElement>(null);
  const t = T[lang];
  const canSpeak = typeof speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';

  useEffect(() => { apply(prefs); try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* storage blocked: applies for this visit */ } }, [prefs]);

  useEffect(() => {
    const mo = new MutationObserver(() => setLang(pageLang()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    setLang(pageLang());
    const mount = () => {
      const make = (cls: string, parent: Element | null) => {
        if (!parent) return null;
        let el = parent.querySelector<HTMLElement>(':scope > .' + cls);
        if (!el) { el = document.createElement('div'); el.className = cls; parent.insertBefore(el, parent.firstChild); }
        return el;
      };
      setHosts({ bar: make('comfort__host-bar', document.querySelector('.header-actions')), menu: make('comfort__host-menu', document.querySelector('#navigation .nav-groups')) });
    };
    mount();
    const retry = setTimeout(mount, 220);
    return () => { mo.disconnect(); clearTimeout(retry); };
  }, []);

  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => () => { if (canSpeak) speechSynthesis.cancel(); }, [canSpeak]);

  const stop = () => { if (canSpeak) speechSynthesis.cancel(); setSpeaking(false); };
  const read = () => {
    if (!canSpeak) return;
    stop(); setNote('');
    const text = (getSelection()?.toString().trim() || visibleSectionText()).replace(/\s+/g, ' ').slice(0, 6000);
    if (!text) { setNote(t.nothing); return; }
    const code = lang === 'ru' ? 'ru' : 'et';
    const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(code));
    // Voices load lazily in some browsers; an empty list is not proof that none exists, so only warn when the list is populated.
    if (!voice && speechSynthesis.getVoices().length > 0) { setNote(t.novoice); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ru' ? 'ru-RU' : 'et-EE';
    if (voice) u.voice = voice;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    // Close first: the dialog is modal and the reader should be able to look at the page while it plays.
    setOpen(false);
    speechSynthesis.speak(u);
  };

  const trigger = (cls: string) => (
    <button type="button" className={'comfort__btn ' + cls} aria-label={t.open} title={t.open} onClick={() => setOpen(true)}>
      <Icon /><span>{t.open}</span>
    </button>
  );

  return (
    <>
      {hosts.bar && createPortal(trigger('comfort__btn--bar'), hosts.bar)}
      {hosts.menu && createPortal(trigger('comfort__btn--menu'), hosts.menu)}
      {speaking && createPortal(
        <button type="button" className="comfort__stop" onClick={stop}>{t.stop}</button>, document.body)}
      {createPortal(
        <dialog ref={dialog} className="comfort-dialog" aria-label={t.title} onClose={() => setOpen(false)} onClick={e => { if (e.target === dialog.current) setOpen(false); }}>
          <div className="comfort__head"><h2>{t.title}</h2><button type="button" aria-label={t.close} onClick={() => setOpen(false)}>×</button></div>
          <label className="comfort__row"><input type="checkbox" checked={prefs.easy} onChange={e => setPrefs(p => ({ ...p, easy: e.target.checked }))} /><span><b>{t.easy}</b><small>{t.easyHint}</small></span></label>
          <label className="comfort__row"><input type="checkbox" checked={prefs.calm} onChange={e => setPrefs(p => ({ ...p, calm: e.target.checked }))} /><span><b>{t.calm}</b><small>{t.calmHint}</small></span></label>
          {canSpeak && <div className="comfort__row comfort__row--read"><span><b>{t.read}</b><small>{t.readHint}</small></span><button type="button" onClick={speaking ? stop : read}>{speaking ? t.stop : t.read}</button></div>}
          <p className="comfort__note" role="status">{note || t.saved}</p>
        </dialog>, document.body)}
    </>
  );
}
