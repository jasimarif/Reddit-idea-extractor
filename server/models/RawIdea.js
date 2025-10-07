const mongoose = require('mongoose');

const RawIdeaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  selftext: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: 'anonymous'
  },
  subreddit: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  permalink: {
    type: String,
    required: true
  },
  comments: [{
    author: {
      type: String,
      default: 'anonymous'
    },
    text: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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

RawIdeaSchema.index({ subreddit: 1, fetchedAt: -1 });
RawIdeaSchema.index({ id: 1 }, { unique: true });

module.exports = mongoose.model('RawIdea', RawIdeaSchema, 'reddit_rawIdeas_1');