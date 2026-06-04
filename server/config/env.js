const requiredInAllEnvs = ["JWT_SECRET"];
const requiredInProduction = ["MONGO_URI", "CLIENT_ORIGIN"];

const validateEnv = () => {
  const missing = requiredInAllEnvs.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production") {
    missing.push(...requiredInProduction.filter((key) => !process.env[key]));
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

module.exports = { validateEnv };
