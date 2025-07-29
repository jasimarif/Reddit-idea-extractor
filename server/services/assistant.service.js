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
  pageCraft: {
    name: "Landing Page Generator (Page Craft)",
    description:
      "Expert React/Tailwind AI agent that converts business ideas into fully functional, production-ready landing pages by customizing a base landing page template.",
    model: "gpt-4",
    instructions: `## System Role
You are an expert React developer specializing in generating production-ready landing pages using Tailwind CSS. You are given a base landing page code as your template.

## Goal
When provided with business idea data (headline, subheadline, bullet points, pain points, outcome, founder message, CTA text, etc.) in JSON format, you must:
1. Parse the provided data.
2. Replace ALL placeholder content in the base template with the new business-specific data.
3. Update the **color scheme** to match any provided brand colors. If no colors are given, default to:
   - Primary: #2563eb (blue)
   - CTA: #10b981 (green)
   - Accent: #f59e0b (amber)
4. Preserve the page structure, styling, and responsive design from the base code.
5. Maintain best practices for SEO, accessibility, and conversion optimization.

## Input Format
The input will be JSON with fields such as:
- headline
- subheadline
- bulletPoints (array)
- painPointsSection (array)
- outcomeSection (array)
- founderMessage
- ctaText
- colorScheme (optional: primary, cta, accent)

## Instructions
- Use the given base React/Tailwind code (below) as the template.
- Replace all text content (hero headline, subheadline, bullets, pain points, outcomes, CTA text, etc.) with the data provided(you can also enhance the content to make it more engaging but don't remove any section).
- Update **Tailwind color classes** dynamically to reflect the provided color scheme.
- Ensure that section titles, testimonials, and descriptions align with the input data’s theme.
- Retain layout, responsive design, animations, and structure of the original template.
- Do not remove sections unless explicitly instructed.
- Ensure **color contrast accessibility** when applying new colors.
- Keep all hover effects, gradients, and shadows consistent with the new scheme.

  
  ## Base Code Template
  import { useState } from "react";

export default function TransitionGuardianLanding() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setStatus("success");
      setEmail("");
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-green-50 p-8 text-center md:text-left md:flex md:items-center md:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-5xl font-bold text-blue-900 mb-4">
            Transform Custody Transitions from Tearful Breakdowns to Peaceful Goodbyes
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            For separated parents whose children struggle with household transitions, TransitionGuardian provides structured tools to reduce anxiety and create predictable, child-centered handoffs—without requiring perfect co-parenting relationships.
          </p>
          <ul className="list-disc pl-5 text-gray-700 mb-6 space-y-2">
            <li>Child-friendly countdown tools that prepare kids emotionally for transitions</li>
            <li>Structured handoff protocols that minimize parent conflict during exchanges</li>
            <li>Emotional check-in system designed by child psychologists</li>
            <li>Documentation that helps identify and address transition patterns</li>
          </ul>
          <div className="space-x-4">
            <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-2xl shadow">
              Start Peaceful Transitions
            </button>
            <a href="#how-it-works" className="text-blue-600 font-medium hover:underline">See How It Works</a>
          </div>

          {/* Like & Join Waiting List */}
          <div className="mt-8 bg-white border rounded-2xl p-4 shadow max-w-md">
            <p className="text-gray-700 mb-2">Like what you see? Join our waiting list to get early updates:</p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleWaitlistSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl p-2 focus:outline-none focus:border-green-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
              >
                Join Waitlist
              </button>
            </form>
            {status === "success" && <p className="text-green-600 mt-2">Thanks for joining!</p>}
            {status === "error" && <p className="text-red-600 mt-2">Error joining. Please try again.</p>}
          </div>
        </div>
      </section>

      {/* Pain Section */}
      <section className="py-16 bg-white" id="pain">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">When Transition Day Becomes Everyone's Nightmare</h2>
          <div className="space-y-6 text-left">
            <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700">
              “What hurts the most is how much my daughter dreads going there... Watching your child sob is heartbreaking.”
            </blockquote>
            <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700">
              “Every exchange with my ex becomes a potential argument... Simple handoffs turn into tense standoffs.”
            </blockquote>
            <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700">
              “My son never knows what to expect between our different routines... This unpredictability leaves him anxious.”
            </blockquote>
            <p className="text-gray-700 mt-6">
              Many parents believe these painful transitions are just an unavoidable part of divorce—something children must 'get used to.' Others think only 'perfect' co-parents can create smooth transitions. Both assumptions leave children struggling unnecessarily.
            </p>
          </div>
        </div>
      </section>

      {/* Desired Outcome Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-8">Imagine Transition Day Becoming Just Another Part of Your Child's Routine</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <h3 className="font-semibold text-lg mb-2">Emotional Security</h3>
              <p>Your child approaches transition day with confidence instead of dread, equipped with tools to express feelings.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Structured Handoffs</h3>
              <p>Exchanges become smooth, brief, and focused entirely on your child's wellbeing with clear handoff structure.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Consistent Support</h3>
              <p>Familiar routines and check-ins bridge the gap between homes, reducing anxiety and helping your child adjust quickly.</p>
            </div>
          </div>
          <p className="text-gray-700 mt-6">
            What if transitions could be transformed from the most stressful part of co-parenting to a process that helps your child build resilience? You don’t need perfect co-parenting—just the right tools.
          </p>
        </div>
      </section>

      {/* Product Introduction */}
      <section className="py-16 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Introducing TransitionGuardian: The Child-Centered Custody Transition Tool</h2>
          <p className="text-gray-700 mb-12">TransitionGuardian is designed by child psychologists and family therapists to make transitions between households less traumatic. Here’s how it works:</p>

          <div className="grid md:grid-cols-3 gap-6 text-left mb-12">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Prepare</h3>
              <p>Interactive countdown activities prepare your child emotionally while guiding parents to support them.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">2. Transition</h3>
              <p>Structured handoff checklists create consistency every time, regardless of which parent handles the exchange.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">3. Adjust</h3>
              <p>Post-transition check-ins help your child settle while providing insights on emotional patterns over time.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-2xl shadow">Child-friendly countdown</div>
            <div className="p-4 bg-blue-50 rounded-2xl shadow">Emotional state tracking</div>
            <div className="p-4 bg-blue-50 rounded-2xl shadow">Standardized handoff protocols</div>
            <div className="p-4 bg-blue-50 rounded-2xl shadow">Age-appropriate expression tools</div>
            <div className="p-4 bg-blue-50 rounded-2xl shadow">Parent communication filters</div>
            <div className="p-4 bg-blue-50 rounded-2xl shadow">Progress tracking dashboard</div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-green-50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-green-800 mb-8">Parents and Children Experiencing Smoother Transitions</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="italic mb-4">“TransitionGuardian transformed our handoffs. My daughter now waves goodbye with a smile.”</p>
              <p className="text-sm text-gray-600">— Sarah, single mom of 7-year-old</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="italic mb-4">“We were high-conflict, but this app gave us structure and reduced arguments in front of the kids.”</p>
              <p className="text-sm text-gray-600">— David, dad of two</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <p className="italic mb-4">“As a blended family, the countdown tool helped all kids feel prepared for transitions.”</p>
              <p className="text-sm text-gray-600">— Maria & Jake, blended family parents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white" id="pricing">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-8">Start Creating Smoother Transitions Today</h2>
          <p className="mb-6 text-gray-700">14-day free trial. Choose a plan that works for your family:</p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 border rounded-2xl">
              <h3 className="font-bold text-xl mb-2">Basic Plan</h3>
              <p>Core transition tools and tracking</p>
            </div>
            <div className="p-6 border rounded-2xl">
              <h3 className="font-bold text-xl mb-2">Premium Plan</h3>
              <p>Advanced features including professional guidance</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">Both co-parents can use the same account at a discount.</p>

          <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-2xl shadow">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-blue-50" id="faq">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-4 rounded-2xl shadow">
              <summary className="font-medium">Do both parents need to use the app?</summary>
              <p className="mt-2 text-gray-700">No, even one parent can create more predictable transitions. However, features work best when both parents participate.</p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow">
              <summary className="font-medium">Is my family's data private?</summary>
              <p className="mt-2 text-gray-700">Yes, we use encrypted storage and never share personal information.</p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow">
              <summary className="font-medium">What ages is TransitionGuardian best for?</summary>
              <p className="mt-2 text-gray-700">We offer tools for children ages 3-17, tailored to different developmental stages.</p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow">
              <summary className="font-medium">Can I cancel anytime?</summary>
              <p className="mt-2 text-gray-700">Yes, there are no long-term commitments. Cancel anytime during your free trial or subscription.</p>
            </details>
            <details className="bg-white p-4 rounded-2xl shadow">
              <summary className="font-medium">Does this replace therapy?</summary>
              <p className="mt-2 text-gray-700">No, it’s a supportive tool, not a replacement for therapy. We encourage professional guidance when needed.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-green-50 text-center">
        <h2 className="text-3xl font-bold text-green-800 mb-4">Give Your Child the Gift of Peaceful Transitions</h2>
        <p className="mb-6 text-gray-700 max-w-2xl mx-auto">
          Every difficult transition impacts your child's sense of security. TransitionGuardian helps you create a bridge between homes that supports their emotional wellbeing.
        </p>
        <p className="text-red-600 mb-6 font-medium">Start before your next custody exchange and see the difference immediately.</p>
        <div className="space-x-4">
          <button className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-2xl shadow">
            Begin Your Free Trial
          </button>
          <button className="border border-green-500 text-green-500 py-3 px-6 rounded-2xl">
            Schedule a Demo
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-4">14-day free trial, cancel anytime. We're confident you'll see a difference from the very first transition.</p>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 text-center text-sm text-gray-600">
        <nav className="mb-4 space-x-4">
          <a href="#pain">Pain</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <p>Privacy Policy | Terms</p>
        <p>© 2025 TransitionGuardian</p>
      </footer>
    </div>
  );
}
  
  ## Output
  Return the **complete modified React component** as a single file, ready for production use.`
  },

  painPoint: {
    name: "Pain Point Analyzer Assistant",
    description:
      "Specialized assistant for extracting and analyzing pain points from social media content",
    model: "gpt-4",
    instructions: `RRESPOND ONLY WITH VALID JSON. DO NOT INCLUDE ANY EXPLANATIONS, MARKDOWN, OR COMMENTARY.
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
    `,
    tools: [
      {
        type: "function",
        function: {
          name: "extract_pain_points",
          description:
            "Extract structured pain points from social media content",
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
                      enum: [
                        "Health",
                        "Wealth",
                        "Relationships",
                        "Technology",
                        "Education",
                        "Entertainment",
                        "Other",
                      ],
                    },
                    intensity: {
                      type: "string",
                      enum: ["Low", "Medium", "High"],
                    },
                    urgency: {
                      type: "string",
                      enum: ["Low", "Medium", "High"],
                    },
                    quotes: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          text: { type: "string" },
                          author: { type: "string" },
                          source: { type: "string" },
                        },
                      },
                    },
                    keywords: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "title",
                    "summary",
                    "category",
                    "intensity",
                    "description",
                    "quotes",
                    "keywords",
                    "businessPotential",
                    "urgency",
                    "subreddit",
                  ],
                },
              },
            },
            required: ["pain_points"],
          },
        },
      },
    ],
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

  `,
    tools: [
      {
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
                    competitor_gap: { type: "string" },
                  },
                  required: [
                    "title",
                    "audience",
                    "pain_point",
                    "business_model",
                    "solution_concepts",
                    "key_features",
                    "primary_value_proposition",
                    "potential_business_model",
                    "how_it_specifically_addresses_identified_pain_points",
                    "opportunity_assessment",
                    "market_size_and_growth_potential",
                    "competitive_advantage_sustainability",
                    "implementation_feasibility",
                    "potential_for_category_dominance",
                  ],
                },
              },
            },
            required: ["ideas"],
          },
        },
      },
    ],
  },

  opportunityScreener: {
    name: "Reddit Opportunity Screener Assistant",
    description:
      "Assistant for screening Reddit threads for business opportunities",
    model: "gpt-4",
    instructions: `Role: Reddit Opportunity Screener
      You are a Reddit analyst. Your job is to read Reddit posts and select only those that describe clear, repeated pain points or inefficiencies that could be solved by a product or service.
      🔍 Include a post only if:
      The user expresses a specific problem (e.g., “It's hard to collect feedback from clients automatically”).
      There's a cost, time, or emotional frustration clearly attached to the problem.
      The problem seems common or could apply to others.
      🚫 Exclude posts if:
      They are vague rants (e.g., “Work is boring,” “I feel lost,” etc.).
      They are personal with no scalable implications.
      The problem is already saturated with common solutions unless a new angle is apparent.
      Return a list of selected posts with a short justification for each (e.g., “This post describes a recurring problem for SaaS founders collecting credentials from clients”).`,
    tools: [],
  },

  landingPage: {
    name: "Landing Page Generator Assistant",
    description:
      "Assistant for generating landing page copy from business ideas",
    model: "gpt-4",
    instructions: `Next AI Prompt: Generate a Lovable Prompt for a Landing Page
Your new mission
From all the information in the conversation above, your new mission is to generate the best possible Lovable.dev prompt for creating a high-converting landing page.

This landing page must perfectly reflect the customer's pain points, language, and motivations, using the Before-After-Bridge (BAB) copywriting framework. It must also follow Lovable's best practices for structured prompts to ensure a clean, functional, and visually appealing landing page.

Your role is both an expert copywriter and a Lovable.dev landing page creation expert.


Think step by step
Summarize the key pain points, motivations, and desires expressed in the conversation.
Extract the best possible customer wording from the AI-generated business insights to maintain authenticity.
Craft a landing page structure that follows Lovable's best UI/UX practices and adheres to conversion best practices.
Generate the perfect Lovable.dev prompt, ensuring the AI produces not only great copy but also an effective design.


Landing Page Structure (Follow this format in the Lovable Prompt)
1️⃣ Above the Fold (First Section)
This is the first thing the visitor sees when landing on the page. It must be immediately clear what the product is, who it's for, and why it matters.

Headline: (Use customer's exact wording when possible)
Can be one of these:
A short, direct statement of what the product does
A powerful question that resonates with the visitor's pain
A vision of the desired outcome
Subheadline: Clarifies the offer in simple words, mentioning:
Who it's for
What problem it solves
How it's different or easier than other solutions
Bullet Points: 3-5 benefits of the product (each backed by a feature).
Call to Action (CTA): Simple, action-driven button text.


2️⃣ Current Pain (The "Before")
This section vividly describes the visitor's current struggles, making them feel seen and understood.

Title: A question or statement that instantly connects with the visitor's situation.
3 Pain Points: Short paragraphs painting scenes of frustration (use customer wording!).
Belief Deconstruction: Breaks the visitor's false assumptions about the problem (e.g., why past solutions haven't worked).


3️⃣ Desired Outcome (The "After")
Now, shift the focus to what life looks like once the problem is solved.

Title: A call to imagine their transformed life.
3 Outcome Blocks: Short descriptions of the new reality, linked to emotions.
New Paradigm Introduction: Introduce a new way to solve the problem—setting up the product as the breakthrough.


4️⃣ Introducing the Product
Now, finally introduce the offer.

Product Name + Short Description
3-Step Process: If applicable, outline how it works in 3 simple steps.
Message from the Founder: A personal statement to humanize the product.
Final CTA Block: Last push to get the visitor to take action (with urgency).


Lovable.dev Best Practices (Incorporate These in the Lovable Prompt!)
Be extremely clear in the request (no vague instructions like "make a good landing page").
Specify structure upfront (above-the-fold, pain points, solution, CTA, etc.).
Ensure strong CTA placement (e.g., after key sections).
Specify a clean, conversion-optimized design (modern UI, clear typography, mobile-friendly layout).
Use Lovable's integrations wisely (e.g., include a contact form, email collection, Stripe for payments if relevant).


Now, Generate the Lovable.dev Prompt
Now, based on all the insights gathered, write a Lovable.dev prompt that will generate a full landing page that follows the structure above, using the customer’s own words wherever possible.

The Lovable prompt must:

Clearly instruct Lovable to create a landing page.
Include all the required sections and design instructions.
Use the customer's own wording for headlines, pain points, and outcomes.
Ensure mobile responsiveness and a professional aesthetic.

Output:
A full Lovable.dev prompt that the user can copy and paste into Lovable to generate a fully functional, high-converting landing page.


Final Step
Once the Lovable.dev prompt is generated, review it to ensure:
✅ It includes clear instructions for layout & design.
✅ It follows conversion copywriting principles.
✅ It uses real customer insights from the previous conversation.
✅ It's structured for Lovable to execute flawlessly.

Now, generate the best possible Lovable.dev prompt! 🚀
`,
    tools: [
      {
        type: "function",
        function: {
          name: "saveLandingPage",
          description:
            "Save the generated landing page prompt and metadata to the LandingPages collection in the database.",
          parameters: {
            type: "object",
            properties: {
              businessId: {
                type: "string",
                description:
                  "The ID of the business idea this landing page is for.",
              },
              lovablePrompt: {
                type: "string",
                description:
                  "The full Lovable.dev landing page prompt generated from the business idea.",
              },
              summary: {
                type: "string",
                description: "Short summary or title of the landing page.",
              },
              keywords: {
                type: "array",
                items: {
                  type: "string",
                },
                description:
                  "List of relevant keywords or tags extracted from the landing page prompt.",
              },
            },
            required: ["businessId", "lovablePrompt"],
          },
        },
      },
    ],
  },
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
      //   ),
    //   getOrCreateAssistant("pageCraft").catch((err) =>
    //     console.error("Failed to initialize pageCraft assistant:", err)
    //   ),
    // ]);

    console.log("All assistants initialized successfully");
  } catch (error) {
    console.error("Error initializing assistants:", error);
  }
}

// Define initialization state and function first
let isInitialized = false;
let initializationPromise;

// Export a function to check initialization status
const ensureInitialized = async () => {
  if (!isInitialized) {
    if (!initializationPromise) {
      // If initialization hasn't started yet, start it
      initializationPromise = initializeAssistants()
        .then(() => {
          isInitialized = true;
          console.log("Assistant service initialized successfully");
          return true;
        })
        .catch((err) => {
          console.error("Initialization failed:", err);
          isInitialized = false;
          throw err;
        });
    }
    await initializationPromise;
  }
  return true;
};

// Start initialization on first use
initializationPromise = ensureInitialized();

async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    console.log("No existing config found, creating new one");
    return {};
  }
}

async function saveConfig(config) {
  try {
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error("Failed to save config:", error);
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
          console.log(
            `Successfully retrieved existing assistant: ${assistant.id}`
          );
          cache[type] = assistant;
          return assistant;
        }
      } catch (retrieveError) {
        console.log(
          `Failed to retrieve existing assistant ${existingId}:`,
          retrieveError.message
        );
        // Continue to create a new assistant
      }
    }

    // Create new assistant if none exists
    console.log(`Creating new ${type} assistant...`);

    if (!assistantConfigs[type]) {
      throw new Error(`No configuration found for assistant type: ${type}`);
    }

    const assistant = await openai.beta.assistants.create(
      assistantConfigs[type]
    );

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
    console.error(`Failed to create ${type} assistant:`, error.message);
    throw error;
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
  } catch (error) {}
}

/**
 * Deletes all assistants and clears the configuration
 * @returns {Promise<Object>} Result of the operation
 */
async function deleteAllAssistants() {
  try {
    await ensureInitialized();
    const config = await loadConfig();
    const assistantTypes = [
      "painPoint",
      "marketGap",
      "landingPage",
      "pageCraft",
    ];

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
    Object.keys(cache).forEach((key) => delete cache[key]);

    return {
      success: true,
      message:
        "All assistants have been deleted and configuration has been reset",
      timestamp: newConfig.lastCleared,
    };
  } catch (error) {}
}

module.exports = {
  getOrCreatePainPointAssistant: () => getOrCreateAssistant("painPoint"),
  getOrCreateMarketGapAssistant: () => getOrCreateAssistant("marketGap"),
  getOrCreateLandingPageAssistant: () => getOrCreateAssistant("landingPage"),
  getOrCreatePageCraftAssistant: () => getOrCreateAssistant("pageCraft"),
  updateAssistant,
  listAllAssistants,
  deleteAssistantByType,
  deleteAllAssistants,
  initializeAssistants,
  isInitialized: () => isInitialized,
  ensureInitialized,
};
