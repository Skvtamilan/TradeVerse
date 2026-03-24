const { Router } = require("express");
const { getConversation, sendMessage, getUnreadCounts } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

const router = Router();

router.get("/unread",      protect, getUnreadCounts);
router.get("/:userId",     protect, getConversation);
router.post("/:userId",    protect, sendMessage);

module.exports = router;
