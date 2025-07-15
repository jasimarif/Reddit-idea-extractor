const axios = require("axios");
const Post = require("../models/Post");

function filterPostsByKeywords(posts) {
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

  return posts.map((post) => {
    const text = `${post.title} ${post.selftext || ""}`.toLowerCase();
    const matchedKeywords = triggerKeywords.filter((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    return {
      ...post,
      ...(matchedKeywords.length > 0 && { triggerKeywords: matchedKeywords }),
    };
  });
}

async function fetchTopPosts(subreddit, limit = 3) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=day`;
  const res = await axios.get(url);

  const rawPosts = res.data.data.children.map((post) => post.data);
  const postsWithKeywords = filterPostsByKeywords(rawPosts).filter(
    (post) => post.triggerKeywords && post.triggerKeywords.length > 0
  );

  return postsWithKeywords.map((data) => {
    const basePost = {
      id: data.id,
      title: data.title,
      selftext: data.selftext,
      author: data.author,
      upvotes: data.ups,
      commentCount: data.num_comments,
      permalink: `https://www.reddit.com${data.permalink}`,
    };

    if (data.triggerKeywords) {
      basePost.triggerKeywords = data.triggerKeywords;
    }

    return basePost;
  });
}

async function fetchComments(postId, limit = 5) {
  const url = `https://www.reddit.com/comments/${postId}.json?limit=${limit}`;
  const res = await axios.get(url);

  const comments = res.data[1].data.children
    .filter((c) => c.kind === "t1")
    .map((c) => ({
      author: c.data.author,
      text: c.data.body,
      createdAt: new Date(c.data.created_utc * 1000),
    }));

  return comments;
}

async function checkIfPostExists(redditPostId) {
  try {
    const existingPost = await Post.findOne({ redditPostId });
    return !!existingPost;
  } catch (error) {
    console.error("Error checking if post exists:", error);
    return false;
  }
}

module.exports = {
  fetchTopPosts,
  fetchComments,
  checkIfPostExists,
};
