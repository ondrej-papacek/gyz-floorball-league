import React from 'react';
import './playoffBracket.css';
import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div className="playoff-bracket">
            <SingleEliminationBracket
                matches={matches}
                matchComponent={Match}
                roundSeparatorWidth={64}
                svgWrapperProps={{ className: 'bracket-svg-wrapper' }}
            />
        </div>
    );
};

export default PlayoffBracket;
