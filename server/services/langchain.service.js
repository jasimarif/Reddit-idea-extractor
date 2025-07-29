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
  getOrCreatePageCraftAssistant,
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

// --- PageCraft Agent ---
async function getPageCraftAgent() {
  return getOrCreateAgent('pageCraft', getOrCreatePageCraftAssistant);
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
  uniqueValue = '',
  implementationSteps = [],
  potentialChallenges = [],
  differentiators = [],
  successMetrics = [],
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
- Pain Points: ${processedPainPoints.length > 0 ? processedPainPoints.join('\n  • ') : 'Extract from context'}
- Desired Outcomes: ${processedOutcome.length > 0 ? processedOutcome.join('\n  • ') : 'Generate based on solution'}
- Unique Value: "${uniqueValue || 'Determine from description'}"
- Implementation Steps: ${implementationSteps.length > 0 ? implementationSteps.join('\n  • ') : 'Extract from context'}
- Potential Challenges: ${potentialChallenges.length > 0 ? potentialChallenges.join('\n  • ') : 'Extract from context'}
- Differentiators: ${differentiators.length > 0 ? differentiators.join('\n  • ') : 'Extract from context'}
- Success Metrics: ${successMetrics.length > 0 ? successMetrics.join('\n  • ') : 'Extract from context'}

CRITICAL INSTRUCTIONS:
1. Generate a COMPLETE, production-ready Lovable.dev prompt (not a template)
2. Use customer's exact language - match how they describe their problems
3. Include specific, conversion-focused headlines and copy
4. Use the Before-After-Bridge framework to show transformation
5. Make it copy-paste ready for immediate use in Lovable.dev
6. No placeholders - write actual, specific copy with emotional triggers
7. Focus on benefits over features - answer "What's in it for me?"
8. Include specific metrics and social proof throughout
9. Make differentiators crystal clear and compelling

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
- Include visual elements like icons, illustrations, and data visualizations
- Ensure proper spacing and visual breathing room
- Use social proof elements strategically

**PAGE STRUCTURE:**

🎯 **HERO SECTION:**
- Headline: Write a clear, benefit-driven headline that addresses the main pain point
- Subheadline: Expand on the transformation in 1-2 sentences
- Benefit Bullets (3-4):
  • Start with emoji + specific, quantifiable benefit
  • Focus on outcomes, not features
  • Use customer language from pain points
- Primary CTA: "${intelligentCTA}" (include emotional outcome, e.g., "Start Free Trial – Take Control of Your Cash Flow")
- Secondary CTA: "Watch Demo" or "See How It Works"
- Hero Visual: Show product/solution in context (dashboard, app screen, etc.)
- "Who It's For" Line: "Built for [specific audience] who want to [main benefit]" (be specific)

**TECHNICAL SPECIFICATIONS:**
- Single-page React component with Tailwind CSS
- Mobile-first responsive design (test on all devices)
- Email capture with validation + error handling
- Smooth scroll navigation between sections
- Loading states and skeleton loaders
- SEO meta tags (title < 60 chars, meta description 150-160 chars)
- OpenGraph tags for social sharing (og:title, og:description, og:image)
- Accessibility: ARIA labels, keyboard navigation, color contrast
- Contact form in footer (name, email, message)
- Cookie consent banner (GDPR compliant)
- Structured data (JSON-LD) for better SEO

**FUNCTIONALITY:**
- Form validation with clear error messages and success states
- Smooth scrolling with anchor links and active state highlighting
- Animated counters for statistics (e.g., "1,200+ Startups Helped")
- Image lazy loading with optimized placeholders (blur-up technique)
- PWA features: Offline access, add to home screen
- Social sharing with pre-filled messages (Twitter, LinkedIn, Facebook)
- Interactive elements where relevant (calculators, quizzes, configurators)
- Exit-intent popup with special offer (20% off, free guide, etc.)
- Live chat widget (e.g., Crisp, Intercom) for support
- Trust signals: Security badges, payment methods, media mentions
- FAQ accordion section for common objections

Build this as a production-ready, fully functional landing page with all content, styling, and interactions included.

---

CRUCIAL INSTRUCTIONS:
1. COPYWRITING:
   - Use customer's exact words from pain points
   - Focus on benefits, not just features
   - Include specific numbers and metrics (e.g., "Save 5 hours/week")
   - Address objections preemptively
   - Use power words that trigger emotions

2. DESIGN & LAYOUT:
   - Mobile-first, responsive design
   - Clear visual hierarchy (F-pattern layout)
   - Consistent spacing and alignment
   - High-quality, relevant images
   - White space for readability

3. CONVERSION ELEMENTS:
   - Multiple, clear CTAs above the fold
   - Social proof (testimonials, logos, numbers)
   - Risk reversal (free trial, money-back guarantee)
   - Urgency and scarcity where appropriate
   - Clear next steps

4. TECHNICAL REQUIREMENTS:
   - Fast loading (<3s)
   - SEO-optimized
   - Accessible (WCAG 2.1 AA)
   - Cross-browser compatible
   - Secure (HTTPS, form validation)

5. TRUST SIGNALS:
   - Customer testimonials with photos
   - Trust badges and security seals
   - Media mentions and press logos
   - Clear contact information
   - Money-back guarantee

6. METRICS TO INCLUDE:
   - Number of users/customers
   - Success rate or improvement percentage
   - Time saved/cost reduced
   - Industry benchmarks (if available)

7. DIFFERENTIATORS:
   - Clearly state what makes this unique
   - Compare with alternatives
   - Focus on outcomes, not just features
   - Use specific examples`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: [
      'title', 
      'description', 
      'painPoints', 
      'outcomes', 
      'founderMessage', 
      'ctaText', 
      'targetAudience', 
      'industry', 
      'uniqueValue',
      'intelligentCTA',
      'colors',
      'businessType',
      'detectedIndustry'
    ],
  });

  const chain = RunnableSequence.from([prompt, openai]);
  
  // Prepare the input for the chain
  const chainInput = {
    title,
    description,
    painPoints: processedPainPoints.length > 0 ? processedPainPoints.join('\n  • ') : 'Extract from context',
    outcomes: processedOutcome.length > 0 ? processedOutcome.join('\n  • ') : 'Generate based on solution',
    founderMessage: founderMessage || 'Generate authentic founder story',
    ctaText: intelligentCTA,
    targetAudience: targetAudience || 'Extract from description',
    industry: detectedIndustry,
    uniqueValue: uniqueValue || 'Determine from description',
    intelligentCTA,
    colors,
    businessType,
    detectedIndustry
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
  
  // Extract the founder message from the generated content
  let extractedFounderMessage = '';
  const founderMessageMatch = lovablePrompt.match(/Founder Message: "([^"]+)"/i) || 
                            lovablePrompt.match(/Founder Message: ([^\n]+)/i);
  
  if (founderMessageMatch && founderMessageMatch[1]) {
    extractedFounderMessage = founderMessageMatch[1].trim();
  }
  
  // Extract the CTA text from the generated content
  let extractedCtaText = '';
  const ctaMatch = lovablePrompt.match(/Primary CTA: "([^"]+)"/i) || 
                  lovablePrompt.match(/CTA: "([^"]+)"/i) ||
                  lovablePrompt.match(/Primary CTA: ([^\n]+)/i);
  
  if (ctaMatch && ctaMatch[1]) {
    extractedCtaText = ctaMatch[1].trim();
  }
  
  return {
    prompt: lovablePrompt,
    generatedValues: {
      founderMessage: extractedFounderMessage || chainInput.founderMessage,
      ctaText: extractedCtaText || chainInput.ctaText
    }
  };
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
  getPageCraftAgent,
  parseLovablePromptResponse,
  generateLovablePromptBAB  
}; 