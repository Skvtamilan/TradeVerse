const jwt       = require("jsonwebtoken");
const User      = require("../models/User");
const Portfolio = require("../models/Portfolio");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "username, email and password are required" });

    const user = await User.create({ username, email, password });
    await Portfolio.create({ user: user._id });

    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({ token: signToken(user._id), user });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = (_req, res) => res.json({ user: _req.user });

module.exports = { register, login, getMe };
