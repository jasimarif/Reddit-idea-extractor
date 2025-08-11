const mongoose = require('mongoose');

const LandingPageSchema = new mongoose.Schema({
    // Link to user who created this landing page
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    
  // Link to idea
  businessIdeaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessIdea',
    required: true
  },

  // Core content
  headline: {
    type: String,
    required: true,
    trim: true
  },
  subheadline: {
    type: String,
    required: true,
    trim: true
  },
  bulletPoints: {
    type: [String],
    default: []
  },
  painPointsSection: {
    type: [String],
    default: []
  },
  outcomeSection: {
    type: [String],
    default: []
  },
  founderMessage: {
    type: String
  },
  ctaText: {
    type: String
  },

  // Optional metadata
  landingPageUrl: {
    type: String
  },
  conversionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0.0
  },
  prompt: {
    type: String
  },
  lovablePrompt: {
    type: String
  },

  // Generation metadata
  generatedBy: {
    type: String,
    default: 'openai-gpt'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },

  // Status & publishing
  status: {
    type: String,
    enum: ['draft', 'generated', 'published'],
    default: 'generated'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Optional method to regenerate prompt
LandingPageSchema.methods.generatePrompt = function () {
  return `Landing page for "${this.headline}" with focus on: ${this.bulletPoints.join(', ')}.`;
};

module.exports = mongoose.model('LandingPage', LandingPageSchema);
