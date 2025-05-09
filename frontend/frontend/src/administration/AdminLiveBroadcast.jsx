﻿import React, { useState, useEffect, useRef } from 'react';
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
import { sanitizeTeamName, normalizeName } from '../utils/teamUtils';

const consolidateScorers = (scorers = []) => {
    const map = new Map();
    for (const s of scorers) {
        const id = s.id || normalizeName(s.name);
        if (map.has(id)) {
            map.get(id).goals += s.goals;
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

    useEffect(() => {
        fetchLiveMatches();
    }, []);

    const fetchLiveMatches = async () => {
        const divisions = ['lower', 'upper'];
        let allMatches = [];

        const leaguesSnapshot = await getDocs(collection(db, 'leagues'));
        const leagueIds = leaguesSnapshot.docs
            .filter(doc => doc.data().status !== 'archived')
            .map(doc => doc.id);

        for (const leagueId of leagueIds) {
            const [year, div] = leagueId.split('_');
            if (!divisions.includes(div)) continue;

            const matchesRef = collection(db, `leagues/${leagueId}/matches`);
            const matchesSnapshot = await getDocs(matchesRef);

            matchesSnapshot.docs.forEach(docSnap => {
                const matchData = docSnap.data();
                if (matchData.status === 'live') {
                    allMatches.push({
                        id: docSnap.id,
                        ...matchData,
                        division: div,
                        season: year
                    });
                }
            });
        }

        setLiveMatches(allMatches);
    };

    const fetchAndPushMatch = async (matchId) => {
        const match = liveMatches.find(m => m.id === matchId);
        if (!match) return;

        const year = match.season;
        const docRef = doc(db, `leagues/${year}_${match.division}/matches`, matchId);
        const snap = await getDoc(docRef);
        const fullMatch = snap.data();

        const teamARef = collection(db, `leagues/${year}_${match.division}/teams/${fullMatch.teamA}/players`);
        const teamBRef = collection(db, `leagues/${year}_${match.division}/teams/${fullMatch.teamB}/players`);

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
            matchRefPath: `leagues/${year}_${match.division}/matches/${matchId}`,
            division: match.division,
            season: year
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
                        const updated = { ...prev, timeLeft: newTime };
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

            const updatedScorers = existing
                ? currentScorers.map(s => s.id === scorerId ? { ...s, goals: s.goals + 1 } : s)
                : [...currentScorers, { name: selected.name, id: scorerId, goals: 1 }];

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
            const year = liveData.season;
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
            const cleanTeamAData = teamASnap.data();
            const cleanTeamBData = teamBSnap.data();

            const matchEntryA = { opponent: liveData.teamB_name, score: `${liveData.scoreA}-${liveData.scoreB}`, matchId };
            const matchEntryB = { opponent: liveData.teamA_name, score: `${liveData.scoreB}-${liveData.scoreA}`, matchId };

            const alreadyExists = cleanTeamAData.matches?.some(m => m.matchId === matchId);
            if (alreadyExists) return alert("Zápas již zapsán.");

            let pointsA = 0, pointsB = 0, winA = 0, winB = 0, drawA = 0, drawB = 0, lossA = 0, lossB = 0;
            if (liveData.scoreA > liveData.scoreB) {
                pointsA = 3; winA = 1; lossB = 1;
            } else if (liveData.scoreA < liveData.scoreB) {
                pointsB = 3; winB = 1; lossA = 1;
            } else {
                pointsA = pointsB = 1; drawA = drawB = 1;
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

            const updateGoalScorerList = async (division, teamId, teamName, scorers) => {
                const goalScorersRef = collection(db, `leagues/${year}_${division}/goalScorers`);
                const snapshot = await getDocs(goalScorersRef);

                for (const scorer of scorers || []) {
                    const playerId = scorer.id || normalizeName(scorer.name);
                    const existing = snapshot.docs.find(doc =>
                        doc.data().id === playerId && doc.data().team_id === teamId
                    );

                    if (existing) {
                        await updateDoc(doc(db, `leagues/${year}_${division}/goalScorers/${existing.id}`), {
                            goals: increment(scorer.goals)
                        });
                    } else {
                        await setDoc(doc(db, `leagues/${year}_${division}/goalScorers/${playerId}`), {
                            id: playerId,
                            name: scorer.name,
                            goals: scorer.goals,
                            team: teamName,
                            team_id: teamId
                        });
                    }
                }
            };

            const scorerA = consolidateScorers(liveData.scorerA);
            const scorerB = consolidateScorers(liveData.scorerB);

            await Promise.all([
                updateDoc(teamARef, {
                    points: increment(pointsA),
                    wins: increment(winA),
                    draws: increment(drawA),
                    losses: increment(lossA),
                    goalsScored: increment(liveData.scoreA),
                    goalsConceded: increment(liveData.scoreB),
                    matchesPlayed: increment(1),
                    matches: [...(cleanTeamAData.matches || []), matchEntryA]
                }),
                updateDoc(teamBRef, {
                    points: increment(pointsB),
                    wins: increment(winB),
                    draws: increment(drawB),
                    losses: increment(lossB),
                    goalsScored: increment(liveData.scoreB),
                    goalsConceded: increment(liveData.scoreA),
                    matchesPlayed: increment(1),
                    matches: [...(cleanTeamBData.matches || []), matchEntryB]
                }),
                updatePlayerGoals(liveData.teamA, scorerA),
                updatePlayerGoals(liveData.teamB, scorerB),
                updateGoalScorerList(division, liveData.teamA, liveData.teamA_name, scorerA),
                updateGoalScorerList(division, liveData.teamB, liveData.teamB_name, scorerB)
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
