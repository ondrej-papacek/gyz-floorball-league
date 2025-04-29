import React, { useEffect, useState } from 'react';
import { getPlayoffRounds } from '../services/playoffService';
import PlayoffBracket from '../components/PlayoffBracket';
import './playoffView.css';

const PlayoffView = ({ year }) => {
    const [lowerMatches, setLowerMatches] = useState([]);
    const [upperMatches, setUpperMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const transformData = (rounds) => {
        const allMatches = [];
        for (const [roundName, matches] of Object.entries(rounds)) {
            matches.forEach((match, idx) => {
                allMatches.push({
                    id: `${roundName}_${idx}`,
                    name: roundName,
                    tournamentRoundText: roundName,
                    startTime: '2025-04-21', // ⚡ you can improve later
                    state: 'DONE',
                    participants: [
                        {
                            id: match.teamA || 'teamA',
                            name: match.teamA || '-',
                            resultText: match.scoreA?.toString() || '-',
                            isWinner: match.scoreA > match.scoreB
                        },
                        {
                            id: match.teamB || 'teamB',
                            name: match.teamB || '-',
                            resultText: match.scoreB?.toString() || '-',
                            isWinner: match.scoreB > match.scoreA
                        }
                    ]
                });
            });
        }
        return allMatches;
    };

    useEffect(() => {
        const fetchPlayoffs = async () => {
            try {
                setLoading(true);
                const [lower, upper] = await Promise.all([
                    getPlayoffRounds(year, 'lower'),
                    getPlayoffRounds(year, 'upper'),
                ]);
                setLowerMatches(transformData(lower));
                setUpperMatches(transformData(upper));
                setError('');
            } catch (err) {
                console.error(err);
                setError('Nepodařilo se načíst data playoff.');
            } finally {
                setLoading(false);
            }
        };

        fetchPlayoffs();
    }, [year]);

    if (loading) return <div className="playoff-view-page"><p>Načítání...</p></div>;
    if (error) return <div className="playoff-view-page error">{error}</div>;

    return (
        <div className="playoff-view-page">
            <h2 className="playoff-title">Playoff {year}</h2>

            <div className="bracket-section">
                <h3 className="division-title">Nižší gymnázium</h3>
                <PlayoffBracket matches={lowerMatches} />
            </div>

            <div className="bracket-section">
                <h3 className="division-title">Vyšší gymnázium</h3>
                <PlayoffBracket matches={upperMatches} />
            </div>
        </div>
    );
};

export default PlayoffView;
