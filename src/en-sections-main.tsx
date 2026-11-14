import React from 'react';
import ReactDOM from 'react-dom/client';
import Memory from './sections/Memory';
import Attention from './sections/Attention';
import Lab from './sections/Lab';
import Explore from './sections/Explore';
import ActionHub from './sections/ActionHub';
import ClassroomKit from './sections/ClassroomKit';
import { loadEn } from './data/en';
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
import './ux-final.css?entry=ensections'; // loaded last
import './registerSW';

const go = (lang: 'et' | 'ru') => {
  try { localStorage.setItem('alkohol-ja-aju:language', lang); } catch { /* ignore */ }
  location.href = '../?lang=' + lang;
};

type PageKey = 'practice' | 'situations' | 'classroom';
const pages: Record<PageKey, { title: string; kicker: string; h1: [string, string]; lead: string; sub: string; content: () => React.ReactNode }> = {
  practice: {
    title: 'Practice: memory, attention and games — Alcohol and the brain', kicker: 'LEARNING EXERCISES', h1: ['Try it', 'yourself'],
    lead: 'Memory, attention and reaction — learning exercises, not medical tests.',
    sub: 'The results describe only your own attempt. They do not diagnose anything and do not simulate intoxication.',
    content: () => <><Memory lang="en" /><Attention lang="en" /><Lab lang="en" /><Explore lang="en" /></>,
  },
  situations: {
    title: 'What to do in real life — Alcohol and the brain', kicker: 'PRACTICAL STEPS', h1: ['What to do', 'in real life'],
    lead: 'Calm, practical steps for common situations, and where to get reliable help.',
    sub: 'This is not a diagnosis or an assessment of a person. In immediate danger call 112.',
    content: () => <ActionHub lang="en" />,
  },
  classroom: {
    title: 'Classroom kit — Alcohol and the brain', kicker: 'FOR TEACHERS', h1: ['A ready', 'lesson route'],
    lead: 'A 15–20 minute plan, discussion questions and an exit ticket you can print.',
    sub: 'It uses the website’s materials and does not require anyone to share personal stories or health information.',
    content: () => <ClassroomKit lang="en" />,
  },
};
const key = (document.body.dataset.page as PageKey) in pages ? (document.body.dataset.page as PageKey) : 'practice';

function Page() {
  const c = pages[key];
  React.useEffect(() => { document.documentElement.lang = 'en'; try { localStorage.setItem('alkohol-ja-aju:language', 'en'); } catch { /* ignore */ } document.title = c.title; }, [c.title]);
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
        <p className="eyebrow">{c.kicker}</p>
        <h1>{c.h1[0]}<br />{c.h1[1]}<span>.</span></h1>
        <h2>{c.lead}</h2>
        <p>{c.sub}</p>
        <div className="actions"><a className="button" href="./">Back to the English site</a></div>
      </div></section>
      {c.content()}
    </main>
    <footer className="site-footer"><div className="footer-brand"><strong>Alcohol and the brain</strong><p>A learning website about the brain, facts and safe choices.</p></div>
      <nav aria-label="Project information"><a href="./">English home</a><a href="practice.html">Exercises</a><a href="situations.html">What to do</a><a href="classroom.html">Classroom kit</a><a href="../topics/">Science topics</a><a href="../help/?lang=en">Need help</a></nav></footer>
  </>;
}
loadEn().then(() => ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Page /></React.StrictMode>));
