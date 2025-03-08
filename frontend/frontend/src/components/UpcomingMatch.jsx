import React, { useEffect, useState } from 'react';
import './UpcomingMatch.css';

const UpcomingMatch = () => {
    const [match, setMatch] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/schedule/upcoming-match');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setMatch(data);
            } catch (err) {
                setError('Failed to fetch upcoming match.');
                console.error('Error fetching match:', err);
            }
        };

        fetchMatch();
    }, []);

    return (
        <div className="upcoming-match">
            <h2>Upcoming Match</h2>
            {error && <p className="error">{error}</p>}
            {match ? (
                <div>
                    <p><strong>{match.teamA}</strong> vs <strong>{match.teamB}</strong></p>
                    <p>Date: {new Date(match.date).toLocaleDateString('cs-CZ')}</p>
                </div>
            ) : (
                <p>No upcoming match found.</p>
            )}
        </div>
    );
};

export default UpcomingMatch;
