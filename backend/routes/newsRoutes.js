const express = require('express');
const router = express.Router();
const { getNews, getLatestNews, addNews, updateNews, deleteNews } = require('../controllers/newsController');

router.get('/', getNews);
router.get('/latest', getLatestNews);
router.post('/', addNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

module.exports = router;
