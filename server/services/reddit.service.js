const axios = require("axios");
const Post = require("../models/Post");

async function fetchTopPosts(subreddit, limit = 3) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=day`;
  const res = await axios.get(url);

  return res.data.data.children.map((post) => {
    const data = post.data;

    return {
      id: data.id,
      title: data.title,
      selftext: data.selftext,
      author: data.author,
      upvotes: data.ups,
      commentCount: data.num_comments,
      permalink: `https://www.reddit.com${data.permalink}`,
    };
  });
}

async function fetchComments(postId, limit = 5) {
  const url = `https://www.reddit.com/comments/${postId}.json?limit=${limit}`;
  const res = await axios.get(url);

  const comments = res.data[1].data.children
    .filter((c) => c.kind === "t1")
    .map((c) => c.data.body);

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

module.exports = { fetchTopPosts, fetchComments, checkIfPostExists };
