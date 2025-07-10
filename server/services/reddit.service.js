const axios = require("axios");

async function fetchTopPosts(subreddit, limit = 3) {
  const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${limit}&t=day`;
  const res = await axios.get(url);

  return res.data.data.children.map((post) => ({
    id: post.data.id,
    title: post.data.title,
    selftext: post.data.selftext,
    permalink: `https://www.reddit.com${post.data.permalink}`,
  }));
}

async function fetchComments(postId, limit = 5) {
  const url = `https://www.reddit.com/comments/${postId}.json?limit=${limit}`;
  const res = await axios.get(url);

  const comments = res.data[1].data.children
    .filter((c) => c.kind === "t1")
    .map((c) => c.data.body);

  return comments;
}

module.exports = { fetchTopPosts, fetchComments };
