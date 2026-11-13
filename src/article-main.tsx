import React from 'react';
import ReactDOM from 'react-dom/client';
import ArticleApp from './ArticleApp';
import './quality-pass.css';
import './ux-final.css?entry=art'; // unique per entry so the bundler keeps it after this page's other CSS
import './registerSW';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ArticleApp/></React.StrictMode>);
