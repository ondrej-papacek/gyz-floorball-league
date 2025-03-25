import React, { useEffect, useState } from 'react';
import './manageMatches.css';

const ManageMatches = ({ year, division }) => {
    const [matches, setMatches] = useState([]);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/matches/${year}/${division}`);
                const data = await response.json();
                setMatches(data);
            } catch (error) {
                console.error('Chyba při načítání zápasů:', error);
            }
        };

        fetchMatches();
    }, [year, division]);

    const updateScore = async (matchId, teamAScore, teamBScore) => {
        try {
            await fetch(`http://localhost:5000/api/matches/${year}/${division}/${matchId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scoreA: teamAScore, scoreB: teamBScore }),
            });

            setMatches(matches.map(match =>
                match.id === matchId ? { ...match, scoreA: teamAScore, scoreB: teamBScore } : match
            ));
        } catch (error) {
            console.error('Chyba při aktualizaci skóre:', error);
        }
    };

    return (
        <div className="manage-matches-page">
            <h1>Správa Zápasů</h1>
            {matches.map((match) => (
                <div key={match.id} className="match-item">
                    <span>{match.home} vs {match.away}</span>
                    <div>
                        <input
                            type="number"
                            value={match.scoreA}
                            onChange={(e) => updateScore(match.id, parseInt(e.target.value, 10), match.scoreB)}
                        />
                        <input
                            type="number"
                            value={match.scoreB}
                            onChange={(e) => updateScore(match.id, match.scoreA, parseInt(e.target.value, 10))}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ManageMatches;
