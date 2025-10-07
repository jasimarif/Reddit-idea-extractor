const axios = require("axios");
const Post = require("../models/PainPoint");
const Thread = require("../models/Threads");
const llmClassifier = require("./llmClassifier.service");

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

// TEMPORARY: Commenting out AI classification function
/*
async function filterPostsByKeywords(posts) {
  const filteredPosts = [];
  
  for (const post of posts) {
    const text = `${post.title} ${post.selftext || ""}`.toLowerCase();
    const matchedRegexes = triggerRegexes.filter((regex) => regex.test(text));
    
    // If no regex matches, skip LLM check for efficiency
    if (matchedRegexes.length === 0) {
      continue;
    }
    
    try {
      // Use LLM to verify if this is a real pain point
      const { isPainPoint, reason } = await llmClassifier.classifyRedditPost(
        post.title,
        post.selftext || ''
      );
      
      if (isPainPoint) {
        filteredPosts.push({
          ...post,
          triggerKeywords: matchedRegexes.map((r) => r.toString()),
          llmClassification: {
            isPainPoint: true,
            reason: reason
          }
        });
      } else {
        console.log(`Post filtered out by LLM: ${post.title.substring(0, 50)}...`);
        console.log(`Reason: ${reason}`);
      }
    } catch (error) {
      console.error('Error in LLM classification for post:', post.id, error);
      // Fallback to regex-only filtering if LLM fails
      filteredPosts.push({
        ...post,
        triggerKeywords: matchedRegexes.map((r) => r.toString()),
        llmClassification: {
          isPainPoint: true,
          reason: 'Error in classification, falling back to regex',
          error: error.message
        }
      });
    }
  }
  
  return filteredPosts;
}
*/

async function fetchTopPosts(subreddit, limit = 1) {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/top.json?limit=${Math.min(limit * 1, 100)}&t=week`;
    console.log(`Fetching top posts from r/${subreddit}...`);
    const res = await axios.get(url);

    const rawPosts = res.data.data.children.map((post) => post.data);
    console.log(`Found ${rawPosts.length} posts`);

    // TEMPORARY: Skip AI filtering and return raw posts
    // const postsWithKeywords = await filterPostsByKeywords(rawPosts);
    // console.log(`After filtering, found ${postsWithKeywords.length} pain points`);

    // Limit the number of returned posts to the requested limit
    const limitedPosts = rawPosts.slice(0, limit);

    return limitedPosts.map((data) => ({
      id: data.id,
      title: data.title,
      selftext: data.selftext,
      author: data.author,
      subreddit: data.subreddit || subreddit,
      upvotes: data.ups,
      commentCount: data.num_comments,
      permalink: `https://www.reddit.com${data.permalink}`,
      // TEMPORARY: Remove AI classification data
      // triggerKeywords: data.triggerKeywords || [],
      // llmClassification: data.llmClassification
    }));
  } catch (error) {
    console.error(`Error fetching posts from r/${subreddit}:`, error.message);
    throw new Error(`Failed to fetch posts from r/${subreddit}: ${error.message}`);
  }
}

function filterCommentByKeywords(commentText) {
  const text = commentText.toLowerCase();
  return commentTriggerRegexes.some((regex) => regex.test(text));
}

async function fetchComments(postId, limit = 10) {
  const url = `https://www.reddit.com/comments/${postId}.json?limit=${limit}`;
  const res = await axios.get(url);

  const comments = res.data[1].data.children
    .filter((c) => c.kind === "t1")
    .map((c) => ({
      author: c.data.author,
      text: c.data.body,
      createdAt: new Date(c.data.created_utc * 1000),
    }))
    // Remove keyword filtering to get ALL comments
    // .filter((c) => filterCommentByKeywords(c.text));

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
    // Check if thread already exists
    let thread = await Thread.findOne({
      platform: "reddit",
      sourceId: post.id,
    });

    if (thread) {
      console.log(`Thread ${post.id} already exists`);
      return thread;
    }

    console.log(`Saving new thread: ${post.title.substring(0, 50)}...`);

    // Prepare thread data with LLM classification if available
    const threadData = {
      platform: "reddit",
      sourceId: post.id,
      author: post.author,
      title: post.title,
      subreddit: post.subreddit,
      content: post.selftext || '',
      permalink: post.permalink,
      upvotes: post.upvotes || 0,
      commentCount: post.commentCount || 0,
      comments: comments.map((c) => ({
        author: c.author || 'anonymous',
        text: c.text || '',
        createdAt: c.createdAt || new Date(),
      })),
      metadata: {
        // Store trigger keywords if available
        triggerKeywords: post.triggerKeywords || [],
        // Store LLM classification data if available
        llmClassification: post.llmClassification ? {
          isPainPoint: post.llmClassification.isPainPoint || false,
          reason: post.llmClassification.reason || 'No reason provided',
          confidence: post.llmClassification.confidence || 0.5,
          error: post.llmClassification.error || false,
          classifiedAt: new Date()
        } : {
          isPainPoint: false,
          reason: 'Not classified by LLM',
          confidence: 0,
          error: false,
          classifiedAt: null
        },
        // Add source and tags for filtering
        source: 'reddit',
        tags: []
      },
      painPointsExtracted: false,
      isProcessed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create and save the thread
    thread = new Thread(threadData);
    const savedThread = await thread.save();
    
    console.log(`Saved thread ${savedThread._id}: ${savedThread.title.substring(0, 50)}...`);
    console.log(`LLM Classification: ${savedThread.metadata.llmClassification.isPainPoint ? '✅ Pain Point' : '❌ Not a Pain Point'}`);
    
    return savedThread;
  } catch (error) {
    console.error("Error saving thread to DB:", error);
    throw new Error(`Failed to save thread: ${error.message}`);
  }
}

module.exports = {
  fetchTopPosts,
  fetchComments,
  checkIfPostExists,
  storeThread,
};
