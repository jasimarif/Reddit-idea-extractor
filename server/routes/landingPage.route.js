const express = require('express');
const router = express.Router();
const { 
  generateLandingPageHandler,
  getLandingPageByBusinessIdeaIdHandler 
} = require('../controllers/landingPage.controller');

// POST /api/generate-landing-page
router.post('/generate-landing-page', generateLandingPageHandler);

// GET /api/landing-page/:businessIdeaId
router.get('/landing-page/:businessIdeaId', getLandingPageByBusinessIdeaIdHandler);

module.exports = router; 