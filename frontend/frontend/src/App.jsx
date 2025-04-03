import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import UpcomingMatch from './components/UpcomingMatch';
import Footer from './components/Footer';
import LiveMatch from './components/LiveMatch';
import News from './pages/News';
import Teams from './pages/Teams';
import GoalScorers from './pages/GoalScorers';
import Schedule from './pages/Schedule';
import LiveBroadcast from './pages/LiveBroadcast';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './administration/AdminDashboard';
import AdminLiveBroadcast from "./administration/AdminLiveBroadcast.jsx";
import ManageTeams from './administration/ManageTeams';
import ManageMatches from './administration/ManageMatches';
import ManageNews from './administration/ManageNews';
import ManageLeague from './administration/ManageLeague';
import ManagePlayoffs from "./administration/ManagePlayoffs.jsx";
import withRoleGuard from './guards/withRoleGuard';
import ManageAccounts from "./administration/ManageAccounts.jsx";
import ManagePlayers from "./administration/ManagePlayers.jsx";
import ManageSchedule from './administration/ManageSchedule';

function App() {
    return (
        <Router>
            <Navbar />
            <HeroSection />

            <Routes>
                {/* Public Website Routes */}
                <Route
                    path="/"
                    element={
                        <>
                            <div className="content-section">
                                <div className="left-panel">
                                    <NewsSection/>
                                    <LiveMatch/>
                                </div>
                                <div className="right-panel">
                                    <UpcomingMatch/>
                                </div>
                            </div>
                        </>
                    }
                />
                <Route path="/news" element={<News/>}/>
                <Route path="/news/:id" element={<News/>}/>
                <Route path="/teams" element={<Teams />} />
                <Route path="/goalScorers" element={<GoalScorers />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/liveBroadcast" element={<LiveBroadcast />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Login Route */}
                <Route path="/admin" element={withRoleGuard(AdminDashboard, 'admin')()} />
                <Route path="/admin/liveBroadcast" element={withRoleGuard(AdminLiveBroadcast, 'admin')()} />
                <Route path="/admin/manage-teams/" element={withRoleGuard(ManageTeams, 'admin')()} />
                <Route path="/admin/manage-matches/" element={withRoleGuard(ManageMatches, 'admin')()} />
                <Route path="/admin/manage-playoffs/" element={withRoleGuard(ManagePlayoffs, 'admin')()} />
                <Route path="/admin/manage-news" element={withRoleGuard(ManageNews, 'admin')()} />
                <Route path="/admin/manage-league" element={withRoleGuard(ManageLeague, 'admin')()} />
                <Route path="/admin/manage-accounts" element={withRoleGuard(ManageAccounts, 'admin')()} />
                <Route path="/admin/manage-players" element={withRoleGuard(ManagePlayers, 'admin')()} />
                <Route path="/admin/manage-schedule" element={withRoleGuard(ManageSchedule, 'admin')()} />
            </Routes>

            <Footer />
        </Router>
    );
}

export default App;
