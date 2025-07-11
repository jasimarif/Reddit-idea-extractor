const express = require("express");
const cors = require("cors");
require("dotenv").config();
const redditRoutes = require("./routes/reddit.route");
const summarizeRoutes = require("./routes/summarize.route");
const authRoutes = require("./routes/auth.route");
const ideaRoutes = require("./routes/idea.route");
const favoriteRoutes = require("./routes/favorite.route");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api/summarize", summarizeRoutes);
app.use("/api/reddit", redditRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/favorites", favoriteRoutes);

module.exports = app;
