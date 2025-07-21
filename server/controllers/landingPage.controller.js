const { generateLandingPage } = require('../services/landingPage.service');

/**
 * POST /api/generate-landing-page
 * Body: { businessIdeaId: string }
 */
async function generateLandingPageHandler(req, res) {
  try {
    const { businessIdeaId } = req.body;
    if (!businessIdeaId) {
      return res.status(400).json({ error: 'businessIdeaId is required' });
    }
    const landingPage = await generateLandingPage(businessIdeaId);
    res.status(201).json({ landingPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateLandingPageHandler,
}; 