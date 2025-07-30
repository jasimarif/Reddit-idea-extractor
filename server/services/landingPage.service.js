const LandingPage = require('../models/LandingPage');
const BusinessIdea = require('../models/BusinessIdea');
const { generateLovablePromptBAB } = require('./langchain.service');
const landingPageDeployer = require('./landingPageDeploy.service');


async function generateLandingPage(businessIdeaId) {
  // Fetch business idea and customer insights
  const idea = await BusinessIdea.findById(businessIdeaId);
  if (!idea) throw new Error('Business idea not found');

  const {
    ideaName,
    tagline,
    description,
    keyFeatures = [],
    problemStatement = [],
    solutionOverview,
    implementationSteps,
    potentialChallenges,
    differentiators,
    successMetrics,
    targetAudience,
    useCase,
  } = idea;

  const headline = ideaName || 'Untitled Landing Page';
  const subheadline = description || '';
  const bulletPoints = keyFeatures;
  const painPointsSection = problemStatement;
  const outcomeSection = useCase;

  // Generate the lovable prompt and get AI-generated values
  const { prompt: lovablePrompt, generatedValues } = await generateLovablePromptBAB({
    title: headline,
    description: subheadline,
    painPoints: painPointsSection,
    outcomes: outcomeSection,
    founderMessage: '', // Let the AI generate this
    ctaText: '' // Let the AI generate this
  });
  
  // Use AI-generated values or fallback to defaults
  const founderMessage = generatedValues.founderMessage || 
    `Hi, I'm the founder behind ${ideaName}. I created this solution because I understand the challenges of ${problemStatement[0] || 'this problem'} and wanted to build something that truly helps people like you.`;
  
  const ctaText = generatedValues.ctaText || `Get Started with ${ideaName} Today`;

  const landingPage = new LandingPage({
    businessIdeaId,
    headline,
    subheadline,
    bulletPoints,
    painPointsSection,
    outcomeSection,
    founderMessage,
    ctaText,
    lovablePrompt,
    status: 'generated',
    isPublic: false
  });
  await landingPage.save();
  return landingPage;
}


async function deployLandingPage(landingPageId, options = {}) {
  try {
    const { target = 'vercel' } = options;
    
    // Get the landing page
    const landingPage = await LandingPage.findById(landingPageId);
    if (!landingPage) {
      throw new Error('Landing page not found');
    }

    // Deploy based on target
    let deploymentResult;
    if (target === 'vercel') {
      const repoName = `landing-${landingPage.businessIdeaId}`.toLowerCase();
      deploymentResult = await landingPageDeployer.deployToVercel(landingPageId, repoName);
    } else if (target === 'netlify') {
      deploymentResult = await landingPageDeployer.deployToNetlify(landingPageId);
    } else {
      throw new Error(`Unsupported deployment target: ${target}`);
    }

    // Update landing page with deployment details
    // Get the URL from the most likely locations in the deployment result
    landingPage.landingPageUrl = deploymentResult.url || 
      (deploymentResult.deployment && deploymentResult.deployment.url) ||
      (deploymentResult.landingPage && deploymentResult.landingPage.landingPageUrl);
    
    landingPage.deploymentTarget = target;
    landingPage.deploymentStatus = 'deployed';
    landingPage.lastDeployedAt = new Date();
    
    await landingPage.save();

    return {
      success: true,
      landingPage,
      deployment: deploymentResult
    };
  } catch (error) {
    console.error('Deployment error:', error);
    
    // Update landing page with error status
    await LandingPage.findByIdAndUpdate(landingPageId, {
      deploymentStatus: 'failed',
      lastError: error.message
    });

    throw new Error(`Failed to deploy landing page: ${error.message}`);
  }
}

async function getLandingPageByBusinessIdeaId(businessIdeaId) {
  try {
    return await LandingPage.findOne({ businessIdeaId })
      .select('-__v')
      .lean()
      .exec();
  } catch (error) {
    console.error('Error fetching landing page:', error);
    throw new Error('Failed to fetch landing page');
  }
}

// Generate and deploy in one step
async function generateAndDeployLandingPage(businessIdeaId, options = {}) {
  // First generate the landing page
  const landingPage = await generateLandingPage(businessIdeaId);
  
  // Then deploy it
  const result = await deployLandingPage(landingPage._id, options);
  
  return result;
}

module.exports = {
  generateLandingPage,
  getLandingPageByBusinessIdeaId,
  deployLandingPage,
  generateAndDeployLandingPage
};