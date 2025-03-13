const db = require('../firebase');

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

