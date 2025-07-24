const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

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
    mvpFeatures: [String],
    technicalFeasibility: { type: mongoose.Schema.Types.Mixed, default: {} },
    marketFeasibility: { type: mongoose.Schema.Types.Mixed, default: {} },
    potentialScore: { type: Number, default: 0 },
    source: { type: String, default: 'ai-generated' },
    keywords: [String],
    rankingReason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Core idea information
    ideaName: {
      type: String,
      required: true,
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



    // Business model and categorization
    businessModel: {
      type: String,
      required: true,
    },
    keyFeatures: [String],
    uniqueValueProposition: [String],
    revenueStreams: [String],
    implementationSteps: [String],
    potentialChallenges: [String],
    differentiators: {
      type: String,
      default: '',
    },
    successMetrics: [String],
    marketCategory: {
      type: String,
      required: true,
    },
    feasibilityScore: { type: Number },
    technicalComplexity: { type: String },

    // Scoring & viability
    overallScore: {
      type: Number,
      default: 0,
    },

    targetAudience: { type: String },

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
    differentiator: {
      type: String,
      default: '',
    },
    useCase: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);
// Add pagination plugin to the schema
BusinessIdeaSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("BusinessIdea", BusinessIdeaSchema);