const express = require('express');
const {
    getIdeas,
    getIdea,
    createIdea,
    getTags,
    getCategories,
    fetchIdeasNow, 
    getComments,
    addComment
} = require('../controllers/idea.controller');
const { protect } = require('../middlewares/auth.middleware');
const { cacheRoute } = require('../middlewares/cacheMiddleware');

const router = express.Router();

// Cache tags and categories for 1 hour (3600 seconds) as they rarely change
router.get('/tags', cacheRoute(3600, 'ideas:tags:'), getTags);
router.get('/categories', cacheRoute(3600, 'ideas:categories:'), getCategories);

// Cache individual ideas for 5 minutes (300 seconds)
router.get('/:id', cacheRoute(300, 'idea:'), getIdea);

// Cache comments for 5 minutes
router.get('/:id/comments', cacheRoute(300, 'idea:comments:'), getComments);

// Cache list of ideas for 5 minutes
router.get('/', cacheRoute(300, 'ideas:'), getIdeas);

// No cache for write operations
router.post('/fetch-now', fetchIdeasNow);
router.post('/:id/comments', protect, addComment);
router.post('/create', protect, createIdea);

module.exports = router;
