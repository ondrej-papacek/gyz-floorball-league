import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import PlayoffBracket from '../components/PlayoffBracket';
import './playoffView.css';

const PlayoffView = ({ year }) => {
    const [lowerMatches, setLowerMatches] = useState([]);
    const [upperMatches, setUpperMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBracketMatches = async (year, division) => {
        const snap = await getDocs(
            collection(db, 'leagues', `${year}_${division}`, 'playoff', 'rounds', 'bracketMatches')
        );
        return snap.docs.map(doc => doc.data());
    };

    const sanitizeMatches = (matches) =>
        matches.filter(
            m =>
                m &&
                typeof m.id === 'string' &&
                typeof m.name === 'string' &&
                Array.isArray(m.participants) &&
                m.participants.length === 2 &&
                typeof m.participants[0]?.name === 'string' &&
                typeof m.participants[1]?.name === 'string'
        );

    useEffect(() => {
        const fetchPlayoffs = async () => {
            setLoading(true);
            try {
                const [lower, upper] = await Promise.all([
                    fetchBracketMatches(year, 'lower'),
                    fetchBracketMatches(year, 'upper')
                ]);

                setLowerMatches(sanitizeMatches(lower));
                setUpperMatches(sanitizeMatches(upper));
                setError('');
            } catch (err) {
                console.error('Error fetching playoff bracket matches:', err);
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
