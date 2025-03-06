import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <h1>Administrativní panel</h1>
            <p>Vítejte v administrativním panelu! Zde můžete spravovat obsah webové stránky.</p>
            <div className="admin-links">
                <button onClick={() => navigate('./administration/ManageTeams')}>Správa týmů</button>
                <button onClick={() => navigate('./administration/ManageMatches')}>Správa zápasů</button>
                <button onClick={() => navigate('./administration/ManagePlayoffs')}>Správa Playoff</button>
                <button onClick={() => navigate('./administration/ManageNews')}>Správa novinek</button>
            </div>
        </div>
    );
};

export default AdminDashboard;
