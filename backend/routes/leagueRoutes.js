const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Fetch all leagues
router.get('/', async (req, res) => {
    try {
        const leaguesSnapshot = await db.collection('leagues').get();
        const leagues = leaguesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(leagues);
    } catch (error) {
        console.error('Chyba načítání ligy:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst ligu.' });
    }
});

// POST - Create a new league
router.post('/', async (req, res) => {
    try {
        const { year, division, status } = req.body;
        const newLeague = { year, division, status: status || 'active' };
        const leagueRef = await db.collection('leagues').add(newLeague);
        res.status(201).json({ id: leagueRef.id, ...newLeague });
    } catch (error) {
        console.error('Chyba při vytváření ligy:', error);
        res.status(500).json({ error: 'Nepodařilo se vytvořit ligu.' });
    }
});

// PUT - Update a league
router.put('/:id', async (req, res) => {
    try {
        const leagueId = req.params.id;
        const { status } = req.body;
        await db.collection('leagues').doc(leagueId).update({ status });
        res.status(200).json({ message: 'Liga úspěšně upravena.' });
    } catch (error) {
        console.error('Error updating league:', error);
        res.status(500).json({ error: 'Došlo k chybě během upravení ligy' });
    }
});

// DELETE - Delete a league
router.delete('/:id', async (req, res) => {
    try {
        const leagueId = req.params.id;
        await db.collection('leagues').doc(leagueId).delete();
        res.status(200).json({ message: 'Liga úspěšně smazána.' });
    } catch (error) {
        console.error('Error deleting league:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat ligu.' });
    }
});

module.exports = router;
