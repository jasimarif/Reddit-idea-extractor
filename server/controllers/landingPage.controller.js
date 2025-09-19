const { 
  generateLandingPage,
  getLandingPageByBusinessIdeaId,
  getTemplates,
  generateLandingPageWithTemplate,
  previewTemplate
} = require("../services/landingPage.service");
const landingPageService = require("../services/landingPage.service");
const LandingPage = require("../models/LandingPage");
const User = require("../models/User");

async function generateLandingPageHandler(req, res) {
  try {
    const { businessIdeaId } = req.body;
    if (!businessIdeaId) {
      return res.status(400).json({ error: "businessIdeaId is required" });
    }
    const userId = req.user._id; // Get the authenticated user's ID

    // Check if user is premium
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if landing page already exists for this business idea and user
    const existingLandingPage = await LandingPage.findOne({ businessIdeaId, userId });
    if (existingLandingPage) {
      return res.status(200).json({ landingPage: existingLandingPage });
    }

    // If user is not premium, check landing page limit
    if (!user.isPremium) {
      const existingLandingPagesCount = await LandingPage.countDocuments({ userId });
      if (existingLandingPagesCount >= 2) {
        return res.status(403).json({ 
          error: "Free users can only create 2 landing pages. Upgrade to premium for unlimited access.",
          limitReached: true,
          currentCount: existingLandingPagesCount,
          limit: 2
        });
      }
    }

    // Create new landing page if it doesn't exist
    const landingPage = await generateLandingPage(businessIdeaId, userId);
    res.status(201).json({ landingPage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}async function getLandingPageByBusinessIdeaIdHandler(req, res) {
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

    // Check if landing page with this template already exists for this business idea and user
    const existingLandingPage = await LandingPage.findOne({ 
      businessIdeaId, 
      userId, 
      templateId 
    });
    if (existingLandingPage) {
      console.log('Returning existing landing page with template');
      return res.status(200).json({ landingPage: existingLandingPage });
    }

    // Check if user is premium (skip check for test user)
    if (userId !== '67875b6e5f3d8b17b8c2e944') {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If user is not premium, check landing page limit
      if (!user.isPremium) {
        const existingLandingPagesCount = await LandingPage.countDocuments({ userId });
        if (existingLandingPagesCount >= 2) {
          return res.status(403).json({ 
            error: "Free users can only create 2 landing pages. Upgrade to premium for unlimited access.",
            limitReached: true,
            currentCount: existingLandingPagesCount,
            limit: 2
          });
        }
      }
    }
    
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

    // Check if user is premium
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if landing page already exists for this business idea and user
    const existingLandingPage = await LandingPage.findOne({ businessIdeaId, userId });
    if (existingLandingPage) {
      // If it exists, deploy the existing one
      const result = await landingPageService.deployLandingPage(existingLandingPage._id, { target });
      return res.json({
        success: true,
        landingPage: existingLandingPage,
        deployment: result.deployment || result
      });
    }

    // If user is not premium, check landing page limit
    if (!user.isPremium) {
      const existingLandingPagesCount = await LandingPage.countDocuments({ userId });
      if (existingLandingPagesCount >= 2) {
        return res.status(403).json({ 
          error: "Free users can only create 2 landing pages. Upgrade to premium for unlimited access.",
          limitReached: true,
          currentCount: existingLandingPagesCount,
          limit: 2
        });
      }
    }

    // Create and deploy new landing page if it doesn't exist
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

// Get user's landing page usage and limits
async function getLandingPageUsageHandler(req, res) {
  try {
    const userId = req.user._id;
    
    // Get user to check premium status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Count existing landing pages
    const currentCount = await LandingPage.countDocuments({ userId });
    const limit = user.isPremium ? null : 2; // No limit for premium users
    const remaining = user.isPremium ? null : Math.max(0, limit - currentCount);
    const limitReached = !user.isPremium && currentCount >= limit;

    res.status(200).json({
      currentCount,
      limit,
      remaining,
      limitReached,
      isPremium: user.isPremium
    });
  } catch (error) {
    console.error('Error fetching landing page usage:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all landing pages for the authenticated user
async function getMyLandingPagesHandler(req, res) {
  try {
    const userId = req.user._id;
    
    // Fetch all landing pages for the user, populate business idea details
    const landingPages = await LandingPage.find({ userId })
      .populate('businessIdeaId', 'title description category')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      landingPages,
      count: landingPages.length
    });
  } catch (error) {
    console.error('Error fetching user landing pages:', error);
    res.status(500).json({ error: error.message });
  }
}

// Check deployment status
async function checkDeploymentStatusHandler(req, res) {
  try {
    const { landingPageId } = req.params;
    
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage) {
      return res.status(404).json({ error: 'Landing page not found' });
    }

    // If already deployed with URL, return immediately
    if (landingPage.deploymentStatus === 'deployed' && landingPage.landingPageUrl) {
      return res.json({
        status: 'deployed',
        url: landingPage.landingPageUrl,
        isLive: true
      });
    }

    // If has deployment info but not confirmed live, check if it's ready now
    if (landingPage.vercelDeploymentId && landingPage.landingPageUrl) {
      try {
        const axios = require('axios');
        const deploymentResponse = await axios.get(
          `https://api.vercel.com/v13/deployments/${landingPage.vercelDeploymentId}`,
          {
            headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
            timeout: 10000
          }
        );

        const deploymentStatus = deploymentResponse.data?.state || deploymentResponse.data?.status;
        console.log(`Checking deployment ${landingPage.vercelDeploymentId}, status: ${deploymentStatus}`);
        
        if (deploymentStatus === 'READY' || deploymentStatus === 'ready') {
          // Check if site is accessible
          try {
            const siteResponse = await axios.get(landingPage.landingPageUrl, { 
              timeout: 5000,
              validateStatus: (status) => status >= 200 && status < 400
            });
            
            if (siteResponse.status === 200) {
              // Update status to deployed
              await LandingPage.findByIdAndUpdate(landingPageId, {
                deploymentStatus: 'deployed'
              });
              
              return res.json({
                status: 'deployed',
                url: landingPage.landingPageUrl,
                isLive: true
              });
            }
          } catch (siteError) {
            console.log(`Site not accessible yet: ${siteError.message}`);
          }
        } else if (deploymentStatus === 'ERROR' || deploymentStatus === 'CANCELED') {
          return res.json({
            status: 'failed',
            url: landingPage.landingPageUrl,
            isLive: false,
            vercelStatus: deploymentStatus
          });
        }

        return res.json({
          status: 'building',
          url: landingPage.landingPageUrl,
          isLive: false,
          vercelStatus: deploymentStatus || 'unknown'
        });
      } catch (error) {
        console.error('Error checking deployment:', error);
        return res.json({
          status: 'building',
          url: landingPage.landingPageUrl,
          isLive: false,
          error: error.message
        });
      }
    }

    return res.json({
      status: landingPage.deploymentStatus || 'not-deployed',
      url: landingPage.landingPageUrl,
      isLive: false
    });
  } catch (error) {
    console.error('Error checking deployment status:', error);
    res.status(500).json({ error: error.message });
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
  getLandingPageUsageHandler,
  getMyLandingPagesHandler,
  checkDeploymentStatusHandler,
};
