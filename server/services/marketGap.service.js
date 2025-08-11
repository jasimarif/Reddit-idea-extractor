const BusinessIdea = require('../models/BusinessIdea');
const langchain = require('./langchain.service');

async function generateBusinessIdeas(painPoints) {
  console.log('Starting business idea generation with pain points:', JSON.stringify(painPoints, null, 2));
  
  try {
    // Validate input
    if (!Array.isArray(painPoints) || painPoints.length === 0) {
      throw new Error('No pain points provided');
    }

    // Format pain points with enhanced context
    const formattedPainPoints = painPoints.map(pp => ({
      title: pp.title || 'Untitled Pain Point',
      description: pp.summary,
      category: pp.category || 'General',
      intensity: pp.intensity || 'Medium',
      urgency: pp.urgency || 'Medium',
      url: pp.url || '',
      rankScore: pp.rankScore || 0,
      businessPotential: pp.businessPotential || 'Medium',
      quotes: Array.isArray(pp.quotes) ? pp.quotes : [],
      keywords: Array.isArray(pp.keywords) ? pp.keywords : [],
    }));
    
    console.log('Formatted pain points for AI:', JSON.stringify(formattedPainPoints, null, 2));
    
    try {
      // const agent = await langchain.getMarketGapAgent();
      // const prompt = formattedPainPoints;
      // const response = await agent.invoke({ input: prompt });
      const agent = await langchain.getClaudeMarketGapAgent();
      const prompt = formattedPainPoints;
      const response = await agent.invoke({ input: prompt });
      console.log('OpenAI response:', JSON.stringify(response, null, 2));
      let aiIdeas;
      try {
        const responseContent = response.response || response.text || response;
        aiIdeas = typeof responseContent === 'string' ? JSON.parse(responseContent) : responseContent;
      } catch (e) {
        console.error('Failed to parse OpenAI response:', response.response);
        throw new Error('Invalid JSON response from OpenAI agent');
      }
      const ideasArr = Array.isArray(aiIdeas) ? aiIdeas : (aiIdeas.businessIdeas || aiIdeas.ideas || []);
      if (!Array.isArray(ideasArr) || ideasArr.length === 0) throw new Error('No business ideas returned by OpenAI agent');
      const savedIdeas = [];
      let saveErrors = [];
      
      for (let i = 0; i < ideasArr.length; i++) {
        const aiIdea = ideasArr[i];
        console.log(`Processing AI idea ${i + 1}/${ideasArr.length}`);
        
        try {
          // Ensure we have a valid idea object
          if (!aiIdea || typeof aiIdea !== 'object') {
            console.warn(`Skipping invalid idea at index ${i}:`, aiIdea);
            continue;
          }

          // Transform AI idea to match our schema
          const allowedBusinessModels = [
            "SaaS",
            "Marketplace",
            "Subscription",
            "Freemium",
            "Service",
            "Platform",
            "Other",
          ];
          // Try to match AI's businessModel to allowed enums, fallback to 'Other'
          let businessModel = String(aiIdea.businessModel || 'Other').trim();
          if (!allowedBusinessModels.includes(businessModel)) {
            // Try to map common phrases to enums
            const lower = businessModel.toLowerCase();
            if (lower.includes('saas')) businessModel = 'SaaS';
            else if (lower.includes('marketplace')) businessModel = 'Marketplace';
            else if (lower.includes('subscription')) businessModel = 'Subscription';
            else if (lower.includes('freemium')) businessModel = 'Freemium';
            else if (lower.includes('service')) businessModel = 'Service';
            else if (lower.includes('platform')) businessModel = 'Platform';
            else businessModel = 'Other';
          }

          // Ensure targetAudience is a string (join array if needed)
          let targetAudience = aiIdea.targetAudience;
          if (Array.isArray(targetAudience)) {
            targetAudience = targetAudience.join(', ');
          } else if (typeof targetAudience !== 'string' || !targetAudience.trim()) {
            // Fallback: generate a unique audience based on idea name
            targetAudience = `Ideal users for ${aiIdea.ideaName || `Business Idea ${i + 1}`}`;
          }

          // Remove repetition between description and problemStatement
          let description = String(aiIdea.description || 'No description provided').trim();
          let problemStatement = String(aiIdea.problemStatement || description || 'No problem statement provided').trim();
          if (problemStatement === description) {
            problemStatement = `Pain point addressed: ${description} This solution specifically targets the underlying challenge described above.`;
          }

          // Helper to ensure array fields have at least 2 unique items
          function ensureArray(field, fallback, ideaIdx, fieldName) {
            if (Array.isArray(field) && field.length >= 2) {
              // Make sure items are unique
              return [...new Set(field)];
            }
            // If only one item, add a unique fallback
            if (Array.isArray(field) && field.length === 1) {
              return [field[0], `${fallback[1]} (${ideaIdx + 1})`];
            }
            // If empty or not array, generate unique fallbacks
            return fallback.map((item, idx) => `${item} (${ideaIdx + 1})`);
          }

          // Always fill differentiator and useCase with unique fallback if missing
          const differentiator = aiIdea.differentiator && aiIdea.differentiator.trim()
            ? aiIdea.differentiator.trim()
            : `Unique value proposition for ${aiIdea.ideaName || `Business Idea ${i + 1}`}`;
          const useCase = aiIdea.useCase && aiIdea.useCase.trim() && !aiIdea.useCase.startsWith('Example use case')
            ? aiIdea.useCase.trim()
            : (aiIdea.description ? `For example: ${aiIdea.description.slice(0, 80)}...` : "");

          // Keywords, score, rankingReason
          const keywords = Array.isArray(aiIdea.keywords) ? aiIdea.keywords : [];
          const score = typeof aiIdea.score === 'number' ? aiIdea.score : 5.0;
          const rankingReason = aiIdea.rankingReason || (aiIdea.description ? `Generated for idea: ${aiIdea.ideaName || "Idea"}` : "");

          // Remove empty/placeholder fields
          const cleanArray = (arr) => Array.isArray(arr) ? arr.filter(x => x && typeof x === 'string') : [];

          const ideaData = {
            // Required fields with non-empty defaults
            ideaName: String(aiIdea.ideaName || `Business Idea ${i + 1}`).trim(),
            description,
            problemStatement,
            solutionOverview: String(aiIdea.solutionOverview || description || 'No solution overview provided').trim(),
            uniqueValueProposition: cleanArray(aiIdea.uniqueValueProposition || aiIdea.valueProposition || []),
            keyFeatures: cleanArray(aiIdea.keyFeatures),
            targetAudience,
            businessModel,
            marketCategory: String(aiIdea.marketCategory),
            revenueStreams: cleanArray(aiIdea.revenueStreams),
            mvpFeatures: Array.isArray(aiIdea.mvpFeatures) ? aiIdea.mvpFeatures : [],
            implementationSteps: cleanArray(aiIdea.implementationSteps),
            technicalFeasibility: typeof aiIdea.technicalFeasibility === 'object' && aiIdea.technicalFeasibility ? aiIdea.technicalFeasibility : {},
            marketFeasibility: typeof aiIdea.marketFeasibility === 'object' && aiIdea.marketFeasibility ? aiIdea.marketFeasibility : {},
            potentialChallenges: cleanArray(aiIdea.potentialChallenges),
            successMetrics: cleanArray(aiIdea.successMetrics),
            painPointIds: painPoints
              .filter(pp => pp && pp._id && typeof pp._id === 'object' && pp._id.toString)
              .map(pp => pp._id),
            status: 'generated',
            source: 'ai-generated',
            potentialScore: Number(aiIdea.potentialScore) || 0,
            feasibilityScore: Number(aiIdea.feasibilityScore) || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            differentiators: aiIdea.differentiators || differentiator || differentiators,
            useCase,
            keywords,
            rankingReason
          };
          
          console.log(`Saving idea ${i + 1}:`, JSON.stringify(ideaData, null, 2));
          
          const newIdea = new BusinessIdea(ideaData);
          const savedIdea = await newIdea.save();
          console.log(`Successfully saved idea ${i + 1} with ID:`, savedIdea._id);
          savedIdeas.push(savedIdea);
          
        } catch (saveError) {
          const errorMsg = `Error saving business idea ${i + 1}: ${saveError.message}`;
          console.error(errorMsg, saveError);
          saveErrors.push(errorMsg);
          // Continue with other ideas even if one fails
        }
      }

      if (savedIdeas.length === 0) {
        const errorDetails = saveErrors.length > 0 
          ? ` All save attempts failed. Errors: ${saveErrors.join('; ')}`
          : ' No valid ideas were generated by the AI.';
        throw new Error(`Failed to save any business ideas.${errorDetails}`);
      }

      console.log(`Successfully saved ${savedIdeas.length} business ideas`);
      return savedIdeas;
      
    } catch (aiError) {
      console.error('Error in AI idea generation:', aiError);
      throw new Error(`AI idea generation failed: ${aiError.message}`);
    }
    
  } catch (error) {
    console.error('Error in generateBusinessIdeas:', error);
    throw new Error(`Business idea generation failed: ${error.message}`);
  }
}


async function getBusinessIdeasByPainPointId(painPointId) {
  if (!painPointId || typeof painPointId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(painPointId)) {
    throw new Error('Invalid painPointId');
  }
  return BusinessIdea.find({ painPointIds: painPointId }).lean();
}

module.exports = {
  generateBusinessIdeas,
  getBusinessIdeasByPainPointId,
};
