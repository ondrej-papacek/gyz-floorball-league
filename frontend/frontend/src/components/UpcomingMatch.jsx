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

                console.log("Received Upcoming Match Data:", data);

                if (data.date) {
                    setMatch(data);
                } else {
                    setError('Invalid match data received.');
                }
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
                    <p><strong>{match.teamA_name}</strong> vs <strong>{match.teamB_name}</strong></p>
                    <p>Date: {new Date(match.date).toLocaleDateString('cs-CZ')}</p>
                </div>
            ) : (
                <p>No upcoming match found.</p>
            )}
        </div>
    );
};

export default UpcomingMatch;
