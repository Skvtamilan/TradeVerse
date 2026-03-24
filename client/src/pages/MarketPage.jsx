import MarketTable from "../components/Market/MarketTable";
import { useMarket } from "../context/MarketContext";

export default function MarketPage() {
  const { coins } = useMarket();
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>Live Market</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          {coins.length} coins · prices update every 2 seconds · click any row to trade
        </p>
      </div>
      <MarketTable />
    </div>
  );
}
