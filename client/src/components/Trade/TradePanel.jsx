import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth }    from "../../context/AuthContext";
import { useMarket }  from "../../context/MarketContext";
import { buyCoins, sellCoins } from "../../services/api";
import { showToast }  from "../Layout/Layout";
import CoinChart         from "./CoinChart";
import CandlestickChart  from "./CandlestickChart";
import { fmt, fmtCredits, fmtPct, usdToCredits } from "../../utils/formatters";

const avatar = (coin) => ({
  width: "52px", height: "52px", borderRadius: "50%",
  background: coin.color + "22", border: `1px solid ${coin.color}55`,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "20px", fontWeight: 700, color: coin.color, flexShrink: 0,
});

export default function TradePanel({ coin }) {
  const [params]                = useSearchParams();
  const navigate                = useNavigate();
  const { user, updateCredits } = useAuth();
  const { prices, changes, history, flash } = useMarket();
  const [tradeType, setType]    = useState(params.get("action") || "buy");
  const [tradeMode, setMode]    = useState("credits");
  const [amount,    setAmt]     = useState("");
  const [loading,   setLoad]    = useState(false);
  const [holding,   setHolding] = useState(0);
  const [chartMode, setChartMode] = useState("line"); // "line" | "candle"
  const [liveCandle, setLiveCandle] = useState(null);

  const price        = prices[coin.id] || coin.currentPrice || 0;
  const priceCredits = usdToCredits(price);
  const change       = changes[coin.id] || 0;
  const chartData    = history[coin.id] || [];

  // Track live candle from market context
  const { candles } = useMarket();
  useEffect(() => {
    if (candles && candles[coin.id]) setLiveCandle(candles[coin.id]);
  }, [candles, coin.id]);

  useEffect(() => {
    import("../../services/api").then(({ getPortfolio }) =>
      getPortfolio().then(res => {
        const h = res.data.holdings.find(h => h.coinId === coin.id);
        setHolding(h ? h.quantity : 0);
        updateCredits(res.data.credits);
      }).catch(() => {})
    );
  }, [coin.id]);

  const parsedAmt = parseFloat(amount) || 0;
  let estCredits = 0, estCoins = 0;
  if (parsedAmt > 0) {
    if (tradeMode === "credits") { estCredits = parsedAmt; estCoins = parsedAmt / priceCredits; }
    else                         { estCoins = parsedAmt;  estCredits = parsedAmt * priceCredits; }
  }

  const setQuick = (pct) => {
    if (tradeType === "buy") { setMode("credits"); setAmt(((user?.credits || 0) * pct).toFixed(4)); }
    else                      { setMode("coins");   setAmt((holding * pct).toFixed(6)); }
  };

  const execute = async () => {
    if (parsedAmt <= 0) return showToast("Enter a valid amount", "error");
    setLoad(true);
    try {
      const payload = { coinId: coin.id, ...(tradeMode === "credits" ? { quantityCredits: estCredits } : { quantityCoins: estCoins }) };
      const res = await (tradeType === "buy" ? buyCoins : sellCoins)(payload);
      updateCredits(res.data.credits);
      setHolding(h => tradeType === "buy" ? h + estCoins : h - estCoins);
      setAmt("");
      showToast(tradeType === "buy"
        ? `Bought ${fmt(estCoins, 6)} ${coin.id} for ${fmtCredits(estCredits)} CR`
        : `Sold ${fmt(estCoins, 6)} ${coin.id} for ${fmtCredits(estCredits)} CR`
      );
    } catch (e) {
      showToast(e.response?.data?.message || "Trade failed", "error");
    } finally { setLoad(false); }
  };

  const tabBtn = (t) => ({
    flex: 1, padding: "10px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
    border: `1px solid ${tradeType === t ? (t === "buy" ? "#22c55e" : "#ef4444") : "var(--border)"}`,
    background: tradeType === t ? (t === "buy" ? "#22c55e1a" : "#ef44441a") : "transparent",
    color: tradeType === t ? (t === "buy" ? "#22c55e" : "#ef4444") : "var(--text-secondary)",
    cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px",
  });
  const modeBtn = (m) => ({
    flex: 1, padding: "7px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
    border: `1px solid ${tradeMode === m ? "#3a3a5e" : "var(--border)"}`,
    background: tradeMode === m ? "#1a1a2e" : "transparent",
    color: tradeMode === m ? "#a78bfa" : "var(--text-secondary)",
    cursor: "pointer",
  });
  const chartBtn = (m) => ({
    padding: "5px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: 500,
    border: `1px solid ${chartMode === m ? "#3a3a5e" : "var(--border)"}`,
    background: chartMode === m ? "#1a1a2e" : "transparent",
    color: chartMode === m ? "#a78bfa" : "var(--text-secondary)",
    cursor: "pointer",
  });

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "14px", marginBottom: "16px" }}>
        ← Back to Market
      </button>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Coin header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={avatar(coin)}>{coin.symbol}</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 700 }}>{coin.name}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{coin.id}{coin.isCustom && <span style={{ marginLeft: "8px", fontSize: "10px", color: "#a78bfa", background: "#a78bfa22", padding: "2px 6px", borderRadius: "4px" }}>CUSTOM</span>}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtCredits(priceCredits)} <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>CR</span></div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>${fmt(price, price < 0.01 ? 6 : 2)}</div>
            <span className={change >= 0 ? "badge-green" : "badge-red"}>{fmtPct(change)}</span>
          </div>
        </div>

        {/* Chart toggle */}
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
          <button style={chartBtn("line")}   onClick={() => setChartMode("line")}>Line</button>
          <button style={chartBtn("candle")} onClick={() => setChartMode("candle")}>Candlestick</button>
        </div>

        {/* Chart */}
        {chartMode === "line"
          ? <CoinChart data={chartData} />
          : <CandlestickChart coinId={coin.id} liveCandle={liveCandle} />
        }

        {/* Holding */}
        {holding > 0 && (
          <div style={{ background: "#0a0a1a", borderRadius: "10px", padding: "10px 16px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Your holding</span>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{fmt(holding, 6)} {coin.id} ≈ {fmtCredits(holding * priceCredits)} CR</span>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button style={tabBtn("buy")}  onClick={() => setType("buy")}>Buy</button>
          <button style={tabBtn("sell")} onClick={() => setType("sell")}>Sell</button>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button style={modeBtn("credits")} onClick={() => setMode("credits")}>By Credits</button>
          <button style={modeBtn("coins")}   onClick={() => setMode("coins")}>By {coin.id}</button>
        </div>

        <input type="number" min="0" placeholder={tradeMode === "credits" ? "Credits to spend" : `Amount of ${coin.id}`} value={amount} onChange={e => setAmt(e.target.value)} />

        <div style={{ display: "flex", gap: "6px" }}>
          {[0.25, 0.5, 0.75, 1].map(p => (
            <button key={p} onClick={() => setQuick(p)} style={{ flex: 1, padding: "7px", borderRadius: "7px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer" }}>{p * 100}%</button>
          ))}
        </div>

        {parsedAmt > 0 && (
          <div style={{ background: "#0a0a18", borderRadius: "10px", padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
              <span style={{ color: "var(--text-secondary)" }}>You {tradeType === "buy" ? "pay" : "receive"}</span>
              <span style={{ color: "#a78bfa", fontWeight: 600 }}>{fmtCredits(estCredits)} CR</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-secondary)" }}>You {tradeType === "buy" ? "receive" : "give"}</span>
              <span style={{ fontWeight: 600 }}>{fmt(estCoins, 6)} {coin.id}</span>
            </div>
          </div>
        )}

        <button onClick={execute} disabled={loading} style={{ padding: "14px", borderRadius: "12px", border: "none", fontSize: "15px", fontWeight: 700, background: tradeType === "buy" ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#dc2626,#ef4444)", color: "white", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Processing…" : `${tradeType === "buy" ? "Buy" : "Sell"} ${coin.id}`}
        </button>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>Balance: <span style={{ color: "#a78bfa" }}>{fmtCredits(user?.credits || 0)} CR</span> · 1 CR = $5 USD</div>
      </div>
    </div>
  );
}
