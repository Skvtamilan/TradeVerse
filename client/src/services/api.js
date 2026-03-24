import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const register = (data)  => api.post("/auth/register", data);
export const login    = (data)  => api.post("/auth/login",    data);
export const getMe    = ()      => api.get("/auth/me");

// ── Coins ─────────────────────────────────────────────────────────────────────
export const getCoins      = ()   => api.get("/coins");
export const getCoin       = (id) => api.get(`/coins/${id}`);
export const createCoin    = (data) => api.post("/coins/create", data);

// ── Trade ─────────────────────────────────────────────────────────────────────
export const buyCoins  = (data) => api.post("/trade/buy",  data);
export const sellCoins = (data) => api.post("/trade/sell", data);

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const getPortfolio = ()      => api.get("/portfolio");
export const getTxHistory = (page)  => api.get(`/portfolio/history?page=${page}&limit=20`);

export default api;

// ── Friends ───────────────────────────────────────────────────────────────────
export const searchUsers     = (q)   => api.get(`/friends/search?q=${q}`);
export const getFriends      = ()    => api.get("/friends");
export const getPending      = ()    => api.get("/friends/pending");
export const getLeaderboard  = ()    => api.get("/friends/leaderboard");
export const sendFriendReq   = (id)  => api.post(`/friends/request/${id}`);
export const respondFriendReq = (id, action) => api.put(`/friends/respond/${id}`, { action });
export const removeFriend    = (id)  => api.delete(`/friends/${id}`);

// ── Chat ──────────────────────────────────────────────────────────────────────
export const getConversation = (userId, page) => api.get(`/chat/${userId}?page=${page || 1}`);
export const getUnreadCounts = ()    => api.get("/chat/unread");

// ── Candles ───────────────────────────────────────────────────────────────────
export const getCandles = (coinId, limit) => api.get(`/candles/${coinId}?limit=${limit || 60}`);
