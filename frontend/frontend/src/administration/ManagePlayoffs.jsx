import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import {
    collection, getDocs, doc, getDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import AdminNavbar from '../components/AdminNavbar';
import './managePlayoffs.css';

const ManagePlayoffs = () => {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [teams, setTeams] = useState([]);
    const [rounds, setRounds] = useState([]);

    useEffect(() => {
        const fetchLeagues = async () => {
            const leaguesSnap = await getDocs(collection(db, 'leagues'));
            const ids = leaguesSnap.docs.map(doc => doc.id);
            setLeagues(ids);
            setSelectedLeague(ids[0] || '');
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
        const roundData = rounds.find(r => r.round === roundName);
        const matchList = [...roundData.matches];
        const updatedMatch = matchList[matchIndex];

        const ref = doc(db, `leagues/${selectedLeague}/playoff/rounds`);
        await setDoc(ref, { [roundName]: matchList }, { merge: true });
        alert("Zápas uložen.");
    };

    const generatePlayoffFor = async (division) => {
        const leagueId = `2025_${division}`;
        const ref = collection(db, `leagues/${leagueId}/teams`);
        const snap = await getDocs(ref);
        let list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(t => t.id !== '__init__')
            .sort((a, b) => b.points - a.points);

        let playoff = {};
        if (division === 'lower') {
            if (list.length < 4) return alert("Min. 4 týmy potřeba.");
            playoff = {
                round_1: [
                    { teamA: list[0].name, teamB: list[3].name, scoreA: 0, scoreB: 0 },
                    { teamA: list[1].name, teamB: list[2].name, scoreA: 0, scoreB: 0 }
                ],
                final: [{ teamA: "", teamB: "", scoreA: 0, scoreB: 0 }],
                third_place: [{ teamA: "", teamB: "", scoreA: 0, scoreB: 0 }]
            };
        } else if (division === 'upper') {
            if (list.length < 5) return alert("Min. 5 týmů potřeba.");
            playoff = {
                round_1: [
                    { teamA: list[3].name, teamB: list[4].name, scoreA: 0, scoreB: 0 }
                ],
                round_2: [
                    { teamA: list[0].name, teamB: "", scoreA: 0, scoreB: 0 },
                    { teamA: list[1].name, teamB: list[2].name, scoreA: 0, scoreB: 0 }
                ],
                final: [{ teamA: "", teamB: "", scoreA: 0, scoreB: 0 }],
                third_place: [{ teamA: "", teamB: "", scoreA: 0, scoreB: 0 }]
            };
        }

        const docRef = doc(db, `leagues/${leagueId}/playoff/rounds`);
        await setDoc(docRef, playoff);

        const initRef = doc(db, `leagues/${leagueId}/playoff/__init__`);
        await deleteDoc(initRef).catch(() => { });

        alert(`Playoff pro ${division.toUpperCase()} vytvořen.`);
        if (leagueId === selectedLeague) fetchRounds();
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

                <div className="create-buttons">
                    <button onClick={() => generatePlayoffFor('lower')}>Vytvořit playoff Nižší</button>
                    <button onClick={() => generatePlayoffFor('upper')}>Vytvořit playoff Vyšší</button>
                </div>

                {rounds.map(round => (
                    <div key={round.round} className="playoff-round">
                        <h3>{round.round.replace('_', ' ').toUpperCase()}</h3>
                        {round.matches.map((match, i) => (
                            <div key={i} className="playoff-match-row">
                                <select value={match.teamA}
                                        onChange={(e) => handleChange(round.round, i, 'teamA', e.target.value)}>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <input type="number" value={match.scoreA}
                                       onChange={(e) => handleChange(round.round, i, 'scoreA', parseInt(e.target.value))} />
                                <span>vs</span>
                                <input type="number" value={match.scoreB}
                                       onChange={(e) => handleChange(round.round, i, 'scoreB', parseInt(e.target.value))} />
                                <select value={match.teamB}
                                        onChange={(e) => handleChange(round.round, i, 'teamB', e.target.value)}>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => saveMatch(round.round, i)}>Uložit</button>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default ManagePlayoffs;
