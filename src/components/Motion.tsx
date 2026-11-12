import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Selectors that fade/slide in when scrolled into view. Whole large sections are never hidden — only their parts. */
const REVEAL = [
  '.section-heading', '.phase-divider', '.guide-card', '.path-card', '.knowledge-card', '.infographic-card',
  '.lab-card', '.task-card', '.minute-card', '.method-card', '.depth-card', '.quiz-card', '.action-hub-card',
  '.summary-stats article', '.about-grid > div', '.site-footer',
].join(',');

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animated neuron network drawn behind the hero (decorative). */
function NeuralBackdrop() {
  const { nodes, edges } = useMemo(() => {
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const nodes = Array.from({ length: 26 }, () => ({ x: rnd() * 800, y: rnd() * 420, r: 2 + rnd() * 3, d: rnd() * 4 }));
    const edges: [number, number][] = [];
    nodes.forEach((a, i) => nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 150) edges.push([i, j]);
    }));
    return { nodes, edges };
  }, []);
  return (
    <svg className="neural-backdrop" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nb-g" x1="0" x2="1"><stop offset="0" stopColor="#7c6ae6" /><stop offset="1" stopColor="#c9f574" /></linearGradient>
      </defs>
      {edges.map(([i, j], k) => (
        <line key={k} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} className="nb-edge" style={{ animationDelay: `${(k % 9) * 0.45}s` }} />
      ))}
      {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={n.r} className="nb-node" style={{ animationDelay: `${n.d}s` }} />)}
    </svg>
  );
}

const FACTS: { n: number; et: string; ru: string; icon: string }[] = [
  { n: 8, et: 'teadusteemat', ru: 'научных тем', icon: 'M4 6h16M4 12h16M4 18h10' },
  { n: 3, et: 'minimängu', ru: 'мини-игры', icon: 'M6 12h4M8 10v4M15 11h.01M18 13h.01M4 8h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z' },
  { n: 10, et: 'küsimust viktoriinis', ru: 'вопросов в викторине', icon: 'M9 9a3 3 0 115 2c-1 1-2 1.5-2 3M12 18h.01' },
  { n: 1629, et: 'osalejat metaanalüüsis', ru: 'участников метаанализа', icon: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5' },
];

function CountUp({ to, run }: { to: number; run: boolean }) {
  const [v, setV] = useState(() => (reduced() ? to : 0));
  useEffect(() => {
    if (!run || reduced()) { if (reduced()) setV(to); return; }
    let raf = 0; const t0 = performance.now(); const dur = 1400;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v.toLocaleString('en-US').replace(',', '\u00a0')}</>;
}

/** Animated key-numbers strip shown under the hero. All numbers come from the site's own content. */
function FactStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  const [lang, setLang] = useState(() => (document.documentElement.lang === 'ru' ? 'ru' : 'et'));
  useEffect(() => {
    const mo = new MutationObserver(() => setLang(document.documentElement.lang === 'ru' ? 'ru' : 'et'));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setRun(true); return () => mo.disconnect(); }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => { mo.disconnect(); io.disconnect(); };
  }, []);
  return (
    <div className="fact-strip" ref={ref} role="list">
      {FACTS.map((f, i) => (
        <div className="fact-strip__item" role="listitem" key={f.n} style={{ ['--i' as string]: i }}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={f.icon} /></svg>
          <strong><CountUp to={f.n} run={run} /></strong>
          <span>{lang === 'ru' ? f.ru : f.et}</span>
        </div>
      ))}
    </div>
  );
}

export default function Motion() {
  const [hero, setHero] = useState<Element | null>(null);
  const [strip, setStrip] = useState<Element | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    setHero(document.getElementById('avaleht'));
    const anchor = document.getElementById('valik');
    if (anchor && !document.getElementById('fact-strip-host')) {
      const host = document.createElement('div');
      host.id = 'fact-strip-host';
      anchor.parentElement?.insertBefore(host, anchor);
      setStrip(host);
    }
    if (reduced() || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(REVEAL).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const idx = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
        (el as HTMLElement).style.setProperty('--d', `${Math.min(idx, 5) * 70}ms`);
        el.classList.add('reveal');
        io.observe(el);
      });
    };
    scan();
    root.classList.add('js-motion');
    let t = 0;
    const mo = new MutationObserver(() => { clearTimeout(t); t = window.setTimeout(scan, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(t); root.classList.remove('js-motion'); };
  }, []);

  return <>{hero && createPortal(<NeuralBackdrop />, hero)}{strip && createPortal(<FactStrip />, strip)}</>;
}
