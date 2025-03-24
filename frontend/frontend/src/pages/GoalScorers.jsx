import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import '../pages/goalScorers.css';

function GoalScorers() {
    const [scorersLower, setScorersLower] = useState([]);
    const [scorersUpper, setScorersUpper] = useState([]);

    // Fetch goal scorers from Firestore
    useEffect(() => {
        const fetchGoalScorers = async () => {
            try {
                const lowerQuerySnapshot = await getDocs(collection(db, "leagues/2025_lower/goalScorers"));
                const upperQuerySnapshot = await getDocs(collection(db, "leagues/2025_upper/goalScorers"));

                const lowerData = lowerQuerySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                const upperData = upperQuerySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Sort by goals (descending)
                lowerData.sort((a, b) => b.goals - a.goals);
                upperData.sort((a, b) => b.goals - a.goals);

                setScorersLower(lowerData);
                setScorersUpper(upperData);
            } catch (error) {
                console.error("Error fetching goal scorers:", error);
            }
        };

        fetchGoalScorers();
    }, []);

    const renderScorerRow = (scorer) => (
        <tr key={scorer.id}>
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
