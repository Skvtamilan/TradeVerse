const { Router } = require("express");
const { buy, sell } = require("../controllers/tradeController");
const { protect }   = require("../middleware/auth");

const router = Router();

router.post("/buy",  protect, buy);
router.post("/sell", protect, sell);

module.exports = router;
