const mongoose = require("mongoose");

const BusinessIdeaSchema = new mongoose.Schema(
  {
    // Source pain points
    painPointIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PainPoint",
        required: true,
      },
    ],

    // Core idea information
    ideaName: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    solutionOverview: {
      type: String,
      required: true,
    },
    uniqueValueProposition: {
      type: String,
      required: true,
    },

    // Business model and categorization
    businessModel: {
      type: String,
      enum: [
        "SaaS",
        "Marketplace",
        "Subscription",
        "Freemium",
        "Service",
        "Platform",
        "Other",
      ],
      required: true,
    },
    keyFeatures: [String],
    differentiators: [String],
    marketCategory: {
      type: String,
      enum: ["Health", "Wealth", "Relationships", "Other"],
      required: true,
    },
    marketSize: { type: String },
    feasibilityScore: { type: Number },
    technicalComplexity: { type: String },
    expectedROI: { type: String },

    // Scoring & viability
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    viabilityRating: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    marketSegment: {
      type: String,
      required: false, // Optional; helps display filtering in UI
    },
    targetAudience: { type: String },

    categoryBestPotential: { type: Boolean },

    // Generation metadata
    generatedBy: {
      type: String,
      default: "openai-gpt",
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    prompt: {
      type: String,
    },

    // Misc
    status: {
      type: String,
      enum: ["draft", "generated", "reviewed"],
      default: "generated",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BusinessIdea", BusinessIdeaSchema);