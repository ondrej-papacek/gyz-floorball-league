import React from 'react';
import './playoffBracket.css';
import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    const completeTheme = {
        textColor: '#ffffff',
        backgroundColor: '#2d2d2d',
        borderColor: '#777',
        scoreBackground: '#1c1c1c',
        matchBackground: '#333',
        lineColor: '#d9a326',
        roundHeader: {
            backgroundColor: '#2d2d2d',
            textColor: '#f0b323'
        },
        connectorColor: '#d9a326',
        score: {
            background: '#1c1c1c',
            color: '#f0b323'
        },
        match: {
            background: '#333',
            borderColor: '#777',
            textColor: '#ffffff'
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
