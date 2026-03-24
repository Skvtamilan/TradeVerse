import CreateCoinForm from "../components/CreateCoin/CreateCoinForm";

export default function CreatePage() {
  return (
    <div>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, marginBottom: "4px" }}>Launch a Coin</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Create your own cryptocurrency and own the entire initial supply</p>
      </div>
      <CreateCoinForm />
    </div>
  );
}
