const mongoose = require('mongoose');
const PainPoint = require('../models/BusinessIdea');
const dbConfig = require('../config/db');

async function emptyBusinessIdeas() {
  try {
    await dbConfig(); // Connect to DB
    const result = await PainPoint.deleteMany({});
    console.log(`Deleted ${result.deletedCount} business ideas.`);
  } catch (err) {
    console.error('Error deleting business ideas:', err);
  } finally {
    mongoose.connection.close();
  }
}

emptyBusinessIdeas(); 