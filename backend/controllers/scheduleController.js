const db = require('../firebase');
const generateBergerTable = require('../utils/bergerTable');

// Generování rozpisu zápasů
exports.generateSchedule = async (req, res, next) => {
    try {
        const { division, year } = req.body;

        // Načtení týmů z databáze
        const teamsSnapshot = await db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('teams')
            .get();
        const teams = teamsSnapshot.docs.map((doc) => doc.data().name);

        // Vygenerování rozpisu pomocí Bergerových tabulek
        const schedule = generateBergerTable(teams);

        // Uložení rozpisu do databáze
        const matchesRef = db
            .collection('leagues')
            .doc(`${year}_${division}`)
            .collection('matches');
        await Promise.all(schedule.flatMap((round) => round.map((match) => matchesRef.add(match))));

        res.status(200).json({ message: 'Rozpis zápasů byl úspěšně vygenerován a uložen do databáze.' });
    } catch (error) {
        next(new Error('Nepodařilo se vygenerovat rozpis zápasů.'));
    }
};

exports.getUpcomingMatch = async (req, res) => {
    try {
        console.log("Fetching upcoming match...");

        const now = new Date();
        const matchesRef = db.collectionGroup("matches");

        const querySnapshot = await matchesRef
            .where("status", "==", "upcoming")
            .where("date", ">=", now)
            .orderBy("status")
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

        console.log("✅ Upcoming Match Found:", match);

        res.status(200).json({
            id: matchId,
            ...match,
            date: match.date.toDate(),
        });
    } catch (error) {
        console.error("🔥 Error fetching upcoming match:", error);
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
        const matches = matchesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(matches);
    } catch (error) {
        next(new Error('Nepodařilo se načíst zápasy.'));
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
