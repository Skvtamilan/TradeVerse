import { useNavigate }  from "react-router-dom";
import MiniChart        from "./MiniChart";
import { fmt, fmtCredits, fmtPct, usdToCredits } from "../../utils/formatters";

const avatar = (coin) => ({
  width: "34px", height: "34px", borderRadius: "50%",
  background: coin.color + "22",
  border: `1px solid ${coin.color}55`,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "13px", fontWeight: 700, color: coin.color,
  flexShrink: 0,
});

export default function CoinRow({ coin, rank, price, change, history, flashDir }) {
  const navigate        = useNavigate();
  const priceCredits    = usdToCredits(price || 0);
  const isUp            = change >= 0;
  const flashBg         = flashDir === "up"   ? "rgba(34,197,94,0.05)"
                        : flashDir === "down" ? "rgba(239,68,68,0.05)"
                        : "transparent";

  return (
    <div
      onClick={() => navigate(`/trade/${coin.id}`)}
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr 130px 120px 90px 90px 130px",
        alignItems: "center",
        padding: "11px 16px",
        borderBottom: "1px solid var(--border-subtle)",
        cursor: "pointer",
        background: flashBg,
        transition: "background 0.4s",
      }}
      onMouseEnter={e  => e.currentTarget.style.background = "var(--bg-hover)"}
      onMouseLeave={e  => e.currentTarget.style.background = flashBg}
    >
      {/* Rank */}
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{rank}</span>

      {/* Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={avatar(coin)}>{coin.symbol}</div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>{coin.name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", gap: "6px", alignItems: "center" }}>
            {coin.id}
            {coin.isCustom && (
              <span style={{ fontSize: "10px", background: "#a78bfa22", color: "#a78bfa", padding: "1px 5px", borderRadius: "4px" }}>CUSTOM</span>
            )}
          </div>
        </div>
      </div>

      {/* Price in credits */}
      <span style={{
        fontSize: "14px", fontWeight: 600,
        color: flashDir === "up" ? "#22c55e" : flashDir === "down" ? "#ef4444" : "var(--text-primary)",
        transition: "color 0.35s",
        fontFamily: "var(--font-mono)",
      }}>
        {fmtCredits(priceCredits)} CR
      </span>

      {/* Price USD */}
      <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
        ${fmt(price, price < 0.01 ? 6 : 2)}
      </span>

      {/* 24h change */}
      <span className={isUp ? "badge-green" : "badge-red"}>
        {fmtPct(change)}
      </span>

      {/* Mini chart */}
      <MiniChart data={history} />

      {/* Buttons */}
      <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => navigate(`/trade/${coin.id}?action=buy`)}
          style={{ padding: "5px 12px", borderRadius: "7px", border: "1px solid #22c55e44", background: "#22c55e11", color: "#22c55e", fontSize: "12px", fontWeight: 600 }}
        >Buy</button>
        <button
          onClick={() => navigate(`/trade/${coin.id}?action=sell`)}
          style={{ padding: "5px 12px", borderRadius: "7px", border: "1px solid #ef444444", background: "#ef444411", color: "#ef4444", fontSize: "12px", fontWeight: 600 }}
        >Sell</button>
      </div>
    </div>
  );
}
