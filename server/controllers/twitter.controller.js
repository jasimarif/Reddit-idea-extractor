const { fetchTopTweets } = require("../services/Twitter.service");
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

module.exports = { getTwitterData };
