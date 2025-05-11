const { generateDocxFromTemplate } = require('./docxUtils');

async function generateRoundPreviewDoc(roundData) {
    console.log('[DOCX][generateRoundPreviewDoc] Incoming roundData:', JSON.stringify(roundData, null, 2));

    const formattedMatches = (roundData.matches || []).map((m, index) => {
        let rawDate = m.date;
        let dateObj;

        try {
            if (rawDate?.seconds) {
                dateObj = new Date(rawDate.seconds * 1000);
            } else {
                dateObj = new Date(rawDate);
            }
        } catch {
            dateObj = null;
        }

        const matchTime = dateObj instanceof Date && !isNaN(dateObj)
            ? dateObj.toLocaleTimeString("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit"
            })
            : '---';

        return {
            index: index + 1,
            teamA: m.teamA_name || '---',
            teamB: m.teamB_name || '---',
            match_time: matchTime,
        };
    });

    let roundDateObj;
    try {
        if (roundData.date?.seconds) {
            roundDateObj = new Date(roundData.date.seconds * 1000);
        } else {
            roundDateObj = new Date(roundData.date);
        }
    } catch {
        roundDateObj = null;
    }

    const data = {
        roundNumber: roundData.round || '---',
        roundDate: roundDateObj instanceof Date && !isNaN(roundDateObj)
            ? roundDateObj.toLocaleDateString("cs-CZ")
            : '---',
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
