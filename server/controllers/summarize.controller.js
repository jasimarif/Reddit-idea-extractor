const { fetchTopPosts, fetchComments } = require("../services/reddit.service");
const { summarizeWithOpenAI } = require("../services/summarize.service");
const { delay } = require("../utils/throttle");

async function summarizeReddit(req, res) {
  const { subreddit = "startups", limit = 2 } = req.body;

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
