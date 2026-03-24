import { useParams }  from "react-router-dom";
import { useMarket }  from "../context/MarketContext";
import TradePanel     from "../components/Trade/TradePanel";

export default function TradePage() {
  const { coinId } = useParams();
  const { coins }  = useMarket();
  const coin       = coins.find(c => c.id === coinId?.toUpperCase());

  if (!coin) return (
    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
      Loading coin data…
    </div>
  );

  return <TradePanel coin={coin} />;
}
