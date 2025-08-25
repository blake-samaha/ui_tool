import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.js';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');
createRoot(container).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
