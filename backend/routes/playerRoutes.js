const express = require('express');
const router = express.Router();
const {
    getPlayers,
    addPlayer,
    updatePlayer,
    deletePlayer,
} = require('../controllers/playerController');

router.get('/:year/:division/teams/:teamId/players', getPlayers);
router.post('/:year/:division/teams/:teamId/players/:playerId', addPlayer);
router.put('/:year/:division/teams/:teamId/players/:playerId', updatePlayer);
router.delete('/:year/:division/teams/:teamId/players/:playerId', deletePlayer);

module.exports = router;
