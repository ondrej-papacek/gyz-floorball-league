import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    Timestamp
} from 'firebase/firestore';
import './adminLiveBroadcast.css';
import AdminNavbar from '../components/AdminNavbar';
import { sanitizeTeamName } from '../utils/teamUtils';

const normalizeName = (name) =>
    name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(' ')
        .reverse()
        .join('_');

const consolidateScorers = (scorers = []) => {
    const map = new Map();

    for (const s of scorers) {
        const id = s.id || normalizeName(s.name);
        if (map.has(id)) {
            const existing = map.get(id);
            existing.goals += s.goals;
        } else {
            map.set(id, { ...s, id });
        }
    }

    return Array.from(map.values());
};

const AdminLiveBroadcast = () => {
    const [liveMatches, setLiveMatches] = useState([]);
    const [liveData, setLiveData] = useState(null);
    const [playersA, setPlayersA] = useState([]);
    const [playersB, setPlayersB] = useState([]);
    const [scorerName, setScorerName] = useState('');
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const updateRef = useRef(0);

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
        clearInterval(timerRef.current);
        timerRef.current = null;
    };

    const handleTimer = (action) => {
        if (action === 'start') {
            if (!timerRef.current && liveData) {
                setIsTimerRunning(true);
                updateRef.current = 0;
                timerRef.current = setInterval(() => {
                    setLiveData(prev => {
                        const newTime = Math.max(0, prev.timeLeft - 1);
                        const updated = {
                            ...prev,
                            timeLeft: newTime
                        };

                        updateRef.current += 1;

                        if (updateRef.current >= 60 || newTime === 0) {
                            setDoc(doc(db, 'liveBroadcast', 'currentMatch'), {
                                ...updated,
                                lastUpdated: Timestamp.now()
                            });
                            updateRef.current = 0;
                        }

                        return updated;
                    });
                }, 1000);
            }
        } else {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsTimerRunning(false);

            const updated = {
                ...liveData,
                lastUpdated: Timestamp.now(),
                ...(action === 'reset' && { timeLeft: 600 })
            };

            setLiveData(updated);
            setDoc(doc(db, 'liveBroadcast', 'currentMatch'), updated);
        }
    };

    const handleScore = (team, value) => {
        setLiveData(prev => {
            const updated = {
                ...prev,
                [team]: Math.max(0, prev[team] + value),
                lastUpdated: Timestamp.now()
            };
            setDoc(doc(db, 'liveBroadcast', 'currentMatch'), updated);
            return updated;
        });
    };

    const handleAddScorer = (team) => {
        if (!scorerName) return;

        const field = team === 'A' ? 'scorerA' : 'scorerB';
        const players = team === 'A' ? playersA : playersB;

        const selected = players.find(p => p.name === scorerName);
        if (!selected) return;

        const scorerId = selected.id || normalizeName(selected.name);

        setLiveData(prev => {
            const currentScorers = [...(prev[field] || [])];
            const existing = currentScorers.find(s => s.id === scorerId);

            let updatedScorers;
            if (existing) {
                updatedScorers = currentScorers.map(s =>
                    s.id === scorerId ? { ...s, goals: s.goals + 1 } : s
                );
            } else {
                updatedScorers = [...currentScorers, {
                    name: selected.name,
                    id: scorerId,
                    goals: 1
                }];
            }

            const updated = {
                ...prev,
                [field]: updatedScorers,
                lastUpdated: Timestamp.now()
            };

            setDoc(doc(db, 'liveBroadcast', 'currentMatch'), updated);
            return updated;
        });

        setScorerName('');
    };

    const handleEndMatch = async () => {
        if (!liveData) return;

        try {
            const year = 2025;
            const division = liveData.division;
            const matchId = liveData.id;

            const finalMatchData = {
                ...liveData,
                status: 'finished',
                lastUpdated: Timestamp.now(),
                teamA_id: liveData.teamA,
                teamB_id: liveData.teamB
            };

            await setDoc(doc(db, `leagues/${year}_${division}/matches/${matchId}`), finalMatchData);

            const teamARef = doc(db, `leagues/${year}_${division}/teams/${liveData.teamA}`);
            const teamBRef = doc(db, `leagues/${year}_${division}/teams/${liveData.teamB}`);

            const [teamASnap, teamBSnap] = await Promise.all([getDoc(teamARef), getDoc(teamBRef)]);
            const teamAData = teamASnap.data();
            const teamBData = teamBSnap.data();

            const matchEntryA = {
                opponent: liveData.teamB_name,
                score: `${liveData.scoreA}-${liveData.scoreB}`,
                matchId
            };
            const matchEntryB = {
                opponent: liveData.teamA_name,
                score: `${liveData.scoreB}-${liveData.scoreA}`,
                matchId
            };

            const alreadyExists = teamAData.matches?.some(m => m.matchId === matchId);
            if (alreadyExists) return alert("Zápas již zapsán.");

            let pointsA = 0, pointsB = 0, winA = 0, winB = 0, drawA = 0, drawB = 0, lossA = 0, lossB = 0;

            if (liveData.scoreA > liveData.scoreB) {
                pointsA = 3; winA = 1; lossB = 1;
            } else if (liveData.scoreA < liveData.scoreB) {
                pointsB = 3; winB = 1; lossA = 1;
            } else {
                pointsA = pointsB = 1;
                drawA = drawB = 1;
            }

            const updatePlayerGoals = async (teamId, scorers) => {
                const teamPath = `leagues/${year}_${division}/teams/${teamId}/players`;
                for (const scorer of scorers || []) {
                    const playerId = scorer.id || normalizeName(scorer.name);
                    const playerRef = doc(db, teamPath, playerId);
                    const snap = await getDoc(playerRef);
                    const data = snap.exists() ? snap.data() : {};
                    await setDoc(playerRef, {
                        ...data,
                        goals: (data.goals || 0) + scorer.goals
                    });
                }
            };

            const updateGoalScorerList = async (division, teamId, scorers) => {
                const goalScorersRef = collection(db, `leagues/${year}_${division}/goalScorers`);
                const snapshot = await getDocs(goalScorersRef);

                for (const scorer of scorers || []) {
                    const scorerId = scorer.id || normalizeName(scorer.name);
                    const existing = snapshot.docs.find(doc => doc.data().id === scorerId);

                    if (existing) {
                        await updateDoc(doc(db, `leagues/${year}_${division}/goalScorers/${existing.id}`), {
                            goals: increment(scorer.goals)
                        });
                    } else {
                        await setDoc(doc(goalScorersRef), {
                            id: scorerId,
                            name: scorer.name,
                            goals: scorer.goals,
                            team: teamId
                        });
                    }
                }
            };

            await Promise.all([
                setDoc(teamARef, {
                    ...teamAData,
                    points: (teamAData.points || 0) + pointsA,
                    wins: (teamAData.wins || 0) + winA,
                    draws: (teamAData.draws || 0) + drawA,
                    losses: (teamAData.losses || 0) + lossA,
                    goalsScored: (teamAData.goalsScored || 0) + liveData.scoreA,
                    goalsConceded: (teamAData.goalsConceded || 0) + liveData.scoreB,
                    matchesPlayed: (teamAData.matchesPlayed || 0) + 1,
                    matches: [...(teamAData.matches || []), matchEntryA]
                }),
                setDoc(teamBRef, {
                    ...teamBData,
                    points: (teamBData.points || 0) + pointsB,
                    wins: (teamBData.wins || 0) + winB,
                    draws: (teamBData.draws || 0) + drawB,
                    losses: (teamBData.losses || 0) + lossB,
                    goalsScored: (teamBData.goalsScored || 0) + liveData.scoreB,
                    goalsConceded: (teamBData.goalsConceded || 0) + liveData.scoreA,
                    matchesPlayed: (teamBData.matchesPlayed || 0) + 1,
                    matches: [...(teamBData.matches || []), matchEntryB]
                }),
                updatePlayerGoals(liveData.teamA, consolidateScorers(liveData.scorerA)),
                updatePlayerGoals(liveData.teamB, consolidateScorers(liveData.scorerB)),
                updateGoalScorerList(division, liveData.teamA, consolidateScorers(liveData.scorerA)),
                updateGoalScorerList(division, liveData.teamB, consolidateScorers(liveData.scorerB))
            ]);

            await setDoc(doc(db, 'liveBroadcast', 'currentMatch'), { id: 'placeholder' });

            alert("Zápas byl úspěšně ukončen.");
            setLiveData(null);
            setIsTimerRunning(false);
            clearInterval(timerRef.current);
            await fetchLiveMatches();

        } catch (error) {
            console.error("Chyba při ukončení zápasu:", error);
            alert("Nastala chyba při ukončování zápasu.");
        }
    };

    const handleResetMatch = async () => {
        await setDoc(doc(db, 'liveBroadcast', 'currentMatch'), { id: 'placeholder' });
        setLiveData(null);
        clearInterval(timerRef.current);
        await fetchLiveMatches();
    };

    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    return (
        <>
            <AdminNavbar />
            <div className="live-match-container">
                <h2>Zvolit Živý Zápas</h2>
                <select onChange={(e) => fetchAndPushMatch(e.target.value)} defaultValue="" className="match-select">
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
                            {/* Team A */}
                            <div className="team team-a">
                                <img src={`/team-logos/${sanitizeTeamName(liveData.teamA_name)}.png`} alt={`Logo ${liveData.teamA_name}`} />
                                <span className="team-name">{liveData.teamA_name}</span>
                                <span className="scorers">
                                    {(liveData.scorerA || []).map(s => `${s.name} (${s.goals})`).join(', ') || 'Žádný střelec'}
                                </span>
                                <div>
                                    <button onClick={() => handleScore('scoreA', 1)}>+1</button>
                                    <button onClick={() => handleScore('scoreA', -1)}>-1</button>
                                </div>
                                <div className="scorer-form">
                                    <select value={scorerName} onChange={(e) => setScorerName(e.target.value)} className="player-select">
                                        <option value="">Vyberte hráče</option>
                                        {playersA.map(p => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleAddScorer('A')}>Přidat střelce</button>
                                </div>
                            </div>

                            {/* Skóre */}
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

                            {/* Team B */}
                            <div className="team team-b">
                                <img src={`/team-logos/${sanitizeTeamName(liveData.teamB_name)}.png`} alt={`Logo ${liveData.teamB_name}`} />
                                <span className="team-name">{liveData.teamB_name}</span>
                                <span className="scorers">
                                    {(liveData.scorerB || []).map(s => `${s.name} (${s.goals})`).join(', ') || 'Žádný střelec'}
                                </span>
                                <div>
                                    <button onClick={() => handleScore('scoreB', 1)}>+1</button>
                                    <button onClick={() => handleScore('scoreB', -1)}>-1</button>
                                </div>
                                <div className="scorer-form">
                                    <select value={scorerName} onChange={(e) => setScorerName(e.target.value)} className="player-select">
                                        <option value="">Vyberte hráče</option>
                                        {playersB.map(p => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => handleAddScorer('B')}>Přidat střelce</button>
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
