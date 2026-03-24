export default function CoinChart({ data = [], width = 560, height = 130 }) {
  if (data.length < 2) return <div style={{ height }} />;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;
  const pad   = 10;
  const W     = width;
  const H     = height;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const isUp  = data[data.length - 1] >= data[0];
  const color = isUp ? "#22c55e" : "#ef4444";
  const first = pts.split(" ")[0];
  const last  = pts.split(" ").slice(-1)[0];

  return (
    <div style={{ background: "#060609", borderRadius: "10px", padding: "12px", overflow: "hidden" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`0,${H} ${pts} ${W},${H}`}
          fill="url(#chartGrad)"
        />
        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Latest price dot */}
        {last && (
          <circle
            cx={last.split(",")[0]}
            cy={last.split(",")[1]}
            r="3.5"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}
