const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:        { type: String, enum: ["buy", "sell", "create"], required: true },
    coinId:      { type: String, required: true },
    coinName:    { type: String },
    quantity:    { type: Number, required: true },
    priceUsd:    { type: Number, required: true },
    totalUsd:    { type: Number, required: true },
    creditsUsed: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
