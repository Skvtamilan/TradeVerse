import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate }      from "react-router-dom";
import { useAuth }   from "../../context/AuthContext";
import { useMarket } from "../../context/MarketContext";
import { getConversation, getFriends } from "../../services/api";

const bubble = (isMe) => ({
  maxWidth: "72%",
  padding: "9px 14px",
  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
  background: isMe ? "#1e1a3a" : "var(--bg-elevated)",
  border: `1px solid ${isMe ? "#a78bfa44" : "var(--border)"}`,
  color: "var(--text-primary)",
  fontSize: "14px",
  lineHeight: 1.5,
  wordBreak: "break-word",
});

export default function ChatWindow() {
  const { userId }    = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { socket }    = useMarket();
  const [messages,   setMessages]   = useState([]);
  const [text,       setText]       = useState("");
  const [friend,     setFriend]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);

  // Load friend info + history
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [convo, friends] = await Promise.all([
          getConversation(userId),
          getFriends(),
        ]);
        setMessages(convo.data);
        const f = friends.data.find(f => f._id === userId);
        setFriend(f || { username: "Unknown" });
      } catch {
        navigate("/social");
      } finally { setLoading(false); }
    };
    init();
  }, [userId]);

  // Listen for incoming messages via socket
  useEffect(() => {
    const sock = socket?.current;
    if (!sock) return;
    const handler = (msg) => {
      const fromThisConvo =
        (msg.sender._id === userId || msg.sender === userId) ||
        (msg.recipient === userId || msg.recipient?._id === userId);
      if (fromThisConvo) {
        setMessages(prev => {
          // Deduplicate by _id
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };
    sock.on("newMessage", handler);
    return () => sock.off("newMessage", handler);
  }, [userId, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || !socket?.current) return;
    socket.current.emit("sendMessage", { recipientId: userId, text: trimmed });
    setText("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString();
  };

  // Group messages by date
  const grouped = [];
  let lastDate = null;
  messages.forEach(msg => {
    const date = formatDate(msg.createdAt);
    if (date !== lastDate) { grouped.push({ type: "date", label: date }); lastDate = date; }
    grouped.push({ type: "msg", msg });
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px", color: "var(--text-muted)" }}>
      Loading conversation…
    </div>
  );

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>

      {/* Header */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg) var(--radius-lg) 0 0", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => navigate("/social")} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "0 4px" }}>←</button>
        <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#a78bfa22", border: "1px solid #a78bfa44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: "#a78bfa" }}>
          {friend?.username?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600 }}>{friend?.username}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Direct message</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {grouped.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "13px", margin: "auto" }}>
            No messages yet. Say hi!
          </div>
        )}
        {grouped.map((item, i) => {
          if (item.type === "date") return (
            <div key={`date-${i}`} style={{ textAlign: "center", margin: "12px 0 8px", fontSize: "11px", color: "var(--text-muted)" }}>
              <span style={{ background: "var(--bg-elevated)", padding: "3px 12px", borderRadius: "10px", border: "1px solid var(--border)" }}>{item.label}</span>
            </div>
          );
          const msg  = item.msg;
          const isMe = (msg.sender?._id || msg.sender) === user?._id;
          return (
            <div key={msg._id || i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginBottom: "6px" }}>
              {!isMe && <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px", marginLeft: "4px" }}>{msg.sender?.username}</div>}
              <div style={bubble(isMe)}>{msg.text}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "3px", marginLeft: "4px", marginRight: "4px" }}>{formatTime(msg.createdAt)}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "0 0 var(--radius-lg) var(--radius-lg)", padding: "12px 16px", display: "flex", gap: "10px", alignItems: "flex-end" }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Message ${friend?.username}…`}
          rows={1}
          style={{ flex: 1, resize: "none", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", lineHeight: 1.5, maxHeight: "120px", overflowY: "auto" }}
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: text.trim() ? "linear-gradient(135deg,#6d28d9,#a78bfa)" : "var(--bg-elevated)", color: text.trim() ? "white" : "var(--text-muted)", fontWeight: 700, fontSize: "14px", cursor: text.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "all 0.15s" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
