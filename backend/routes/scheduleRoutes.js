const express = require('express');
const router = express.Router();
const {
    generateSchedule,
    getUpcomingMatch,
    getMatches,
    updateMatch,
    deleteMatch,
    deleteAllMatches,
} = require('../controllers/scheduleController');

// API Endpoints
router.post('/generate-schedule', generateSchedule);
router.get('/upcoming-match', getUpcomingMatch);
router.get('/:year/:division/matches', getMatches);
router.put('/:year/:division/matches/:matchId', updateMatch);
router.delete('/:year/:division/matches/:matchId', deleteMatch);
router.delete('/:year/:division/matches', deleteAllMatches);

module.exports = router;
