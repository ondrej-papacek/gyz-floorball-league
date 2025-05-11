const { generateDocxFromTemplate } = require('./docxUtils');

async function generateRoundPreviewDoc(roundData) {
    console.log('[DOCX][generateRoundPreviewDoc] Incoming roundData:', JSON.stringify(roundData, null, 2));

    const formattedMatches = roundData.matches.map((m, index) => {
        let rawDate = m.date;
        if (rawDate?.seconds) {
            rawDate = new Date(rawDate.seconds * 1000);
        } else {
            rawDate = new Date(rawDate);
        }

        return {
            index: index + 1,
            teamA: m.teamA_name || '---',
            teamB: m.teamB_name || '---',
            match_time: rawDate.toLocaleTimeString("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit"
            }),
        };
    });

    let roundDateObj;
    if (roundData.date?.seconds) {
        roundDateObj = new Date(roundData.date.seconds * 1000);
    } else {
        roundDateObj = new Date(roundData.date);
    }

    const data = {
        roundNumber: roundData.round,
        roundDate: roundDateObj.toLocaleDateString("cs-CZ"),
        matches: formattedMatches
    };

    console.log('[DOCX][generateRoundPreviewDoc] Final parsed data for DOCX:', JSON.stringify(data, null, 2));

    try {
        return generateDocxFromTemplate('rounds-template.docx', data);
    } catch (err) {
        console.error('[DOCX][generateRoundPreviewDoc] Error during template generation:', err);
        throw err;
    }
}

module.exports = {
    generateRoundPreviewDoc
};
