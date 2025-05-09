﻿import React, { useEffect, useState } from 'react';
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
            const leaguesData = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(league => league.status !== 'archived');

            const years = Array.from(new Set(leaguesData.map(l => l.year.toString())));
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

            const allRounds = {};

            [...lowerData, ...upperData].forEach(match => {
                const roundNum = match.round ?? 1;
                let matchDate;
                if (match.date && match.date.seconds) {
                    matchDate = new Date(match.date.seconds * 1000);
                } else if (match.date instanceof Date) {
                    matchDate = match.date;
                } else {
                    console.warn(`Invalid date for match ID ${match.id}`, match.date);
                    matchDate = new Date();
                }

                if (!allRounds[roundNum]) {
                    allRounds[roundNum] = {
                        round: roundNum,
                        date: matchDate,
                        matches: []
                    };
                }

                allRounds[roundNum].matches.push(match);

                if (matchDate < allRounds[roundNum].date) {
                    allRounds[roundNum].date = matchDate;
                }
            });

            const merged = Object.values(allRounds).sort((a, b) => a.round - b.round);
            setMergedMatches(merged);
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

    const isMidnight = (date) => {
        return date.getHours() === 0 && date.getMinutes() === 0;
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
                <div className="schedule-grid-of-rounds">
                    {mergedMatches.map((roundData) => (
                        <div key={roundData.round} className="schedule-round-card">
                            <div className="schedule-round-title">
                                <span>
                                    {`Kolo ${roundData.round} – `}
                                    {roundData.date.toLocaleDateString('cs-CZ', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                    {!isMidnight(roundData.date) && (
                                        <> {roundData.date.toLocaleTimeString('cs-CZ', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false
                                        })}</>
                                    )}
                                </span>
                            </div>
                            <div className="schedule-match-grid">
                                {roundData.matches.map((match, index) => (
                                    <div className="schedule-match-card" key={index}>
                                        <div className="schedule-match-score-line">
                                            <span className="schedule-team-name">{match.teamA_name}</span>
                                            {typeof match.scoreA === 'number' && typeof match.scoreB === 'number' ? (
                                                <span className="schedule-match-score">{match.scoreA} : {match.scoreB}</span>
                                            ) : (
                                                <span className="schedule-vs-label">vs</span>
                                            )}
                                            <span className="schedule-team-name">{match.teamB_name}</span>
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
