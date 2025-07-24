// LangChain integration using initialized assistants
const { ChatOpenAI } = require('@langchain/openai');
const { ConversationChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');
const { RunnableSequence } = require('@langchain/core/runnables');
const { PromptTemplate } = require('@langchain/core/prompts');
const { 
  getOrCreatePainPointAssistant, 
  getOrCreateMarketGapAssistant,
  getOrCreateLandingPageAssistant,
  ensureInitialized
} = require('./assistant.service');

// Cache for initialized assistants
const agentCache = new Map();

// Helper function to create and cache an agent
const getOrCreateAgent = async (type, getAssistantFn) => {
  const cacheKey = `${type}AssistantId`;
  
  // Return cached agent if available
  if (agentCache.has(cacheKey)) {
    return agentCache.get(cacheKey);
  }
  
  // Ensure assistant exists and get its details
  await ensureInitialized();
  const assistant = await getAssistantFn();
  
  // Create new ChatOpenAI instance with assistant's configuration
  const openai = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: assistant.model,
    configuration: {
      baseURL: 'https://api.openai.com/v1',
    },
    temperature: type === 'marketGap' ? 0.7 : 0.3, // Different temperature based on agent type
    maxTokens: 3000,
  });

  // Create and cache the agent
  const memory = new BufferMemory();
  const agent = new ConversationChain({ 
    llm: openai, 
    memory,
    // Add any assistant-specific configuration here
  });
  
  agentCache.set(cacheKey, agent);
  return agent;
}; 

// --- PainPoint Agent ---
async function getPainPointAgent() {
  return getOrCreateAgent('painPoint', getOrCreatePainPointAssistant);
}

// --- MarketGap Agent ---
async function getMarketGapAgent() {
  return getOrCreateAgent('marketGap', getOrCreateMarketGapAssistant);
}

async function generateLovablePromptBAB({ 
  title, 
  description, 
  painPoints = [], 
  outcomes = [], 
  founderMessage = '', 
  ctaText = '',
  targetAudience = '', 
  industry = '', 
  uniqueValue = '' 
}) {
  // Get or create the landing page agent
  const agent = await getOrCreateAgent('landingPage', getOrCreateLandingPageAssistant);
  
  // Use the agent's LLM for the completion
  const openai = agent.llm;

  // Helper functions for intelligent analysis
  function generateSmartCTA(title, description, industry) {
    const ctaMap = {
      'saas': 'Start Your Free Trial',
      'service': 'Get Your Free Consultation', 
      'product': 'Order Now - Free Shipping',
      'course': 'Enroll Today - Limited Spots',
      'consulting': 'Book Your Strategy Call',
      'app': 'Download Free - Get Started',
      'marketplace': 'Join the Platform',
      'tool': 'Try It Free - No Credit Card',
      'default': 'Get Started Free Today'
    };
    
    const detectedType = detectBusinessType(description);
    return ctaMap[detectedType] || ctaMap.default;
  }

  function detectBusinessType(description) {
    const keywords = {
      saas: ['software', 'platform', 'dashboard', 'tool', 'system', 'cloud'],
      service: ['service', 'consulting', 'agency', 'done-for-you', 'management'],
      product: ['product', 'physical', 'item', 'buy', 'purchase', 'sell'],
      course: ['course', 'training', 'learn', 'education', 'teach', 'program'],
      app: ['mobile', 'app', 'download', 'smartphone', 'ios', 'android'],
      marketplace: ['marketplace', 'connect', 'network', 'community', 'collaborative'],
      tool: ['generator', 'creator', 'builder', 'analyzer', 'optimizer']
    };

    const lowerDesc = description.toLowerCase();
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowerDesc.includes(word))) {
        return type;
      }
    }
    return 'default';
  }

  function getIndustryColor(industry, businessType) {
    const colorMap = {
      'tech': { primary: '#2563eb', cta: '#f59e0b', accent: '#10b981' },
      'health': { primary: '#059669', cta: '#dc2626', accent: '#3b82f6' },
      'finance': { primary: '#1e40af', cta: '#f59e0b', accent: '#059669' },
      'education': { primary: '#7c3aed', cta: '#f59e0b', accent: '#06b6d4' },
      'marketing': { primary: '#dc2626', cta: '#f59e0b', accent: '#8b5cf6' },
      'saas': { primary: '#2563eb', cta: '#10b981', accent: '#f59e0b' },
      'default': { primary: '#2563eb', cta: '#f59e0b', accent: '#10b981' }
    };

    return colorMap[industry] || colorMap[businessType] || colorMap.default;
  }

  // Enhanced pre-processing
  // Ensure painPoints is always an array
  const processedPainPoints = Array.isArray(painPoints) 
    ? painPoints 
    : (typeof painPoints === 'string' ? [painPoints] : []);

    const processedOutcome = Array.isArray(outcomes) 
    ? outcomes 
    : (typeof outcomes === 'string' ? [outcomes] : []);

  const businessType = detectBusinessType(description);
  const detectedIndustry = industry || businessType;
  const intelligentCTA = ctaText || generateSmartCTA(title, description, detectedIndustry);
  const colors = getIndustryColor(detectedIndustry, businessType);

  // Main prompt template that generates the FINAL Lovable.dev prompt
  const template = `You are an expert landing page copywriter and Lovable.dev prompt specialist. Your task is to generate a COMPLETE, READY-TO-COPY-PASTE Lovable.dev prompt for creating a high-converting landing page.

BUSINESS ANALYSIS:
- Title: "${title}"
- Description: "${description}"
- Target Audience: "${targetAudience || 'Extract from description'}"
- Business Type: "${businessType}"
- Industry: "${detectedIndustry}"
- Pain Points: ${processedPainPoints.length > 0 ? processedPainPoints.join(', ') : 'Extract from context'}
- Desired Outcomes: ${processedOutcome.length > 0 ? processedOutcome.join(', ') : 'Generate based on solution'}
- Unique Value: "${uniqueValue || 'Determine from description'}"

CRITICAL INSTRUCTIONS:
1. Generate a COMPLETE Lovable.dev prompt (not a template)
2. Include specific headlines, copy, and design specifications
3. Use the Before-After-Bridge framework
4. Make it copy-paste ready for immediate use
5. No placeholders - write actual copy

OUTPUT FORMAT: Generate the complete Lovable.dev prompt following this exact structure:

---

Create a modern, high-converting landing page for "${title}" using React and Tailwind CSS.

**DESIGN REQUIREMENTS:**
- Mobile-first responsive design with smooth micro-animations
- Modern UI with glassmorphism effects and subtle gradients
- Color scheme: Primary ${colors.primary}, CTA ${colors.cta}, Accent ${colors.accent}
- Clean typography using Inter font family
- Conversion-optimized layout with clear visual hierarchy
- Fast-loading animations and hover effects

**PAGE STRUCTURE:**

🎯 **HERO SECTION:**
[Generate compelling headline based on the business idea]
[Write benefit-focused subheadline]
[Create 3-4 specific benefit bullets with icons]
[Include primary CTA: "${intelligentCTA}"]
[Add hero visual description]

😰 **PAIN POINTS SECTION:**
[Write empathetic section title]
[Create 3 specific pain point descriptions]
[Add belief deconstruction paragraph]

✨ **TRANSFORMATION SECTION:**
[Write aspirational section title]
[Create 3 outcome transformation blocks]
[Add new paradigm introduction]

🚀 **SOLUTION SECTION:**
[Product introduction with tagline]
[3-step process explanation]
[Founder message: "${founderMessage || 'Generate authentic founder story'}"]
[Social proof elements]

💰 **FINAL CTA SECTION:**
[Primary CTA with urgency]
[Risk reversal guarantee]
[Trust signals]

**TECHNICAL SPECIFICATIONS:**
- Single-page React component
- Email capture form integration
- Smooth scroll navigation
- Mobile-responsive buttons and forms
- Loading states and error handling
- SEO meta tags
- Accessibility features (ARIA labels, keyboard navigation)
- Contact form in footer
- Cookie consent banner

**FUNCTIONALITY:**
- Form validation for email capture
- Smooth scrolling between sections
- Animated counters for statistics
- Image lazy loading
- Progressive web app features
- Social sharing buttons

Build this as a production-ready, fully functional landing page with all content, styling, and interactions included.

---

IMPORTANT: 
- Write ACTUAL copy, not placeholders
- Include specific design details
- Make technical specifications clear
- Ensure the prompt is immediately usable
- Focus on conversion optimization
- Use emotional, benefit-driven language`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: ['title', 'description', 'painPoints', 'outcomes', 'founderMessage', 'ctaText', 'targetAudience', 'industry', 'uniqueValue'],
  });

  const chain = RunnableSequence.from([prompt, openai]);
  
  // Prepare the input for the chain
  const chainInput = {
    title,
    description,
    painPoints: processedPainPoints.length > 0 ? processedPainPoints.join(', ') : 'Extract from context',
    outcomes: processedOutcome.length > 0 ? processedOutcome.join(', ') : 'Generate based on solution',
    founderMessage: founderMessage || 'Generate authentic founder story',
    ctaText: intelligentCTA,
    targetAudience: targetAudience || 'Extract from description',
    industry: detectedIndustry,
    uniqueValue: uniqueValue || 'Determine from description'
  };

  // Log the input for debugging
  console.log('Chain input:', JSON.stringify(chainInput, null, 2));
  
  const response = await chain.invoke(chainInput);
  
  // Clean up the response to ensure it's a proper prompt
  let lovablePrompt = response.content;
  
  // Remove any meta-commentary and ensure clean format
  if (lovablePrompt.includes('```')) {
    const matches = lovablePrompt.match(/```[\s\S]*?```/);
    if (matches) {
      lovablePrompt = matches[0].replace(/```/g, '').trim();
    }
  }
  
  // Ensure the prompt starts correctly
  if (!lovablePrompt.startsWith('Create a modern')) {
    lovablePrompt = `Create a modern, high-converting landing page for "${title}" using React and Tailwind CSS.\n\n` + lovablePrompt;
  }
  
  return lovablePrompt;
}

// Enhanced function to parse the response and extract structured data for MongoDB
function parseLovablePromptResponse(lovablePrompt, originalData) {
  // Extract headline from the prompt
  const headlineMatch = lovablePrompt.match(/headline[:\s]*["']([^"']+)["']/i);
  const headline = headlineMatch ? headlineMatch[1] : originalData.title;
  
  // Extract subheadline
  const subheadlineMatch = lovablePrompt.match(/subheadline[:\s]*["']([^"']+)["']/i);
  const subheadline = subheadlineMatch ? subheadlineMatch[1] : originalData.description;
  
  // Extract bullet points
  const bulletMatches = lovablePrompt.match(/bullet[s]?[:\s]*[\n\r]*((?:[\s]*[•\-\*][\s]*[^\n\r]+[\n\r]*){2,})/i);
  const bulletPoints = bulletMatches 
    ? bulletMatches[1].split(/[\n\r]+/).map(b => b.replace(/^[\s]*[•\-\*][\s]*/, '').trim()).filter(Boolean)
    : originalData.outcomes || ['Enhanced productivity', 'Better results', 'Time savings'];
  
  // Extract pain points
  const painMatches = lovablePrompt.match(/pain[s]?[:\s]*[\n\r]*((?:[\s]*[•\-\*][\s]*[^\n\r]+[\n\r]*){2,})/i);
  const painPointsSection = painMatches 
    ? painMatches[1].split(/[\n\r]+/).map(p => p.replace(/^[\s]*[•\-\*][\s]*/, '').trim()).filter(Boolean)
    : originalData.painPoints || ['Current struggles with existing solutions'];
  
  // Extract outcomes
  const outcomeMatches = lovablePrompt.match(/outcome[s]?[:\s]*[\n\r]*((?:[\s]*[•\-\*][\s]*[^\n\r]+[\n\r]*){2,})/i);
  const outcomeSection = outcomeMatches 
    ? outcomeMatches[1].split(/[\n\r]+/).map(o => o.replace(/^[\s]*[•\-\*][\s]*/, '').trim()).filter(Boolean)
    : bulletPoints;
  
  // Extract founder message
  const founderMatch = lovablePrompt.match(/founder[s]?\s+message[:\s]*["']([^"']+)["']/i);
  const founderMessage = founderMatch ? founderMatch[1] : originalData.founderMessage || '';
  
  // Extract CTA text
  const ctaMatch = lovablePrompt.match(/(?:primary\s+)?cta[:\s]*["']([^"']+)["']/i);
  const ctaText = ctaMatch ? ctaMatch[1] : originalData.ctaText || 'Get Started Free';
  
  return {
    headline,
    subheadline,
    bulletPoints: bulletPoints.slice(0, 5), // Limit to 5 bullets
    painPointsSection: painPointsSection.slice(0, 3), // Limit to 3 pain points
    outcomeSection: outcomeSection.slice(0, 3), // Limit to 3 outcomes
    founderMessage,
    ctaText
  };
}

module.exports = {
  getPainPointAgent,
  getMarketGapAgent,
  parseLovablePromptResponse,
  generateLovablePromptBAB  
}; 