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
                console.error('Živý přenos nebyl nalezen.');
            }
        });

        return () => unsubscribe();
    }, []);

    if (!liveData) {
        return <p>Načítání živého přenosu...</p>;
    }

    return (
        <div className="live-broadcast-page">
            <h2 className="broadcast-title">ŽIVÝ ZÁPAS</h2>
            <div className="broadcast-match-info">{liveData.date}</div>
            <div className="broadcast-scoreboard">
                <div className="broadcast-team">
                    <img src="/team-logos/prvaci.png" alt={`${liveData.teamA} Logo`} className="broadcast-team-logo" />
                    <div className="broadcast-team-name">{liveData.teamA}</div>
                </div>
                <div className="broadcast-score-info">
                    <div className="broadcast-score">
                        {liveData.scoreA} - {liveData.scoreB}
                    </div>
                    <div className="broadcast-period-info">{liveData.periodInfo}</div>
                    <div className="broadcast-time-left">{liveData.timeLeft}</div>
                </div>
                <div className="broadcast-team">
                    <img src="/team-logos/druhaci.png" alt={`${liveData.teamB} Logo`} className="broadcast-team-logo" />
                    <div className="broadcast-team-name">{liveData.teamB}</div>
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
