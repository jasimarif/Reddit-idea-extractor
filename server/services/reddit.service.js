const axios = require("axios");
const Post = require("../models/PainPoint");
const Thread = require("../models/Threads");

const triggerRegexes = [
  /i wish there (?:was|were) a(?:n)?/i,
  /struggling with/i,
  /no good tool for/i,
  /this sucks because/i,
  /can someone recommend/i,
  /workaround for/i,
  /\bi (?:think|feel|was|have been|experienced|found that|learned|realized|wish|regret)\b/i,
  /\bmy (?:experience|advice|biggest struggle|biggest fear)\b/i,
  /\b(in my opinion|IMO)\b/i,
  /\b(struggles?|problems?|issues?|challenge|difficulties|hardships?|pain point)\b/i,
  /\b(barriers?|obstacles?|concerns?|frustrations?|worries?|hesitations?)\b/i,
  /\bwhat (?:i wish i knew|i regret)\b/i,
  /why is it so hard to/i,
  /there'?s no good tool for/i,
  /how (?:do|can) you deal with/i,
  /this is broken/i,
  /it'?s frustrating when/i,
  /unpopular opinion.*sucks because/i,
  /what'?s the best workaround for/i,
  /nothing exists for/i,
  /am i the only one who (?:hates|struggles with)/i,
  /pain points? of using/i,
  /top complaint about/i
];

const commentTriggerRegexes = [
  /problem|wish|frustrated|hate|pain|struggle|issue|challenge|broken|doesn'?t work|failure/i,
  /anyone else|tired of|fed up with|overwhelmed|lost|stuck/i,
  /need help with|can someone|does anyone|recommend me|suggest me|help me find/i,
  /how (to|do i|can i)/i,
  /why (is|can'?t)/i
];

function filterPostsByKeywords(posts) {
  return posts.map((post) => {
    const text = `${post.title} ${post.selftext || ""}`.toLowerCase();
    const matchedRegexes = triggerRegexes.filter((regex) => regex.test(text));

    return {
      ...post,
      ...(matchedRegexes.length > 0 && {
        triggerKeywords: matchedRegexes.map((r) => r.toString()),
      }),
    };
  });
}

async function fetchTopPosts(subreddit, limit = 1) {
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

function filterCommentByKeywords(commentText) {
  const text = commentText.toLowerCase();
  return commentTriggerRegexes.some((regex) => regex.test(text));
}

async function fetchComments(postId, limit = 1) {
  const url = `https://www.reddit.com/comments/${postId}.json?limit=${limit}`;
  const res = await axios.get(url);

  const comments = res.data[1].data.children
    .filter((c) => c.kind === "t1")
    .map((c) => ({
      author: c.data.author,
      text: c.data.body,
      createdAt: new Date(c.data.created_utc * 1000),
    }))
    .filter((c) => filterCommentByKeywords(c.text));

  return comments;
}

async function checkIfPostExists(threadId) {
  try {
    const existingPost = await Post.findOne({ threadId });
    return !!existingPost;
  } catch (error) {
    console.error("Error checking if post exists:", error);
    return false;
  }
}

async function storeThread(post, comments) {
  try {
    let thread = await Thread.findOne({
      platform: "reddit",
      sourceId: post.id,
    });

    if (thread) {
      console.log(`Thread ${post.id} already exists`);
      return thread;
    }

    console.log(`Saving new thread: ${post.title.substring(0, 50)}...`);

    thread = new Thread({
      platform: "reddit",
      sourceId: post.id,
      author: post.author,
      title: post.title,
      content: post.selftext || '',
      url: `https://reddit.com${post.permalink}`,
      comments: comments.map((c) => ({
        author: c.author || 'anonymous',
        text: c.text || '',
        createdAt: c.createdAt || new Date(),
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      painPointsExtracted: false,
      isProcessed: false
    });

    const savedThread = await thread.save();
    console.log(`Saved thread ${savedThread._id}: ${savedThread.title.substring(0, 50)}...`);
    return savedThread;
  } catch (err) {
    console.error("Error saving thread to DB:", err);
    throw err;
  }
}

module.exports = {
  fetchTopPosts,
  fetchComments,
  checkIfPostExists,
  storeThread,
};
