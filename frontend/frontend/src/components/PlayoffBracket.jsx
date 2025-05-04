import React from 'react';
import './playoffBracket.css';
import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    const completeTheme = {
        textColor: '#ffffff',
        backgroundColor: '#2d2d2d',
        borderColor: '#777',
        connectorColor: '#d9a326',

        match: {
            background: '#333',
            borderColor: '#777',
            textColor: '#ffffff',
            winnerColor: '#4caf50',
            loserColor: '#f44336'
        },
        score: {
            background: '#1c1c1c',
            textColor: '#f0b323',
            winnerColor: '#4caf50',
            loserColor: '#f44336'
        },
        roundHeader: {
            backgroundColor: '#2d2d2d',
            textColor: '#f0b323'
        }
    };

    console.log('Bracket theme:', completeTheme);
    console.log('Bracket matches:', matches);

    return (
        <div className="playoff-bracket">
            <SingleEliminationBracket
                matches={matches}
                matchComponent={Match}
                roundSeparatorWidth={64}
                svgWrapperProps={{ className: 'bracket-svg-wrapper' }}
                theme={completeTheme}
            />
        </div>
    );
};

export default PlayoffBracket;
