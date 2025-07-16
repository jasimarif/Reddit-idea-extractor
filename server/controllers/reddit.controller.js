const { fetchTopPosts, fetchComments, storeThread } = require("../services/reddit.service");
const { delay } = require("../utils/throttle");


async function getRedditData(req, res) {
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
    const limit = parseInt(req.query.limit) || 10;

  try {
    const posts = await fetchTopPosts(subreddit, limit);
    const result = [];

    for (const post of posts) {
      await delay(1200);

      const comments = await fetchComments(post.id);

      await storeThread(post, comments);

      result.push({
        id: post.id,
        postTitle: post.title,
        selftext: post.selftext,
        permalink: post.permalink,
        author: post.author,
        upvotes: post.upvotes,
        commentCount: post.commentCount,
        comments,
      });
    }

    res.json({ posts: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Reddit data" });
  }
}

module.exports = { getRedditData };
