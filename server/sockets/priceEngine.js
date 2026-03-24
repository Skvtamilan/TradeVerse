const Coin   = require("../models/Coin");
const Candle = require("../models/Candle");
const { COINS } = require("../config/coins");

const livePrices  = {};
const liveHistory = {};

// Per-coin in-progress candle (accumulates ticks until minute rolls over)
const openCandles = {};

const floorToMinute = (date) => {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
};

const initPrices = async () => {
  for (const c of COINS) {
    await Coin.findOneAndUpdate(
      { id: c.id },
      {
        $setOnInsert: {
          id: c.id, name: c.name, symbol: c.symbol,
          color: c.color, basePrice: c.basePrice,
          currentPrice: c.basePrice, volatility: c.volatility,
          isCustom: false, priceHistory: [c.basePrice],
        },
      },
      { upsert: true }
    );
    livePrices[c.id]  = c.basePrice;
    liveHistory[c.id] = [c.basePrice];

    // Seed an open candle
    const now = floorToMinute(new Date());
    openCandles[c.id] = { open: c.basePrice, high: c.basePrice, low: c.basePrice, close: c.basePrice, timestamp: now, ticks: 0 };
  }
  console.log(`✅  Price engine seeded ${COINS.length} coins`);
};

const tick = async (io) => {
  const allCoins = await Coin.find().lean();
  const updates  = {};
  const now      = new Date();
  const minuteBucket = floorToMinute(now);

  for (const coin of allCoins) {
    const prev  = livePrices[coin.id] ?? coin.currentPrice;
    const drift = (Math.random() - 0.489) * coin.volatility;
    const next  = Math.max(prev * (1 + drift), coin.basePrice * 0.05);

    livePrices[coin.id]  = next;
    liveHistory[coin.id] = [...(liveHistory[coin.id] ?? []).slice(-59), next];

    // Update open candle
    let oc = openCandles[coin.id];
    if (!oc || oc.timestamp.getTime() !== minuteBucket.getTime()) {
      // Save the completed candle to DB
      if (oc && oc.ticks > 0) {
        await Candle.findOneAndUpdate(
          { coinId: coin.id, timestamp: oc.timestamp },
          { $set: { open: oc.open, high: oc.high, low: oc.low, close: oc.close } },
          { upsert: true }
        );
      }
      // Start fresh candle for this minute
      oc = { open: next, high: next, low: next, close: next, timestamp: minuteBucket, ticks: 0 };
      openCandles[coin.id] = oc;
    }
    oc.high  = Math.max(oc.high, next);
    oc.low   = Math.min(oc.low, next);
    oc.close = next;
    oc.ticks++;

    updates[coin.id] = {
      price:      next,
      change:     ((next - coin.basePrice) / coin.basePrice) * 100,
      history:    liveHistory[coin.id],
      // Live partial candle streamed to client
      candle: { open: oc.open, high: oc.high, low: oc.low, close: oc.close, timestamp: oc.timestamp },
    };
  }

  io.emit("priceUpdate", updates);
};

const persistPrices = async () => {
  const ops = Object.entries(livePrices).map(([id, price]) => ({
    updateOne: {
      filter: { id },
      update: { $set: { currentPrice: price, priceHistory: liveHistory[id] ?? [] } },
    },
  }));
  if (ops.length) await Coin.bulkWrite(ops).catch(console.error);
};

// ── Chat socket handling ──────────────────────────────────────────────────────
const jwt  = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

// Map userId → socketId for DM delivery
const onlineUsers = {};

const initChatSocket = (io) => {
  io.on("connection", async (socket) => {
    // Authenticate socket via token query param
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = id;
        onlineUsers[id] = socket.id;
        io.emit("userOnline", { userId: id });
      }
    } catch {}

    socket.emit("priceSnapshot", livePrices);

    // Private message
    socket.on("sendMessage", async ({ recipientId, text }) => {
      if (!socket.userId || !text?.trim()) return;
      try {
        const msg = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          text: text.trim(),
        });
        await msg.populate("sender", "username");

        // Deliver to recipient if online
        const recipientSocket = onlineUsers[recipientId];
        if (recipientSocket) {
          io.to(recipientSocket).emit("newMessage", msg);
        }
        // Echo back to sender
        socket.emit("newMessage", msg);
      } catch (err) {
        console.error("Chat error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        delete onlineUsers[socket.userId];
        io.emit("userOffline", { userId: socket.userId });
      }
    });
  });
};

const startPriceEngine = async (io) => {
  await initPrices();
  initChatSocket(io);
  setInterval(() => tick(io), 2000);
  setInterval(persistPrices, 10000);
};

module.exports = { startPriceEngine, livePrices, onlineUsers };
