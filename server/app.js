const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const redditRoutes = require("./routes/reddit.route");

app.use(express.json());

app.use(cors());

app.use("/api/reddit", redditRoutes);

module.exports = app;


