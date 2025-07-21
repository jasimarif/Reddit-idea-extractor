const express = require('express');
const router = express.Router();
const { generateLandingPageHandler } = require('../controllers/landingPage.controller');

// POST /api/generate-landing-page
router.post('/generate-landing-page', generateLandingPageHandler);

module.exports = router; 