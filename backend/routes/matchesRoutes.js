const express = require('express');
const router = express.Router();
const {
    updateMatchLive,
    completeMatch,
} = require('../controllers/matchesController');

router.put('/:year/:division/:matchId', updateMatchLive);
router.put('/:year/:division/:matchId/complete', completeMatch);

module.exports = router;
