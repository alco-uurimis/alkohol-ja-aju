import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ScrollProgress from './components/ScrollProgress';
import './styles.css';
import './features.css';
import './visuals.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ScrollProgress/><App /></React.StrictMode>);
