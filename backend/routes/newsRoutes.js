const express = require('express');
const router = express.Router();
const { getNews, addNews, updateNews, deleteNews } = require('../controllers/newsController');

// Define routes for CRUD operations
router.get('/', getNews); // Fetch all news
router.post('/', addNews); // Add news
router.put('/:id', updateNews); // Update news
router.delete('/:id', deleteNews); // Delete news

module.exports = router;
