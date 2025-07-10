const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  subreddit: { type: String, required: true },
  topic: { type: String, required: true }, // e.g. "Wealth"
  title: { type: String, required: true },
  body: { type: String, default: "" },
  upvotes: { type: Number, default: 0 },
  postDate: { type: Date, required: true },
  url: { type: String, required: true },
  isProcessed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
