const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { requirePremium } = require('../middlewares/premium.middleware');
const { cacheRoute } = require('../middlewares/cacheMiddleware');
const { 
  generateLandingPageHandler,
  getLandingPageByBusinessIdeaIdHandler,
  deployLandingPageHandler,
  generateAndDeployLandingPageHandler 
} = require('../controllers/landingPage.controller');

// Cache landing page for 1 hour (3600 seconds) as they don't change often
router.get('/landing-page/:businessIdeaId', cacheRoute(3600, 'landingpage:'), protect, getLandingPageByBusinessIdeaIdHandler);

// Premium required for write operations
router.post('/generate-landing-page', protect, requirePremium, generateLandingPageHandler);
router.post('/deploy-landing-page/:landingPageId', protect, requirePremium, deployLandingPageHandler);
router.post('/generate-and-deploy-landing-page/:businessIdeaId', protect, requirePremium, generateAndDeployLandingPageHandler);

module.exports = router;