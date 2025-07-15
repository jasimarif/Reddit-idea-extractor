const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeWithOpenAI({ title, selftext, comments }) {
  const prompt = `You're a startup idea generator AI analyzing Reddit threads to find pain points or unmet needs worth solving.

Your goal is to extract **real startup-worthy ideas** from the discussion below.

---
Reddit Thread Title: ${title}

Reddit Post Body:
${selftext}

Top User Comments:
${comments.join("\n\n")}
---

Output a single valid JSON object using the following format:

{
  "idea": "Describe a clear and novel startup idea or unmet need in 1-2 sentences.",
  "problem": "Summarize the core pain point expressed in the thread.",
  "solutionInsight": "What kind of solution (product/service) might solve this problem?",
  "topic": "The broader topic, e.g. 'Education', 'Mental Health', 'Remote Work'",
  "category": "Health, Wealth, or Relationships — pick one best fit",
  "summary": "A 3-5 sentence summary of the pain point, context, and possible opportunity.",
  "tags": ["keywords", "from", "post", "and", "comments"],
  "feasibility": "Low" | "Medium" | "High",
  "marketPotential": 1-10,
  "subreddit": "the subreddit name, if known",
  "createdAt": "YYYY-MM-DD"
}

Guidelines:
- Focus on problems, frustrations, or gaps users highlight.
- Be specific. Avoid generic statements like 'make something better'.
- If no clear idea exists, return an object with "idea": "No viable idea found", and explain why in the summary.
- Don't invent ideas unrelated to the post — stay grounded in the content.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      idea: "Parse error",
      summary: response.choices[0].message.content,
    };
  }
}

module.exports = { summarizeWithOpenAI };
