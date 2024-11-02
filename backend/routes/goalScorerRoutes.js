// backend/routes/goalScorerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Načtení všech střelců gólů pro konkrétní rok a divizi
router.get('/:year/:division/goalScorers', async (req, res) => {
    try {
        const { year, division } = req.params;
        const goalScorersSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').get();
        const goalScorers = goalScorersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(goalScorers);
    } catch (error) {
        console.error('Chyba při načítání střelců gólů:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst střelce gólů.' });
    }
});

// POST - Přidání nového střelce gólů
router.post('/:year/:division/goalScorers', async (req, res) => {
    try {
        const { year, division } = req.params;
        const goalScorerData = req.body;

        const goalScorerRef = await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').add(goalScorerData);

        res.status(201).json({ id: goalScorerRef.id, ...goalScorerData });
    } catch (error) {
        console.error('Chyba při přidávání střelce gólů:', error);
        res.status(500).json({ error: 'Nepodařilo se přidat střelce gólů.' });
    }
});

// PUT - Aktualizace střelce gólů podle ID
router.put('/:year/:division/goalScorers/:goalScorerId', async (req, res) => {
    try {
        const { year, division, goalScorerId } = req.params;
        const goalScorerData = req.body;

        await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').doc(goalScorerId).update(goalScorerData);

        res.status(200).json({ message: "Střelec gólů byl úspěšně aktualizován." });
    } catch (error) {
        console.error('Chyba při aktualizaci střelce gólů:', error);
        res.status(500).json({ error: 'Nepodařilo se aktualizovat střelce gólů.' });
    }
});

// DELETE - Smazání střelce gólů podle ID
router.delete('/:year/:division/goalScorers/:goalScorerId', async (req, res) => {
    try {
        const { year, division, goalScorerId } = req.params;

        await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').doc(goalScorerId).delete();

        res.status(200).json({ message: "Střelec gólů byl úspěšně smazán." });
    } catch (error) {
        console.error('Chyba při mazání střelce gólů:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat střelce gólů.' });
    }
});

module.exports = router;
