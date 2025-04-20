const admin = require('../firebase');
const db = admin.firestore();

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

exports.getTeamMatches = async (req, res, next) => {
    try {
        const { year, division, teamId } = req.params;

        const matchesSnapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .where('status', '==', 'finished')
            .get();

        const teamMatches = matchesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(match => match.teamA_id === teamId || match.teamB_id === teamId);

        res.status(200).json(teamMatches);
    } catch (error) {
        next(new Error('Nepodařilo se načíst zápasy týmu.'));
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

        if (!Array.isArray(teamData.matches)) {
            teamData.matches = [];
        }

        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .doc(teamId)
            .update(teamData);

        res.status(200).json({ message: 'Tým byl úspěšně aktualizován.' });
    } catch (error) {
        console.error("Update team error:", error);
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
