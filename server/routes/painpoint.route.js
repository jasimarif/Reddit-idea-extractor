const express = require('express');
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

router.post('/analyze-pain-points', analyzePainPoints);

router.get('/pain-points', getPainPoints);

router.get('/pain-points/search', searchPainPoints);

router.get('/pain-points/analytics', getPainPointAnalytics);

router.get('/pain-points/thread/:threadId', getPainPointsByThreadId);

router.get('/pain-points/:id', getPainPointById);

router.put('/pain-points/:id/status', updatePainPointStatus);

router.post('/pain-points/:id/validate', validatePainPoint);

module.exports = router;