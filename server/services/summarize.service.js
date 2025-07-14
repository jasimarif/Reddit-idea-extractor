const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeWithOpenAI({ title, selftext, comments }) {
  const prompt = `You're an AI that extracts business/startup ideas from Reddit threads.

Thread Title: ${title}
Post Body: ${selftext}
Top Comments: ${comments.join("\n\n")}

Please analyze the post and comments to extract a business idea or problem worth solving.

Return a JSON object in the following format:

{
  "idea": "A clear, concise business idea or pain point extracted from the post.",
  "topic": "The main topic or theme of the idea, e.g., 'Health', 'Wealth', 'Relationships'.",
  "summary": "A 4-5 sentence summary of the problem or opportunity.",
  "category": "Health, Wealth, or Relationships — choose the best fit.",
  "tags": ["keywords", "from", "post", "and", "comments"],
  "feasibility": "Low" | "Medium" | "High", // Based on technical difficulty and access to resources.
  "marketPotential": 1-10, // 1 = niche or low demand, 10 = mass market or highly scalable.
  "subreddit": "subreddit name", // optional if passed externally
  "createdAt": "YYYY-MM-DD"
}

Focus on identifying:
- Pain points or unmet needs
- Suggestions for services/products
- Startup ideas or innovation gaps
- Potentially monetizable opportunities

Ensure the output is valid JSON.
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
