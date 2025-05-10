import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../pages/goalScorers.css';

function GoalScorers() {
    const [scorersLower, setScorersLower] = useState([]);
    const [scorersUpper, setScorersUpper] = useState([]);

    const fetchGoalScorers = async () => {
        try {
            const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
            const activeLeagues = leaguesSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(l => l.status !== 'archived');

            const latestYear = Math.max(
                ...activeLeagues.map(l => parseInt(l.year)).filter(Boolean)
            );

            const divisions = ['lower', 'upper'];

            for (const div of divisions) {
                const league = activeLeagues.find(l => l.year == latestYear && l.division === div);
                if (!league) continue;

                const seasonPath = `leagues/${league.id}`;
                const seasonScorersSnap = await getDocs(collection(db, `${seasonPath}/goalScorers`));
                const seasonScorers = seasonScorersSnap.docs.map(doc => doc.data());

                const playoffScorersSnap = await getDocs(collection(db, `${seasonPath}/playoff/rounds/goalScorers`));
                const playoffMatches = playoffScorersSnap.docs.map(doc => doc.data());

                const playoffScorers = [];
                for (const match of playoffMatches) {
                    for (const s of [...(match.teamA || []), ...(match.teamB || [])]) {
                        playoffScorers.push(s);
                    }
                }

                const combined = mergeGoalScorers([...seasonScorers, ...playoffScorers]);

                if (div === 'lower') setScorersLower(combined);
                if (div === 'upper') setScorersUpper(combined);
            }
        } catch (error) {
            console.error("Error fetching goal scorers:", error);
        }
    };

    useEffect(() => {
        fetchGoalScorers();
    }, []);

    const mergeGoalScorers = (scorers) => {
        const map = new Map();
        for (const scorer of scorers) {
            const key = `${scorer.name}_${scorer.team_id}`;
            if (map.has(key)) {
                map.get(key).goals += scorer.goals;
            } else {
                map.set(key, {
                    ...scorer,
                    team: scorer.team || scorer.team_id
                });
            }
        }

        const mergedArray = Array.from(map.values());
        mergedArray.sort((a, b) => b.goals - a.goals);
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
            <button onClick={fetchGoalScorers}>Načíst znovu</button>

            {/* Nižší gymnázium */}
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
                        <tr><td colSpan="3" style={{ textAlign: "center" }}>Žádné údaje</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Vyšší gymnázium */}
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
                        <tr><td colSpan="3" style={{ textAlign: "center" }}>Žádné údaje</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GoalScorers;
