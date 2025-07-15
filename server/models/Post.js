const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  author: String,
  text: String,
  createdAt: Date,
});

const postSchema = new mongoose.Schema({
  redditPostId: { type: String, required: true, unique: true },
  subreddit: { type: String, required: true },
  topic: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  upvotes: { type: Number, default: 0 },
  postDate: { type: Date, required: true },
  url: { type: String, required: true },
  isProcessed: { type: Boolean, default: false },
  summary: { type: String },                
  tags: [{ type: String }],
  category: { type: String },                 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  isManuallyAdded: { type: Boolean, default: false },
  status: { type: String, default: "processed" },
  createdAt: { type: Date, default: Date.now },
  comments: [CommentSchema],
});

module.exports = mongoose.model("Post", postSchema);
