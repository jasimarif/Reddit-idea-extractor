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
  generateAndDeployLandingPageHandler,
  getLandingPageUsageHandler,
  getMyLandingPagesHandler,
  checkDeploymentStatusHandler
} = require('../controllers/landingPage.controller');

// Public routes (no auth required)
router.get('/templates', getTemplatesHandler);

// Cache landing page for 1 hour (3600 seconds) as they don't change often
router.get('/landing-page/:businessIdeaId', cacheRoute(3600, 'landingpage:'), protect, getLandingPageByBusinessIdeaIdHandler);

// Get user's landing page usage (no premium required for reading usage)
router.get('/usage', protect, getLandingPageUsageHandler);

// Get all landing pages for the authenticated user
router.get('/my-pages', protect, getMyLandingPagesHandler);

// Check deployment status
router.get('/deployment-status/:landingPageId', protect, checkDeploymentStatusHandler);

// Template preview (no premium required for preview)
router.get('/preview/:businessIdeaId/:templateId', protect, previewTemplateHandler);

// Check deployment status
router.get('/deployment-status/:landingPageId', protect, checkDeploymentStatusHandler);

// Premium required for write operations
router.post('/generate-landing-page', protect, generateLandingPageHandler);
router.post('/generate-landing-page-with-template', protect, generateLandingPageWithTemplateHandler);
router.post('/deploy-landing-page/:landingPageId', protect, deployLandingPageHandler);
router.post('/generate-and-deploy-landing-page/:businessIdeaId', protect, generateAndDeployLandingPageHandler);

module.exports = router;