const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const PainPoint = require('../models/PainPoint');
const BusinessIdea = require('../models/BusinessIdea');

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

const parseObjectField = (value) => {
  if (!value || value.trim() === '') return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
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

module.exports = { importPainPointsFromCsv, importBusinessIdeasFromCsv };
