const express = require('express');
const router = express.Router();
const {
    getTeams,
    addTeam,
    updateTeam,
    deleteTeam,
    getTeamMatches
} = require('../controllers/teamController');

router.get('/:year/:division/teams', getTeams);
router.post('/:year/:division/teams', addTeam);
router.put('/:year/:division/teams/:teamId', updateTeam);
router.delete('/:year/:division/teams/:teamId', deleteTeam);
router.get('/:year/:division/teams/:teamId/matches', getTeamMatches);

module.exports = router;
