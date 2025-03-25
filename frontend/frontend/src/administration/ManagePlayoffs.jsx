import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import './managePlayoffs.css';

const ManagePlayoffs = () => {
    const { leagueId } = useParams(); // Get league ID from URL
    const [playoffRounds, setPlayoffRounds] = useState([]);
    const [editingScores, setEditingScores] = useState({});

    useEffect(() => {
        const fetchPlayoffRounds = async () => {
            const roundsRef = collection(db, `leagues/${leagueId}/playoff`);
            const snapshot = await getDocs(roundsRef);
            const rounds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlayoffRounds(rounds);
        };

        fetchPlayoffRounds();
    }, [leagueId]);

    // Update Score
    const updateScore = async (roundId, matchId, scoreA, scoreB) => {
        const matchRef = doc(db, `leagues/${leagueId}/playoff/${roundId}`);
        await updateDoc(matchRef, { scoreA, scoreB });
        setEditingScores({}); // Reset edit state
        alert("Skóre bylo aktualizováno.");
    };

    // Generate Playoffs (4 best teams)
    const generatePlayoffMatches = async () => {
        const teamsRef = collection(db, `leagues/${leagueId}/teams`);
        const teamsSnapshot = await getDocs(teamsRef);
        let teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        teams.sort((a, b) => b.points - a.points); // Sort by points
        teams = teams.slice(0, 4); // Get top 4 teams

        if (teams.length < 4) {
            alert("Playoff nelze vytvořit, není dostatek týmů.");
            return;
        }

        const rounds = {
            round_1: { teamA: teams[0].name, teamB: teams[3].name, scoreA: 0, scoreB: 0 },
            round_2: { teamA: teams[1].name, teamB: teams[2].name, scoreA: 0, scoreB: 0 },
            third_place: { teamA: "", teamB: "", scoreA: 0, scoreB: 0 },
            final: { teamA: "", teamB: "", scoreA: 0, scoreB: 0 }
        };

        for (const [round, data] of Object.entries(rounds)) {
            await setDoc(doc(db, `leagues/${leagueId}/playoff`, round), data);
        }

        alert("Playoff byl vygenerován.");
    };

    return (
        <div className="manage-playoffs-page">
            <h1>Správa Playoff</h1>
            <button onClick={generatePlayoffMatches}>Generovat Playoff</button>
            {playoffRounds.map(round => (
                <div key={round.id} className="playoff-round">
                    <h2>{round.id.replace('_', ' ').toUpperCase()}</h2>
                    <p>{round.teamA} vs {round.teamB}</p>
                    {editingScores[round.id] ? (
                        <div className="edit-score">
                            <input
                                type="number"
                                defaultValue={round.scoreA}
                                onChange={(e) => setEditingScores(prev => ({ ...prev, scoreA: e.target.value }))}
                            />
                            <span> - </span>
                            <input
                                type="number"
                                defaultValue={round.scoreB}
                                onChange={(e) => setEditingScores(prev => ({ ...prev, scoreB: e.target.value }))}
                            />
                            <button onClick={() => updateScore(round.id, round.scoreA, round.scoreB)}>Uložit</button>
                        </div>
                    ) : (
                        <p>Skóre: {round.scoreA} - {round.scoreB}</p>
                    )}
                    <button onClick={() => setEditingScores({ [round.id]: true })}>Upravit Skóre</button>
                </div>
            ))}
        </div>
    );
};

export default ManagePlayoffs;
