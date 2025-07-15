const mongoose = require('mongoose');

const PainPointSchema = new mongoose.Schema({
  // Link to source thread
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  
  // Core pain point data
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  
  // Supporting evidence
  quotes: [{
    text: String,
    author: String,
    source: String, // 'post' or 'comment'
    commentId: String
  }],
  
  // Categorization
  category: {
    type: String,
    enum: ['Health', 'Wealth', 'Relationships', 'Technology', 'Education', 'Entertainment', 'Other'],
    required: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  
  // Pain point metrics
  frequency: {
    type: Number,
    default: 1,
    min: 1
  },
  intensity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  // Scoring system
  rankScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  llmConfidenceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  
  // Keywords and tags
  keywords: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Market analysis
  marketSize: {
    type: String,
    enum: ['Small', 'Medium', 'Large', 'Unknown'],
    default: 'Unknown'
  },
  targetAudience: [{
    type: String
  }],
  
  // Solution indicators
  existingSolutions: [{
    name: String,
    description: String,
    limitations: [String]
  }],
  solutionComplexity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  
  // Processing metadata
  extractedBy: {
    type: String,
    default: 'openai-gpt'
  },
  extractedAt: {
    type: Date,
    default: Date.now
  },
  isValidated: {
    type: Boolean,
    default: false
  },
  validationScore: {
    type: Number,
    min: 0,
    max: 10
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processed', 'validated', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  indexes: [
    { threadId: 1 },
    { category: 1 },
    { rankScore: -1 },
    { intensity: 1 },
    { frequency: -1 },
    { status: 1 },
    { createdAt: -1 }
  ]
});

// Calculate rank score based on multiple factors
PainPointSchema.methods.calculateRankScore = function() {
  let score = 0;
  
  // Frequency weight (40%)
  score += Math.min(this.frequency * 10, 40);
  
  // Intensity weight (30%)
  const intensityScores = { 'Low': 10, 'Medium': 20, 'High': 30 };
  score += intensityScores[this.intensity] || 0;
  
  // Urgency weight (20%)
  const urgencyScores = { 'Low': 5, 'Medium': 15, 'High': 20 };
  score += urgencyScores[this.urgency] || 0;
  
  // LLM confidence weight (10%)
  score += this.llmConfidenceScore * 10;
  
  this.rankScore = Math.min(score, 100);
  return this.rankScore;
};

// Static method to find similar pain points
PainPointSchema.statics.findSimilar = function(keywords, category) {
  return this.find({
    $and: [
      { category: category },
      {
        $or: [
          { keywords: { $in: keywords } },
          { tags: { $in: keywords } }
        ]
      }
    ]
  }).sort({ rankScore: -1 });
};

module.exports = mongoose.model('PainPoint', PainPointSchema);