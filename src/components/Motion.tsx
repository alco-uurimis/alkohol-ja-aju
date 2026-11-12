import { useEffect, useMemo, useState } from 'react';
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

export default function Motion() {
  const [hero, setHero] = useState<Element | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    setHero(document.getElementById('avaleht'));
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

  return hero ? createPortal(<NeuralBackdrop />, hero) : null;
}
