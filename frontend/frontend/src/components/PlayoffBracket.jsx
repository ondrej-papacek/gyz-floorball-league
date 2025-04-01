import React from 'react';
import './playoffBracket.css';

const PlayoffBracket = ({ rounds }) => {
    if (!rounds?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div className="playoff-bracket">
            {rounds.map(round => (
                <div key={round.round} className="playoff-round-block">
                    <h3>{round.round.replace('_', ' ').toUpperCase()}</h3>
                    {round.matches.map((match, i) => (
                        <div key={i} className="match-row">
                            <span className="team-name">{match.teamA || '-'}</span>
                            <span className="score">{match.scoreA ?? '-'}</span>
                            <span className="vs">vs</span>
                            <span className="score">{match.scoreB ?? '-'}</span>
                            <span className="team-name">{match.teamB || '-'}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default PlayoffBracket;
