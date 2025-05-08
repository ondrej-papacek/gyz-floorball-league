import React, { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import {
    generateSchedule,
    fetchMatches,
    updateMatch,
    deleteMatch,
    updateRoundDate,
    cancelRound,
    deleteRound
} from '../services/scheduleService';
import { generateRoundPreview } from '../services/docxService';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import './manageSchedule.css';

const updateLiveBroadcast = async (match, selectedYear) => {
    try {
        const matchRefPath = `leagues/${selectedYear}_${match.division}/matches/${match.id}`;
        const liveRef = doc(db, 'liveBroadcast', 'currentMatch');

        await setDoc(liveRef, {
            matchRefPath,
            teamA: match.teamA,
            teamB: match.teamB,
            teamA_name: match.teamA_name,
            teamB_name: match.teamB_name,
            scoreA: 0,
            scoreB: 0,
            scorerA: [],
            scorerB: [],
            periodInfo: "1. POLOČAS",
            timeLeft: 600,
            status: "live",
            date: match.date,
            division: match.division,
        });
    } catch (error) {
        console.error("Failed to update live broadcast match:", error);
    }
};

const ManageSchedule = () => {
    const [mergedMatches, setMergedMatches] = useState([]);
    const [error, setError] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [startDate, setStartDate] = useState('');

    useEffect(() => {
        const fetchYears = async () => {
            const snapshot = await getDocs(collection(db, 'leagues'));
            const years = new Set();
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.status !== 'archived' && data.year) {
                    years.add(data.year.toString());
                }
            });
            const sorted = Array.from(years).sort();
            setAvailableYears(sorted);
            if (sorted.length > 0) setSelectedYear(sorted[0]);
        };
        fetchYears();
    }, []);

    useEffect(() => {
        if (selectedYear) fetchSchedule();
    }, [selectedYear]);

    const handleGenerateSchedule = async (division) => {
        try {
            console.log("Sending startDate:", startDate);
            await generateSchedule(selectedYear, division, startDate);
            fetchSchedule();
            alert(`Rozpis pro ${division === 'lower' ? 'nižší' : 'vyšší'} gymnázium ${selectedYear} byl vygenerován.`);
        } catch (err) {
            console.error(err);
            alert('Chyba při generování rozpisu.');
        }
    };

    const fetchSchedule = async () => {
        try {
            const lower = await fetchMatches(selectedYear, 'lower');
            const upper = await fetchMatches(selectedYear, 'upper');

            const lowerData = lower.filter(m => m.id !== 'placeholder');
            const upperData = upper.filter(m => m.id !== 'placeholder');

            const allRounds = {};

            [...lowerData, ...upperData].forEach(match => {
                const roundNum = match.round ?? 1;

                let matchDate = null;

                if (match.date && match.date.seconds) {
                    matchDate = new Date(match.date.seconds * 1000);
                } else if (match.date instanceof Date) {
                    matchDate = match.date;
                } else if (typeof match.date === 'string' || typeof match.date === 'number') {
                    matchDate = new Date(match.date);
                }

                if (!matchDate || isNaN(matchDate.getTime())) {
                    console.warn(`Skipping match with invalid date [${match.id}]:`, match.date);
                    return;
                }

                matchDate.setSeconds(0, 0);

                if (!allRounds[roundNum]) {
                    allRounds[roundNum] = {
                        round: roundNum,
                        date: null,
                        matches: []
                    };
                }

                const preparedMatch = {
                    ...match,
                    division: match.division || (lower.includes(match) ? 'lower' : 'upper')
                };

                allRounds[roundNum].matches.push(preparedMatch);

                if (!allRounds[roundNum].date || matchDate < allRounds[roundNum].date) {
                    allRounds[roundNum].date = matchDate;
                }
            });

            const merged = Object.values(allRounds).sort((a, b) => a.round - b.round);
            setMergedMatches(merged);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Nepodařilo se načíst rozpis zápasů.');
        }
    };

    const handleMatchAction = async (match, action, payload = {}) => {
        try {
            const { division, id } = match;
            if (action === 'cancel') await updateMatch(selectedYear, division, id, { status: 'cancelled' });
            if (action === 'defaultWin') await updateMatch(selectedYear, division, id, payload);
            if (action === 'delete') await deleteMatch(selectedYear, division, id);
            if (action === 'updateDate') await updateMatch(selectedYear, division, id, { date: new Date(payload.date) });
            if (action === 'setStatus') {
                await updateMatch(selectedYear, division, id, { status: payload.status });
                if (payload.status === 'live') {
                    await updateLiveBroadcast({ ...match, id }, selectedYear);
                }
            }

            fetchSchedule();
        } catch (err) {
            console.error(err);
            setError('Chyba při úpravě zápasu.');
        }
    };

    const handleRoundAction = async (round, action, date = null) => {
        try {
            const divisions = [...new Set(round.matches.map(match => match.division))];
            for (let division of divisions) {
                if (action === 'cancel') await cancelRound(selectedYear, division, round.round);
                else if (action === 'updateDate') await updateRoundDate(selectedYear, division, round.round, date);
                else if (action === 'delete') await deleteRound(selectedYear, division, round.round);
            }
            fetchSchedule();
        } catch (err) {
            console.error(err);
            setError('Chyba při úpravě kola.');
        }
    };

    const getStatusDotClass = (status) => {
        switch (status) {
            case 'upcoming': return 'dot dot-upcoming';
            case 'live': return 'dot dot-live';
            case 'finished': return 'dot dot-finished';
            case 'cancelled': return 'dot dot-cancelled';
            default: return 'dot';
        }
    };

    const safeGenerateRoundPreview = async (roundInfo) => {
        try {
            await generateRoundPreview(roundInfo);
        } catch (err) {
            console.error('Failed to generate DOCX:', err);
            alert('Chyba při generování dokumentu.');
        }
    };


    return (
        <>
            <AdminNavbar />
            <div className="manage-schedule">
                <h2 className="manage-schedule-title">Správa rozpisu zápasů</h2>

                <select className="manage-schedule-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {availableYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {error ? (
                    <div className="manage-schedule-error-msg">
                        {error}
                        <div className="manage-schedule-generate-buttons">
                            <button onClick={() => handleGenerateSchedule('lower')}>Vygenerovat nižší {selectedYear}</button>
                            <button onClick={() => handleGenerateSchedule('upper')}>Vygenerovat vyšší {selectedYear}</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="manage-schedule-start-date">
                            <label>Začátek ligy:</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="manage-schedule-generate-buttons">
                            <button onClick={() => handleGenerateSchedule('lower')}>Vygenerovat nižší {selectedYear}</button>
                            <button onClick={() => handleGenerateSchedule('upper')}>Vygenerovat vyšší {selectedYear}</button>
                        </div>

                        <div className="manage-schedule-legend">
                            <span><span className="dot dot-upcoming"></span> Nadcházející</span>
                            <span><span className="dot dot-live"></span> Probíhá</span>
                            <span><span className="dot dot-finished"></span> Dokončeno</span>
                            <span><span className="dot dot-cancelled"></span> Zrušeno</span>
                        </div>

                        <div className="manage-schedule-grid-of-rounds">
                            {mergedMatches.map((round) => (
                                <div key={round.round} className="manage-schedule-round-card">
                                    <div className="manage-schedule-round-header">
                                        <h4>{`Kolo ${round.round} – ${round.date.toLocaleDateString("cs-CZ", {
                                            day: "2-digit", month: "2-digit", year: "numeric"
                                        })}`}</h4>

                                        <div className="round-controls">
                                            <label>Změna data celého kola:</label>
                                            <input type="datetime-local"
                                                   onChange={(e) => handleRoundAction(round, 'updateDate', e.target.value)} />
                                        </div>

                                        <div className="round-actions">
                                            <button onClick={() => handleRoundAction(round, 'cancel')}>Zrušit kolo</button>
                                            <button onClick={() => handleRoundAction(round, 'delete')}>Smazat kolo</button>
                                        </div>

                                        <div className="docx-generate">
                                            <button className="docx-btn" onClick={() => safeGenerateRoundPreview({
                                                round: round.round,
                                                date: round.date,
                                                matches: round.matches.map(m => ({
                                                    teamA: m.teamA_name,
                                                    teamB: m.teamB_name
                                                }))
                                            })}>
                                                Generovat rozpis kola
                                            </button>
                                        </div>
                                    </div>

                                    <div className="match-grid">
                                        {round.matches.map((match, index) => {
                                            let matchDate = match.date?.seconds
                                                ? new Date(match.date.seconds * 1000).toISOString().slice(0, 16)
                                                : '';

                                            return (
                                                <div className="match-card" key={index}>
                                                    <span className={`match-dot ${getStatusDotClass(match.status)}`}></span>
                                                    <div className="match-teams">
                                                        <strong>{match.teamA_name}</strong>
                                                        <span className="vs-label">
                                                        {typeof match.scoreA === 'number' && typeof match.scoreB === 'number'
                                                            ? ` ${match.scoreA} : ${match.scoreB} `
                                                            : ' vs '}
                                                    </span>
                                                        <strong>{match.teamB_name}</strong>
                                                    </div>

                                                    <input type="datetime-local"
                                                           value={matchDate}
                                                           onChange={(e) => handleMatchAction(match, 'updateDate', { date: e.target.value })} />

                                                    <div className="match-status-select">
                                                        <label>Status:</label>
                                                        <select value={match.status}
                                                                onChange={(e) =>
                                                                    handleMatchAction(match, 'setStatus', { status: e.target.value })}>
                                                            <option value="upcoming">nadcházející</option>
                                                            <option value="live">živě</option>
                                                            <option value="finished">odehraný</option>
                                                            <option value="cancelled">zrušený</option>
                                                        </select>
                                                    </div>

                                                    <div className="actions">
                                                        <button onClick={() => handleMatchAction(match, 'cancel')}>Zrušit</button>
                                                        <button onClick={() => handleMatchAction(match, 'defaultWin', {
                                                            status: 'finished', scoreA: 3, scoreB: 0
                                                        })}>Kontumační výhra {match.teamA_name}</button>
                                                        <button onClick={() => handleMatchAction(match, 'defaultWin', {
                                                            status: 'finished', scoreA: 0, scoreB: 3
                                                        })}>Kontumační výhra {match.teamB_name}</button>
                                                        <button onClick={() => handleMatchAction(match, 'delete')}>Smazat</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default ManageSchedule;
