import React, { useState, useEffect } from 'react';
import './liveBroadcast.css';
import { db } from '../services/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { sanitizeTeamName } from '../utils/teamUtils';

function LiveBroadcast() {
    const [liveData, setLiveData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'liveBroadcast', 'currentMatch'), (snap) => {
            const data = snap.data();
            if (data) {
                setLiveData(data);
                setTimeLeft(typeof data.timeLeft === 'number' ? data.timeLeft : 0);
            }
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        let timer;
        if (liveData?.status === "live" && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [liveData, timeLeft]);

    const formatDate = (timestamp) => {
        return timestamp?.seconds
            ? new Date(timestamp.seconds * 1000).toLocaleString("cs-CZ")
            : "Neznámé datum";
    };

    const timeLeftFormatted = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

    const formatScorers = (scorers = []) => {
        return scorers.length > 0
            ? scorers.map(s => `${s.name} (${s.goals})`).join(", ")
            : "Žádné detaily o střelcích gólů";
    };

    if (!liveData || liveData.id === "placeholder") {
        return (
            <div className="live-match-container">
                <h2>Momentálně není žádný živý přenos</h2>
            </div>
        );
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
                        <img
                            src={`/team-logos/${sanitizeTeamName(liveData.teamA_name)}.png`}
                            alt={`Logo týmu ${liveData.teamA_name}`}
                        />
                        <span className="team-name">{liveData.teamA_name}</span>
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
                        <img
                            src={`/team-logos/${sanitizeTeamName(liveData.teamB_name)}.png`}
                            alt={`Logo týmu ${liveData.teamB_name}`}
                        />
                        <span className="team-name">{liveData.teamB_name}</span>
                        <span className="scorers">{formatScorers(liveData.scorerB)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveBroadcast;
