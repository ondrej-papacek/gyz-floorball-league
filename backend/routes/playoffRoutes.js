// backend/routes/playoffRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Načtení všech kol playoff pro konkrétní rok a divizi
router.get('/:year/:division/playoff', async (req, res) => {
    try {
        const { year, division } = req.params;
        const roundsSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('playoff').doc('rounds').get();

        if (!roundsSnapshot.exists) {
            return res.status(404).json({ error: 'Žádná kola playoff nenalezena.' });
        }

        res.status(200).json(roundsSnapshot.data());
    } catch (error) {
        console.error('Chyba při načítání kol playoff:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst kola playoff.' });
    }
});

// POST - Vytvoření nového kola playoff
router.post('/:year/:division/playoff/:round', async (req, res) => {
    try {
        const { year, division, round } = req.params;
        const matches = req.body.matches;

        const roundRef = db.collection('leagues').doc(`${year}_${division}`).collection('playoff').doc('rounds');
        await roundRef.set({ [round]: matches }, { merge: true });

        res.status(201).json({ message: `Kolo ${round} bylo úspěšně přidáno do playoff.` });
    } catch (error) {
        console.error('Chyba při vytváření kola playoff:', error);
        res.status(500).json({ error: 'Nepodařilo se vytvořit kolo playoff.' });
    }
});

// PUT - Aktualizace konkrétního kola playoff
router.put('/:year/:division/playoff/:round', async (req, res) => {
    try {
        const { year, division, round } = req.params;
        const matches = req.body.matches;

        const roundRef = db.collection('leagues').doc(`${year}_${division}`).collection('playoff').doc('rounds');
        await roundRef.update({ [round]: matches });

        res.status(200).json({ message: `Kolo ${round} bylo úspěšně aktualizováno.` });
    } catch (error) {
        console.error('Chyba při aktualizaci kola playoff:', error);
        res.status(500).json({ error: 'Nepodařilo se aktualizovat kolo playoff.' });
    }
});

// DELETE - Smazání konkrétního kola playoff
router.delete('/:year/:division/playoff/:round', async (req, res) => {
    try {
        const { year, division, round } = req.params;

        const roundRef = db.collection('leagues').doc(`${year}_${division}`).collection('playoff').doc('rounds');
        await roundRef.update({ [round]: db.FieldValue.delete() });

        res.status(200).json({ message: `Kolo ${round} bylo úspěšně smazáno z playoff.` });
    } catch (error) {
        console.error('Chyba při mazání kola playoff:', error);
        res.status(500).json({ error: 'Nepodařilo se smazat kolo playoff.' });
    }
});

module.exports = router;
