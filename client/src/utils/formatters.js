export const CREDIT_VALUE_USD = 5;
export const INITIAL_CREDITS  = 50;

export const usdToCredits  = (usd)     => usd / CREDIT_VALUE_USD;
export const creditsToUsd  = (credits) => credits * CREDIT_VALUE_USD;

export const fmt = (n, decimals = 2) => {
  if (n === undefined || n === null || isNaN(n)) return "0.00";
  if (Math.abs(n) < 0.0001 && n !== 0) return n.toExponential(4);
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const fmtCredits = (n) => fmt(n, 4);
export const fmtUsd     = (n) => `$${fmt(n, n < 0.01 ? 6 : 2)}`;
export const fmtPct     = (n) => `${n >= 0 ? "+" : ""}${fmt(n, 2)}%`;

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
