import React from 'react';
import ReactDOM from 'react-dom/client';
import ProjectPagesAppV2 from './ProjectPagesAppV2';
import './project-pages.css';
import './mobile-simple.css';
import './quality-pass.css';
import './ux-final.css?entry=pp'; // unique per entry so the bundler keeps it after this page's other CSS
import './registerSW';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ProjectPagesAppV2/></React.StrictMode>);
