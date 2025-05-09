﻿import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import './liveMatch.css';
import { sanitizeTeamName } from '../utils/teamUtils';

const formatDate = (timestamp) => {
    return timestamp?.seconds
        ? new Date(timestamp.seconds * 1000).toLocaleString("cs-CZ")
        : "Neznámé datum";
};

function LiveMatch() {
    const [liveData, setLiveData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'liveBroadcast', 'currentMatch'), async (docSnap) => {
            if (!docSnap.exists()) {
                setLiveData(null);
                return;
            }

            const data = docSnap.data();

            if (!data.matchRefPath || data.id === 'placeholder') {
                setLiveData(null);
                return;
            }

            try {
                const matchSnap = await getDoc(doc(db, data.matchRefPath));
                const fullData = { ...matchSnap.data(), ...data };
                setLiveData(fullData);
                setTimeLeft(typeof fullData.timeLeft === 'number' ? fullData.timeLeft : 0);
            } catch (err) {
                console.error("Chyba při načtení zápasu:", err);
                setLiveData(data);
            }
        });

        return () => unsubscribe();
    }, []);

    const formatScorers = (scorers) => {
        if (Array.isArray(scorers)) {
            return scorers.map(s => `${s.name} (${s.goals})`).join(", ");
        }
        return "Žádné detaily o střelcích gólů";
    };

    const timeLeftFormatted = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

    if (!liveData || liveData.id === 'placeholder') {
        return (
            <div className="live-match-component-container">
                <h2>Momentálně není žádný živý zápas</h2>
            </div>
        );
    }

    return (
        <div className="live-match-component-container">
            <div className="live-match-background">
                <h2>ŽIVÝ ZÁPAS</h2>
                <div className="match-info">
                    <span>{formatDate(liveData.date)}</span>
                </div>
                <div className="scoreboard">
                    <div className="live-team team-a">
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
                    <div className="live-team team-b">
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

export default LiveMatch;
