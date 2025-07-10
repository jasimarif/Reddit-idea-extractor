const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function summarizeWithOpenAI({ title, selftext, comments }) {
  const prompt = `You're an AI that extracts business/startup ideas from Reddit threads.
Thread Title: ${title}
Post Body: ${selftext}
Top Comments: ${comments.join("\n\n")}

Return a JSON object with: 
{
    "idea": "...",
    "summary": "...",
    "category": "...",
    "tags": ["...", "..."]
}
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
