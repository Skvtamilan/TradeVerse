import { fmtCredits, fmt, timeAgo } from "../../utils/formatters";

export default function TxHistory({ txs, page, total, onPage }) {
  if (!txs.length) return (
    <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>No transactions yet.</div>
  );

  const pages = Math.ceil(total / 20);

  return (
    <div>
      {txs.map((tx, i) => {
        const isBuy    = tx.type === "buy";
        const isCreate = tx.type === "create";
        const color    = isCreate ? "#a78bfa" : isBuy ? "#ef4444" : "#22c55e";
        const label    = tx.type.toUpperCase();
        return (
          <div key={tx._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", fontWeight: 700, background: color + "1a", color }}>{label}</span>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{tx.coinId} <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 400 }}>({tx.coinName})</span></div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{timeAgo(tx.createdAt)}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{fmt(tx.quantity, 6)} @ ${fmt(tx.priceUsd, tx.priceUsd < 0.01 ? 6 : 2)}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color, fontFamily: "var(--font-mono)" }}>
                {isBuy || isCreate ? "-" : "+"}{fmtCredits(tx.creditsUsed)} CR
              </div>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "16px" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => onPage(p)} style={{ width: "32px", height: "32px", borderRadius: "7px", border: `1px solid ${p === page ? "#a78bfa" : "var(--border)"}`, background: p === page ? "#1a1a2e" : "transparent", color: p === page ? "#a78bfa" : "var(--text-secondary)", fontSize: "13px", cursor: "pointer" }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
