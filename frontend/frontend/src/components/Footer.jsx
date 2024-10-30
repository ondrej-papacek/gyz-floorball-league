import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="footer-container">
            <footer className="footer">
                <div className="footer-logo-container">
                    <img src="/images/logo-league.png" alt="Hlavní logo školní florbalové ligy"
                         className="footer-league-logo"/>
                    <img src="/images/logo-text.jpg" alt="Název školy jako logo"
                         className="footer-school-name-logo"/>
                </div>
                <div className="footer-links">
                    <ul>
                        <Link to="/">
                            <li>Domů</li>
                        </Link>
                        <Link to="/news">
                            <li>Novinky</li>
                        </Link>
                        <Link to="/teams">
                            <li>Týmy</li>
                        </Link>
                        <Link to="/goalScorers">
                            <li>Střelci</li>
                        </Link>
                        <Link to="/schedule">
                            <li>Rozpis zápasů</li>
                        </Link>
                        <Link to="/liveBroadcast">
                            <li>Živý zápas</li>
                        </Link>
                    </ul>
                </div>
                <div className="footer-socials-container">
                    <a href="https://www.gyz.cz" target="_blank" rel="noopener noreferrer">
                        <i className='bx bx-world'></i>
                    </a>
                    <a href="https://www.instagram.com/skolni_florbalova_liga/" target="_blank"
                       rel="noopener noreferrer">
                        <i className='bx bxl-instagram'></i>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61556555201284" target="_blank"
                       rel="noopener noreferrer">
                        <i className='bx bxl-facebook-circle'></i>
                    </a>
                </div>
            </footer>
            <div className="footer-copyright">
                © {currentYear} Gymnázium Žamberk, vytvořil Ondřej Papáček
            </div>
        </div>
    )
}

export default Footer;