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
    model: "gpt-3.5-turbo",
    instructions: `You are a specialized assistant for analyzing social media content to extract pain points that must be converted into business ideas.
        Your role is to:
        1. Identify genuine problems and frustrations in user posts
        2. Extract specific pain points with supporting quotes
        3. Categorize pain points by market (Health, Wealth, Relationships, Technology, Education, Entertainment, Other)
        4. Rate intensity and urgency levels
        5. Provide structured JSON responses
        Always focus on actionable pain points that could lead to business opportunities.`,
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
    model: "gpt-3.5-turbo",
    instructions: `You are a startup strategist. Based on the pain points provided, generate 3 innovative business ideas.
        Each idea should:
        - Target a specific **audience**
        - Solve a **concrete pain point**
        - Show evidence of **market demand**
        - Include a suggested **business model**
        - Mention **competitor gaps**`,
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
    model: "gpt-3.5-turbo",
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
    console.log('Initializing OpenAI assistants...');
    
    // Initialize all assistants in parallel
    await Promise.all([
      getOrCreateAssistant('painPoint').catch(err => 
        logger.error('Failed to initialize painPoint assistant:', err)
      ),
      getOrCreateAssistant('marketGap').catch(err => 
        logger.error('Failed to initialize marketGap assistant:', err)
      ),
      getOrCreateAssistant('landingPage').catch(err => 
        logger.error('Failed to initialize landingPage assistant:', err)
      )
    ]);
    
    console.log('All assistants initialized successfully');
  } catch (error) {
    console.error('Error initializing assistants:', error);
  }
}

// Call initialize on require
initializeAssistants();

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
  // Return from cache if available
  if (cache[type]) {
    console.log(`Using cached ${type} assistant`);
    return cache[type];
  }

  try {
    const config = await loadConfig();
    const existingId = config[`${type}AssistantId`];

    // Try to retrieve existing assistant if ID is available
    if (existingId) {
      try {
        console.log(`Retrieving existing ${type} assistant with ID: *******`);
        const assistant = await openai.beta.assistants.retrieve(existingId);
        cache[type] = assistant;
        console.log(`Successfully retrieved ${type} assistant`);
        return assistant;
      } catch (error) {
        console.warn(`Failed to retrieve ${type} assistant (${existingId}), creating new one:`, error.message);
        // Continue to create a new assistant
      }
    }

    // Create new assistant if none exists
    console.log(`Creating new ${type} assistant...`);
    const assistant = await openai.beta.assistants.create(assistantConfigs[type]);
    
    // Update config with new assistant ID
    config[`${type}AssistantId`] = assistant.id;
    config.lastUpdated = new Date().toISOString();
    await saveConfig(config);
    
    cache[type] = assistant;
    logger.info(`Successfully created ${type} assistant: ${assistant.id}`);
    return assistant;
  } catch (error) {
    logger.error(`Error in getOrCreateAssistant for ${type}:`, error);
    throw new Error(`Failed to get or create ${type} assistant: ${error.message}`);
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
  const config = await loadConfig();
  const id = config[`${type}AssistantId`];
  if (!id) return false;

  await openai.beta.assistants.del(id);
  delete config[`${type}AssistantId`];
  await saveConfig(config);
  delete cache[type];
  return true;
}

module.exports = {
  getOrCreatePainPointAssistant: () => getOrCreateAssistant("painPoint"),
  getOrCreateMarketGapAssistant: () => getOrCreateAssistant("marketGap"),
  getOrCreateLandingPageAssistant: () => getOrCreateAssistant("landingPage"),
  updateAssistant,
  listAllAssistants,
  deleteAssistantByType,
  // Export the initialize function for explicit initialization if needed
  initializeAssistants
};
