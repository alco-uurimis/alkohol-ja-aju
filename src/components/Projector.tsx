import { useCallback, useEffect, useState } from 'react';
import './projector.css';

type Lang = 'et' | 'ru' | 'en';
const t = {
  et: { prev: 'Eelmine', next: 'Järgmine', exit: 'Välju', full: 'Täisekraan', bar: 'Projektori režiim', hint: '← → või PgUp/PgDn · Esc väljub · F täisekraan', start: 'Algus' },
  ru: { prev: 'Назад', next: 'Дальше', exit: 'Выйти', full: 'Во весь экран', bar: 'Режим проектора', hint: '← → или PgUp/PgDn · Esc — выход · F — во весь экран', start: 'Начало' },
  en: { prev: 'Previous', next: 'Next', exit: 'Exit', full: 'Full screen', bar: 'Projector mode', hint: '← → or PgUp/PgDn · Esc exits · F full screen', start: 'Start' },
} as const;

// Parts of the main page that make no sense on a classroom screen.
const SKIP = new Set(['tagasiside', 'isiklik-kokkuvote', 'projektist', 'moisted']);

/**
 * Classroom projector mode: one section of the main page at a time, large type, keyboard and clicker navigation
 * (presentation clickers send PageUp/PageDown). The section markup is not copied; CSS shows only the current one.
 */
export default function Projector({ lang, onExit }: { lang: Lang; onExit: (lastId: string) => void }) {
  const s = t[lang];
  const [ids, setIds] = useState<string[]>([]);
  const [i, setI] = useState(0);

  // The page mounts its sections in steps; collect them once they exist and whenever more appear.
  useEffect(() => {
    const collect = () => {
      const list = [...document.querySelectorAll<HTMLElement>('main > section[id]')].map(e => e.id).filter(id => !SKIP.has(id));
      setIds(prev => (prev.join() === list.join() ? prev : list));
    };
    collect();
    const mo = new MutationObserver(collect);
    const main = document.querySelector('main');
    if (main) mo.observe(main, { childList: true });
    return () => mo.disconnect();
  }, []);

  // Start at the section in the address (#id) if there is one.
  useEffect(() => {
    if (!ids.length) return;
    const fromHash = decodeURIComponent(location.hash.slice(1));
    const k = ids.indexOf(fromHash);
    if (k > 0) setI(k);
  }, [ids.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = ids[i];
  useEffect(() => {
    document.documentElement.classList.add('projector');
    return () => { document.documentElement.classList.remove('projector'); document.querySelectorAll('.projector-current').forEach(e => e.classList.remove('projector-current')); };
  }, []);
  useEffect(() => {
    if (!current) return;
    document.querySelectorAll('.projector-current').forEach(e => e.classList.remove('projector-current'));
    const el = document.getElementById(current);
    el?.classList.add('projector-current');
    window.scrollTo({ top: 0 });
    history.replaceState(null, '', `${location.pathname}${location.search}#${current}`);
    (el?.querySelector('h2, h1') as HTMLElement | null)?.focus?.({ preventScroll: true });
  }, [current]);

  const go = useCallback((d: number) => setI(v => Math.max(0, Math.min(ids.length - 1, v + d))), [ids.length]);
  const fullscreen = () => { const d = document as Document & { webkitFullscreenElement?: Element }; if (document.fullscreenElement || d.webkitFullscreenElement) void document.exitFullscreen?.(); else void document.documentElement.requestFullscreen?.().catch(() => {}); };
  const exit = useCallback(() => { if (document.fullscreenElement) void document.exitFullscreen?.(); onExit(current ?? ''); }, [current, onExit]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (typing || e.altKey || e.ctrlKey || e.metaKey) return;
      if (['ArrowRight', 'PageDown'].includes(e.key) || (e.key === ' ' && (!el || el === document.body))) { e.preventDefault(); go(1); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
      else if (e.key === 'Home') { e.preventDefault(); setI(0); }
      else if (e.key === 'End') { e.preventDefault(); setI(ids.length - 1); }
      else if (e.key === 'Escape' && !document.fullscreenElement) exit();
      else if (e.key.toLowerCase() === 'f') fullscreen();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [go, exit, ids.length]);

  const title = current === 'avaleht' ? s.start : (document.getElementById(current ?? '')?.querySelector('h2')?.textContent ?? '');
  return (
    <nav className="projector-bar" aria-label={s.bar}>
      <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label={s.prev}><span aria-hidden="true">←</span> <b>{s.prev}</b></button>
      <div className="projector-mid">
        <strong>{title}</strong>
        <span>{ids.length ? `${i + 1} / ${ids.length}` : '…'} · <small>{s.hint}</small></span>
        <div className="projector-dots" aria-hidden="true">{ids.map((id, k) => <i key={id} className={k === i ? 'on' : k < i ? 'done' : ''} />)}</div>
      </div>
      <button type="button" onClick={() => go(1)} disabled={i >= ids.length - 1} aria-label={s.next}><b>{s.next}</b> <span aria-hidden="true">→</span></button>
      <button type="button" className="projector-small" onClick={fullscreen}>{s.full}</button>
      <button type="button" className="projector-small" onClick={exit}>{s.exit}</button>
    </nav>
  );
}
