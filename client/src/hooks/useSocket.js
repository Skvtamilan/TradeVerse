import { useMarket } from "../context/MarketContext";

// Thin convenience hook — consumers only need connection status + data
export const useSocket = () => {
  const { prices, changes, history, flash, connected } = useMarket();
  return { prices, changes, history, flash, connected };
};
