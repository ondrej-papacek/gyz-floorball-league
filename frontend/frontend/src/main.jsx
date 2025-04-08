import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LeagueProvider } from './services/leagueContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <LeagueProvider>
            <App />
        </LeagueProvider>
    </React.StrictMode>
);
