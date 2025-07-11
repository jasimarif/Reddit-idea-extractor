const express = require('express');
const {
    getIdeas,
    getIdea,
    createIdea,
    getTags,
    getCategories,
    fetchIdeasNow
} = require('../controllers/idea.controller');
const {protect} = require('../middlewares/auth.middleware')

const router = express.Router();

router.get('/tags', getTags);
router.get('/categories', getCategories);
router.post('/fetch-now', fetchIdeasNow);
router.get('/:id', getIdea);
router.post('/create', protect, createIdea);
router.get('/', getIdeas);

module.exports = router;
