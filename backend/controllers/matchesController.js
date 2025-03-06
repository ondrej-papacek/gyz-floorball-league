const db = require('../firebase');

// Get all matches for a league (year + division)
exports.getMatches = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const matchesSnapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .get();

        const matches = matchesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(matches);
    } catch (error) {
        next(new Error('Nepodařilo se načíst zápasy.'));
    }
};

// Update match score
exports.updateMatchScore = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        const { scoreA, scoreB } = req.body;

        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .update({ scoreA, scoreB });

        res.status(200).json({ message: 'Skóre zápasu bylo úspěšně aktualizováno.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat skóre zápasu.'));
    }
};

// Delete a match
exports.deleteMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;

        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .delete();

        res.status(200).json({ message: 'Zápas byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat zápas.'));
    }
};
