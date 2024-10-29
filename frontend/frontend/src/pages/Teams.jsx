import React, { useState } from 'react';
import '../pages/teams.css';

// Mock data for teams and matches
export const teamData = {
    nizsi: [
        {
            id: 1,
            name: "Prima",
            stats: { played: 10, wins: 6, draws: 2, losses: 2, goalsFor: 18, goalsAgainst: 10, points: 20 },
            matches: [
                { opponent: "Sekunda", score: "0:4" },
                { opponent: "Tercie", score: "2:3" },
                { opponent: "Kvarta", score: "1:8" }
            ]
        },
        {
            id: 2,
            name: "Sekunda",
            stats: { played: 10, wins: 4, draws: 3, losses: 3, goalsFor: 15, goalsAgainst: 12, points: 15 },
            matches: [
                { opponent: "Prima", score: "4:0" },
                { opponent: "Tercie", score: "1:1" },
                { opponent: "Kvarta", score: "3:2" }
            ]
        },
        {
            id: 3,
            name: "Tercie",
            stats: { played: 10, wins: 3, draws: 4, losses: 3, goalsFor: 12, goalsAgainst: 12, points: 13 },
            matches: [
                { opponent: "Prima", score: "3:2" },
                { opponent: "Sekunda", score: "1:1" },
                { opponent: "Kvarta", score: "2:2" }
            ]
        },
        {
            id: 4,
            name: "Kvarta",
            stats: { played: 10, wins: 2, draws: 2, losses: 6, goalsFor: 8, goalsAgainst: 18, points: 8 },
            matches: [
                { opponent: "Prima", score: "8:1" },
                { opponent: "Sekunda", score: "2:3" },
                { opponent: "Tercie", score: "2:2" }
            ]
        }
    ],
    vyssi: [
        {
            id: 1,
            name: "Prváci",
            stats: { played: 10, wins: 5, draws: 3, losses: 2, goalsFor: 17, goalsAgainst: 11, points: 18 },
            matches: [
                { opponent: "Druháci", score: "2:2" },
                { opponent: "Třeťáci", score: "1:3" },
                { opponent: "Čtvrťáci", score: "0:1" }
            ]
        },
        {
            id: 2,
            name: "Druháci",
            stats: { played: 10, wins: 4, draws: 3, losses: 3, goalsFor: 15, goalsAgainst: 14, points: 15 },
            matches: [
                { opponent: "Prváci", score: "2:2" },
                { opponent: "Třeťáci", score: "3:3" },
                { opponent: "Čtvrťáci", score: "4:1" }
            ]
        },
        {
            id: 3,
            name: "Třeťáci",
            stats: { played: 10, wins: 6, draws: 1, losses: 3, goalsFor: 18, goalsAgainst: 13, points: 19 },
            matches: [
                { opponent: "Prváci", score: "3:1" },
                { opponent: "Druháci", score: "3:3" },
                { opponent: "Čtvrťáci", score: "2:2" }
            ]
        },
        {
            id: 4,
            name: "Čtvrťáci",
            stats: { played: 10, wins: 3, draws: 4, losses: 3, goalsFor: 13, goalsAgainst: 15, points: 13 },
            matches: [
                { opponent: "Prváci", score: "1:0" },
                { opponent: "Druháci", score: "1:4" },
                { opponent: "Třeťáci", score: "2:2" }
            ]
        },
        {
            id: 5,
            name: "Učitelé",
            stats: { played: 10, wins: 7, draws: 1, losses: 2, goalsFor: 20, goalsAgainst: 9, points: 22 },
            matches: [
                { opponent: "Prváci", score: "5:2" },
                { opponent: "Druháci", score: "4:3" },
                { opponent: "Čtvrťáci", score: "2:1" }
            ]
        }
    ]
};

function Teams() {
    const [expandedTeamIdsNizsi, setExpandedTeamIdsNizsi] = useState([]);
    const [expandedTeamIdsVyssi, setExpandedTeamIdsVyssi] = useState([]);

    const toggleExpandNizsi = (teamId) => {
        setExpandedTeamIdsNizsi((prevExpandedIds) =>
            prevExpandedIds.includes(teamId)
                ? prevExpandedIds.filter((id) => id !== teamId)
                : [...prevExpandedIds, teamId]
        );
    };

    const toggleExpandVyssi = (teamId) => {
        setExpandedTeamIdsVyssi((prevExpandedIds) =>
            prevExpandedIds.includes(teamId)
                ? prevExpandedIds.filter((id) => id !== teamId)
                : [...prevExpandedIds, teamId]
        );
    };

    const renderTeamRow = (team, expandedTeamIds, toggleExpand) => (
        <>
            <tr key={team.id}>
                <td>{team.name}</td>
                <td>{team.stats.played}</td>
                <td>{team.stats.wins}</td>
                <td>{team.stats.draws}</td>
                <td>{team.stats.losses}</td>
                <td>{team.stats.goalsFor}</td>
                <td>{team.stats.goalsAgainst}</td>
                <td>{team.stats.points}</td>
                <td>
                    <button className="expand-btn" onClick={() => toggleExpand(team.id)}>
                        {expandedTeamIds.includes(team.id) ? '▲' : '▼'}
                    </button>
                </td>
            </tr>
            {expandedTeamIds.includes(team.id) && (
                <tr key={`${team.id}-details`} className="expanded-row">
                    <td colSpan="9">
                        <div className="match-details">
                            <h4>Výsledky zápasů</h4>
                            <ul>
                                {team.matches.map((match, index) => (
                                    <li key={index}>{match.opponent} ({match.score})</li>
                                ))}
                            </ul>
                        </div>
                    </td>
                </tr>
            )}
        </>
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
                    {teamData.nizsi.map((team) =>
                        renderTeamRow(team, expandedTeamIdsNizsi, toggleExpandNizsi)
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
                    {teamData.vyssi.map((team) =>
                        renderTeamRow(team, expandedTeamIdsVyssi, toggleExpandVyssi)
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Teams;
