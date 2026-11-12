import { useEffect, useRef, useState } from 'react';
import './results-chart.css';

export type ResultItem = { code: string; label: string; count: number };

/**
 * Privacy-safe distribution chart. The caller only passes groups that already passed the N >= 10 rule
 * and whose counts add up to the published total, so every bar here is publishable.
 * Scale: each bar is count / n, drawn on a fixed 0-100% track.
 */
export default function ResultsChart({ items, total, variant = 'bars', ariaLabel, countWord }: {
  items: ResultItem[]; total: number; variant?: 'bars' | 'stack'; ariaLabel: string; countWord: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pct = (c: number) => (total > 0 ? (c / total) * 100 : 0);
  const fmt = (c: number) => `${Math.round(pct(c))}%`;

  if (variant === 'stack') {
    return (
      <div ref={ref} className={'rchart rchart--stack' + (on ? ' is-on' : '')} role="group" aria-label={ariaLabel}>
        <div className="rchart__stack" aria-hidden="true">
          {items.map((it, i) => (
            <span key={it.code} className={'rchart__seg seg-' + (it.code === 'prefer_not' ? 'muted' : i % 4)} style={{ ['--w' as string]: `${pct(it.count)}%`, ['--i' as string]: i }} />
          ))}
        </div>
        <ul className="rchart__legend">
          {items.map((it, i) => (
            <li key={it.code}>
              <i className={'dot seg-' + (it.code === 'prefer_not' ? 'muted' : i % 4)} aria-hidden="true" />
              <span>{it.label}</span>
              <b>{fmt(it.count)}</b>
              <small>{it.count} {countWord}</small>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={ref} className={'rchart' + (on ? ' is-on' : '')} role="group" aria-label={ariaLabel}>
      {items.map((it, i) => (
        <div className="rchart__row" key={it.code}>
          <div className="rchart__head">
            <span>{it.label}</span>
            <span className="rchart__val"><b>{fmt(it.count)}</b><small>{it.count} {countWord}</small></span>
          </div>
          <div className="rchart__track" aria-hidden="true">
            <i className={it.code === 'prefer_not' ? 'seg-muted' : 'seg-0'} style={{ ['--w' as string]: `${pct(it.count)}%`, ['--i' as string]: i }} />
          </div>
        </div>
      ))}
    </div>
  );
}
