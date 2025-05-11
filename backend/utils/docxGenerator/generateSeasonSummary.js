const { generateDocxFromTemplate } = require('./docxUtils');
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

    const data = {
        year,

        lowerLeagueTable: (seasonData.lowerLeagueTable || []).map(team => ({
            team: team.name,
            games: team.matchesPlayed,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            scored_goals: team.goalsScored,
            conceded_goals: team.goalsConceded,
            points: team.points
        })),

        upperLeagueTable: (seasonData.upperLeagueTable || []).map(team => ({
            team: team.name,
            games: team.matchesPlayed,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            scored_goals: team.goalsScored,
            conceded_goals: team.goalsConceded,
            points: team.points
        })),

        goalScorers_lower: lowerGoalscorers
            .sort((a, b) => b.goals - a.goals)
            .map(scorer => ({
                goal_scorer: scorer.name,
                goals: scorer.goals,
                team: scorer.team
            })),

        goalScorers_upper: upperGoalscorers
            .sort((a, b) => b.goals - a.goals)
            .map(scorer => ({
                goal_scorer: scorer.name,
                goals: scorer.goals,
                team: scorer.team
            })),

        PlayoffBracket_lower: seasonData.PlayoffBracket_lower || '',
        PlayoffBracket_upper: seasonData.PlayoffBracket_upper || '',
        schedule_image: seasonData.schedule_image || ''
    };

    return generateDocxFromTemplate('summary-template.docx', data);
}

module.exports = { generateSeasonSummaryDoc };
