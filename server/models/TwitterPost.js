const mongoose = require('mongoose');

const TwitterPostSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  authorId: {
    type: String,
    required: true
  },
  hashtags: [{
    type: String,
    lowercase: true
  }],
  searchHashtag: {
    type: String,
    required: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  retweets: {
    type: Number,
    default: 0
  },
  url: {
    type: String,
    required: true
  },
  triggerKeywords: [{
    type: String
  }],
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

TwitterPostSchema.index({ searchHashtag: 1, fetchedAt: -1 });
TwitterPostSchema.index({ id: 1 }, { unique: true });
TwitterPostSchema.index({ hashtags: 1 });
TwitterPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('TwitterPost', TwitterPostSchema, 'twitter_posts');