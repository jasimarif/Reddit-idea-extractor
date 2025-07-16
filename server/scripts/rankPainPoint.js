
require('dotenv').config();
const mongoose = require('mongoose');
const PainPoint = require('../models/PainPoint');

const weights = {
  frequency: 0.30,
  intensity: 0.25,
  urgency: 0.20,
  marketSize: 0.15,
  llmConfidence: 0.10
};

async function connectToDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pain-point-analyzer';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

function calculateRankScore(painPoint) {
  let score = 0;

  const frequencyScore = Math.min(painPoint.frequency * 5, 30);
  score += frequencyScore * weights.frequency / 0.30;

  const intensityMap = { 'Low': 8, 'Medium': 16, 'High': 25 };
  const intensityScore = intensityMap[painPoint.intensity] || 16;
  score += intensityScore * weights.intensity / 0.25;

  const urgencyMap = { 'Low': 6, 'Medium': 13, 'High': 20 };
  const urgencyScore = urgencyMap[painPoint.urgency] || 13;
  score += urgencyScore * weights.urgency / 0.20;

  const marketSizeMap = { 'Small': 5, 'Medium': 10, 'Large': 15, 'Unknown': 8 };
  const marketSizeScore = marketSizeMap[painPoint.marketSize] || 8;
  score += marketSizeScore * weights.marketSize / 0.15;

  const llmScore = (painPoint.llmConfidenceScore || 0.5) * 10;
  score += llmScore * weights.llmConfidence / 0.10;

  score += calculateBonusScore(painPoint);

  return Math.min(Math.round(score), 100);
}

function calculateBonusScore(painPoint) {
  let bonus = 0;

  if (painPoint.quotes && painPoint.quotes.length > 0) {
    const avgQuoteLength = painPoint.quotes.reduce((sum, quote) => sum + (quote.text || '').length, 0) / painPoint.quotes.length;
    if (avgQuoteLength > 100) bonus += 3;
    else if (avgQuoteLength > 50) bonus += 2;
    else bonus += 1;
  }

  if (painPoint.keywords && painPoint.keywords.length > 5) {
    bonus += 3;
  } else if (painPoint.keywords && painPoint.keywords.length > 2) {
    bonus += 2;
  }

  if (painPoint.isValidated && painPoint.validationScore > 7) {
    bonus += 2;
  } else if (painPoint.isValidated) {
    bonus += 1;
  }

  return Math.min(bonus, 10);
}

async function rankAllPainPoints() {
  console.log('Starting pain point ranking process...');
  const painPoints = await PainPoint.find({ status: { $ne: 'rejected' } });
  console.log(`Found ${painPoints.length} pain points to rank`);
  let updated = 0;

  for (const painPoint of painPoints) {
    const oldScore = painPoint.rankScore;
    const newScore = calculateRankScore(painPoint);

    if (Math.abs(oldScore - newScore) > 1) {
      painPoint.rankScore = newScore;
      await painPoint.save();
      updated++;
      console.log(`Updated "${painPoint.title.substring(0, 50)}..." - Score: ${oldScore} → ${newScore}`);
    }
  }

  console.log(`Ranking complete! Updated ${updated} pain points`);
  return { total: painPoints.length, updated };
}

async function getTopPainPoints(limit = 20) {
  return await PainPoint.find({ status: { $ne: 'rejected' } })
    .sort({ rankScore: -1 })
    .limit(limit)
    .populate('threadId', 'title platform url');
}

async function getCategoryBreakdown() {
  return await PainPoint.aggregate([
    { $match: { status: { $ne: 'rejected' } } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgScore: { $avg: '$rankScore' },
        maxScore: { $max: '$rankScore' },
        totalFrequency: { $sum: '$frequency' }
      }
    },
    { $sort: { avgScore: -1 } }
  ]);
}

async function generateRankingReport() {
  console.log('\nGenerating ranking report...\n');
  const topPainPoints = await getTopPainPoints(10);
  const categoryBreakdown = await getCategoryBreakdown();
  const totalPainPoints = await PainPoint.countDocuments({ status: { $ne: 'rejected' } });

  console.log('TOP 10 PAIN POINTS:');
  console.log('='.repeat(60));
  topPainPoints.forEach((pp, index) => {
    console.log(`${index + 1}. [${pp.rankScore}] ${pp.title.substring(0, 50)}...`);
    console.log(`   Category: ${pp.category} | Intensity: ${pp.intensity} | Frequency: ${pp.frequency}`);
    console.log('');
  });

  console.log('\nCATEGORY BREAKDOWN:');
  console.log('='.repeat(60));
  categoryBreakdown.forEach(cat => {
    console.log(`${cat._id}: ${cat.count} pain points (Avg Score: ${cat.avgScore.toFixed(1)})`);
  });

  console.log(`\nTOTAL PAIN POINTS: ${totalPainPoints}`);

  return { topPainPoints, categoryBreakdown, totalPainPoints };
}

async function run() {
  try {
    await connectToDatabase();
    const rankingResult = await rankAllPainPoints();
    const report = await generateRankingReport();
    console.log('\nPain point ranking completed successfully!');
    return { ranking: rankingResult, report };
  } catch (error) {
    console.error('Pain point ranking failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  run()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  run,
  rankAllPainPoints,
  calculateRankScore,
  generateRankingReport
};