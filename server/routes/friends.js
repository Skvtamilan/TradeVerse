const { Router } = require("express");
const {
  searchUsers, sendRequest, respondRequest,
  getFriends, getPending, removeFriend, getLeaderboard,
} = require("../controllers/friendsController");
const { protect } = require("../middleware/auth");

const router = Router();

router.get("/search",             protect, searchUsers);
router.get("/",                   protect, getFriends);
router.get("/pending",            protect, getPending);
router.get("/leaderboard",        protect, getLeaderboard);
router.post("/request/:userId",   protect, sendRequest);
router.put("/respond/:friendshipId", protect, respondRequest);
router.delete("/:friendshipId",   protect, removeFriend);

module.exports = router;
