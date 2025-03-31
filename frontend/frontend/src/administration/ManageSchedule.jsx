import React, { useEffect, useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import { generateSchedule } from '../services/scheduleService';
import {
    fetchMatches,
    updateMatch,
    deleteMatch,
    updateRoundDate,
    cancelRound,
    deleteRound
} from '../services/scheduleService';
import './manageSchedule.css';

const ManageSchedule = () => {
    const [mergedMatches, setMergedMatches] = useState([]);
    const [error, setError] = useState('');
    const [selectedYear, setSelectedYear] = useState('2025'); // Make dynamic

    const handleGenerateSchedule = async (division) => {
        try {
            await generateSchedule(selectedYear, division);
            fetchSchedule();
            alert(`Rozpis pro ${division === 'lower' ? 'nižší' : 'vyšší'} gymnázium ${selectedYear} byl vygenerován.`);
        } catch (err) {
            console.error(err);
            alert('Chyba při generování rozpisu.');
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, [selectedYear]);

    const fetchSchedule = async () => {
        try {
            const lower = await fetchMatches(selectedYear, 'lower');
            const upper = await fetchMatches(selectedYear, 'upper');

            if (lower.length === 0 && upper.length === 0) {
                setMergedMatches([]);
                setError('Rozpis zatím neexistuje. Vygenerujte ho pro každou ligu.');
                return;
            }

            const scheduleStartDate = new Date(parseInt(selectedYear), 2, 21);
            const merged = [];
            let lowerIndex = 0, upperIndex = 0;

            while (lowerIndex < lower.length || upperIndex < upper.length) {
                const roundDate = new Date(scheduleStartDate);
                roundDate.setDate(scheduleStartDate.getDate() + merged.length * 7);

                const matches = [];

                if (lowerIndex < lower.length) {
                    matches.push({ ...lower[lowerIndex], division: 'lower' });
                    lowerIndex++;
                }
                if (upperIndex < upper.length) {
                    matches.push({ ...upper[upperIndex], division: 'upper' });
                    upperIndex++;
                }

                merged.push({
                    round: merged.length + 1,
                    date: roundDate,
                    matches
                });
            }

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
            if (action === 'setStatus') await updateMatch(selectedYear, division, id, { status: payload.status });
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

    return (
        <>
            <AdminNavbar />
            <div className="manage-schedule">
                <h2>Správa rozpisu zápasů</h2>

                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                </select>

                {error && (
                    <div className="error-msg">
                        {error}
                        <div className="generate-buttons">
                            <button onClick={() => handleGenerateSchedule('lower')}>Vygenerovat nižší {selectedYear}</button>
                            <button onClick={() => handleGenerateSchedule('upper')}>Vygenerovat vyšší {selectedYear}</button>
                        </div>
                    </div>
                )}

                {!error && (
                    <>
                        <div className="generate-buttons">
                            <button onClick={() => handleGenerateSchedule('lower')}>Vygenerovat nižší {selectedYear}</button>
                            <button onClick={() => handleGenerateSchedule('upper')}>Vygenerovat vyšší {selectedYear}</button>
                        </div>

                        <div className="legend">
                            <span><span className="dot dot-upcoming"></span> Nadcházející</span>
                            <span><span className="dot dot-live"></span> Probíhá</span>
                            <span><span className="dot dot-finished"></span> Dokončeno</span>
                            <span><span className="dot dot-cancelled"></span> Zrušeno</span>
                        </div>

                        <div className="grid-of-rounds">
                            {mergedMatches.map((round) => (
                                <div key={round.round} className="round-card">
                                    <div className="round-header">
                                        <h4>{`Kolo ${round.round} – ${round.date.toLocaleDateString("cs-CZ")}`}</h4>
                                        <div className="round-controls">
                                            <label>Změna data celého kola:</label>
                                            <input type="date"
                                                   onChange={(e) => handleRoundAction(round, 'updateDate', e.target.value)}/>
                                        </div>
                                        <div className="round-actions">
                                            <button onClick={() => handleRoundAction(round, 'cancel')}>Zrušit kolo
                                            </button>
                                            <button onClick={() => handleRoundAction(round, 'delete')}>Smazat kolo
                                            </button>
                                        </div>
                                    </div>
                                    <div className="match-grid">
                                        {round.matches.map((match, index) => (
                                            <div className="match-card" key={index}>
                                                <span className={`match-dot ${getStatusDotClass(match.status)}`}></span>
                                                <div className="match-teams">
                                                    <strong>{match.teamA_name}</strong>
                                                    <span className="vs-label">vs</span>
                                                    <strong>{match.teamB_name}</strong>
                                                </div>
                                                <input type="date" onChange={(e) =>
                                                    handleMatchAction(match, 'updateDate', {date: e.target.value})}/>
                                                <div className="match-status-select">
                                                    <label>Status:</label>
                                                    <select value={match.status}
                                                            onChange={(e) =>
                                                                handleMatchAction(match, 'setStatus', {status: e.target.value})}>
                                                        <option value="upcoming">nadcházející</option>
                                                        <option value="live">živě</option>
                                                        <option value="finished">odehraný</option>
                                                        <option value="cancelled">zrušený</option>
                                                    </select>
                                                </div>
                                                <div className="actions">
                                                    <button onClick={() => handleMatchAction(match, 'cancel')}>Zrušit
                                                    </button>
                                                    <button onClick={() => handleMatchAction(match, 'defaultWin', {
                                                        status: 'finished', scoreA: 3, scoreB: 0
                                                    })}>Kontumační výhra {match.teamA_name}</button>
                                                    <button onClick={() => handleMatchAction(match, 'defaultWin', {
                                                        status: 'finished', scoreA: 0, scoreB: 3
                                                    })}>Kontumační výhra {match.teamB_name}</button>
                                                    <button onClick={() => handleMatchAction(match, 'delete')}>Smazat
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
