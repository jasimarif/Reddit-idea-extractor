const express = require("express");
const router = express.Router();
const { summarizeReddit } = require("../controllers/summarize.controller");

router.post("/", summarizeReddit);

module.exports = router;
