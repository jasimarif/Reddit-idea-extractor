const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { requirePremium } = require('../middlewares/premium.middleware');
const { cacheRoute } = require('../middlewares/cacheMiddleware');
const { 
  generateLandingPageHandler,
  getLandingPageByBusinessIdeaIdHandler,
  getTemplatesHandler,
  generateLandingPageWithTemplateHandler,
  previewTemplateHandler,
  deployLandingPageHandler,
  generateAndDeployLandingPageHandler 
} = require('../controllers/landingPage.controller');

// Public routes (no auth required)
router.get('/templates', getTemplatesHandler);

// Cache landing page for 1 hour (3600 seconds) as they don't change often
router.get('/landing-page/:businessIdeaId', cacheRoute(3600, 'landingpage:'), protect, getLandingPageByBusinessIdeaIdHandler);

// Template preview (no premium required for preview)
router.get('/preview/:businessIdeaId/:templateId', protect, previewTemplateHandler);

// Premium required for write operations
router.post('/generate-landing-page', protect, requirePremium, generateLandingPageHandler);
router.post('/generate-landing-page-with-template', protect, requirePremium, generateLandingPageWithTemplateHandler);
router.post('/deploy-landing-page/:landingPageId', protect, requirePremium, deployLandingPageHandler);
router.post('/generate-and-deploy-landing-page/:businessIdeaId', protect, requirePremium, generateAndDeployLandingPageHandler);

module.exports = router;