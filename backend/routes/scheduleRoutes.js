const express = require('express');
const router = express.Router();
const db = require('../firebase');

// Berger Table Algorithm for generating a round-robin tournament
const generateBergerTable = (teams, cycles = 2) => {
    const rounds = [];
    const numRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
    const halfSize = Math.floor(teams.length / 2);
    const rotatedTeams = [...teams];

    for (let cycle = 0; cycle < cycles; cycle++) {
        for (let round = 0; round < numRounds; round++) {
            const matches = [];
            for (let i = 0; i < halfSize; i++) {
                const home = rotatedTeams[i];
                const away = rotatedTeams[rotatedTeams.length - 1 - i];
                if (home && away) {
                    matches.push({
                        home: cycle === 0 ? home : away,
                        away: cycle === 0 ? away : home,
                        scoreA: 0,
                        scoreB: 0,
                        status: "upcoming",
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

// POST - Vygenerování rozpisu
router.post('/generate-schedule', async (req, res) => {
    try {
        const { division, year } = req.body;

        // Načtení týmů z databáze
        const teamsSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').get();
        const teams = teamsSnapshot.docs.map(doc => doc.data().name);

        // Vygenerování rozpisu zápasů pomocí Bergerových tabulek
        const schedule = generateBergerTable(teams);

        // Uložení rozpisu do Firestore
        const matchesRef = db.collection('leagues').doc(`${year}_${division}`).collection('matches');
        await Promise.all(
            schedule.flatMap(round => round.map(match => matchesRef.add(match)))
        );

        res.status(200).json({ message: "Rozpis zápasů byl úspěšně vygenerován a uložen do databáze." });
    } catch (error) {
        console.error('Chyba při generování rozpisu:', error);
        res.status(500).json({ error: 'Nepodařilo se vygenerovat rozpis zápasů.' });
    }
});

// GET - Načtení všech zápasů
router.get('/:year/:division/matches', async (req, res) => {
    try {
        const { year, division } = req.params;
        const matchesSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('matches').get();
        const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(matches);
    } catch (error) {
        console.error('Chyba při načítání zápasů:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst zápasy.' });
    }
});

// PUT - Aktualizace zápasu podle ID
router.put('/:year/:division/matches/:matchId', async (req, res) => {
    try {
        const { year, division, matchId } = req.params;
        const matchData = req.body;

        await db.collection('leagues').doc(`${year}_${division}`).collection('matches').doc(matchId).update(matchData);

        res.status(200).json({ message: "Zápas byl úspěšně aktualizován." });
    } catch (error) {
        console.error('Chyba při aktualizaci zápasu:', error);
        res.status(500).json({ error: 'Nepodařilo se aktualizovat zápas.' });
    }
});

// DELETE - Smazání zápasu podle ID
router.delete('/:year/:division/matches/:matchId', async (req, res) => {
    try {
        const { year, division, matchId } = req.params;

        // Odstranění zápasu z Firestore
        await db.collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .delete();

        res.status(200).json({ message: "Zápas byl úspěšně smazán." });
    } catch (error) {
        console.error('Chyba při mazání zápasu:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat zápas.' });
    }
});

// DELETE - Smazání všech zápasů pro konkrétní rok a divizi
router.delete('/:year/:division/matches', async (req, res) => {
    try {
        const { year, division } = req.params;

        // Získání všech zápasů v dané kolekci
        const matchesRef = db.collection('leagues').doc(`${year}_${division}`).collection('matches');
        const matchesSnapshot = await matchesRef.get();

        // Hromadné mazání zápasů
        const batch = db.batch();
        matchesSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.status(200).json({ message: "Všechny zápasy byly úspěšně smazány." });
    } catch (error) {
        console.error('Chyba při hromadném mazání zápasů:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat všechny zápasy.' });
    }
});

module.exports = router;
