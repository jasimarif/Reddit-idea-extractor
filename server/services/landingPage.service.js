const LandingPage = require('../models/LandingPage');
const BusinessIdea = require('../models/BusinessIdea');
const { generateLovablePromptBAB } = require('./langchain.service');

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
    founderMessage = '',
    ctaText = ''
  } = idea;

  const headline = ideaName || 'Untitled Landing Page';
  const subheadline = tagline || description || '';
  const bulletPoints = keyFeatures;
  const painPointsSection = problemStatement;
  const outcomeSection = solutionOverview;

  const lovablePrompt = await generateLovablePromptBAB({
    title: headline,
    description: subheadline,
    painPoints: painPointsSection,
    outcomes: outcomeSection,
    founderMessage,
    ctaText
  });

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

module.exports = {
  generateLandingPage,
  getLandingPageByBusinessIdeaId,
};