import React from 'react';
import './playoffBracket.css';
import {
    SingleEliminationBracket,
    SVGViewer,
    createTheme
} from '@g-loot/react-tournament-brackets';

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
        backgroundColor: '#2d2d2d',
        fontColor: '#f0b323'
    },
    connectorColor: '#d9a326',
    connectorColorHighlight: '#f0b323',
    svgBackground: '#1a1a1a'
});

const CustomMatch = ({
                         match,
                         topParty,
                         bottomParty,
                         onMouseEnter,
                         onMouseLeave,
                         onMatchClick,
                         computedStyles,
                         resultFallback,
                         teamNameFallback
                     }) => {
    return (
        <div
            onClick={() => onMatchClick(match)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '6px 8px',
                background: computedStyles.backgroundColor,
                border: `1px solid ${computedStyles.borderColor}`,
                color: computedStyles.textColor,
                fontSize: 14,
                borderRadius: 6,
                width: 150,
                boxShadow: '0 0 4px rgba(0,0,0,0.2)'
            }}
        >
            <div
                onMouseEnter={() => onMouseEnter(topParty.id)}
                onMouseLeave={onMouseLeave}
                style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 2 }}
            >
                <span>{topParty.name || teamNameFallback}</span>
                <span>{topParty.resultText ?? resultFallback(topParty)}</span>
            </div>
            <div
                onMouseEnter={() => onMouseEnter(bottomParty.id)}
                onMouseLeave={onMouseLeave}
                style={{ display: 'flex', justifyContent: 'space-between' }}
            >
                <span>{bottomParty.name || teamNameFallback}</span>
                <span>{bottomParty.resultText ?? resultFallback(bottomParty)}</span>
            </div>
        </div>
    );
};

const PlayoffBracket = ({ matches }) => {
    if (!matches?.length) return <p>Žádné zápasy zatím nejsou dostupné.</p>;

    return (
        <div className="playoff-bracket-reset">
            <SingleEliminationBracket
                matches={matches}
                matchComponent={CustomMatch}
                roundSeparatorWidth={64}
                theme={DarkGoldTheme}
                options={{
                    style: {
                        roundHeader: {
                            backgroundColor: DarkGoldTheme.roundHeader.backgroundColor,
                            fontColor: DarkGoldTheme.roundHeader.fontColor
                        },
                        connectorColor: DarkGoldTheme.connectorColor,
                        connectorColorHighlight: DarkGoldTheme.connectorColorHighlight
                    }
                }}
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
