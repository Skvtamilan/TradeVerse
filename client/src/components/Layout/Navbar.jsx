import { NavLink, useNavigate } from "react-router-dom";
import { useAuth }   from "../../context/AuthContext";
import { useMarket } from "../../context/MarketContext";
import { useEffect, useState } from "react";
import { fmtCredits }    from "../../utils/formatters";
import { getUnreadCounts, getPending } from "../../services/api";

const navStyle = (active) => ({
  padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
  background: active ? "#1e1e3a" : "transparent",
  color: active ? "#a78bfa" : "#888",
  border: "none", cursor: "pointer", textDecoration: "none", transition: "all 0.15s",
  position: "relative", display: "inline-flex", alignItems: "center", gap: "6px",
});

const Badge = ({ count }) => count > 0 ? (
  <span style={{ background: "#ef4444", color: "white", borderRadius: "10px", padding: "1px 6px", fontSize: "10px", fontWeight: 700, lineHeight: 1.4 }}>{count}</span>
) : null;

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { connected }     = useMarket();
  const navigate          = useNavigate();
  const [unread,   setUnread]  = useState(0);
  const [pending,  setPending] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [u, p] = await Promise.all([getUnreadCounts(), getPending()]);
        const total = u.data.reduce((s, c) => s + c.count, 0);
        setUnread(total);
        setPending(p.data.length);
      } catch {}
    };
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [user]);

  return (
    <nav style={{ background: "#0d0d14", borderBottom: "1px solid var(--border)", height: "56px", display: "flex", alignItems: "center", gap: "4px", padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", color: "#a78bfa", marginRight: "16px", letterSpacing: "-0.5px" }}>◈ Tradeverse</span>

      <NavLink to="/"          style={({ isActive }) => navStyle(isActive)}>Market</NavLink>
      <NavLink to="/portfolio" style={({ isActive }) => navStyle(isActive)}>Portfolio</NavLink>
      <NavLink to="/create"    style={({ isActive }) => navStyle(isActive)}>Launch Coin</NavLink>
      <NavLink to="/social"    style={({ isActive }) => navStyle(isActive)}>
        Social {(unread + pending) > 0 && <Badge count={unread + pending} />}
      </NavLink>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: connected ? "#22c55e" : "#ef4444" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: connected ? "#22c55e" : "#ef4444", animation: connected ? "pulse 2s infinite" : "none" }} />
          {connected ? "Live" : "Offline"}
        </div>

        {user && (
          <div style={{ background: "#1a1a2e", border: "1px solid #2d2d4a", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", color: "#a78bfa", fontWeight: 600 }}>
            {fmtCredits(user.credits)} CR
          </div>
        )}

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>{user.username}</span>
            <button onClick={() => { logout(); navigate("/login"); }} style={{ padding: "5px 12px", borderRadius: "7px", border: "1px solid #2a2a3e", background: "transparent", color: "#666", fontSize: "12px", cursor: "pointer" }}>
              Logout
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </nav>
  );
}
