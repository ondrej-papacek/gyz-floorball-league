import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import '../pages/schedule.css';
import PlayoffView from './PlayoffView';

function Schedule() {
    const [mergedMatches, setMergedMatches] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [isPlayoff, setIsPlayoff] = useState(false);
    const [selectedYear, setSelectedYear] = useState('2025');

    useEffect(() => {
        const fetchLeagues = async () => {
            const snapshot = await getDocs(collection(db, 'leagues'));
            const ids = snapshot.docs.map(doc => doc.id);
            const years = Array.from(new Set(ids.map(id => id.split('_')[0])));
            setLeagues(years.sort());
            setSelectedOption(`Základní rozpis ${years[0]}`);
        };
        fetchLeagues();
    }, []);

    useEffect(() => {
        if (!selectedOption || !selectedOption.includes('Základní')) return;
        const year = selectedOption.split(' ')[2];
        setSelectedYear(year);
        setIsPlayoff(false);
        fetchSchedule(year);
    }, [selectedOption]);

    const fetchSchedule = async (year) => {
        try {
            const lowerQuery = query(
                collection(db, `leagues/${year}_lower/matches`),
                orderBy("round")
            );
            const upperQuery = query(
                collection(db, `leagues/${year}_upper/matches`),
                orderBy("round")
            );

            const [lowerSnapshot, upperSnapshot] = await Promise.all([
                getDocs(lowerQuery),
                getDocs(upperQuery)
            ]);

            const lowerData = lowerSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data(), division: 'lower' }))
                .filter(match => match.id !== 'placeholder');
            const upperData = upperSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data(), division: 'upper' }))
                .filter(match => match.id !== 'placeholder');

            const rounds = [];
            const totalRounds = Math.max(lowerData.length, upperData.length);
            const baseDate = new Date(parseInt(year), 2, 21); // March 21

            for (let i = 0; i < totalRounds; i++) {
                const matches = [];
                if (i < lowerData.length) matches.push(lowerData[i]);
                if (i < upperData.length) matches.push(upperData[i]);

                const date = new Date(baseDate);
                date.setDate(baseDate.getDate() + i * 7);

                rounds.push({
                    round: i + 1,
                    date,
                    matches
                });
            }

            setMergedMatches(rounds);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        }
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setSelectedOption(val);
        const isPlayoffView = val.includes('Playoff');
        setIsPlayoff(isPlayoffView);
        const year = val.split(' ')[1];
        setSelectedYear(year);
    };

    return (
        <div className="schedule-page">
            <h2 className="schedule-title">Rozpis zápasů</h2>

            {leagues.length > 0 && (
                <select value={selectedOption} onChange={handleChange} className="schedule-selector">
                    {leagues.map(year => (
                        <React.Fragment key={year}>
                            <option value={`Základní rozpis ${year}`}>Základní rozpis {year}</option>
                            <option value={`Playoff ${year}`}>Playoff {year}</option>
                        </React.Fragment>
                    ))}
                </select>
            )}

            {isPlayoff ? (
                <PlayoffView year={selectedYear} />
            ) : (
                <div className="grid-of-rounds">
                    {mergedMatches.map((roundData) => (
                        <div key={roundData.round} className="round-card">
                            <div className="round-title">
                                <span>{`Kolo ${roundData.round} – ${roundData.date.toLocaleDateString("cs-CZ")}`}</span>
                            </div>
                            <div className="match-grid">
                                {roundData.matches.map((match, index) => (
                                    <div className="match-card" key={index}>
                                        <div className="match-teams">
                                            <strong>{match.teamA_name}</strong>
                                            <span className="vs-label">vs</span>
                                            <strong>{match.teamB_name}</strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Schedule;
