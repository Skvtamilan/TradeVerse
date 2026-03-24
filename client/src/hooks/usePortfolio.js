import { useState, useEffect, useRef } from "react";
import { getPortfolio, getTxHistory } from "../services/api";
import { useAuth } from "../context/AuthContext";

export const usePortfolio = () => {
  const { user, updateCredits } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [txHistory, setTxHistory] = useState([]);
  const [txPage,    setTxPage]    = useState(1);
  const [txTotal,   setTxTotal]   = useState(0);
  const [loading,   setLoading]   = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchPortfolio = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getPortfolio();
      if (!mountedRef.current) return;
      setPortfolio(res.data);
      updateCredits(res.data.credits);
    } catch (e) {
      console.error("Portfolio fetch error:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    if (!user) return;
    try {
      const res = await getTxHistory(page);
      if (!mountedRef.current) return;
      setTxHistory(res.data.txs);
      setTxTotal(res.data.total);
      setTxPage(page);
    } catch (e) {
      console.error("History fetch error:", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchPortfolio();
    fetchHistory(1);
  }, [user?._id]);

  return { portfolio, txHistory, txPage, txTotal, loading, fetchPortfolio, fetchHistory };
};
