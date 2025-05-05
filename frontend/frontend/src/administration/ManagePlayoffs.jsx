import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    deleteDoc,
    updateDoc
} from 'firebase/firestore';
import { saveRound, updateRound, deleteRound as deleteRoundAPI } from '../services/playoffService';
import AdminNavbar from '../components/AdminNavbar';
import './managePlayoffs.css';
import { normalizeName } from '../utils/teamUtils';

const ManagePlayoffs = () => {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [teams, setTeams] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [newRoundName, setNewRoundName] = useState('');
    const [newMatches, setNewMatches] = useState([{ teamA: '', teamB: '', scoreA: 0, scoreB: 0 }]);
    const [players, setPlayers] = useState({});
    const [scorers, setScorers] = useState({});
    const [scorerGoals, setScorerGoals] = useState({});
    const [selectedScorer, setSelectedScorer] = useState({});

    useEffect(() => {
        const fetchLeagues = async () => {
            const leaguesSnap = await getDocs(collection(db, 'leagues'));
            const active = leaguesSnap.docs
                .filter(doc => doc.data().status !== 'archived')
                .map(doc => doc.id);

            setLeagues(active);
            setSelectedLeague(active[0] || '');
        };
        fetchLeagues();
    }, []);

    useEffect(() => {
        if (!selectedLeague) return;
        const loadData = async () => {
            await fetchTeams();
            await fetchRounds();
        };
        loadData();
    }, [selectedLeague]);

    const fetchTeams = async () => {
        const ref = collection(db, `leagues/${selectedLeague}/teams`);
        const snap = await getDocs(ref);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t => t.id !== '__init__');
        setTeams(list);
    };

    const fetchRounds = async () => {
        const [year, division] = selectedLeague.split('_');
        const bracketRef = collection(db, `leagues/${year}_${division}/playoff/rounds/bracketMatches`);
        const snap = await getDocs(bracketRef);

        const matches = snap.docs.map(doc => doc.data());

        const allTeamNames = new Set();
        matches.forEach(m => {
            if (m.teamA) allTeamNames.add(m.teamA);
            if (m.teamB) allTeamNames.add(m.teamB);
        });

        for (const name of allTeamNames) {
            const teamId = teams.find(t => t.name === name)?.id;
            if (teamId) await fetchPlayersForTeam(teamId);
        }

        const grouped = matches.reduce((acc, match) => {
            const round = match.tournamentRoundText || 'Neznámé kolo';
            if (!acc[round]) acc[round] = [];
            acc[round].push(match);
            return acc;
        }, {});

        const roundsArray = Object.entries(grouped).map(([round, matches]) => ({
            round,
            matches
        }));

        setRounds(roundsArray);
    };

    const handleChange = (round, index, field, value) => {
        setRounds(prev =>
            prev.map(r => r.round === round
                ? {
                    ...r,
                    matches: r.matches.map((m, i) =>
                        i === index ? { ...m, [field]: value } : m
                    )
                }
                : r
            )
        );
    };

    const fetchPlayersForTeam = async (teamId) => {
        if (!teamId) {
            console.warn("fetchPlayersForTeam called with undefined teamId");
            return;
        }
        if (players[teamId]) return;

        const [year, division] = selectedLeague.split('_');
        const ref = collection(db, `leagues/${year}_${division}/teams/${teamId}/players`);
        const snap = await getDocs(ref);
        const teamPlayers = snap.docs.map(doc => doc.data()?.name).filter(Boolean);
        setPlayers(prev => ({ ...prev, [teamId]: teamPlayers }));
    };

    const handleScorerChange = (matchId, teamKey, value) => {
        setScorers(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [teamKey]: value
            }
        }));
    };

    const handleGoalCountChange = (matchId, teamKey, playerName, value) => {
        setScorerGoals(prev => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [teamKey]: {
                    ...(prev[matchId]?.[teamKey] || {}),
                    [playerName]: value
                }
            }
        }));
    };

    const saveMatch = async (roundName, matchIndex) => {
        const [year, division] = selectedLeague.split('_');
        const match = rounds.find(r => r.round === roundName)?.matches?.[matchIndex];
        if (!match) return alert("Chyba při ukládání zápasu.");

        const teamA = typeof match.teamA === 'object' ? match.teamA.name : match.teamA;
        const teamB = typeof match.teamB === 'object' ? match.teamB.name : match.teamB;

        const teamAId = teams.find(t => t.name === teamA)?.id;
        const teamBId = teams.find(t => t.name === teamB)?.id;

        if (!teamAId || !teamBId) {
            console.warn("Team ID missing for scorer update", { teamA, teamAId, teamB, teamBId });
            return alert("Nepodařilo se uložit střelce – chyba v identifikaci týmu. Zkontrolujte názvy týmů.");
        }

        const scoreA = match.scoreA ?? 0;
        const scoreB = match.scoreB ?? 0;

        const updated = {
            ...match,
            tournamentRoundText: roundName,
            startTime: new Date().toISOString(),
            state: "SCHEDULED",
            teamA,
            teamB,
            scoreA,
            scoreB,
            participants: [
                {
                    id: teamA,
                    name: teamA,
                    resultText: scoreA.toString(),
                    isWinner: scoreA > scoreB
                },
                {
                    id: teamB,
                    name: teamB,
                    resultText: scoreB.toString(),
                    isWinner: scoreB > scoreA
                }
            ]
        };

        await setDoc(
            doc(db, `leagues/${year}_${division}/playoff/rounds/bracketMatches`, match.id),
            updated
        );

        const matchScorers = scorers[match.id] || {};
        const goals = scorerGoals[match.id] || {};

        const formatScorers = (teamKey) => {
            return (matchScorers[teamKey] || []).map(name => ({
                name,
                id: normalizeName(name),
                goals: goals?.[teamKey]?.[name] || 1
            }));
        };

        const teamAScorers = formatScorers('teamA');
        const teamBScorers = formatScorers('teamB');

        await setDoc(
            doc(db, `leagues/${year}_${division}/playoff/rounds/goalScorers`, match.id),
            {
                teamA: teamAScorers,
                teamB: teamBScorers
            }
        );

        const updatePlayerGoals = async (teamId, scorers) => {
            for (const scorer of scorers) {
                const playerId = scorer.id;
                const ref = doc(db, `leagues/${year}_${division}/teams/${teamId}/players/${playerId}`);
                const snap = await getDoc(ref);
                const prevData = snap.exists() ? snap.data() : {};
                await setDoc(ref, {
                    ...prevData,
                    name: scorer.name,
                    goals: (prevData.goals || 0) + scorer.goals
                });
            }
        };

        const updateGoalScorersCollection = async (teamId, scorers) => {
            const goalScorersRef = collection(db, `leagues/${year}_${division}/goalScorers`);
            const snapshot = await getDocs(goalScorersRef);

            for (const scorer of scorers) {
                const playerId = scorer.id;
                const existing = snapshot.docs.find(doc =>
                    doc.data().id === playerId && doc.data().team === teamId
                );

                if (existing) {
                    const scorerRef = doc(db, `leagues/${year}_${division}/goalScorers/${existing.id}`);
                    await updateDoc(scorerRef, { goals: (existing.data().goals || 0) + scorer.goals });
                } else {
                    const scorerRef = doc(goalScorersRef);
                    await setDoc(scorerRef, {
                        id: playerId,
                        name: scorer.name,
                        goals: scorer.goals,
                        team: teamId
                    });
                }
            }
        };

        await updatePlayerGoals(teamAId, teamAScorers);
        await updatePlayerGoals(teamBId, teamBScorers);
        await updateGoalScorersCollection(teamAId, teamAScorers);
        await updateGoalScorersCollection(teamBId, teamBScorers);

        setRounds(prev =>
            prev.map(r =>
                r.round === roundName
                    ? {
                        ...r,
                        matches: r.matches.map((m, i) =>
                            i === matchIndex ? updated : m
                        )
                    }
                    : r
            )
        );

        const roundMatches = rounds.find(r => r.round === roundName)?.matches || [];
        const updatedMatches = [
            ...roundMatches.slice(0, matchIndex),
            updated,
            ...roundMatches.slice(matchIndex + 1)
        ];

        await updateRound(year, division, roundName, updatedMatches);

        alert("Zápas uložen.");
    };

    const handleDeleteRound = async (roundName) => {
        const [year, division] = selectedLeague.split('_');
        const bracketRef = collection(db, `leagues/${year}_${division}/playoff/rounds/bracketMatches`);

        if (!window.confirm(`Opravdu chcete smazat celé kolo "${roundName}"?`)) return;

        const snapshot = await getDocs(bracketRef);
        const matchesToDelete = snapshot.docs.filter(doc =>
            doc.data().tournamentRoundText === roundName
        );

        const deletePromises = matchesToDelete.map(docSnap =>
            deleteDoc(doc(db, `leagues/${year}_${division}/playoff/rounds/bracketMatches`, docSnap.id))
        );

        await Promise.all(deletePromises);
        await deleteRoundAPI(year, division, roundName);
        await fetchRounds();
        alert(`Kolo "${roundName}" bylo smazáno.`);
    };

    const handleNewMatchChange = (index, field, value) => {
        setNewMatches(prev =>
            prev.map((match, i) =>
                i === index ? { ...match, [field]: value } : match
            )
        );
    };

    const addNewMatchRow = () => {
        setNewMatches(prev => [...prev, { teamA: '', teamB: '', scoreA: 0, scoreB: 0 }]);
    };


    const handleSaveNewRound = async () => {
        if (!newRoundName || newMatches.length === 0) {
            alert("Zadejte název kola a alespoň jeden zápas.");
            return;
        }

        const invalidMatch = newMatches.find(
            m =>
                !m.teamA || typeof m.teamA !== 'string' || m.teamA.trim() === '' ||
                !m.teamB || typeof m.teamB !== 'string' || m.teamB.trim() === ''
        );

        if (invalidMatch) {
            alert("Každý zápas musí mít vyplněné oba týmy.");
            return;
        }

        const [year, division] = selectedLeague.split('_');
        const cleanRoundId = newRoundName.trim().replace(/\s+/g, '_');

        const roundNumber = parseInt(cleanRoundId.match(/\d+/)?.[0], 10);
        const nextRoundNumber = isNaN(roundNumber) ? 2 : roundNumber + 1;
        const nextRoundId = `Kolo_${nextRoundNumber}`;
        const nextMatchesCount = Math.floor(newMatches.length / 2);

        const enrichedMatches = newMatches.map((match, i) => {
            const matchId = `match_${year}_${division}_${cleanRoundId}_${i}`;
            const nextMatchIndex = Math.floor(i / 2);
            const nextMatchId = `match_${year}_${division}_${nextRoundId}_${nextMatchIndex}`;

            const teamA = typeof match.teamA === 'object' ? match.teamA.name : match.teamA;
            const teamB = typeof match.teamB === 'object' ? match.teamB.name : match.teamB;

            const scoreA = match.scoreA ?? 0;
            const scoreB = match.scoreB ?? 0;

            return {
                id: matchId,
                name: `${newRoundName} ${i + 1}`,
                tournamentRoundText: newRoundName,
                startTime: new Date().toISOString(),
                state: "SCHEDULED",
                participants: [
                    {
                        id: teamA,
                        name: teamA,
                        resultText: scoreA.toString(),
                        isWinner: scoreA > scoreB
                    },
                    {
                        id: teamB,
                        name: teamB,
                        resultText: scoreB.toString(),
                        isWinner: scoreB > scoreA
                    }
                ],
                teamA,
                teamB,
                scoreA,
                scoreB,
                nextMatchId
            };
        });

        const placeholderMatches = Array.from({ length: nextMatchesCount }).map((_, i) => {
            const matchId = `match_${year}_${division}_${nextRoundId}_${i}`;
            return {
                id: matchId,
                name: `${nextRoundId.replace('_', ' ')} ${i + 1}`,
                tournamentRoundText: nextRoundId.replace('_', ' '),
                startTime: new Date().toISOString(),
                state: "SCHEDULED",
                participants: [
                    { id: "", name: "", resultText: "0", isWinner: false },
                    { id: "", name: "", resultText: "0", isWinner: false }
                ],
                teamA: "",
                teamB: "",
                scoreA: 0,
                scoreB: 0
            };
        });

        const allMatches = [...enrichedMatches, ...placeholderMatches];

        const savePromises = allMatches.map(match =>
            setDoc(
                doc(db, `leagues/${year}_${division}/playoff/rounds/bracketMatches`, match.id),
                match
            )
        );

        await Promise.all(savePromises);
        await saveRound(year, division, newRoundName, enrichedMatches);
        await fetchRounds();
        setNewRoundName('');
        setNewMatches([{ teamA: '', teamB: '', scoreA: 0, scoreB: 0 }]);
        alert(`Kolo "${newRoundName}" bylo uloženo.`);
    };

    return (
        <>
            <AdminNavbar />
            <div className="manage-playoffs-page">
                <h2>Správa Playoff</h2>
                <div className="playoff-controls">
                    <label>Vyberte ligu:</label>
                    <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
                        {leagues.map(l => (
                            <option key={l} value={l}>
                                {l.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {rounds.map(round => (
                    <div key={round.round} className="playoff-round">
                        <div className="round-header">
                            <h3>{round.round.replace('_', ' ').toUpperCase()}</h3>
                            <button className="delete-round-button" onClick={() => handleDeleteRound(round.round)}>
                                🗑️ Smazat kolo
                            </button>
                        </div>
                        {round.matches.map((match, i) => {
                            const teamAId = teams.find(t => t.name === match.teamA)?.id;
                            const teamBId = teams.find(t => t.name === match.teamB)?.id;

                            return (

                            <div key={match.id} className="playoff-match-row">

                                {/* TEAM A */}
                                <div className="team-block">
                                    <select
                                        value={match.teamA || ''}
                                        onChange={(e) => handleChange(round.round, i, 'teamA', e.target.value)}
                                        onFocus={() => fetchPlayersForTeam(teamAId)}
                                    >
                                        {teams.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                    </select>

                                    {/* TEAM A SCORERS */}
                                    <div className="scorer-form">
                                        <select
                                            value={selectedScorer[match.id]?.teamA || ''}
                                            onChange={(e) => setSelectedScorer(prev => ({
                                                ...prev,
                                                [match.id]: {
                                                    ...prev[match.id],
                                                    teamA: e.target.value
                                                }
                                            }))}
                                        >
                                            <option value="">Vyberte hráče</option>
                                            {(players[teamAId] || []).map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const name = selectedScorer[match.id]?.teamA;
                                                if (!name) return;
                                                const existing = (scorers[match.id]?.teamA || []).find(n => n === name);
                                                if (existing) return;

                                                handleScorerChange(match.id, 'teamA', [
                                                    ...(scorers[match.id]?.teamA || []),
                                                    name
                                                ]);

                                                handleGoalCountChange(match.id, 'teamA', name, 1);
                                            }}
                                        >
                                            +
                                        </button>

                                        <ul className="scorer-list">
                                            {(scorers[match.id]?.teamA || []).map((name) => (
                                                <li key={name}>
                                                    {name} ({scorerGoals[match.id]?.teamA?.[name] || 1} gólů)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </div>

                                {/* SCORE A */}
                                <input type="number" value={match.scoreA ?? 0}
                                       onChange={(e) => handleChange(round.round, i, 'scoreA', parseInt(e.target.value))}
                                />

                                <span>vs</span>

                                {/* SCORE B */}
                                <input type="number" value={match.scoreB ?? 0}
                                       onChange={(e) => handleChange(round.round, i, 'scoreB', parseInt(e.target.value))}
                                />

                                {/* TEAM B */}
                                <div className="team-block">
                                    <select
                                        value={match.teamB || ''}
                                        onChange={(e) => handleChange(round.round, i, 'teamB', e.target.value)}
                                        onFocus={() => fetchPlayersForTeam(teamBId)}
                                    >
                                        {teams.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                    </select>

                                    {/* TEAM B SCORERS */}
                                    <div className="scorer-form">
                                        <select
                                            value={selectedScorer[match.id]?.teamB || ''}
                                            onChange={(e) => setSelectedScorer(prev => ({
                                                ...prev,
                                                [match.id]: {
                                                    ...prev[match.id],
                                                    teamB: e.target.value
                                                }
                                            }))}
                                        >
                                            <option value="">Vyberte hráče</option>
                                            {(players[teamBId] || []).map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const name = selectedScorer[match.id]?.teamB;
                                                if (!name) return;
                                                const existing = (scorers[match.id]?.teamB || []).find(n => n === name);
                                                if (existing) return;

                                                handleScorerChange(match.id, 'teamB', [
                                                    ...(scorers[match.id]?.teamB || []),
                                                    name
                                                ]);

                                                handleGoalCountChange(match.id, 'teamB', name, 1);
                                            }}
                                        >
                                            +
                                        </button>

                                        <ul className="scorer-list">
                                            {(scorers[match.id]?.teamB || []).map((name) => (
                                                <li key={name}>
                                                    {name} ({scorerGoals[match.id]?.teamB?.[name] || 1} gólů)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                </div>

                                <button onClick={() => saveMatch(round.round, i)}>Uložit</button>
                            </div>
                            );
                        })}
                    </div>
                ))}

                <div className="playoff-round">
                    <div className="round-header">
                        <h3>Přidat nové kolo</h3>
                    </div>
                    <input
                        type="text"
                        placeholder="Název kola (např. semifinále)"
                        value={newRoundName}
                        onChange={(e) => setNewRoundName(e.target.value)}
                    />
                    {newMatches.map((match, i) => (
                        <div key={i} className="playoff-match-row">
                            <select value={match.teamA} onChange={(e) => handleNewMatchChange(i, 'teamA', e.target.value)}>
                                <option value="">Vyberte tým A</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                            <input type="number" value={match.scoreA} onChange={(e) => handleNewMatchChange(i, 'scoreA', parseInt(e.target.value))} />
                            <span>vs</span>
                            <input type="number" value={match.scoreB} onChange={(e) => handleNewMatchChange(i, 'scoreB', parseInt(e.target.value))} />
                            <select value={match.teamB} onChange={(e) => handleNewMatchChange(i, 'teamB', e.target.value)}>
                                <option value="">Vyberte tým B</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <div className="button-row">
                        <button className="add-btn" onClick={addNewMatchRow}>+ Přidat zápas</button>
                        <button className="save-btn" onClick={handleSaveNewRound}>💾 Uložit nové kolo</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManagePlayoffs;
