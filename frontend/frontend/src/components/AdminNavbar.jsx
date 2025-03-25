import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './adminNavbar.css';

function AdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('uid');
        localStorage.removeItem('role');
        sessionStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="admin-navbar">
            <div className="logo-container">
                <img src="/images/logo-text.jpg" alt="Admin Logo" className="school-name-logo" />
            </div>
            <ul className="admin-nav-links">
                <li className={isActive('/admin') ? 'active' : ''}><Link to="/admin">Dashboard</Link></li>
                <li className={isActive('/admin/manage-league') ? 'active' : ''}><Link to="/admin/manage-league">Liga</Link></li>
                <li className={isActive('/admin/manage-teams') ? 'active' : ''}><Link to="/admin/manage-teams">Týmy</Link></li>
                <li className={isActive('/admin/manage-matches') ? 'active' : ''}><Link to="/admin/manage-matches">Rozpis</Link></li>
                <li className={isActive('/admin/manage-playoffs') ? 'active' : ''}><Link to="/admin/manage-playoffs">Playoff</Link></li>
                <li className={isActive('/admin/manage-news') ? 'active' : ''}><Link to="/admin/manage-news">Novinky</Link></li>
                <li className={isActive('/admin/liveBroadcast') ? 'active' : ''}><Link to="/admin/liveBroadcast">Živý zápas</Link></li>
                <li className={isActive('/admin/manage-accounts') ? 'active' : ''}><Link to="/admin/manage-accounts">Účty</Link></li>
                <li>
                    <button className="logout-button">Odhlásit se</button>
                </li>
            </ul>
        </nav>
    );
}

export default AdminNavbar;
