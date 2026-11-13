import React from 'react';
import ReactDOM from 'react-dom/client';
import Memory from './sections/Memory';
import Attention from './sections/Attention';
import Lab from './sections/Lab';
import './styles.css';
import './features.css';
import './visuals.css';
import './polish.css';
import './lab.css';
import './survey.css';
import './clarity.css';
import './lab-clarity.css';
import './learning.css';
import './infographics.css';
import './site-system.css';
import './ux-system.css';
import './sticky-header.css';
import './mobile-cleanup.css';
import './mobile-design-fix.css';
import './mobile-simple.css';
import './product-v2.css';
import './enhancements.css';
import './footer-premium.css';
import './quality-pass.css';
import './ux-final.css?entry=enpractice'; // unique per entry so the bundler keeps it last
import './registerSW';

const go = (lang: 'et' | 'ru') => {
  try { localStorage.setItem('alkohol-ja-aju:language', lang); } catch { /* ignore */ }
  location.href = '../?lang=' + lang + '#malu';
};

function Page() {
  React.useEffect(() => { document.documentElement.lang = 'en'; try { localStorage.setItem('alkohol-ja-aju:language', 'en'); } catch { /* ignore */ } document.title = 'Practice: memory, attention and games — Alcohol and the brain'; }, []);
  return <>
    <a className="skip" href="#sisu">Skip to the content</a>
    <header className="header">
      <a className="brand" aria-label="alcohol and the brain" href="./"><img className="brand-mark" src="../logo-mark.svg" alt="" /><span>alcohol and the brain</span></a>
      <div className="header-actions"><div className="language-switch" role="group" aria-label="Language">
        <button type="button" aria-pressed="false" onClick={() => go('et')}>ET</button>
        <button type="button" aria-pressed="false" onClick={() => go('ru')}>RU</button>
        <button type="button" className="active" aria-pressed="true">EN</button>
      </div></div>
    </header>
    <main id="sisu" tabIndex={-1}>
      <section className="hero hero-simple"><div className="hero-copy">
        <p className="eyebrow">LEARNING EXERCISES</p>
        <h1>Try it<br />yourself<span>.</span></h1>
        <h2>Memory, attention and reaction — learning exercises, not medical tests.</h2>
        <p>The results describe only your own attempt. They do not diagnose anything and do not simulate intoxication.</p>
        <div className="actions"><a className="button primary" href="#malu">Start with memory</a><a className="button" href="./">Back to the English site</a></div>
      </div></section>
      <Memory lang="en" />
      <Attention lang="en" />
      <Lab lang="en" />
    </main>
    <footer className="site-footer"><div className="footer-brand"><strong>Alcohol and the brain</strong><p>A learning website about the brain, facts and safe choices.</p></div>
      <nav aria-label="Project information"><a href="./">English home</a><a href="../topics/">Science topics</a><a href="../methodology/">Methodology</a><a href="../help/?lang=en">Need help</a></nav></footer>
  </>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Page /></React.StrictMode>);
