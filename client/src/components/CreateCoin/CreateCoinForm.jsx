import { useState }     from "react";
import { useNavigate }  from "react-router-dom";
import { useAuth }      from "../../context/AuthContext";
import { useMarket }    from "../../context/MarketContext";
import { createCoin }   from "../../services/api";
import { showToast }    from "../Layout/Layout";
import { usdToCredits, fmtCredits, fmt } from "../../utils/formatters";

const field = (label, hint) => ({ label, hint });

export default function CreateCoinForm() {
  const navigate          = useNavigate();
  const { user, updateCredits } = useAuth();
  const { refreshCoins }  = useMarket();
  const [loading, setLoad] = useState(false);
  const [form, setForm]   = useState({
    name: "", symbol: "", initialPrice: "", supply: "", description: "", color: "#a78bfa",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const initialPrice     = parseFloat(form.initialPrice) || 0;
  const supply           = parseFloat(form.supply)       || 0;
  const marketCap        = initialPrice * supply;
  const launchCost       = usdToCredits(marketCap * 0.01);

  const submit = async () => {
    const { name, symbol, initialPrice, supply } = form;
    if (!name || !symbol || !initialPrice || !supply)
      return showToast("Fill all required fields", "error");
    if (symbol.length < 2 || symbol.length > 6)
      return showToast("Symbol must be 2–6 characters", "error");
    if (parseFloat(initialPrice) <= 0)
      return showToast("Initial price must be positive", "error");
    if (parseFloat(supply) <= 0)
      return showToast("Supply must be positive", "error");
    if ((user?.credits || 0) < launchCost)
      return showToast(`Need ${fmtCredits(launchCost)} CR to launch — you have ${fmtCredits(user?.credits || 0)} CR`, "error");

    setLoad(true);
    try {
      await createCoin({ ...form, symbol: symbol.toUpperCase() });
      updateCredits((user?.credits || 0) - launchCost);
      await refreshCoins();
      showToast(`${name} (${symbol.toUpperCase()}) launched! You own the entire supply.`);
      navigate("/");
    } catch (e) {
      showToast(e.response?.data?.message || "Launch failed", "error");
    } finally {
      setLoad(false);
    }
  };

  const inputStyle = { marginBottom: "14px" };
  const labelStyle = { display: "block", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" };

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", marginBottom: "4px" }}>Launch Your Coin</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "28px" }}>
          Create and establish your own cryptocurrency. You'll own 100% of the initial supply. Launch fee: 1% of initial market cap.
        </p>

        <div style={inputStyle}>
          <label style={labelStyle}>Coin Name *</label>
          <input placeholder="e.g. MoonToken" value={form.name} onChange={e => set("name", e.target.value)} />
        </div>

        <div style={inputStyle}>
          <label style={labelStyle}>Ticker Symbol * (2–6 chars)</label>
          <input placeholder="e.g. MOON" maxLength={6} value={form.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", ...inputStyle }}>
          <div>
            <label style={labelStyle}>Initial Price (USD) *</label>
            <input type="number" min="0.000001" step="0.000001" placeholder="0.01" value={form.initialPrice} onChange={e => set("initialPrice", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Initial Supply *</label>
            <input type="number" min="1" step="1" placeholder="1000000" value={form.supply} onChange={e => set("supply", e.target.value)} />
          </div>
        </div>

        <div style={inputStyle}>
          <label style={labelStyle}>Coin Color</label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input type="color" value={form.color} onChange={e => set("color", e.target.value)} style={{ width: "44px", height: "38px", padding: "2px", cursor: "pointer" }} />
            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: form.color + "33", border: `2px solid ${form.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: form.color }}>
              {form.symbol ? form.symbol[0] : "?"}
            </div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Token avatar preview</span>
          </div>
        </div>

        <div style={inputStyle}>
          <label style={labelStyle}>Description</label>
          <input placeholder="What's your coin about?" value={form.description} onChange={e => set("description", e.target.value)} />
        </div>

        {/* Cost summary */}
        {marketCap > 0 && (
          <div style={{ background: "#0a0a18", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Market Cap</span>
              <span>${fmt(marketCap)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Launch Fee (1% of market cap)</span>
              <span style={{ color: "#a78bfa", fontWeight: 600 }}>{fmtCredits(launchCost)} CR</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "var(--text-secondary)" }}>You receive</span>
              <span style={{ color: "#22c55e", fontWeight: 600 }}>{parseFloat(form.supply || 0).toLocaleString()} {form.symbol || "tokens"} (100%)</span>
            </div>
            <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "var(--text-muted)" }}>Your balance</span>
              <span style={{ color: (user?.credits || 0) >= launchCost ? "#22c55e" : "#ef4444" }}>{fmtCredits(user?.credits || 0)} CR {(user?.credits || 0) < launchCost ? "⚠ Insufficient" : "✓"}</span>
            </div>
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            fontSize: "15px", fontWeight: 700,
            background: "linear-gradient(135deg, #6d28d9, #a78bfa)",
            color: "white", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Launching…" : "🚀 Launch Coin"}
        </button>
      </div>
    </div>
  );
}
