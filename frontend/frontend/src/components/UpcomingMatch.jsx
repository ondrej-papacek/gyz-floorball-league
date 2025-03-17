import React, { useEffect, useState } from 'react';
import './UpcomingMatch.css';

const UpcomingMatch = () => {
    const [match, setMatch] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/schedule/upcoming-match?year=2025`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                console.log("Received Upcoming Match Data:", data);

                if (data.lowerMatch && data.upperMatch) {
                    setMatch(data);
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
            {match ? (
                <div>
                    <p><strong>Datum:</strong> {match.date}</p>
                    <p><strong>Nižší gymnázium:</strong> {match.lowerMatch.teamA} vs {match.lowerMatch.teamB}</p>
                    <p><strong>Vyšší gymnázium:</strong> {match.upperMatch.teamA} vs {match.upperMatch.teamB}</p>
                </div>
            ) : (
                <p>Žádné nadcházející zápasy nebyly nalezeny.</p>
            )}
        </div>
    );
};

export default UpcomingMatch;
