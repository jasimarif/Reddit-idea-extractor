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
      try {
        // Only process posts that have LLM classification and are marked as pain points
        if (post.llmClassification?.isPainPoint) {
          await delay(1200);
          
          const comments = await fetchComments(post.id);
          await storeThread(post, comments);

          result.push({
            id: post.id,
            postTitle: post.title,
            selftext: post.selftext,
            permalink: post.permalink,
            subreddit: post.subreddit,
            author: post.author,
            upvotes: post.upvotes,
            commentCount: post.commentCount,
            comments,
            llmClassification: post.llmClassification // Include classification info in the response
          });
        } else {
          console.log(`Skipping post (not a pain point): ${post.title.substring(0, 50)}...`);
        }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error.message);
        // Continue with the next post even if one fails
        continue;
      }
    }

    res.json({ posts: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Reddit data" });
  }
}

module.exports = { getRedditData };
