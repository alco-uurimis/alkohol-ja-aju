// Reading-progress bar. Kept deliberately cheap for phones:
//  - scroll handler only reads scrollY and writes one custom property on the bar itself (never on <html>, which would
//    invalidate styles for the whole page on every frame);
//  - the bar is drawn with transform: scaleX (see ux-final.css), so no layout happens while scrolling;
//  - the document height is measured only when the page is resized, not on every scroll event.
let frame = 0;
let max = 0;
let track: HTMLElement | null = null;

function measure() {
  max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function paint() {
  frame = 0;
  if (!track || !track.isConnected) track = document.querySelector<HTMLElement>('.header-progress-track');
  if (!track) return;
  const k = max === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
  track.style.setProperty('--p', k.toFixed(4));
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(paint);
}

function start() {
  // Attach only if the page actually renders a progress bar (React mounts it a moment after load).
  setTimeout(() => {
    track = document.querySelector<HTMLElement>('.header-progress-track');
    if (!track) return;
    measure();
    schedule();
    addEventListener('scroll', schedule, { passive: true });
    let lastW = innerWidth;
    const remeasure = () => { measure(); schedule(); };
    // Phone browsers fire "resize" whenever the address bar hides while scrolling; only the width matters here.
    addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; remeasure(); } }, { passive: true });
    if ('ResizeObserver' in window) {
      let t = 0;
      new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(remeasure, 150); }).observe(document.body);
    }
  }, 600);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
