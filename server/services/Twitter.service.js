const axios = require("axios");

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

const twitterApi = axios.create({
  baseURL: "https://api.twitter.com/2",
  headers: {
    Authorization: `Bearer ${BEARER_TOKEN}`,
  },
});

const triggerKeywords = [
     // Base problems
    "I wish there was a",
    "I wish there was a way to",
    "struggling with",
    "this sucks because",
    "can someone recommend",
    "can someone recommend a solution for",
    "why is it so hard to",
    "what I regret",
    "top complaint about",
    "workaround for",
    "what's the best workaround for",
    "hate that",
    "am I the only one who hates",
    "annoying that",
    "tired of",
    "fed up with",
    "needs improvement",
    "should be easier",
    "problem with",
    "difficulty with",
    "challenge is",
    "issue with",
    "pain point",
    "pain points of using",
    "barriers",
    "obstacles",
    "concerns",
    "frustrations",
    "worries",
    "hesitations",
    "no good tool for",
    "there's no good tool for",
    "nothing exists for",
    "this is broken",
    "it's frustrating when",
    "how do you deal with",
    "unpopular opinion",

    // First-person signals (optional)
    "I think",
    "I feel",
    "I was",
    "I have been",
    "I experienced",
    "my experience",
    "in my opinion",
    "IMO",
    "my biggest struggle",
    "my biggest fear",
    "I found that",
    "I learned",
    "I realized",
    "my advice",
    "what I wish I knew",
    "hardships",
    "struggles",
    "problems",
    "issues",
];

function filterTweetsByKeywords(tweets) {
  return tweets.map((tweet) => {
    const text = tweet.text.toLowerCase();
    const matchedKeywords = triggerKeywords.filter((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    return {
      ...tweet,
      ...(matchedKeywords.length > 0 && { triggerKeywords: matchedKeywords }),
    };
  });
}

async function fetchTopTweets(query, maxResults = 10) {
  try {
    const res = await twitterApi.get("/tweets/search/recent", {
      params: {
        query: `${query} -is:retweet lang:en`, // search query
        max_results: maxResults,
        "tweet.fields": "public_metrics,author_id,created_at",
      },
    });

    const tweets = res.data.data || [];
    const filtered = filterTweetsByKeywords(tweets).filter(
      (tweet) => tweet.triggerKeywords && tweet.triggerKeywords.length > 0
    );

    return filtered.map((t) => ({
      id: t.id,
      text: t.text,
      authorId: t.author_id,
      createdAt: t.created_at,
      retweets: t.public_metrics.retweet_count,
      likes: t.public_metrics.like_count,
      triggerKeywords: t.triggerKeywords,
      url: `https://twitter.com/i/web/status/${t.id}`,
    }));
  } catch (error) {
    console.error("Error fetching tweets:", error.response?.data || error.message);
    return [];
  }
}

module.exports = {
  fetchTopTweets,
};
