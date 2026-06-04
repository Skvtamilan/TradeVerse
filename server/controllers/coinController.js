const mongoose = require("mongoose");
const Coin = require("../models/Coin");
const User = require("../models/User");
const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { usdToCredits } = require("../config/coins");

const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value);

const transactionOptions = {
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
};

const getAllCoins = async (_req, res, next) => {
  try {
    const coins = await Coin.find()
      .select("-priceHistory")
      .sort({ isCustom: 1, name: 1 })
      .lean();
    res.json(coins);
  } catch (err) {
    next(err);
  }
};

const getCoin = async (req, res, next) => {
  try {
    const coin = await Coin.findOne({ id: req.params.id.toUpperCase() });
    if (!coin) return res.status(404).json({ message: "Coin not found" });
    res.json(coin);
  } catch (err) {
    next(err);
  }
};

const createCoin = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    let payload;
    const { name, symbol, initialPrice, supply, description, color } = req.body;
    const coinName = name?.trim();
    const rawTicker = symbol?.trim().toUpperCase();
    const price = parseFloat(initialPrice);
    const qty = parseFloat(supply);

    if (!coinName || !rawTicker || initialPrice === undefined || supply === undefined)
      return res.status(400).json({ message: "name, symbol, initialPrice and supply are required" });

    if (!/^[A-Z0-9]{2,6}$/.test(rawTicker))
      return res.status(400).json({ message: "Ticker must be 2-6 letters or numbers" });

    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(qty) || qty <= 0)
      return res.status(400).json({ message: "initialPrice and supply must be positive numbers" });

    const ticker = rawTicker;
    const launchCost = usdToCredits(price * qty * 0.01);

    await session.withTransaction(async () => {
      if (await Coin.exists({ id: ticker }).session(session)) {
        const err = new Error(`Ticker ${ticker} already exists`);
        err.statusCode = 400;
        throw err;
      }

      const user = await User.findOneAndUpdate(
        { _id: req.user._id, credits: { $gte: launchCost } },
        { $inc: { credits: -launchCost } },
        { new: true, session }
      );
      if (!user) {
        const err = new Error(`Insufficient credits - need ${launchCost.toFixed(4)} CR`);
        err.statusCode = 400;
        throw err;
      }

      const [coin] = await Coin.create([{
        id: ticker,
        name: coinName,
        symbol: ticker[0],
        color: isHexColor(color) ? color : "#888888",
        basePrice: price,
        currentPrice: price,
        volatility: 0.02,
        isCustom: true,
        creator: req.user._id,
        supply: qty,
        description: description?.trim() || "",
        priceHistory: [price],
      }], { session });

      const portfolio = await Portfolio.findOne({ user: req.user._id }).session(session);
      if (!portfolio) {
        const err = new Error("Portfolio not found");
        err.statusCode = 404;
        throw err;
      }

      portfolio.updateHolding(ticker, qty, price);
      await portfolio.save({ session });

      await Transaction.create([{
        user: req.user._id,
        type: "create",
        coinId: ticker,
        coinName,
        quantity: qty,
        priceUsd: price,
        totalUsd: price * qty,
        creditsUsed: launchCost,
      }], { session });

      payload = { coin, launchCost, credits: user.credits };
    }, transactionOptions);

    res.status(201).json(payload);
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

module.exports = { getAllCoins, getCoin, createCoin };
