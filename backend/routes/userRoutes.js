// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET - Získání všech uživatelů
router.get('/', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST - Vytvoření nového uživatele
router.post('/', async (req, res) => {
    try {
        const { uid, role } = req.body;
        const newUser = { uid, role };
        const userRef = await db.collection('users').add(newUser);
        res.status(201).json({ id: userRef.id, ...newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT - Aktualizace role uživatele
router.put('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;
        await db.collection('users').doc(userId).update({ role });
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

// DELETE - Smazání uživatele
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await db.collection('users').doc(userId).delete();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
