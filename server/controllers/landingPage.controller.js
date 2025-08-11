const { generateLandingPage } = require("../services/landingPage.service");
const {
  getLandingPageByBusinessIdeaId,
} = require("../services/landingPage.service");
const landingPageService = require("../services/landingPage.service");

async function generateLandingPageHandler(req, res) {
  try {
    const { businessIdeaId } = req.body;
    if (!businessIdeaId) {
      return res.status(400).json({ error: "businessIdeaId is required" });
    }
    const userId = req.user._id; // Get the authenticated user's ID
    const landingPage = await generateLandingPage(businessIdeaId, userId);
    res.status(201).json({ landingPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getLandingPageByBusinessIdeaIdHandler(req, res) {
  try {
    const { businessIdeaId } = req.params;
    if (!businessIdeaId) {
      return res.status(400).json({ error: "businessIdeaId is required" });
    }
    
    const userId = req.user._id; // Get the authenticated user's ID
    const landingPage = await getLandingPageByBusinessIdeaId(businessIdeaId, userId);

    if (!landingPage) {
      return res.status(404).json({ error: "Landing page not found" });
    }

    res.status(200).json({ landingPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Deploy a landing page
async function deployLandingPageHandler(req, res) {
  try {
    const { landingPageId } = req.params;
    const { target = 'vercel' } = req.body;
    
    const result = await landingPageService.deployLandingPage(landingPageId, { target });
    
    res.json(result);
  } catch (error) {
    console.error('Deployment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy landing page',
      error: error.message
    });
  }
}

// Generate and deploy in one step
async function generateAndDeployLandingPageHandler(req, res) {
  try {
    const { businessIdeaId } = req.params;
    const { target = 'vercel' } = req.body;
    
    const userId = req.user._id; // Get the authenticated user's ID
    const result = await landingPageService.generateAndDeployLandingPage(
      businessIdeaId,
      userId,
      { target }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in generate and deploy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate and deploy landing page',
      error: error.message
    });
  }
}



module.exports = {
  generateLandingPageHandler,
  getLandingPageByBusinessIdeaIdHandler,
  deployLandingPageHandler,
  generateAndDeployLandingPageHandler,

};
