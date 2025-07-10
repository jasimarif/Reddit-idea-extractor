const { fetchTopPosts, fetchComments } = require("../services/reddit.service");
const { delay } = require("../utils/throttle");

async function getRedditData(req, res) {
  const { subreddit = "startups", limit = 3 } = req.body;

  try {
    const posts = await fetchTopPosts(subreddit, limit);

    const result = [];
    for (const post of posts) {
      await delay(1200)

      const comments = await fetchComments(post.id);
      result.push({
        postTitle: post.title,
        selftext: post.selftext,
        permalink: post.permalink,
        comments,
      });
    }
    res.json({ post: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Reddit data" });
  }
}

module.exports = { getRedditData };