const PainPoint = require('../models/PainPoint');
const Thread = require('../models/Threads');
const openaiService = require('./openAI.service');

const calculateTextSimilarity = (text1, text2) => {
  const words1 = new Set(text1.split(' '));
  const words2 = new Set(text2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};

const findSimilarPainPoint = async (ppData) => {
  try {
    // Only search if we have keywords and category
    if (!ppData.keywords?.length && !ppData.category) return null;
    
    const similar = await PainPoint.findSimilar(ppData.keywords || [], ppData.category || '');
    for (const existing of similar) {
      // Only return if similarity is high enough
      if (existing.title && ppData.title && 
          calculateTextSimilarity(existing.title.toLowerCase(), ppData.title.toLowerCase()) > 0.7) {
        return existing;
      }
    }
    return null;
  } catch (error) {
    console.error('findSimilarPainPoint:', error.message);
    return null;
  }
};

const extractPainPointsFromThread = async (thread) => {
  logger.debug(`Extracting pain points from thread: ${thread._id} - ${thread.title?.substring(0, 50)}...`);
  
  const threadContent = {
    title: thread.title,
    content: thread.content || '',
    comments: (thread.comments || []).map(c => ({
      author: c.author || 'anonymous',
      content: c.text || c.content || '',
      score: c.score || 0
    }))
  };

  try {
    logger.debug('Calling OpenAI service to extract pain points...');
    const extracted = await openaiService.extractPainPoints(threadContent);
    logger.debug(`Extracted ${extracted.length} pain points from thread ${thread._id}`);
    
    return extracted.map((pp, index) => ({
      // Generate a unique ID for this pain point if sourceId is not available
      redditPostId: thread.sourceId ? 
        `${thread.sourceId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}` : 
        `generated-${thread._id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      title: pp.title || 'Untitled Pain Point',
      summary: pp.summary || '',
      description: pp.description || '',
      category: pp.category || thread.marketCategory || 'Other',
      subCategory: pp.subCategory || '',
      intensity: ['Low', 'Medium', 'High'].includes(pp.intensity) ? pp.intensity : 'Medium',
      urgency: ['Low', 'Medium', 'High'].includes(pp.urgency) ? pp.urgency : 'Medium',
      quotes: Array.isArray(pp.quotes) ? pp.quotes : [],
      keywords: Array.isArray(pp.keywords) ? pp.keywords : [],
      
      // Map thread data
      threadId: thread._id,
      subreddit: thread.subreddit || 'general',
      topic: thread.title || 'General',
      url: thread.url || `https://reddit.com/${thread.sourceId || ''}`,
      postDate: thread.createdAt || new Date(),
      
      // System fields
      extractedAt: new Date(),
      extractedBy: 'openai-gpt',
      
      // Ensure arrays are properly initialized
      tags: Array.isArray(pp.tags) ? pp.tags : [],
      comments: []
    }));
  } catch (error) {
    logger.error(`Error extracting pain points from thread ${thread._id}:`, error);
    throw error;
  }
};

const savePainPoints = async (painPointsData, thread) => {
  const saved = [];

  for (const pp of painPointsData) {
    const existing = await findSimilarPainPoint(pp);

    if (existing) {
      existing.frequency += 1;
      existing.quotes = [...existing.quotes, ...pp.quotes];
      existing.keywords = [...new Set([...existing.keywords, ...pp.keywords])];
      existing.rankScore = existing.calculateRankScore();
      await existing.save();
      saved.push(existing);
    } else {    
      const newPP = new PainPoint(pp);
      newPP.rankScore = newPP.calculateRankScore();
      await newPP.save();
      saved.push(newPP);
    }
  }

  return saved;
};

const analyzePainPoints = async (threadIds) => {
  const results = [];
  logger.info(`Starting pain point analysis for ${threadIds.length} thread(s)`);

  for (const threadId of threadIds) {
    const startTime = Date.now();
    logger.debug(`Processing thread ${threadId}...`);
    
    try {
      const thread = await Thread.findById(threadId);
      if (!thread) {
        const errorMsg = `Thread ${threadId} not found`;
        logger.warn(errorMsg);
        results.push({ threadId, status: 'error', error: errorMsg });
        continue;
      }

      logger.debug(`Found thread: ${thread.title?.substring(0, 50)}...`);
      const painPoints = await extractPainPointsFromThread(thread);
      logger.debug(`Saving ${painPoints.length} pain points for thread ${threadId}`);
      
      const savedPoints = await savePainPoints(painPoints, thread);
      
      results.push({
        threadId,
        status: 'success',
        painPoints: savedPoints
      });
      
      const duration = Date.now() - startTime;
      logger.info(`Processed thread ${threadId} in ${duration}ms with ${savedPoints.length} pain points`);
    } catch (error) {
      const errorMsg = `Error processing thread ${threadId}: ${error.message}`;
      logger.error(errorMsg, { error });
      
      results.push({
        threadId,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
};

const getPainPointsByCategory = async (category, limit = 50) => {
  return PainPoint.find({ category })
    .sort({ rankScore: -1 })
    .limit(limit)
    .populate('threadId', 'title url platform');
};

const getTopPainPoints = async (limit = 20) => {
  return PainPoint.find({ status: { $ne: 'rejected' } })
    .sort({ rankScore: -1, frequency: -1 })
    .limit(limit)
    .populate('threadId', 'title url platform marketCategory');
};

const searchPainPoints = async (query, filters = {}) => {
  const search = {
    $and: [
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { keywords: { $in: [new RegExp(query, 'i')] } },
          { tags: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  };

  if (filters.category) search.$and.push({ category: filters.category });
  if (filters.intensity) search.$and.push({ intensity: filters.intensity });
  if (filters.minScore) search.$and.push({ rankScore: { $gte: filters.minScore } });

  return PainPoint.find(search)
    .sort({ rankScore: -1 })
    .limit(filters.limit || 50)
    .populate('threadId', 'title url platform');
};

const updatePainPointStatus = async (id, status, validationScore = null) => {
  const update = { status };
  if (validationScore !== null) {
    update.validationScore = validationScore;
    update.isValidated = true;
  }

  const updated = await PainPoint.findByIdAndUpdate(id, update, { new: true });
  if (!updated) throw new Error('Pain point not found');
  return updated;
};

const getPainPointAnalytics = async () => {
  const byCategory = await PainPoint.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgScore: { $avg: '$rankScore' },
        avgIntensity: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$intensity', 'Low'] }, then: 1 },
                { case: { $eq: ['$intensity', 'Medium'] }, then: 2 },
                { case: { $eq: ['$intensity', 'High'] }, then: 3 }
              ],
              default: 2
            }
          }
        },
        totalFrequency: { $sum: '$frequency' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const total = await PainPoint.countDocuments();
  const validated = await PainPoint.countDocuments({ isValidated: true });

  return {
    totalPainPoints: total,
    validatedPainPoints: validated,
    validationRate: total > 0 ? (validated / total) * 100 : 0,
    byCategory
  };
};

module.exports = {
  analyzePainPoints,
  extractPainPointsFromThread,
  savePainPoints,
  findSimilarPainPoint,
  calculateTextSimilarity,
  getPainPointsByCategory,
  getTopPainPoints,
  searchPainPoints,
  updatePainPointStatus,
  getPainPointAnalytics
};
