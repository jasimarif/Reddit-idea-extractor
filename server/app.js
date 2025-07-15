const express = require("express");
const cors = require("cors");
require("dotenv").config();
const redditRoutes = require("./routes/reddit.route");
const twitterRoutes = require("./routes/twitter.routes");
const summarizeRoutes = require("./routes/summarize.route");
const authRoutes = require("./routes/auth.route");
const ideaRoutes = require("./routes/idea.route");
const favoriteRoutes = require("./routes/favorite.route");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/summarize", summarizeRoutes);
app.use("/api/reddit", redditRoutes);
app.use("/api/twitter", twitterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/favorites", favoriteRoutes);

module.exports = app;
