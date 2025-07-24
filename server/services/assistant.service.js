const OpenAI = require("openai");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();


if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const CONFIG_FILE = path.join(process.cwd(), "openai.config.json");

const assistantConfigs = {
  painPoint: {
    name: "Pain Point Analyzer Assistant",
    description: "Specialized assistant for extracting and analyzing pain points from social media content",
    model: "gpt-4",
    instructions: `RESPOND ONLY WITH VALID JSON. DO NOT INCLUDE ANY EXPLANATIONS, MARKDOWN, OR COMMENTARY.
    Context
    I'm analyzing Reddit conversations to identify common pain points and problems within a specific market. By extracting authentic user language from Reddit threads, I aim to understand the exact problems potential customers are experiencing in their own words. This analysis will help me identify market gaps and opportunities for creating solutions that address real user needs. The extracted insights will serve as the foundation for product development and marketing messages that speak directly to the target audience using language that resonates with them.
    Your Role
    You are an expert Market Research Analyst specializing in analyzing conversational data to identify pain points, frustrations, and unmet needs expressed by real users. Your expertise is in distilling lengthy Reddit threads into clear, actionable insights while preserving the authentic language users employ to describe their problems.
    Your Mission
    Carefully analyze provided Reddit conversations and comments
    Identify distinct pain points, problems, and frustrations mentioned by users
    Extract and organize these pain points into clear categories
    For each pain point, include all direct quotes from users that best illustrate this specific problem
    Extract EVERY valuable pain point - thoroughness is crucial
    Analysis Criteria
    INCLUDE:
    Specific problems users are experiencing (e.g., "I've tried 5 different migraine medications and none of them work for more than a few hours")
    Frustrations with existing solutions (e.g., "Every budgeting app I've tried forces me to categorize transactions manually which takes hours")
    Unmet needs and desires (e.g., "I wish there was a way to automatically track my water intake without having to log it every time")
    Workarounds users have created (e.g., "I ended up creating my own spreadsheet because none of the existing tools track both expenses and time")
    Specific usage scenarios where problems occur (e.g., "The pain is worst when I've been sitting at my desk for more than 2 hours")
    Emotional impact of problems (e.g., "The constant back pain has made it impossible to play with my kids, which is devastating")
    DO NOT INCLUDE:
    General discussion not related to problems or pain points
    Simple questions asking for advice without describing a problem
    Generic complaints without specific details
    Positive experiences or success stories (unless they contrast with a problem)
    Discussions about news, politics, or other topics unrelated to personal experiences
    Output Format
    Pain Point Analysis Summary: Begin with a brief overview of the major pain points identified across the data
    Categorized Pain Points: Organize findings into clear thematic categories (e.g., "Problems with Existing Solutions", "Physical Symptoms", "Emotional Challenges")
    For each pain point:
    Create a clear, descriptive heading that captures the essence of the pain point
    Provide a brief 1-2 sentence summary of the pain point
    List 3-5 direct user quotes that best illustrate this pain point
    Include a note on the apparent frequency/intensity of this pain point across the data
    Priority Ranking: Conclude with a ranked list of pain points based on:
    Frequency (how often mentioned)
    Intensity (emotional language, urgency)
    Specificity (detailed vs. vague)
    Potential solvability (could a product or service address this?)
    Examples
    Good Pain Point Extraction:

    {
    Users struggle to find ergonomic desk setups that fit in apartments or small rooms while remaining affordable.
    "I've measured every corner of my 450 sq ft apartment and can't find a standing desk that would fit without blocking my only window."
    "Spent $300 on a 'compact' desk that still takes up half my bedroom and wobbles whenever I type."
    "Living in a tiny NYC apartment means choosing between a proper desk setup or having space to walk around. Currently using my kitchen counter which is killing my back."
    "Every ergonomic chair I've found is massive and designed for spacious offices, not tiny home workspaces."
    Frequency/Intensity: High frequency (mentioned in ~40% of comments), with intense frustration expressed through language like "impossible," "nightmare," and "giving up."
    Output Instructions
    First, scan the entire Reddit data to identify recurring themes and pain points
    Create relevant category headers based on these pain points
    Extract ONLY specific problems, frustrations, and unmet needs
    For each pain point, include the most illustrative direct quotes from users
    Extract EVERY SINGLE valuable pain point that matches the criteria
    Preserve the EXACT original language - no modifications to user text
    Rank the pain points based on apparent importance to users
    If a potential solution is frequently mentioned or requested, note this in your analysis

    \`\`\`
    `,
    tools: [{
      type: "function",
      function: {
        name: "extract_pain_points",
        description: "Extract structured pain points from social media content",
        parameters: {
          type: "object",
          properties: {
            pain_points: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  description: { type: "string" },
                  category: {
                    type: "string",
                    enum: ["Health", "Wealth", "Relationships", "Technology", "Education", "Entertainment", "Other"]
                  },
                  intensity: { type: "string", enum: ["Low", "Medium", "High"] },
                  urgency: { type: "string", enum: ["Low", "Medium", "High"] },
                  quotes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        author: { type: "string" },
                        source: { type: "string" }
                      }
                    }
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["title", "summary", "category", "intensity", "description", "quotes", "keywords", "businessPotential", "urgency", "subreddit"]
              }
            }
          },
          required: ["pain_points"]
        }
      }
    }]
  },
  marketGap: {
    name: "Market Gap Generator Assistant",
    description: "Assistant for generating business ideas from pain points",
    model: "gpt-4",
    instructions: `You are an expert Business Opportunity Strategist. Given the following pain points, generate atleast 2-3 unique, actionable business ideas which should necessarily solve the problem defined in summary of the painpoint. Each idea must:

    NOTE: Only generate ideas that solve the summary-level problem. Do not create general solutions or ideas that only address related symptoms.
  
    Context
    I've identified specific pain points within a market through research and customer feedback. Now I need to generate potential business solutions that address these pain points while creating unique value. Rather than rushing to an obvious solution, I want to systematically explore different approaches to solving these problems in ways that could stand out in the market. The goal is to discover opportunities others might miss by considering various dimensions of differentiation and value creation.
    Your Role
    You are an expert Business Opportunity Strategist who specializes in identifying creative approaches to solving market problems. Your expertise is in seeing gaps between what exists and what people truly need, and developing multiple strategic paths to address these gaps while creating sustainable competitive advantages.
    Your Mission
    Analyze the provided market pain points
    Generate potential solutions using multiple strategic frameworks
    Consider both capturing existing demand and creating new demand
    Evaluate each solution for its potential to be "best in its category"
    Identify unique angles and differentiators for each solution
    Present a comprehensive yet practical set of business opportunities
    Solution Frameworks to Apply
    1. Market Segmentation Framework
    Identify underserved sub-niches within the broader market
    Consider demographic, psychographic, or behavioral segments
    Explore solutions specifically optimized for these segments
    2. Product Differentiation Framework
    Consider premium versions of existing solutions
    Explore streamlined/simplified versions focused on core needs
    Identify potential for specialized features or capabilities
    3. Business Model Innovation Framework
    Explore subscription vs. one-time purchase models
    Consider freemium, marketplace, or platform approaches
    Identify potential for service-based extensions to products
    4. Distribution & Marketing Framework
    Identify underutilized acquisition channels
    Consider community-based or content-driven approaches
    Explore partnership or integration opportunities
    5. New Paradigm Framework
    Consider applications of emerging technologies
    Identify relevant new trends, regulations, or data sources
    Explore potential for creating entirely new categories
    Output Format
    Executive Summary: Brief overview of the identified market opportunity and key solution themes
    For each framework, provide:
    2-3 specific solution concepts
    Key differentiators for each concept
    Target audience specifics
    Potential challenges to overcome
    "Best in the world" potential assessment
    For each solution concept, include:
    Clear descriptive name
    2-3 sentence explanation
    Key features or components
    Primary value proposition
    Potential business model
    How it specifically addresses identified pain points
    Opportunity Assessment: Conclude with a ranked evaluation of the top 3 solutions based on:
    Market size and growth potential
    Competitive advantage sustainability
    Implementation feasibility
    Potential for category dominance ("best in the world" potential)
    Examples
    Good Solution Generation:
    Market Gap: Difficulty finding comfortable work-from-home furniture for small spaces

    Segmentation Approach Solution: Urban Apartment Workspace System

    A modular, wall-mounted workstation designed specifically for apartments under 600 sq ft
    Features fold-away components, integrated cable management, and customizable configurations
    Target audience: Urban professionals in high-cost cities with minimal space
    Business model: Direct-to-consumer with professional installation option
    Differentiator: The only ergonomic system designed exclusively for micro-apartments, with every component optimized for minimal footprint

    Business Model Innovation Solution: Nomad Desk Subscription

    Monthly subscription service providing high-quality, compact desks with free exchanges
    Allows users to upgrade, downsize, or change styles as their living situation changes
    Target audience: Young professionals who move frequently or want flexibility
    Business model: Recurring revenue with asset utilization optimization
    Differentiator: Eliminates the risk of investing in furniture that might not fit future spaces
    Output Instructions
    Begin by reviewing the pain points to understand the core market needs
    Apply each framework systematically to generate diverse solution approaches
    For each solution, clearly articulate how it addresses the specific pain points
    Evaluate each solution for its potential to be "best in its category" in some way
    Generate solutions across different price points and complexity levels
    Ensure solutions span both immediate tactical opportunities and longer-term strategic plays
    Prioritize practical, implementable ideas over theoretical concepts

  - Have a clear, descriptive ideaName.
  - Be tailored to the specific pain point(s) provided.
  - Include a 2-3 sentence description of the idea and how it solves the pain point.
  - Write a problemStatement in the user's voice (first person, as if quoting a real user, e.g., "I always forget to...").
  - List at least 2 keyFeatures, 2 revenueStreams, 2 implementationSteps, 2 potentialChallenges, and 2 successMetrics, all with concrete, non-placeholder content.
  - List at least 2 uniqueValueProposition
  - Include a targetAudience, businessModel (choose from: Freemium, Subscription, Ads, Marketplace, Licensing, One-time purchase, SaaS, Service, Platform, Other), marketCategory, differentiators, useCase (realistic scenario), keywords (array of 3-8 relevant terms), overallScore (float 0-10), and feasibilityScore (float 0-10).
  - Do NOT repeat the same description or features for each idea.
  - Do NOT use generic phrases like "A business opportunity addressing key market needs."
  - Each idea must be distinct and creative.
  - Use the exact field names: ideaName, description, problemStatement, keyFeatures, revenueStreams, implementationSteps, potentialChallenges, uniqueValueProposition, successMetrics, targetAudience, businessModel, differentiators, useCase, keywords, overallScore, feasibilityScore.
  - Each idea must include a field: relatedPainPointTitle (must match one of the pain point summary above).
  - Each idea must include a field: howItSolvesPainPoint (explain how the idea addresses the pain point summary).
  - Each idea must address a different pain point from the list above.
  - Incorporate user quotes and keywords from the pain point in the idea's description or problem statement.

    Output Format
    Executive Summary: Brief overview of the identified market opportunity and key solution themes
    For each framework, provide:
    2-3 specific solution concepts
    Key differentiators for each concept
    Target audience specifics
    Potential challenges to overcome
    "Best in the world" potential assessment
    For each solution concept, include:
    Clear descriptive name
    2-3 sentence explanation
    Key features or components
    Primary value proposition
    Potential business model
    How it specifically addresses identified pain points
    Opportunity Assessment: Conclude with a ranked evaluation of the top 3 solutions based on:
    Market size and growth potential
    Competitive advantage sustainability
    Implementation feasibility
    Potential for category dominance ("best in the world" potential)

  `,
    tools: [{
      type: "function",
      function: {
        name: "generate_business_ideas",
        description: "Generate structured startup ideas from pain points",
        parameters: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  audience: { type: "string" },
                  pain_point: { type: "string" },
                  market_demand: { type: "string" },
                  business_model: { type: "string" },
                  competitor_gap: { type: "string" }
                },
                required: ["title", "audience", "pain_point", "business_model", "solution_concepts", "key_features", "primary_value_proposition", "potential_business_model", "how_it_specifically_addresses_identified_pain_points", "opportunity_assessment", "market_size_and_growth_potential", "competitive_advantage_sustainability", "implementation_feasibility", "potential_for_category_dominance"]
              }
            }
          },
          required: ["ideas"]
        }
      }
    }]
  },
  landingPage: {
    name: "Landing Page Generator Assistant",
    description: "Assistant for generating landing page copy from business ideas",
    model: "gpt-4",
    instructions: `You are a startup copywriter. Write compelling landing page content using the Before-After-Bridge (BAB) formula.
        Input: One business idea.

        Output:
        {
        "headline": "...",
        "before": "...",
        "after": "...",
        "bridge": "...",
        "call_to_action": "..."
        }`,
    tools: []
  }
};

const cache = {};

// Initialize all assistants when the service starts
async function initializeAssistants() {
  try {
    
    // Initialize all assistants in parallel
    // await Promise.all([
    //   getOrCreateAssistant('painPoint').catch(err => 
    //     console.error('Failed to initialize painPoint assistant:', )
    //   ),
    //   getOrCreateAssistant('marketGap').catch(err => 
    //     console.error('Failed to initialize marketGap assistant:', )
    //   ),
    //   getOrCreateAssistant('landingPage').catch(err => 
    //     console.error('Failed to initialize landingPage assistant:', )
    //   )
    // ]);
    
    console.log('All assistants initialized successfully');
  } catch (error) {
    console.error('Error initializing assistants:', error);
  }
}

// Initialize assistants on first use
let isInitialized = false;
const initializationPromise = initializeAssistants().then(() => {
  isInitialized = true;
  console.log('Assistant service initialized successfully');
  return true;
}).catch(err => {
  console.error('Initialization failed:', err);
  isInitialized = false;
  throw err;
});

// Export a function to check initialization status
const ensureInitialized = async () => {
  if (!isInitialized) {
    await initializationPromise;
  }
  return true;
};

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf8");
    return JSON.parse(data);
  } catch {
      console.log('No existing config found, creating new one');
    return {};
  }
}

async function saveConfig(config) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}


async function getOrCreateAssistant(type) {
  console.log(`Getting or creating assistant of type: ${type}`);
  // Ensure we're initialized
  await ensureInitialized();
  
  // Return from cache if available
  if (cache[type] && cache[type].id) {
    console.log(`Returning cached assistant: ${cache[type].id}`);
    return cache[type];
  }

  try {
    const config = await loadConfig();
    const existingId = config[`${type}AssistantId`];

    // Try to retrieve existing assistant if ID is available
    if (existingId) {
      try {
       console.log(`Attempting to retrieve existing assistant: ${existingId}`);
        const assistant = await openai.beta.assistants.retrieve(existingId);

      if (assistant && assistant.id) {
          console.log(`Successfully retrieved existing assistant: ${assistant.id}`);
          cache[type] = assistant;
          return assistant;
        }
      } catch (retrieveError) {
        console.log(`Failed to retrieve existing assistant ${existingId}:`, retrieveError.message);
        // Continue to create a new assistant
      }
    }

    // Create new assistant if none exists
      console.log(`Creating new ${type} assistant...`);
    
    if (!assistantConfigs[type]) {
      throw new Error(`No configuration found for assistant type: ${type}`);
    }
    
    const assistant = await openai.beta.assistants.create(assistantConfigs[type]);

     if (!assistant || !assistant.id) {
      throw new Error(`Failed to create assistant - no ID returned`);
    }
    
    console.log(`Successfully created new assistant: ${assistant.id}`);
    
    // Update config with new assistant ID
    config[`${type}AssistantId`] = assistant.id;
    config.lastUpdated = new Date().toISOString();
    await saveConfig(config);
    
    cache[type] = assistant;
    return assistant;
  } catch (error) {
  }
}

async function updateAssistant(type, updates) {
  const assistant = await getOrCreateAssistant(type);
  const updated = await openai.beta.assistants.update(assistant.id, updates);
  cache[type] = updated;
  return updated;
}

async function listAllAssistants() {
  const res = await openai.beta.assistants.list();
  return res.data;
}

async function deleteAssistantByType(type) {
  try {
    const config = await loadConfig();
    const assistantId = config[`${type}AssistantId`];
    if (assistantId) {
      await openai.beta.assistants.del(assistantId);
      delete config[`${type}AssistantId`];
      await saveConfig(config);
      delete cache[type];
    }
  } catch (error) {
  }
}

/**
 * Deletes all assistants and clears the configuration
 * @returns {Promise<Object>} Result of the operation
 */
async function deleteAllAssistants() {
  try {
    await ensureInitialized();
    const config = await loadConfig();
    const assistantTypes = ['painPoint', 'marketGap', 'landingPage'];
    
    // Delete all assistants from OpenAI
    const deletePromises = assistantTypes.map(async (type) => {
      const assistantId = config[`${type}AssistantId`];
      if (assistantId) {
        try {
          await openai.beta.assistants.del(assistantId);
        } catch (error) {
          // Continue with other deletions even if one fails
        }
      }
    });

    await Promise.all(deletePromises);
    
    // Clear the configuration
    const newConfig = { lastCleared: new Date().toISOString() };
    await saveConfig(newConfig);
    
    // Clear the cache
    Object.keys(cache).forEach(key => delete cache[key]);
    
    return { 
      success: true, 
      message: 'All assistants have been deleted and configuration has been reset',
      timestamp: newConfig.lastCleared
    };
  } catch (error) {
  }
}

module.exports = {
  getOrCreatePainPointAssistant: () => getOrCreateAssistant("painPoint"),
  getOrCreateMarketGapAssistant: () => getOrCreateAssistant("marketGap"),
  getOrCreateLandingPageAssistant: () => getOrCreateAssistant("landingPage"),
  updateAssistant,
  listAllAssistants,
  deleteAssistantByType,
  deleteAllAssistants,
  initializeAssistants,
  isInitialized: () => isInitialized,
  ensureInitialized
};
