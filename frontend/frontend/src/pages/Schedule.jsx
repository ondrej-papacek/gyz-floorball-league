import React from 'react';
import '../pages/schedule.css';
import { teamData } from './Teams';

const getNextFriday = (date) => {
    const nextFriday = new Date(date);
    nextFriday.setDate(date.getDate() + ((5 - date.getDay() + 7) % 7));
    return nextFriday;
}

const generateFridays = (totalFridays) => {
    const fridays = [];
    let currentFriday = getNextFriday(new Date());
    for (let i = 0; i < totalFridays; i++) {
        fridays.push(currentFriday.toLocaleDateString('cs-CZ'));
        currentFriday.setDate(currentFriday.getDate() + 7);
    }
    return fridays;
}

// Berger Table Algorithm for generating a round-robin tournament
const generateBergerTable = (teams, cycles = 2) => {
    const rounds = [];
    const numRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
    const halfSize = Math.floor(teams.length / 2);
    const rotatedTeams = [...teams];

    for (let cycle = 0; cycle < cycles; cycle++) {
        for (let round = 0; round < numRounds; round++) {
            const matches = [];
            for (let i = 0; i < halfSize; i++) {
                const home = rotatedTeams[i];
                const away = rotatedTeams[rotatedTeams.length - 1 - i];
                if (home && away) {
                    matches.push({
                        home: cycle === 0 ? home.name : away.name,
                        away: cycle === 0 ? away.name : home.name,
                    });
                }
            }
            rounds.push(matches);

            const lastElement = rotatedTeams.pop();
            rotatedTeams.splice(1, 0, lastElement);
        }
    }

    return rounds;
};

function Schedule() {
    const nizsiRounds = generateBergerTable(teamData.nizsi);
    const vyssiRounds = generateBergerTable(teamData.vyssi);

    const totalFridays = Math.max(nizsiRounds.length, vyssiRounds.length);
    const fridays = generateFridays(totalFridays);

    return (
        <div className="schedule-page">
            <h2 className="schedule-title">Rozpis zápasů</h2>

            <div className="gym-section">
                <h3 className="gym-title">Nižší gymnázium</h3>
                <div className="rounds-container">
                    {nizsiRounds.map((round, index) => (
                        <div key={`nizsi-round-${index}`} className="round">
                            <h4>Kolo {index + 1} {index < nizsiRounds.length / 2 ? '(1. cyklus)' : '(2. cyklus)'}</h4>
                            <h5 className="friday-date">
                                {fridays[index]}
                            </h5>
                            <ul className="match-list">
                                {round.map((match, matchIndex) => (
                                    <li key={matchIndex} className="match">
                                        {match.home} vs {match.away}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="gym-section">
                <h3 className="gym-title">Vyšší gymnázium</h3>
                <div className="rounds-container">
                    {vyssiRounds.map((round, index) => (
                        <div key={`vyssi-round-${index}`} className="round">
                            <h4>Kolo {index + 1} {index < vyssiRounds.length / 2 ? '(1. cyklus)' : '(2. cyklus)'}</h4>
                            <h5 className="friday-date">
                                {index < fridays.length ? fridays[index] : fridays[fridays.length - 1]}
                            </h5>
                            <ul className="match-list">
                                {round.map((match, matchIndex) => (
                                    <li key={matchIndex} className="match">
                                        {match.home} vs {match.away}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Schedule;
