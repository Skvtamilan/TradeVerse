const Message    = require("../models/Message");
const Friendship = require("../models/Friendship");

// Verify two users are friends
const areFriends = async (userId1, userId2) => {
  const f = await Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
    status: "accepted",
  });
  return !!f;
};

// GET /api/chat/:userId  — get conversation history
const getConversation = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    if (!(await areFriends(req.user._id, otherId)))
      return res.status(403).json({ message: "You are not friends with this user" });

    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherId },
        { sender: otherId,      recipient: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "username")
      .lean();

    // Mark received messages as read
    await Message.updateMany(
      { sender: otherId, recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json(messages.reverse());
  } catch (err) { next(err); }
};

// POST /api/chat/:userId  — send a message (REST fallback; socket is primary)
const sendMessage = async (req, res, next) => {
  try {
    const otherId = req.params.userId;
    if (!(await areFriends(req.user._id, otherId)))
      return res.status(403).json({ message: "You are not friends with this user" });

    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Message cannot be empty" });

    const message = await Message.create({
      sender: req.user._id,
      recipient: otherId,
      text: text.trim(),
    });
    await message.populate("sender", "username");
    res.status(201).json(message);
  } catch (err) { next(err); }
};

// GET /api/chat/unread  — count unread messages per sender
const getUnreadCounts = async (req, res, next) => {
  try {
    const counts = await Message.aggregate([
      { $match: { recipient: req.user._id, read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);
    res.json(counts);
  } catch (err) { next(err); }
};

module.exports = { getConversation, sendMessage, getUnreadCounts };
