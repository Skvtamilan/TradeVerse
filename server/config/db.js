const mongoose = require("mongoose");

const connectWithUri = async (uri, options) => {
  const { connection } = await mongoose.connect(uri, options);
  return connection;
};

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI;
  const localUri = process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/tradeverse";
  const options = { serverSelectionTimeoutMS: 8000 };
  const isProduction = process.env.NODE_ENV === "production";
  const order = isProduction ? [primaryUri] : [localUri, primaryUri];

  let lastError = null;
  for (const uri of order) {
    if (!uri) continue;
    try {
      const connection = await connectWithUri(uri, options);
      const label = uri === localUri ? "MongoDB (local)" : "MongoDB";
      console.log(`${label} connected: ${connection.host}`);
      return;
    } catch (err) {
      lastError = err;
      const label = uri === localUri ? "Local MongoDB" : "Primary MongoDB";
      console.warn(`${label} unavailable: ${err.message}`);
    }
  }

  console.error("MongoDB connection failed:", lastError?.message || "Unknown error");
  process.exit(1);
};

module.exports = connectDB;
