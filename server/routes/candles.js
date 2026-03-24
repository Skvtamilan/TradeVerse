const { Router } = require("express");
const { getCandles } = require("../controllers/candleController");

const router = Router();

router.get("/:coinId", getCandles);   // public

module.exports = router;
