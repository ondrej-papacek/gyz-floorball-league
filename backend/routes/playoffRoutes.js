const express = require('express');
const router = express.Router();
const {
    getPlayoffRounds,
    addPlayoffRound,
    updatePlayoffRound,
    deletePlayoffRound,
} = require('../controllers/playoffController');

router.get('/:year/:division/playoff', getPlayoffRounds);
router.post('/:year/:division/playoff/:round', addPlayoffRound);
router.put('/:year/:division/playoff/:round', updatePlayoffRound);
router.delete('/:year/:division/playoff/:round', deletePlayoffRound);

module.exports = router;
