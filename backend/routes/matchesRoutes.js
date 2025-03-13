const express = require('express');
const router = express.Router();
const {
    updateMatchScore,
} = require('../controllers/matchesController');

router.put('/:year/:division/:matchId', updateMatchScore);

module.exports = router;
