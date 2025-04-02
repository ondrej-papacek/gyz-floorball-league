import React, { useEffect, useState } from 'react';
import { getPlayoffRounds } from '../services/playoffService';
import PlayoffBracket from '../components/PlayoffBracket';
import './playoffView.css';

const PlayoffView = ({ year }) => {
    const [lowerRounds, setLowerRounds] = useState([]);
    const [upperRounds, setUpperRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlayoffs = async () => {
            try {
                setLoading(true);
                const [lower, upper] = await Promise.all([
                    getPlayoffRounds(year, 'lower'),
                    getPlayoffRounds(year, 'upper'),
                ]);
                setLowerRounds(Object.entries(lower).map(([round, matches]) => ({ round, matches })));
                setUpperRounds(Object.entries(upper).map(([round, matches]) => ({ round, matches })));
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
                <PlayoffBracket rounds={lowerRounds} />
            </div>

            <div className="bracket-section">
                <h3 className="division-title">Vyšší gymnázium</h3>
                <PlayoffBracket rounds={upperRounds} />
            </div>
        </div>
    );
};

export default PlayoffView;
