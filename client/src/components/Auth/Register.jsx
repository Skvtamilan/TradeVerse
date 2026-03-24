import { useState }    from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }     from "../../context/AuthContext";

export default function Register() {
  const { register }  = useAuth();
  const navigate      = useNavigate();
  const [form, setF]  = useState({ username: "", email: "", password: "" });
  const [error, setE] = useState("");
  const [loading, setL] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setE(""); setL(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/");
    } catch (err) {
      setE(err.response?.data?.message || "Registration failed");
    } finally { setL(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <input
        placeholder="Username"
        value={form.username} onChange={e => setF(f => ({ ...f, username: e.target.value }))}
        minLength={3} maxLength={20} required
      />
      <input
        type="email" placeholder="Email"
        value={form.email} onChange={e => setF(f => ({ ...f, email: e.target.value }))}
        required
      />
      <input
        type="password" placeholder="Password (min 6 chars)"
        value={form.password} onChange={e => setF(f => ({ ...f, password: e.target.value }))}
        minLength={6} required
      />
      {error && <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center" }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#6d28d9,#a78bfa)", color: "white", fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
        Already have an account? <Link to="/login" style={{ color: "#a78bfa" }}>Sign in</Link>
      </p>
      <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)" }}>
        You'll receive <strong style={{ color: "#a78bfa" }}>50 credits</strong> ($250 USD equivalent) to start trading.
      </p>
    </form>
  );
}
