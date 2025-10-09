const express = require("express");
const router = express.Router();
const { 
  getTwitterData, 
  fetchAndStoreTwitterPosts, 
  getStoredTwitterData, 
  getTwitterHashtagCounts 
} = require("../controllers/twitter.controller");

// Legacy endpoint
router.post("/", getTwitterData);

//  endpoints for hashtag-based functionality
router.post("/fetch-posts", fetchAndStoreTwitterPosts);
router.get("/stored-posts", getStoredTwitterData);
router.get("/hashtag-counts", getTwitterHashtagCounts);

module.exports = router;
