import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import './liveBroadcast.css';

function LiveBroadcast() {
    const [liveData, setLiveData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const broadcastDoc = doc(db, 'liveBroadcast', 'currentMatch');
        const unsubscribe = onSnapshot(broadcastDoc, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();

                const parsedTimeLeft = typeof data.timeLeft === "string"
                    ? parseInt(data.timeLeft, 10)
                    : data.timeLeft || 0;

                setTimeLeft(parsedTimeLeft);
                setLiveData(data);
            } else {
                console.error("No live broadcast found.");
                setLiveData(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let timer;
        if (liveData && liveData.status === "live" && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [liveData, timeLeft]);

    const formatDate = (timestamp) => {
        return timestamp?.seconds
            ? new Date(timestamp.seconds * 1000).toLocaleString("cs-CZ")
            : "Unknown Date";
    };

    const timeLeftFormatted = timeLeft > 0
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
        : "0:00";

    if (!liveData) {
        return <p>Loading live match broadcast...</p>;
    }

    return (
        <div className="live-match-container">
            <h2>ŽIVÝ ZÁPAS</h2>
            <div className="match-info">
                <span>{formatDate(liveData.date)}</span>
            </div>
            <div className="scoreboard">
                <div className="team team-a">
                    <img src={`/images/team-logos/${liveData.teamA?.toLowerCase() || "unknown"}.png`} alt={`${liveData.teamA_name} Logo`} />
                    <span className="team-name">{liveData.teamA_name || "Neznámý tým A"}</span>
                    <span className="scorers">{liveData.scorerA?.length ? liveData.scorerA.join(", ") : "No scorer details"}</span>
                </div>
                <div className="score-info">
                    <div className="score">{`${liveData.scoreA} - ${liveData.scoreB}`}</div>
                    <div className="period-info">
                        <span>{liveData.periodInfo}</span>
                        <span className="time-left">{timeLeftFormatted}</span>
                    </div>
                </div>
                <div className="team team-b">
                    <img src={`/images/team-logos/${liveData.teamB?.toLowerCase() || "unknown"}.png`} alt={`${liveData.teamB_name} Logo`} />
                    <span className="team-name">{liveData.teamB_name || "Neznámý tým B"}</span>
                    <span className="scorers">{liveData.scorerB?.length ? liveData.scorerB.join(", ") : "No scorer details"}</span>
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
