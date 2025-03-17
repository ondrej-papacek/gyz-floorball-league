import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import './liveMatch.css';

const formatDate = (timestamp) => {
    return timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleString() : "Unknown";
};

function LiveMatch() {
    const [matchData, setMatchData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const matchDoc = doc(db, 'liveBroadcast', 'currentMatch');

        const unsubscribe = onSnapshot(matchDoc, async (docSnapshot) => {
            if (!docSnapshot.exists()) {
                console.error("No live match found.");
                setMatchData(null);
                return;
            }

            const liveData = docSnapshot.data();

            if (!liveData.matchRef) {
                console.error("No match reference found.");
                setMatchData(null);
                return;
            }

            // ✅ Fetch the referenced match document
            const matchRef = doc(db, liveData.matchRef.path); // Ensures correct reference type
            const matchSnap = await getDoc(matchRef);

            if (!matchSnap.exists()) {
                console.error("Match reference not found.");
                setMatchData(null);
                return;
            }

            const matchInfo = matchSnap.data();
            setMatchData({ ...matchInfo, ...liveData });
            setTimeLeft(liveData.timeLeft || 0);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let timer;
        if (matchData && matchData.status === "live" && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
            }, 1000);
        }

        return () => clearInterval(timer);
    }, [matchData, timeLeft]);

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
                    <img src={`/images/team-logos/${matchData.teamA.toLowerCase()}.png`} alt={`${matchData.teamA} Logo`} />
                    <span className="team-name">{matchData.teamA_name}</span>
                    <span className="scorers">{matchData.scorerA?.length ? matchData.scorerA.join(", ") : "No scorer details"}</span>
                </div>
                <div className="score-info">
                    <div className="score">{`${matchData.scoreA} - ${matchData.scoreB}`}</div>
                    <div className="period-info">
                        <span>{matchData.periodInfo}</span>
                        <span className="time-left">{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</span>
                    </div>
                </div>
                <div className="team team-b">
                    <img src={`/images/team-logos/${matchData.teamB.toLowerCase()}.png`} alt={`${matchData.teamB} Logo`} />
                    <span className="team-name">{matchData.teamB_name}</span>
                    <span className="scorers">{matchData.scorerB?.length ? matchData.scorerB.join(", ") : "No scorer details"}</span>
                </div>
            </div>
        </div>
    );
}

export default LiveMatch;
