// Master list of 25 supported coins with base prices (USD)
const COINS = [
  { id: "BTC",   name: "Bitcoin",          symbol: "₿", color: "#F7931A", basePrice: 67000,    volatility: 0.012 },
  { id: "ETH",   name: "Ethereum",         symbol: "Ξ", color: "#627EEA", basePrice: 3500,     volatility: 0.013 },
  { id: "BNB",   name: "BNB",              symbol: "B", color: "#F0B90B", basePrice: 580,      volatility: 0.014 },
  { id: "SOL",   name: "Solana",           symbol: "◎", color: "#9945FF", basePrice: 170,      volatility: 0.018 },
  { id: "XRP",   name: "XRP",              symbol: "✕", color: "#00AAE4", basePrice: 0.62,     volatility: 0.020 },
  { id: "ADA",   name: "Cardano",          symbol: "₳", color: "#0033AD", basePrice: 0.44,     volatility: 0.022 },
  { id: "DOGE",  name: "Dogecoin",         symbol: "Ð", color: "#C2A633", basePrice: 0.16,     volatility: 0.025 },
  { id: "TRX",   name: "TRON",             symbol: "T", color: "#FF0013", basePrice: 0.12,     volatility: 0.020 },
  { id: "AVAX",  name: "Avalanche",        symbol: "A", color: "#E84142", basePrice: 36,       volatility: 0.018 },
  { id: "LINK",  name: "Chainlink",        symbol: "⬡", color: "#375BD2", basePrice: 14,       volatility: 0.016 },
  { id: "DOT",   name: "Polkadot",         symbol: "●", color: "#E6007A", basePrice: 7.5,      volatility: 0.017 },
  { id: "MATIC", name: "Polygon",          symbol: "M", color: "#8247E5", basePrice: 0.92,     volatility: 0.020 },
  { id: "LTC",   name: "Litecoin",         symbol: "Ł", color: "#BFBBBB", basePrice: 85,       volatility: 0.014 },
  { id: "SHIB",  name: "Shiba Inu",        symbol: "S", color: "#FF9500", basePrice: 0.000024, volatility: 0.030 },
  { id: "UNI",   name: "Uniswap",          symbol: "U", color: "#FF007A", basePrice: 8.4,      volatility: 0.018 },
  { id: "ATOM",  name: "Cosmos",           symbol: "⚛", color: "#6F7390", basePrice: 8.2,      volatility: 0.017 },
  { id: "XMR",   name: "Monero",           symbol: "ɱ", color: "#FF6600", basePrice: 160,      volatility: 0.015 },
  { id: "ETC",   name: "Ethereum Classic", symbol: "E", color: "#328332", basePrice: 26,       volatility: 0.016 },
  { id: "XLM",   name: "Stellar",          symbol: "★", color: "#7D00FF", basePrice: 0.11,     volatility: 0.022 },
  { id: "BCH",   name: "Bitcoin Cash",     symbol: "₿", color: "#8DC351", basePrice: 390,      volatility: 0.015 },
  { id: "FIL",   name: "Filecoin",         symbol: "F", color: "#0090FF", basePrice: 5.4,      volatility: 0.019 },
  { id: "NEAR",  name: "NEAR Protocol",    symbol: "N", color: "#00C08B", basePrice: 5.8,      volatility: 0.019 },
  { id: "APT",   name: "Aptos",            symbol: "A", color: "#2DD8A3", basePrice: 8.9,      volatility: 0.020 },
  { id: "ARB",   name: "Arbitrum",         symbol: "A", color: "#96BEDC", basePrice: 1.05,     volatility: 0.021 },
  { id: "OP",    name: "Optimism",         symbol: "O", color: "#FF0420", basePrice: 2.1,      volatility: 0.021 },
];

const CREDIT_VALUE_USD = 5;   // 1 credit = $5 USD
const INITIAL_CREDITS  = 50;  // credits awarded to new users

// Credit helpers — used across server and kept here to avoid a separate utils file
const usdToCredits = (usd)     => usd / CREDIT_VALUE_USD;
const creditsToUsd = (credits) => credits * CREDIT_VALUE_USD;

module.exports = { COINS, CREDIT_VALUE_USD, INITIAL_CREDITS, usdToCredits, creditsToUsd };
