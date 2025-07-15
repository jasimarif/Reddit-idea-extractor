const redditService = require("./reddit.service");
const openaiService = require("./summarize.service");
const Post = require("../models/Post");
const { delay } = require("../utils/throttle");

async function fetchAndSaveRedditIdeas(subreddit, limit = 5, userId = null) {
  try {
    console.log(`fetching ideas from r/${subreddit}`);

    const posts = await redditService.fetchTopPosts(subreddit, limit);

    let savedCount = 0;

    for (const post of posts) {
      const exist = await redditService.checkIfPostExists(post.id);
      if (exist) {
        console.log(`Post ${post.id} already exist, skipping..`);
        continue;
      }

      const comments = await redditService.fetchComments(post.id, 3);

      const analysis = await openaiService.summarizeWithOpenAI({
        title: post.title,
        selftext: post.selftext,
        comments,
        subreddit,
        createdAt: post.created_utc,
      });

      const postData = {
        ...post,
        analysis,
        redditPostId: post.id,
        isManuallyAdded: false,
        userId: userId,
        status: "processed",
        url: post.permalink,
        postDate: post.created_utc || Date.now(),
        topic: analysis.topic || "General",
        subreddit: subreddit,
        summary: analysis.summary,
        tags: analysis.tags || [],
        category: analysis.category || "General",
        comments: comments,
      };

      try {
        await Post.create(postData);
        savedCount++;
        console.log(`Saved idea: ${postData.title}`);
      } catch (err) {
        if (err.code === 11000) {
          // Duplicate key error, skip and continue
          console.log(`Duplicate post: ${postData.redditPostId}, skipping.`);
        } else {
          throw err;
        }
      }
      await delay(1200);
    }
    console.log(
      `Successfully saved ${savedCount} new ideas from r/${subreddit}`
    );
    return { success: true, savedCount };
  } catch (error) {
    console.error("Error fetching Reddit ideas:", error);
    throw error;
  }
}

module.exports = { fetchAndSaveRedditIdeas };
