const { Router } = require("express");
const { getPortfolio, getHistory } = require("../controllers/portfolioController");
const { protect } = require("../middleware/auth");

const router = Router();

router.get("/",        protect, getPortfolio);
router.get("/history", protect, getHistory);

module.exports = router;
