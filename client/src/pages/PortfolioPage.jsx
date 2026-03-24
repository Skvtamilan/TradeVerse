import PortfolioView from "../components/Portfolio/PortfolioView";

export default function PortfolioPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>Portfolio</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Your holdings, net worth, and transaction history</p>
      </div>
      <PortfolioView />
    </div>
  );
}
