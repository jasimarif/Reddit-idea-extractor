const { 
  fetchTopTweets, 
  fetchTweetsByHashtags, 
  storeTwitterPosts, 
  getStoredTwitterPosts, 
  getHashtagCounts 
} = require("../services/Twitter.service");
const { delay } = require("../utils/throttle");

async function getTwitterData(req, res) {
  const { query = "startup", limit = 3 } = req.body;

  try {
    const tweets = await fetchTopTweets(query, limit);

    const result = [];

    for (const tweet of tweets) {
      await delay(3000); 

      result.push({
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.authorId,
        createdAt: tweet.createdAt,
        likes: tweet.likes,
        retweets: tweet.retweets,
        url: tweet.url,
        triggerKeywords: tweet.triggerKeywords,
      });
    }

    res.json({ tweets: result });
  } catch (error) {
    console.error("Twitter fetch error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch Twitter data" });
  }
}

async function fetchAndStoreTwitterPosts(req, res) {
  try {
    const { hashtags = [], maxResults = 10 } = req.body;
    
    console.log("Fetching Twitter posts for hashtags:", hashtags);

    // Fetch tweets by hashtags
    const tweets = await fetchTweetsByHashtags(hashtags, maxResults);
    
    if (tweets.length === 0) {
      return res.json({
        success: true,
        message: "No tweets found for the specified hashtags",
        stats: {
          fetched: 0,
          stored: 0,
          skipped: 0,
          hashtagsProcessed: hashtags.length
        }
      });
    }

    // Store tweets in database
    const storeResult = await storeTwitterPosts(tweets);

    res.json({
      success: true,
      message: `Successfully processed tweets for hashtags: ${hashtags.join(', ')}`,
      stats: {
        fetched: tweets.length,
        stored: storeResult.stored,
        skipped: storeResult.skipped,
        hashtagsProcessed: hashtags.length,
        errors: storeResult.errors
      }
    });

  } catch (error) {
    console.error("Error in fetchAndStoreTwitterPosts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch and store Twitter posts",
      message: error.message
    });
  }
}

async function getStoredTwitterData(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const hashtags = req.query.hashtag ? 
      (Array.isArray(req.query.hashtag) ? req.query.hashtag : [req.query.hashtag]) : 
      [];

    const result = await getStoredTwitterPosts({
      hashtags,
      page,
      limit,
      sortBy: 'fetchedAt',
      sortOrder: 'desc'
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error("Error in getStoredTwitterData:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stored Twitter data",
      message: error.message
    });
  }
}

async function getTwitterHashtagCounts(req, res) {
  try {
    const counts = await getHashtagCounts();
    
    res.json({
      success: true,
      data: counts
    });
    
  } catch (error) {
    console.error("Error in getTwitterHashtagCounts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get hashtag counts",
      message: error.message
    });
  }
}

module.exports = { 
  getTwitterData,
  fetchAndStoreTwitterPosts,
  getStoredTwitterData,
  getTwitterHashtagCounts
};
