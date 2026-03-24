import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Toast  from "../common/Toast";
import { useState, useCallback } from "react";

// Toast context passed via layout — components call window.__toast()
let _setToast = null;
export const showToast = (msg, type = "success") => {
  if (_setToast) _setToast({ msg, type, id: Date.now() });
};

export default function Layout() {
  const [toast, setToast] = useState(null);
  _setToast = setToast;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: "1280px", margin: "0 auto", width: "100%", padding: "28px 20px" }}>
        <Outlet />
      </main>
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
