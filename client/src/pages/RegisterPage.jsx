import Register from "../components/Auth/Register";

const authWrap = {
  minHeight: "100vh",
  background: "var(--bg-base)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};
const card = {
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  padding: "36px 32px",
  width: "100%",
  maxWidth: "420px",
};

export default function RegisterPage() {
  return (
    <div style={authWrap}>
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, color: "#a78bfa", marginBottom: "6px" }}>◈ Tradeverse</div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Create your free account</p>
        </div>
        <Register />
      </div>
    </div>
  );
}
