function generateRoundPreviewDoc(roundData) {
    const formattedMatches = (roundData.matches || []).map((m, index) => {
        return {
            index: index + 1,
            teamA: m.teamA || '---',
            teamB: m.teamB || '---',
            match_time: '---'
        };
    });

    let roundDate = '---';
    try {
        const d = new Date(roundData.date);
        if (!isNaN(d)) {
            roundDate = d.toLocaleDateString('cs-CZ');
        }
    } catch {}

    const rtfParts = [];

    rtfParts.push('{\\rtf1\\ansi\\deff0');
    rtfParts.push(`\\b Kolo ${roundData.round} \\b0\\line`);
    rtfParts.push(`${roundDate}\\line\\line`);

    formattedMatches.forEach(match => {
        rtfParts.push(`Zápas ${match.index}: ${match.teamA} vs ${match.teamB}\\line`);
    });

    rtfParts.push('}');

    return Buffer.from(rtfParts.join('\n'), 'utf-8');
}

module.exports = {
    generateRoundPreviewDoc
};
