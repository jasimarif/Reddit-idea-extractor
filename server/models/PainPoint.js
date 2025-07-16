const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  author: String,
  text: String,
  createdAt: Date,
});

const PainPointSchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
    index: true  // Keep the index for performance but remove unique constraint
  },
  redditPostId: {
    type: String,
    index: {
      unique: true,
      sparse: true  // This allows multiple null values
    },
    default: null
  },
  // Made these fields optional with defaults
  subreddit: { type: String, default: 'general' },
  topic: { type: String, default: 'General' },
  url: { type: String, default: '' },
  postDate: { type: Date, default: Date.now },
  
  // Other fields
  quotes: [String], // 3-5 direct user quotes
  frequency: { type: Number, default: 1 }, // Number of mentions
  title: { type: String, required: true, default: 'Untitled' },
  body: { type: String, default: '' },
  upvotes: { type: Number, default: 0 },
  potentialSolvability: { type: Boolean, default: false },
  rankScore: { type: Number, default: 0 }, // Combined score for ranking
  summary: { type: String, default: '' },
  tags: { type: [String], default: [] },
  category: { type: String, default: 'Other' },
  keywords: { type: [String], default: [] }, // For similarity search
  intensity: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  status: { 
    type: String, 
    enum: ["pending", "processed", "validated", "rejected"], 
    default: "processed" 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
  comments: { type: [CommentSchema], default: [] },
}, { 
  timestamps: true,
  // Ensure the collection name is explicitly set
  collection: 'painpoints'
});

// Static method to find similar pain points
PainPointSchema.statics.findSimilar = async function(keywords, category, limit = 5) {
  if (!keywords || !keywords.length) return [];
  
  const query = {
    $or: [
      { keywords: { $in: keywords } },
      { category: category }
    ]
  };

  return this.find(query)
    .sort({ rankScore: -1, upvotes: -1 })
    .limit(limit)
    .lean();
};

// Instance method to calculate rank score
PainPointSchema.methods.calculateRankScore = function() {
  // Base score from upvotes
  let score = this.upvotes || 0;
  
  // Bonus for having more quotes
  const quoteBonus = Math.min((this.quotes?.length || 0) * 2, 10);
  score += quoteBonus;
  
  // Adjust based on intensity and urgency
  const intensityScores = { Low: 1, Medium: 2, High: 3 };
  score += intensityScores[this.intensity] || 1;
  score += intensityScores[this.urgency] || 1;
  
  // Bonus for having a summary
  if (this.summary?.length > 0) score += 2;
  
  // Bonus for having keywords
  if (this.keywords?.length > 0) score += this.keywords.length * 0.5;
  
  this.rankScore = Math.round(score * 10) / 10; // Keep one decimal place
  return this.rankScore;
};

module.exports = mongoose.model("PainPoint", PainPointSchema);
