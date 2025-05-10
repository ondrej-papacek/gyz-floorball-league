import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { useAuthRole } from '../hooks/useAuthRole';
import './adminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { role, loading } = useAuthRole();

    if (loading) return <p>Načítání oprávnění...</p>;

    return (
        <>
            <AdminNavbar />
            <div className="admin-dashboard">
                <h1 className="admin-title">Administrativní panel</h1>
                <p className="admin-subtitle">Vítejte v administrativním panelu! Zde můžete spravovat obsah webové stránky.</p>

                <div className="admin-links">
                    {/* ADMIN ONLY - Sorted */}
                    {role === 'admin' && (
                        <>
                            <button onClick={() => navigate('/admin/manage-league')}>Správa ligy</button>
                            <button onClick={() => navigate('/admin/manage-teams')}>Správa týmů</button>
                            <button onClick={() => navigate('/admin/manage-players')}>Správa hráčů</button>
                            <button onClick={() => navigate('/admin/manage-schedule')}>Správa rozpisu zápasů</button>
                            <button onClick={() => navigate('/admin/manage-playoffs')}>Správa Playoff</button>
                            <button onClick={() => navigate('/admin/liveBroadcast')}>Živý zápas</button>
                            <button onClick={() => navigate('/admin/manage-news')}>Správa novinek</button>
                            <button onClick={() => navigate('/admin/manage-accounts')}>Správa účtů</button>
                        </>
                    )}

                    {/* HELPER ONLY - Sorted */}
                    {role === 'helper' && (
                        <>
                            <button onClick={() => navigate('/admin/manage-players')}>Správa hráčů</button>
                            <button onClick={() => navigate('/admin/manage-schedule')}>Správa rozpisu zápasů</button>
                            <button onClick={() => navigate('/admin/manage-playoffs')}>Správa Playoff</button>
                            <button onClick={() => navigate('/admin/liveBroadcast')}>Živý zápas</button>
                            <button onClick={() => navigate('/admin/manage-news')}>Správa novinek</button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
