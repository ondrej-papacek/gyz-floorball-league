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

const PrivateRoute = ({ element, requiredRole }) => {
    const role = localStorage.getItem('role');
    if (!role) return <Navigate to="/login" />;
    if (requiredRole && role !== requiredRole) return <Navigate to="/" />;
    return element;
};

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

                {/* Login Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={<PrivateRoute element={<AdminDashboard />} requiredRole="admin" />}
                />
                <Route
                    path="/admin/liveBroadcast"
                    element={<PrivateRoute element={<AdminLiveBroadcast />} requiredRole="admin" />}
                />
                <Route
                    path="/admin/manage-teams"
                    element={<PrivateRoute element={<ManageTeams />} requiredRole="admin" />}
                />
                <Route
                    path="/admin/manage-matches"
                    element={<PrivateRoute element={<ManageMatches />} requiredRole="admin" />}
                />
                <Route
                    path="/admin/manage-news"
                    element={<PrivateRoute element={<ManageNews />} requiredRole="admin" />}
                />
                <Route
                    path="/admin/manage-league"
                    element={<PrivateRoute element={<ManageLeague />} requiredRole="admin" />}
                />
                <Route
                    path="/admin/manage-playoffs/:leagueId"
                    element={<ManagePlayoffs />}
                />

            </Routes>

            <Footer />
        </Router>
    );
}

export default App;
