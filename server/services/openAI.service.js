const OpenAI = require("openai");
const assistantManager = require("./assistant.service");

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const model = "gpt-3.5-turbo";
const maxTokens = 4000;

const cache = {
  assistant: null,
  painPoint: null,
  marketGap: null,
  landingPage: null,
};

async function getPainPointAssistant() {
  if (!cache.painPoint) {
    cache.painPoint = await assistantManager.getOrCreatePainPointAssistant();
  }
  return cache.painPoint;
}

async function getMarketGapAssistant() {
  if (!cache.marketGap) {
    cache.marketGap = await assistantManager.getOrCreateMarketGapAssistant();
  }
  return cache.marketGap;
}

async function getLandingPageAssistant() {
  if (!cache.landingPage) {
    cache.landingPage =
      await assistantManager.getOrCreateLandingPageAssistant();
  }
  return cache.landingPage;
}

function buildPainPointExtractionPrompt(threadContent) {
  return `Analyze the following thread content and extract specific pain points. 
  Return a JSON object with a 'painPoints' array where each item has:
  - title: A short title for the pain point
  - summary: A brief summary
  - description: Detailed description
  - category: One of [Health, Wealth, Relationships, Technology, Education, Entertainment, Other]
  - subCategory: More specific category
  - intensity: [Low, Medium, High]
  - urgency: [Low, Medium, High]
  - quotes: Array of supporting quotes
  - keywords: Array of relevant keywords

  Thread content:
  ${JSON.stringify(threadContent, null, 2)}

  Respond with a valid JSON object containing a 'painPoints' array.`;
}

async function extractPainPoints(threadContent) {
  try {
    const prompt = buildPainPointExtractionPrompt(threadContent);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing user feedback and identifying pain points. Always respond with a valid JSON object containing a 'painPoints' array.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
      response_format: { type: "json_object" }, // This is correct
    });

    // Add validation for the response format
    if (!response.choices?.[0]?.message?.content) {
      throw new Error("Invalid response format from OpenAI");
    }

    const content = response.choices[0].message.content;
    let result;
    try {
      result = typeof content === "string" ? JSON.parse(content) : content;
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }

    return validatePainPointExtraction(result);
  } catch (err) {
    console.error("Error extracting pain points:", err.message);
    throw new Error(`Pain point extraction failed: ${err.message}`);
  }
}
function validatePainPointExtraction(result) {
  if (!result.painPoints || !Array.isArray(result.painPoints)) {
    throw new Error("Invalid pain point extraction format");
  }

  return result.painPoints.map((pp) => ({
    title: pp.title || "Untitled",
    summary: pp.summary || "",
    description: pp.description || "",
    category: pp.category || "Other",
    subCategory: pp.subCategory || "",
    intensity: pp.intensity || "Medium",
    urgency: pp.urgency || "Medium",
    frequency: pp.frequency || 1,
    quotes: pp.quotes || [],
    keywords: pp.keywords || [],
    targetAudience: pp.targetAudience || [],
    existingSolutions: pp.existingSolutions || [],
    solutionComplexity: pp.solutionComplexity || "Medium",
    marketSize: pp.marketSize || "Unknown",
    llmConfidenceScore: pp.llmConfidenceScore || 0.5,
  }));
}

function buildBusinessIdeaPrompt(painPoints) {
  return `Based on the following pain points... (truncated for brevity)`;
}

async function generateBusinessIdeas(painPoints) {
  try {
    const prompt = buildBusinessIdeaPrompt(painPoints);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a business strategist and entrepreneur expert.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return validateBusinessIdeaGeneration(result);
  } catch (err) {
    console.error("Error generating business ideas:", err.message);
    throw new Error(`Business idea generation failed: ${err.message}`);
  }
}

function validateBusinessIdeaGeneration(result) {
  if (!result.businessIdeas || !Array.isArray(result.businessIdeas)) {
    throw new Error("Invalid business idea format");
  }

  return result.businessIdeas.map((idea) => ({
    ideaName: idea.ideaName || "Untitled",
    tagline: idea.tagline || "",
    description: idea.description || "",
    problemStatement: idea.problemStatement || "",
    solutionOverview: idea.solutionOverview || "",
    uniqueValueProposition: idea.uniqueValueProposition || "",
    businessModel: idea.businessModel || "Other",
    marketCategory: idea.marketCategory || "Other",
    keyFeatures: idea.keyFeatures || [],
    differentiators: idea.differentiators || [],
    targetAudience: idea.targetAudience || [],
    revenueStreams: idea.revenueStreams || [],
    technicalFeasibility: idea.technicalFeasibility || {},
    marketFeasibility: idea.marketFeasibility || {},
    financialFeasibility: idea.financialFeasibility || {},
    mvpFeatures: idea.mvpFeatures || [],
    risks: idea.risks || [],
  }));
}

function buildLandingPagePrompt(businessIdea) {
  return `Create a high-converting landing page... (truncated for brevity)`;
}

async function generateLandingPage(businessIdea) {
  try {
    const prompt = buildLandingPagePrompt(businessIdea);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a conversion copywriting expert.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return validateLandingPageGeneration(result);
  } catch (err) {
    console.error("Error generating landing page:", err.message);
    throw new Error(`Landing page generation failed: ${err.message}`);
  }
}

function validateLandingPageGeneration(result) {
  return {
    headline: result.headline || "Default headline",
    subheadline: result.subheadline || "",
    heroSection: result.heroSection || {},
    problemSection: result.problemSection || {},
    solutionSection: result.solutionSection || {},
    bridgeSection: result.bridgeSection || {},
    socialProofSection: result.socialProofSection || {},
    faqSection: result.faqSection || {},
    ctaSections: result.ctaSections || [],
    founderSection: result.founderSection || {},
    seo: result.seo || {},
    lovablePrompt: result.lovablePrompt || "",
  };
}

async function validateContent(content, contentType) {
  try {
    const prompt = `Validate the following ${contentType} content...`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a content validation expert.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("Validation error:", err.message);
    return {
      isValid: false,
      overallScore: 0,
      feedback: {
        strengths: [],
        weaknesses: ["Validation failed"],
        suggestions: ["Manual review required"],
      },
      confidence: 0,
    };
  }
}

module.exports = {
  extractPainPoints,
  generateBusinessIdeas,
  generateLandingPage,
  validateContent,
  getPainPointAssistant,
  getMarketGapAssistant,
  getLandingPageAssistant,
};
