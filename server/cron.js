const cron = require('node-cron');
const ideaService = require('./services/idea.service');

const startCronJobs = () => {
  console.log('Starting cron jobs...');
  
  const { fetchTopPosts, fetchComments, storeThread } = require('./services/reddit.service');
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily Reddit idea fetch...');
    try {
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
      ];
      for (const subreddit of subredditList) {
        console.log(`Fetching from r/${subreddit}...`);
        const posts = await fetchTopPosts(subreddit, 5);
        for (const post of posts) {
          const comments = await fetchComments(post.id);
          await storeThread(post, comments);
          await new Promise(resolve => setTimeout(resolve, 1200));
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      console.log('Daily Reddit idea fetch completed successfully');
    } catch (error) {
      console.error('Error in daily Reddit idea fetch:', error);
    }
  }, {
    timezone: 'America/New_York'
  });

  cron.schedule('0 0 * * 0', async () => {
    console.log('Running weekly cleanup...');
    
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const Post = require('./models/PainPoint');
      
      const result = await Post.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
        isManuallyAdded: false
      });
      
      console.log(`Cleaned up ${result.deletedCount} old posts`);
    } catch (error) {
      console.error('Error in weekly cleanup:', error);
    }
  }, {
    timezone: 'America/New_York'
  });

  console.log('Cron jobs scheduled successfully');
};

module.exports = { startCronJobs };