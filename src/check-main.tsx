import React from 'react';
import ReactDOM from 'react-dom/client';
import CheckPage from './CheckPage';
import { whenReady } from './data/ru';
import './ux-final.css?entry=check';
import './registerSW';
whenReady(() => { ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><CheckPage /></React.StrictMode>); });
