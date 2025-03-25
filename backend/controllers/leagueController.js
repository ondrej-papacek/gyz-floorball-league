const admin = require('../firebase');
const db = admin.firestore();

exports.getLeagues = async (req, res, next) => {
    try {
        const leaguesSnapshot = await db.collection('leagues').get();
        const leagues = leaguesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(leagues);
    } catch (error) {
        next(new Error('Nepodařilo se načíst ligy.'));
    }
};

exports.addLeague = async (req, res, next) => {
    try {
        const { year, division, status } = req.body;
        const newLeague = { year, division, status: status || 'active' };
        const leagueRef = await db.collection('leagues').add(newLeague);
        res.status(201).json({ id: leagueRef.id, ...newLeague });
    } catch (error) {
        next(new Error('Nepodařilo se vytvořit ligu.'));
    }
};

exports.updateLeague = async (req, res, next) => {
    try {
        const leagueId = req.params.id;
        const { status } = req.body;
        await db.collection('leagues').doc(leagueId).update({ status });
        res.status(200).json({ message: 'Liga byla úspěšně aktualizována.' });
    } catch (error) {
        next(new Error('Nepodařilo se upravit ligu.'));
    }
};

exports.deleteLeague = async (req, res, next) => {
    try {
        const leagueId = req.params.id;
        await db.collection('leagues').doc(leagueId).delete();
        res.status(200).json({ message: 'Liga byla úspěšně smazána.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat ligu.'));
    }
};
