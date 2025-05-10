const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// API Endpoints
router.post("/generate-schedule", scheduleController.generateSchedule);
router.get("/:year/:division/matches", scheduleController.getMatches);
router.put("/:year/:division/matches/:matchId", scheduleController.updateMatch);
router.delete("/:year/:division/matches/:matchId", scheduleController.deleteMatch);
router.delete("/:year/:division/matches", scheduleController.deleteAllMatches);
router.get("/upcoming-match", scheduleController.getUpcomingMatch);
router.put("/liveMatch/:year/:division", scheduleController.startLiveMatch);
router.post("/:year/:division/round/:round/cancel", scheduleController.cancelRound);
router.put("/:year/:division/round/:round/date", scheduleController.updateRoundDate);
router.put("/:year/:division/matches/:matchId/force-finish", scheduleController.forceFinishMatch);
router.delete("/:year/:division/round/:round", scheduleController.deleteRound);

module.exports = router;
