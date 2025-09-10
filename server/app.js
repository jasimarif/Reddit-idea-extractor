const express = require("express");
const cors = require("cors");
require("dotenv").config();
const redditRoutes = require("./routes/reddit.route");
const twitterRoutes = require("./routes/twitter.routes");
const authRoutes = require("./routes/auth.route");
const ideaRoutes = require("./routes/idea.route");
const favoriteRoutes = require("./routes/favorite.route");
const painpointRoutes = require("./routes/painpoint.route");
const marketGapRoutes = require("./routes/marketGap.route");
const landingPageRoutes = require("./routes/landingPage.route");
const adminRoutes = require("./routes/admin.route")
const cookieParser = require("cookie-parser");
const passport = require("passport");
const { initializeRedis } = require("./utils/redisClient");
require("./config/passport");

const app = express();

// Initialize Redis client
initializeRedis().catch(err => {
  console.error(`Failed to initialize Redis: ${err.message}`);
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Configure CORS with multiple allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,  // Local  or from .env
  process.env.SERVER_URL // Production backend or from .env
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in the allowed list
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  })
);

app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/reddit", redditRoutes);
app.use("/api/twitter", twitterRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/painpoints", painpointRoutes);
app.use("/api/marketgaps", marketGapRoutes);
app.use("/api/landingpages", landingPageRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
