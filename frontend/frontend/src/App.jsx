import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import UpcomingMatch from './components/UpcomingMatch';
import Footer from "./components/Footer.jsx";
import LiveMatch from "./components/LiveMatch.jsx";
import News from './pages/News.jsx';
import Teams from './pages/Teams.jsx';
import GoalScorers from "./pages/GoalScorers.jsx";
import Schedule from "./pages/Schedule.jsx";
import LiveBroadcast from "./pages/LiveBroadcast.jsx";

function App() {
    return (
        <Router>
            <Navbar />
            <HeroSection />

            <Routes>
                <Route path="/" element={
                    <>
                        <div className="content-section">
                            <div className="main-content">
                                <NewsSection />
                                <LiveMatch />
                            </div>
                            <UpcomingMatch />
                        </div>
                    </>
                } />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<News />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/goalScorers" element={<GoalScorers />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/liveBroadcast" element={<LiveBroadcast />} />
            </Routes>

            <Footer />
        </Router>
    );
}

export default App;
