const express = require('express');
const router = express.Router();
const admin = require('../firebase');
const db = admin.firestore();

router.post('/create-user', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, password and role are required' });
    }

    try {
        const existing = await admin.auth().getUserByEmail(email).catch(() => null);
        if (existing) {
            return res.status(400).json({ message: 'Uživatel již existuje.' });
        }

        const userRecord = await admin.auth().createUser({ email, password });
        const forbiddenChars = /[<>"'\\]/;
        if (forbiddenChars.test(password)) {
            return res.status(400).json({ message: 'Heslo obsahuje zakázané znaky.' });
        }

        await db.collection('users').doc(userRecord.uid).set({
            email,
            role,
            uid: userRecord.uid,
        });

        res.status(201).json({ message: 'User created successfully', uid: userRecord.uid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
});

module.exports = router;
