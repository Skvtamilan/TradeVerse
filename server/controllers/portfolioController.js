const Portfolio   = require("../models/Portfolio");
const Coin        = require("../models/Coin");
const Transaction = require("../models/Transaction");
const { usdToCredits } = require("../config/coins");

// GET /api/portfolio
const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    // Pull all relevant coins in one query
    const coinIds = portfolio.holdings.map(h => h.coinId);
    const coins   = await Coin.find({ id: { $in: coinIds } }).lean();
    const coinMap = Object.fromEntries(coins.map(c => [c.id, c]));

    const holdings = portfolio.holdings.map(h => {
      const coin            = coinMap[h.coinId] ?? {};
      const currentCredits  = usdToCredits(coin.currentPrice ?? 0);
      const valueCredits    = h.quantity * currentCredits;
      const costCredits     = h.quantity * usdToCredits(h.avgBuyPrice);
      return {
        coinId:       h.coinId,
        coinName:     coin.name,
        color:        coin.color,
        symbol:       coin.symbol,
        quantity:     h.quantity,
        avgBuyPrice:  h.avgBuyPrice,
        currentPrice: coin.currentPrice ?? 0,
        valueCredits,
        pnlCredits: valueCredits - costCredits,
      };
    });

    const portfolioValue = holdings.reduce((s, h) => s + h.valueCredits, 0);

    res.json({
      credits:        req.user.credits,
      holdings,
      portfolioValue,
      totalNetWorth:  req.user.credits + portfolioValue,
    });
  } catch (err) { next(err); }
};

// GET /api/portfolio/history?page=1&limit=20
const getHistory = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const [txs, total] = await Promise.all([
      Transaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Transaction.countDocuments({ user: req.user._id }),
    ]);
    res.json({ txs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

module.exports = { getPortfolio, getHistory };
