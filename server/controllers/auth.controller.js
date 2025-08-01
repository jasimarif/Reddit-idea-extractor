const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../services/auth.service");
const { sendTokenResponse } = require("../utils/jwt");
const User = require("../models/User");

const signUp = async (req, res, next) => {
  try {
    const { name, email, password, supabaseUserId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }

    // For email/password signup, we should have a password
    if (!supabaseUserId && !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required for email signup' 
      });
    }

    // Register user in our database
    const user = await registerUser({ 
      name, 
      email, 
      password,
      supabaseUserId 
    });

    // Don't send token yet - user needs to verify email first
    res.status(201).json({ 
      success: true, 
      message: 'Registration successful. Please check your email to verify your account.',
      requiresEmailConfirmation: true
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please try again.' 
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide email and password" });
    }

    const user = await loginUser({ email, password });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  res.cookie("jwt", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { signUp, login, getMe, logout, updateProfile, changePassword, deleteAccount };
