import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    Timestamp
} from 'firebase/firestore';
import './adminLiveBroadcast.css';
import AdminNavbar from '../components/AdminNavbar';
import { sanitizeTeamName } from '../utils/teamUtils';

const AdminLiveBroadcast = () => {
    const [liveMatches, setLiveMatches] = useState([]);
    const [liveData, setLiveData] = useState(null);
    const [playersA, setPlayersA] = useState([]);
    const [playersB, setPlayersB] = useState([]);
    const [scorerName, setScorerName] = useState('');
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);

    const fetchLiveMatches = async () => {
        const divisions = ['lower', 'upper'];
        let allMatches = [];

        for (const div of divisions) {
            const matchRef = collection(db, `leagues/2025_${div}/matches`);
            const snap = await getDocs(matchRef);
            const data = snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                division: div
            }));
            allMatches = allMatches.concat(data.filter(m => m.status === 'live'));
        }

        setLiveMatches(allMatches);
    };

    const fetchAndPushMatch = async (matchId) => {
        const match = liveMatches.find(m => m.id === matchId);
        if (!match) return;

        const docRef = doc(db, `leagues/2025_${match.division}/matches`, matchId);
        const snap = await getDoc(docRef);
        const fullMatch = snap.data();

        const teamARef = collection(db, `leagues/2025_${match.division}/teams/${fullMatch.teamA}/players`);
        const teamBRef = collection(db, `leagues/2025_${match.division}/teams/${fullMatch.teamB}/players`);

        const teamAData = (await getDocs(teamARef)).docs.map(d => d.data());
        const teamBData = (await getDocs(teamBRef)).docs.map(d => d.data());

        const payload = {
            ...fullMatch,
            id: matchId,
            status: 'live',
            timeLeft: 600,
            lastUpdated: Timestamp.now(),
            periodInfo: '1. POLOČAS',
            scorerA: [],
            scorerB: [],
            date: new Date(),
            matchRefPath: `leagues/2025_${match.division}/matches/${matchId}`,
            division: match.division
        };

        await setDoc(doc(db, 'liveBroadcast', 'currentMatch'), payload);
        setLiveData(payload);
        setPlayersA(teamAData);
        setPlayersB(teamBData);
        setIsTimerRunning(false);
        clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const handleTimer = (action) => {
        if (action === 'start') {
            if (!timerRef.current && liveData) {
                setIsTimerRunning(true);
                timerRef.current = setInterval(() => {
                    setLiveData(prev => {
                        const updated = {
                            ...prev,
                            timeLeft: Math.max(0, prev.timeLeft - 60),
                            lastUpdated: Timestamp.now()
                        };
                        setDoc(doc(db, 'liveBroadcast', 'currentMatch'), updated);
                        return updated;
                    });
                }, 60000); // každou minutu
            }
        } else {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsTimerRunning(false);
            if (action === 'reset') {
                const updated = {
                    ...liveData,
                    timeLeft: 600,
                    lastUpdated: Timestamp.now()
                };
                setLiveData(updated);
                setDoc(doc(db, 'liveBroadcast', 'currentMatch'), updated);
            }
            if (action === 'pause') {
                const updated = {
                    ...liveData,
                    lastUpdated: Timestamp.now()
                };
                setLiveData(updated);
                setDoc(doc(db, 'liveBroadcast', 'currentMatch'), updated);
            }
        }
    };

    const handleScore = (team, value) => {
        setLiveData(prev => ({
            ...prev,
            [team]: Math.max(0, prev[team] + value)
        }));
    };

    const handleAddScorer = (team) => {
        if (!scorerName) return;
        const field = team === 'A' ? 'scorerA' : 'scorerB';
        setLiveData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), { name: scorerName, goals: 1 }]
        }));
        setScorerName('');
    };

    const handleEndMatch = async () => {
        await fetch('/api/liveBroadcast/complete', { method: 'POST' });
        alert("Zápas ukončen.");
        setLiveData(null);
        setIsTimerRunning(false);
        clearInterval(timerRef.current);
        await fetchLiveMatches();
    };

    const handleResetMatch = async () => {
        await setDoc(doc(db, 'liveBroadcast', 'currentMatch'), { id: 'placeholder' });
        setLiveData(null);
        setIsTimerRunning(false);
        clearInterval(timerRef.current);
        await fetchLiveMatches();
    };

    useEffect(() => {
        fetchLiveMatches();
        return () => clearInterval(timerRef.current);
    }, []);

    const formatTime = (seconds) =>
        `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    return (
        <>
            <AdminNavbar />
            <div className="live-match-container">
                <h2>Zvolit Živý Zápas</h2>
                <select onChange={(e) => fetchAndPushMatch(e.target.value)} defaultValue="">
                    <option value="" disabled>Zvolte zápas...</option>
                    {liveMatches.map(m => (
                        <option key={m.id} value={m.id}>
                            {m.teamA_name} vs {m.teamB_name} ({m.division})
                        </option>
                    ))}
                </select>

                {liveData && (
                    <div className="live-match-background">
                        <h2>ŽIVÝ ZÁPAS</h2>
                        <div className="match-info">{new Date(liveData.date).toLocaleString("cs-CZ")}</div>
                        <div className="scoreboard">
                            {['A', 'B'].map((team, i) => {
                                const nameKey = `team${team}_name`;
                                const scorerKey = `scorer${team}`;
                                const players = team === 'A' ? playersA : playersB;

                                return (
                                    <div key={team} className={`team team-${team.toLowerCase()}`}>
                                        <img
                                            src={`/team-logos/${sanitizeTeamName(liveData[nameKey])}.png`}
                                            alt={`Logo týmu ${liveData[nameKey]}`}
                                        />
                                        <span className="team-name">{liveData[nameKey]}</span>
                                        <span className="scorers">
                      {(liveData[scorerKey] || []).map(s => `${s.name} (${s.goals})`).join(', ') || 'No scorer details'}
                    </span>
                                        <div>
                                            <button onClick={() => handleScore(`score${team}`, 1)}>+1</button>
                                            <button onClick={() => handleScore(`score${team}`, -1)}>-1</button>
                                        </div>
                                        <div className="scorer-form">
                                            <select value={scorerName} onChange={(e) => setScorerName(e.target.value)}>
                                                <option value="">Vyberte hráče</option>
                                                {players.map(p => (
                                                    <option key={p.name} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => handleAddScorer(team)}>Přidat střelce</button>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="score-info">
                                <div className="score">{liveData.scoreA} - {liveData.scoreB}</div>
                                <div className="period-info">
                                    <input
                                        value={liveData.periodInfo}
                                        onChange={(e) => setLiveData(prev => ({ ...prev, periodInfo: e.target.value }))}
                                    />
                                    <span className="time-left">{formatTime(liveData.timeLeft)}</span>
                                    <div className="timer-controls">
                                        <button onClick={() => handleTimer('start')}>Start</button>
                                        <button onClick={() => handleTimer('pause')}>Pause</button>
                                        <button onClick={() => handleTimer('reset')}>Reset</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleEndMatch} className="live-toggle-button">Ukončit zápas</button>
                        <button onClick={handleResetMatch} className="reset-button">Reset Živý zápas</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminLiveBroadcast;
