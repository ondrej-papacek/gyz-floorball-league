import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import './adminNavbar.css';

function AdminNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false); // ✅ mobile toggle state

    useEffect(() => {
        const fetchUserRole = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const userData = snap.data();
                        setRole(userData.role);
                    }
                } catch (error) {
                    console.error('Error fetching user role for navbar:', error);
                }
            }
        };

        fetchUserRole();
    }, []);

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

            {/* 🍔 Hamburger toggle (mobile only) */}
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                &#9776;
            </div>

            <ul className={`admin-nav-links ${menuOpen ? 'show' : ''}`}>
                <li className={isActive('/admin') ? 'active' : ''}><Link to="/admin">Dashboard</Link></li>

                {role === 'admin' && (
                    <>
                        <li className={isActive('/admin/manage-league') ? 'active' : ''}>
                            <Link to="/admin/manage-league">Liga</Link>
                        </li>
                        <li className={isActive('/admin/manage-teams') ? 'active' : ''}>
                            <Link to="/admin/manage-teams">Týmy</Link>
                        </li>
                    </>
                )}

                {(role === 'admin' || role === 'helper') && (
                    <>
                        <li className={isActive('/admin/manage-players') ? 'active' : ''}>
                            <Link to="/admin/manage-players">Hráči</Link>
                        </li>
                        <li className={isActive('/admin/manage-schedule') ? 'active' : ''}>
                            <Link to="/admin/manage-schedule">Rozpis zápasů</Link>
                        </li>
                        <li className={isActive('/admin/manage-playoffs') ? 'active' : ''}>
                            <Link to="/admin/manage-playoffs">Playoff</Link>
                        </li>
                        <li className={isActive('/admin/liveBroadcast') ? 'active' : ''}>
                            <Link to="/admin/liveBroadcast">Živý zápas</Link>
                        </li>
                        <li className={isActive('/admin/manage-news') ? 'active' : ''}>
                            <Link to="/admin/manage-news">Novinky</Link>
                        </li>
                    </>
                )}

                {role === 'admin' && (
                    <li className={isActive('/admin/manage-accounts') ? 'active' : ''}>
                        <Link to="/admin/manage-accounts">Účty</Link>
                    </li>
                )}

                <li>
                    <button className="logout-button" onClick={handleLogout}>Odhlásit se</button>
                </li>
            </ul>
        </nav>
    );
}

export default AdminNavbar;
