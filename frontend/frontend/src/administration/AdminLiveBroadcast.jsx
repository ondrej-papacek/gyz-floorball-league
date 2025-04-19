import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import './adminLiveBroadcast.css';
import AdminNavbar from "../components/AdminNavbar";

const AdminLiveBroadcast = () => {
    const [liveMatches, setLiveMatches] = useState([]);
    const [liveData, setLiveData] = useState(null);
    const [playersA, setPlayersA] = useState([]);
    const [playersB, setPlayersB] = useState([]);
    const [scorer, setScorer] = useState({ team: '', name: '', goals: 1 });
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
    };

    const handleScore = (team, value) => {
        setLiveData(prev => ({
            ...prev,
            [team]: Math.max(0, prev[team] + value)
        }));
    };

    const handleTimer = (action) => {
        if (action === 'start') {
            if (!timerRef.current) {
                timerRef.current = setInterval(() => {
                    setLiveData(prev => ({
                        ...prev,
                        timeLeft: Math.max(0, prev.timeLeft - 1)
                    }));
                }, 1000);
            }
        } else if (action === 'pause') {
            clearInterval(timerRef.current);
            timerRef.current = null;
        } else if (action === 'reset') {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setLiveData(prev => ({ ...prev, timeLeft: 600 }));
        }
    };

    const handleAddScorer = () => {
        if (!scorer.name || !scorer.team) return;
        const field = scorer.team === 'A' ? 'scorerA' : 'scorerB';
        setLiveData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), {
                name: scorer.name,
                goals: parseInt(scorer.goals, 10)
            }]
        }));
        setScorer({ team: '', name: '', goals: 1 });
    };

    const handleEndMatch = async () => {
        await fetch('/api/liveBroadcast/complete', { method: 'POST' });
        alert("Zápas ukončen.");
        setLiveData(null);
        await fetchLiveMatches();
    };

    const handleResetMatch = async () => {
        await setDoc(doc(db, 'liveBroadcast', 'currentMatch'), { id: 'placeholder' });
        setLiveData(null);
        await fetchLiveMatches();
    };

    useEffect(() => {
        fetchLiveMatches();
        return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (liveData) {
            setDoc(doc(db, 'liveBroadcast', 'currentMatch'), liveData);
        }
    }, [liveData]);

    const formatTime = (seconds) =>
        `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    return (
        <>
            <AdminNavbar />
            <div className="live-match-container">
                <h2 style={{ color: '#f0b323' }}>Zvolit Živý Zápas</h2>
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
                        <div className="match-info">
                            {new Date(liveData.date).toLocaleString("cs-CZ")}
                        </div>
                        <div className="scoreboard">
                            <div className="team team-a">
                                <img src={`/team-logos/${liveData.teamA}.png`} />
                                <span className="team-name">{liveData.teamA_name}</span>
                                <span className="scorers">
                                    {(liveData.scorerA || []).map(s => `${s.name} (${s.goals})`).join(', ') || 'No scorer details'}
                                </span>
                                <div>
                                    <button onClick={() => handleScore('scoreA', 1)}>+1</button>
                                    <button onClick={() => handleScore('scoreA', -1)}>-1</button>
                                </div>
                            </div>
                            <div className="score-info">
                                <div className="score">{liveData.scoreA} - {liveData.scoreB}</div>
                                <div className="period-info">
                                    <input
                                        value={liveData.periodInfo}
                                        onChange={(e) => setLiveData(prev => ({ ...prev, periodInfo: e.target.value }))}
                                    />
                                    <span className="time-left">{formatTime(liveData.timeLeft)}</span>
                                    <div>
                                        <button onClick={() => handleTimer('start')}>Start</button>
                                        <button onClick={() => handleTimer('pause')}>Pause</button>
                                        <button onClick={() => handleTimer('reset')}>Reset</button>
                                    </div>
                                </div>
                            </div>
                            <div className="team team-b">
                                <img src={`/team-logos/${liveData.teamB}.png`} />
                                <span className="team-name">{liveData.teamB_name}</span>
                                <span className="scorers">
                                    {(liveData.scorerB || []).map(s => `${s.name} (${s.goals})`).join(', ') || 'No scorer details'}
                                </span>
                                <div>
                                    <button onClick={() => handleScore('scoreB', 1)}>+1</button>
                                    <button onClick={() => handleScore('scoreB', -1)}>-1</button>
                                </div>
                            </div>
                        </div>

                        <h3>Přidat střelce</h3>
                        <div className="scorer-form">
                            <select value={scorer.name} onChange={(e) => setScorer({ ...scorer, name: e.target.value })}>
                                <option value="">Vyberte hráče</option>
                                {[...playersA, ...playersB].map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                            <select value={scorer.team} onChange={(e) => setScorer({ ...scorer, team: e.target.value })}>
                                <option value="">Tým</option>
                                <option value="A">Tým A</option>
                                <option value="B">Tým B</option>
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={scorer.goals}
                                onChange={(e) => setScorer({ ...scorer, goals: e.target.value })}
                            />
                            <button onClick={handleAddScorer}>Přidat střelce</button>
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
