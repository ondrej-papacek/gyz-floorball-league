const db = require('../firebase');
const admin = require('firebase-admin');

// Update live match scores and goalscorers dynamically
exports.updateMatchLive = async (req, res, next) => {
    try {
        const { scoreA, scoreB, scorerA, scorerB, periodInfo, timeLeft } = req.body;
        const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');

        let updateData = {
            scoreA,
            scoreB,
            periodInfo,
            timeLeft
        };

        if (Array.isArray(scorerA) && scorerA.length > 0) {
            updateData.scorerA = admin.firestore.FieldValue.arrayUnion(...scorerA);
        } else {
            updateData.scorerA = [];
        }

        if (Array.isArray(scorerB) && scorerB.length > 0) {
            updateData.scorerB = admin.firestore.FieldValue.arrayUnion(...scorerB);
        } else {
            updateData.scorerB = [];
        }

        await liveMatchRef.update(updateData);

        res.status(200).json({ message: 'Live match updated successfully.' });
    } catch (error) {
        next(new Error('Failed to update live match.'));
    }
};

// Fetch the currently live match
exports.getLiveMatch = async (req, res, next) => {
    try {
        const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
        const liveMatchSnapshot = await liveMatchRef.get();

        if (!liveMatchSnapshot.exists) {
            return res.status(404).json({ message: 'No live match found.' });
        }

        res.status(200).json(liveMatchSnapshot.data());
    } catch (error) {
        next(new Error('Failed to fetch live match.'));
    }
};

// Complete live match, update stats, and store results
exports.completeMatch = async (req, res, next) => {
    try {
        const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
        const liveMatchSnapshot = await liveMatchRef.get();

        if (!liveMatchSnapshot.exists) {
            return res.status(404).json({ message: 'No live match found.' });
        }

        const matchData = liveMatchSnapshot.data();
        const { year, division, teamA, teamB, teamA_name, teamB_name, scoreA, scoreB, scorerA, scorerB } = matchData;

        const teamsRef = db.collection('leagues').doc(`${year}_${division}`).collection('teams');
        const matchesRef = db.collection('leagues').doc(`${year}_${division}`).collection('matches');
        const goalScorersRef = db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers');

        // 🔹 Update team stats
        const teamARef = teamsRef.doc(teamA);
        const teamBRef = teamsRef.doc(teamB);
        const teamASnapshot = await teamARef.get();
        const teamBSnapshot = await teamBRef.get();

        if (!teamASnapshot.exists || !teamBSnapshot.exists) {
            return res.status(404).json({ message: 'One or both teams not found.' });
        }

        let teamAStats = teamASnapshot.data();
        let teamBStats = teamBSnapshot.data();

        teamAStats.matchesPlayed += 1;
        teamBStats.matchesPlayed += 1;
        teamAStats.goalsScored += scoreA;
        teamBStats.goalsScored += scoreB;
        teamAStats.goalsConceded += scoreB;
        teamBStats.goalsConceded += scoreA;

        await teamARef.update(teamAStats);
        await teamBRef.update(teamBStats);

        // Store match result
        await matchesRef.doc(matchData.id).update({ scoreA, scoreB, status: "completed" });

        // Save all goalscorers
        const updateGoalScorer = async (scorers, team) => {
            if (!scorers || scorers.length === 0) return;

            for (const scorer of scorers) {
                const { name, goals } = scorer;
                const scorerQuery = await goalScorersRef.where("name", "==", name).limit(1).get();

                if (!scorerQuery.empty) {
                    const scorerDoc = scorerQuery.docs[0];
                    await goalScorersRef.doc(scorerDoc.id).update({
                        goals: scorerDoc.data().goals + goals
                    });
                } else {
                    await goalScorersRef.add({ name, goals, team });
                }
            }
        };

        await updateGoalScorer(scorerA, teamA_name);
        await updateGoalScorer(scorerB, teamB_name);

        // Remove match from live broadcast
        await liveMatchRef.delete();

        res.status(200).json({ message: 'Match completed and updated successfully.' });
    } catch (error) {
        next(new Error('Failed to complete match.'));
    }
};

// **Clear live match manually (for debugging/admins)**
exports.clearLiveMatch = async (req, res, next) => {
    try {
        const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
        await liveMatchRef.delete();

        res.status(200).json({ message: 'Live match cleared.' });
    } catch (error) {
        next(new Error('Failed to clear live match.'));
    }
};
