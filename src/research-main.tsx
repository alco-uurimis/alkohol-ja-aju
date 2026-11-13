import React from 'react';
import ReactDOM from 'react-dom/client';
import ResearchExperience from './ResearchExperience';
import './research.css';
import './research-final.css';
import './research-refine.css';
import './mobile-simple.css';
import './product-v2.css';
import './research-intro.css';
import './quality-pass.css';
import './ux-final.css?entry=res'; // unique per entry so the bundler keeps it after this page's other CSS
import './registerSW';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ResearchExperience /></React.StrictMode>,
);
