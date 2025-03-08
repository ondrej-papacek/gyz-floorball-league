const express = require('express');
const router = express.Router();
const {
    getGoalScorers,
    addGoalScorer,
    updateGoalScorer,
    deleteGoalScorer,
} = require('../controllers/goalScorerController');

router.get('/:year/:division/goalScorers', getGoalScorers);
router.post('/:year/:division/goalScorers', addGoalScorer);
router.put('/:year/:division/goalScorers/:goalScorerId', updateGoalScorer);
router.delete('/:year/:division/goalScorers/:goalScorerId', deleteGoalScorer);

module.exports = router;
