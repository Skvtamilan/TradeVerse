import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFriends, getPending, searchUsers,
  sendFriendReq, respondFriendReq, removeFriend,
} from "../../services/api";
import { showToast } from "../Layout/Layout";

const avatar = (name, size = 36) => ({
  width: size, height: size, borderRadius: "50%",
  background: "#a78bfa22", border: "1px solid #a78bfa44",
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: size * 0.38, fontWeight: 600, color: "#a78bfa", flexShrink: 0,
});

export default function FriendsPanel() {
  const navigate         = useNavigate();
  const [friends,  setFriends]  = useState([]);
  const [pending,  setPending]  = useState([]);
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState([]);
  const [tab,      setTab]      = useState("friends"); // friends | pending | search
  const [loading,  setLoading]  = useState(false);

  const load = async () => {
    const [f, p] = await Promise.all([getFriends(), getPending()]);
    setFriends(f.data);
    setPending(p.data);
  };

  useEffect(() => { load(); }, []);

  const search = async () => {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const res = await searchUsers(query);
      setResults(res.data);
      setTab("search");
    } catch { showToast("Search failed", "error"); }
    finally { setLoading(false); }
  };

  const addFriend = async (userId) => {
    try {
      await sendFriendReq(userId);
      showToast("Friend request sent!");
      setResults(r => r.filter(u => u._id !== userId));
    } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
  };

  const respond = async (friendshipId, action) => {
    try {
      await respondFriendReq(friendshipId, action);
      showToast(action === "accept" ? "Friend accepted!" : "Request declined");
      load();
    } catch { showToast("Failed", "error"); }
  };

  const remove = async (friendshipId) => {
    try {
      await removeFriend(friendshipId);
      showToast("Friend removed");
      load();
    } catch { showToast("Failed", "error"); }
  };

  const tabBtn = (t, label, count) => (
    <button onClick={() => setTab(t)} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: `1px solid ${tab === t ? "#3a3a5e" : "var(--border)"}`, background: tab === t ? "#1a1a2e" : "transparent", color: tab === t ? "#a78bfa" : "var(--text-secondary)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
      {label} {count > 0 && <span style={{ background: "#a78bfa33", color: "#a78bfa", borderRadius: "10px", padding: "1px 7px", fontSize: "11px", marginLeft: "4px" }}>{count}</span>}
    </button>
  );

  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-display)" }}>Friends</h2>

      {/* Search bar */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input placeholder="Search by username…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} style={{ flex: 1 }} />
        <button onClick={search} disabled={loading} style={{ padding: "0 18px", borderRadius: "9px", border: "1px solid var(--border)", background: "#1a1a2e", color: "#a78bfa", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          {loading ? "…" : "Search"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px" }}>
        {tabBtn("friends", "Friends", friends.length)}
        {tabBtn("pending", "Requests", pending.length)}
        {tab === "search" && tabBtn("search", "Results", results.length)}
      </div>

      {/* Content */}
      {tab === "friends" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {friends.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No friends yet — search for users above.</div>}
          {friends.map(f => (
            <div key={f._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
              <div style={avatar(f.username)}>{f.username[0].toUpperCase()}</div>
              <span style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>{f.username}</span>
              <button onClick={() => navigate(`/chat/${f._id}`)} style={{ padding: "5px 12px", borderRadius: "7px", border: "1px solid #a78bfa44", background: "#a78bfa11", color: "#a78bfa", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Chat</button>
              <button onClick={() => remove(f.friendshipId)} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer" }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {tab === "pending" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {pending.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No pending requests.</div>}
          {pending.map(p => (
            <div key={p._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
              <div style={avatar(p.requester.username)}>{p.requester.username[0].toUpperCase()}</div>
              <span style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>{p.requester.username} wants to be friends</span>
              <button onClick={() => respond(p._id, "accept")} style={{ padding: "5px 12px", borderRadius: "7px", border: "1px solid #22c55e44", background: "#22c55e11", color: "#22c55e", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Accept</button>
              <button onClick={() => respond(p._id, "reject")} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid #ef444444", background: "#ef444411", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Decline</button>
            </div>
          ))}
        </div>
      )}

      {tab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {results.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>No users found.</div>}
          {results.map(u => (
            <div key={u._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--bg-elevated)", borderRadius: "10px" }}>
              <div style={avatar(u.username)}>{u.username[0].toUpperCase()}</div>
              <span style={{ fontSize: "14px", fontWeight: 500, flex: 1 }}>{u.username}</span>
              <button onClick={() => addFriend(u._id)} style={{ padding: "5px 14px", borderRadius: "7px", border: "1px solid #a78bfa44", background: "#a78bfa11", color: "#a78bfa", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>+ Add</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
