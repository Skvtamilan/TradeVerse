export default function StatCard({ label, value, sub, valueColor }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 700, color: valueColor || "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{sub}</div>}
    </div>
  );
}
