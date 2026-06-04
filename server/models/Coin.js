const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    color: { type: String, default: "#888888" },
    basePrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    volatility: { type: Number, default: 0.015 },
    isCustom: { type: Boolean, default: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    supply: { type: Number, default: null },
    description: { type: String, default: "" },
    priceHistory: { type: [Number], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coin", coinSchema);
