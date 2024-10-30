import React from 'react';
import '../pages/goalScorers.css';

// Mock data for goal scorers
const goalScorersData = {
    nizsi: [
        { id: 1, name: "Jan Novák", goals: 15, team: "Prima" },
        { id: 2, name: "Petr Svoboda", goals: 12, team: "Sekunda" },
        { id: 3, name: "Eva Kovářová", goals: 10, team: "Tercie" },
        { id: 4, name: "Anna Procházková", goals: 8, team: "Kvarta" },
        { id: 5, name: "Karel Dvořák", goals: 7, team: "Sekunda" },
        { id: 6, name: "Martin Beneš", goals: 6, team: "Prima" },
        { id: 7, name: "Kateřina Novotná", goals: 5, team: "Tercie" },
        { id: 8, name: "Tomáš Krejčí", goals: 4, team: "Kvarta" },
        { id: 9, name: "Ivana Černá", goals: 3, team: "Prima" },
        { id: 10, name: "Marek Horák", goals: 2, team: "Sekunda" }
    ],
    vyssi: [
        { id: 1, name: "Lucie Malá", goals: 20, team: "Prváci" },
        { id: 2, name: "Filip Konečný", goals: 18, team: "Druháci" },
        { id: 3, name: "Radka Holubová", goals: 16, team: "Třeťáci" },
        { id: 4, name: "David Kučera", goals: 14, team: "Čtvrťáci" },
        { id: 5, name: "Nikola Fiala", goals: 12, team: "Prváci" },
        { id: 6, name: "Ondřej Vlček", goals: 10, team: "Učitelé" },
        { id: 7, name: "Alice Hlaváčková", goals: 9, team: "Druháci" },
        { id: 8, name: "Jaroslav Urban", goals: 8, team: "Třeťáci" },
        { id: 9, name: "Pavla Černá", goals: 7, team: "Čtvrťáci" },
        { id: 10, name: "Roman Marek", goals: 5, team: "Učitelé" }
    ]
};

function GoalScorers() {
    const renderScorerRow = (scorer) => (
        <tr key={scorer.id}>
            <td>{scorer.name}</td>
            <td>{scorer.goals}</td>
            <td>{scorer.team}</td>
        </tr>
    );

    return (
        <div className="goal-scorers-page">
            <h2 className="goal-scorers-title">Střelci</h2>

            {/* Nižší gymnázium Section */}
            <div className="gym-section">
                <h3 className="gym-title">Nižší gymnázium</h3>
                <table className="goal-scorers-table">
                    <thead>
                    <tr>
                        <th>Jméno a příjmení</th>
                        <th>Počet gólů</th>
                        <th>Tým</th>
                    </tr>
                    </thead>
                    <tbody>
                    {goalScorersData.nizsi.map(renderScorerRow)}
                    </tbody>
                </table>
            </div>

            {/* Vyšší gymnázium Section */}
            <div className="gym-section">
                <h3 className="gym-title">Vyšší gymnázium</h3>
                <table className="goal-scorers-table">
                    <thead>
                    <tr>
                        <th>Jméno a příjmení</th>
                        <th>Počet gólů</th>
                        <th>Tým</th>
                    </tr>
                    </thead>
                    <tbody>
                    {goalScorersData.vyssi.map(renderScorerRow)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default GoalScorers;
