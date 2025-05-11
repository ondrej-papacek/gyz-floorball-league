const { db } = require('../../firebase');

async function getGoalScorers(year, division) {
    try {
        const snap = await db.collection(`leagues/${year}_${division}/goalScorers`).get();
        return snap.docs.map(doc => doc.data());
    } catch (err) {
        console.error(`Failed to fetch goal scorers for ${year}_${division}:`, err);
        return [];
    }
}

async function generateSeasonSummaryDoc(seasonData) {
    const year = seasonData.year;

    const lowerGoalscorers = await getGoalScorers(year, 'lower');
    const upperGoalscorers = await getGoalScorers(year, 'upper');

    const lowerLeagueTable = seasonData.lowerLeagueTable || [];
    const upperLeagueTable = seasonData.upperLeagueTable || [];
    const playoffLower = seasonData.PlayoffBracket_lower || '---';
    const playoffUpper = seasonData.PlayoffBracket_upper || '---';

    const rtfParts = [];

    rtfParts.push('{\\rtf1\\ansi\\deff0');
    rtfParts.push(`\\b Shrnutí sezóny ${year} \\b0\\line\\line`);

    const section = (title) => `\\b ${title} \\b0\\line`;

    rtfParts.push(section('Tabulka - mladší liga'));
    lowerLeagueTable.forEach(team => {
        rtfParts.push(`${team.name}: ${team.points} bodů (V:${team.wins}, R:${team.draws}, P:${team.losses}, ${team.goalsScored}:${team.goalsConceded})\\line`);
    });

    rtfParts.push('\\line');
    rtfParts.push(section('Tabulka - starší liga'));
    upperLeagueTable.forEach(team => {
        rtfParts.push(`${team.name}: ${team.points} bodů (V:${team.wins}, R:${team.draws}, P:${team.losses}, ${team.goalsScored}:${team.goalsConceded})\\line`);
    });

    rtfParts.push('\\line');
    rtfParts.push(section('Střelci - mladší'));
    lowerGoalscorers.sort((a, b) => b.goals - a.goals).forEach(scorer => {
        rtfParts.push(`${scorer.name} (${scorer.team}): ${scorer.goals} gólů\\line`);
    });

    rtfParts.push('\\line');
    rtfParts.push(section('Střelci - starší'));
    upperGoalscorers.sort((a, b) => b.goals - a.goals).forEach(scorer => {
        rtfParts.push(`${scorer.name} (${scorer.team}): ${scorer.goals} gólů\\line`);
    });

    rtfParts.push('\\line');
    rtfParts.push(section('Playoff - mladší'));
    rtfParts.push(`${playoffLower}\\line`);

    rtfParts.push('\\line');
    rtfParts.push(section('Playoff - starší'));
    rtfParts.push(`${playoffUpper}\\line`);

    rtfParts.push('}');

    return Buffer.from(rtfParts.join('\n'), 'utf-8');
}

module.exports = { generateSeasonSummaryDoc };
