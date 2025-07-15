const express = require("express");
const router = express.Router();
const { getTwitterData } = require("../controllers/twitter.controller");

router.post("/", getTwitterData);

module.exports = router;
