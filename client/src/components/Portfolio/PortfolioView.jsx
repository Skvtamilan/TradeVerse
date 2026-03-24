import { usePortfolio }  from "../../hooks/usePortfolio";
import HoldingRow        from "./HoldingRow";
import TxHistory         from "./TxHistory";
import StatCard          from "../common/StatCard";
import { fmtCredits, creditsToUsd, fmt, INITIAL_CREDITS } from "../../utils/formatters";

export default function PortfolioView() {
  const { portfolio, txHistory, txPage, txTotal, loading, fetchPortfolio, fetchHistory } = usePortfolio();

  if (loading) return (
    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>Loading portfolio…</div>
  );

  if (!portfolio) return (
    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
      <div style={{ fontSize: "16px", marginBottom: "12px" }}>Could not load portfolio.</div>
      <button onClick={fetchPortfolio} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid var(--border)", background: "#1a1a2e", color: "#a78bfa", fontSize: "14px", cursor: "pointer" }}>
        Retry
      </button>
    </div>
  );

  const { credits, holdings, portfolioValue, totalNetWorth } = portfolio;
  const pl    = totalNetWorth - INITIAL_CREDITS;
  const plPct = ((pl / INITIAL_CREDITS) * 100).toFixed(2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        <StatCard label="Cash Credits"    value={`${fmtCredits(credits)} CR`}       sub={`$${fmt(creditsToUsd(credits))} USD`} />
        <StatCard label="Portfolio Value" value={`${fmtCredits(portfolioValue)} CR`} sub={`$${fmt(creditsToUsd(portfolioValue))} USD`} />
        <StatCard label="Net Worth"       value={`${fmtCredits(totalNetWorth)} CR`}  sub={`Started: ${INITIAL_CREDITS} CR`} />
        <StatCard
          label="P / L"
          value={`${pl >= 0 ? "+" : ""}${fmtCredits(pl)} CR`}
          sub={`${plPct}%`}
          valueColor={pl >= 0 ? "#22c55e" : "#ef4444"}
        />
      </div>

      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>Holdings</h2>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 130px 130px 130px", padding: "10px 20px", borderBottom: "1px solid var(--border)", background: "#0a0a12" }}>
            {["Asset", "Quantity", "Value (CR)", "P&L (CR)", "Actions"].map(h => (
              <div key={h} style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
            ))}
          </div>
          {holdings.length === 0
            ? <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No holdings yet — go trade!</div>
            : holdings.map(h => <HoldingRow key={h.coinId} holding={h} />)
          }
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "12px" }}>Transaction History</h2>
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <TxHistory txs={txHistory} page={txPage} total={txTotal} onPage={fetchHistory} />
        </div>
      </div>
    </div>
  );
}
