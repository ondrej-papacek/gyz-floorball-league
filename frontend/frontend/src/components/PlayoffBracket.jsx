import React from 'react';
import './playoffBracket.css';
import {
    SingleEliminationBracket,
    Match as DefaultMatch,
    SVGViewer,
    createTheme
} from '@g-loot/react-tournament-brackets';

const CustomMatch = ({ startTime, ...rest }) => {
    return <DefaultMatch {...rest} />;
};

const DarkGoldTheme = createTheme({
    textColor: { main: '#ffffff', highlighted: '#f0b323', dark: '#cccccc' },
    matchBackground: {
        wonColor: '#333333',
        lostColor: '#1a1a1a'
    },
    score: {
        background: {
            wonColor: '#1c1c1c',
            lostColor: '#1c1c1c'
        },
        text: {
            highlightedWonColor: '#4caf50',
            highlightedLostColor: '#f44336'
        }
    },
    border: {
        color: '#777',
        highlightedColor: '#d9a326'
    },
    roundHeader: {
        background: '#2d2d2d',
        fontColor: '#f0b323'
    },
    connectorColor: '#d9a326',
    connectorColorHighlight: '#f0b323',
    svgBackground: '#1a1a1a'
});

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div className="playoff-bracket-reset">
            <SingleEliminationBracket
                matches={matches}
                matchComponent={CustomMatch}
                roundSeparatorWidth={64}
                theme={DarkGoldTheme}
                svgWrapper={({ children, ...props }) => (
                    <SVGViewer
                        background={DarkGoldTheme.svgBackground}
                        SVGBackground={DarkGoldTheme.svgBackground}
                        width={900}
                        height={600}
                        {...props}
                    >
                        {children}
                    </SVGViewer>
                )}
            />
        </div>
    );
};

export default PlayoffBracket;
