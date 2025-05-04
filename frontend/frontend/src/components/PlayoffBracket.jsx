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
                theme={{
                    textColor: '#ffffff',
                    backgroundColor: '#2d2d2d',
                    borderColor: '#777',
                    scoreBackground: '#1c1c1c',
                    lineColor: '#d9a326',
                    roundHeader: {
                        backgroundColor: '#2d2d2d',
                        textColor: '#f0b323'
                    },
                    matchBackground: '#333',
                }}
            />
        </div>
    );
};

export default PlayoffBracket;
