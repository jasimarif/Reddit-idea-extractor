const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema({
  // Core thread information
  platform: { type: String, enum: ['reddit', 'twitter'], required: true },
  sourceId: { type: String, required: true, index: true }, // Reddit ID or Tweet ID
  subreddit: { type: String, index: true }, // For Reddit
  author: { type: String },
  title: { type: String }, // Reddit post title
  content: { type: String }, // Reddit selftext or tweet text
  permalink: { type: String },
  upvotes: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  
  // Comments/replies
  comments: [{
    author: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Classification and processing status
  market: { type: String },
  subniche: { type: String },
  painPointsExtracted: { type: Boolean, default: false },
  isProcessed: { type: Boolean, default: false },
  
  // Metadata
  metadata: {
    // Keywords that triggered this post to be saved
    triggerKeywords: [String],
    
    // LLM classification results
    llmClassification: {
      isPainPoint: { type: Boolean, default: false },
      reason: String,
      classifiedAt: Date,
      confidence: { type: Number, min: 0, max: 1 }
    },
    
    // Additional metadata
    source: { type: String, default: 'reddit' },
    tags: [String]
  },
  
  // Timestamps
  fetchedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // This will automatically manage createdAt and updatedAt
});

// Add index for frequently queried fields
ThreadSchema.index({ 'metadata.llmClassification.isPainPoint': 1 });
ThreadSchema.index({ 'metadata.llmClassification.classifiedAt': -1 });
ThreadSchema.index({ upvotes: -1 });
ThreadSchema.index({ commentCount: -1 });

module.exports = mongoose.model("Thread", ThreadSchema);