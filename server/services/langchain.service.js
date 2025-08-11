// LangChain integration using initialized assistants
const { ChatOpenAI } = require("@langchain/openai");
const { ChatAnthropic } = require("@langchain/anthropic");
const { ConversationChain } = require("langchain/chains");
const { BufferMemory } = require("langchain/memory");
const { RunnableSequence } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");
const { v4: uuidv4 } = require('uuid');
const {
  getOrCreateLandingPageAssistant,
  getOrCreatePageCraftAssistant,
  getOrCreateClaudePainPointAgent,
  getOrCreateClaudeMarketGapAgent,
  ensureInitialized,
} = require("./assistant.service");
const { getOrCreateConversation } = require('./conversation.service');
const { OpenAI } = require("openai");

// // Cache for initialized assistants(openai old)
// const agentCache = new Map();

// // Helper function to create and cache an agent
// const getOrCreateAgent = async (type, getAssistantFn) => {
//   const cacheKey = `${type}AssistantId`;

//   // Return cached agent if available
//   if (agentCache.has(cacheKey)) {
//     return agentCache.get(cacheKey);
//   }


// Agent types
const AGENT_TYPES = {
  OPENAI: 'openai',
  CLAUDE: 'claude'
};

// Cache for agent configurations (not conversation state)
const agentConfigCache = new Map();

/**
 * Helper function to get agent configuration
 * @param {string} type - The type of agent (e.g., 'painPoint', 'marketGap')
 * @param {Function} getAssistantFn - Function to get the assistant configuration
 * @param {string} [agentType=AGENT_TYPES.OPENAI] - Type of agent (openai or claude)
 * @returns {Promise<Object>} The agent configuration and LLM instance
 */
const getAgentConfig = async (type, getAssistantFn, agentType = AGENT_TYPES.OPENAI) => {
  const cacheKey = `${agentType}_${type}_config`;

  // Return cached config if available
  if (agentConfigCache.has(cacheKey)) {
    return agentConfigCache.get(cacheKey);
  }

  // Ensure assistant exists and get its details
  await ensureInitialized();
  
  let config;
  
  if (agentType === AGENT_TYPES.CLAUDE) {
    // Handle Claude agent
    const claudeConfig = await getAssistantFn();
    
    const claude = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: claudeConfig.model,
      temperature: type === "marketGap" ? 0.7 : 0.3,
      maxTokens: 3000,
    });
    
    config = {
      type: agentType,
      llm: claude,
      systemPrompt: claudeConfig.system || '',
      model: claudeConfig.model
    };
    
    console.log(`Loaded Claude agent config for ${type} with model ${claudeConfig.model}`);
  } else {
    // Handle OpenAI agent (default)
    const assistant = await getAssistantFn();
    
    const openai = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: assistant.model,
      configuration: {
        baseURL: "https://api.openai.com/v1",
      },
      temperature: type === "marketGap" ? 0.7 : 0.3,
      maxTokens: 3000,
    });

  //     // Create and cache the agent
  // const memory = new BufferMemory();
  // const agent = new ConversationChain({
  //   llm: openai,
  //   memory,
  //   // Add any assistant-specific configuration here
  // });
    
    config = {
      type: agentType,
      llm: openai,
      systemPrompt: assistant.instructions || '',
      model: assistant.model
    };
    
    console.log(`Loaded OpenAI agent config for ${type} with model ${assistant.model}`);
  }
  
  // Cache the config
  agentConfigCache.set(cacheKey, config);
  return config;
};

/**
 * Get a conversation-aware agent
 * @param {string} type - The type of agent (e.g., 'painPoint', 'marketGap')
 * @param {Object} options - Options for the agent
 * @param {string} [options.conversationId] - Optional conversation ID for maintaining context
 * @param {string} [options.agentType=AGENT_TYPES.OPENAI] - Type of agent (openai or claude)
 * @param {Function} getAssistantFn - Function to get the assistant configuration
 * @returns {Promise<Object>} Object with agent and conversation info
 */
const getAgent = async (type, options, getAssistantFn) => {
  const { 
    conversationId = uuidv4(),
    agentType = AGENT_TYPES.OPENAI 
  } = options || {};
  
  // Get the agent config (cached)
  const agentConfig = await getAgentConfig(type, getAssistantFn, agentType);
  
  // Get or create conversation
  const conversation = getOrCreateConversation(conversationId, {
    systemPrompt: agentConfig.systemPrompt
  });
  
  // Create a new prompt template with the system message
  // We'll use a custom template that doesn't try to interpret the JSON as template variables
  const prompt = new PromptTemplate({
    template: `{system_prompt}\n\n{input}`,
    inputVariables: ['input'],
    partialVariables: {
      system_prompt: agentConfig.systemPrompt || ''
    }
  });
  
  // Create the agent chain with conversation memory
  const agent = RunnableSequence.from([
    {
      input: (input) => input.input,
      memory: () => conversation.memory.loadMemoryVariables({})
    },
    {
      input: (previousOutput) => previousOutput.input,
      memory: (previousOutput) => previousOutput.memory
    },
    prompt,
    agentConfig.llm,
    (response) => response.content
  ]);
  
  return {
    agent,
    conversationId,
    model: agentConfig.model,
    invoke: async (input) => {
      const response = await agent.invoke({ input });
      
      // Save the interaction to memory
      await conversation.memory.saveContext(
        { input },
        { output: response }
      );
      
      return response;
    }
  };
};

// Cache for initialized agents
const agentCache = new Map();

// --- Claude PainPoint Agent ---
const getClaudePainPointAgent = async (options = {}) => {
  const { conversationId = `conv_${uuidv4()}` } = options;
  const cacheKey = `claude_painpoint_${conversationId}`;
  
  // Return cached agent if available
  if (agentCache.has(cacheKey)) {
    return agentCache.get(cacheKey);
  }
  
  // Get or create the Claude agent config (without system prompt)
  const config = await getAgentConfig(
    'painPoint', 
    getOrCreateClaudePainPointAgent, 
    AGENT_TYPES.CLAUDE
  );
  
  // Get or create conversation with the system prompt
  const conversation = await getOrCreateConversation(conversationId, {
    systemPrompt: config.systemPrompt
  });
  
  // Initialize the agent with system prompt once
  const agent = {
    invoke: async (input) => {
      try {
        // Only include the system prompt if this is the first message
        const messages = [];
        const memoryVariables = await conversation.memory.loadMemoryVariables({});
        
        if (!memoryVariables.chat_history?.length) {
          // First message - include system prompt
          messages.push({
            role: "system",
            content: conversation.systemPrompt,
          });
        } else {
          // Subsequent messages - only include chat history
          messages.push(...memoryVariables.chat_history);
        }
        
        // Add user input
        messages.push({
          role: "user",
          content: JSON.stringify(input),
        });
        
        // Get response from Claude
        const response = await config.llm.invoke(messages);
        
        // Save to conversation memory
        await conversation.memory.saveContext(
          { input: JSON.stringify(input) },
          { output: response.content }
        );
        
        return response.content;
      } catch (error) {
        console.error('Error in Claude PainPoint agent:', error);
        throw error;
      }
    },
    conversationId,
    clear: () => {
      agentCache.delete(cacheKey);
      conversation.memory.clear();
    }
  };
  
  // Cache the agent
  agentCache.set(cacheKey, agent);
  
  // Clean up old agents periodically
  setTimeout(() => {
    if (agentCache.has(cacheKey)) {
      agentCache.delete(cacheKey);
    }
  }, 60 * 60 * 1000); // 1 hour TTL
  
  return agent;
};

// --- Claude MarketGap Agent ---
const getClaudeMarketGapAgent = async (options = {}) => {
  const { conversationId = `conv_${uuidv4()}` } = options;
  const cacheKey = `claude_marketgap_${conversationId}`;
  
  // Return cached agent if available
  if (agentCache.has(cacheKey)) {
    return agentCache.get(cacheKey);
  }
  
  // Get or create the Claude agent config (without system prompt)
  const config = await getAgentConfig(
    'marketGap', 
    getOrCreateClaudeMarketGapAgent, 
    AGENT_TYPES.CLAUDE
  );
  
  // Get or create conversation with the system prompt
  const conversation = await getOrCreateConversation(conversationId, {
    systemPrompt: config.systemPrompt
  });
  
  // Initialize the agent with system prompt once
  const agent = {
    invoke: async (input) => {
      try {
        // Only include the system prompt if this is the first message
        const messages = [];
        const memoryVariables = await conversation.memory.loadMemoryVariables({});
        
        if (!memoryVariables.chat_history?.length) {
          // First message - include system prompt
          messages.push({
            role: "system",
            content: conversation.systemPrompt,
          });
        } else {
          // Subsequent messages - only include chat history
          messages.push(...memoryVariables.chat_history);
        }
        
        // Add user input
        messages.push({
          role: "user",
          content: JSON.stringify(input),
        });
        
        // Get response from Claude
        const response = await config.llm.invoke(messages);
        
        // Save to conversation memory
        await conversation.memory.saveContext(
          { input: JSON.stringify(input) },
          { output: response.content }
        );
        
        return response.content;
      } catch (error) {
        console.error('Error in Claude MarketGap agent:', error);
        throw error;
      }
    },
    conversationId,
    clear: () => {
      agentCache.delete(cacheKey);
      conversation.memory.clear();
    }
  };
  
  // Cache the agent
  agentCache.set(cacheKey, agent);
  
  // Clean up old agents periodically
  setTimeout(() => {
    if (agentCache.has(cacheKey)) {
      agentCache.delete(cacheKey);
    }
  }, 60 * 60 * 1000); // 1 hour TTL
  
  return agent;
};

// --- PainPoint Agent ---
async function getPainPointAgent() {
  const assistantId = process.env.painPointAssistantId;
  if (!assistantId) {
    throw new Error("painPointAssistantId is not set in environment variables");
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Return an object with an invoke method to match the expected interface
  return {
    invoke: async ({ input }) => {
      try {
        // Create a thread
        const thread = await openai.beta.threads.create();
        if (!thread || !thread.id) {
          throw new Error('Failed to create thread: No thread ID returned');
        }
        console.log('Thread created with ID:', thread.id);

        // Add a message to the thread with clear instructions
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: `Analyze this content and extract pain points in JSON format. 
          Content to analyze: ${
            typeof input === "string" ? input : JSON.stringify(input, null, 2)
          }`,
        });

        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantId,
        });

        // Poll for completion with proper error handling
        let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
          thread_id: thread.id,
        });

        console.log(`Initial run status: ${runStatus.status}`);
        
        let attempts = 0;
        const maxAttempts = 120; // 120 seconds max wait time

        while (runStatus.status !== "completed" && attempts < maxAttempts) {
          // Handle failed runs with specific error messages
          if (runStatus.status === "failed") {
            const errorMessage = runStatus.last_error?.message || 'Unknown error';
            
            if (errorMessage.includes('rate_limit_exceeded') || 
                errorMessage.includes('quota') || 
                errorMessage.includes('billing')) {
              console.error('OpenAI API Rate Limit or Billing Error:', errorMessage);
              throw new Error(
                'OpenAI API rate limit or billing issue. Please check your OpenAI account billing and quota.'
              );
            } else {
              console.error('Assistant run failed with error:', errorMessage);
              throw new Error(`Assistant run failed: ${errorMessage}`);
            }
          }

          if (["cancelled", "expired"].includes(runStatus.status)) {
            console.error(
              `Run was ${runStatus.status}. Last status:`, 
              runStatus
            );
            throw new Error(
              `Assistant run was ${runStatus.status}`
            );
          }

          // Handle requires_action status
          if (runStatus.status === "requires_action") {
            console.log(
              "Assistant requires action, submitting empty tool outputs..."
            );

            if (!runStatus.required_action?.submit_tool_outputs?.tool_calls) {
              throw new Error("Invalid required_action format from API");
            }

            // Submit empty tool outputs to continue the run
            await openai.beta.threads.runs.submitToolOutputs(runStatus.id, {
              thread_id: thread.id,
              tool_outputs: runStatus.required_action.submit_tool_outputs.tool_calls.map(
                (toolCall) => ({
                  tool_call_id: toolCall.id,
                  output: "{}",
                })
              ),
            });

            console.log(
              "Submitted empty tool outputs, waiting for completion..."
            );
          }

          console.log(
            `Waiting for completion... (${
              attempts + 1
            }/${maxAttempts}) Current status: ${runStatus.status}`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

          runStatus = await openai.beta.threads.runs.retrieve(run.id, {
            thread_id: thread.id,
          });

          // Log progress
          if (attempts % 10 === 0) {
            // Log every 10 seconds
            console.log(
              `Run progress - Status: ${runStatus.status}, Attempt: ${attempts}/${maxAttempts}`
            );
            if (runStatus.status === "in_progress" && runStatus.step_details) {
              console.log("Current step:", runStatus.step_details);
            }
          }

          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.error("Assistant run timed out. Last status:", runStatus);
          throw new Error(
            `Assistant run timed out after ${maxAttempts} seconds. Last status: ${runStatus.status}`
          );
        }

        console.log("Run completed successfully. Retrieving response...");

        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find(
          (m) => m.role === "assistant"
        );

        if (!assistantMessage || !assistantMessage.content?.[0]?.text?.value) {
          throw new Error("No valid response from assistant");
        }

        const responseContent = assistantMessage.content[0].text.value;

        // Try to extract JSON from the response
        try {
          // Try to extract JSON from markdown code blocks first
          const jsonMatch = responseContent.match(
            /```(?:json)?\s*([\s\S]*?)\s*```/
          );
          const jsonString = jsonMatch ? jsonMatch[1] : responseContent;

          // Try to parse the response
          const parsedResponse = JSON.parse(jsonString);

          return {
            response: parsedResponse,
            threadId: thread.id,
          };
        } catch (parseError) {
          console.warn(
            "Failed to parse response as JSON, returning raw text:",
            parseError
          );
          return {
            response: responseContent,
            threadId: thread.id,
          };
        }
      } catch (error) {
        console.error("Error in getPainPointAgent:", error);
        throw error;
      }
    },
  };
}

// --- MarketGap Agent ---
async function getMarketGapAgent() {
  const assistantId = process.env.marketGapAssistantId;
  if (!assistantId) {
    throw new Error("marketGapAssistantId is not set in environment variables");
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Return an object with an invoke method to match the expected interface
  return {
    invoke: async ({ input }) => {
      try {
        // Create a thread
        const thread = await openai.beta.threads.create();
        if (!thread || !thread.id) {
          throw new Error('Failed to create thread: No thread ID returned');
        }
        console.log('Thread created with ID:', thread.id);

        // Add a message to the thread with clear instructions
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: `Analyze this content and give response in JSON format. 
          Content to analyze: ${
            typeof input === "string" ? input : JSON.stringify(input, null, 2)
          }`,
        });

        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistantId,
        });

        // Poll for completion with proper error handling
        let runStatus = await openai.beta.threads.runs.retrieve(run.id, {
          thread_id: thread.id,
        });

        console.log(`Initial run status: ${runStatus.status}`);
        
        let attempts = 0;
        const maxAttempts = 120; // 120 seconds max wait time

        while (runStatus.status !== "completed" && attempts < maxAttempts) {
          // Handle failed runs with specific error messages
          if (runStatus.status === "failed") {
            const errorMessage = runStatus.last_error?.message || 'Unknown error';
            
            if (errorMessage.includes('rate_limit_exceeded') || 
                errorMessage.includes('quota') || 
                errorMessage.includes('billing')) {
              console.error('OpenAI API Rate Limit or Billing Error:', errorMessage);
              throw new Error(
                'OpenAI API rate limit or billing issue. Please check your OpenAI account billing and quota.'
              );
            } else {
              console.error('Assistant run failed with error:', errorMessage);
              throw new Error(`Assistant run failed: ${errorMessage}`);
            }
          }

          if (["cancelled", "expired"].includes(runStatus.status)) {
            console.error(
              `Run was ${runStatus.status}. Last status:`, 
              runStatus
            );
            throw new Error(
              `Assistant run was ${runStatus.status}`
            );
          }

          // Handle requires_action status
          if (runStatus.status === "requires_action") {
            console.log(
              "Assistant requires action, submitting empty tool outputs..."
            );

            if (!runStatus.required_action?.submit_tool_outputs?.tool_calls) {
              throw new Error("Invalid required_action format from API");
            }

            // Submit empty tool outputs to continue the run
            await openai.beta.threads.runs.submitToolOutputs(runStatus.id, {
              thread_id: thread.id,
              tool_outputs: runStatus.required_action.submit_tool_outputs.tool_calls.map(
                (toolCall) => ({
                  tool_call_id: toolCall.id,
                  output: "{}",
                })
              ),
            });

            console.log(
              "Submitted empty tool outputs, waiting for completion..."
            );
          }

          console.log(
            `Waiting for completion... (${
              attempts + 1
            }/${maxAttempts}) Current status: ${runStatus.status}`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

          runStatus = await openai.beta.threads.runs.retrieve(run.id, {
            thread_id: thread.id,
          });

          // Log progress
          if (attempts % 10 === 0) {
            // Log every 10 seconds
            console.log(
              `Run progress - Status: ${runStatus.status}, Attempt: ${attempts}/${maxAttempts}`
            );
            if (runStatus.status === "in_progress" && runStatus.step_details) {
              console.log("Current step:", runStatus.step_details);
            }
          }

          attempts++;
        }

        if (attempts >= maxAttempts) {
          console.error("Assistant run timed out. Last status:", runStatus);
          throw new Error(
            `Assistant run timed out after ${maxAttempts} seconds. Last status: ${runStatus.status}`
          );
        }

        console.log("Run completed successfully. Retrieving response...");

        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find(
          (m) => m.role === "assistant"
        );

        if (!assistantMessage || !assistantMessage.content?.[0]?.text?.value) {
          throw new Error("No valid response from assistant");
        }

        const responseContent = assistantMessage.content[0].text.value;

        // Try to extract JSON from the response
        try {
          // Try to extract JSON from markdown code blocks first
          const jsonMatch = responseContent.match(
            /```(?:json)?\s*([\s\S]*?)\s*```/
          );
          const jsonString = jsonMatch ? jsonMatch[1] : responseContent;

          // Try to parse the response
          const parsedResponse = JSON.parse(jsonString);

          return {
            response: parsedResponse,
            threadId: thread.id,
          };
        } catch (parseError) {
          console.warn(
            "Failed to parse response as JSON, returning raw text:",
            parseError
          );
          return {
            response: responseContent,
            threadId: thread.id,
          };
        }
      } catch (error) {
        console.error("Error in getMarketGapAgent:", error);
        throw error;
      }
    },
  };
}

// --- PageCraft Agent ---
async function getPageCraftAgent() {
  return getOrCreateAgent("pageCraft", getOrCreatePageCraftAssistant);
}

async function generateLovablePromptBAB({
  title,
  description,
  painPoints = [],
  outcomes = [],
  founderMessage = "",
  ctaText = "",
  targetAudience = "",
  industry = "",
  uniqueValue = "",
  implementationSteps = [],
  potentialChallenges = [],
  differentiators = [],
  successMetrics = [],
  agentType = 'claude', // 'openai' or 'claude'
}) {
  let llm;
  
  if (agentType === 'claude') {
    // Get Claude agent for landing page
    const { getOrCreateClaudeLandingPageAgent } = require('./assistant.service');
    const claudeAgent = await getOrCreateClaudeLandingPageAgent();
    
    // Initialize Claude LLM
    llm = new ChatAnthropic({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      modelName: claudeAgent.model || 'claude-3-haiku-20240307',
      temperature: 0.7,
    });
  } else {
    // Get or create the landing page agent (OpenAI)
    const agent = await getOrCreateAgent(
      "landingPage",
      getOrCreateLandingPageAssistant
    );
    llm = agent.llm;
  }

  // Helper functions for intelligent analysis
  function generateSmartCTA(title, description, industry) {
    const ctaMap = {
      saas: "Start Your Free Trial",
      service: "Get Your Free Consultation",
      product: "Order Now - Free Shipping",
      course: "Enroll Today - Limited Spots",
      consulting: "Book Your Strategy Call",
      app: "Download Free - Get Started",
      marketplace: "Join the Platform",
      tool: "Try It Free - No Credit Card",
      default: "Get Started Free Today",
    };

    const detectedType = detectBusinessType(description);
    return ctaMap[detectedType] || ctaMap.default;
  }

  function detectBusinessType(description) {
    const keywords = {
      saas: ["software", "platform", "dashboard", "tool", "system", "cloud"],
      service: [
        "service",
        "consulting",
        "agency",
        "done-for-you",
        "management",
      ],
      product: ["product", "physical", "item", "buy", "purchase", "sell"],
      course: ["course", "training", "learn", "education", "teach", "program"],
      app: ["mobile", "app", "download", "smartphone", "ios", "android"],
      marketplace: [
        "marketplace",
        "connect",
        "network",
        "community",
        "collaborative",
      ],
      tool: ["generator", "creator", "builder", "analyzer", "optimizer"],
    };

    const lowerDesc = description.toLowerCase();
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some((word) => lowerDesc.includes(word))) {
        return type;
      }
    }
    return "default";
  }

  function getIndustryColor(industry, businessType) {
    const colorMap = {
      tech: { primary: "#2563eb", cta: "#f59e0b", accent: "#10b981" },
      health: { primary: "#059669", cta: "#dc2626", accent: "#3b82f6" },
      finance: { primary: "#1e40af", cta: "#f59e0b", accent: "#059669" },
      education: { primary: "#7c3aed", cta: "#f59e0b", accent: "#06b6d4" },
      marketing: { primary: "#dc2626", cta: "#f59e0b", accent: "#8b5cf6" },
      saas: { primary: "#2563eb", cta: "#10b981", accent: "#f59e0b" },
      default: { primary: "#2563eb", cta: "#f59e0b", accent: "#10b981" },
    };

    return colorMap[industry] || colorMap[businessType] || colorMap.default;
  }

  // Enhanced pre-processing
  // Ensure painPoints is always an array
  const processedPainPoints = Array.isArray(painPoints)
    ? painPoints
    : typeof painPoints === "string"
    ? [painPoints]
    : [];

  const processedOutcome = Array.isArray(outcomes)
    ? outcomes
    : typeof outcomes === "string"
    ? [outcomes]
    : [];

  const businessType = detectBusinessType(description);
  const detectedIndustry = industry || businessType;
  const intelligentCTA =
    ctaText || generateSmartCTA(title, description, detectedIndustry);
  const colors = getIndustryColor(detectedIndustry, businessType);

  // Main prompt template that generates the FINAL Lovable.dev prompt
  const template = `You are an expert landing page copywriter and Lovable.dev prompt specialist. Your task is to generate a COMPLETE, READY-TO-COPY-PASTE Lovable.dev prompt for creating a high-converting landing page.

BUSINESS ANALYSIS:
- Title: "${title}"
- Description: "${description}"
- Target Audience: "${targetAudience || "Extract from description"}"
- Business Type: "${businessType}"
- Industry: "${detectedIndustry}"
- Pain Points: ${
    processedPainPoints.length > 0
      ? processedPainPoints.join("\n  • ")
      : "Extract from context"
  }
- Desired Outcomes: ${
    processedOutcome.length > 0
      ? processedOutcome.join("\n  • ")
      : "Generate based on solution"
  }
- Unique Value: "${uniqueValue || "Determine from description"}"
- Implementation Steps: ${
    implementationSteps.length > 0
      ? implementationSteps.join("\n  • ")
      : "Extract from context"
  }
- Potential Challenges: ${
    potentialChallenges.length > 0
      ? potentialChallenges.join("\n  • ")
      : "Extract from context"
  }
- Differentiators: ${
    differentiators.length > 0
      ? differentiators.join("\n  • ")
      : "Extract from context"
  }
- Success Metrics: ${
    successMetrics.length > 0
      ? successMetrics.join("\n  • ")
      : "Extract from context"
  }

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
**PAGE STRUCTURE:**
🎯 **HERO SECTION:**
**TECHNICAL SPECIFICATIONS:**
**FUNCTIONALITY:**
Build this as a production-ready, fully functional landing page with all content, styling, and interactions included.
---

CRUCIAL INSTRUCTIONS:
1. COPYWRITING
2. DESIGN & LAYOUT
3. CONVERSION ELEMENTS
4. TECHNICAL REQUIREMENTS
5. TRUST SIGNALS
6. METRICS TO INCLUDE
7. DIFFERENTIATORS`;

  const prompt = new PromptTemplate({
    template,
    inputVariables: [
      "title",
      "description",
      "painPoints",
      "outcomes",
      "founderMessage",
      "ctaText",
      "targetAudience",
      "industry",
      "uniqueValue",
      "intelligentCTA",
      "colors",
      "businessType",
      "detectedIndustry",
    ],
  });

  const chain = RunnableSequence.from([prompt, llm]);

  // Prepare the input for the chain
  const chainInput = {
    title,
    description,
    painPoints:
      processedPainPoints.length > 0
        ? processedPainPoints.join("\n  • ")
        : "Extract from context",
    outcomes:
      processedOutcome.length > 0
        ? processedOutcome.join("\n  • ")
        : "Generate based on solution",
    founderMessage: founderMessage || "Generate authentic founder story",
    ctaText: intelligentCTA,
    targetAudience: targetAudience || "Extract from description",
    industry: detectedIndustry,
    uniqueValue: uniqueValue || "Determine from description",
    intelligentCTA,
    colors,
    businessType,
    detectedIndustry,
  };

  // Log the input for debugging
  console.log("Chain input:", JSON.stringify(chainInput, null, 2));

  const response = await chain.invoke(chainInput);

  // Clean up the response to ensure it's a proper prompt
  let lovablePrompt = response.content;

  // Remove any meta-commentary and ensure clean format
  if (lovablePrompt.includes("```")) {
    const matches = lovablePrompt.match(/```[\s\S]*?```/);
    if (matches) {
      lovablePrompt = matches[0].replace(/```/g, "").trim();
    }
  }

  // Ensure the prompt starts correctly
  if (!lovablePrompt.startsWith("Create a modern")) {
    lovablePrompt =
      `Create a modern, high-converting landing page for "${title}" using React and Tailwind CSS.\n\n` +
      lovablePrompt;
  }

  // Extract the founder message from the generated content
  let extractedFounderMessage = "";
  const founderMessageMatch =
    lovablePrompt.match(/Founder Message: "([^"]+)"/i) ||
    lovablePrompt.match(/Founder Message: ([^\n]+)/i);

  if (founderMessageMatch && founderMessageMatch[1]) {
    extractedFounderMessage = founderMessageMatch[1].trim();
  }

  // Extract the CTA text from the generated content
  let extractedCtaText = "";
  const ctaMatch =
    lovablePrompt.match(/(?:primary\s+)?cta[:\s]*["']([^"']+)["']/i) ||
    lovablePrompt.match(/CTA: "([^"]+)"/i) ||
    lovablePrompt.match(/Primary CTA: ([^\n]+)/i);

  if (ctaMatch && ctaMatch[1]) {
    extractedCtaText = ctaMatch[1].trim();
  }

  return {
    prompt: lovablePrompt,
    generatedValues: {
      founderMessage: extractedFounderMessage || chainInput.founderMessage,
      ctaText: extractedCtaText || chainInput.ctaText,
    },
  };
}

// Enhanced function to parse the response and extract structured data for MongoDB
function parseLovablePromptResponse(lovablePrompt, originalData) {
  // Extract headline from the prompt
  const headlineMatch = lovablePrompt.match(/headline[:\s]*["']([^"']+)["']/i);
  const headline = headlineMatch ? headlineMatch[1] : originalData.title;

  // Extract subheadline
  const subheadlineMatch = lovablePrompt.match(
    /subheadline[:\s]*["']([^"']+)["']/i
  );
  const subheadline = subheadlineMatch
    ? subheadlineMatch[1]
    : originalData.description;

  // Extract bullet points
  const bulletMatches = lovablePrompt.match(
    /bullet[s]?[:\s]*[\n\r]*((?:[\s]*[•\-\*][\s]*[^\n\r]+[\n\r]*){2,})/i
  );
  const bulletPoints = bulletMatches
    ? bulletMatches[1]
        .split(/[\n\r]+/)
        .map((b) => b.replace(/^[\s]*[•\-\*][\s]*/, "").trim())
        .filter(Boolean)
    : originalData.outcomes || [
        "Enhanced productivity",
        "Better results",
        "Time savings",
      ];

  // Extract pain points
  const painMatches = lovablePrompt.match(
    /pain[s]?[:\s]*[\n\r]*((?:[\s]*[•\-\*][\s]*[^\n\r]+[\n\r]*){2,})/i
  );
  const painPointsSection = painMatches
    ? painMatches[1]
        .split(/[\n\r]+/)
        .map((p) => p.replace(/^[\s]*[•\-\*][\s]*/, "").trim())
        .filter(Boolean)
    : originalData.painPoints || ["Current struggles with existing solutions"];

  // Extract outcomes
  const outcomeMatches = lovablePrompt.match(
    /outcome[s]?[:\s]*[\n\r]*((?:[\s]*[•\-\*][\s]*[^\n\r]+[\n\r]*){2,})/i
  );
  const outcomeSection = outcomeMatches
    ? outcomeMatches[1]
        .split(/[\n\r]+/)
        .map((o) => o.replace(/^[\s]*[•\-\*][\s]*/, "").trim())
        .filter(Boolean)
    : bulletPoints;

  // Extract founder message
  const founderMatch = lovablePrompt.match(
    /founder[s]?\s+message[:\s]*["']([^"']+)["']/i
  );
  const founderMessage = founderMatch
    ? founderMatch[1]
    : originalData.founderMessage || "";

  // Extract CTA text
  const ctaMatch =
    lovablePrompt.match(/(?:primary\s+)?cta[:\s]*["']([^"']+)["']/i) ||
    lovablePrompt.match(/CTA: "([^"]+)"/i) ||
    lovablePrompt.match(/Primary CTA: ([^\n]+)/i);

  const ctaText = ctaMatch
    ? ctaMatch[1]
    : originalData.ctaText || "Get Started Free";

  return {
    headline,
    subheadline,
    bulletPoints: bulletPoints.slice(0, 5), // Limit to 5 bullets
    painPointsSection: painPointsSection.slice(0, 3), // Limit to 3 pain points
    outcomeSection: outcomeSection.slice(0, 3), // Limit to 3 outcomes
    founderMessage,
    ctaText,
  };
}

module.exports = {
  // OpenAI Agents
  getPainPointAgent,
  getMarketGapAgent,
  getPageCraftAgent,
  
  // Claude Agents
  getClaudePainPointAgent,
  getClaudeMarketGapAgent,
  
  // Common functions
  generateLovablePromptBAB,
  parseLovablePromptResponse,
  
  // Internal functions (exposed for testing)
  _getAgent: getAgent,
  
  // Constants
  AGENT_TYPES,
};
