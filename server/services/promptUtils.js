
function buildPainPointExtractionPrompt(threadContent) {
  return `
  RESPOND ONLY WITH VALID JSON. DO NOT INCLUDE ANY EXPLANATIONS, MARKDOWN, OR COMMENTARY.
    I'm analyzing Reddit conversations to identify common pain points and problems within a specific market. By extracting authentic user language from Reddit threads, I aim to understand the exact problems potential customers are experiencing in their own words. This analysis will help me identify market gaps and opportunities for creating solutions that address real user needs. The extracted insights will serve as the foundation for product development and marketing messages that speak directly to the target audience using language that resonates with them.
    Agent 1 Prompt - Pain Point Extractor (Enhanced for Business & Content Strategy)
Role: Market Pain Point Analyst
Your job is to extract real, actionable pain points from Reddit posts. These should reflect unmet needs, inefficiencies, frustrations, or recurring desires that can lead to either business opportunities or content ideas.

🔎 Instructions:
Group and deduplicate similar pain points across posts.

Only include pain points that are:

Clearly described

Experienced by a group of users, not just one person

Potentially solvable through:

A product, service, or automation, OR

Content, education, or community support

Rank each pain point from 1 to 5, based on:

Severity of the problem

Frequency of mention across posts

Viability of addressing it commercially or through content

🚫 Exclude:
Vague or highly emotional rants with no actionable theme

Pain points too specific to one user's unique situation

One-off lifestyle complaints without repeatability

    
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
    ### Pain Point: [Concise title]
- *Description:* [Summarize the user's problem clearly and objectively]
- *Severity Score:* [1-5]
- *Why it's valuable:* [Explain why this is worth solving or addressing publicly]
- *Suggested Path:* [“Business Idea” or “Content Idea” or “Not Viable”]
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
    
    ---
    
    Reddit Thread Content:
    \`\`\`json
    ${JSON.stringify(threadContent, null, 2)}
    \`\`\`
    `.trim();
}

function buildBusinessIdeaPrompt(painPoints) {
  return `You are an expert Business Opportunity Strategist. Given the following pain points, generate atleast 2-3 unique, actionable business ideas which should necessarily solve the problem defined in summary of the painpoint. Each idea must:

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

    Role: Business Opportunity & Content Strategist
You are a Business and Content Idea Strategist. You'll receive real-world market pain points and your task is to generate either business ideas or content ideas — depending on what best fits the pain point.

🔐 Gatekeeping Instructions
If a pain point is too vague, overly personal, or lacks scalable potential:

Do not create an idea.

Label it as:
### ❌ Not Viable: [Pain Point Title]

Reason: [Clear explanation]

✅ When Viable, Choose the Best Path:
If the pain point is:

Specific + repeatable → Generate a Business Idea

Widespread but better addressed through education, awareness, or storytelling → Generate a Content Idea

📦 For Business Ideas, use multiple strategic lenses:
Market Segmentation (underserved groups, niche use cases)

Product Differentiation (simple vs premium)

Business Model Innovation (SaaS, marketplace, freemium)

Distribution & Marketing (SEO, influencers, partnerships)

New Paradigms (AI, regulation, automation)

📽 For Content Ideas, focus on:
Pain point education (help users understand or overcome a challenge)

Relatable storytelling (content that builds emotional connection)

Community building (forums, podcasts, social movements)

Monetizable formats (YouTube, newsletters, mini-courses)

### Content Idea: [Catchy/Engaging Title]
- *Based on Pain Point:* [Original pain point or user quote]
- *Format:* [YouTube Series, Blog, Newsletter, Podcast, Course]
- *Theme/Angle:* [Key message or hook]
- *Target Audience:* [Who it's for]
- *Distribution Strategy:* [SEO, Reddit, TikTok, Email, etc.]
- *Monetization (Optional):* [Ad revenue, Substack, Patreon, etc.]
If Not Viable:

### ❌ Not Viable: [Pain Point Title]
- *Reason:* [Why it can't scale or apply broadly]

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
  
  Here are the pain points:
  ${painPoints
    .map(
      (pp, i) =>
        `${i + 1}. 
  Title: ${pp.title}
  Description: ${pp.description}
  Quotes: ${pp.quotes && pp.quotes.length ? pp.quotes.join("; ") : "None"}
  Keywords: ${
    pp.keywords && pp.keywords.length ? pp.keywords.join(", ") : "None"
  }
  Rankscore: ${pp.rankScore}
  summary: ${pp.summary}
  category: ${pp.category}
  Intensity: ${pp.intensity}
  Urgency: ${pp.urgency}
  subreddit: ${pp.subreddit}
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
        "differentiators": "Unlike generic reminder apps, this adapts to user routines and combines wellness domains (hydration, mindfulness, nutrition)",
        "useCase": "A remote worker gets reminders to stretch and drink water between meetings, reducing back pain and fatigue.",
        "keywords": ["hydration", "self-care", "health tracking", "productivity"],
        "overallScore": 8.7,
        "feasibilityScore": 8.7,
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
