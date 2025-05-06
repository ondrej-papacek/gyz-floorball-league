import React, { useEffect, useState } from 'react';
import './upcomingMatch.css';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const UpcomingMatch = () => {
    const [rounds, setRounds] = useState([]);
    const [error, setError] = useState('');

    const formatDate = (rawDate) => {
        try {
            const dateObj = rawDate?.seconds
                ? new Date(rawDate.seconds * 1000)
                : new Date(new Date(rawDate).toLocaleString("en-US", { timeZone: "Europe/Prague" }));

            return dateObj.toLocaleString('cs-CZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Europe/Prague'
            });
        } catch {
            return 'Neznámé datum';
        }
    };

    useEffect(() => {
        const fetchLatestYear = async () => {
            const snapshot = await getDocs(collection(db, 'leagues'));
            const activeYears = new Set();

            snapshot.forEach(doc => {
                const data = doc.data();
                const [year] = doc.id.split('_');
                if (data.status !== 'archived' && year) {
                    activeYears.add(year);
                }
            });

            const sorted = Array.from(activeYears).sort().reverse();
            return sorted[0];
        };

        const fetchMatch = async () => {
            try {
                const latestYear = await fetchLatestYear();
                if (!latestYear) {
                    setError('Žádný aktivní ročník nebyl nalezen.');
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/schedule/upcoming-match?year=${latestYear}`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                const data = await response.json();
                console.log("Received Upcoming Match Data:", data);

                if (Array.isArray(data) && data.length > 0) {
                    setRounds(data);
                } else {
                    setError('Neplatná data o zápasech.');
                }
            } catch (err) {
                setError('Nepodařilo se načíst nadcházející zápasy.');
                console.error('Chyba při načítání zápasu:', err);
            }
        };

        fetchMatch();
    }, []);

    return (
        <div className="upcoming-match">
            <h2>Nadcházející zápasy</h2>
            {error && <p className="error">{error}</p>}

            {rounds.length > 0 ? (
                <div className="upcoming-rounds">
                    {rounds.map((round, index) => (
                        <div key={index} className="round-box">
                            <p className="round-date">
                                <strong>Datum:</strong> {formatDate(round.date)}
                            </p>
                            <p><strong>Nižší gymnázium:</strong> {round.lowerMatch.teamA_name} vs {round.lowerMatch.teamB_name}</p>
                            <p><strong>Vyšší gymnázium:</strong> {round.upperMatch.teamA_name} vs {round.upperMatch.teamB_name}</p>
                        </div>
                    ))}
                </div>
            ) : (
                !error && <p>Žádné nadcházející zápasy nebyly nalezeny.</p>
            )}
        </div>
    );
};

export default UpcomingMatch;
