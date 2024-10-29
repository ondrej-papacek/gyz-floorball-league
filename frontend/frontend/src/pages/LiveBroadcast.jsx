import React, { useState, useEffect } from 'react';
import LiveMatch from '../components/LiveMatch';
import '../pages/liveBroadcast.css';

function LiveBroadcast({ liveMatchData }) {
    return (
        <div className="live-broadcast-page">
            <h2 className="broadcast-title">Aktuální Živý Zápas</h2>
            <div className=".broadcast-match-info">
                <span>27.10.2024 15:00</span>
            </div>

            {/* Main Scoreboard */}
            <div className="broadcast-scoreboard">
                {/* Team A Section */}
                <div className="broadcast-team team-a">
                    <img src="/team-logos/prvaci.png" alt="Team A Logo" className="broadcast-team-logo"/>
                    <span className=".broadcast-team-name">Prváci</span>
                    <span className="broadcast-scorers">John Moe</span>
                </div>

                {/* Score and Period Information */}
                <div className="broadcast-score-info">
                    <div className="broadcast-score">1 - 1</div>
                    <div className="broadcast-period-info">
                        <span>1. POLOČAS</span>
                        <span className="time-left">6:26</span>
                    </div>
                </div>

                {/* Team B Section */}
                <div className="broadcast-team team-b">
                    <img src="/team-logos/druhaci.png" alt="Team B Logo" className="team-logo"/>
                    <span className="team-name">Druháci</span>
                    <span className="broadcast-scorers">John Doe</span>
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
