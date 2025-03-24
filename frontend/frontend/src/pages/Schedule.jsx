import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import '../pages/schedule.css';

function Schedule() {
    const [mergedMatches, setMergedMatches] = useState([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
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

                const scheduleStartDate = new Date(2025, 2, 21);
                const mergedRounds = [];
                let lowerIndex = 0, upperIndex = 0;

                while (lowerIndex < lowerData.length || upperIndex < upperData.length) {
                    const roundDate = new Date(scheduleStartDate);
                    roundDate.setDate(scheduleStartDate.getDate() + mergedRounds.length * 7);

                    const roundMatches = [];

                    if (lowerIndex < lowerData.length) {
                        roundMatches.push({
                            ...lowerData[lowerIndex],
                            type: "lower",
                        });
                        lowerIndex++;
                    }

                    if (upperIndex < upperData.length) {
                        roundMatches.push({
                            ...upperData[upperIndex],
                            type: "upper",
                        });
                        upperIndex++;
                    }

                    mergedRounds.push({
                        round: mergedRounds.length + 1,
                        date: roundDate,
                        matches: roundMatches,
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
            <div className="grid-of-rounds">
                {mergedMatches.map((roundData) => (
                    <div key={roundData.round} className="round-card">
                        <h4 className="round-title">{`Kolo ${roundData.round} – ${roundData.date.toLocaleDateString("cs-CZ")}`}</h4>
                        <div className="match-grid">
                            {roundData.matches.map((match, index) => (
                                <div className="match-card" key={index}>
                                    <div className="match-teams">
                                        <strong>{match.teamA_name}</strong>
                                        <span className="vs-label">vs</span>
                                        <strong>{match.teamB_name}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Schedule;
