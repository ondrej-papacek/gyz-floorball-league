// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Získání všech týmů pro konkrétní rok a divizi
router.get('/:year/:division/teams', async (req, res) => {
    try {
        const { year, division } = req.params;
        const teamsSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').get();
        const teams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(teams);
    } catch (error) {
        console.error('Chyba při načítání týmů:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst týmy.' });
    }
});

// POST - Vytvoření nového týmu
router.post('/:year/:division/teams', async (req, res) => {
    try {
        const { year, division } = req.params;
        const teamData = req.body;

        const teamRef = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').add(teamData);

        res.status(201).json({ id: teamRef.id, ...teamData });
    } catch (error) {
        console.error('Chyba při vytváření týmu:', error);
        res.status(500).json({ error: 'Nepodařilo se vytvořit tým.' });
    }
});

// PUT - Aktualizace týmu podle ID
router.put('/:year/:division/teams/:teamId', async (req, res) => {
    try {
        const { year, division, teamId } = req.params;
        const teamData = req.body;

        await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).update(teamData);

        res.status(200).json({ message: "Tým byl úspěšně aktualizován." });
    } catch (error) {
        console.error('Chyba při aktualizaci týmu:', error);
        res.status(500).json({ error: 'Nepodařilo se aktualizovat tým.' });
    }
});

// DELETE - Smazání týmu podle ID
router.delete('/:year/:division/teams/:teamId', async (req, res) => {
    try {
        const { year, division, teamId } = req.params;

        await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).delete();

        res.status(200).json({ message: "Tým byl úspěšně smazán." });
    } catch (error) {
        console.error('Chyba při mazání týmu:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat tým.' });
    }
});

module.exports = router;
