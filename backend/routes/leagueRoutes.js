// backend/routes/leagueRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Získání všech lig
router.get('/', async (req, res) => {
    try {
        const leaguesSnapshot = await db.collection('leagues').get();
        const leagues = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(leagues);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
});

// POST - Vytvoření nové ligy
router.post('/', async (req, res) => {
    try {
        const { year, division, status } = req.body;
        const newLeague = { year, division, status: status || 'active' };
        const leagueRef = await db.collection('leagues').add(newLeague);
        res.status(201).json({ id: leagueRef.id, ...newLeague });
    } catch (error) {
        console.error('Error creating league:', error);
        res.status(500).json({ error: 'Failed to create league' });
    }
});

// PUT - Aktualizace ligy
router.put('/:id', async (req, res) => {
    try {
        const leagueId = req.params.id;
        const { status } = req.body;
        await db.collection('leagues').doc(leagueId).update({ status });
        res.status(200).json({ message: 'League updated successfully' });
    } catch (error) {
        console.error('Error updating league:', error);
        res.status(500).json({ error: 'Failed to update league' });
    }
});

// DELETE - Smazání ligy
router.delete('/:id', async (req, res) => {
    try {
        const leagueId = req.params.id;
        await db.collection('leagues').doc(leagueId).delete();
        res.status(200).json({ message: 'League deleted successfully' });
    } catch (error) {
        console.error('Error deleting league:', error);
        res.status(500).json({ error: 'Failed to delete league' });
    }
});

module.exports = router;
