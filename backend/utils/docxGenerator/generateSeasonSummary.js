const fs = require("fs");
const path = require("path");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    AlignmentType,
    PageBreak,
} = require("docx");

const { db } = require("../../firebase");

// === Helpers ===

async function fetchTeamsFromDB(year, division) {
    try {
        const snap = await db.collection(`leagues/${year}_${division}/teams`).get();
        return snap.docs.map(doc => doc.data()).filter(team => team.name);
    } catch (err) {
        console.error(`Error fetching ${division} league teams for ${year}:`, err);
        return [];
    }
}

async function fetchMatchesFromDB(year, division) {
    try {
        const snap = await db.collection(`leagues/${year}_${division}/matches`).get();
        return snap.docs.map(doc => doc.data()).filter(match => match.id !== "placeholder");
    } catch (err) {
        console.error(`Error fetching matches for ${year}_${division}:`, err);
        return [];
    }
}

async function getGoalScorers(year, division) {
    try {
        const snap = await db.collection(`leagues/${year}_${division}/goalScorers`).get();
        return snap.docs.map(doc => doc.data());
    } catch (err) {
        console.error(`Failed to fetch goal scorers for ${year}_${division}:`, err);
        return [];
    }
}

function groupMatchesByRound(matches) {
    const grouped = {};
    matches.forEach(match => {
        const round = match.round ?? 0;
        const date = match.date?.seconds ? new Date(match.date.seconds * 1000) : new Date();
        if (!grouped[round]) {
            grouped[round] = { round, date, matches: [] };
        }
        grouped[round].matches.push(match);
        if (date < grouped[round].date) {
            grouped[round].date = date;
        }
    });
    return Object.values(grouped).sort((a, b) => a.round - b.round);
}

// === Formatting ===

function sectionTitle(text) {
    return new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.LEFT,
        children: [
            new TextRun({ text, bold: true, size: 28, font: "Cambria" }),
        ],
    });
}

function textLine(text) {
    return new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
            new TextRun({ text, size: 24, font: "Cambria" }),
        ],
    });
}

function centeredTitle(text, size = 32) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
            new TextRun({ text, bold: true, size, font: "Cambria" }),
        ],
    });
}

function matchLine(match, i) {
    const teamA = match.teamA_name || "---";
    const teamB = match.teamB_name || "---";
    const scoreA = typeof match.scoreA === 'number' ? match.scoreA : "-";
    const scoreB = typeof match.scoreB === 'number' ? match.scoreB : "-";
    return textLine(`Zápas ${i + 1}: ${teamA} ${scoreA} : ${scoreB} ${teamB}`);
}

// === Main Generation ===

async function generateSeasonSummaryDoc(seasonData) {
    const year = seasonData.year;

    const [lowerTeams, upperTeams] = await Promise.all([
        fetchTeamsFromDB(year, "lower"),
        fetchTeamsFromDB(year, "upper"),
    ]);

    const [lowerScorers, upperScorers] = await Promise.all([
        getGoalScorers(year, "lower"),
        getGoalScorers(year, "upper"),
    ]);

    const [lowerMatches, upperMatches] = await Promise.all([
        fetchMatchesFromDB(year, "lower"),
        fetchMatchesFromDB(year, "upper"),
    ]);

    const groupedLower = groupMatchesByRound(lowerMatches);
    const groupedUpper = groupMatchesByRound(upperMatches);

    const playoffLower = seasonData.PlayoffBracket_lower || "---";
    const playoffUpper = seasonData.PlayoffBracket_upper || "---";

    // === Load logo ===
    const logoPath = path.join(__dirname, "assets", "logo.png");
    const logoImage = fs.readFileSync(logoPath);

    const doc = new Document({
        sections: [
            {
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: logoImage,
                                transformation: { width: 100, height: 100 },
                            }),
                        ],
                    }),

                    centeredTitle(`Shrnutí sezóny ${year}`),
                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Tabulka - Liga Nižší Gymnázium"),
                    ...lowerTeams.map(team =>
                        textLine(`${team.name}: ${team.points ?? 0} bodů (V:${team.wins ?? 0}, R:${team.draws ?? 0}, P:${team.losses ?? 0}, ${team.goalsScored ?? 0}:${team.goalsConceded ?? 0})`)
                    ),

                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Tabulka - Liga Vyšší Gymnázium"),
                    ...upperTeams.map(team =>
                        textLine(`${team.name}: ${team.points ?? 0} bodů (V:${team.wins ?? 0}, R:${team.draws ?? 0}, P:${team.losses ?? 0}, ${team.goalsScored ?? 0}:${team.goalsConceded ?? 0})`)
                    ),

                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Střelci - Nižší Gymnázium"),
                    ...lowerScorers.sort((a, b) => b.goals - a.goals).map(s =>
                        textLine(`${s.name} (${s.team}): ${s.goals} gólů`)
                    ),

                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Střelci - Vyšší Gymnázium"),
                    ...upperScorers.sort((a, b) => b.goals - a.goals).map(s =>
                        textLine(`${s.name} (${s.team}): ${s.goals} gólů`)
                    ),

                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Rozpis zápasů – Nižší Gymnázium"),
                    ...groupedLower.flatMap(round => [
                        textLine(`Kolo ${round.round} – ${round.date.toLocaleDateString("cs-CZ")}`),
                        ...round.matches.map(matchLine),
                        new Paragraph({ text: "" })
                    ]),

                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Rozpis zápasů – Vyšší Gymnázium"),
                    ...groupedUpper.flatMap(round => [
                        textLine(`Kolo ${round.round} – ${round.date.toLocaleDateString("cs-CZ")}`),
                        ...round.matches.map(matchLine),
                        new Paragraph({ text: "" })
                    ]),

                    new Paragraph({ children: [new PageBreak()] }),

                    sectionTitle("Playoff - Nižší Gymnázium"),
                    textLine(playoffLower),

                    new Paragraph({ text: "" }),
                    sectionTitle("Playoff - Vyšší Gymnázium"),
                    textLine(playoffUpper),

                    new Paragraph({ text: "" }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new ImageRun({
                                data: logoImage,
                                transformation: { width: 80, height: 80 },
                            }),
                        ],
                    }),
                ],
            },
        ],
    });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateSeasonSummaryDoc,
};
