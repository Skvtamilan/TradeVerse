import { useState } from "react";
import { useMarket } from "../../context/MarketContext";
import CoinRow       from "./CoinRow";

const TH = ({ label, sortKey, current, onSort }) => (
  <div
    onClick={() => onSort(sortKey)}
    style={{
      fontSize: "11px", color: current === sortKey ? "#a78bfa" : "var(--text-muted)",
      textTransform: "uppercase", letterSpacing: "0.5px",
      cursor: sortKey ? "pointer" : "default",
      userSelect: "none",
    }}
  >
    {label} {current === sortKey && "↓"}
  </div>
);

export default function MarketTable() {
  const { coins, prices, changes, history, flash } = useMarket();
  const [search,  setSearch]  = useState("");
  const [sortBy,  setSortBy]  = useState("rank");

  const filtered = coins
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price")  return (prices[b.id] || 0) - (prices[a.id] || 0);
      if (sortBy === "change") return (changes[b.id] || 0) - (changes[a.id] || 0);
      // default: built-in rank (custom coins last)
      if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
      return 0;
    });

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          placeholder="Search coins…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: "260px", padding: "9px 14px", fontSize: "13px" }}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          {[["rank","Rank"],["price","Price"],["change","Change %"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              style={{
                padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                border: `1px solid ${sortBy === k ? "#3a3a5e" : "var(--border)"}`,
                background: sortBy === k ? "#1a1a2e" : "transparent",
                color: sortBy === k ? "#a78bfa" : "var(--text-secondary)",
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 130px 120px 90px 90px 130px", padding: "11px 16px", borderBottom: "1px solid var(--border)", background: "#0a0a12" }}>
          <TH label="#"        sortKey=""        current={sortBy} onSort={setSortBy} />
          <TH label="Asset"    sortKey="rank"    current={sortBy} onSort={setSortBy} />
          <TH label="Price (CR)" sortKey="price" current={sortBy} onSort={setSortBy} />
          <TH label="USD"      sortKey=""        current={sortBy} onSort={setSortBy} />
          <TH label="24h %"    sortKey="change"  current={sortBy} onSort={setSortBy} />
          <TH label="Chart"    sortKey=""        current={sortBy} onSort={setSortBy} />
          <TH label=""         sortKey=""        current={sortBy} onSort={setSortBy} />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No coins match your search.</div>
        ) : (
          filtered.map((coin, i) => (
            <CoinRow
              key={coin.id}
              coin={coin}
              rank={i + 1}
              price={prices[coin.id] || 0}
              change={changes[coin.id] || 0}
              history={history[coin.id] || []}
              flashDir={flash[coin.id]}
            />
          ))
        )}
      </div>
    </div>
  );
}
