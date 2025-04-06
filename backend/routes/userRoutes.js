const express = require('express');
const router = express.Router();
const {
    getUsers,
    addUser,
    updateUserRole,
    deleteUser,
} = require('../controllers/userController');

router.get('/', getUsers);
router.post('/', addUser);
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
