import React from 'react';
import './heroSection.css';

function HeroSection() {
    return (
        <section className="hero-section" style={{ backgroundImage: "url('/assets/background2.jpg')" }}>
            <div className="hero-content">
                <img src="/assets/logo.jpeg" alt="School Logo" className="hero-logo" />
                <img src="/assets/logo-text.jpg" alt="School Name" className="hero-school-name" />
                <h1>Školní Florbalová Liga</h1>
            </div>
        </section>
    );
}

export default HeroSection;
