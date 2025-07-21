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
    painPoints = [],
    founderMessage = '',
    ctaText = ''
  } = idea;

  const headline = ideaName || 'Untitled Landing Page';
  const subheadline = tagline || description || '';
  const bulletPoints = keyFeatures;
  const painPointsSection = painPoints;
  const outcomeSection = bulletPoints;

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

module.exports = {
  generateLandingPage
}; 