const mongoose = require("mongoose");

const candleSchema = new mongoose.Schema(
  {
    coinId:    { type: String, required: true, index: true },
    timestamp: { type: Date,   required: true },   // candle open time (floored to minute)
    open:      { type: Number, required: true },
    high:      { type: Number, required: true },
    low:       { type: Number, required: true },
    close:     { type: Number, required: true },
    volume:    { type: Number, default: 0 },
  },
  { timestamps: false }
);

candleSchema.index({ coinId: 1, timestamp: -1 });

module.exports = mongoose.model("Candle", candleSchema);
