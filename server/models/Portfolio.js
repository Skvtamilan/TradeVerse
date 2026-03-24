const mongoose = require("mongoose");

const holdingSchema = new mongoose.Schema(
  {
    coinId:      { type: String, required: true },
    quantity:    { type: Number, required: true, min: 0 },
    avgBuyPrice: { type: Number, required: true },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    holdings: { type: [holdingSchema], default: [] },
  },
  { timestamps: true }
);

// Add or reduce a holding; remove it entirely when quantity reaches zero
portfolioSchema.methods.updateHolding = function (coinId, qtyDelta, priceUsd) {
  const idx = this.holdings.findIndex(h => h.coinId === coinId);

  if (idx === -1) {
    if (qtyDelta > 0) this.holdings.push({ coinId, quantity: qtyDelta, avgBuyPrice: priceUsd });
    return;
  }

  const h       = this.holdings[idx];
  const newQty  = h.quantity + qtyDelta;

  if (newQty <= 1e-9) {
    this.holdings.splice(idx, 1);
    return;
  }

  // Weighted average buy price only rises on buys
  if (qtyDelta > 0) {
    h.avgBuyPrice = (h.avgBuyPrice * h.quantity + priceUsd * qtyDelta) / newQty;
  }
  h.quantity = newQty;
};

module.exports = mongoose.model("Portfolio", portfolioSchema);
