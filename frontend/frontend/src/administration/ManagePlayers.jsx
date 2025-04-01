import React, { useEffect, useState } from 'react';
import {
    getPlayers,
    addPlayer,
    deletePlayer
} from '../services/playerService';
import { db } from '../services/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
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

    const fetchLeagues = async () => {
        const snapshot = await getDocs(collection(db, 'leagues'));
        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                label: `${d.division === 'lower' ? 'Nižší' : 'Vyšší'} ${d.year}`
            };
        });
        setLeagues(data);
        if (data.length > 0) setSelectedLeague(data[0].id); // default to first
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
        setPlayers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLeagues();
    }, []);

    useEffect(() => {
        fetchTeams();
        setSelectedTeamId('');
        setPlayers([]);
    }, [selectedLeague]);

    useEffect(() => {
        if (selectedTeamId) {
            fetchPlayers();
        }
    }, [selectedTeamId]);

    const handleAddPlayer = async () => {
        const name = newPlayerName.trim();
        if (!name) {
            alert("Jméno hráče nesmí být prázdné.");
            return;
        }

        const playerId = normalizeName(name);

        if (players.some(player => player.id === playerId)) {
            alert("Hráč se stejným ID již existuje v tomto týmu.");
            return;
        }

        const [year, division] = selectedLeague.split('_');
        const playerData = {
            name,
            id: playerId,
            goals: 0,
            team_id: selectedTeamId
        };

        await addPlayer(year, division, selectedTeamId, playerId, playerData);

        // ✅ Remove placeholder __init__ if it exists
        const initRef = doc(db, 'leagues', `${year}_${division}`, 'teams', selectedTeamId, 'players', '__init__');
        await deleteDoc(initRef).catch(() => {});

        setNewPlayerName('');
        fetchPlayers();
    };

    const handleDeletePlayer = async (id) => {
        const [year, division] = selectedLeague.split('_');
        if (window.confirm('Opravdu chcete odstranit tohoto hráče?')) {
            await deletePlayer(year, division, selectedTeamId, id);
            fetchPlayers();
        }
    };

    return (
        <>
            <AdminNavbar />
            <div className="manage-players">
                <h2>Správa hráčů</h2>

                <div className="select-controls">
                    <label>Vyberte ligu:</label>
                    <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)}>
                        {leagues.map((league) => (
                            <option key={league.id} value={league.id}>
                                {league.label}
                            </option>
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
                                        <td>{player.name}</td>
                                        <td>{player.goals}</td>
                                        <td>
                                            <button onClick={() => handleDeletePlayer(player.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default ManagePlayers;
