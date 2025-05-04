import React from 'react';
import './playoffBracket.css';
import {
    SingleEliminationBracket,
    Match as DefaultMatch,
} from '@g-loot/react-tournament-brackets';

const CustomMatch = ({ startTime, ...rest }) => {
    return <DefaultMatch {...rest} />;
};

// const safeTheme = {
//     textColor: '#ffffff',
//     backgroundColor: '#2d2d2d',
//     borderColor: '#777',
//     lineColor: '#d9a326',
//     roundHeader: {
//         backgroundColor: '#2d2d2d',
//         textColor: '#f0b323'
//     },
//     match: {
//         background: '#333',
//         borderColor: '#777',
//         textColor: '#ffffff'
//     },
//     score: {
//         background: '#1c1c1c',
//         textColor: '#f0b323'
//     }
// };

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div className="playoff-bracket-reset">
            <SingleEliminationBracket
                matches={matches}
                matchComponent={CustomMatch}
                roundSeparatorWidth={64}
                svgWrapperProps={{ className: 'bracket-svg-wrapper' }}
                // theme={safeTheme}
            />
        </div>
    );
};

export default PlayoffBracket;
