import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageLeague.css';

const ManageLeague = () => {
    const navigate = useNavigate();

    const handleArchiveLeague = (leagueId) => {
        // Logic to archive the league (e.g., update Firebase)
        alert(`League ${leagueId} has been archived.`);
    };

    return (
        <div className="manage-league-page">
            <h1>Správa Lig</h1>
            <div className="league-list">
                <div className="league-item">
                    <h2>Nižší Gymnázium - 2025</h2>
                    <button onClick={() => navigate('/admin/manage-teams/2025_lower')}>Správa Týmů</button>
                    <button onClick={() => navigate('/admin/manage-matches/2025_lower')}>Správa Zápasů</button>
                    <button onClick={() => navigate('/admin/manage-playoffs/2025_lower')}>Správa Playoff</button>
                    <button onClick={() => handleArchiveLeague('2025_lower')}>Archivovat Ligu</button>
                </div>
                <div className="league-item">
                    <h2>Vyšší Gymnázium - 2025</h2>
                    <button onClick={() => navigate('/admin/manage-teams/2025_upper')}>Správa Týmů</button>
                    <button onClick={() => navigate('/admin/manage-matches/2025_upper')}>Správa Zápasů</button>
                    <button onClick={() => navigate('/admin/manage-playoffs/2025_upper')}>Správa Playoff</button>
                    <button onClick={() => handleArchiveLeague('2025_upper')}>Archivovat Ligu</button>
                </div>
            </div>
        </div>
    );
};

export default ManageLeague;
