const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    PageBreak,
} = require("docx");
const { db } = require("../../firebase");

async function fetchTeamsFromDB(year, division) {
    try {
        const snap = await db.collection(`leagues/${year}_${division}/teams`).get();
        return snap.docs
            .map(doc => doc.data())
            .filter(team => team.name);
    } catch (err) {
        console.error(`Error fetching ${division} league teams for ${year}:`, err);
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

function sectionTitle(text) {
    return new Paragraph({
        spacing: { after: 200 },
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text, bold: true, size: 28 })],
    });
}

function textLine(text) {
    return new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text, size: 24 })],
    });
}

async function generateSeasonSummaryDoc(seasonData) {
    const year = seasonData.year;

    const lowerLeagueTable = await fetchTeamsFromDB(year, "lower");
    const upperLeagueTable = await fetchTeamsFromDB(year, "upper");
    const lowerScorers = await getGoalScorers(year, "lower");
    const upperScorers = await getGoalScorers(year, "upper");

    const playoffLower = seasonData.PlayoffBracket_lower || "---";
    const playoffUpper = seasonData.PlayoffBracket_upper || "---";

    const doc = new Document();

    const children = [
        sectionTitle(`Shrnutí sezóny ${year}`),
        new Paragraph({ text: "" }),

        sectionTitle("Tabulka - Liga Nižší Gymnázium"),
        ...lowerLeagueTable.map(team =>
            textLine(`${team.name}: ${team.points ?? 0} bodů (V:${team.wins ?? 0}, R:${team.draws ?? 0}, P:${team.losses ?? 0}, ${team.goalsScored ?? 0}:${team.goalsConceded ?? 0})`)
        ),

        new Paragraph({ children: [new PageBreak()] }),

        sectionTitle("Tabulka - Liga Vyšší Gymnázium"),
        ...upperLeagueTable.map(team =>
            textLine(`${team.name}: ${team.points ?? 0} bodů (V:${team.wins ?? 0}, R:${team.draws ?? 0}, P:${team.losses ?? 0}, ${team.goalsScored ?? 0}:${team.goalsConceded ?? 0})`)
        ),

        new Paragraph({ children: [new PageBreak()] }),

        sectionTitle("Střelci - Nižší Gymnázium"),
        ...lowerScorers.sort((a, b) => b.goals - a.goals).map(scorer =>
            textLine(`${scorer.name} (${scorer.team}): ${scorer.goals} gólů`)
        ),

        new Paragraph({ children: [new PageBreak()] }),

        sectionTitle("Střelci - Vyšší Gymnázium"),
        ...upperScorers.sort((a, b) => b.goals - a.goals).map(scorer =>
            textLine(`${scorer.name} (${scorer.team}): ${scorer.goals} gólů`)
        ),

        new Paragraph({ children: [new PageBreak()] }),

        sectionTitle("Playoff - Nižší Gymnázium"),
        textLine(playoffLower),

        new Paragraph({ text: "" }),
        sectionTitle("Playoff - Vyšší Gymnázium"),
        textLine(playoffUpper),
    ];

    doc.addSection({ children });

    return await Packer.toBuffer(doc);
}

module.exports = {
    generateSeasonSummaryDoc,
};
