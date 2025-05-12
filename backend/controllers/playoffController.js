const { admin, db } = require('../firebase');

exports.getPlayoffRounds = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const snapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds')
            .collection('bracketMatches')
            .get();

        const matches = snapshot.docs.map(doc => doc.data());

        res.status(200).json(matches);
    } catch (error) {
        next(new Error('Nepodařilo se načíst kola playoff.'));
    }
};

exports.addPlayoffRound = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const matches = req.body.matches;

        const bracketRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds')
            .collection('bracketMatches');

        const writePromises = matches.map(match =>
            bracketRef.doc(match.id).set(match)
        );

        await Promise.all(writePromises);

        res.status(201).json({ message: `Kolo bylo úspěšně přidáno do bracketMatches.` });
    } catch (error) {
        next(new Error('Nepodařilo se vytvořit kolo playoff.'));
    }
};

exports.updatePlayoffRound = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const matches = req.body.matches;

        if (!Array.isArray(matches)) {
            return res.status(400).json({ error: 'Chybný formát zápasů.' });
        }

        const bracketRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds')
            .collection('bracketMatches');

        const updatePromises = matches.map(match =>
            bracketRef.doc(match.id).set(match, { merge: true })
        );

        await Promise.all(updatePromises);

        res.status(200).json({ message: `Kolo bylo úspěšně aktualizováno.` });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat kolo playoff.'));
    }
};

exports.deletePlayoffRound = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;

        const bracketRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('playoff')
            .doc('rounds')
            .collection('bracketMatches');

        const snapshot = await bracketRef.get();

        const deletePromises = snapshot.docs
            .filter(doc => doc.data().tournamentRoundText === round)
            .map(doc => bracketRef.doc(doc.id).delete());

        await Promise.all(deletePromises);

        res.status(200).json({ message: `Kolo ${round} bylo úspěšně smazáno z playoff.` });
    } catch (error) {
        next(new Error('Nepodařilo se smazat kolo playoff.'));
    }
};
