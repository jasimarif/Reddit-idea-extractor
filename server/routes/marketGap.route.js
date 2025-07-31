const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { cacheRoute } = require('../middlewares/cacheMiddleware');
const {
  generateIdeas,
  getBusinessIdeas,
  getBusinessIdea,
  getBusinessIdeasByPainPointId,
} = require('../controllers/marketGap.controller');

// Cache business ideas for 5 minutes (300 seconds)
router.get('/ideas', cacheRoute(300, 'marketgaps:ideas:'), getBusinessIdeas);

// Cache individual business idea for 5 minutes
router.get('/ideas/:id', cacheRoute(300, 'marketgap:idea:'), getBusinessIdea);

// Cache business ideas by pain point for 5 minutes
router.get('/ideas/by-painpoint/:painPointId', cacheRoute(300, 'marketgap:by-painpoint:'), getBusinessIdeasByPainPointId);

// No cache for write operations
router.post('/generate-ideas', protect, generateIdeas);

module.exports = router;
