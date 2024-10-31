const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Fetch all users
router.get('/', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        console.error('Chyba při načítání uživatelů:', error);
        res.status(500).json({ error: 'Nepodařilo se načíst uživatele' });
    }
});

// POST - Create a new user
router.post('/', async (req, res) => {
    try {
        const { uid, role } = req.body;
        const newUser = { uid, role };
        const userRef = await db.collection('users').add(newUser);
        res.status(201).json({ id: userRef.id, ...newUser });
    } catch (error) {
        console.error('Chyba při vytváření uživatele:', error);
        res.status(500).json({ error: 'Nepodařilo se vytvořit uživatele.' });
    }
});

// PUT - Update a user’s role
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        await db.collection('users').doc(userId).update({ role });
        res.status(200).json({ message: 'Uživatelská role byla úspěšně upravena.' });
    } catch (error) {
        console.error('Chyba při upravování uživatelské role:', error);
        res.status(500).json({ error: 'Nepodařilo se upravit role.' });
    }
});

// DELETE - Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await db.collection('users').doc(userId).delete();
        res.status(200).json({ message: 'Uživatel byl úspěšně smazán.' });
    } catch (error) {
        console.error('Chyba při odstranění uživatele:', error);
        res.status(500).json({ error: 'Nepodařilo se odstranit uživatele.' });
    }
});

module.exports = router;
