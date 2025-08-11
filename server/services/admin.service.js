const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const PainPoint = require('../models/PainPoint');
const BusinessIdea = require('../models/BusinessIdea');
const Thread = require('../models/Threads')

const parseArrayField = (value) => {
  if (!value || value.trim() === '') return [];
  try {
    if (value.startsWith('[') && value.endsWith(']')) {
      return JSON.parse(value);
    }
    return value.split(',').map(item => item.trim()).filter(item => item);
  } catch {
    return [value.trim()];
  }
};

const parseCommentsArray = (value) => {
  if (!value || value.trim() === '') return [];
  try {
    if (value.startsWith('[') && value.endsWith(']')) {
      const parsed = JSON.parse(value);
      return parsed.map(comment => ({
        author: comment.author || '',
        text: comment.text || '',
        createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
        _id: comment._id ? new mongoose.Types.ObjectId(comment._id) : new mongoose.Types.ObjectId()
      }));
    }
    // Handle simple comma-separated comments (author:text format)
    return value.split('|').map(commentStr => {
      const [author, text] = commentStr.split(':');
      return {
        author: author?.trim() || 'Anonymous',
        text: text?.trim() || '',
        createdAt: new Date(),
        _id: new mongoose.Types.ObjectId()
      };
    }).filter(comment => comment.text);
  } catch {
    return [];
  }
};

const parseObjectField = (value) => {
  if (!value || value.trim() === '') return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const parseObjectIdArray = (value) => {
  if (!value || value.trim() === '') return [];
  try {
    if (value.startsWith('[') && value.endsWith(']')) {
      const parsed = JSON.parse(value);
      return parsed.map(id => new mongoose.Types.ObjectId(id));
    }
    return value.split(',').map(id => {
      try {
        return new mongoose.Types.ObjectId(id.trim());
      } catch {
        return null;
      }
    }).filter(id => id !== null);
  } catch {
    return [];
  }
};


const parseNumber = (value) => {
  if (!value || value.trim() === '') return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};


const parseObjectId = (value) => {
  if (!value || value.trim() === '') return null;
  try {
    return new mongoose.Types.ObjectId(value);
  } catch {
    return null;
  }
};

const parseDate = (value) => {
  if (!value || value.trim() === '') return new Date();
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
};

const validateEnum = (value, validValues, defaultValue) => {
  if (!value) return defaultValue;
  return validValues.includes(value) ? value : defaultValue;
};

const parseBoolean = (value) => {
  if (!value) return false;
  const lowerValue = value.toString().toLowerCase();
  return ['true', '1', 'yes', 'on'].includes(lowerValue);
};

async function importPainPointsFromCsv(filePath) {
  const painPoints = [];
  const errors = [];
  let rowIndex = 0;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv({
        skipEmptyLines: true,
        // Remove headers: true as it's not a valid option
        // csv-parser automatically treats first row as headers
      }))
      .on('data', (row) => {
        rowIndex++;
        try {
          const painPointData = {
            threadId: parseObjectId(row.threadId),
            redditPostId: row.redditPostId || null,
            subreddit: row.subreddit || '',
            topic: row.topic || 'General',
            url: row.url || '',
            postDate: parseDate(row.postDate),
            quotes: parseArrayField(row.quotes),
            title: row.title || 'Untitled',
            description: row.description || '',
            upvotes: parseInt(row.upvotes) || 0,
            businessPotential: validateEnum(row.businessPotential, ["Low", "Medium", "High"], "Medium"),
            summary: row.summary || '',
            category: row.category || 'Other',
            keywords: parseArrayField(row.keywords),
            intensity: validateEnum(row.intensity, ["Low", "Medium", "High"], "Medium"),
            urgency: validateEnum(row.urgency, ["Low", "Medium", "High"], "Medium"),
            status: validateEnum(row.status, ["pending", "processed", "validated", "rejected"], "processed"),
            userId: parseObjectId(row.userId) || null
          };

          // Validate required field
          if (!painPointData.threadId) {
            errors.push(`Row ${rowIndex}: threadId is missing or invalid`);
            return; // Skip this row
          }

          const painPoint = new PainPoint(painPointData);
          painPoint.calculateRankScore();
          painPoints.push(painPoint);
        } catch (rowError) {
          errors.push(`Row ${rowIndex}: ${rowError.message}`);
        }
      })
      .on('end', async () => {
        try {
          if (painPoints.length === 0) {
            return reject(new Error('No valid pain points found in the CSV'));
          }

          const bulkWriteOps = painPoints.map(p => ({ insertOne: { document: p } }));
          const bulkResult = await PainPoint.bulkWrite(bulkWriteOps, { 
            ordered: false,
            continueOnError: true 
          });

          resolve({
            inserted: bulkResult.insertedCount,
            totalProcessed: painPoints.length,
            errors: errors.length > 0 ? errors : []
          });
        } catch (bulkError) {
          reject(bulkError);
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

async function importBusinessIdeasFromCsv(filePath) {
  const businessIdeas = [];
  const errors = [];
  let rowIndex = 0;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv({
        skipEmptyLines: true,
      }))
      .on('data', (row) => {
        rowIndex++;
        try {
          const businessIdeaData = {
            // Source pain points
            painPointIds: parseObjectIdArray(row.painPointIds),
            mvpFeatures: parseArrayField(row.mvpFeatures),
            technicalFeasibility: row.technicalFeasibility,
            marketFeasibility: row.marketFeasibility,
            potentialScore: parseNumber(row.potentialScore),
            source: row.source || 'ai-generated',
            keywords: parseArrayField(row.keywords),
            rankingReason: row.rankingReason || '',
            createdAt: parseDate(row.createdAt),
            updatedAt: parseDate(row.updatedAt),

            // Core idea information (required fields)
            ideaName: row.ideaName?.trim() || '',
            description: row.description || '',
            problemStatement: row.problemStatement || '',
            solutionOverview: row.solutionOverview || '',

            // Business model and categorization
            businessModel: row.businessModel || '',
            keyFeatures: parseArrayField(row.keyFeatures),
            uniqueValueProposition: parseArrayField(row.uniqueValueProposition),
            revenueStreams: parseArrayField(row.revenueStreams),
            implementationSteps: parseArrayField(row.implementationSteps),
            potentialChallenges: parseArrayField(row.potentialChallenges),
            differentiators: row.differentiators || '',
            successMetrics: parseArrayField(row.successMetrics),
            marketCategory: row.marketCategory || '',
            feasibilityScore: parseNumber(row.feasibilityScore),
            technicalComplexity: row.technicalComplexity || '',

            // Scoring & viability
            overallScore: parseNumber(row.overallScore),
            targetAudience: row.targetAudience || '',

            // Generation metadata
            generatedBy: row.generatedBy || 'openai-gpt',
            generatedAt: parseDate(row.generatedAt),
            prompt: row.prompt || '',

            // Misc
            status: validateEnum(
              row.status, 
              ["draft", "generated", "reviewed"], 
              "generated"
            ),
            isPublic: parseBoolean(row.isPublic),
            differentiator: row.differentiator || '',
            useCase: row.useCase || '',
          };

          // Validate required fields
          const requiredFields = ['ideaName', 'description', 'problemStatement', 'solutionOverview', 'businessModel', 'marketCategory'];
          const missingFields = requiredFields.filter(field => !businessIdeaData[field] || businessIdeaData[field].trim() === '');
          
          if (missingFields.length > 0) {
            errors.push(`Row ${rowIndex}: Missing required fields: ${missingFields.join(', ')}`);
            return; // Skip this row
          }

          // Validate painPointIds array is not empty (required)
          if (!businessIdeaData.painPointIds || businessIdeaData.painPointIds.length === 0) {
            errors.push(`Row ${rowIndex}: painPointIds is required and must contain at least one valid ObjectId`);
            return; // Skip this row
          }

          const businessIdea = new BusinessIdea(businessIdeaData);
          businessIdeas.push(businessIdea);
        } catch (rowError) {
          errors.push(`Row ${rowIndex}: ${rowError.message}`);
        }
      })
      .on('end', async () => {
        try {
          if (businessIdeas.length === 0) {
            return reject(new Error('No valid business ideas found in the CSV'));
          }

          const bulkWriteOps = businessIdeas.map(idea => ({ insertOne: { document: idea } }));
          const bulkResult = await BusinessIdea.bulkWrite(bulkWriteOps, { 
            ordered: false,
            continueOnError: true 
          });

          resolve({
            inserted: bulkResult.insertedCount,
            totalProcessed: businessIdeas.length,
            errors: errors.length > 0 ? errors : []
          });
        } catch (bulkError) {
          reject(bulkError);
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}

async function importThreadsFromCsv(filePath) {
  const threads = [];
  const errors = [];
  let rowIndex = 0;

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
      .pipe(csv({
        skipEmptyLines: true,
      }))
      .on('data', (row) => {
        rowIndex++;
        try {
          const threadData = {
            _id: row._id ? parseObjectId(row._id) : new mongoose.Types.ObjectId(),
            platform: row.platform || 'reddit',
            sourceId: row.sourceId || '',
            subreddit: row.subreddit || '',
            author: row.author || '',
            title: row.title || '',
            content: row.content || '',
            permalink: row.permalink || '',
            upvotes: parseNumber(row.upvotes),
            commentCount: parseNumber(row.commentCount),
            matchedQuery: row.matchedQuery || null,
            comments: parseCommentsArray(row.comments),
            // painPointsExtracted: parseBoolean(row.painPointsExtracted),
            // isProcessed: parseBoolean(row.isProcessed),
            // metadata: parseObjectField(row.metadata),
            // createdAt: parseDate(row.createdAt),
            // updatedAt: parseDate(row.updatedAt),
            // fetchedAt: parseDate(row.fetchedAt),
            // __v: parseNumber(row.__v)
          };

          // Validate required fields
          const requiredFields = ['platform', 'sourceId'];
          const missingFields = requiredFields.filter(field => 
            !threadData[field] || threadData[field].toString().trim() === ''
          );
          
          if (missingFields.length > 0) {
            errors.push(`Row ${rowIndex}: Missing required fields: ${missingFields.join(', ')}`);
            return; // Skip this row
          }

          // Validate platform enum (assuming common platforms)
          const validPlatforms = ['reddit', 'twitter', 'discord', 'hackernews', 'producthunt'];
          if (!validPlatforms.includes(threadData.platform.toLowerCase())) {
            // Don't reject, just log warning
            console.warn(`Row ${rowIndex}: Unknown platform "${threadData.platform}", proceeding anyway`);
          }

          const thread = new Thread(threadData);
          threads.push(thread);
        } catch (rowError) {
          errors.push(`Row ${rowIndex}: ${rowError.message}`);
        }
      })
      .on('end', async () => {
        try {
          if (threads.length === 0) {
            return reject(new Error('No valid threads found in the CSV'));
          }

          // Use insertMany with ordered: false to continue on individual errors
          const insertOptions = {
            ordered: false,
            rawResult: true
          };

          const result = await Thread.insertMany(threads, insertOptions);

          resolve({
            inserted: result.insertedCount || threads.length,
            totalProcessed: threads.length,
            errors: errors.length > 0 ? errors : []
          });
        } catch (bulkError) {
          // Handle duplicate key errors and other bulk insert errors
          if (bulkError.writeErrors) {
            const writeErrors = bulkError.writeErrors.map(err => 
              `Document ${err.index + 1}: ${err.errmsg}`
            );
            errors.push(...writeErrors);
            
            const insertedCount = threads.length - bulkError.writeErrors.length;
            resolve({
              inserted: insertedCount,
              totalProcessed: threads.length,
              errors: errors
            });
          } else {
            reject(bulkError);
          }
        }
      })
      .on('error', (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      });
  });
}



module.exports = { importPainPointsFromCsv, importBusinessIdeasFromCsv, importThreadsFromCsv };
