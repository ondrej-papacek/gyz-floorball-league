const express = require('express');
const router = express.Router();
const {
    getLeagues,
    addLeague,
    updateLeague,
    deleteLeague,
} = require('../controllers/leagueController');

router.get('/', getLeagues);
router.post('/', addLeague);
router.put('/:id', updateLeague);
router.delete('/:id', deleteLeague);

module.exports = router;
