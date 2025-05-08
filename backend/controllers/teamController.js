const admin = require('../firebase');
const db = admin.firestore();
const { generateTeamIdFromName } = require('../utils/teamUtils');

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

        const teamId = generateTeamIdFromName(teamData.name);
        const teamRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .doc(teamId);

        const newTeam = { id: teamId, ...teamData };

        await teamRef.set(newTeam);

        res.status(201).json(newTeam);
    } catch (error) {
        console.error("Failed to add team:", error);
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

        const teamRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .doc(teamId);

        await admin.firestore().recursiveDelete(teamRef);

        res.status(200).json({ message: 'Tým a jeho data byly úspěšně smazány.' });
    } catch (error) {
        console.error("Error during recursive team delete:", error);
        next(new Error('Nepodařilo se smazat tým a jeho poddokumenty.'));
    }
};
