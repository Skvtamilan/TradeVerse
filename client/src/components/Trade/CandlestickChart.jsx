import { useEffect, useRef } from "react";
import { createChart, ColorType, CrosshairMode } from "lightweight-charts";
import { getCandles } from "../../services/api";

export default function CandlestickChart({ coinId, liveCandle }) {
  const containerRef = useRef(null);
  const chartRef     = useRef(null);
  const seriesRef    = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#060609" },
        textColor: "#888899",
      },
      grid: {
        vertLines: { color: "#1a1a26" },
        horzLines: { color: "#1a1a26" },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: "#1e1e2e" },
      timeScale: {
        borderColor: "#1e1e2e",
        timeVisible: true,
        secondsVisible: false,
      },
      width:  containerRef.current.clientWidth,
      height: 300,
    });

    const series = chart.addCandlestickSeries({
      upColor:          "#22c55e",
      downColor:        "#ef4444",
      borderUpColor:    "#22c55e",
      borderDownColor:  "#ef4444",
      wickUpColor:      "#22c55e",
      wickDownColor:    "#ef4444",
    });

    chartRef.current  = chart;
    seriesRef.current = series;

    // Load historical candles
    getCandles(coinId, 100).then(res => {
      const data = res.data.map(c => ({
        time:  Math.floor(new Date(c.timestamp).getTime() / 1000),
        open:  c.open,
        high:  c.high,
        low:   c.low,
        close: c.close,
      }));
      if (data.length) series.setData(data);
    }).catch(() => {});

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [coinId]);

  // Push live candle updates
  useEffect(() => {
    if (!seriesRef.current || !liveCandle) return;
    try {
      seriesRef.current.update({
        time:  Math.floor(new Date(liveCandle.timestamp).getTime() / 1000),
        open:  liveCandle.open,
        high:  liveCandle.high,
        low:   liveCandle.low,
        close: liveCandle.close,
      });
    } catch {}
  }, [liveCandle]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", borderRadius: "10px", overflow: "hidden", background: "#060609" }}
    />
  );
}
