const express = require('express');
const router = express.Router();
const { 
  generateLandingPageHandler,
  getLandingPageByBusinessIdeaIdHandler,
  deployLandingPageHandler,
  generateAndDeployLandingPageHandler 
} = require('../controllers/landingPage.controller');

// POST /api/generate-landing-page
router.post('/generate-landing-page', generateLandingPageHandler);

// POST /api/deploy-landing-page/:landingPageId
router.post('/deploy-landing-page/:landingPageId', deployLandingPageHandler);

// POST /api/generate-and-deploy-landing-page/:businessIdeaId
router.post('/generate-and-deploy-landing-page/:businessIdeaId', generateAndDeployLandingPageHandler);

// GET /api/landing-page/:businessIdeaId
router.get('/landing-page/:businessIdeaId', getLandingPageByBusinessIdeaIdHandler);


module.exports = router; 