import React, { useState, useEffect } from 'react';
import '../pages/teams.css';
import { fetchTeams } from '../services/teamService';

function Teams() {
    const [teamsNizsi, setTeamsNizsi] = useState([]);
    const [teamsVyssi, setTeamsVyssi] = useState([]);
    const [expandedTeamsNizsi, setExpandedTeamsNizsi] = useState([]);
    const [expandedTeamsVyssi, setExpandedTeamsVyssi] = useState([]);

    useEffect(() => {
        fetchTeams(2025, 'lower').then(nizsi => {
            console.log("Nižší gymnázium teams (after transformation):", nizsi);
            setTeamsNizsi(nizsi);
        }).catch(error => console.error('Error fetching lower teams:', error));

        fetchTeams(2025, 'upper').then(vyssi => {
            console.log("Vyšší gymnázium teams (after transformation):", vyssi);
            setTeamsVyssi(vyssi);
        }).catch(error => console.error('Error fetching upper teams:', error));
    }, []);

    const toggleExpand = (teamId, setExpandedTeams, expandedTeams) => {
        setExpandedTeams((prevExpanded) =>
            prevExpanded.includes(teamId) ? prevExpanded.filter((id) => id !== teamId) : [...prevExpanded, teamId]
        );
    };

    const renderTeamRow = (team, expandedTeams, setExpandedTeams) => (
        <React.Fragment key={team.id}>
            {console.log("Rendering team:", team)}
            <tr>
                <td>{team.name}</td>
                <td>{team?.matchesPlayed ?? 0}</td>
                <td>{team?.wins ?? 0}</td>
                <td>{team?.draws ?? 0}</td>
                <td>{team?.losses ?? 0}</td>
                <td>{team?.goalsScored ?? 0}</td>
                <td>{team?.goalsConceded ?? 0}</td>
                <td>{team?.points ?? 0}</td>
                <td>
                    <button className="expand-btn"
                            onClick={() => toggleExpand(team.id, setExpandedTeams, expandedTeams)}>
                        {expandedTeams.includes(team.id) ? '▲' : '▼'}
                    </button>
                </td>
            </tr>
            {expandedTeams.includes(team.id) && (
                <tr key={`${team.id}-details`} className="expanded-row">
                    <td colSpan="9">
                        <div className="match-details">
                            <h4>Výsledky zápasů</h4>
                            <ul>
                                {team.matches?.length > 0 ? (
                                    team.matches.map((match, index) => (
                                        <li key={`${team.id}-${match.opponent}-${index}`}>
                                            {match.opponent} ({match.score})
                                        </li>
                                    ))
                                ) : (
                                    <li>Žádné výsledky nejsou dostupné</li>
                                )}
                            </ul>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );

    return (
        <div className="teams-page">
            <h2 className="teams-title">Týmy</h2>

            {/* Nižší gymnázium Section */}
            <div className="gym-section">
                <h3 className="gym-title">Nižší gymnázium</h3>
                <table className="teams-table">
                    <thead>
                    <tr>
                        <th>Tým</th>
                        <th>Odehrané zápasy</th>
                        <th>Výhry</th>
                        <th>Remízy</th>
                        <th>Prohry</th>
                        <th>Vstřelené góly</th>
                        <th>Obdržené góly</th>
                        <th>Body</th>
                        <th>Detail</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teamsNizsi.length > 0 ? (
                        teamsNizsi.map((team) => renderTeamRow(team, expandedTeamsNizsi, setExpandedTeamsNizsi))
                    ) : (
                        <tr><td colSpan="9" style={{ textAlign: "center" }}>Žádné týmy nejsou dostupné</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Vyšší gymnázium Section */}
            <div className="gym-section">
                <h3 className="gym-title">Vyšší gymnázium</h3>
                <table className="teams-table">
                    <thead>
                    <tr>
                        <th>Tým</th>
                        <th>Odehrané zápasy</th>
                        <th>Výhry</th>
                        <th>Remízy</th>
                        <th>Prohry</th>
                        <th>Vstřelené góly</th>
                        <th>Obdržené góly</th>
                        <th>Body</th>
                        <th>Detail</th>
                    </tr>
                    </thead>
                    <tbody>
                    {teamsVyssi.length > 0 ? (
                        teamsVyssi.map((team) => renderTeamRow(team, expandedTeamsVyssi, setExpandedTeamsVyssi))
                    ) : (
                        <tr>
                            <td colSpan="9" style={{textAlign: "center"}}>Žádné týmy nejsou dostupné</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Teams;
