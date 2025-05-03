import React, { useEffect, useState } from 'react';
import {
    getPlayers,
    addPlayer,
    deletePlayer,
    updatePlayer
} from '../services/playerService';
import { db } from '../services/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import './managePlayers.css';
import AdminNavbar from '../components/AdminNavbar';

const normalizeName = (name) => {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .split(' ')
        .reverse()
        .join('_');
};

const ManagePlayers = () => {
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [editFields, setEditFields] = useState({ name: '', goals: 0 });

    const fetchLeagues = async () => {
        const snapshot = await getDocs(collection(db, 'leagues'));
        const active = snapshot.docs
            .filter(doc => doc.data().status !== 'archived')
            .map(doc => {
                const d = doc.data();
                return {
                    id: doc.id,
                    label: `${d.division === 'lower' ? 'Nižší' : 'Vyšší'} ${d.year}`
                };
            });

        if (active.length === 0) {
            setLeagues([]);
            setSelectedLeague('');
            return;
        }

        setLeagues(active);
        setSelectedLeague(active[0].id);
    };

    const fetchTeams = async () => {
        if (!selectedLeague) return;
        const [year, division] = selectedLeague.split('_');
        const teamsSnapshot = await getDocs(
            collection(db, 'leagues', `${year}_${division}`, 'teams')
        );
        const loadedTeams = teamsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setTeams(loadedTeams);
    };

    const fetchPlayers = async () => {
        const [year, division] = selectedLeague.split('_');
        if (!selectedTeamId) return;
        setLoading(true);

        const data = await getPlayers(year, division, selectedTeamId);
        const goalScorersSnap = await getDocs(collection(db, `leagues/${year}_${division}/goalScorers`));
        const goalScorers = goalScorersSnap.docs.map(doc => doc.data());

        const enriched = data.map(player => {
            const scorer = goalScorers.find(s =>
                normalizeName(s.name) === normalizeName(player.name) &&
                s.team === selectedTeamId
            );
            return {
                ...player,
                goals: scorer ? scorer.goals : player.goals || 0
            };
        });

        setPlayers(enriched);
        setLoading(false);
    };

    useEffect(() => {
        (async () => {
            await fetchLeagues();
        })();
    }, []);

    useEffect(() => {
        (async () => {
            await fetchTeams();
            setSelectedTeamId('');
            setPlayers([]);
        })();
    }, [selectedLeague]);

    useEffect(() => {
        (async () => {
            if (selectedTeamId) await fetchPlayers();
        })();
    }, [selectedTeamId]);

    const handleAddPlayer = async () => {
        const name = newPlayerName.trim();
        if (!name) return alert("Jméno hráče nesmí být prázdné.");
        const playerId = normalizeName(name);
        if (players.some(player => player.id === playerId)) {
            return alert("Hráč se stejným ID již existuje.");
        }
        const [year, division] = selectedLeague.split('_');
        const playerData = { name, id: playerId, goals: 0, team_id: selectedTeamId };
        await addPlayer(year, division, selectedTeamId, playerId, playerData);
        await deleteDoc(doc(db, 'leagues', `${year}_${division}`, 'teams', selectedTeamId, 'players', 'placeholder')).catch(() => {});
        setNewPlayerName('');
        await fetchPlayers();
    };

    const handleDeletePlayer = async (id) => {
        const [year, division] = selectedLeague.split('_');
        if (window.confirm('Opravdu chcete odstranit tohoto hráče?')) {
            await deletePlayer(year, division, selectedTeamId, id);
            await fetchPlayers();
        }
    };

    const handleEditClick = (player) => {
        setEditing(player.id);
        setEditFields({ name: player.name, goals: player.goals });
    };

    const handleSaveEdit = async (player) => {
        const [year, division] = selectedLeague.split('_');
        const updatedData = {
            name: editFields.name.trim(),
            goals: Number(editFields.goals) || 0,
        };

        await updatePlayer(year, division, selectedTeamId, player.id, {
            ...updatedData,
            team_id: selectedTeamId
        });

        const goalScorersSnap = await getDocs(collection(db, `leagues/${year}_${division}/goalScorers`));
        const normalizedId = normalizeName(updatedData.name);
        const scorerDoc = goalScorersSnap.docs.find(
            doc => normalizeName(doc.data().name) === normalizedId && doc.data().team === selectedTeamId
        );

        if (scorerDoc) {
            const scorerRef = doc(db, `leagues/${year}_${division}/goalScorers/${scorerDoc.id}`);
            await updateDoc(scorerRef, { goals: updatedData.goals });
        }

        setEditing(null);
        await fetchPlayers();
    };

    return (
        <>
            <AdminNavbar />
            <div className="manage-players">
                <h2>Správa hráčů</h2>

                {leagues.length === 0 ? (
                    <p>Žádné aktivní ligy nejsou k dispozici.</p>
                ) : (
                    <>
                        <div className="select-controls">
                            <label>Vyberte ligu:</label>
                            <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
                                {leagues.map((league) => (
                                    <option key={league.id} value={league.id}>{league.label}</option>
                                ))}
                            </select>

                            <label>Vyberte tým:</label>
                            <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
                                <option value="">-- Vyber tým --</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedTeamId && (
                            <>
                                <div className="add-player-form">
                                    <input
                                        type="text"
                                        placeholder="Zadejte jméno hráče (např. Pavel Řehák)"
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                    />
                                    <button onClick={handleAddPlayer}>+ Přidat hráče</button>
                                </div>

                                {loading ? (
                                    <p>Načítání hráčů...</p>
                                ) : (
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Jméno</th>
                                            <th>Góly</th>
                                            <th>Akce</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {players.map(player => (
                                            <tr key={player.id}>
                                                <td>
                                                    {editing === player.id ? (
                                                        <input
                                                            value={editFields.name}
                                                            onChange={(e) => setEditFields(prev => ({ ...prev, name: e.target.value }))}
                                                        />
                                                    ) : player.name}
                                                </td>
                                                <td>
                                                    {editing === player.id ? (
                                                        <input
                                                            type="number"
                                                            value={editFields.goals}
                                                            onChange={(e) => setEditFields(prev => ({ ...prev, goals: e.target.value }))}
                                                        />
                                                    ) : player.goals}
                                                </td>
                                                <td>
                                                    {editing === player.id ? (
                                                        <button className={"save-btn"} onClick={() => handleSaveEdit(player)}>💾</button>
                                                    ) : (
                                                        <button className={"edit-btn"} onClick={() => handleEditClick(player)}>✏️</button>
                                                    )}
                                                    <button className={"delete-btn"} onClick={() => handleDeletePlayer(player.id)}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default ManagePlayers;
