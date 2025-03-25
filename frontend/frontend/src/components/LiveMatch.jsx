import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import './liveMatch.css';

const formatDate = (timestamp) => {
    return timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleString() : "Unknown";
};

function LiveMatch() {
    const [matchData, setMatchData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const broadcastRef = doc(db, 'liveBroadcast', 'currentMatch');

        const unsubscribe = onSnapshot(broadcastRef, async (docSnapshot) => {
            if (!docSnapshot.exists()) {
                console.error("No live match found.");
                setMatchData(null);
                return;
            }

            const liveData = docSnapshot.data();

            if (!liveData.matchRefPath) {
                console.error("matchRefPath is missing from liveBroadcast/currentMatch");
                setMatchData(liveData);
                return;
            }

            try {
                const matchDocRef = doc(db, liveData.matchRefPath);
                const matchSnap = await getDoc(matchDocRef);

                if (!matchSnap.exists()) {
                    console.error("Match reference not found.");
                    setMatchData(liveData);
                    return;
                }

                const fullMatchData = { ...matchSnap.data(), ...liveData };
                setMatchData(fullMatchData);

                if (typeof fullMatchData.timeLeft === "number") {
                    setTimeLeft(fullMatchData.timeLeft);
                } else {
                    setTimeLeft(0);
                }
            } catch (error) {
                console.error("Error loading matchRefPath:", error);
                setMatchData(liveData);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let timer;

        if (matchData?.status === "live" && timeLeft > 0) {
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
    }, [matchData, timeLeft]);

    const timeLeftFormatted = timeLeft > 0
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
        : "0:00";

    if (!matchData) {
        return <p>Loading live match...</p>;
    }

    return (
        <div className="live-match-component-container">
            <div className="live-match-background">
                <h2>ŽIVÝ ZÁPAS</h2>
                <div className="match-info">
                    <span>{formatDate(matchData.date)}</span>
                </div>
                <div className="scoreboard">
                    <div className="live-team team-a">
                        <img src={`team-logos/${matchData.teamA?.toLowerCase() || "unknown"}.png`}
                             alt={`${matchData.teamA} Logo`}/>
                        <span className="team-name">{matchData.teamA_name}</span>
                        <span
                            className="scorers">{matchData.scorerA?.length ? matchData.scorerA.join(", ") : "No scorer details"}</span>
                    </div>
                    <div className="score-info">
                        <div className="score">{`${matchData.scoreA} - ${matchData.scoreB}`}</div>
                        <div className="period-info">
                            <span>{matchData.periodInfo}</span>
                            <span className="time-left">{timeLeftFormatted}</span>
                        </div>
                    </div>
                    <div className="live-team team-b">
                        <img src={`/team-logos/${matchData.teamB?.toLowerCase() || "unknown"}.png`}
                             alt={`${matchData.teamB} Logo`}/>
                        <span className="team-name">{matchData.teamB_name}</span>
                        <span
                            className="scorers">{matchData.scorerB?.length ? matchData.scorerB.join(", ") : "No scorer details"}</span>
                    </div>
                    </div>
                </div>
            </div>
    );
}

export default LiveMatch;
