import React from 'react';
import './playoffBracket.css';
import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div style={{ overflowX: 'auto', backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '8px' }}>
            <SingleEliminationBracket
                matches={matches}
                matchComponent={Match}
                roundSeparatorWidth={64}
                svgWrapperProps={{ style: { background: '#2d2d2d' } }}
            />
        </div>
    );
};

export default PlayoffBracket;
