const { generateDocxFromTemplate } = require('./docxUtils');

async function generateRoundPreviewDoc(roundData) {
    const formattedMatches = roundData.matches.map((m, index) => {
        let rawDate = m.date;

        if (rawDate?.seconds) {
            rawDate = new Date(rawDate.seconds * 1000);
        } else {
            rawDate = new Date(rawDate);
        }

        return {
            index: index + 1,
            teamA: m.teamA_name,
            teamB: m.teamB_name,
            match_time: rawDate.toLocaleTimeString("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit"
            }),
        };
    });

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
