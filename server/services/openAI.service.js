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
  return `
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
  "quotes": ["...", "...", "..."],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "businessPotential": "High | Medium | Low"
}
\`\`\`

---

Reddit Thread Content:
\`\`\`json
${JSON.stringify(threadContent, null, 2)}
\`\`\`
`.trim();
}

async function extractPainPoints(threadContent) {
  try {
    const assistant = await getPainPointAssistant();
    const prompt = buildPainPointExtractionPrompt(threadContent);

    // Create a thread
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(
      thread.id,
      { assistant_id: assistant.id }
    );

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );

    // Poll for completion
    while (runStatus.status !== 'completed') {
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Assistant run failed with status: ${runStatus.status}`);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessages = messages.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      throw new Error("No response from assistant");
    }

    const content = assistantMessages[0].content[0].text.value;
    let result;
    
    try {
      // Try to extract JSON from the response if it's wrapped in code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      result = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse assistant response:", content);
      throw new Error("Invalid JSON response from assistant");
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
  return `You are an expert Business Opportunity Strategist. Given the following pain points, generate atleast 2-3 unique, actionable business ideas which should necessarily solve the problem defined in summary of the painpoint. Each idea must:

  NOTE: Only generate ideas that solve the summary-level problem. Do not create general solutions or ideas that only address related symptoms.

- Have a clear, descriptive ideaName.
- Be tailored to the specific pain point(s) provided.
- Include a 2-3 sentence description of the idea and how it solves the pain point.
- Write a problemStatement in the user's voice (first person, as if quoting a real user, e.g., "I always forget to...").
- List at least 2 keyFeatures, 2 revenueStreams, 2 implementationSteps, 2 potentialChallenges, and 2 successMetrics, all with concrete, non-placeholder content.
- Include a targetAudience, businessModel (choose from: Freemium, Subscription, Ads, Marketplace, Licensing, One-time purchase, SaaS, Service, Platform, Other), differentiator, useCase (realistic scenario), keywords (array of 3-8 relevant terms), score (float 0-10), and rankingReason (1-2 sentences justifying the score).
- Do NOT repeat the same description or features for each idea.
- Do NOT use generic phrases like "A business opportunity addressing key market needs."
- Each idea must be distinct and creative.
- Use the exact field names: ideaName, description, problemStatement, keyFeatures, revenueStreams, implementationSteps, potentialChallenges, successMetrics, targetAudience, businessModel, differentiator, useCase, keywords, score, rankingReason.
- Each idea must include a field: relatedPainPointTitle (must match one of the pain point summary above).
- Each idea must include a field: howItSolvesPainPoint (explain how the idea addresses the pain point summary).
- Each idea must address a different pain point from the list above.
- Incorporate user quotes and keywords from the pain point in the idea's description or problem statement.

Here are the pain points:
${painPoints
  .map(
    (pp, i) =>
      `${i + 1}. 
Title: ${pp.title}
Description: ${pp.description}
Quotes: ${pp.quotes && pp.quotes.length ? pp.quotes.join("; ") : "None"}
Keywords: ${pp.keywords && pp.keywords.length ? pp.keywords.join(", ") : "None"}
Rankscore: ${pp.rankScore}
summary: ${pp.summary}
category: ${pp.category}
Intensity: ${pp.intensity}
Urgency: ${pp.urgency}
`
  )
  .join("\n\n")}

EXAMPLE OUTPUT:
{
  "businessIdeas": [
    {
      "ideaName": "Wellness Reminder App",
      "description": "An app that sends personalized wellness reminders based on individual health goals and schedules. Users can set up notifications for hydration, stretching, mindfulness breaks, and nutrition tips. This addresses the pain point of forgetting to prioritize self-care in busy daily routines.",
      "problemStatement": "I know I need to take care of my health, but I just get too busy and forget to drink water or stretch.",
      "targetAudience": "Busy professionals and individuals with health and wellness goals",
      "businessModel": "Freemium",
      "revenueStreams": ["In-app purchases", "Premium subscription for advanced tracking"],
      "keyFeatures": [
        "Personalized reminders",
        "Tracking and progress monitoring",
        "Smart scheduling based on calendar"
      ],
      "implementationSteps": [
        "Design UI/UX for reminder customization",
        "Integrate with phone calendar and health APIs",
        "Build reminder engine with personalization logic"
      ],
      "potentialChallenges": ["User notification fatigue", "Calendar integration complexity"],
      "successMetrics": ["Daily active users", "Retention after 30 days", "Reminder response rate"],
      "differentiator": "Unlike generic reminder apps, this adapts to user routines and combines wellness domains (hydration, mindfulness, nutrition)",
      "useCase": "A remote worker gets reminders to stretch and drink water between meetings, reducing back pain and fatigue.",
      "keywords": ["hydration", "self-care", "health tracking", "productivity"],
      "score": 8.7,
      "rankingReason": "Frequent pain point on Reddit, clear target market, and high engagement potential with freemium model."
    }
  ]
}
Return your response as a JSON object with a 'businessIdeas' array. Do not include any explanations or text outside the JSON object.`;
}

async function generateBusinessIdeas(painPoints) {
  try {
    // Try to use the marketGap assistant if available
    let assistant;
    try {
      assistant = (await assistantManager.getOrCreateAssistant)
        ? await assistantManager.getOrCreateAssistant("marketGap")
        : assistantManager.getMarketGapAssistant &&
          (await assistantManager.getMarketGapAssistant());
    } catch (e) {
      assistant = null;
    }

    const prompt = buildBusinessIdeaPrompt(painPoints);

    if (assistant && assistant.id) {
      // Use OpenAI Assistant API
      const thread = await openai.beta.threads.create({
        messages: [{ role: "user", content: prompt }],
      });
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });
      // Poll for completion
      let runStatus = run.status;
      let runResult = run;
      let attempts = 0;
      while (
        runStatus !== "completed" &&
        runStatus !== "failed" &&
        attempts < 30
      ) {
        await new Promise((res) => setTimeout(res, 1000));
        runResult = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        runStatus = runResult.status;
        attempts++;
      }
      if (runStatus !== "completed") {
        throw new Error("Assistant run did not complete");
      }
      // Get the latest message from the thread
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMsg =
        messages.data && messages.data.length
          ? messages.data[messages.data.length - 1]
          : null;
      let result;
      if (
        lastMsg &&
        lastMsg.content &&
        lastMsg.content.length &&
        lastMsg.content[0].type === "text"
      ) {
        try {
          result = JSON.parse(lastMsg.content[0].text.value);
        } catch (e) {
          throw new Error("Failed to parse assistant response as JSON");
        }
      } else {
        throw new Error("No valid message from assistant");
      }
      return validateBusinessIdeaGeneration(result);
    } else {
      // Fallback to direct chat completion
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `
          You are a Senior Venture Architect specializing in pain-point-driven innovation. Your role:
          
          1. OUTPUT FORMAT:
          - Never add commentary outside the JSON structure
          
          2. IDEA GENERATION PRINCIPLES:
          - Each idea must directly solve at least one specified pain point
          - Include disruptive elements (tech/business model/process)
          - Demonstrate clear path to profitability
          - Reference specific user quotes where applicable
          
          3. QUALITY CONTROL:
          - Reject generic "me-too" concepts
          - Validate technical feasibility mentally before proposing
          - Ensure differentiation from existing solutions
          `,
          },

          { role: "user", content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      const result = JSON.parse(response.choices[0].message.content);
      return validateBusinessIdeaGeneration(result);
    }
  } catch (err) {
    console.error("Error generating business ideas:", err.message);
    throw new Error(`Business idea generation failed: ${err.message}`);
  }
}

function validateBusinessIdeaGeneration(result) {
  try {
    const allowedBusinessModels = [
      "Freemium",
      "Subscription",
      "One-time Purchase",
      "Licensing",
      "Marketplace",
      "B2B SaaS",
      "Consulting",
      "Service",
      "Platform",
      "Hybrid",
      "Other",
    ];
    const ideasArray = Array.isArray(result)
      ? result
      : result.businessIdeas && Array.isArray(result.businessIdeas)
      ? result.businessIdeas
      : [];

    if (ideasArray.length === 0) {
      console.warn("No business ideas found in the AI response");
      // Return a default idea to prevent complete failure
      return [
        {
          ideaName: "Innovative Business Concept",
          description:
            "A promising business opportunity based on the provided pain points.",
          problemStatement: "No user-voiced pain point provided.",
          keyFeatures: ["Feature 1", "Feature 2"],
          revenueStreams: ["Subscription fees", "Ad revenue"],
          implementationSteps: ["Develop MVP", "Launch marketing campaign"],
          potentialChallenges: ["Market competition", "User adoption"],
          successMetrics: ["Monthly active users", "Revenue growth"],
          targetAudience: "General audience",
          personas: ["General audience"],
          businessModel: "Other",
          differentiator: "Default differentiator.",
          useCase: "Default use case.",
          keywords: [],
          tags: [],
          score: 5.0,
          rankingReason: "Default ranking reason.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    // Helper: Generate keywords from title, problemStatement, keyFeatures
    function generateKeywords(idea) {
      const text = [
        idea.ideaName,
        idea.problemStatement,
        ...(idea.keyFeatures || []),
      ]
        .join(" ")
        .toLowerCase();
      const words = text.match(/\b[a-z]{4,}\b/g) || [];
      const freq = {};
      words.forEach((w) => {
        freq[w] = (freq[w] || 0) + 1;
      });
      const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
      return sorted.slice(0, 8);
    }

    // Helper: Map businessModel to controlled vocab
    function fixBusinessModel(bm) {
      if (!bm) return "Other";
      const map = {
        freemium: "Freemium",
        subscription: "Subscription",
        "one-time": "One-time Purchase",
        onetime: "One-time Purchase",
        licensing: "Licensing",
        marketplace: "Marketplace",
        "b2b saas": "B2B SaaS",
        saas: "B2B SaaS",
        consulting: "Consulting",
        service: "Service",
        platform: "Platform",
        hybrid: "Hybrid",
      };
      const lower = String(bm).toLowerCase();
      for (const [k, v] of Object.entries(map)) {
        if (lower.includes(k)) return v;
      }
      return allowedBusinessModels.includes(bm) ? bm : "Other";
    }

    // Helper: Smart defaults for revenueStreams
    function getDefaultRevenueStreams(title) {
      if (/assessment|tool|test|score|analy/i.test(title))
        return [
          "One-time assessment fees",
          "Monthly report subscriptions",
          "White-labeled B2B licensing",
        ];
      if (/coaching|platform|builder|training|mentorship|coach/i.test(title))
        return [
          "Monthly subscriptions",
          "Corporate training packages",
          "One-on-one coaching upgrades",
        ];
      if (/roundtable|community|network|peer/i.test(title))
        return [
          "Subscription fees",
          "Premium access to exclusive events",
          "Sponsored sessions",
        ];
      if (/retreat|event|summit|conference/i.test(title))
        return [
          "One-time event ticket sales",
          "Premium access packages",
          "Sponsorships",
        ];
      return ["Subscription fees", "Ad revenue"];
    }

    // Helper: Smart defaults for implementationSteps
    function generateImplementationSteps(title) {
      if (/assessment|tool|test|score|analy/i.test(title))
        return [
          "Market research and validation",
          "Define competency framework and scoring model",
          "Design assessment UX",
          "Develop personalized reporting engine",
          "Beta test with 50 executives",
        ];
      if (/coaching|platform|builder|training|mentorship|coach/i.test(title))
        return [
          "Market research and validation",
          "Develop skill assessment logic and coaching curriculum",
          "Recruit certified executive coaches",
          "Build scheduling and tracking backend",
          "Launch with beta cohort",
        ];
      if (/roundtable|community|network|peer/i.test(title))
        return [
          "Market research and validation",
          "Create onboarding flow for group matching",
          "Build real-time video integration",
          "Hire facilitators for moderation",
          "Launch pilot with 10–15 CEOs",
        ];
      if (/retreat|event|summit|conference/i.test(title))
        return [
          "Secure venue and partners",
          "Design event agenda and content",
          "Market to target audience",
          "Open ticket sales",
          "Host event and gather feedback",
        ];
      return [
        "Market research and validation",
        "Develop MVP",
        "Launch closed beta",
        "Gather feedback, iterate features",
        "Launch public beta",
        "Begin paid advertising and outbound sales",
      ];
    }

    // Helper: Smart defaults for potentialChallenges
    function generatePotentialChallenges(title) {
      if (/assessment|tool|test|score|analy/i.test(title))
        return [
          "Ensuring accuracy and objectivity in scoring",
          "Convincing time-strapped CEOs to complete assessments",
          "Data privacy compliance",
        ];
      if (/coaching|platform|builder|training|mentorship|coach/i.test(title))
        return [
          "Retaining top-tier coaching talent",
          "Ensuring curriculum personalization at scale",
          "High CAC for C-level users",
        ];
      if (/roundtable|community|network|peer/i.test(title))
        return [
          "Matching users in meaningful peer groups",
          "Avoiding drop-offs in live session attendance",
          "Moderation quality control",
        ];
      if (/retreat|event|summit|conference/i.test(title))
        return [
          "Venue logistics and costs",
          "Attracting high-value attendees",
          "Standing out in a crowded event market",
        ];
      return ["Market competition", "User adoption hurdles"];
    }

    // Helper: Smart defaults for successMetrics
    function generateSuccessMetrics(title) {
      if (/assessment|tool|test|score|analy/i.test(title))
        return [
          "Assessment completion rate",
          "Repeat usage for benchmarking",
          "Accuracy of skill improvement recommendations",
        ];
      if (/coaching|platform|builder|training|mentorship|coach/i.test(title))
        return [
          "Session completion rate",
          "Monthly active users",
          "NPS (Net Promoter Score)",
          "Skill improvement over 90 days",
        ];
      if (/roundtable|community|network|peer/i.test(title))
        return [
          "Peer group retention rate",
          "Engagement in live sessions",
          "Feedback quality score from participants",
        ];
      if (/retreat|event|summit|conference/i.test(title))
        return ["Tickets sold", "Attendee NPS", "Repeat attendance rate"];
      return ["Monthly active users", "Revenue growth"];
    }

    // Helper: Smart ranking reason
    function generateRankingReason(title, score) {
      if (/assessment|tool|test|score|analy/i.test(title))
        return "High clarity and focus. Differentiated by data-driven insights, but could be challenging to keep assessments objective and widely adopted.";
      if (/coaching|platform|builder|training|mentorship|coach/i.test(title))
        return "Addresses a clearly expressed need among CEOs for structured leadership growth. High value but may face challenges in content personalization and coaching scalability.";
      if (/roundtable|community|network|peer/i.test(title))
        return "Peer learning for CEOs is highly relevant and emotionally resonant. Requires strong moderation and curation to retain quality.";
      if (/retreat|event|summit|conference/i.test(title))
        return "High-value networking and learning, but event logistics and market competition are significant risks.";
      if (score >= 8)
        return "High novelty and experiential value, but implementation complexity or market education may limit adoption in the short term.";
      if (score >= 6)
        return "Solid value, but may face competition or execution hurdles.";
      return "Moderate ranking due to high-value target audience and clear problem-solution fit, but may face scalability or cost barriers in execution.";
    }

    // Helper: Persona enrichment
    function enrichPersonas(targetAudience) {
      const personas = [];
      if (!targetAudience) return ["General audience"];
      const lower = targetAudience.toLowerCase();
      if (lower.includes("startup") || lower.includes("founder"))
        personas.push("Startup founders");
      if (
        lower.includes("female") ||
        lower.includes("woman") ||
        lower.includes("women")
      )
        personas.push("Female founders");
      if (lower.includes("ceo")) personas.push("CEOs");
      if (lower.includes("executive")) personas.push("Executives");
      if (lower.includes("series a") || lower.includes("series b"))
        personas.push("Venture-backed founders");
      if (lower.includes("hypergrowth")) personas.push("Hypergrowth leaders");
      if (lower.includes("under 50")) personas.push("Small company leaders");
      if (lower.includes("tech")) personas.push("Tech industry");
      if (personas.length === 0) personas.push(targetAudience);
      return personas;
    }

    // Helper: Tags field
    function generateTags(idea, businessModel, keywords) {
      const tags = new Set();
      if (businessModel) tags.add(businessModel);
      if (Array.isArray(keywords)) keywords.forEach((k) => tags.add(k));
      if (idea.category) tags.add(idea.category);
      if (idea.subCategory) tags.add(idea.subCategory);
      if (idea.keyFeatures)
        idea.keyFeatures.forEach((f) =>
          tags.add(f.toLowerCase().split(" ").slice(0, 2).join(" "))
        );
      return Array.from(tags).slice(0, 10);
    }

    return ideasArray.map((idea, index) => {
      // Business model normalization
      let businessModel = fixBusinessModel(idea.businessModel);

      // User-voiced problem statement
      let problemStatement = idea.problemStatement || "";
      if (
        !problemStatement ||
        problemStatement.trim().length < 8 ||
        problemStatement
          .toLowerCase()
          .includes("this solution specifically targets") ||
        problemStatement === idea.description
      ) {
        problemStatement =
          idea.description && idea.description.length < 120
            ? idea.description
            : "User pain point not clearly stated.";
      }

      // Keywords
      let keywords =
        Array.isArray(idea.keywords) && idea.keywords.length
          ? idea.keywords
          : generateKeywords(idea);

      // Score
      let score = typeof idea.score === "number" ? idea.score : 5.0;
      if (score < 0 || score > 10) score = 5.0;

      // Ranking reason
      let rankingReason =
        idea.rankingReason && idea.rankingReason.trim()
          ? idea.rankingReason
          : generateRankingReason(idea.ideaName || "", score);

      // UseCase
      let useCase =
        idea.useCase &&
        idea.useCase.trim() &&
        !idea.useCase.startsWith("Example use case")
          ? idea.useCase.trim()
          : idea.description
          ? `For example: ${idea.description.slice(0, 80)}...`
          : "";

      // Key features
      const keyFeatures =
        Array.isArray(idea.keyFeatures) && idea.keyFeatures.length
          ? idea.keyFeatures
          : [];

      // Smart defaults for MVP fields
      const revenueStreams =
        Array.isArray(idea.revenueStreams) && idea.revenueStreams.length
          ? idea.revenueStreams
          : getDefaultRevenueStreams(idea.ideaName || "");
      const implementationSteps =
        Array.isArray(idea.implementationSteps) &&
        idea.implementationSteps.length
          ? idea.implementationSteps
          : generateImplementationSteps(idea.ideaName || "");
      const potentialChallenges =
        Array.isArray(idea.potentialChallenges) &&
        idea.potentialChallenges.length
          ? idea.potentialChallenges
          : generatePotentialChallenges(idea.ideaName || "");
      const successMetrics =
        Array.isArray(idea.successMetrics) && idea.successMetrics.length
          ? idea.successMetrics
          : generateSuccessMetrics(idea.ideaName || "");

      // Persona enrichment
      let targetAudience = idea.targetAudience || "General audience";
      const personas = enrichPersonas(targetAudience);

      // Tags
      const tags = generateTags(idea, businessModel, keywords);

      return {
        ideaName: idea.ideaName || `Business Idea ${index + 1}`,
        description: idea.description || "No description provided.",
        problemStatement,
        keyFeatures,
        revenueStreams,
        implementationSteps,
        potentialChallenges,
        successMetrics,
        targetAudience,
        personas,
        businessModel,
        differentiator: idea.differentiator || "",
        useCase,
        keywords,
        tags,
        score,
        rankingReason,
        createdAt: idea.createdAt || new Date().toISOString(),
        updatedAt: idea.updatedAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error("Error in validateBusinessIdeaGeneration:", error);
    // Return a default idea to prevent complete failure
    return [
      {
        ideaName: "Business Concept",
        description:
          "A promising business opportunity based on the provided pain points.",
        problemStatement: "No user-voiced pain point provided.",
        keyFeatures: ["Feature 1", "Feature 2"],
        revenueStreams: ["Subscription fees", "Ad revenue"],
        implementationSteps: ["Develop MVP", "Launch marketing campaign"],
        potentialChallenges: ["Market competition", "User adoption hurdles"],
        successMetrics: ["Monthly active users", "Revenue growth"],
        targetAudience: "General audience",
        personas: ["General audience"],
        businessModel: "Other",
        differentiator: "Default differentiator.",
        useCase: "Default use case.",
        keywords: [],
        tags: [],
        score: 5.0,
        rankingReason: "Default ranking reason.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
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
