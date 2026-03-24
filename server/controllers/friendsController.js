const User       = require("../models/User");
const Friendship = require("../models/Friendship");
const Portfolio  = require("../models/Portfolio");
const Coin       = require("../models/Coin");
const { usdToCredits } = require("../config/coins");

// GET /api/friends/search?q=username
const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q?.trim();
    if (!q || q.length < 2)
      return res.status(400).json({ message: "Query must be at least 2 characters" });

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("username _id").limit(10);

    res.json(users);
  } catch (err) { next(err); }
};

// POST /api/friends/request/:userId
const sendRequest = async (req, res, next) => {
  try {
    const recipientId = req.params.userId;
    if (recipientId === req.user._id.toString())
      return res.status(400).json({ message: "Cannot add yourself" });

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: "User not found" });

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });
    if (existing) return res.status(400).json({ message: "Request already exists" });

    const friendship = await Friendship.create({
      requester: req.user._id,
      recipient: recipientId,
    });
    res.status(201).json(friendship);
  } catch (err) { next(err); }
};

// PUT /api/friends/respond/:friendshipId
const respondRequest = async (req, res, next) => {
  try {
    const { action } = req.body;
    const friendship = await Friendship.findById(req.params.friendshipId);
    if (!friendship) return res.status(404).json({ message: "Request not found" });
    if (friendship.recipient.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your request" });

    friendship.status = action === "accept" ? "accepted" : "rejected";
    await friendship.save();
    res.json(friendship);
  } catch (err) { next(err); }
};

// GET /api/friends
const getFriends = async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: "accepted",
    }).populate("requester recipient", "username _id");

    const friends = friendships.map(f => {
      const friend =
        f.requester._id.toString() === req.user._id.toString()
          ? f.recipient
          : f.requester;
      return { _id: friend._id, username: friend.username, friendshipId: f._id };
    });

    res.json(friends);
  } catch (err) { next(err); }
};

// GET /api/friends/pending
const getPending = async (req, res, next) => {
  try {
    const pending = await Friendship.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "username _id");
    res.json(pending);
  } catch (err) { next(err); }
};

// DELETE /api/friends/:friendshipId
const removeFriend = async (req, res, next) => {
  try {
    await Friendship.findByIdAndDelete(req.params.friendshipId);
    res.json({ message: "Removed" });
  } catch (err) { next(err); }
};

// GET /api/friends/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: "accepted",
    });

    const friendIds = friendships.map(f =>
      f.requester.toString() === req.user._id.toString() ? f.recipient : f.requester
    );
    const allIds = [req.user._id, ...friendIds];

    const [users, portfolios, coins] = await Promise.all([
      User.find({ _id: { $in: allIds } }).select("username credits _id").lean(),
      Portfolio.find({ user: { $in: allIds } }).lean(),
      Coin.find().select("id currentPrice").lean(),
    ]);

    const priceMap = Object.fromEntries(coins.map(c => [c.id, c.currentPrice]));

    const board = users.map(u => {
      const portfolio = portfolios.find(p => p.user.toString() === u._id.toString());
      const portfolioCredits = (portfolio?.holdings || []).reduce((sum, h) => {
        return sum + h.quantity * usdToCredits(priceMap[h.coinId] || 0);
      }, 0);
      return {
        userId:          u._id,
        username:        u.username,
        cashCredits:     u.credits,
        portfolioCredits,
        totalNetWorth:   u.credits + portfolioCredits,
        isYou:           u._id.toString() === req.user._id.toString(),
      };
    }).sort((a, b) => b.totalNetWorth - a.totalNetWorth);

    board.forEach((entry, i) => { entry.rank = i + 1; });

    res.json(board);
  } catch (err) { next(err); }
};

module.exports = { searchUsers, sendRequest, respondRequest, getFriends, getPending, removeFriend, getLeaderboard };
