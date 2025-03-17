const express = require('express');
const router = express.Router();
const {
    getGoalScorers,
    addGoalScorer,
    updateGoalScorer,
    deleteGoalScorer
} = require('../controllers/goalScorerController');

router.get('/:year/:division', getGoalScorers);
router.post('/:year/:division', addGoalScorer);
router.put('/:year/:division/:goalScorerId', updateGoalScorer);
router.delete('/:year/:division/:goalScorerId', deleteGoalScorer);

module.exports = router;
