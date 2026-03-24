import { useState }    from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth }     from "../../context/AuthContext";

export default function Login() {
  const { login }     = useAuth();
  const navigate      = useNavigate();
  const [form, setF]  = useState({ email: "", password: "" });
  const [error, setE] = useState("");
  const [loading, setL] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setE(""); setL(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setE(err.response?.data?.message || "Login failed");
    } finally { setL(false); }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <input
        type="email" placeholder="Email"
        value={form.email} onChange={e => setF(f => ({ ...f, email: e.target.value }))}
        required
      />
      <input
        type="password" placeholder="Password"
        value={form.password} onChange={e => setF(f => ({ ...f, password: e.target.value }))}
        required
      />
      {error && <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center" }}>{error}</p>}
      <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#6d28d9,#a78bfa)", color: "white", fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
        No account? <Link to="/register" style={{ color: "#a78bfa" }}>Create one</Link>
      </p>
    </form>
  );
}
