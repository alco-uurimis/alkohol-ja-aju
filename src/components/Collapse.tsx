import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './collapse.css';

type Props = {
  children: ReactNode;
  lang: 'et' | 'ru';
  /** Visible height while collapsed, in px (phone / desktop). */
  collapsed: [number, number];
  /** Shown on the button, e.g. "12 карточек". */
  count?: string;
  /** Links starting with this hash prefix open the block before jumping (so anchors into hidden content still work). */
  anchorPrefix?: string;
};

const text = {
  et: { more: 'Näita kõike', less: 'Peida' },
  ru: { more: 'Показать всё', less: 'Свернуть' },
};

/** Collapses a long block to a teaser with a fade. Everything stays in the DOM, so search, anchors and screen readers still reach it. */
export default function Collapse({ children, lang, collapsed, count, anchorPrefix }: Props) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(0);
  const [needed, setNeeded] = useState(true);
  const limit = () => (innerWidth < 760 ? collapsed[0] : collapsed[1]);

  const measure = useCallback(() => {
    const h = box.current?.scrollHeight ?? 0;
    setFull(h);
    setNeeded(h > limit() + 120);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    // Phones fire "resize" when the address bar hides during scrolling; only a width change can reflow this block.
    let lastW = innerWidth;
    const onResize = () => { if (innerWidth !== lastW) { lastW = innerWidth; measure(); } };
    addEventListener('resize', onResize);
    const ro = 'ResizeObserver' in window && box.current ? new ResizeObserver(measure) : null;
    if (ro && box.current) ro.observe(box.current);
    return () => { removeEventListener('resize', onResize); ro?.disconnect(); };
  }, [measure]);

  // Open before following a link that points into the collapsed block.
  useEffect(() => {
    if (!anchorPrefix) return;
    const reveal = (hash: string) => {
      if (!hash.startsWith(anchorPrefix)) return;
      const target = document.getElementById(hash.slice(1));
      if (target && box.current?.contains(target)) {
        setOpen(true);
        setTimeout(() => target.scrollIntoView({ block: 'center' }), 80);
      }
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]');
      if (a) reveal(a.getAttribute('href') ?? '');
    };
    const onHash = () => reveal(location.hash);
    document.addEventListener('click', onClick);
    addEventListener('hashchange', onHash);
    onHash();
    return () => { document.removeEventListener('click', onClick); removeEventListener('hashchange', onHash); };
  }, [anchorPrefix]);

  const t = text[lang];
  const collapsedNow = needed && !open;
  const style = needed ? { maxHeight: open ? full + 40 : limit() } : undefined;

  return (
    <div className={'collapse' + (collapsedNow ? ' is-collapsed' : '') + (open ? ' is-open' : '')}>
      <div id={id} ref={box} className="collapse__body" style={style}>{children}</div>
      {needed && (
        <div className="collapse__bar">
          <button type="button" className="collapse__btn" aria-expanded={open} aria-controls={id}
            onClick={() => { const wasOpen = open; setOpen(!open); if (wasOpen) box.current?.parentElement?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }}>
            <span>{open ? t.less : t.more}{!open && count ? ` · ${count}` : ''}</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 8l5 5 5-5" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
