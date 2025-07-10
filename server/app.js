const express = require("express");
const cors = require("cors");
require("dotenv").config();
const redditRoutes = require("./routes/reddit.route");
const summarizeRoutes = require("./routes/summarize.route")
const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/summarize", summarizeRoutes)
app.use("/api/reddit", redditRoutes);

module.exports = app;


