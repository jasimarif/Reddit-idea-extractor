const cron = require('node-cron');
const ideaService = require('./services/idea.service');

const startCronJobs = () => {
  console.log('Starting cron jobs...');
  
  cron.schedule('0 6 * * *', async () => {
    console.log('Running daily Reddit idea fetch...');
    
    try {
      const subreddits = ['Entrepreneur', 'startups', 'Business_Ideas', 'SideProject'];
      
      for (const subreddit of subreddits) {
        console.log(`Fetching from r/${subreddit}...`);
        await ideaService.fetchAndSaveRedditIdeas(subreddit, 5);
        
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
      const Post = require('./models/Post');
      
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