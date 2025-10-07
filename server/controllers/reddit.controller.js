const { fetchTopPosts, fetchComments, storeThread } = require("../services/reddit.service");
const { delay } = require("../utils/throttle");
const RawIdea = require("../models/RawIdea");

async function fetchAndStoreRawIdeas(req, res) {
  const defaultSubredditList = [
       "personalfinance",
        "startups",
        "Entrepreneur",
        "smallbusiness",
        "freelance",
        "consulting",
        "overemployed",
        "jobs",
        "resumes",
        "careerguidance",
        "mentalhealth",
        "depression",
        "productivity",
        "tech",
        "logistics",
        "Accounting",
        "ecommerce",
        "marketing",
        "technology",
        "supplychain",
        "sales",
        "devops",
        "CRM",
        "oracle",
        "SAP",
        "nonprofit",
         "manufacturing",
  ];

  const subredditList = req.body.subreddits && Array.isArray(req.body.subreddits) && req.body.subreddits.length > 0
    ? req.body.subreddits
    : defaultSubredditList;

  const postsPerSubreddit = 10; 
  const results = {
    totalFetched: 0,
    totalStored: 0,
    subredditsProcessed: 0,
    errors: []
  };

  try {
    for (const subreddit of subredditList) {
      try {
        console.log(`Fetching 10 posts from r/${subreddit}...`);

        let posts = [];
        try {
          posts = await fetchTopPosts(subreddit, postsPerSubreddit);
        } catch (fetchError) {
          if (fetchError.response?.status === 429) {
            console.log(`Rate limited while fetching posts from r/${subreddit}, waiting 30 seconds...`);
            await delay(10000); 
            try {
              posts = await fetchTopPosts(subreddit, postsPerSubreddit);
            } catch (retryError) {
              console.error(`Failed to fetch posts from r/${subreddit} even after retry:`, retryError.message);
              results.errors.push({
                subreddit,
                error: `Rate limited: ${retryError.message}`
              });
              continue;
            }
          } else {
            throw fetchError;
          }
        }
        console.log(`Fetched ${posts.length} posts from r/${subreddit}`);

        let storedCount = 0;

        for (const post of posts) {
          try {
            const existingPost = await RawIdea.findOne({ id: post.id });
            if (existingPost) {
              console.log(`Post ${post.id} already exists, skipping...`);
              continue;
            }

            let comments = [];
            try {
              await delay(5000); 
              comments = await fetchComments(post.id);
            } catch (commentError) {
              if (commentError.response?.status === 429) {
                console.log(`Rate limited while fetching comments for post ${post.id}, waiting 20 seconds...`);
                await delay(10000); 
                try {
                  comments = await fetchComments(post.id);
                } catch (retryError) {
                  console.error(`Failed to fetch comments for post ${post.id} even after retry:`, retryError.message);
                  comments = []; 
                }
              } else {
                throw commentError;
              }
            }

            const rawIdeaData = {
              id: post.id,
              title: post.title,
              selftext: post.selftext || '',
              author: post.author || 'anonymous',
              subreddit: post.subreddit || subreddit,
              upvotes: post.upvotes || 0,
              commentCount: post.commentCount || 0,
              permalink: post.permalink,
              comments: comments.map(comment => ({
                author: comment.author || 'anonymous',
                text: comment.text || '',
                createdAt: comment.createdAt || new Date()
              })),
              fetchedAt: new Date(),
              processed: false
            };

            const rawIdea = new RawIdea(rawIdeaData);
            await rawIdea.save();

            storedCount++;
            results.totalStored++;

          } catch (postError) {
            console.error(`Error processing post ${post.id}:`, postError.message);
            results.errors.push({
              subreddit,
              postId: post.id,
              error: postError.message
            });
            continue;
          }
        }

        results.subredditsProcessed++;
        results.totalFetched += posts.length;

        console.log(`Stored ${storedCount} new posts from r/${subreddit}`);

        if (subreddit !== subredditList[subredditList.length - 1]) {
          await delay(10000); 
        }

      } catch (subredditError) {
        console.error(`Error processing subreddit r/${subreddit}:`, subredditError.message);
        results.errors.push({
          subreddit,
          error: subredditError.message
        });
        continue;
      }
    }

    console.log(`\n=== Raw Ideas Fetch Complete ===`);
    console.log(`Total posts fetched: ${results.totalFetched}`);
    console.log(`Total posts stored: ${results.totalStored}`);
    console.log(`Subreddits processed: ${results.subredditsProcessed}/${subredditList.length}`);
    console.log(`Errors: ${results.errors.length}`);

    res.json({
      success: true,
      message: `Fetched and stored raw ideas from ${results.subredditsProcessed} subreddits`,
      stats: results
    });

  } catch (error) {
    console.error("Error in fetchAndStoreRawIdeas:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch and store raw ideas",
      details: error.message
    });
  }
}


async function getRedditData(req, res) {
   const subredditList = [
      "personalfinance",
        "startups",
        "Entrepreneur",
        "smallbusiness",
        "freelance",
        "consulting",
        "overemployed",
        "jobs",
        "resumes",
        "careerguidance",
        "mentalhealth",
        "depression",
        "productivity",
        "tech",
        "logistics",
        "Accounting",
        "ecommerce",
        "marketing",
        "technology",
        "supplychain",
        "sales",
        "devops",
        "CRM",
        "oracle",
        "SAP",
        "nonprofit",
         "manufacturing",
  ];
  

    const requestedSubreddit = req.query.subreddit;
    const subredditsToFetch = requestedSubreddit
      ? [requestedSubreddit]
      : subredditList; 

    const limit = parseInt(req.query.limit) || 10;
    const postsPerSubreddit = Math.ceil(limit / subredditsToFetch.length); 

  try {
    const allPosts = [];

    for (const subreddit of subredditsToFetch) {
      try {
        console.log(`Fetching from r/${subreddit}...`);
        let posts = [];
        try {
          posts = await fetchTopPosts(subreddit, postsPerSubreddit);
        } catch (fetchError) {
          if (fetchError.response?.status === 429) {
            console.log(`Rate limited while fetching from r/${subreddit}, waiting 30 seconds...`);
            await delay(10000); 
            try {
              posts = await fetchTopPosts(subreddit, postsPerSubreddit);
            } catch (retryError) {
              console.error(`Failed to fetch from r/${subreddit} even after retry:`, retryError.message);
              continue; 
            }
          } else {
            throw fetchError;
          }
        }

        const postsWithSubreddit = posts.map(post => ({
          ...post,
          subreddit: post.subreddit || subreddit
        }));

        allPosts.push(...postsWithSubreddit);
        console.log(`Fetched ${posts.length} posts from r/${subreddit}`);

        if (subreddit !== subredditsToFetch[subredditsToFetch.length - 1]) {
          await delay(3000);
        }
      } catch (error) {
        console.error(`Error fetching from r/${subreddit}:`, error.message);
        continue;
      }
    }

    const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);
    const finalPosts = shuffledPosts.slice(0, limit);

    const result = [];

    for (const post of finalPosts) {
      try {
        // TEMPORARY: Process all posts without AI classification check
        // if (post.llmClassification?.isPainPoint) {
          let comments = [];
          try {
            await delay(5000); 
            comments = await fetchComments(post.id);
          } catch (commentError) {
            if (commentError.response?.status === 429) {
              console.log(`Rate limited while fetching comments for post ${post.id}, waiting 20 seconds...`);
              await delay(10000);
              try {
                comments = await fetchComments(post.id);
              } catch (retryError) {
                console.error(`Failed to fetch comments for post ${post.id} even after retry:`, retryError.message);
                comments = []; 
              }
            } else {
              throw commentError;
            }
          }
          // TEMPORARY: Comment out storing to database
          // await storeThread(post, comments);

          result.push({
            id: post.id,
            postTitle: post.title,
            selftext: post.selftext,
            permalink: post.permalink,
            subreddit: post.subreddit,
            author: post.author,
            upvotes: post.upvotes,
            commentCount: post.commentCount,
            comments,
            // TEMPORARY: Remove AI classification from response
            // llmClassification: post.llmClassification // Include classification info in the response
          });
        // } else {
        //   console.log(`Skipping post (not a pain point): ${post.title.substring(0, 50)}...`);
        // }
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error.message);
        continue;
      }
    }

    res.json({
      posts: result,
      subredditsFetched: subredditsToFetch.length,
      totalPostsFetched: allPosts.length
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch Reddit data" });
  }
}

async function getRawIdeas(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.subreddit) {
      const subreddits = Array.isArray(req.query.subreddit) ? req.query.subreddit : [req.query.subreddit];
      query.subreddit = { $in: subreddits };
    }

    if (req.query.processed !== undefined) {
      query.processed = req.query.processed === 'true';
    }

    

    const total = await RawIdea.countDocuments(query);

    const rawIdeas = await RawIdea.find(query)
      .sort({ fetchedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // console.log('Fetched raw ideas:', JSON.stringify(rawIdeas, null, 2));

    res.json({
      success: true,
      data: rawIdeas,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error("Error fetching raw ideas:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch raw ideas",
      details: error.message
    });
  }
}

async function getSubredditCounts(req, res) {
  try {
    const subredditCounts = await RawIdea.aggregate([
      {
        $group: {
          _id: "$subreddit",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const counts = {};
    subredditCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error("Error fetching subreddit counts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch subreddit counts",
      details: error.message
    });
  }
}

module.exports = { getRedditData, fetchAndStoreRawIdeas, getRawIdeas, getSubredditCounts };
