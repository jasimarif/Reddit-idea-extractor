const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { cacheRoute } = require('../middlewares/cacheMiddleware');
const {
    analyzePainPoints,
    getPainPoints,
    searchPainPoints,
    getPainPointAnalytics,
    getPainPointById,
    updatePainPointStatus,
    validatePainPoint,
    getPainPointsByThreadId
} = require('../controllers/painpoint.controller');

const router = express.Router();

// Cache pain points list for 5 minutes (300 seconds)
router.get('/pain-points', cacheRoute(300, 'painpoints:'), getPainPoints);

// Cache pain point search results for 5 minutes
router.get('/pain-points/search', cacheRoute(300, 'painpoints:search:'), searchPainPoints);

// Cache analytics for 15 minutes as they're more resource-intensive
router.get('/pain-points/analytics', cacheRoute(900, 'painpoints:analytics:'), getPainPointAnalytics);

// Cache pain points by thread for 5 minutes
router.get('/pain-points/thread/:threadId', cacheRoute(300, 'painpoints:thread:'), getPainPointsByThreadId);

// Cache individual pain point for 5 minutes
router.get('/pain-points/:id', cacheRoute(300, 'painpoint:'), getPainPointById);

// No cache for write operations
router.post('/analyze-pain-points', analyzePainPoints);
router.put('/pain-points/:id/status', updatePainPointStatus);
router.post('/pain-points/:id/validate', validatePainPoint);

module.exports = router;