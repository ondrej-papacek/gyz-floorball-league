import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
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
        const broadcastRef = doc(db, 'liveBroadcast', 'currentMatch');

        const unsubscribe = onSnapshot(broadcastRef, async (docSnapshot) => {
            if (!docSnapshot.exists()) {
                console.error("No live match found.");
                setLiveData(null);
                return;
            }

            const broadcastData = docSnapshot.data();

            if (!broadcastData.matchRefPath) {
                console.error("matchRefPath missing in currentMatch.");
                setLiveData(broadcastData);
                return;
            }

            try {
                const matchDocRef = doc(db, broadcastData.matchRefPath);
                const matchSnap = await getDoc(matchDocRef);

                if (!matchSnap.exists()) {
                    console.error("Referenced match not found.");
                    setLiveData(broadcastData);
                    return;
                }

                const fullMatchData = { ...matchSnap.data(), ...broadcastData };
                setLiveData(fullMatchData);

                setTimeLeft(
                    typeof fullMatchData.timeLeft === "number" ? fullMatchData.timeLeft : 0
                );
            } catch (err) {
                console.error("Failed to fetch full match data:", err);
                setLiveData(broadcastData);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let timer;

        if (liveData?.status === "live" && timeLeft > 0) {
            timer = setInterval(async () => {
                const newTime = timeLeft - 1;
                setTimeLeft(newTime);

                try {
                    const ref = doc(db, 'liveBroadcast', 'currentMatch');
                    await updateDoc(ref, { timeLeft: newTime });
                } catch (error) {
                    console.error("Failed to update timeLeft in Firestore:", error);
                }
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [liveData, timeLeft]);

    const timeLeftFormatted = timeLeft > 0
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
        : "0:00";

    if (!liveData || liveData.id === "placeholder") {
        return (
            <div className="live-match-component-container">
                <h2>Momentálně není žádný živý zápas</h2>
            </div>
        );
    }

    const formatScorers = (scorers) => {
        if (Array.isArray(scorers)) {
            return scorers.map(s => `${s.name} (${s.goals})`).join(", ");
        } else if (typeof scorers === 'string') {
            return scorers;
        }
        return "Žádné detaily o střelcích gólů";
    };

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
                            src={`/team-logos/${sanitizeTeamName(liveData.teamA)}.png`}
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
                            src={`/team-logos/${sanitizeTeamName(liveData.teamB)}.png`}
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
