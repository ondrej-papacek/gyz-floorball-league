import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="logo-container">
                <img
                    src="/images/logo-text.jpg"
                    alt="Název školy jako logo"
                    className="school-name-logo"
                />
            </div>

            {/* ☰ Hamburger */}
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                &#9776;
            </div>

            <ul className={`nav-links ${menuOpen ? 'show' : ''}`}>
                <li><Link to="/"><i className='bx bx-home-alt'></i></Link></li>
                <li><Link to="/news">Novinky</Link></li>
                <li><Link to="/teams">Týmy</Link></li>
                <li><Link to="/goalScorers">Střelci</Link></li>
                <li><Link to="/schedule">Rozpis zápasů</Link></li>
                <li><Link to="/liveBroadcast">Živý zápas</Link></li>
            </ul>

            <div className="social-icons">
                <a href="https://www.gyz.cz" target="_blank" rel="noopener noreferrer">
                    <i className='bx bx-world'></i>
                </a>
                <a href="https://www.instagram.com/skolni_florbalova_liga/" target="_blank" rel="noopener noreferrer">
                    <i className='bx bxl-instagram'></i>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61556555201284" target="_blank" rel="noopener noreferrer">
                    <i className='bx bxl-facebook-circle'></i>
                </a>
            </div>
        </nav>
    );
}

export default Navbar;
