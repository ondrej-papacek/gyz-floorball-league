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
                }));

                const upperQuery = query(
                    collection(db, "leagues/2025_upper/matches"),
                    orderBy("round")
                );
                const upperSnapshot = await getDocs(upperQuery);
                const upperData = upperSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const mergedRounds = {};
                lowerData.forEach((match) => {
                    const roundKey = match.round;
                    if (!mergedRounds[roundKey]) {
                        mergedRounds[roundKey] = { date: match.date, matches: [] };
                    }
                    mergedRounds[roundKey].matches.push(match);
                });

                upperData.forEach((match) => {
                    const roundKey = match.round;
                    if (!mergedRounds[roundKey]) {
                        mergedRounds[roundKey] = { date: match.date, matches: [] };
                    }
                    mergedRounds[roundKey].matches.push(match);
                });

                const sortedMerged = Object.entries(mergedRounds)
                    .map(([round, data]) => ({
                        round,
                        date: new Date(data.date).toLocaleDateString("cs-CZ"),
                        matches: data.matches,
                    }))
                    .sort((a, b) => a.round - b.round);

                setMergedMatches(sortedMerged);
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
                            <strong>{roundData.date}</strong>
                        </p>
                        {roundData.matches.map((match, index) => (
                            <p key={index}>
                                <strong>{match.teamA_name}</strong> vs <strong>{match.teamB_name}</strong>
                            </p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Schedule;
