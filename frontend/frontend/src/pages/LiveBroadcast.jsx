import React, { useState, useEffect } from 'react';
import './liveBroadcast.css';
import { subscribeToLiveBroadcast } from '../services/liveBroadcastService';

function LiveBroadcast() {
    const [liveData, setLiveData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const unsubscribe = subscribeToLiveBroadcast((data) => {
            if (data) {
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

    const formatScorers = (scorers = []) => {
        return scorers.length > 0
            ? scorers.map(s => `${s.name} (${s.goals})`).join(", ")
            : "No scorer details";
    };

    const timeLeftFormatted = timeLeft > 0
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
        : "0:00";

    if (!liveData || liveData.id === "placeholder") {
        return <p>Momentálně není žádný živý přenos.</p>;
    }

    return (
        <div className="live-match-container">
            <div className="live-match-background">
                <h2>ŽIVÝ ZÁPAS</h2>
                <div className="match-info">
                    <span>{formatDate(liveData.date)}</span>
                </div>
                <div className="scoreboard">
                    <div className="team team-a">
                        <img src={`/team-logos/${liveData.teamA?.toLowerCase() || "unknown"}.png`} alt={`${liveData.teamA_name} Logo`} />
                        <span className="team-name">{liveData.teamA_name || "Neznámý tým A"}</span>
                        <span className="scorers">{formatScorers(liveData.scorerA)}</span>
                    </div>
                    <div className="score-info">
                        <div className="score">{`${liveData.scoreA} - ${liveData.scoreB}`}</div>
                        <div className="period-info">
                            <span>{liveData.periodInfo}</span>
                            <span className="time-left">{timeLeftFormatted}</span>
                        </div>
                    </div>
                    <div className="team team-b">
                        <img src={`/team-logos/${liveData.teamB?.toLowerCase() || "unknown"}.png`} alt={`${liveData.teamB_name} Logo`} />
                        <span className="team-name">{liveData.teamB_name || "Neznámý tým B"}</span>
                        <span className="scorers">{formatScorers(liveData.scorerB)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
