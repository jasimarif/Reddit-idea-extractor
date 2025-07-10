const User = require("../models/User");

async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists with this email");

  const user = await User.create({ name, email, password });
  return user;
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("Invalid credentials");
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
