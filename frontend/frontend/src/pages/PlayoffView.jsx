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
        const path = `leagues/${year}_${division}/playoff/bracketMatches`;
        const snap = await getDocs(collection(db, path));
        return snap.docs.map(doc => doc.data());
    };

    useEffect(() => {
        const fetchPlayoffs = async () => {
            setLoading(true);
            try {
                const [lower, upper] = await Promise.all([
                    fetchBracketMatches(year, 'lower'),
                    fetchBracketMatches(year, 'upper')
                ]);

                setLowerMatches(lower);
                setUpperMatches(upper);
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
