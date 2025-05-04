import React from 'react';
import './playoffBracket.css';
import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    const completeTheme = {
        textColor: '#ffffff',
        backgroundColor: '#2d2d2d',
        borderColor: '#777',
        match: {
            background: '#333',
            borderColor: '#777',
            textColor: '#ffffff'
        },
        score: {
            background: '#1c1c1c',
            textColor: '#f0b323'
        },
        connectorColor: '#d9a326',
        roundHeader: {
            backgroundColor: '#2d2d2d',
            textColor: '#f0b323'
        }
    };

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
