// const admin = require('../firebase');
// const db = admin.firestore();
//
// exports.updateMatchLive = async (req, res, next) => {
//     try {
//         const { scoreA, scoreB, scorerA, scorerB, periodInfo, timeLeft } = req.body;
//         const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
//
//         const updateData = {
//             scoreA,
//             scoreB,
//             periodInfo,
//             timeLeft,
//             scorerA: Array.isArray(scorerA) ? scorerA : [],
//             scorerB: Array.isArray(scorerB) ? scorerB : [],
//         };
//
//         await liveMatchRef.set(updateData, { merge: true });
//
//         res.status(200).json({ message: 'Live match updated successfully.' });
//     } catch (error) {
//         console.error(error);
//         next(new Error('Failed to update live match.'));
//     }
// };
//
// exports.getLiveMatch = async (req, res, next) => {
//     try {
//         const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
//         const liveMatchSnapshot = await liveMatchRef.get();
//
//         if (!liveMatchSnapshot.exists) {
//             return res.status(404).json({ message: 'No live match found.' });
//         }
//
//         res.status(200).json(liveMatchSnapshot.data());
//     } catch (error) {
//         next(new Error('Failed to fetch live match.'));
//     }
// };
//
// exports.completeMatch = async (req, res, next) => {
//     try {
//         const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
//         const liveMatchSnapshot = await liveMatchRef.get();
//
//         if (!liveMatchSnapshot.exists) {
//             return res.status(404).json({ message: 'No live match found.' });
//         }
//
//         const matchData = liveMatchSnapshot.data();
//         const { year, division, teamA, teamB, teamA_name, teamB_name, scoreA, scoreB, scorerA, scorerB, id } = matchData;
//
//         const teamsRef = db.collection('leagues').doc(`${year}_${division}`).collection('teams');
//         const matchesRef = db.collection('leagues').doc(`${year}_${division}`).collection('matches');
//         const goalScorersRef = db.collection('leagues').doc(`${year}_${division}`).collection('goalScorers');
//
//         const teamARef = teamsRef.doc(teamA);
//         const teamBRef = teamsRef.doc(teamB);
//
//         const teamASnapshot = await teamARef.get();
//         const teamBSnapshot = await teamBRef.get();
//
//         if (!teamASnapshot.exists || !teamBSnapshot.exists) {
//             return res.status(404).json({ message: 'One or both teams not found.' });
//         }
//
//         const teamAStats = teamASnapshot.data();
//         const teamBStats = teamBSnapshot.data();
//
//         teamAStats.matchesPlayed += 1;
//         teamBStats.matchesPlayed += 1;
//         teamAStats.goalsScored += scoreA;
//         teamBStats.goalsScored += scoreB;
//         teamAStats.goalsConceded += scoreB;
//         teamBStats.goalsConceded += scoreA;
//
//         await teamARef.update(teamAStats);
//         await teamBRef.update(teamBStats);
//
//         await matchesRef.doc(id).update({ scoreA, scoreB, status: 'completed' });
//
//         const updateGoalScorer = async (scorers, teamName) => {
//             if (!scorers || scorers.length === 0) return;
//
//             for (const scorer of scorers) {
//                 const { name, goals } = scorer;
//                 const q = await goalScorersRef.where('name', '==', name).limit(1).get();
//
//                 if (!q.empty) {
//                     const docRef = q.docs[0].ref;
//                     await docRef.update({
//                         goals: admin.firestore.FieldValue.increment(goals),
//                     });
//                 } else {
//                     await goalScorersRef.add({ name, goals, team: teamName });
//                 }
//             }
//         };
//
//         await updateGoalScorer(scorerA, teamA_name);
//         await updateGoalScorer(scorerB, teamB_name);
//
//         await liveMatchRef.delete();
//
//         res.status(200).json({ message: 'Match completed and updated successfully.' });
//     } catch (error) {
//         console.error(error);
//         next(new Error('Failed to complete match.'));
//     }
// };
//
// exports.clearLiveMatch = async (req, res, next) => {
//     try {
//         const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
//         await liveMatchRef.delete();
//
//         res.status(200).json({ message: 'Live match cleared.' });
//     } catch (error) {
//         next(new Error('Failed to clear live match.'));
//     }
// };
//
// exports.pushLiveBroadcast = async (req, res, next) => {
//     try {
//         const liveMatchRef = db.collection('liveBroadcast').doc('currentMatch');
//         const data = req.body;
//
//         await liveMatchRef.set(data, { merge: true });
//
//         res.status(200).json({ message: 'Live broadcast pushed successfully.' });
//     } catch (error) {
//         console.error('Error in pushLiveBroadcast:', error);
//         next(new Error('Failed to push live broadcast.'));
//     }
// };
//
