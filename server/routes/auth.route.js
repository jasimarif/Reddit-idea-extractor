const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signUp, login, getMe, logout, updateProfile, changePassword, deleteAccount } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware'); 

// Generate the correct callback URL based on environment
const getCallbackURL = (req) => {
  if (process.env.NODE_ENV === 'production') {
    return `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  }
  return '/api/auth/google/callback';
};

router.get("/google", (req, res, next) => {
  const callbackURL = getCallbackURL(req);
  const options = {
    scope: ["profile", "email"],
    callbackURL: callbackURL,
    state: req.query.redirect_uri || process.env.CLIENT_URL
  };
  passport.authenticate("google", options)(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    const callbackURL = getCallbackURL(req);
    const options = {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
      callbackURL: callbackURL
    };
    
    passport.authenticate("google", options, (err, user, info) => {
      if (err) {
        console.error('Google auth error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_error`);
      }
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=user_not_found`);
      }
      
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = require("../utils/jwt").generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      createdAt: req.user.createdAt,
    }));
    
    // Get the redirect URL from state or use default
    const redirectBase = req.query.state || process.env.CLIENT_URL;
    const redirectUrl = new URL(redirectBase);
    
    // Add token and user info as hash parameters
    redirectUrl.hash = `#/google/callback?token=${token}&user=${user}`;
    
    res.redirect(redirectUrl.toString());
  }
);

router.post('/signup', signUp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.delete('/me', protect, deleteAccount);
router.post('/logout', logout);

module.exports = router;
