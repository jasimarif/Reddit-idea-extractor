const marketGapService = require('../services/marketGap.service');
const BusinessIdea = require('../models/BusinessIdea');
const PainPoint = require('../models/PainPoint');

const generateIdeas = async (req, res) => {
  try {
    const { painPointIds } = req.body;

    // Validate input
    if (!painPointIds || !Array.isArray(painPointIds) || painPointIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide a non-empty array of pain point IDs',
        data: null
      });
    }

    // Clean and validate pain point IDs
    const validPainPointIds = painPointIds
      .map(id => (typeof id === 'string' ? id.trim() : String(id)))
      .filter(id => id && id.length > 0 && /^[0-9a-fA-F]{24}$/.test(id));

    if (validPainPointIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid pain point IDs provided',
        data: null
      });
    }

    // First, check if all pain points exist
    const existingPainPoints = await PainPoint.find({
      _id: { $in: validPainPointIds }
    });
    
    if (existingPainPoints.length !== validPainPointIds.length) {
      const foundIds = existingPainPoints.map(p => p._id.toString());
      const missingIds = validPainPointIds.filter(id => !foundIds.includes(id));
      
      return res.status(404).json({
        success: false,
        message: 'Some pain points were not found',
        data: {
          missingPainPointIds: missingIds,
          foundPainPointIds: foundIds
        }
      });
    }
    const painPoints = existingPainPoints;

    const ideas = await marketGapService.generateBusinessIdeas(painPoints);

    const transformedIdeas = ideas.map(idea => ({
      id: idea._id,
      title: idea.ideaName || 'Untitled Business Idea',
      description: idea.solutionOverview || '',
      problemStatement: idea.problemStatement || '',
      targetAudience: idea.targetAudience || {},
      businessModel: idea.businessModel || 'Other',
      uniqueValueProposition: Array.isArray(idea.uniqueValueProposition) ? idea.uniqueValueProposition : [],
      revenueStreams: Array.isArray(idea.revenueStreams) ? idea.revenueStreams : [],
      keyFeatures: Array.isArray(idea.keyFeatures) ? idea.keyFeatures : [],
      implementationSteps: Array.isArray(idea.implementationSteps) ? idea.implementationSteps : [],
      potentialChallenges: Array.isArray(idea.potentialChallenges) ? idea.potentialChallenges : [],
      successMetrics: Array.isArray(idea.successMetrics) ? idea.successMetrics : [],
      differentiator: idea.differentiators || '',
      useCase: idea.useCase || '',
      keywords: Array.isArray(idea.keywords) ? idea.keywords : [],
      overallScore: typeof idea.overallScore === 'number' ? idea.overallScore : 5.0,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }));

    res.status(201).json({
      success: true,
      message: `Successfully generated ${transformedIdeas.length} business ideas`,
      data: transformedIdeas
    });
  } catch (error) {
    console.error('Error generating business ideas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate business ideas',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// @desc    Get all business ideas
// @route   GET /api/market-gap/ideas
// @access  Public
const getBusinessIdeas = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', painPointIds } = req.query;
    let painPointIdArray = [];

    // Accept painPointIds as a comma-separated string, array, or array with square brackets
    if (painPointIds) {
      if (Array.isArray(painPointIds)) {
        // Handle both array and array with square brackets in parameter name
        painPointIdArray = painPointIds.flatMap(item => 
          Array.isArray(item) ? item : [item]
        ).filter(Boolean);
      } else if (typeof painPointIds === 'string') {
        // Handle comma-separated string
        painPointIdArray = painPointIds.split(',').map(id => id.trim()).filter(Boolean);
      }
    }

    // Validate ObjectId format
    painPointIdArray = painPointIdArray.filter(id => /^[0-9a-fA-F]{24}$/.test(id));

    // If painPointIds are provided, filter by them
    if (painPointIdArray.length > 0) {
      // Find all business ideas that have any of the painPointIds
      const ideas = await BusinessIdea.find({
        painPointIds: { $in: painPointIdArray }
      }).lean();
      // Remove duplicates by _id
      const uniqueIdeas = Array.from(new Map(ideas.map(idea => [String(idea._id), idea])).values());
      // Transform the response to match the expected format
      const transformedIdeas = uniqueIdeas.map(idea => ({
        id: idea._id,
        title: idea.ideaName,
        description: idea.solutionOverview,
        problemStatement: idea.problemStatement,
        targetAudience: idea.targetAudience,
        businessModel: idea.businessModel,
        revenueStreams: idea.revenueStreams,
        keyFeatures: idea.keyFeatures,
        implementationSteps: idea.implementationSteps,
        potentialChallenges: idea.potentialChallenges,
        successMetrics: idea.successMetrics,
        differentiator: idea.differentiator,
        useCase: idea.useCase,
        keywords: idea.keywords,
        score: idea.score,
        rankingReason: idea.rankingReason,
        createdAt: idea.createdAt,
        updatedAt: idea.updatedAt
      }));
      return res.status(200).json({
        success: true,
        message: 'Business ideas retrieved successfully',
        data: transformedIdeas
      });
    }

    // Fallback: original paginated public ideas
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const filterOptions = {
      $or: [
        { isPublic: true }
      ]
    };

    const query = {};

    if (req.query.search) {
      query.$or = [
        { ideaName: { $regex: req.query.search, $options: 'i' } },
        { tagline: { $regex: req.query.search, $options: 'i' } },
        { problemStatement: { $regex: req.query.search, $options: 'i' } },
        { solutionOverview: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sortOptions,
      lean: true
    };

    const ideas = await BusinessIdea.paginate({ ...query, ...filterOptions }, options);

    // Transform the response to match the expected format
    const transformedIdeas = ideas.docs.map(idea => ({
      id: idea._id,
      title: idea.ideaName,
      description: idea.solutionOverview,
      problemStatement: idea.problemStatement,
      targetAudience: idea.targetAudience,
      businessModel: idea.businessModel,
      revenueStreams: idea.revenueStreams,
      keyFeatures: idea.keyFeatures,
      implementationSteps: idea.implementationSteps,
      potentialChallenges: idea.potentialChallenges,
      successMetrics: idea.successMetrics,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Business ideas retrieved successfully',
      data: transformedIdeas,
      pagination: {
        total: ideas.totalDocs,
        page: ideas.page,
        pages: ideas.totalPages,
        limit: ideas.limit
      }
    });
  } catch (error) {
    console.error('Error fetching business ideas:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch business ideas',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// @desc    Get single business idea
// @route   GET /api/market-gap/ideas/:id
// @access  Public
const getBusinessIdea = async (req, res) => {
  try {
    const idea = await BusinessIdea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Business idea not found',
        data: null
      });
    }

    // Check if the idea is public
    if (!idea.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource',
        data: null
      });
    }

    // Transform the response to match the expected format
    const transformedIdea = {
      id: idea._id,
      title: idea.ideaName,
      description: idea.solutionOverview,
      problemStatement: idea.problemStatement,
      targetAudience: idea.targetAudience,
      businessModel: idea.businessModel,
      revenueStreams: idea.revenueStreams,
      keyFeatures: idea.keyFeatures,
      implementationSteps: idea.implementationSteps,
      potentialChallenges: idea.potentialChallenges,
      successMetrics: idea.successMetrics,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Business idea retrieved successfully',
      data: transformedIdea
    });
  } catch (error) {
    console.error('Error fetching business idea:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Business idea not found',
        data: null
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch business idea',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * @desc    Get all business ideas for a specific painpoint id
 * @route   GET /api/market-gap/ideas/by-painpoint/:painPointId
 * @access  Public
 */
const getBusinessIdeasByPainPointId = async (req, res) => {
  try {
    const { painPointId } = req.params;
    const ideas = await marketGapService.getBusinessIdeasByPainPointId(painPointId);
    const transformedIdeas = ideas.map(idea => ({
      id: idea._id,
      title: idea.ideaName,
      description: idea.solutionOverview,
      problemStatement: idea.problemStatement,
      targetAudience: idea.targetAudience,
      businessModel: idea.businessModel,
      revenueStreams: idea.revenueStreams,
      keyFeatures: idea.keyFeatures,
      implementationSteps: idea.implementationSteps,
      potentialChallenges: idea.potentialChallenges,
      successMetrics: idea.successMetrics,
      differentiator: idea.differentiator || '',
      useCase: idea.useCase || '',
      keywords: Array.isArray(idea.keywords) ? idea.keywords : [],
      score: idea.feasibilityScore,
      rankingReason: idea.rankingReason,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt
    }));
    res.status(200).json({
      success: true,
      message: 'Business ideas for painpoint retrieved successfully',
      data: transformedIdeas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch business ideas by painpoint',
      data: null
    });
  }
};

module.exports = {
  generateIdeas,
  getBusinessIdeas,
  getBusinessIdea,
  getBusinessIdeasByPainPointId,
};
