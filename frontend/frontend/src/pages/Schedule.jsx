import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import '../pages/schedule.css';

function Schedule() {
    const [lowerMatches, setLowerMatches] = useState([]);
    const [upperMatches, setUpperMatches] = useState([]);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // Fetch Lower Gymnasium Matches
                const lowerQuery = query(
                    collection(db, 'leagues/2025_lower/matches'),
                    orderBy('round')
                );
                const lowerSnapshot = await getDocs(lowerQuery);
                const lowerData = lowerSnapshot.docs.map((doc) => doc.data());
                setLowerMatches(lowerData);

                // Fetch Upper Gymnasium Matches
                const upperQuery = query(
                    collection(db, 'leagues/2025_upper/matches'),
                    orderBy('round')
                );
                const upperSnapshot = await getDocs(upperQuery);
                const upperData = upperSnapshot.docs.map((doc) => doc.data());
                setUpperMatches(upperData);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            }
        };

        fetchSchedule();
    }, []);

    const renderMatches = (matches) => {
        const rounds = matches.reduce((acc, match) => {
            acc[match.round] = acc[match.round] || [];
            acc[match.round].push(match);
            return acc;
        }, {});

        return Object.entries(rounds).map(([round, matches]) => (
            <div key={round} className="round">
                <h4>Kolo {round}</h4>
                {matches.map((match, index) => (
                    <p key={index}>
                        {match.teamA} vs {match.teamB}
                    </p>
                ))}
            </div>
        ));
    };

    return (
        <div className="schedule-page">
            <h2 className="schedule-title">Rozpis zápasů</h2>

            <div className="gym-section">
                <h3 className="gym-title">Nižší gymnázium</h3>
                <div className="rounds-container">{renderMatches(lowerMatches)}</div>
            </div>

            <div className="gym-section">
                <h3 className="gym-title">Vyšší gymnázium</h3>
                <div className="rounds-container">{renderMatches(upperMatches)}</div>
            </div>
        </div>
    );
}

export default Schedule;
