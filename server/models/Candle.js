const mongoose = require("mongoose");

const retentionDays = Number(process.env.CANDLE_RETENTION_DAYS || 7);

const candleSchema = new mongoose.Schema(
  {
    coinId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    open: { type: Number, required: true },
    high: { type: Number, required: true },
    low: { type: Number, required: true },
    close: { type: Number, required: true },
    volume: { type: Number, default: 0 },
  },
  { timestamps: false }
);

candleSchema.index({ coinId: 1, timestamp: 1 }, { unique: true });
candleSchema.index({ coinId: 1, timestamp: -1 });
candleSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: Math.max(1, retentionDays) * 24 * 60 * 60 }
);

module.exports = mongoose.model("Candle", candleSchema);
