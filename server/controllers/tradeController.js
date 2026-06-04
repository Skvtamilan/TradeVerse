const mongoose = require("mongoose");
const User = require("../models/User");
const Coin = require("../models/Coin");
const Portfolio = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { usdToCredits } = require("../config/coins");

const resolveTrade = (priceCredits, { quantityCredits, quantityCoins }) => {
  if (quantityCredits !== undefined && quantityCredits !== "") {
    const credits = parseFloat(quantityCredits);
    if (!Number.isFinite(credits) || credits <= 0) return null;
    return { creditAmount: credits, coinQty: credits / priceCredits };
  }

  if (quantityCoins !== undefined && quantityCoins !== "") {
    const qty = parseFloat(quantityCoins);
    if (!Number.isFinite(qty) || qty <= 0) return null;
    return { creditAmount: qty * priceCredits, coinQty: qty };
  }

  return null;
};

const transactionOptions = {
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
};

const buy = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    let payload;

    await session.withTransaction(async () => {
      const coin = await Coin.findOne({ id: req.body.coinId?.toUpperCase() }).session(session);
      if (!coin) {
        const err = new Error("Coin not found");
        err.statusCode = 404;
        throw err;
      }

      const priceCredits = usdToCredits(coin.currentPrice);
      if (!Number.isFinite(priceCredits) || priceCredits <= 0) {
        const err = new Error("Coin price is unavailable");
        err.statusCode = 400;
        throw err;
      }

      const trade = resolveTrade(priceCredits, req.body);
      if (!trade) {
        const err = new Error("Provide a positive quantityCredits or quantityCoins");
        err.statusCode = 400;
        throw err;
      }

      const user = await User.findOneAndUpdate(
        { _id: req.user._id, credits: { $gte: trade.creditAmount } },
        { $inc: { credits: -trade.creditAmount } },
        { new: true, session }
      );
      if (!user) {
        const err = new Error("Insufficient credits");
        err.statusCode = 400;
        throw err;
      }

      const portfolio = await Portfolio.findOne({ user: req.user._id }).session(session);
      if (!portfolio) {
        const err = new Error("Portfolio not found");
        err.statusCode = 404;
        throw err;
      }

      portfolio.updateHolding(coin.id, trade.coinQty, coin.currentPrice);
      await portfolio.save({ session });

      const [tx] = await Transaction.create([{
        user: req.user._id,
        type: "buy",
        coinId: coin.id,
        coinName: coin.name,
        quantity: trade.coinQty,
        priceUsd: coin.currentPrice,
        totalUsd: trade.coinQty * coin.currentPrice,
        creditsUsed: trade.creditAmount,
      }], { session });

      payload = {
        credits: user.credits,
        coinQty: trade.coinQty,
        creditAmount: trade.creditAmount,
        tx,
      };
    }, transactionOptions);

    res.json(payload);
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

const sell = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    let payload;

    await session.withTransaction(async () => {
      const coin = await Coin.findOne({ id: req.body.coinId?.toUpperCase() }).session(session);
      if (!coin) {
        const err = new Error("Coin not found");
        err.statusCode = 404;
        throw err;
      }

      const priceCredits = usdToCredits(coin.currentPrice);
      if (!Number.isFinite(priceCredits) || priceCredits <= 0) {
        const err = new Error("Coin price is unavailable");
        err.statusCode = 400;
        throw err;
      }

      const trade = resolveTrade(priceCredits, req.body);
      if (!trade) {
        const err = new Error("Provide a positive quantityCredits or quantityCoins");
        err.statusCode = 400;
        throw err;
      }

      const portfolio = await Portfolio.findOne({ user: req.user._id }).session(session);
      if (!portfolio) {
        const err = new Error("Portfolio not found");
        err.statusCode = 404;
        throw err;
      }

      const holding = portfolio.holdings.find((h) => h.coinId === coin.id);
      if (!holding || holding.quantity < trade.coinQty) {
        const err = new Error("Insufficient holdings");
        err.statusCode = 400;
        throw err;
      }

      portfolio.updateHolding(coin.id, -trade.coinQty, coin.currentPrice);
      await portfolio.save({ session });

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { credits: trade.creditAmount } },
        { new: true, session }
      );

      const [tx] = await Transaction.create([{
        user: req.user._id,
        type: "sell",
        coinId: coin.id,
        coinName: coin.name,
        quantity: trade.coinQty,
        priceUsd: coin.currentPrice,
        totalUsd: trade.coinQty * coin.currentPrice,
        creditsUsed: trade.creditAmount,
      }], { session });

      payload = {
        credits: user.credits,
        coinQty: trade.coinQty,
        creditAmount: trade.creditAmount,
        tx,
      };
    }, transactionOptions);

    res.json(payload);
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};

module.exports = { buy, sell };
