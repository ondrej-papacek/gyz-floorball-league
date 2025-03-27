import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import AdminNavbar from '../components/AdminNavbar';
import './adminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <>
            <AdminNavbar />
            <div className="admin-dashboard">
                <h1 className="admin-title">Administrativní panel</h1>
                <p className="admin-subtitle">Vítejte v administrativním panelu! Zde můžete spravovat obsah webové stránky.</p>
                <div className="admin-links">
                    <button onClick={() => navigate('/admin/manage-league')}>Správa ligy</button>
                    <button onClick={() => navigate('/admin/manage-teams')}>Správa týmů</button>
                    <button onClick={() => navigate('/admin/manage-matches')}>Správa rozpisu</button>
                    <button onClick={() => navigate('/admin/manage-playoffs')}>Správa Playoff</button>
                    <button onClick={() => navigate('/admin/manage-news')}>Správa novinek</button>
                    <button onClick={() => navigate('/admin/liveBroadcast')}>Živý zápas</button>
                    <button onClick={() => navigate('/admin/manage-accounts')}>Správa účtů</button>
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
