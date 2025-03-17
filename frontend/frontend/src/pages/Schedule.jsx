import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import '../pages/schedule.css';

function Schedule() {
    const [mergedMatches, setMergedMatches] = useState([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // Fetch lower division matches
                const lowerQuery = query(
                    collection(db, "leagues/2025_lower/matches"),
                    orderBy("round")
                );
                const lowerSnapshot = await getDocs(lowerQuery);
                const lowerData = lowerSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    division: "lower",
                }));

                // Fetch upper division matches
                const upperQuery = query(
                    collection(db, "leagues/2025_upper/matches"),
                    orderBy("round")
                );
                const upperSnapshot = await getDocs(upperQuery);
                const upperData = upperSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    division: "upper",
                }));

                // Merge rounds with correct pairing
                const maxRounds = Math.max(lowerData.length, upperData.length);
                const mergedRounds = [];

                for (let i = 0; i < maxRounds; i++) {
                    const roundMatches = [];

                    if (lowerData[i]) {
                        roundMatches.push({
                            ...lowerData[i],
                            type: "lower",
                        });
                    }
                    if (upperData[i]) {
                        roundMatches.push({
                            ...upperData[i],
                            type: "upper",
                        });
                    }

                    mergedRounds.push({
                        round: i + 1,
                        matches: roundMatches,
                        date: lowerData[i]?.date || upperData[i]?.date,
                    });
                }

                setMergedMatches(mergedRounds);
            } catch (error) {
                console.error("Error fetching schedule:", error);
            }
        };

        fetchSchedule();
    }, []);

    return (
        <div className="schedule-page">
            <h2 className="schedule-title">Rozpis zápasů</h2>
            <div className="rounds-container">
                {mergedMatches.map((roundData) => (
                    <div key={roundData.round} className="round">
                        <h4>Kolo {roundData.round}</h4>
                        <p className="match-date">
                            <strong>{new Date(roundData.date.toDate()).toLocaleDateString("cs-CZ")}</strong>
                        </p>
                        {roundData.matches.map((match, index) => (
                            <p key={index} className={match.type === "lower" ? "match-lower" : "match-upper"}>
                                <strong>{match.teamA_name}</strong> vs <strong>{match.teamB_name}</strong>
                                <span className={match.type === "lower" ? "lower-tag" : "upper-tag"}>
                    ({match.type === "lower" ? "Lower Gymnasium" : "Upper Gymnasium"})
                </span>
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Schedule;
