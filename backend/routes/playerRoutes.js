// backend/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Získání všech hráčů pro konkrétní tým
router.get('/:year/:division/teams/:teamId/players', async (req, res) => {
    try {
        const { year, division, teamId } = req.params;
        const playersSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').get();
        const players = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(players);
    } catch (error) {
        console.error('Chyba při načítání hráčů:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst hráče.' });
    }
});

// POST - Vytvoření nového hráče
router.post('/:year/:division/teams/:teamId/players', async (req, res) => {
    try {
        const { year, division, teamId } = req.params;
        const playerData = req.body;

        const playerRef = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').add(playerData);

        res.status(201).json({ id: playerRef.id, ...playerData });
    } catch (error) {
        console.error('Chyba při vytváření hráče:', error);
        res.status(500).json({ error: 'Nepodařilo se vytvořit hráče.' });
    }
});

// PUT - Aktualizace hráče podle ID
router.put('/:year/:division/teams/:teamId/players/:playerId', async (req, res) => {
    try {
        const { year, division, teamId, playerId } = req.params;
        const playerData = req.body;

        await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').doc(playerId).update(playerData);

        res.status(200).json({ message: "Hráč byl úspěšně aktualizován." });
    } catch (error) {
        console.error('Chyba při aktualizaci hráče:', error);
        res.status(500).json({ error: 'Nepodařilo se aktualizovat hráče.' });
    }
});

// DELETE - Smazání hráče podle ID
router.delete('/:year/:division/teams/:teamId/players/:playerId', async (req, res) => {
    try {
        const { year, division, teamId, playerId } = req.params;

        await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').doc(playerId).delete();

        res.status(200).json({ message: "Hráč byl úspěšně smazán." });
    } catch (error) {
        console.error('Chyba při mazání hráče:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat hráče.' });
    }
});

module.exports = router;
