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
            console.log("LiveData from Firestore:", liveData);
            console.log("matchRef Type:", typeof liveData.matchRef, "matchRef Value:", liveData.matchRef);
            console.log("matchRef ID:", liveData.matchRef.id ? liveData.matchRef.id : "No ID");
            console.log("matchRef Path:", liveData.matchRef.path ? liveData.matchRef.path : "No Path");

            const parsedTimeLeft = typeof liveData.timeLeft === "string"
                ? parseInt(liveData.timeLeft, 10)
                : liveData.timeLeft || 0;

            setTimeLeft(parsedTimeLeft);

            if (!liveData.matchRef) {
                console.error("No matchRef found in Firestore document.");
                setMatchData(null);
                return;
            }

            try {
                console.log("Fetching match document from:", liveData.matchRef.path);

                const matchSnap = await getDoc(liveData.matchRef); // Use Firestore reference directly

                if (!matchSnap.exists()) {
                    console.error("Match reference document does not exist.");
                    setMatchData(null);
                    return;
                }

                console.log("Match data fetched:", matchSnap.data());
                setMatchData({ ...matchSnap.data(), ...liveData });

            } catch (error) {
                console.error("Firestore Reference Error:", error);
            }
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

    const timeLeftFormatted = timeLeft > 0
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
        : "0:00";

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
                        <span className="time-left">{timeLeftFormatted}</span>
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
