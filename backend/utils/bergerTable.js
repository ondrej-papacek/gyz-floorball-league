const generateBergerTable = (teams) => {
    if (!Array.isArray(teams) || teams.length < 2) {
        throw new Error("Invalid team data provided to BergerTable");
    }

    const numTeams = teams.length;
    const isOdd = numTeams % 2 !== 0;
    const numRounds = numTeams - 1;
    const matches = [];
    const scheduledMatches = new Set();

    let rotatedTeams = [...teams];

    if (isOdd) {
        rotatedTeams.push({ id: "bye", name: "BYE" });
    }

    for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];

        for (let i = 0; i < Math.floor(rotatedTeams.length / 2); i++) {
            const teamA = rotatedTeams[i];
            const teamB = rotatedTeams[rotatedTeams.length - 1 - i];

            if (teamA.id === "bye" || teamB.id === "bye") {
                continue;
            }

            const matchKey = `${teamA.id}-${teamB.id}`;
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
        rotatedTeams = [rotatedTeams[0], ...rotatedTeams.slice(2), rotatedTeams[1]];
    }

    return matches;
};

module.exports = generateBergerTable;
