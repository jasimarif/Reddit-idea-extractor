const axios = require("axios");
const TwitterPost = require("../models/TwitterPost");

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

async function fetchTweetsByHashtags(hashtags = [], maxResults = 10) {
  try {
    if (!hashtags || hashtags.length === 0) {
      hashtags = ["entrepreneur", "startup", "business", "innovation", "tech"];
    }

    const results = [];
    
    for (const hashtag of hashtags) {
      console.log(`Fetching tweets for hashtag: #${hashtag}`);
      
      const cleanHashtag = hashtag.replace('#', '');
      const query = `#${cleanHashtag} -is:retweet lang:en`;
      
      try {
        const res = await twitterApi.get("/tweets/search/recent", {
          params: {
            query,
            max_results: Math.min(maxResults, 100), 
            "tweet.fields": "public_metrics,author_id,created_at,entities",
          },
        });

        const tweets = res.data.data || [];
        console.log(`Found ${tweets.length} tweets for #${cleanHashtag}`);
        
        const filtered = filterTweetsByKeywords(tweets);
        
        const relevantTweets = filtered.filter(tweet => 
          tweet.text.length > 50 && 
          !tweet.text.toLowerCase().includes('follow me') &&
          !tweet.text.toLowerCase().includes('check out my') &&
          !tweet.text.match(/^RT @/) 
        );

        console.log(`After filtering: ${relevantTweets.length} relevant tweets for #${cleanHashtag}`);

        const processedTweets = relevantTweets.map((t) => {
          let tweetHashtags = [];
          if (t.entities && t.entities.hashtags) {
            tweetHashtags = t.entities.hashtags.map(h => h.tag.toLowerCase());
          } else {
            const hashtagMatches = t.text.match(/#\w+/g) || [];
            tweetHashtags = hashtagMatches.map(h => h.slice(1).toLowerCase());
          }

          return {
            id: t.id,
            text: t.text,
            authorId: t.author_id,
            hashtags: tweetHashtags,
            searchHashtag: cleanHashtag.toLowerCase(),
            createdAt: new Date(t.created_at),
            retweets: t.public_metrics.retweet_count,
            likes: t.public_metrics.like_count,
            triggerKeywords: t.triggerKeywords || [],
            url: `https://twitter.com/i/web/status/${t.id}`,
          };
        });

        results.push(...processedTweets);
        
        if (hashtags.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error(`Error fetching tweets for #${cleanHashtag}:`, error.response?.data || error.message);
      }
    }

    return results;
  } catch (error) {
    console.error("Error in fetchTweetsByHashtags:", error);
    return [];
  }
}

async function storeTwitterPosts(twitterPosts) {
  try {
    if (!twitterPosts || twitterPosts.length === 0) {
      console.log("No Twitter posts to store");
      return { stored: 0, skipped: 0, errors: [] };
    }

    console.log(`Attempting to store ${twitterPosts.length} Twitter posts`);
    let stored = 0;
    let skipped = 0;
    const errors = [];

    for (const post of twitterPosts) {
      try {
        // Check if post already exists
        const existingPost = await TwitterPost.findOne({ id: post.id });
        
        if (existingPost) {
          skipped++;
          continue;
        }

        // Create new post
        const newPost = new TwitterPost({
          id: post.id,
          text: post.text,
          authorId: post.authorId,
          hashtags: post.hashtags || [],
          searchHashtag: post.searchHashtag,
          createdAt: post.createdAt,
          likes: post.likes || 0,
          retweets: post.retweets || 0,
          url: post.url,
          triggerKeywords: post.triggerKeywords || [],
          fetchedAt: new Date()
        });

        await newPost.save();
        stored++;
        
      } catch (error) {
        console.error(`Error storing tweet ${post.id}:`, error.message);
        errors.push(`Tweet ${post.id}: ${error.message}`);
      }
    }

    console.log(`Storage complete: ${stored} stored, ${skipped} skipped, ${errors.length} errors`);
    return { stored, skipped, errors };
  } catch (error) {
    console.error("Error in storeTwitterPosts:", error);
    return { stored: 0, skipped: 0, errors: [error.message] };
  }
}

async function getStoredTwitterPosts(options = {}) {
  try {
    const {
      hashtags = [],
      page = 1,
      limit = 20,
      sortBy = 'fetchedAt',
      sortOrder = 'desc'
    } = options;

    const filter = {};
    
    if (hashtags && hashtags.length > 0) {
      filter.searchHashtag = { $in: hashtags.map(h => h.toLowerCase()) };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [posts, totalCount] = await Promise.all([
      TwitterPost.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      TwitterPost.countDocuments(filter)
    ]);

    return {
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error("Error in getStoredTwitterPosts:", error);
    throw error;
  }
}

async function getHashtagCounts() {
  try {
    const counts = await TwitterPost.aggregate([
      {
        $group: {
          _id: "$searchHashtag",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const result = {};
    counts.forEach(item => {
      result[item._id] = item.count;
    });

    return result;
  } catch (error) {
    console.error("Error in getHashtagCounts:", error);
    return {};
  }
}

module.exports = {
  fetchTopTweets,
  fetchTweetsByHashtags,
  storeTwitterPosts,
  getStoredTwitterPosts,
  getHashtagCounts
};
