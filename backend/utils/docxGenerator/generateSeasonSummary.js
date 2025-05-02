const { generateDocxFromTemplate } = require('./docxUtils');
const { getDocs, collection } = require('firebase/firestore');
const { db } = require('../../firebase');

async function getGoalScorers(year, division) {
    const snap = await getDocs(collection(db, `leagues/${year}_${division}/goalScorers`));
    return snap.docs.map(doc => doc.data());
}

async function generateSeasonSummaryDoc(seasonData) {
    const year = seasonData.year;

    const lowerGoalscorers = await getGoalScorers(year, 'lower');
    const upperGoalscorers = await getGoalScorers(year, 'upper');

    const data = {
        year,

        lowerLeagueTable: seasonData.lowerLeagueTable.map(team => ({
            team: team.name,
            games: team.matchesPlayed,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            scored_goals: team.goalsScored,
            conceded_goals: team.goalsConceded,
            points: team.points
        })),

        upperLeagueTable: seasonData.upperLeagueTable.map(team => ({
            team: team.name,
            games: team.matchesPlayed,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            scored_goals: team.goalsScored,
            conceded_goals: team.goalsConceded,
            points: team.points
        })),

        goalScorers_lower: lowerGoalscorers.map(scorer => ({
            goal_scorer: scorer.name,
            goals: scorer.goals,
            team: scorer.team
        })),

        goalScorers_upper: upperGoalscorers.map(scorer => ({
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
