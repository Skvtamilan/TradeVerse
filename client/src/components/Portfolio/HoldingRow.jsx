import { useNavigate } from "react-router-dom";
import { fmt, fmtCredits, fmtPct } from "../../utils/formatters";

export default function HoldingRow({ holding }) {
  const navigate = useNavigate();
  const {
    coinId, coinName, color, symbol,
    quantity, avgBuyPrice, currentPrice,
    valueCredits, pnlCredits,
  } = holding;

  const isUp = pnlCredits >= 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 130px 130px 130px 130px",
        alignItems: "center",
        padding: "13px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/trade/${coinId}`)}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Coin info */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: (color || "#888") + "22", border: `1px solid ${color || "#888"}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: color || "#888", flexShrink: 0 }}>
          {symbol}
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{coinName || coinId}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{coinId}</div>
        </div>
      </div>

      {/* Quantity */}
      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)" }}>{fmt(quantity, 6)}</span>

      {/* Value in credits */}
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#a78bfa", fontFamily: "var(--font-mono)" }}>
        {fmtCredits(valueCredits)} CR
      </span>

      {/* P&L */}
      <span className={isUp ? "badge-green" : "badge-red"}>
        {isUp ? "+" : ""}{fmtCredits(pnlCredits)} CR
      </span>

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
        <button onClick={() => navigate(`/trade/${coinId}?action=buy`)}  style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #22c55e44", background: "#22c55e11", color: "#22c55e", fontSize: "12px", fontWeight: 600 }}>Buy</button>
        <button onClick={() => navigate(`/trade/${coinId}?action=sell`)} style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #ef444444", background: "#ef444411", color: "#ef4444", fontSize: "12px", fontWeight: 600 }}>Sell</button>
      </div>
    </div>
  );
}
