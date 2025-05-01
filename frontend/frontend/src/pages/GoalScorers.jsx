import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../pages/goalScorers.css';

function GoalScorers() {
    const [scorersLower, setScorersLower] = useState([]);
    const [scorersUpper, setScorersUpper] = useState([]);

    useEffect(() => {
        const fetchGoalScorers = async () => {
            try {
                const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
                const activeLeagues = leaguesSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(l => l.status !== 'archived');

                const latestYear = Math.max(
                    ...activeLeagues.map(l => parseInt(l.year)).filter(Boolean)
                );

                const lower = activeLeagues.find(l => l.year == latestYear && l.division === 'lower');
                const upper = activeLeagues.find(l => l.year == latestYear && l.division === 'upper');

                if (!lower && !upper) return;

                if (lower) {
                    const lowerSnap = await getDocs(collection(db, `leagues/${lower.id}/goalScorers`));
                    const lowerData = lowerSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setScorersLower(mergeGoalScorers(lowerData));
                }

                if (upper) {
                    const upperSnap = await getDocs(collection(db, `leagues/${upper.id}/goalScorers`));
                    const upperData = upperSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setScorersUpper(mergeGoalScorers(upperData));
                }

            } catch (error) {
                console.error("Error fetching goal scorers:", error);
            }
        };

        fetchGoalScorers();
    }, []);

    const mergeGoalScorers = (scorers) => {
        const map = new Map();

        for (const scorer of scorers) {
            const key = `${scorer.name}_${scorer.team}`; // Unique key: name + team
            if (map.has(key)) {
                map.get(key).goals += scorer.goals;
            } else {
                map.set(key, { ...scorer });
            }
        }

        const mergedArray = Array.from(map.values());
        mergedArray.sort((a, b) => b.goals - a.goals); // Sort descending
        return mergedArray;
    };

    const renderScorerRow = (scorer, index) => (
        <tr key={index}>
            <td>{scorer.name}</td>
            <td>{scorer.goals}</td>
            <td>{scorer.team}</td>
        </tr>
    );

    return (
        <div className="goal-scorers-page">
            <h2 className="goal-scorers-title">Střelci</h2>

            {/* Nižší gymnázium Section */}
            <div className="gym-section">
                <h3 className="gym-title">Nižší gymnázium</h3>
                <table className="goal-scorers-table">
                    <thead>
                    <tr>
                        <th>Jméno a příjmení</th>
                        <th>Počet gólů</th>
                        <th>Tým</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scorersLower.length > 0 ? (
                        scorersLower.map(renderScorerRow)
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>Žádné údaje</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Vyšší gymnázium Section */}
            <div className="gym-section">
                <h3 className="gym-title">Vyšší gymnázium</h3>
                <table className="goal-scorers-table">
                    <thead>
                    <tr>
                        <th>Jméno a příjmení</th>
                        <th>Počet gólů</th>
                        <th>Tým</th>
                    </tr>
                    </thead>
                    <tbody>
                    {scorersUpper.length > 0 ? (
                        scorersUpper.map(renderScorerRow)
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>Žádné údaje</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GoalScorers;
