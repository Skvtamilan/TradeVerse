const { Router } = require("express");
const { getAllCoins, getCoin, createCoin } = require("../controllers/coinController");
const { protect } = require("../middleware/auth");

const router = Router();

router.get("/",         getAllCoins);           // public — market list
router.get("/:id",      getCoin);              // public — single coin
router.post("/create",  protect, createCoin);  // auth   — launch custom coin

module.exports = router;
