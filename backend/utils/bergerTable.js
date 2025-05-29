const generateBergerTable = (teams) => {
    if (!Array.isArray(teams) || teams.length < 2) {
        throw new Error("Invalid team data provided to BergerTable");
    }

    const isOdd = teams.length % 2 !== 0;
    const teamsCopy = [...teams];

    if (isOdd) {
        teamsCopy.push({ id: "bye", name: "BYE" });
    }

    const totalTeams = teamsCopy.length;
    const numRounds = totalTeams - 1;

    const matches = [];

    for (let round = 0; round < numRounds; round++) {
        for (let i = 0; i < totalTeams / 2; i++) {
            const teamA = teamsCopy[i];
            const teamB = teamsCopy[totalTeams - 1 - i];

            if (teamA.id === "bye" || teamB.id === "bye") continue;

            matches.push({
                teamA: teamA.id,
                teamB: teamB.id,
                teamA_name: teamA.name,
                teamB_name: teamB.name,
                scoreA: 0,
                scoreB: 0,
                status: "upcoming",
                round: matches.length + 1
            });
        }

        const first = teamsCopy[0];
        const rotated = [first, ...rotateRight(teamsCopy.slice(1))];
        for (let i = 0; i < totalTeams; i++) {
            teamsCopy[i] = rotated[i];
        }
    }

    return matches;
};

const rotateRight = (arr) => {
    if (arr.length <= 1) return arr;
    return [arr[arr.length - 1], ...arr.slice(0, arr.length - 1)];
};

module.exports = generateBergerTable;
