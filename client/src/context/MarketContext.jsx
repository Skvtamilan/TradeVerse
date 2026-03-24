import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getCoins } from "../services/api";

const MarketContext = createContext(null);

export const MarketProvider = ({ children }) => {
  const [coins,     setCoins]     = useState([]);
  const [prices,    setPrices]    = useState({});
  const [changes,   setChanges]   = useState({});
  const [history,   setHistory]   = useState({});
  const [candles,   setCandles]   = useState({});
  const [flash,     setFlash]     = useState({});
  const [connected, setConnected] = useState(false);
  const socketRef    = useRef(null);
  const flashTimeout = useRef(null);

  useEffect(() => {
    getCoins().then(res => setCoins(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const token  = localStorage.getItem("token");
    const socket = io(
      process.env.NODE_ENV === "production" ? "/" : "http://localhost:5000",
      { transports: ["websocket"], auth: { token } }
    );
    socketRef.current = socket;

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("priceSnapshot", snapshot => setPrices(snapshot));

    socket.on("priceUpdate", updates => {
      const newFlash = {};
      setPrices(prev => {
        const next = { ...prev };
        Object.entries(updates).forEach(([id, d]) => {
          newFlash[id] = d.price > (prev[id] || d.price) ? "up" : "down";
          next[id] = d.price;
        });
        return next;
      });
      setChanges(prev => { const n = { ...prev }; Object.entries(updates).forEach(([id, d]) => { n[id] = d.change; }); return n; });
      setHistory(prev => { const n = { ...prev }; Object.entries(updates).forEach(([id, d]) => { n[id] = d.history; }); return n; });
      setCandles(prev => { const n = { ...prev }; Object.entries(updates).forEach(([id, d]) => { if (d.candle) n[id] = d.candle; }); return n; });
      setFlash(newFlash);
      clearTimeout(flashTimeout.current);
      flashTimeout.current = setTimeout(() => setFlash({}), 500);
    });

    return () => socket.disconnect();
  }, []);

  const refreshCoins = () => getCoins().then(res => setCoins(res.data)).catch(console.error);

  return (
    <MarketContext.Provider value={{ coins, prices, changes, history, candles, flash, connected, refreshCoins, socket: socketRef }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be inside MarketProvider");
  return ctx;
};
