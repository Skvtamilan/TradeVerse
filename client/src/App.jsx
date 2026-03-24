import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth }   from "./context/AuthContext";
import { MarketProvider }          from "./context/MarketContext";
import Layout        from "./components/Layout/Layout";
import MarketPage    from "./pages/MarketPage";
import PortfolioPage from "./pages/PortfolioPage";
import TradePage     from "./pages/TradePage";
import CreatePage    from "./pages/CreatePage";
import SocialPage    from "./pages/SocialPage";
import ChatPage      from "./pages/ChatPage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#a78bfa", fontFamily: "sans-serif" }}>
      Loading…
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route element={<PrivateRoute><MarketProvider><Layout /></MarketProvider></PrivateRoute>}>
      <Route index               element={<MarketPage />} />
      <Route path="portfolio"    element={<PortfolioPage />} />
      <Route path="trade/:coinId" element={<TradePage />} />
      <Route path="create"       element={<CreatePage />} />
      <Route path="social"       element={<SocialPage />} />
      <Route path="chat/:userId" element={<ChatPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
