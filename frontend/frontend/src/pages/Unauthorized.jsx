import React from 'react';
import './unauthorized.css';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="unauthorized-page">
            <h1>🚫 Přístup zamítnut</h1>
            <p>Nemáte oprávnění pro zobrazení této stránky.</p>
            <Link to="/" className="back-home">← Zpět na hlavní stránku</Link>
        </div>
    );
};

export default Unauthorized;
