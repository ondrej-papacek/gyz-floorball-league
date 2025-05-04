import React from 'react';
import './playoffBracket.css';
import {
    SingleEliminationBracket,
    Match as DefaultMatch,
} from '@g-loot/react-tournament-brackets';

const CustomMatch = ({ startTime, ...rest }) => {
    return <DefaultMatch {...rest} />;
};

const safeTheme = {
    textColor: '#ffffff',
    backgroundColor: '#2d2d2d',
    borderColor: '#777',
    connectorColor: '#d9a326',

    match: {
        background: '#333',
        borderColor: '#777',
        textColor: '#ffffff',
        highlighted: {
            background: '#444',
            textColor: '#f0b323',
        },
        dark: {
            background: '#1a1a1a',
            textColor: '#cccccc',
        }
    },

    score: {
        background: '#1c1c1c',
        textColor: '#f0b323',
        winnerColor: '#4caf50',
        loserColor: '#f44336',
        highlighted: {
            background: '#333',
            textColor: '#f0b323',
        },
        dark: {
            background: '#000000',
            textColor: '#888888',
        }
    },

    roundHeader: {
        backgroundColor: '#2d2d2d',
        textColor: '#f0b323'
    }
};

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div className="playoff-bracket-reset">
            <SingleEliminationBracket
                matches={matches}
                matchComponent={CustomMatch}
                roundSeparatorWidth={64}
                svgWrapperProps={{ className: 'bracket-svg-wrapper' }}
                theme={safeTheme}
            />
        </div>
    );
};

export default PlayoffBracket;
