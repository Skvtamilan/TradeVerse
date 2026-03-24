const User        = require("../models/User");
const Coin        = require("../models/Coin");
const Portfolio   = require("../models/Portfolio");
const Transaction = require("../models/Transaction");
const { usdToCredits } = require("../config/coins");

const resolveTrade = (priceCredits, { quantityCredits, quantityCoins }) => {
  if (quantityCredits) {
    const credits = parseFloat(quantityCredits);
    return { creditAmount: credits, coinQty: credits / priceCredits };
  }
  if (quantityCoins) {
    const qty = parseFloat(quantityCoins);
    return { creditAmount: qty * priceCredits, coinQty: qty };
  }
  return null;
};

// POST /api/trade/buy
const buy = async (req, res, next) => {
  try {
    const coin = await Coin.findOne({ id: req.body.coinId?.toUpperCase() });
    if (!coin) return res.status(404).json({ message: "Coin not found" });

    const priceCredits = usdToCredits(coin.currentPrice);
    const trade = resolveTrade(priceCredits, req.body);
    if (!trade || trade.coinQty <= 0)
      return res.status(400).json({ message: "Provide a positive quantityCredits or quantityCoins" });

    if (req.user.credits < trade.creditAmount)
      return res.status(400).json({ message: "Insufficient credits" });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: -trade.creditAmount } },
      { new: true }
    );

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    portfolio.updateHolding(coin.id, trade.coinQty, coin.currentPrice);
    await portfolio.save();

    const tx = await Transaction.create({
      user: req.user._id, type: "buy",
      coinId: coin.id, coinName: coin.name,
      quantity: trade.coinQty, priceUsd: coin.currentPrice,
      totalUsd: trade.coinQty * coin.currentPrice,
      creditsUsed: trade.creditAmount,
    });

    res.json({ credits: user.credits, coinQty: trade.coinQty, creditAmount: trade.creditAmount, tx });
  } catch (err) { next(err); }
};

// POST /api/trade/sell
const sell = async (req, res, next) => {
  try {
    const coin = await Coin.findOne({ id: req.body.coinId?.toUpperCase() });
    if (!coin) return res.status(404).json({ message: "Coin not found" });

    const priceCredits = usdToCredits(coin.currentPrice);
    const trade = resolveTrade(priceCredits, req.body);
    if (!trade || trade.coinQty <= 0)
      return res.status(400).json({ message: "Provide a positive quantityCredits or quantityCoins" });

    const portfolio = await Portfolio.findOne({ user: req.user._id });
    const holding   = portfolio.holdings.find(h => h.coinId === coin.id);
    if (!holding || holding.quantity < trade.coinQty)
      return res.status(400).json({ message: "Insufficient holdings" });

    portfolio.updateHolding(coin.id, -trade.coinQty, coin.currentPrice);
    await portfolio.save();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { credits: trade.creditAmount } },
      { new: true }
    );

    const tx = await Transaction.create({
      user: req.user._id, type: "sell",
      coinId: coin.id, coinName: coin.name,
      quantity: trade.coinQty, priceUsd: coin.currentPrice,
      totalUsd: trade.coinQty * coin.currentPrice,
      creditsUsed: trade.creditAmount,
    });

    res.json({ credits: user.credits, coinQty: trade.coinQty, creditAmount: trade.creditAmount, tx });
  } catch (err) { next(err); }
};

module.exports = { buy, sell };
