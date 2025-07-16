const { fetchTopPosts, fetchComments } = require("../services/reddit.service");
const { summarizeWithOpenAI } = require("../services/summarize.service");
const { delay } = require("../utils/throttle");

async function summarizeReddit(req, res) {
  
  const subredditList = [
      "personalfinance",
      "startups",
      "Entrepreneur",
      "smallbusiness",
      "freelance",
      "consulting",
      "overemployed",
      "jobs",
      "resumes",
      "careerguidance",
    ];

    const subreddit =
      req.query.subreddit ||
      subredditList[Math.floor(Math.random() * subredditList.length)];
    const limit = parseInt(req.query.limit) || 5;

  try {
    const posts = await fetchTopPosts(subreddit, limit);
    const result = [];

    for (const post of posts) {
      await delay(1200);

      const comments = await fetchComments(post.id);
      const summary = await summarizeWithOpenAI({
        title: post.title,
        selftext: post.selftext,
        comments,
      });

      result.push({
        postTitle: post.title,
        permalink: post.permalink,
        ...summary,
      });
    }
    res.json({ summaries: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "OpenAI summarization failed" });
  }
}

module.exports = { summarizeReddit };
