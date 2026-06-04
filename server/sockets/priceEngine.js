const jwt = require("jsonwebtoken");
const Coin = require("../models/Coin");
const Candle = require("../models/Candle");
const Message = require("../models/Message");
const Friendship = require("../models/Friendship");
const { COINS } = require("../config/coins");

const livePrices = {};
const liveHistory = {};
const openCandles = {};
const onlineUsers = {};
const socketMessageWindows = new Map();

const MESSAGE_WINDOW_MS = 60 * 1000;
const MAX_SOCKET_MESSAGES_PER_WINDOW = 30;

let tickInProgress = false;

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
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          color: c.color,
          basePrice: c.basePrice,
          currentPrice: c.basePrice,
          volatility: c.volatility,
          isCustom: false,
          priceHistory: [c.basePrice],
        },
      },
      { upsert: true }
    );

    livePrices[c.id] = c.basePrice;
    liveHistory[c.id] = [c.basePrice];

    const now = floorToMinute(new Date());
    openCandles[c.id] = {
      open: c.basePrice,
      high: c.basePrice,
      low: c.basePrice,
      close: c.basePrice,
      timestamp: now,
      ticks: 0,
    };
  }

  console.log(`Price engine seeded ${COINS.length} coins`);
};

const tick = async (io) => {
  if (tickInProgress) return;
  tickInProgress = true;

  try {
    const allCoins = await Coin.find().lean();
    const updates = {};
    const minuteBucket = floorToMinute(new Date());

    for (const coin of allCoins) {
      const prev = livePrices[coin.id] ?? coin.currentPrice;
      const drift = (Math.random() - 0.489) * coin.volatility;
      const next = Math.max(prev * (1 + drift), coin.basePrice * 0.05);

      livePrices[coin.id] = next;
      liveHistory[coin.id] = [...(liveHistory[coin.id] ?? []).slice(-59), next];

      let oc = openCandles[coin.id];
      if (!oc || oc.timestamp.getTime() !== minuteBucket.getTime()) {
        if (oc && oc.ticks > 0) {
          await Candle.findOneAndUpdate(
            { coinId: coin.id, timestamp: oc.timestamp },
            { $set: { open: oc.open, high: oc.high, low: oc.low, close: oc.close } },
            { upsert: true }
          );
        }

        oc = { open: next, high: next, low: next, close: next, timestamp: minuteBucket, ticks: 0 };
        openCandles[coin.id] = oc;
      }

      oc.high = Math.max(oc.high, next);
      oc.low = Math.min(oc.low, next);
      oc.close = next;
      oc.ticks++;

      updates[coin.id] = {
        price: next,
        change: ((next - coin.basePrice) / coin.basePrice) * 100,
        history: liveHistory[coin.id],
        candle: {
          open: oc.open,
          high: oc.high,
          low: oc.low,
          close: oc.close,
          timestamp: oc.timestamp,
        },
      };
    }

    io.emit("priceUpdate", updates);
  } catch (err) {
    console.error("Price tick failed:", err.message);
  } finally {
    tickInProgress = false;
  }
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

const areFriends = async (userId1, userId2) => {
  const friendship = await Friendship.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
    status: "accepted",
  });
  return !!friendship;
};

const isWithinSocketMessageLimit = (socketId) => {
  const now = Date.now();
  const windowState = socketMessageWindows.get(socketId) || { startedAt: now, count: 0 };

  if (now - windowState.startedAt > MESSAGE_WINDOW_MS) {
    windowState.startedAt = now;
    windowState.count = 0;
  }

  windowState.count++;
  socketMessageWindows.set(socketId, windowState);
  return windowState.count <= MAX_SOCKET_MESSAGES_PER_WINDOW;
};

const initChatSocket = (io) => {
  io.on("connection", async (socket) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = id;
        onlineUsers[id] = socket.id;
        io.emit("userOnline", { userId: id });
      }
    } catch {
      socket.emit("messageError", { message: "Socket authentication failed" });
    }

    socket.emit("priceSnapshot", livePrices);

    socket.on("sendMessage", async ({ recipientId, text }) => {
      if (!socket.userId || !text?.trim()) return;

      try {
        if (!isWithinSocketMessageLimit(socket.id)) {
          socket.emit("messageError", { message: "You are sending messages too quickly" });
          return;
        }

        if (!(await areFriends(socket.userId, recipientId))) {
          socket.emit("messageError", { message: "You are not friends with this user" });
          return;
        }

        const msg = await Message.create({
          sender: socket.userId,
          recipient: recipientId,
          text: text.trim(),
        });
        await msg.populate("sender", "username");

        const recipientSocket = onlineUsers[recipientId];
        if (recipientSocket) {
          io.to(recipientSocket).emit("newMessage", msg);
        }

        socket.emit("newMessage", msg);
      } catch (err) {
        console.error("Chat error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      socketMessageWindows.delete(socket.id);

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

  const tickInterval = setInterval(() => tick(io), 2000);
  const persistInterval = setInterval(persistPrices, 10000);

  return () => {
    clearInterval(tickInterval);
    clearInterval(persistInterval);
  };
};

module.exports = { startPriceEngine, livePrices, onlineUsers };
