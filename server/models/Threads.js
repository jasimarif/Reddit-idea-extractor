const mongoose = require("mongoose");

const ThreadSchema = new mongoose.Schema({
platform: { type: String, enum: ['reddit', 'twitter'], required: true },
sourceId: { type: String, required: true }, // Reddit ID or Tweet ID
subreddit: { type: String }, // For Reddit
author: { type: String },
title: { type: String }, // Reddit post title
content: { type: String }, // Reddit selftext or tweet text
comments: [{
author: String,
text: String,
createdAt: Date
}],
market: { type: String },
subniche: { type: String },
fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Thread", ThreadSchema);