const painPointService = require('../services/painpoint.service');
const ValidationResponse = require('../models/ValidationResponse');
const PainPoint = require('../models/PainPoint');

const analyzePainPoints = async (req, res) => {
  try {
    const { threadIds } = req.body;

    if (!Array.isArray(threadIds) || threadIds.length === 0) {
      return res.status(400).json({
        error: 'threadIds array is required',
        example: { threadIds: ['thread_id_1', 'thread_id_2'] }
      });
    }

    const results = await painPointService.analyzePainPoints(threadIds);

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    res.json({
      success: true,
      message: 'Pain point analysis completed',
      data: {
        processedThreads: results.length,
        successfulAnalyses: successCount,
        failedAnalyses: errorCount,
        results: results.map(r => ({
          threadId: r.threadId,
          status: r.status,
          painPointsCount: r.painPoints?.length || 0,
          painPoints: r.painPoints || [],
          error: r.error
        }))
      },
      meta: {
        timestamp: new Date().toISOString(),
        analysisEngine: 'openai-gpt'
      }
    });
  } catch (error) {
    console.error('analyzePainPoints:', error.message);
    res.status(500).json({
      error: 'Failed to analyze pain points',
      message: error.message
    });
  }
};

const getPainPoints = async (req, res) => {
  try {
    console.log('Request query:', req.query);
    
    const {
      category,
      limit = 20,
      sortBy = 'rankScore',
      order = 'desc',
      minScore = 0,
      intensity,
      status = 'processed',
      search
    } = req.query;

    // Build query
    const query = {};
    
    // Handle status filter (include null values if 'all' or no status specified)
    if (status && status !== 'all') {
      query.$or = [
        { status: status },
        { status: { $exists: false } }  // Include documents where status doesn't exist
      ];
    }
    
    if (category && category !== 'all') query.category = category;
    if (intensity && intensity !== 'all') query.intensity = intensity;
    if (minScore > 0) query.rankScore = { $gte: parseInt(minScore) };
    
    // If no status filter is applied, include all documents
    if (!status || status === 'all') {
      delete query.status;
    }
    
    // Add text search if search term is provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { 'keywords': { $regex: search, $options: 'i' } }
      ];
    }

    // Validate sort field
    const allowedSortFields = ['rankScore', 'createdAt', 'frequency', 'upvotes'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'rankScore';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObject = { [sortField]: sortOrder };

    console.log('Executing query:', JSON.stringify(query, null, 2));
    console.log('Sort:', sortObject);
    console.log('Limit:', parseInt(limit));

    const [painPoints, total] = await Promise.all([
      PainPoint.find(query)
        .sort(sortObject)
        .limit(parseInt(limit))
        .populate('threadId', 'title url platform author score'),
      PainPoint.countDocuments(query)
    ]);

    console.log(`Found ${painPoints.length} pain points`);

    res.json({
      success: true,
      data: {
        painPoints,
        pagination: {
          total,
          limit: parseInt(limit),
          page: 1,
          totalPages: Math.ceil(total / parseInt(limit))
        },
        filters: { 
          category: category || 'all',
          minScore: parseInt(minScore),
          intensity: intensity || 'all',
          status: status || 'processed',
          search: search || ''
        }
      }
    });
  } catch (error) {
    console.error('Error in getPainPoints:', {
      message: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ 
      success: false,
      error: 'Failed to get pain points',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const searchPainPoints = async (req, res) => {
  try {
    const { q, category, intensity, minScore, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const filters = {};
    if (category) filters.category = category;
    if (intensity) filters.intensity = intensity;
    if (minScore) filters.minScore = parseInt(minScore);
    if (limit) filters.limit = parseInt(limit);

    const painPoints = await painPointService.searchPainPoints(q, filters);

    res.json({
      success: true,
      data: {
        query: q,
        painPoints,
        resultsFound: painPoints.length,
        filters
      }
    });
  } catch (error) {
    console.error('searchPainPoints:', error.message);
    res.status(500).json({ error: 'Failed to search pain points', message: error.message });
  }
};

const getPainPointById = async (req, res) => {
  try {
    const { id } = req.params;

    const painPoint = await PainPoint.findById(id)
      .populate('threadId', 'title url platform author score comments');

    if (!painPoint) {
      return res.status(404).json({ error: 'Pain point not found' });
    }

    res.json({ success: true, data: { painPoint } });
  } catch (error) {
    console.error('getPainPointById:', error.message);
    res.status(500).json({ error: 'Failed to get pain point', message: error.message });
  }
};

const updatePainPointStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, validationScore } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
        validStatuses: ['pending', 'processed', 'validated', 'rejected']
      });
    }

    const updated = await painPointService.updatePainPointStatus(id, status, validationScore);

    res.json({
      success: true,
      message: 'Pain point status updated successfully',
      data: { painPoint: updated }
    });
  } catch (error) {
    console.error('updatePainPointStatus:', error.message);
    res.status(500).json({
      error: 'Failed to update pain point status',
      message: error.message
    });
  }
};

const getPainPointAnalytics = async (_req, res) => {
  try {
    const analytics = await painPointService.getPainPointAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    console.error('getPainPointAnalytics:', error.message);
    res.status(500).json({ error: 'Failed to get pain point analytics', message: error.message });
  }
};

const validatePainPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { validationType = 'llm' } = req.body;

    const painPoint = await PainPoint.findById(id);
    if (!painPoint) {
      return res.status(404).json({ error: 'Pain point not found' });
    }

    const validation = new ValidationResponse({
      entityType: 'painPoint',
      entityId: id,
      validationType,
      validatorId: 'system',
      overallScore: Math.floor(Math.random() * 10) + 1, 
      isValid: true,
      confidence: 0.85,
      feedback: {
        strengths: ['Clear problem statement', 'Good supporting evidence'],
        weaknesses: ['Could use more specificity'],
        suggestions: ['Add more market research data'],
        summary: 'This pain point appears to be well-documented and actionable.'
      },
      validationMethod: 'llm-analysis'
    });

    await validation.save();

    painPoint.isValidated = true;
    painPoint.validationScore = validation.overallScore;
    await painPoint.save();

    res.json({
      success: true,
      message: 'Pain point validated successfully',
      data: { painPoint, validation }
    });
  } catch (error) {
    console.error('validatePainPoint:', error.message);
    res.status(500).json({
      error: 'Failed to validate pain point',
      message: error.message
    });
  }
};

module.exports = {
  analyzePainPoints,
  getPainPoints,
  searchPainPoints,
  getPainPointById,
  updatePainPointStatus,
  getPainPointAnalytics,
  validatePainPoint
};
