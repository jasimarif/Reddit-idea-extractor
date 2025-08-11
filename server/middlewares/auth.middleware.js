const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const User = require('../models/User');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Supabase sends it as 'Bearer <token>')
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Fallback to cookies if needed
    else if (req.cookies && req.cookies['sb-access-token']) {
      token = req.cookies['sb-access-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);
    
    if (error || !supabaseUser) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: error?.message
      });
    }

    // Get user from your database using Supabase user ID
    const user = await User.findOne({ supabaseUserId: supabaseUser.id }).select('-password');
    
    if (!user) {
      // Check if a user with this email already exists (in case they signed up through a different provider)
      const existingUser = await User.findOne({ email: supabaseUser.email });
      
      if (existingUser) {
        // Update the existing user with the supabaseUserId
        existingUser.supabaseUserId = supabaseUser.id;
        const updatedUser = await existingUser.save();
        req.user = updatedUser;
      } else {
        // Create a new user if no user with this email exists
        const newUser = new User({
          supabaseUserId: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
          // Add other user fields as needed
        });
        
        const savedUser = await newUser.save();
        req.user = savedUser;
      }
    } else {
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = { protect };