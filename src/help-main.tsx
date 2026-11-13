import React from 'react';
import ReactDOM from 'react-dom/client';
import EntryPage from './EntryPage';
import './ux-final.css?entry=help'; // unique per entry so the bundler keeps it after this page's other CSS
import './registerSW';
import { whenReady } from './data/ru';

whenReady(() => { ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><EntryPage page="help" /></React.StrictMode>); });
