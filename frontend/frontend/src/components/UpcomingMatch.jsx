import React, { useState, useEffect } from 'react';
import './UpcomingMatch.css';

function UpcomingMatch() {
    const [match, setMatch] = useState(null);

    // Fetch the next match from backend
    useEffect(() => {
        fetch('http://localhost:5000/api/matches/upcoming')  // Update this URL with your backend's upcoming match endpoint
            .then((response) => response.json())
            .then((data) => {
                // Assuming the backend returns the next match object
                setMatch(data);
            })
            .catch((error) => console.error('Error fetching upcoming match:', error));
    }, []);

    return (
        <section className="upcoming-match">
            <h2>Upcoming Match</h2>
            {match ? (
                <div className="match-details">
                    <p>
                        <strong>{match.team1}</strong> vs <strong>{match.team2}</strong>
                    </p>
                    <p>Date: {new Date(match.date).toLocaleDateString()}</p>
                    <p>Time: {match.time}</p>
                    <p>Location: {match.location}</p>
                </div>
            ) : (
                <p>No upcoming match scheduled</p>
            )}
        </section>
    );
}

export default UpcomingMatch;
