﻿const admin = require('../firebase');
const db = admin.firestore();

exports.getPlayoffRounds = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const roundsSnapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds')
            .get();

        if (!roundsSnapshot.exists) {
            return res.status(404).json({ error: 'Žádná kola playoff nenalezena.' });
        }

        res.status(200).json(roundsSnapshot.data());
    } catch (error) {
        next(new Error('Nepodařilo se načíst kola playoff.'));
    }
};

exports.addPlayoffRound = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;
        const matches = req.body.matches;

        const roundRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds');
        await roundRef.set({ [round]: matches }, { merge: true });

        res.status(201).json({ message: `Kolo ${round} bylo úspěšně přidáno do playoff.` });
    } catch (error) {
        next(new Error('Nepodařilo se vytvořit kolo playoff.'));
    }
};

exports.updatePlayoffRound = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;
        const matches = req.body.matches;

        if (!Array.isArray(matches)) {
            return res.status(400).json({ error: 'Chybný formát zápasů.' });
        }

        const roundRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds');

        await roundRef.set({ [round]: matches }, { merge: true });

        res.status(200).json({ message: `Kolo ${round} bylo úspěšně aktualizováno.` });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat kolo playoff.'));
    }
};

exports.deletePlayoffRound = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;

        const roundRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds');
        await roundRef.set({ [round]: admin.firestore.FieldValue.delete() }, { merge: true });

        res.status(200).json({ message: `Kolo ${round} bylo úspěšně smazáno z playoff.` });
    } catch (error) {
        next(new Error('Nepodařilo se smazat kolo playoff.'));
    }
};
