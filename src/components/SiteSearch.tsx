import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { searchIndex, type SearchEntry } from '../data/searchIndex';
import './site-search.css';

type Lang = 'et' | 'ru' | 'en';
const T = {
  et: { open: 'Otsi', title: 'Otsi saidilt', ph: 'Otsi: mälu, uni, abi, GABA…', close: 'Sulge', none: 'Midagi ei leitud. Proovi lühemat sõna.', hint: 'Päring jääb sinu brauserisse ega lähe kuhugi saatmisele.', kinds: { section: 'Jaotis', page: 'Leht', term: 'Mõiste' }, ex: ['mälu', 'uni', 'abi', 'mängud', 'allikad'] },
  ru: { open: 'Поиск', title: 'Поиск по сайту', ph: 'Поиск: память, сон, помощь, GABA…', close: 'Закрыть', none: 'Ничего не найдено. Попробуйте более короткое слово.', hint: 'Запрос остаётся в вашем браузере и никуда не отправляется.', kinds: { section: 'Раздел', page: 'Страница', term: 'Термин' }, ex: ['память', 'сон', 'помощь', 'игры', 'источники'] },
  en: { open: 'Search', title: 'Search the site', ph: 'Search: memory, sleep, help, GABA…', close: 'Close', none: 'Nothing found. Try a shorter word.', hint: 'The query stays in your browser and is not sent anywhere.', kinds: { section: 'Section', page: 'Page', term: 'Term' }, ex: ['memory', 'sleep', 'help', 'games', 'sources'] },
} as const;

const norm = (v: string) => v.toLowerCase().replace(/ё/g, 'е').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9а-я]+/g, ' ').trim();
const pageLang = (): Lang => (document.documentElement.lang === 'ru' ? 'ru' : document.documentElement.lang === 'en' ? 'en' : 'et');

type Hit = { e: SearchEntry; score: number };
function search(q: string, lang: Lang): Hit[] {
  const tokens = norm(q).split(' ').filter(Boolean);
  if (!tokens.length) return [];
  const hits: Hit[] = [];
  for (const e of searchIndex) {
    const title = norm(lang === 'en' ? e.en ?? e.et : lang === 'ru' ? e.ru : e.et);
    const other = norm(`${e.ru} ${e.et} ${e.en ?? ''} ${e.keys ?? ''}`);
    const desc = norm(lang === 'en' ? e.descEn ?? '' : lang === 'ru' ? e.descRu ?? '' : e.descEt ?? '');
    let score = 0; let ok = true;
    for (const t of tokens) {
      if (title.split(' ').some(w => w.startsWith(t))) score += 6;
      else if (title.includes(t)) score += 4;
      else if (other.includes(t)) score += 2;
      else if (desc.includes(t)) score += 1;
      else { ok = false; break; }
    }
    if (ok) hits.push({ e, score: score + (e.kind === 'section' ? 0.3 : e.kind === 'page' ? 0.2 : 0) });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 8);
}

function Mark({ text, q }: { text: string; q: string }) {
  const t = norm(q).split(' ').filter(Boolean)[0];
  if (!t) return <>{text}</>;
  const i = text.toLowerCase().replace(/ё/g, 'е').indexOf(t);
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + t.length)}</mark>{text.slice(i + t.length)}</>;
}

const Icon = () => (<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>);

/** Client-side site search: a button in the header (desktop) and in the menu (phones), plus "/" or Ctrl+K. */
export default function SiteSearch() {
  const [lang, setLang] = useState<Lang>(pageLang);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [hosts, setHosts] = useState<{ bar: HTMLElement | null; menu: HTMLElement | null }>({ bar: null, menu: null });
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const t = T[lang];

  useEffect(() => {
    const mo = new MutationObserver(() => setLang(pageLang()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    setLang(pageLang());
    const mount = () => {
      const bar = document.querySelector<HTMLElement>('.header-actions');
      const groups = document.querySelector<HTMLElement>('#navigation .nav-groups');
      const make = (cls: string, parent: Element | null) => {
        if (!parent) return null;
        let el = parent.querySelector<HTMLElement>(':scope > .' + cls);
        if (!el) { el = document.createElement('div'); el.className = cls; parent.insertBefore(el, parent.firstChild); }
        return el;
      };
      setHosts({ bar: make('site-search__host-bar', bar), menu: make('site-search__host-menu', groups) });
    };
    mount();
    const retry = setTimeout(mount, 200);
    return () => { mo.disconnect(); clearTimeout(retry); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if ((e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); setOpen(true); }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (open && !d.open) { d.showModal(); input.current?.focus(); }
    if (!open && d.open) d.close();
  }, [open]);

  const hits = useMemo(() => search(q, lang), [q, lang]);
  useEffect(() => setActive(0), [q]);

  const go = (i: number) => {
    const a = dialog.current?.querySelectorAll<HTMLAnchorElement>('.site-search__list a')[i];
    if (a) { setOpen(false); setTimeout(() => a.click(), 0); }
  };

  const trigger = (cls: string) => (
    <button type="button" className={'site-search__btn ' + cls} aria-label={t.open} title={`${t.open} (/)`} onClick={() => setOpen(true)}>
      <Icon /><span>{t.open}</span>
    </button>
  );

  return (
    <>
      {hosts.bar && createPortal(trigger('site-search__btn--bar'), hosts.bar)}
      {hosts.menu && createPortal(trigger('site-search__btn--menu'), hosts.menu)}
      {createPortal(
        <dialog ref={dialog} className="sitesearch-dialog" aria-label={t.title} onClose={() => setOpen(false)} onClick={e => { if (e.target === dialog.current) setOpen(false); }}>
          <div className="site-search__head">
            <Icon />
            <input ref={input} id="site-search-input" type="search" role="combobox" aria-expanded="true" aria-controls="site-search-list" aria-activedescendant={hits[active] ? 'ss-' + active : undefined} autoComplete="off" spellCheck={false} placeholder={t.ph} value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(hits.length - 1, i + 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
                else if (e.key === 'Enter' && hits[active]) { e.preventDefault(); go(active); }
                else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); } // a search field would otherwise just clear itself first
              }} />
            <button type="button" className="site-search__close" aria-label={t.close} onClick={() => setOpen(false)}>×</button>
          </div>
          {!q.trim() ? (
            <div className="site-search__empty"><div className="site-search__chips">{t.ex.map(x => <button type="button" key={x} onClick={() => { setQ(x); input.current?.focus(); }}>{x}</button>)}</div></div>
          ) : hits.length === 0 ? (
            <p className="site-search__empty" role="status">{t.none}</p>
          ) : (
            <ul className="site-search__list" id="site-search-list" role="listbox">
              {hits.map(({ e }, i) => {
                const title = lang === 'en' ? e.en ?? e.et : lang === 'ru' ? e.ru : e.et;
                const desc = lang === 'en' ? e.descEn : lang === 'ru' ? e.descRu : e.descEt;
                return (
                  <li key={e.kind + e.href + title} id={'ss-' + i} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)}>
                    <a href={e.href} tabIndex={-1} onClick={() => setOpen(false)}>
                      <span className={'site-search__kind site-search__kind--' + e.kind}>{t.kinds[e.kind]}</span>
                      <strong><Mark text={title} q={q} /></strong>
                      {desc && <small>{desc.length > 110 ? desc.slice(0, 107) + '…' : desc}</small>}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="site-search__hint">{t.hint}</p>
        </dialog>,
        document.body,
      )}
    </>
  );
}
