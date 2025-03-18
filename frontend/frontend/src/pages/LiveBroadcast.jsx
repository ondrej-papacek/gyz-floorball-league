import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './liveBroadcast.css';

function LiveBroadcast() {
    const [liveData, setLiveData] = useState(null);

    useEffect(() => {
        const broadcastDoc = doc(db, 'liveBroadcast', 'currentMatch');
        const unsubscribe = onSnapshot(broadcastDoc, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setLiveData(docSnapshot.data());
            } else {
                console.error("No live broadcast found.");
                setLiveData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    if (!liveData) {
        return <p>Loading live match broadcast...</p>;
    }

    return (
        <div className="live-broadcast-page">
            <h2 className="broadcast-title">ŽIVÝ ZÁPAS</h2>
            <div className="broadcast-match-info">
                {liveData.date?.seconds
                    ? new Date(liveData.date.seconds * 1000).toLocaleString()
                    : "Unknown Date"}
            </div>
            <div className="broadcast-scoreboard">
                <div className="broadcast-team">
                    <img src={`/images/team-logos/${encodeURIComponent(liveData.teamA_name?.toLowerCase() || "unknown")}.png`}
                         alt={`${liveData.teamA_name || "Unknown"} Logo`} />
                    <div className="broadcast-team-name">{liveData.teamA_name || "Unknown Team A"}</div>
                </div>
                <div className="broadcast-score-info">
                    <div className="broadcast-score">{liveData.scoreA} - {liveData.scoreB}</div>
                    <div className="broadcast-period-info">{liveData.periodInfo || "N/A"}</div>
                    <div className="broadcast-time-left">{liveData.timeLeft || "0:00"}</div>
                </div>
                <div className="broadcast-team">
                    <img src={`/images/team-logos/${encodeURIComponent(liveData.teamB_name?.toLowerCase() || "unknown")}.png`}
                         alt={`${liveData.teamB_name || "Unknown"} Logo`} />
                    <div className="broadcast-team-name">{liveData.teamB_name || "Unknown Team B"}</div>
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
