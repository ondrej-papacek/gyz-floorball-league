import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { saveRound, updateRound, deleteRound } from '../services/playoffService';
import AdminNavbar from '../components/AdminNavbar';
import './managePlayoffs.css';

const ManagePlayoffs = () => {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [teams, setTeams] = useState([]);
    const [rounds, setRounds] = useState([]);
    const [newRoundName, setNewRoundName] = useState('');
    const [newMatches, setNewMatches] = useState([{ teamA: '', teamB: '', scoreA: 0, scoreB: 0 }]);

    useEffect(() => {
        const fetchLeagues = async () => {
            const leaguesSnap = await getDocs(collection(db, 'leagues'));
            const active = leaguesSnap.docs
                .filter(doc => doc.data().status !== 'archived')
                .map(doc => doc.id);

            if (active.length === 0) {
                setLeagues([]);
                setSelectedLeague('');
                return;
            }

            setLeagues(active);
            setSelectedLeague(active[0] || '');
        };
        fetchLeagues();
    }, []);

    useEffect(() => {
        if (!selectedLeague) return;
        fetchTeams();
        fetchRounds();
    }, [selectedLeague]);

    const fetchTeams = async () => {
        const ref = collection(db, `leagues/${selectedLeague}/teams`);
        const snap = await getDocs(ref);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t => t.id !== '__init__');
        setTeams(list);
    };

    const fetchRounds = async () => {
        const ref = doc(db, `leagues/${selectedLeague}/playoff/rounds`);
        const snap = await getDoc(ref);
        if (!snap.exists()) return setRounds([]);
        const data = snap.data();
        const list = Object.entries(data).map(([round, matches]) => ({
            round,
            matches
        }));
        setRounds(list);
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

    const saveMatch = async (roundName, matchIndex) => {
        const [year, division] = selectedLeague.split('_');
        const roundData = rounds.find(r => r.round === roundName);
        const matches = [...roundData.matches];
        await updateRound(year, division, roundName, matches);
        alert("Zápas uložen.");
    };

    const handleDeleteRound = async (roundName) => {
        const [year, division] = selectedLeague.split('_');
        if (!window.confirm(`Opravdu chcete smazat celé kolo "${roundName}"?`)) return;
        await deleteRound(year, division, roundName);
        fetchRounds();
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

        const [year, division] = selectedLeague.split('_');
        await saveRound(year, division, newRoundName, newMatches);

        const bracketMatchesRef = collection(db, `leagues/${year}_${division}/playoff/rounds/bracketMatches`);

        const bracketPromises = newMatches.map(async (match, i) => {
            const bracketMatch = {
                id: `match_${year}_${division}_${newRoundName}_${i}`,
                name: `${newRoundName} ${i + 1}`,
                tournamentRoundText: newRoundName,
                startTime: new Date().toISOString(),
                state: "SCHEDULED",
                participants: [
                    {
                        id: match.teamA,
                        name: match.teamA,
                        resultText: match.scoreA?.toString() ?? '0',
                        isWinner: (match.scoreA > match.scoreB)
                    },
                    {
                        id: match.teamB,
                        name: match.teamB,
                        resultText: match.scoreB?.toString() ?? '0',
                        isWinner: (match.scoreB > match.scoreA)
                    }
                ]
            };

            await setDoc(
                doc(bracketMatchesRef, bracketMatch.id),
                bracketMatch
            );
        });

        await Promise.all(bracketPromises);

        alert(`Kolo "${newRoundName}" bylo uloženo a přidáno do bracketu.`);
        await fetchRounds();
        setNewRoundName('');
        setNewMatches([{ teamA: '', teamB: '', scoreA: 0, scoreB: 0 }]);
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
                            <button
                                className="delete-round-button"
                                onClick={() => handleDeleteRound(round.round)}
                            >
                                🗑️ Smazat kolo
                            </button>
                        </div>
                        {round.matches.map((match, i) => (
                            <div key={i} className="playoff-match-row">
                                <select value={match.teamA} onChange={(e) => handleChange(round.round, i, 'teamA', e.target.value)}>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <input type="number" value={match.scoreA} onChange={(e) => handleChange(round.round, i, 'scoreA', parseInt(e.target.value))} />
                                <span>vs</span>
                                <input type="number" value={match.scoreB} onChange={(e) => handleChange(round.round, i, 'scoreB', parseInt(e.target.value))} />
                                <select value={match.teamB} onChange={(e) => handleChange(round.round, i, 'teamB', e.target.value)}>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => saveMatch(round.round, i)}>Uložit</button>
                            </div>
                        ))}
                    </div>
                ))}

                {/* New Round Form */}
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
