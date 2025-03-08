const generateBergerTable = (teams, cycles = 1) => {
    const rounds = [];
    const numRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
    const halfSize = Math.floor(teams.length / 2);
    const rotatedTeams = [...teams];

    for (let cycle = 0; cycle < cycles; cycle++) {
        for (let round = 0; round < numRounds; round++) {
            const matches = [];

            const activeTeams = rotatedTeams.length % 2 === 0 ? rotatedTeams : rotatedTeams.slice(0, -1);

            for (let i = 0; i < halfSize; i++) {
                const home = activeTeams[i];
                const away = activeTeams[activeTeams.length - 1 - i];

                if (home && away) {
                    matches.push({
                        home: cycle === 0 ? home : away,
                        away: cycle === 0 ? away : home,
                        scoreA: 0,
                        scoreB: 0,
                        status: 'upcoming',
                        date: new Date().toISOString(),
                    });
                }
            }

            rounds.push(matches);

            const lastElement = rotatedTeams.pop();
            rotatedTeams.splice(1, 0, lastElement);
        }
    }

    return rounds;
};

module.exports = generateBergerTable;
