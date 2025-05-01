const admin = require('../firebase');
const db = admin.firestore();
const { Timestamp } = require('firebase-admin/firestore');
const generateBergerTable = require('../utils/bergerTable');

exports.generateSchedule = async (req, res, next) => {
    try {
        const { year, division } = req.body;

        if (!["lower", "upper"].includes(division)) {
            return res.status(400).json({ message: "Invalid division specified." });
        }

        console.log(`Generating schedule for ${division} gymnasium...`);

        const teamsSnapshot = await db
            .collection("leagues")
            .doc(`${year}_${division}`)
            .collection("teams")
            .get();

        if (!teamsSnapshot || teamsSnapshot.empty) {
            console.error(`No teams found for ${division} in Firestore.`);
            return res.status(400).json({ message: `No teams found for ${division}.` });
        }

        const teams = teamsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data()?.name || "Unknown",
        }));

        if (!teams.length) {
            return res.status(400).json({ message: `No teams found for ${division}.` });
        }

        const schedule = generateBergerTable(teams);

        if (!schedule.length) {
            return res.status(500).json({ message: "Failed to generate valid schedule." });
        }

        console.log(`Schedule successfully generated for ${division}.`);

        const matchesRef = db.collection("leagues").doc(`${year}_${division}`).collection("matches");
        const batch = db.batch();
        let baseDay = new Date(`${year}-03-21T14:15:00+01:00`);

        schedule.forEach((round, roundIndex) => {
            round.forEach((match, matchIndex) => {
                const matchRef = matchesRef.doc();
                const matchDate = new Date(baseDay);
                matchDate.setMinutes(baseDay.getMinutes() + matchIndex * 30);

                batch.set(matchRef, {
                    round: roundIndex + 1,
                    teamA: match.teamA,
                    teamB: match.teamB,
                    teamA_name: match.teamA_name,
                    teamB_name: match.teamB_name,
                    status: "upcoming",
                    scoreA: 0,
                    scoreB: 0,
                    date: Timestamp.fromDate(matchDate)
                });
            });
            baseDay.setDate(baseDay.getDate() + 7);
        });

        await batch.commit();
        res.status(200).json({ message: `Schedule for ${division} successfully generated!` });
    } catch (error) {
        console.error("Error in generateSchedule:", error);
        next(new Error("Failed to generate match schedule."));
    }
};

exports.getMatches = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const matchesSnapshot = await db
            .collection("leagues")
            .doc(`${year}_${division}`)
            .collection("matches")
            .get();

        const matches = matchesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(matches);
    } catch (error) {
        next(new Error("Failed to load matches."));
    }
};

exports.updateMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        const matchData = req.body;
        await db
            .collection("leagues")
            .doc(`${year}_${division}`)
            .collection("matches")
            .doc(matchId)
            .update(matchData);

        res.status(200).json({ message: "Match successfully updated." });
    } catch (error) {
        next(new Error("Failed to update match."));
    }
};

exports.deleteMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        await db
            .collection("leagues")
            .doc(`${year}_${division}`)
            .collection("matches")
            .doc(matchId)
            .delete();

        res.status(200).json({ message: "Match successfully deleted." });
    } catch (error) {
        next(new Error("Failed to delete match."));
    }
};

exports.deleteAllMatches = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const matchesRef = db.collection("leagues").doc(`${year}_${division}`).collection("matches");
        const matchesSnapshot = await matchesRef.get();

        const batch = db.batch();
        matchesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        res.status(200).json({ message: "All matches successfully deleted." });
    } catch (error) {
        next(new Error("Failed to delete all matches."));
    }
};

exports.getUpcomingMatch = async (req, res, next) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ message: "Missing required query parameter: year" });
        }

        const lowerMatchesRef = db.collection("leagues")
            .doc(`${year}_lower`)
            .collection("matches")
            .where("status", "==", "upcoming")
            .orderBy("date")
            .limit(3);

        const upperMatchesRef = db.collection("leagues")
            .doc(`${year}_upper`)
            .collection("matches")
            .where("status", "==", "upcoming")
            .orderBy("date")
            .limit(3);

        const [lowerSnapshot, upperSnapshot] = await Promise.all([
            lowerMatchesRef.get(),
            upperMatchesRef.get()
        ]);

        if (lowerSnapshot.empty || upperSnapshot.empty) {
            return res.status(404).json({ message: "No upcoming matches found." });
        }

        const rounds = [];

        for (let i = 0; i < 3; i++) {
            if (i >= lowerSnapshot.size || i >= upperSnapshot.size) break;

            const lowerDoc = lowerSnapshot.docs[i];
            const upperDoc = upperSnapshot.docs[i];

            const lowerMatch = lowerDoc.data();
            const upperMatch = upperDoc.data();

            rounds.push({
                date: lowerMatch.date.toDate().toISOString(),
                lowerMatch: {
                    teamA_name: lowerMatch.teamA_name,
                    teamB_name: lowerMatch.teamB_name,
                },
                upperMatch: {
                    teamA_name: upperMatch.teamA_name,
                    teamB_name: upperMatch.teamB_name,
                }
            });
        }

        res.status(200).json(rounds);
    } catch (error) {
        console.error("Error in getUpcomingMatch:", error);
        next(new Error("Failed to fetch upcoming matches."));
    }
};

exports.startLiveMatch = async (req, res, next) => {
    try {
        const { year, division } = req.params;

        const matchesRef = db.collection("leagues")
            .doc(`${year}_${division}`)
            .collection("matches");

        const querySnapshot = await matchesRef
            .where("status", "==", "upcoming")
            .orderBy("date")
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return res.status(404).json({ message: "No upcoming matches available." });
        }

        const matchDoc = querySnapshot.docs[0];
        const matchRef = matchDoc.ref;
        const matchData = matchDoc.data();

        const liveMatchRef = db.collection("liveBroadcast").doc("currentMatch");

        await liveMatchRef.set({
            matchRef: matchRef,
            matchRefPath: matchRef.path,
            teamA: matchData.teamA,
            teamB: matchData.teamB,
            teamA_name: matchData.teamA_name,
            teamB_name: matchData.teamB_name,
            scoreA: 0,
            scoreB: 0,
            scorerA: [],
            scorerB: [],
            periodInfo: "1. POLOČAS",
            timeLeft: 600,
            status: "live",
            date: matchData.date
        });

        await matchRef.update({ status: "live" });

        res.status(200).json({ message: "Match is now live!", matchId: matchDoc.id });
    } catch (error) {
        console.error("Error starting live match:", error);
        next(new Error("Failed to start live match."));
    }
};

exports.updateMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        const data = req.body;
        if (data.date) {
            data.date = Timestamp.fromDate(new Date(data.date));
        }
        await db.collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .update(data);
        res.status(200).json({ message: 'Match updated' });
    } catch (error) {
        next(new Error('Failed to update match'));
    }
};

exports.deleteMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        await db.collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .delete();
        res.status(200).json({ message: 'Match deleted' });
    } catch (error) {
        next(new Error('Failed to delete match'));
    }
};

exports.cancelRound = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;
        const matchesRef = db.collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .where('round', '==', parseInt(round));

        const snapshot = await matchesRef.get();
        const batch = db.batch();

        snapshot.forEach(doc => {
            batch.update(doc.ref, { status: 'cancelled' });
        });

        await batch.commit();
        res.status(200).json({ message: 'Round cancelled' });
    } catch (error) {
        next(new Error('Failed to cancel round'));
    }
};

exports.updateRoundDate = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;
        const { date } = req.body;

        const newDate = Timestamp.fromDate(new Date(date));

        const matchesRef = db.collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .where('round', '==', parseInt(round));

        const snapshot = await matchesRef.get();
        const batch = db.batch();

        snapshot.forEach(doc => {
            batch.update(doc.ref, { date: newDate });
        });

        await batch.commit();
        res.status(200).json({ message: 'Round date updated' });
    } catch (error) {
        next(new Error('Failed to update round date'));
    }
};

exports.deleteRound = async (req, res, next) => {
    try {
        const { year, division, round } = req.params;

        const matchesRef = db.collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .where('round', '==', parseInt(round));

        const snapshot = await matchesRef.get();
        const batch = db.batch();

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        res.status(200).json({ message: 'Round deleted' });
    } catch (error) {
        next(new Error('Failed to delete round'));
    }
};
