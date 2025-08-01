const User = require("../models/User");
const validator = require("validator");
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function registerUser({ name, email, password, supabaseUserId }) {
  // Validate email format
  if (!validator.isEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  // Check if user already exists in our database
  const existingUser = await User.findOne({ 
    $or: [
      { email },
      { supabaseUserId }
    ] 
  });
  
  if (existingUser) {
    // If user exists with same email but different supabaseUserId, it's an error
    if (existingUser.email === email) {
      throw new Error("User already exists with this email");
    }
    // If user exists with same supabaseUserId but different email, update the email
    if (existingUser.supabaseUserId === supabaseUserId) {
      existingUser.email = email;
      existingUser.name = name;
      await existingUser.save();
      return existingUser;
    }
  }

  // Create new user in our database
  const user = await User.create({ 
    name, 
    email, 
    password: password || undefined, // Password is optional for OAuth users
    supabaseUserId,
    emailVerified: false // Will be updated after email verification
  });
  
  return user;
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid credentials");
  if (!user.password)
    throw new Error(
      "This account was created with Google. Please login with Google."
    );
  if (!(await user.comparePassword(password)))
    throw new Error("Invalid credentials");
  return user;
}

async function getCurrentUser(userId) {
  return await User.findById(userId);
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};
