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

        if (!teams || teams.length === 0) {
            console.error(`No teams found for ${division}.`);
            return res.status(400).json({ message: `No teams found for ${division}.` });
        }

        const schedule = generateBergerTable(teams);

        if (!schedule || schedule.length === 0) {
            console.error("Failed to generate valid schedule.");
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
        res.status(200).json({ message: `Rozpis zápasů pro ${division} byl úspěšně vygenerován!` });
    } catch (error) {
        console.error("Error in generateSchedule:", error);
        next(new Error("Nepodařilo se vygenerovat rozpis zápasů."));
    }
};

exports.getUpcomingMatch = async (req, res) => {
    try {
        console.log("Fetching upcoming match...");

        const now = Timestamp.now();
        const matchesRef = db.collectionGroup("matches");

        const querySnapshot = await matchesRef
            .where("status", "==", "upcoming")
            .where("date", ">=", now)
            .orderBy("date")
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            console.log("No upcoming matches found in Firestore.");
            return res.status(404).json({ message: "No upcoming matches available. Please check the database." });
        }

        const matchDoc = querySnapshot.docs[0];
        const match = matchDoc.data();
        const matchId = matchDoc.id;

        console.log("Upcoming Match Found:", match);

        res.status(200).json({
            id: matchId,
            teamA: match.teamA,
            teamB: match.teamB,
            teamA_name: match.teamA_name,
            teamB_name: match.teamB_name,
            round: match.round,
            status: match.status,
            scoreA: match.scoreA,
            scoreB: match.scoreB,
            date: match.date.toDate(),
        });
    } catch (error) {
        console.error("Error fetching upcoming match:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

exports.getMatches = async (req, res, next) => {
    try {
        const { year, division } = req.params;

        const matchesSnapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .get();

        const matches = await Promise.all(matchesSnapshot.docs.map(async doc => {
            const matchData = doc.data();

            let teamAName = matchData.teamA_name || "Unknown";
            let teamBName = matchData.teamB_name || "Unknown";

            if (matchData.teamA && matchData.teamA.path) {
                try {
                    const teamARef = await db.doc(matchData.teamA.path).get();
                    if (teamARef.exists) teamAName = teamARef.data().name;
                } catch (error) {
                    console.warn("Failed to fetch teamA:", error);
                }
            }

            if (matchData.teamB && matchData.teamB.path) {
                try {
                    const teamBRef = await db.doc(matchData.teamB.path).get();
                    if (teamBRef.exists) teamBName = teamBRef.data().name;
                } catch (error) {
                    console.warn("Failed to fetch teamB:", error);
                }
            }

            return {
                id: doc.id,
                teamA: teamAName,
                teamB: teamBName,
                round: matchData.round,
                status: matchData.status,
                scoreA: matchData.scoreA,
                scoreB: matchData.scoreB,
                date: matchData.date.toDate(),
            };
        }));

        res.status(200).json(matches);
    } catch (error) {
        next(new Error('Failed to load matches.'));
    }
};


exports.updateMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        const matchData = req.body;
        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .update(matchData);

        res.status(200).json({ message: 'Zápas byl úspěšně aktualizován.' });
    } catch (error) {
        next(new Error('Nepodařilo se aktualizovat zápas.'));
    }
};

exports.deleteMatch = async (req, res, next) => {
    try {
        const { year, division, matchId } = req.params;
        await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches')
            .doc(matchId)
            .delete();
        res.status(200).json({ message: 'Zápas byl úspěšně smazán.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat zápas.'));
    }
};

exports.deleteAllMatches = async (req, res, next) => {
    try {
        const { year, division } = req.params;
        const matchesRef = db.collection('leagues').doc(`${year}_${division}`).collection('matches');
        const matchesSnapshot = await matchesRef.get();

        const batch = db.batch();
        matchesSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        res.status(200).json({ message: 'Všechny zápasy byly úspěšně smazány.' });
    } catch (error) {
        next(new Error('Nepodařilo se smazat všechny zápasy.'));
    }
};
