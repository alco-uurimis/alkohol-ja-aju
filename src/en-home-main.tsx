import React from 'react';
import ReactDOM from 'react-dom/client';
import ProjectPagesEn from './en/ProjectPagesEn';
import './project-pages.css';
import './mobile-simple.css';
import './quality-pass.css';
import './ux-final.css?entry=en';
import './registerSW';

// The English home is its own page: switching to Estonian or Russian opens the main site in that language.
const go = (lang: 'et' | 'ru' | 'en') => {
  if (lang === 'en') return;
  try { localStorage.setItem('alkohol-ja-aju:language', lang); } catch { /* ignore */ }
  location.href = '../?lang=' + lang;
};
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ProjectPagesEn page="home" setLang={go} /></React.StrictMode>);
