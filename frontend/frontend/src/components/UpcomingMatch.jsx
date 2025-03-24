import React, { useEffect, useState } from 'react';
import './UpcomingMatch.css';

const UpcomingMatch = () => {
    const [rounds, setRounds] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule/upcoming-match?year=2025`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Received Upcoming Match Data:", data);

                if (Array.isArray(data) && data.length > 0) {
                    setRounds(data);
                } else {
                    setError('Invalid match data received.');
                }
            } catch (err) {
                setError('Failed to fetch upcoming matches.');
                console.error('Error fetching match:', err);
            }
        };

        fetchMatch();
    }, []);

    return (
        <div className="upcoming-match">
            <h2>Nadcházející zápasy</h2>
            {error && <p className="error">{error}</p>}

            {rounds.length > 0 ? (
                <div className="upcoming-rounds">
                    {rounds.map((round, index) => (
                        <div key={index} className="round-box">
                            <p className="round-date"><strong>Datum:</strong> {new Date(round.date).toLocaleDateString("cs-CZ")}</p>
                            <p><strong>Nižší gymnázium:</strong> {round.lowerMatch.teamA_name} vs {round.lowerMatch.teamB_name}</p>
                            <p><strong>Vyšší gymnázium:</strong> {round.upperMatch.teamA_name} vs {round.upperMatch.teamB_name}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Žádné nadcházející zápasy nebyly nalezeny.</p>
            )}
        </div>
    );
};

export default UpcomingMatch;
