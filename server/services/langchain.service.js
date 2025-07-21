// LangChain integration for Anthropic (PainPoint) and OpenAI (MarketGap)
const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ConversationChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');
const { RunnableSequence } = require('@langchain/core/runnables'); 
const { PromptTemplate } = require('@langchain/core/prompts'); 

// --- Anthropic PainPoint Agent ---
function getPainPointAgent() {
  const openai = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // or your preferred model
    temperature: 0.3,
    maxTokens: 4000,
  });

  const memory = new BufferMemory();
  // You can add tools or custom prompt templates here for advanced features
  return new ConversationChain({ llm: openai, memory });
}

// --- OpenAI MarketGap Agent ---
function getMarketGapAgent() {
  const openai = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // or your preferred model
    temperature: 0.7,
    maxTokens: 4000,
  });
  const memory = new BufferMemory();
  // You can add tools or custom prompt templates here for advanced features
  return new ConversationChain({ llm: openai, memory });
}

async function generateLovablePromptBAB({ 
  title, 
  description, 
  painPoints = [], 
  outcomes = [], 
  founderMessage = '', 
  ctaText = '',
  targetAudience = '', // NEW: Better targeting
  industry = '', // NEW: Industry-specific customization
  uniqueValue = '' // NEW: Key differentiator
}) {
  const openai = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // Upgraded for better idea analysis
    temperature: 0.4, // Slightly more creative for better copy
    maxTokens: 3200,
  });

  // Enhanced pre-processing with idea-specific intelligence
  const processedPainPoints = painPoints.length > 0 
    ? painPoints.map(p => `• ${p}`).join('\n')
    : "• [Extract pain points from target audience and industry context]";

  const processedOutcomes = outcomes.length > 0
    ? outcomes.map((o, i) => `${i+1}. ${o}`).join('\n')
    : "• [Generate outcomes based on solution and target audience needs]";

  // Smart CTA generation based on business type
  const intelligentCTA = ctaText || generateSmartCTA(title, description, industry);
  
  // Industry-specific customizations
  const industryInsights = getIndustryInsights(industry, description);
  const audienceInsights = getAudienceInsights(targetAudience, description);

  const template = `You are a conversion-optimized landing page expert with deep understanding of business psychology. Analyze the business idea and generate a Lovable.dev prompt that creates a perfectly targeted landing page.

BUSINESS CONTEXT ANALYSIS:
Title: "${title}"
Description: "${description}"
Target Audience: "${targetAudience || 'Analyze and determine from description'}"
Industry: "${industry || 'Determine from business context'}"
Unique Value: "${uniqueValue || 'Extract key differentiator from description'}"

GENERATE A LOVABLE.DEV PROMPT FOLLOWING THIS STRUCTURE:

1️⃣ ABOVE THE FOLD SECTION
HEADLINE: Create a powerful headline based on "${title}" that:
- Speaks directly to the target audience's biggest desire
- Uses emotional trigger words relevant to the industry
- Makes an immediate value promise
- Alternative: Transform "${title}" into a benefit-driven statement

SUBHEADLINE: Transform "${description}" into a compelling subheadline that:
- Clarifies WHO this is for (be specific about target audience)
- States WHAT problem it solves (main pain point)
- Explains HOW it's different (unique approach/advantage)
- Uses industry-appropriate language and tone

BENEFIT BULLETS (3-5 bullets):
${processedOutcomes}
→ Convert each to powerful benefits using format: "[Specific Feature] → [Time/Money/Stress Saved] → [Emotional Payoff]"
→ Focus on outcomes that matter most to the target audience
→ Use quantifiable results where possible

PRIMARY CTA: "${intelligentCTA}"
→ Make it action-oriented and outcome-focused
→ Add urgency/scarcity element appropriate for the business type

2️⃣ CURRENT PAIN SECTION (THE "BEFORE")
TITLE: Create an empathetic question that immediately resonates with target audience struggles

PAIN POINTS (Expand and enhance these):
${processedPainPoints}
→ Format each as: "Current Frustrating Situation → Negative Consequence → Emotional Impact"
→ Use specific scenarios the target audience faces daily
→ Include industry-specific frustrations and terminology
→ Make it feel like you're reading their mind

BELIEF DECONSTRUCTION BLOCK:
"Here's why [current industry solutions] keep failing you:
- [Common Approach #1] → [Why it doesn't work] → [Wasted time/money/effort]
- [Common Approach #2] → [Hidden problems] → [Continued frustration]
- [Common Approach #3] → [Missing piece] → [Never getting results]

*Does this sound familiar?* It's not your fault - the current way is broken."

3️⃣ DESIRED OUTCOME SECTION (THE "AFTER")
TITLE: "Imagine [Specific Target Audience Goal] Without [Biggest Pain Point]"

OUTCOME TRANSFORMATION BLOCKS:
Create 3 compelling vision blocks based on the target audience's dreams:
1. **Immediate Relief:** "[Quick win] → [Feel immediate relief] → [First positive result]"
2. **Growing Success:** "[Building momentum] → [Gaining confidence] → [Measurable improvement]"  
3. **Ultimate Transformation:** "[Final state] → [Identity shift] → [Dream lifestyle/business state]"

NEW PARADIGM INTRODUCTION:
"The breakthrough that changes everything: Instead of [old industry way], what if you could [innovative approach from description]?

This works because [core insight that makes the solution unique and powerful]..."

4️⃣ INTRODUCING THE SOLUTION (THE "BRIDGE")
PRODUCT NAME: "${title}"
COMPELLING TAGLINE: Create a memorable tagline that captures the unique value proposition

3-STEP PROCESS (Make it seem effortless):
Analyze the business model and create 3 simple steps:
1. **[Easy First Step]** → [Immediate small win] → [Customer feels progress in minutes]
2. **[Guided Second Step]** → [Building momentum] → [Customer sees real results in days]
3. **[Transformative Final Step]** → [Complete solution] → [Customer achieves main goal]

FOUNDER MESSAGE: 
"${founderMessage || '[Create authentic founder story that connects personal experience to customer pain + why this solution was built]'}"
+ Add credibility indicator: "[Relevant experience/customers helped/time in business/results achieved]"

FINAL CTA BLOCK:
PRIMARY CTA: "${intelligentCTA} → [Main Transformation Promise]"
URGENCY HOOK: "[Create time-sensitive or scarcity reason appropriate for business type]"
RISK REVERSAL: "[Guarantee/trial/money-back offer that reduces purchase anxiety]"

=== DESIGN & TECHNICAL SPECIFICATIONS ===

**Visual Design Requirements:**
• Mobile-first responsive layout optimized for target audience device usage
• Industry-appropriate color psychology:
  - Primary: [Choose color based on industry and trust factors]
  - CTA: [High-conversion color for target audience psychology]
  - Accent: [Emotional color matching desired feelings]

**Layout Optimization:**
• Z-pattern flow for maximum conversion
• Strategic CTA placement:
  - Hero section (primary)
  - After pain points (secondary)
  - Final conversion zone (tertiary with email capture)
• Progressive disclosure with scroll-triggered animations

**Typography Hierarchy:**
• H1: 3.5rem bold, emotionally charged headline
• H2: 2.5rem semi-bold section headers
• Body: 1.1rem, 1.6 line-height, easy readability
• CTAs: 1.3rem bold, action-oriented

**Conversion Psychology Elements:**
• Social proof placement after credibility moments
• Trust indicators relevant to target audience concerns  
• FOMO elements appropriate for business urgency level
• Risk reversal offers that address main purchase objections

=== CONTENT OPTIMIZATION RULES ===
1. **Target Audience Language:** Use vocabulary and tone that resonates with specific audience
2. **Industry Authority:** Include terminology that shows expertise without confusing prospects
3. **Emotional Triggers:** Focus on feelings and transformations, not just features
4. **Specificity:** Use concrete numbers, timeframes, and results wherever possible
5. **Flow Logic:** Each section naturally leads to the next with transitional CTAs
6. **Authenticity:** Make it sound genuine and personal, not corporate or salesy

**SPECIAL INSTRUCTIONS FOR LOVABLE:**
- Create a fully functional single-page application
- Include smooth scroll navigation between sections
- Add subtle animations for engagement (fade-ins, hover effects)
- Implement email capture form with validation
- Make all CTAs trackable for conversion analysis
- Ensure 100% mobile responsiveness
- Include meta tags for SEO optimization

Generate the complete Lovable.dev prompt that will create a high-converting landing page perfectly tailored to this specific business idea, target audience, and industry context.

OUTPUT: Complete Lovable.dev prompt ready to copy-paste (no additional commentary).`;

  // Helper functions for intelligent generation
  function generateSmartCTA(title, description, industry) {
    const ctaMap = {
      'saas': 'Start Free Trial',
      'service': 'Get Started Today', 
      'product': 'Order Now',
      'course': 'Enroll Now',
      'consulting': 'Book Consultation',
      'app': 'Download Free',
      'default': 'Get Started Free'
    };
    
    const detectedType = detectBusinessType(description);
    return ctaMap[detectedType] || ctaMap.default;
  }

  function detectBusinessType(description) {
    const keywords = {
      saas: ['software', 'platform', 'dashboard', 'tool', 'app', 'system'],
      service: ['service', 'consulting', 'agency', 'done-for-you'],
      product: ['product', 'physical', 'item', 'buy', 'purchase'],
      course: ['course', 'training', 'learn', 'education', 'teach'],
      app: ['mobile', 'app', 'download', 'smartphone']
    };

    const lowerDesc = description.toLowerCase();
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowerDesc.includes(word))) {
        return type;
      }
    }
    return 'default';
  }

  function getIndustryInsights(industry, description) {
    // This could be expanded with industry-specific insights
    return industry || detectBusinessType(description);
  }

  function getAudienceInsights(audience, description) {
    // This could be expanded with audience-specific insights
    return audience || 'professionals looking for better solutions';
  }

  // Create and execute the prompt chain
  const prompt = new PromptTemplate({
    template,
    inputVariables: ['title', 'description', 'painPoints', 'outcomes', 'founderMessage', 'ctaText', 'targetAudience', 'industry', 'uniqueValue'],
  });

  const chain = RunnableSequence.from([prompt, openai]);
  const response = await chain.invoke({
    title,
    description,
    painPoints: processedPainPoints,
    outcomes: processedOutcomes,
    founderMessage,
    ctaText: intelligentCTA,
    targetAudience,
    industry,
    uniqueValue
  });
  
  return response.content;
}

module.exports = {
  getPainPointAgent,
  getMarketGapAgent,
  generateLovablePromptBAB,
}; 