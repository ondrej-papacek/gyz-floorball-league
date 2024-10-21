import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import UpcomingMatch from './components/UpcomingMatch';

function App() {
    return (
        <div>
            <Navbar />
            <HeroSection />
            <div className="content-section">
                <NewsSection />
                <UpcomingMatch />
            </div>
        </div>
    );
}

export default App;
