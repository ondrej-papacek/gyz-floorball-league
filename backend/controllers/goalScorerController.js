const db = require('../firebase');

exports.getGoalScorers = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const snapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').get();
        const goalScorers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(goalScorers);
    } catch (error) {
        next(new Error('Nepodařilo se načíst střelce gólů.'));
    }
};

exports.addGoalScorer = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const goalScorerData = req.body;
        const goalScorerRef = await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').add(goalScorerData);
        res.status(201).json({ id: goalScorerRef.id, ...goalScorerData });
    } catch (error) {
        next(new Error('Nepodařilo se přidat střelce gólů.'));
    }
};

exports.updateGoalScorer = async (req, res, next) => {
    try {
        const { year, division, goalScorerId } = req.params;
        const goalScorerData = req.body;
        await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').doc(goalScorerId).update(goalScorerData);
        res.status(200).json({ message: 'Střelec gólů byl úspěšně aktualizován.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat střelce gólů.'));
    }
};

exports.deleteGoalScorer = async (req, res, next) => {
    try {
        const { year, division, goalScorerId } = req.params;
        await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').doc(goalScorerId).delete();
        res.status(200).json({ message: 'Střelec gólů byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat střelce gólů.'));
    }
};
