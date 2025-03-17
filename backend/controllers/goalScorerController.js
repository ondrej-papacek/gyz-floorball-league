const db = require('../firebase');

// Fetch goal scorers from Firestore
exports.getGoalScorers = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const snapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').get();
        const goalScorers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Sort by goals (descending)
        goalScorers.sort((a, b) => b.goals - a.goals);

        res.status(200).json(goalScorers);
    } catch (error) {
        next(new Error('Nepodařilo se načíst střelce gólů.'));
    }
};

// Add a new goal scorer
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

// Update goal scorer's goal count
exports.updateGoalScorer = async (req, res, next) => {
    try {
        const { year, division, goalScorerId } = req.params;
        const { goals } = req.body;

        await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').doc(goalScorerId).update({ goals });

        res.status(200).json({ message: 'Střelec gólů byl úspěšně aktualizován.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat střelce gólů.'));
    }
};

// Delete a goal scorer
exports.deleteGoalScorer = async (req, res, next) => {
    try {
        const { year, division, goalScorerId } = req.params;

        await db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers').doc(goalScorerId).delete();

        res.status(200).json({ message: 'Střelec gólů byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat střelce gólů.'));
    }
};

// Automatically update goal scorers when a match is completed
exports.updateGoalScorersAfterMatch = async (year, division, scorerA, scorerB, teamA, teamB) => {
    try {
        const goalScorersRef = db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers');

        const updateGoalScorer = async (name, team) => {
            if (!name) return;

            const scorerQuery = await goalScorersRef.where("name", "==", name).limit(1).get();
            if (!scorerQuery.empty) {
                const scorerDoc = scorerQuery.docs[0];
                await goalScorersRef.doc(scorerDoc.id).update({
                    goals: scorerDoc.data().goals + 1
                });
            } else {
                await goalScorersRef.add({ name, goals: 1, team });
            }
        };

        await updateGoalScorer(scorerA, teamA);
        await updateGoalScorer(scorerB, teamB);

    } catch (error) {
        console.error("Error updating goal scorers:", error);
    }
};
