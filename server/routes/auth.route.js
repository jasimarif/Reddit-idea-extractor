const express = require('express');
const router = express.Router();
const passport = require('passport');
const { signUp, login, getMe, logout, updateProfile, changePassword, deleteAccount } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware'); 

router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}))

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = require("../utils/jwt").generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      createdAt: req.user.createdAt,
    }));
    res.redirect(`${process.env.CLIENT_URL}/google/callback?token=${token}&user=${user}`);
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