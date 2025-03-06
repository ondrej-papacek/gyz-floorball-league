import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import './ManageTeams.css';

const ManageTeams = ({ leagueId }) => {
    const [teams, setTeams] = useState([]);
    const [newTeam, setNewTeam] = useState('');

    useEffect(() => {
        const fetchTeams = async () => {
            const teamsRef = collection(db, `leagues/${leagueId}/teams`);
            const snapshot = await getDocs(teamsRef);
            setTeams(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };

        fetchTeams();
    }, [leagueId]);

    const addTeam = async () => {
        if (newTeam.trim()) {
            const teamsRef = collection(db, `leagues/${leagueId}/teams`);
            await addDoc(teamsRef, { name: newTeam, wins: 0, losses: 0, draws: 0 });
            setNewTeam('');
            alert('Tým přidán.');
        }
    };

    const deleteTeam = async (teamId) => {
        const teamRef = doc(db, `leagues/${leagueId}/teams`, teamId);
        await deleteDoc(teamRef);
        alert('Tým odstraněn.');
    };

    return (
        <div className="manage-teams-page">
            <h1>Správa Týmů</h1>
            <div className="add-team">
                <input
                    type="text"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    placeholder="Název týmu"
                />
                <button onClick={addTeam}>Přidat Tým</button>
            </div>
            <div className="team-list">
                {teams.map((team) => (
                    <div key={team.id} className="team-item">
                        <span>{team.name}</span>
                        <button onClick={() => deleteTeam(team.id)}>Smazat</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageTeams;
