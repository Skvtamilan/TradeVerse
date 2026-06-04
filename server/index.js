require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const { validateEnv } = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const { startPriceEngine } = require("./sockets/priceEngine");

validateEnv();

const app = express();
const httpServer = http.createServer(app);

const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || CLIENT_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
};

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts. Please try again later." },
});

app.disable("x-powered-by");
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "25kb" }));
app.use("/api", apiLimiter);

app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/coins", require("./routes/coins"));
app.use("/api/trade", require("./routes/trade"));
app.use("/api/portfolio", require("./routes/portfolio"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/candles", require("./routes/candles"));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const stopPriceEngine = await startPriceEngine(io);

  httpServer.listen(PORT, () =>
    console.log(`Tradeverse server listening on http://localhost:${PORT}`)
  );

  const shutdown = () => {
    stopPriceEngine?.();
    httpServer.close(() => process.exit(0));
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
};

startServer().catch((err) => {
  console.error("Server startup failed:", err.message);
  process.exit(1);
});
