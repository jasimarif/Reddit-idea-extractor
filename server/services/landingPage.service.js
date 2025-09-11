const LandingPage = require('../models/LandingPage');
const BusinessIdea = require('../models/BusinessIdea');
const { generateLovablePromptBAB } = require('./langchain.service');
const landingPageDeployer = require('./landingPageDeploy.service');
const landingPageTemplates = require('../templates/landingPageTemplates');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get all available templates
const getTemplates = () => {
  return Object.values(landingPageTemplates).map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    preview: template.preview,
    html: template.html // Include HTML for preview
  }));
};

// Generate content for template placeholders using GPT
const generateTemplateContent = async (businessIdea, templateId) => {
  try {
    console.log('Generating template content for template:', templateId);
    console.log('Business idea data:', {
      ideaName: businessIdea.ideaName,
      description: businessIdea.description,
      problemStatement: businessIdea.problemStatement,
      solutionOverview: businessIdea.solutionOverview,
      targetAudience: businessIdea.targetAudience,
      keyFeatures: businessIdea.keyFeatures,
      uniqueValueProposition: businessIdea.uniqueValueProposition,
      differentiators: businessIdea.differentiators,
      marketCategory: businessIdea.marketCategory,
      businessModel: businessIdea.businessModel,
      useCase: businessIdea.useCase
    });

    const template = landingPageTemplates[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const prompt = `
    You are creating a compelling landing page for this specific business idea. Use ALL the provided information to generate highly targeted, conversion-focused content.

    BUSINESS IDEA DETAILS:
    - Product/Service Name: ${businessIdea.ideaName || 'Product Name'}
    - Description: ${businessIdea.description || 'Product description'}
    - Problem Statement: ${businessIdea.problemStatement || 'Business challenges'}
    - Solution Overview: ${businessIdea.solutionOverview || 'How the product solves problems'}
    - Target Audience: ${businessIdea.targetAudience || 'Target customers'}
    - Key Features: ${Array.isArray(businessIdea.keyFeatures) ? businessIdea.keyFeatures.join(', ') : businessIdea.keyFeatures || 'Core features'}
    - Unique Value Proposition: ${Array.isArray(businessIdea.uniqueValueProposition) ? businessIdea.uniqueValueProposition.join(', ') : businessIdea.uniqueValueProposition || 'What makes this unique'}
    - Differentiators: ${businessIdea.differentiators || businessIdea.differentiator || 'What sets this apart'}
    - Market Category: ${businessIdea.marketCategory || 'Industry category'}
    - Business Model: ${businessIdea.businessModel || 'How it makes money'}
    - Use Cases: ${businessIdea.useCase || 'How customers will use it'}

    Generate content for these placeholders (return as JSON). Make sure the content is SPECIFIC to this business idea and uses the actual data provided above:

    {
      "TITLE": "${businessIdea.ideaName || 'Product Name'}",
      "TAGLINE": "Create a compelling tagline that highlights the main benefit for ${businessIdea.targetAudience || 'target customers'}",
      "HEADLINE": "Create a powerful headline based on the solution overview: ${businessIdea.solutionOverview || 'solution description'}",
      "SUBHEADLINE": "Expand on the description: ${businessIdea.description || 'product description'} to create an engaging subheadline",
      "CTA_TEXT": "Create a specific call-to-action based on the business model: ${businessIdea.businessModel || 'business model'}",
      "KEY_FEATURES": ${Array.isArray(businessIdea.keyFeatures) ? JSON.stringify(businessIdea.keyFeatures) : JSON.stringify(["Feature 1", "Feature 2", "Feature 3"])},
      "FEATURE_DESCRIPTIONS": ${Array.isArray(businessIdea.keyFeatures) ? JSON.stringify(businessIdea.keyFeatures.map(feature => `How ${feature} helps ${businessIdea.targetAudience || 'customers'}`)) : JSON.stringify(["Description for feature 1", "Description for feature 2", "Description for feature 3"])},
      "PAIN_POINTS": ${businessIdea.problemStatement ? (Array.isArray(businessIdea.problemStatement) ? JSON.stringify(businessIdea.problemStatement.split(/[,.]/).map(p => p.trim()).filter(p => p.length > 0)) : JSON.stringify([businessIdea.problemStatement])) : JSON.stringify(["Pain point 1", "Pain point 2", "Pain point 3"])},
      "OUTCOMES": ${businessIdea.useCase ? (Array.isArray(businessIdea.useCase) ? JSON.stringify(businessIdea.useCase.split(/[,.]/).map(u => u.trim()).filter(u => u.length > 0)) : JSON.stringify([businessIdea.useCase])) : JSON.stringify(["Positive outcome 1", "Positive outcome 2", "Positive outcome 3"])},
      "FOUNDER_MESSAGE": "Write a personal message from the founder about creating this solution for ${businessIdea.targetAudience || 'customers'} to solve ${businessIdea.problemStatement || 'business challenges'}"
    }

    IMPORTANT: Use the actual business idea data provided above. Do NOT make up generic content. Make the content highly specific and tailored to this exact business idea.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional copywriter specializing in landing page content. Generate compelling, conversion-focused content that is SPECIFICALLY tailored to the business idea provided. Use ALL the data given to create highly targeted content. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = JSON.parse(completion.choices[0].message.content);
    console.log('Generated template content successfully:', content);

    return content;
  } catch (error) {
    console.error('Error generating template content:', error);
    throw error;
  }
};

// Populate template with generated content
const populateTemplate = (templateHtml, content) => {
  let populatedHtml = templateHtml;
  
  // Replace simple placeholders
  Object.keys(content).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = content[key];
    
    if (Array.isArray(value)) {
      // For arrays, we'll use a simple replacement for now
      populatedHtml = populatedHtml.replace(new RegExp(`{{${key}}}`, 'g'), value.join(', '));
    } else {
      populatedHtml = populatedHtml.replace(new RegExp(placeholder, 'g'), value || '');
    }
  });
  
  // Handle Handlebars-style loops (simplified for this implementation)
  // Replace {{#each KEY_FEATURES}} blocks with actual content
  const featureRegex = /{{#each KEY_FEATURES}}(.*?){{\/each}}/gs;
  populatedHtml = populatedHtml.replace(featureRegex, (match, template) => {
    return content.KEY_FEATURES.map((feature, index) => {
      let featureHtml = template;
      featureHtml = featureHtml.replace(/{{this}}/g, feature);
      featureHtml = featureHtml.replace(/{{\.\.\/FEATURE_DESCRIPTIONS\.\[{{@index}}\]}}/g, content.FEATURE_DESCRIPTIONS[index] || '');
      return featureHtml;
    }).join('');
  });
  
  // Handle other each blocks
  const painPointRegex = /{{#each PAIN_POINTS}}(.*?){{\/each}}/gs;
  populatedHtml = populatedHtml.replace(painPointRegex, (match, template) => {
    return content.PAIN_POINTS.map(point => {
      return template.replace(/{{this}}/g, point);
    }).join('');
  });
  
  const outcomesRegex = /{{#each OUTCOMES}}(.*?){{\/each}}/gs;
  populatedHtml = populatedHtml.replace(outcomesRegex, (match, template) => {
    return content.OUTCOMES.map(outcome => {
      return template.replace(/{{this}}/g, outcome);
    }).join('');
  });
  
  return populatedHtml;
};

// Generate landing page with template
const generateLandingPageWithTemplate = async (businessIdeaId, userId, templateId) => {
  try {
    console.log(`Starting generateLandingPageWithTemplate - businessIdeaId: ${businessIdeaId}, userId: ${userId}, templateId: ${templateId}`);
    
    // Fetch business idea from database
    const idea = await BusinessIdea.findById(businessIdeaId);
    if (!idea) {
      console.log(`Business idea not found for ID: ${businessIdeaId}`);
      throw new Error('Business idea not found');
    }
    console.log(`Found business idea: ${idea.ideaName || idea.description}`);

    // Generate content for the template
    console.log('Generating template content...');
    const templateContent = await generateTemplateContent(idea, templateId);
    console.log('Template content generated successfully');
    
    // Get the template
    const template = landingPageTemplates[templateId];
    if (!template) {
      console.log(`Template not found: ${templateId}`);
      throw new Error(`Template ${templateId} not found`);
    }
    console.log(`Using template: ${template.name}`);

    // Populate the template with generated content
    console.log('Populating template with content...');
    const populatedHtml = populateTemplate(template.html, templateContent);
    console.log('Template populated successfully');

    // Create landing page document
    console.log('Creating landing page document...');
    const landingPage = new LandingPage({
      userId,
      businessIdeaId,
      templateId,
      templateContent,
      generatedHtml: populatedHtml,
      headline: templateContent.HEADLINE,
      subheadline: templateContent.SUBHEADLINE,
      bulletPoints: templateContent.KEY_FEATURES,
      painPointsSection: templateContent.PAIN_POINTS,
      outcomeSection: templateContent.OUTCOMES,
      founderMessage: templateContent.FOUNDER_MESSAGE,
      ctaText: templateContent.CTA_TEXT,
      status: 'generated',
      isPublic: false
    });
    
    await landingPage.save();
    console.log(`Successfully created landing page with template ${templateId}, ID: ${landingPage._id}`);
    
    return landingPage;
  } catch (error) {
    console.error('Error in generateLandingPageWithTemplate:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

// Preview template with business idea content
const previewTemplate = async (businessIdeaId, templateId) => {
  try {
    console.log(`Generating preview for template ${templateId} with business idea ${businessIdeaId}`);

    // Fetch business idea
    const idea = await BusinessIdea.findById(businessIdeaId);
    if (!idea) {
      throw new Error('Business idea not found');
    }

    // Generate content for the template
    const templateContent = await generateTemplateContent(idea, templateId);

    // Get the template
    const template = landingPageTemplates[templateId];
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Populate the template with generated content
    const populatedHtml = populateTemplate(template.html, templateContent);

    return {
      templateId,
      templateName: template.name,
      content: templateContent,
      html: populatedHtml
    };
  } catch (error) {
    console.error('Error generating template preview:', error);
    throw error;
  }
};
async function generateLandingPage(businessIdeaId, userId) {
  try {
    console.log(`Starting landing page generation for businessIdeaId: ${businessIdeaId}, userId: ${userId}`);
    
    // Fetch business idea and customer insights
    const idea = await BusinessIdea.findById(businessIdeaId);
    if (!idea) {
      console.error(`Business idea not found for ID: ${businessIdeaId}`);
      throw new Error('Business idea not found');
    }

    console.log(`Found business idea: ${idea.ideaName}`);

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

    console.log('Calling generateLovablePromptBAB...');
    
    // Generate the lovable prompt and get AI-generated values
    const { prompt: lovablePrompt, generatedValues } = await generateLovablePromptBAB({
      title: headline,
      description: subheadline,
      painPoints: painPointsSection,
      outcomes: outcomeSection,
      founderMessage: '', // Let the AI generate this
      ctaText: '' // Let the AI generate this
    });
    
    console.log('Successfully generated lovable prompt');
    
    // Use AI-generated values or fallback to defaults
    const founderMessage = generatedValues.founderMessage || 
      `Hi, I'm the founder behind ${ideaName}. I created this solution because I understand the challenges of ${problemStatement[0] || 'this problem'} and wanted to build something that truly helps people like you.`;
    
    const ctaText = generatedValues.ctaText || `Get Started with ${ideaName} Today`;

    console.log('Creating landing page document...');
    
    const landingPage = new LandingPage({
      userId,
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
    console.log(`Successfully created landing page with ID: ${landingPage._id}`);
    
    return landingPage;
  } catch (error) {
    console.error('Error in generateLandingPage:', error);
    throw error;
  }
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

async function getLandingPageByBusinessIdeaId(businessIdeaId, userId) {
  try {
    const landingPage = await LandingPage.findOne({ 
      businessIdeaId,
      userId 
    })
      .select('-__v')
      .lean()
      .exec();
    
    // Return null if no landing page exists (this is not an error condition)
    return landingPage;
  } catch (error) {
    console.error('Error fetching landing page:', error);
    throw new Error('Failed to fetch landing page');
  }
}

// Generate and deploy in one step
async function generateAndDeployLandingPage(businessIdeaId, userId, options = {}) {
  // First generate the landing page
  const landingPage = await generateLandingPage(businessIdeaId, userId);
  
  // Then deploy it
  const result = await deployLandingPage(landingPage._id, options);
  
  return result;
}

module.exports = {
  generateLandingPage,
  getLandingPageByBusinessIdeaId,
  deployLandingPage,
  generateAndDeployLandingPage,
  getTemplates,
  generateLandingPageWithTemplate,
  previewTemplate,
  generateTemplateContent,
  populateTemplate
};