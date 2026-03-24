const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack);

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ message: `${field} already exists` });
  }
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const msg = Object.values(err.errors).map(e => e.message).join(", ");
    return res.status(400).json({ message: msg });
  }

  res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
};

module.exports = errorHandler;
