import React, { useState, useEffect } from 'react';
import './liveMatch.css';

function LiveMatch() {
    return (
        <div className="live-match-container">
            <h2>ŽIVÝ ZÁPAS</h2>
            {/* Date and Time */}
            <div className="match-info">
                <span>27.10.2024 15:00</span>
            </div>

            {/* Main Scoreboard */}
            <div className="scoreboard">
                {/* Team A Section */}
                <div className="team team-a">
                    <img src="/team-logos/prvaci.png" alt="Team A Logo" className="team-logo"/>
                    <span className="team-name">Prváci</span>
                    <span className="scorers">John Moe</span>
                </div>

                {/* Score and Period Information */}
                <div className="score-info">
                    <div className="score">1 - 1</div>
                    <div className="period-info">
                        <span>1. POLOČAS</span>
                        <span className="time-left">6:26</span>
                    </div>
                </div>

                {/* Team B Section */}
                <div className="team team-b">
                    <img src="/team-logos/druhaci.png" alt="Team B Logo" className="team-logo" />
                    <span className="team-name">Druháci</span>
                    <span className="scorers">John Doe</span>
                </div>
            </div>
        </div>
    );
}

export default LiveMatch;
