import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import PlayoffBracket from '../components/PlayoffBracket';
import './playoffView.css';

const PlayoffView = ({ year }) => {
    const [lowerMatches, setLowerMatches] = useState([]);
    const [upperMatches, setUpperMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const sanitizeMatches = (matches) =>
        matches.filter(m => {
            const valid =
                m &&
                typeof m.id === 'string' &&
                typeof m.name === 'string' &&
                Array.isArray(m.participants) &&
                m.participants.length === 2 &&
                typeof m.participants[0]?.name === 'string' &&
                typeof m.participants[1]?.name === 'string';

            if (!valid) {
                console.warn('Invalid match skipped:', m);
            }

            return valid;
        });

    useEffect(() => {
        const lowerRef = collection(db, `leagues/${year}_lower/playoff/rounds/bracketMatches`);
        const upperRef = collection(db, `leagues/${year}_upper/playoff/rounds/bracketMatches`);

        (async () => {
            try {
                const [lowerSnap, upperSnap] = await Promise.all([
                    getDocs(lowerRef),
                    getDocs(upperRef)
                ]);

                setLowerMatches(sanitizeMatches(lowerSnap.docs.map(doc => doc.data())));
                setUpperMatches(sanitizeMatches(upperSnap.docs.map(doc => doc.data())));
                setError('');
            } catch (err) {
                console.error('Initial playoff fetch failed:', err);
                setError('Nepodařilo se načíst data playoff.');
            } finally {
                setLoading(false);
            }
        })();

        const unsubscribeLower = onSnapshot(lowerRef, (snap) => {
            try {
                const matches = snap.docs.map(doc => doc.data());
                setLowerMatches(sanitizeMatches(matches));
            } catch (err) {
                console.error('Realtime update failed (lower):', err);
            }
        });

        const unsubscribeUpper = onSnapshot(upperRef, (snap) => {
            try {
                const matches = snap.docs.map(doc => doc.data());
                setUpperMatches(sanitizeMatches(matches));
            } catch (err) {
                console.error('Realtime update failed (upper):', err);
            }
        });

        return () => {
            unsubscribeLower();
            unsubscribeUpper();
        };
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
