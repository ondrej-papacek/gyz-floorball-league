import React from 'react';
import './navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">
                <img src="/images/logo.jpeg" alt="School Logo" />
                <img src="/images/logo-text.jpg" alt="School Name" className="school-name" />
            </div>
            <ul className="nav-links">
                <li><a href="#teams">Týmy</a></li>
                <li><a href="#scorers">Střelci</a></li>
                <li><a href="#schedule">Rozpis zápasů</a></li>
                <li><a href="#news">Novinky</a></li>
            </ul>
            <div className="social-icons">
                <a href="https://www.gyz.cz" target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-school"></i>
                </a>
                <a href="https://www.instagram.com/skolni_florbalova_liga/" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61556555201284" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook"></i>
                </a>
            </div>
        </nav>
    );
}

export default Navbar;
