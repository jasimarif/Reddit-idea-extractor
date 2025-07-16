require('dotenv').config();
const mongoose = require('mongoose');
const PainPoint = require('../models/PainPoint');

async function listPainPoints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get all pain points with basic info
    const painPoints = await PainPoint.find({})
      .select('title category status rankScore createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\nFound pain points:', painPoints.length);
    console.log('Sample pain points:');
    console.log(JSON.stringify(painPoints, null, 2));

    // Get counts by status
    const statusCounts = await PainPoint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\nCounts by status:');
    console.log(JSON.stringify(statusCounts, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listPainPoints();
