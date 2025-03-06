const express = require('express');
const router = express.Router();
const {
    getMatches,
    updateMatchScore,
    deleteMatch
} = require('../controllers/matchesController');

router.get('/:year/:division', getMatches);
router.put('/:year/:division/:matchId', updateMatchScore);
router.delete('/:year/:division/:matchId', deleteMatch);

module.exports = router;
