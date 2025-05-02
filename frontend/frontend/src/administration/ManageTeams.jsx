import React, { useState, useEffect } from 'react';
import './manageTeams.css';
import AdminNavbar from '../components/AdminNavbar';
import {
    fetchTeams,
    addTeam,
    deleteTeam,
    updateTeam,
    fetchMatchesForTeam
} from '../services/teamService';
import { getDoc, deleteDoc, doc, getDocs, collection } from 'firebase/firestore';
import { db } from '../services/firebase';

const ManageTeams = () => {
    const [leagues, setLeagues] = useState([]);
    const [selectedLeagueId, setSelectedLeagueId] = useState('');
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [expanded, setExpanded] = useState([]);

    const fetchLeagues = async () => {
        const snapshot = await getDocs(collection(db, 'leagues'));
        const data = snapshot.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                label: `${d.division === 'lower' ? 'Nižší' : 'Vyšší'} ${d.year}`,
                status: d.status
            };
        });

        const activeLeagues = data.filter(l => l.status !== 'archived');
        setLeagues(activeLeagues);
        if (activeLeagues.length > 0) setSelectedLeagueId(activeLeagues[0].id);
    };

    const loadTeams = async () => {
        if (!selectedLeagueId) return;

        const leagueExists = leagues.find(l => l.id === selectedLeagueId);
        if (!leagueExists) return;

        const [year, division] = selectedLeagueId.split('_');
        const data = await fetchTeams(year, division);
        const filtered = data.filter(t => t.id !== '__init__');
        const sorted = filtered.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
        setTeams(sorted);
        setExpanded([]);
    };

    useEffect(() => {
        fetchLeagues();
    }, []);

    useEffect(() => {
        loadTeams();
    }, [selectedLeagueId]);

    const handleAdd = async () => {
        if (!newTeamName.trim()) return;
        const [year, division] = selectedLeagueId.split('_');

        const newTeam = {
            name: newTeamName.trim(),
            wins: 0,
            draws: 0,
            losses: 0,
            matchesPlayed: 0,
            goalsScored: 0,
            goalsConceded: 0,
            points: 0
        };

        await addTeam(year, division, newTeam);

        const initDocRef = doc(db, `leagues/${selectedLeagueId}/teams/__init__`);
        await deleteDoc(initDocRef).catch(() => {});

        setNewTeamName('');
        await loadTeams();
    };

    const handleDelete = async (id) => {
        const [year, division] = selectedLeagueId.split('_');
        await deleteTeam(year, division, id);
        await loadTeams();
    };

    const handleStatChange = (id, field, value) => {
        setTeams(prev =>
            prev.map(team =>
                team.id === id ? { ...team, [field]: Number(value) || 0 } : team
            )
        );
    };

    const handleSave = async (team) => {
        const [year, division] = selectedLeagueId.split('_');

        const teamRef = doc(db, `leagues/${year}_${division}/teams/${team.id}`);
        const snap = await getDoc(teamRef);
        const currentData = snap.exists() ? snap.data() : {};

        const updatedData = {
            ...currentData,
            name: team.name,
            wins: team.wins ?? currentData.wins ?? 0,
            draws: team.draws ?? currentData.draws ?? 0,
            losses: team.losses ?? currentData.losses ?? 0,
            goalsScored: team.goalsScored ?? currentData.goalsScored ?? 0,
            goalsConceded: team.goalsConceded ?? currentData.goalsConceded ?? 0,
            matchesPlayed: team.matchesPlayed ?? currentData.matchesPlayed ?? 0,
            points: team.points ?? currentData.points ?? 0,
        };

        await updateTeam(year, division, team.id, updatedData);
        await loadTeams();
    };

    const toggleExpand = async (id) => {
        const [year, division] = selectedLeagueId.split('_');
        if (expanded.includes(id)) {
            setExpanded(expanded.filter(e => e !== id));
        } else {
            const matches = await fetchMatchesForTeam(year, division, id);
            setTeams(prev =>
                prev.map(team =>
                    team.id === id ? { ...team, matches } : team
                )
            );
            setExpanded([...expanded, id]);
        }
    };

    const recalculateTeam = async (team) => {
        const [year, division] = selectedLeagueId.split('_');
        const matches = await fetchMatchesForTeam(year, division, team.id);
        let wins = 0, draws = 0, losses = 0, scored = 0, conceded = 0, points = 0;
        matches.forEach(match => {
            const isA = match.teamA_id === team.id;
            const teamGoals = isA ? match.scoreA : match.scoreB;
            const opponentGoals = isA ? match.scoreB : match.scoreA;
            scored += teamGoals;
            conceded += opponentGoals;
            if (teamGoals > opponentGoals) { wins++; points += 3; }
            else if (teamGoals === opponentGoals) { draws++; points += 1; }
            else { losses++; }
        });
        const updated = {
            ...team,
            wins,
            draws,
            losses,
            goalsScored: scored,
            goalsConceded: conceded,
            matchesPlayed: matches.length,
            points
        };
        await updateTeam(year, division, team.id, updated);
        await loadTeams();
    };

    const recalculateAll = async () => {
        for (const team of teams) {
            await recalculateTeam(team);
        }
    };

    return (
        <>
            <AdminNavbar />
            <div className="manage-teams">
                <h2>Správa týmů</h2>

                <div className="manage-year-selector">
                    <label>Ročník:</label>
                    <select
                        value={selectedLeagueId}
                        onChange={(e) => setSelectedLeagueId(e.target.value)}
                    >
                        {leagues.map((l, i) => (
                            <option key={i} value={l.id}>
                                {l.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="add-team">
                    <input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Název nového týmu"
                    />
                    <button onClick={handleAdd}>Přidat</button>
                    <button className="bulk-recalc" onClick={recalculateAll}>Přepočítat všechny</button>
                </div>

                <div className="team-table">
                    <table>
                        <thead>
                        <tr>
                            <th>Název</th>
                            <th>Výhra</th>
                            <th>Remíza</th>
                            <th>Prohra</th>
                            <th>Zápasy</th>
                            <th>Vstřelené</th>
                            <th>Obdržené</th>
                            <th>Body</th>
                            <th>Akce</th>
                        </tr>
                        </thead>
                        <tbody>
                        {teams.map(team => (
                            <React.Fragment key={team.id}>
                                <tr>
                                    <td className="team-name-cell">
                                        <img
                                            className="team-logo"
                                            src={`/images/team-logos/${team.name?.toLowerCase?.() || 'placeholder'}.png`}
                                            alt={team.name || 'Tým'}
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                        {team.name}
                                    </td>
                                    <td><input type="number" value={team.wins ?? 0} onChange={e => handleStatChange(team.id, 'wins', e.target.value)} /></td>
                                    <td><input type="number" value={team.draws ?? 0} onChange={e => handleStatChange(team.id, 'draws', e.target.value)} /></td>
                                    <td><input type="number" value={team.losses ?? 0} onChange={e => handleStatChange(team.id, 'losses', e.target.value)} /></td>
                                    <td><input type="number" value={team.matchesPlayed ?? 0} onChange={e => handleStatChange(team.id, 'matchesPlayed', e.target.value)} /></td>
                                    <td><input type="number" value={team.goalsScored ?? 0} onChange={e => handleStatChange(team.id, 'goalsScored', e.target.value)} /></td>
                                    <td><input type="number" value={team.goalsConceded ?? 0} onChange={e => handleStatChange(team.id, 'goalsConceded', e.target.value)} /></td>
                                    <td><input type="number" value={team.points ?? 0} onChange={e => handleStatChange(team.id, 'points', e.target.value)} /></td>
                                    <td>
                                        <button onClick={() => handleSave(team)}>Uložit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(team.id)}>Odstranit</button>
                                        <button onClick={() => recalculateTeam(team)}>Přepočítat</button>
                                        <button onClick={() => toggleExpand(team.id)}>{expanded.includes(team.id) ? '▲' : '▼'}</button>
                                    </td>
                                </tr>
                                {expanded.includes(team.id) && (
                                    <tr className="expanded-row">
                                        <td colSpan="9">
                                            <div className="match-details">
                                                <h4>Výsledky zápasů</h4>
                                                <ul>
                                                    {team.matches?.length > 0 ? (
                                                        team.matches.map((match, i) => (
                                                            <li key={i}>
                                                                {match.teamA_name} {match.scoreA}:{match.scoreB} {match.teamB_name}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>Žádné výsledky</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ManageTeams;
