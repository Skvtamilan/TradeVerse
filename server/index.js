require("dotenv").config();
const express            = require("express");
const http               = require("http");
const { Server }         = require("socket.io");
const cors               = require("cors");
const connectDB          = require("./config/db");
const errorHandler       = require("./middleware/errorHandler");
const { startPriceEngine } = require("./sockets/priceEngine");

const app        = express();
const httpServer = http.createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const io = new Server(httpServer, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

connectDB();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/coins",     require("./routes/coins"));
app.use("/api/trade",     require("./routes/trade"));
app.use("/api/portfolio", require("./routes/portfolio"));
app.use("/api/friends",   require("./routes/friends"));
app.use("/api/chat",      require("./routes/chat"));
app.use("/api/candles",   require("./routes/candles"));
app.get("/api/health",    (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

startPriceEngine(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`🚀  Tradeverse server → http://localhost:${PORT}`)
);
