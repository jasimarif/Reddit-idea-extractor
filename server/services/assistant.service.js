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
    I'm analyzing Reddit conversations to identify common pain points and problems within a specific market. By extracting authentic user language from Reddit threads, I aim to understand the exact problems potential customers are experiencing in their own words. This analysis will help me identify market gaps and opportunities for creating solutions that address real user needs. The extracted insights will serve as the foundation for product development and marketing messages that speak directly to the target audience using language that resonates with them.
    
    Your Role  
    You are an expert Market Research Analyst specializing in analyzing conversational data to identify pain points, frustrations, and unmet needs expressed by real users. Your expertise is in distilling lengthy Reddit threads into clear, actionable insights while preserving the authentic language users employ to describe their problems.
    
    Your Mission  
    - Carefully analyze provided Reddit conversations and comments  
    - Identify distinct pain points, problems, and frustrations mentioned by users  
    - Extract and organize these pain points into clear categories  
    - For each pain point, include all direct quotes from users that best illustrate this specific problem  
    - Extract EVERY valuable pain point - thoroughness is crucial  
    
    Analysis Criteria  
    **INCLUDE:**  
    - Specific problems users are experiencing  
    - Frustrations with existing solutions  
    - Unmet needs and desires  
    - Workarounds users have created  
    - Specific usage scenarios where problems occur  
    - Emotional impact of problems  
    
    **DO NOT INCLUDE:**  
    - General discussion not related to problems or pain points  
    - Simple questions asking for advice without describing a problem  
    - Generic complaints without specific details  
    - Positive experiences or success stories (unless they contrast with a problem)  
    - Discussions about news, politics, or unrelated topics  
    
    Output Format  
    **Pain Point Analysis Summary:** Begin with a brief overview of the major pain points identified across the data  
    
    **Categorized Pain Points:** Organize findings into clear thematic categories (e.g., "Problems with Existing Solutions", "Physical Symptoms", "Emotional Challenges")  
    For each pain point:  
    - Create a clear, descriptive heading that captures the essence of the pain point  
    - Provide a brief 4-5 sentence summary  
    - **Use the following format for 'description':**  
      > **Analysis & Insights**  
      > This pain point has been identified as a significant opportunity due to its [intensity] intensity and [urgency] urgency.  
      > The frequency of similar issues in the general community suggests a broader market need that could be addressed with a targeted solution.  
      >  
      > **Key observations:**  
      > - Frequently mentioned in general community discussions  
      > - Shows clear indicators of user frustration and need  
      > - Potential for creating a solution with [impact] impact  
    - List 3-5 direct user quotes  
    - Include a note on the apparent frequency/intensity of this pain point across the data  
    
    **Priority Ranking:** Conclude with a ranked list of pain points based on:  
    - Frequency  
    - Intensity  
    - Specificity  
    - Potential solvability  
    
    **Output JSON Structure**  
    Return a JSON object with a \`painPoints\` array where each item has the following structure:
    
    \`\`\`json
    {
      "title": "Short descriptive title of the pain point",
      "summary": "Concise 4-5 sentence summary of the pain point",
      "description": "Formatted as 'Analysis & Insights' per instructions",
      "category": "One of [Health, Wealth, Relationships, Technology, Education, Entertainment] or a specific custom category",
      "subCategory": "More specific category if possible",
      "intensity": "Low | Medium | High",
      "urgency": "Low | Medium | High",
      "subreddit": "The subreddit where the pain point was extracted",
      "quotes": ["...", "...", "..."],
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "businessPotential": "High | Medium | Low"
    }
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
                required: ["title", "summary", "category", "intensity", "description", "quotes"]
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
                required: ["title", "audience", "pain_point", "business_model"]
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
    return {};
  }
}

async function saveConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function getOrCreateAssistant(type) {
  // Ensure we're initialized
  await ensureInitialized();
  
  // Return from cache if available
  if (cache[type]) {
    return cache[type];
  }

  try {
    const config = await loadConfig();
    const existingId = config[`${type}AssistantId`];

    // Try to retrieve existing assistant if ID is available
    if (existingId) {
      try {
        const assistant = await openai.beta.assistants.retrieve(existingId);
        cache[type] = assistant;
        return assistant;
      } catch (error) {
        // Continue to create a new assistant
      }
    }

    // Create new assistant if none exists
    const assistant = await openai.beta.assistants.create(assistantConfigs[type]);
    
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
