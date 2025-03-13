const generateBergerTable = (teams) => {
    if (!Array.isArray(teams) || teams.length < 2) {
        throw new Error("Invalid team data provided to BergerTable");
    }

    const numTeams = teams.length;
    const numRounds = numTeams - 1;
    const matches = [];
    const scheduledMatches = new Set();
    let rotatedTeams = [...teams];

    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];

        for (let i = 0; i < Math.floor(numTeams / 2); i++) {
            const teamA = rotatedTeams[i];
            const teamB = rotatedTeams[numTeams - 1 - i];

            const matchKey = [teamA.id, teamB.id].sort().join("-");
            if (!scheduledMatches.has(matchKey)) {
                scheduledMatches.add(matchKey);

                roundMatches.push({
                    teamA: teamA.id,
                    teamB: teamB.id,
                    teamA_name: teamA.name,
                    teamB_name: teamB.name,
                    scoreA: 0,
                    scoreB: 0,
                    status: "upcoming",
                    round: round + 1,
                });
            }
        }

        matches.push(roundMatches);

        if (numTeams % 2 !== 0) {
            rotatedTeams.splice(1, 0, rotatedTeams.pop());
        } else {
            rotatedTeams = [rotatedTeams[0], ...rotatedTeams.slice(2), rotatedTeams[1]];
        }
    }

    return matches;
};

module.exports = generateBergerTable;
