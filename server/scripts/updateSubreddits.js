const mongoose = require('mongoose');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const Thread = require('../models/Threads');

// Function to connect to MongoDB
async function connectDB(mongoUri) {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

async function updateSubreddits(mongoUri) {
  try {
    console.log('Starting to update subreddits...');
    
    // Find all reddit threads where subreddit is missing or empty
    const threads = await Thread.find({
      platform: 'reddit',
      $or: [
        { subreddit: { $exists: false } },
        { subreddit: { $in: [null, ''] } },
      ],
      permalink: { $exists: true, $ne: '' }
    });

    console.log(`Found ${threads.length} threads to update`);

    let updatedCount = 0;
    
    for (const thread of threads) {
      try {
        // Extract subreddit from permalink
        // Example permalink: "https://www.reddit.com/r/productivity/comments/..."
        const match = thread.permalink.match(/reddit\.com\/r\/([^\/]+)/i);
        
        if (match && match[1]) {
          const subreddit = match[1].toLowerCase();
          
          // Update the thread
          thread.subreddit = subreddit;
          await thread.save();
          updatedCount++;
          
          if (updatedCount % 10 === 0) {
            console.log(`Updated ${updatedCount} threads...`);
          }
        } else {
          console.log(`Could not extract subreddit from URL: ${thread.permalink}`);
        }
      } catch (error) {
        console.error(`Error updating thread ${thread._id}:`, error.message);
      }
    }

    console.log(`\nUpdate complete! Updated ${updatedCount} out of ${threads.length} threads.`);
    
  } catch (error) {
    console.error('Error in updateSubreddits:', error);
    process.exitCode = 1;
  } finally {
    // Close the database connection when done
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
// Prompt for MongoDB URI
readline.question('Enter MongoDB connection URI: ', async (mongoUri) => {
  try {
    console.log('Connecting to MongoDB...');
    const connected = await connectDB(mongoUri);
    
    if (!connected) {
      console.error('Failed to connect to MongoDB');
      process.exit(1);
    }
    
    console.log('Starting subreddit update process...');
    await updateSubreddits(mongoUri);
    console.log('Script completed successfully');
  } catch (err) {
    console.error('Unhandled error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    readline.close();
  }
});
