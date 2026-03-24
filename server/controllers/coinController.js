const Coin        = require("../models/Coin");
const User        = require("../models/User");
const Portfolio   = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { usdToCredits } = require("../config/coins");

// GET /api/coins
const getAllCoins = async (_req, res, next) => {
  try {
    const coins = await Coin.find()
      .select("-priceHistory")
      .sort({ isCustom: 1, name: 1 })
      .lean();
    res.json(coins);
  } catch (err) { next(err); }
};

// GET /api/coins/:id
const getCoin = async (req, res, next) => {
  try {
    const coin = await Coin.findOne({ id: req.params.id.toUpperCase() });
    if (!coin) return res.status(404).json({ message: "Coin not found" });
    res.json(coin);
  } catch (err) { next(err); }
};

// POST /api/coins/create
const createCoin = async (req, res, next) => {
  try {
    const { name, symbol, initialPrice, supply, description, color } = req.body;
    if (!name || !symbol || !initialPrice || !supply)
      return res.status(400).json({ message: "name, symbol, initialPrice and supply are required" });

    const ticker = symbol.toUpperCase();
    if (await Coin.exists({ id: ticker }))
      return res.status(400).json({ message: `Ticker ${ticker} already exists` });

    const price        = parseFloat(initialPrice);
    const qty          = parseFloat(supply);
    const launchCost   = usdToCredits(price * qty * 0.01);

    if (req.user.credits < launchCost)
      return res.status(400).json({ message: `Insufficient credits — need ${launchCost.toFixed(4)} CR` });

    const [coin] = await Promise.all([
      Coin.create({
        id: ticker, name, symbol: ticker[0],
        color: color || "#888888",
        basePrice: price, currentPrice: price, volatility: 0.02,
        isCustom: true, creator: req.user._id,
        supply: qty, description: description || "",
        priceHistory: [price],
      }),
      User.findByIdAndUpdate(req.user._id, { $inc: { credits: -launchCost } }),
    ]);

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    portfolio.updateHolding(ticker, qty, price);
    await Promise.all([
      portfolio.save(),
      Transaction.create({
        user: req.user._id, type: "create",
        coinId: ticker, coinName: name,
        quantity: qty, priceUsd: price,
        totalUsd: price * qty, creditsUsed: launchCost,
      }),
    ]);

    res.status(201).json({ coin, launchCost });
  } catch (err) { next(err); }
};

module.exports = { getAllCoins, getCoin, createCoin };
