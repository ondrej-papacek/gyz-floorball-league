const { generateDocxFromTemplate } = require('./docxUtils');

async function generateRoundPreviewDoc(roundData) {
    const formattedMatches = roundData.matches.map((m, index) => ({
        index: index + 1,
        teamA: m.teamA_name,
        teamB: m.teamB_name,
        match_time: new Date(m.date.seconds * 1000).toLocaleTimeString("cs-CZ", {
            hour: "2-digit",
            minute: "2-digit"
        }),
    }));

    const data = {
        roundNumber: roundData.round,
        roundDate: new Date(roundData.date).toLocaleDateString("cs-CZ"),
        matches: formattedMatches
    };

    return generateDocxFromTemplate('rounds-template.docx', data);
}

module.exports = {
    generateRoundPreviewDoc
};
