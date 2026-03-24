import { useEffect } from "react";

export default function Toast({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [toast.id]);

  const isErr = toast.type === "error";
  return (
    <div style={{
      position: "fixed", bottom: "28px", right: "28px",
      background: isErr ? "#180808" : "#061208",
      border: `1px solid ${isErr ? "#ef444455" : "#22c55e55"}`,
      borderRadius: "12px", padding: "14px 20px",
      color: isErr ? "#ef4444" : "#22c55e",
      fontSize: "14px", fontWeight: 500,
      zIndex: 9999, maxWidth: "340px",
      boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
      animation: "slideIn 0.2s ease",
    }}>
      {toast.msg}
      <style>{`@keyframes slideIn{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
