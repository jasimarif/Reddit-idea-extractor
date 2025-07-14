const User = require("../models/User");
const validator = require("validator");

async function registerUser({ name, email, password }) {
  if (
    !validator.isEmail(email) ||
    !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|net|org|edu|gov|io|co\.uk)$/i.test(
      email
    )
  ) {
    throw new Error(
      "Please enter a valid email address (e.g. user@gmail.com)."
    );
  }
  if (!validator.isStrongPassword(password))
    throw new Error("Password is not strong enough");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists with this email");

  const user = await User.create({ name, email, password });
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
