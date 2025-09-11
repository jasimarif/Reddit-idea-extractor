const { 
  generateLandingPage,
  getLandingPageByBusinessIdeaId,
  getTemplates,
  generateLandingPageWithTemplate,
  previewTemplate
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
    let landingPage = await getLandingPageByBusinessIdeaId(businessIdeaId, userId);

    // If no landing page exists, create one automatically
    if (!landingPage) {
      console.log(`No landing page found for business idea ${businessIdeaId}. Creating new landing page...`);
      landingPage = await generateLandingPage(businessIdeaId, userId);
    }

    res.status(200).json({ landingPage });
  } catch (error) {
    console.error('Error fetching/creating landing page:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all available templates
async function getTemplatesHandler(req, res) {
  try {
    const templates = getTemplates();
    res.status(200).json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
}

// Generate landing page with specific template
async function generateLandingPageWithTemplateHandler(req, res) {
  try {
    console.log('generateLandingPageWithTemplateHandler called with:', req.body);
    const { businessIdeaId, templateId } = req.body;
    
    if (!businessIdeaId) {
      console.log('Missing businessIdeaId');
      return res.status(400).json({ error: "businessIdeaId is required" });
    }
    
    if (!templateId) {
      console.log('Missing templateId');
      return res.status(400).json({ error: "templateId is required" });
    }
    
    const userId = req.user?._id || '67875b6e5f3d8b17b8c2e944'; // Use test user ID if no auth
    console.log('Generating landing page with template for userId:', userId);
    
    const landingPage = await generateLandingPageWithTemplate(businessIdeaId, userId, templateId);
    
    console.log('Successfully generated landing page with template');
    res.status(201).json({ landingPage });
  } catch (error) {
    console.error('Error in generateLandingPageWithTemplateHandler:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
}

// Preview template with business idea content
async function previewTemplateHandler(req, res) {
  try {
    const { businessIdeaId, templateId } = req.params;
    
    if (!businessIdeaId) {
      return res.status(400).json({ error: "businessIdeaId is required" });
    }
    
    if (!templateId) {
      return res.status(400).json({ error: "templateId is required" });
    }
    
    const preview = await previewTemplate(businessIdeaId, templateId);
    
    res.status(200).json({ preview });
  } catch (error) {
    console.error('Error generating template preview:', error);
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
  getTemplatesHandler,
  generateLandingPageWithTemplateHandler,
  previewTemplateHandler,
  deployLandingPageHandler,
  generateAndDeployLandingPageHandler,
};
