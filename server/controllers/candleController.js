const Candle = require("../models/Candle");

// GET /api/candles/:coinId?limit=60
const getCandles = async (req, res, next) => {
  try {
    const { coinId } = req.params;
    const limit = Math.min(200, parseInt(req.query.limit) || 60);

    const candles = await Candle.find({ coinId: coinId.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    res.json(candles.reverse());
  } catch (err) { next(err); }
};

module.exports = { getCandles };
