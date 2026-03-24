import { useState, useEffect } from "react";
import { getLeaderboard } from "../../services/api";
import { fmtCredits, fmt } from "../../utils/formatters";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [board,   setBoard]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getLeaderboard();
      setBoard(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>Loading leaderboard…</div>;

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-display)" }}>Friends Leaderboard</h2>
        <button onClick={load} style={{ padding: "5px 14px", borderRadius: "7px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer" }}>Refresh</button>
      </div>

      {board.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
          Add friends to see the leaderboard!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {board.map((entry, i) => (
            <div key={entry.userId} style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "14px 16px", borderRadius: "12px",
              background: entry.isYou ? "#a78bfa11" : "var(--bg-elevated)",
              border: `1px solid ${entry.isYou ? "#a78bfa44" : "transparent"}`,
            }}>
              {/* Rank */}
              <div style={{ width: "32px", textAlign: "center", fontSize: i < 3 ? "20px" : "14px", fontWeight: 700, color: "var(--text-muted)", flexShrink: 0 }}>
                {i < 3 ? medals[i] : `#${entry.rank}`}
              </div>

              {/* Avatar */}
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: entry.isYou ? "#a78bfa22" : "#ffffff11", border: `1px solid ${entry.isYou ? "#a78bfa55" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: entry.isYou ? "#a78bfa" : "var(--text-secondary)", flexShrink: 0 }}>
                {entry.username[0].toUpperCase()}
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: entry.isYou ? "#a78bfa" : "var(--text-primary)" }}>
                  {entry.username} {entry.isYou && <span style={{ fontSize: "11px", background: "#a78bfa22", color: "#a78bfa", borderRadius: "4px", padding: "1px 6px", marginLeft: "4px" }}>you</span>}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "10px" }}>
                  <span>Cash: {fmtCredits(entry.cashCredits)} CR</span>
                  <span>Portfolio: {fmtCredits(entry.portfolioCredits)} CR</span>
                </div>
              </div>

              {/* Net worth */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-mono)", color: i === 0 ? "#f59e0b" : "var(--text-primary)" }}>
                  {fmtCredits(entry.totalNetWorth)} CR
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>${fmt(entry.totalNetWorth * 5)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
