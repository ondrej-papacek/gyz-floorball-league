const db = require('../firebase');

exports.getTeams = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const teamsSnapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .get();
        const teams = teamsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(teams);
    } catch (error) {
        next(new Error('Nepodařilo se načíst týmy.'));
    }
};

exports.addTeam = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const teamData = req.body;
        const teamRef = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .add(teamData);
        res.status(201).json({ id: teamRef.id, ...teamData });
    } catch (error) {
        next(new Error('Nepodařilo se vytvořit tým.'));
    }
};

exports.updateTeam = async (req, res, next) => {
    try {
        const { year, division, teamId } = req.params;
        const teamData = req.body;
        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .doc(teamId)
            .update(teamData);
        res.status(200).json({ message: 'Tým byl úspěšně aktualizován.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat tým.'));
    }
};

exports.deleteTeam = async (req, res, next) => {
    try {
        const { year, division, teamId } = req.params;
        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .doc(teamId)
            .delete();
        res.status(200).json({ message: 'Tým byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat tým.'));
    }
};
