import React from 'react';
import './heroSection.css';

function HeroSection() {
    return (
        <section className="hero-section">

            <div className="uk-position-relative uk-visible-toggle uk-light hero-slider"
                 uk-slider="autoplay: true; autoplay-interval: 5000;">
                <ul className="uk-slider-items uk-child-width-1-1">
                    <li>
                        <img src="/images/hero-img.jpg" alt="Slide 1" className="hero-img"/>
                    </li>
                    <li>
                        <img src="/images/hero-img2.png" alt="Slide 2" className="hero-img"/>
                    </li>
                    <li>
                        <img src="/images/hero-img3.png" alt="Slide 3" className="hero-img"/>
                    </li>
                </ul>

                <a className="uk-position-center-left uk-position-small uk-hidden-hover nav-arrow" href="#"
                   uk-slidenav-previous="true" uk-slider-item="previous"></a>
                <a className="uk-position-center-right uk-position-small uk-hidden-hover nav-arrow" href="#"
                   uk-slidenav-next="true" uk-slider-item="next"></a>
            </div>
            <div className="hero-content">
                <img src="/images/logo-league.png" alt="Hlavní logo školní florbalové ligy"
                     className="hero-league-logo"/>
                <h1>Školní Florbalová Liga</h1>
            </div>
        </section>
    );
}

export default HeroSection;
