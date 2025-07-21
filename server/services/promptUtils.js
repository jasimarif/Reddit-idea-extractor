// Utility functions for building prompts for LLM agents

function buildPainPointExtractionPrompt(threadContent) {
  return `
  RESPOND ONLY WITH VALID JSON. DO NOT INCLUDE ANY EXPLANATIONS, MARKDOWN, OR COMMENTARY.
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

function buildBusinessIdeaPrompt(painPoints) {
    return `You are an expert Business Opportunity Strategist. Given the following pain points, generate 2-3 unique, actionable business ideas which should necessarily solve the problem defined in summary of the painpoint. Each idea must:

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

module.exports = {
  buildPainPointExtractionPrompt,
  buildBusinessIdeaPrompt,
};
