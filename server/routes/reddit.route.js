const express = require("express");
const router = express.Router();
const { getRedditData } = require("../controllers/reddit.controller");

router.post("/", getRedditData);

module.exports = router;
