const db = require('../firebase');

exports.getPlayers = async (req, res, next) => {
    try {
        const { year, division, teamId } = req.params;
        const playersSnapshot = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').get();
        const players = playersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(players);
    } catch (error) {
        next(new Error('Nepodařilo se načíst hráče.'));
    }
};

exports.addPlayer = async (req, res, next) => {
    try {
        const { year, division, teamId } = req.params;
        const playerData = req.body;
        const playerRef = await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').add(playerData);
        res.status(201).json({ id: playerRef.id, ...playerData });
    } catch (error) {
        next(new Error('Nepodařilo se přidat hráče.'));
    }
};

exports.updatePlayer = async (req, res, next) => {
    try {
        const { year, division, teamId, playerId } = req.params;
        const playerData = req.body;
        await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').doc(playerId).update(playerData);
        res.status(200).json({ message: 'Hráč byl úspěšně aktualizován.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat hráče.'));
    }
};

exports.deletePlayer = async (req, res, next) => {
    try {
        const { year, division, teamId, playerId } = req.params;
        await db.collection('leagues').doc(`${year}_${division}`).collection('teams').doc(teamId).collection('players').doc(playerId).delete();
        res.status(200).json({ message: 'Hráč byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat hráče.'));
    }
};
