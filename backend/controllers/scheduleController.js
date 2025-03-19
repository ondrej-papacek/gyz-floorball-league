const db = require('../firebase');
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
        let currentDate = new Date(year, 2, 21);

        schedule.forEach((round, roundIndex) => {
            round.forEach((match) => {
                const matchRef = matchesRef.doc();
                batch.set(matchRef, {
                    round: roundIndex + 1,
                    teamA: match.teamA,
                    teamB: match.teamB,
                    teamA_name: match.teamA_name,
                    teamB_name: match.teamB_name,
                    status: "upcoming",
                    scoreA: 0,
                    scoreB: 0,
                    date: Timestamp.fromDate(new Date(currentDate)),
                });
            });
            currentDate.setDate(currentDate.getDate() + 7);
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

// Update match details
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

// Delete a single match
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

// Delete all matches in a division
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
            .limit(1);

        const upperMatchesRef = db.collection("leagues")
            .doc(`${year}_upper`)
            .collection("matches")
            .where("status", "==", "upcoming")
            .orderBy("date")
            .limit(1);

        const [lowerSnapshot, upperSnapshot] = await Promise.all([
            lowerMatchesRef.get(),
            upperMatchesRef.get()
        ]);

        if (lowerSnapshot.empty || upperSnapshot.empty) {
            return res.status(404).json({ message: "No upcoming matches found." });
        }

        const lowerMatch = lowerSnapshot.docs[0].data();
        const upperMatch = upperSnapshot.docs[0].data();

        res.status(200).json({
            date: lowerMatch.date.toDate().toLocaleDateString("cs-CZ"),
            lowerMatch: {
                teamA: lowerMatch.teamA_name,
                teamB: lowerMatch.teamB_name,
            },
            upperMatch: {
                teamA: upperMatch.teamA_name,
                teamB: upperMatch.teamB_name,
            }
        });
    } catch (error) {
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
        const matchRef = matchDoc.ref;  // Firestore reference to the match
        const matchData = matchDoc.data();

        const liveMatchRef = db.collection("liveBroadcast").doc("currentMatch");

        await liveMatchRef.set({
            matchRef: matchRef,
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






