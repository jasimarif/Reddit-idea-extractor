const mongoose = require('mongoose');

const ValidationResponseSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['painPoint', 'businessIdea', 'landingPage'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  validationType: {
    type: String,
    enum: ['llm', 'human', 'automated', 'peer'],
    required: true
  },
  validatorId: {
    type: String,
    required: true
  },
  
  overallScore: {
    type: Number,
    min: 0,
    max: 10,
    required: true
  },
  criteriaScores: [{
    criterion: String,
    score: Number,
    maxScore: Number,
    notes: String
  }],
  
  isValid: {
    type: Boolean,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    summary: String
  },
  
  checks: [{
    name: String,
    passed: Boolean,
    notes: String,
    weight: {
      type: Number,
      default: 1
    }
  }],
  
  qualityMetrics: {
    clarity: Number,
    specificity: Number,
    actionability: Number,
    marketRelevance: Number,
    evidenceQuality: Number
  },
  
  feasibilityMetrics: {
    technical: Number,
    market: Number,
    financial: Number,
    operational: Number,
    legal: Number
  },
  
  contentMetrics: {
    clarity: Number,
    persuasiveness: Number,
    completeness: Number,
    accuracy: Number,
    engagement: Number
  },
  
  validationMethod: {
    type: String,
    enum: ['automated-rules', 'llm-analysis', 'human-review', 'peer-review', 'a-b-test'],
    required: true
  },
  model: {
    type: String
  },
  prompt: {
    type: String
  },
  
  reviewStatus: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'disputed'],
    default: 'completed'
  },
  reviewedBy: [{
    reviewerId: String,
    reviewerType: String,
    reviewDate: Date,
    notes: String
  }],
  
  actionsRecommended: [String],
  actionsTaken: [{
    action: String,
    takenBy: String,
    takenAt: Date,
    notes: String
  }],
  
  benchmarkData: {
    averageScore: Number,
    percentile: Number,
    similarEntities: [{
      entityId: mongoose.Schema.Types.ObjectId,
      score: Number,
      similarity: Number
    }]
  },
  
  revisionNumber: {
    type: Number,
    default: 1
  },
  previousValidations: [{
    validationId: mongoose.Schema.Types.ObjectId,
    score: Number,
    date: Date,
    changes: [String]
  }],
  
  status: {
    type: String,
    enum: ['active', 'superseded', 'disputed', 'archived'],
    default: 'active'
  },
  expiresAt: {
    type: Date
  },
  
  tags: [String],
  category: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true,
  indexes: [
    { entityType: 1, entityId: 1 },
    { validationType: 1 },
    { overallScore: -1 },
    { isValid: 1 },
    { reviewStatus: 1 },
    { createdAt: -1 },
    { status: 1 }
  ]
});

ValidationResponseSchema.methods.calculateWeightedScore = function() {
  if (!this.checks || this.checks.length === 0) {
    return this.overallScore;
  }
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  this.checks.forEach(check => {
    const score = check.passed ? 10 : 0;
    const weight = check.weight || 1;
    weightedSum += score * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? weightedSum / totalWeight : this.overallScore;
};

ValidationResponseSchema.statics.getValidationSummary = function(entityType, entityId) {
  return this.aggregate([
    { $match: { entityType, entityId, status: 'active' } },
    {
      $group: {
        _id: '$entityId',
        averageScore: { $avg: '$overallScore' },
        validationCount: { $sum: 1 },
        latestValidation: { $max: '$createdAt' },
        isValid: { $push: '$isValid' }
      }
    }
  ]);
};

module.exports = mongoose.model('ValidationResponse', ValidationResponseSchema);