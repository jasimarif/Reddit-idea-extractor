const express = require("express");
const router = express.Router();
const { getRedditData, fetchAndStoreRawIdeas, getRawIdeas, getSubredditCounts } = require("../controllers/reddit.controller");

router.post("/", getRedditData);
router.post("/fetch-raw", fetchAndStoreRawIdeas);
router.get("/raw-ideas", getRawIdeas);
router.get("/subreddit-counts", getSubredditCounts);

module.exports = router;
