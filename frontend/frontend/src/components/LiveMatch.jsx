import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './liveMatch.css';

const formatDate = (timestamp) => {
    return timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleString() : "Unknown";
};

function LiveMatch() {
    const [matchData, setMatchData] = useState(null);

    useEffect(() => {
        const matchDoc = doc(db, 'liveBroadcast', 'currentMatch');
        const unsubscribe = onSnapshot(matchDoc, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setMatchData(docSnapshot.data());
            } else {
                console.error('Live match not found.');
            }
        });

        return () => unsubscribe();
    }, []);

    if (!matchData) {
        return <p>Loading live match...</p>;
    }

    return (
        <div className="live-match-container">
            <h2>LIVE MATCH</h2>
            <div className="match-info">
                <span>{formatDate(matchData.date)}</span>
            </div>
            <div className="scoreboard">
                <div className="team team-a">
                    <img src="/team-logos/prvaci.png" alt={`${matchData.teamA} Logo`} />
                    <span className="team-name">{matchData.teamA}</span>
                    <span className="scorers">{matchData.scorerA}</span>
                </div>
                <div className="score-info">
                    <div className="score">{`${matchData.scoreA} - ${matchData.scoreB}`}</div>
                    <div className="period-info">
                        <span>{matchData.periodInfo}</span>
                        <span className="time-left">{matchData.timeLeft}</span>
                    </div>
                </div>
                <div className="team team-b">
                    <img src="/team-logos/druhaci.png" alt={`${matchData.teamB} Logo`} />
                    <span className="team-name">{matchData.teamB}</span>
                    <span className="scorers">{matchData.scorerB}</span>
                </div>
            </div>
        </div>
    );
}


export default LiveMatch;
