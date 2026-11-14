/** Minimal, accessible SVG line chart for the weekly skill curve. */
export default function LineChart({
  points,
  labels,
  height = 170,
  suffix = "%",
}: {
  points: number[];
  labels: string[];
  height?: number;
  suffix?: string;
}) {
  const w = 360;
  const pad = { l: 38, r: 30, t: 22, b: 30 };
  const iw = w - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const max = 100;
  const x = (i: number) => pad.l + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const area = points.length ? `${d} L ${x(points.length - 1)} ${pad.t + ih} L ${x(0)} ${pad.t + ih} Z` : "";

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      width="100%"
      role="img"
      aria-label={labels.map((l, i) => `${l}: ${points[i]}${suffix}`).join(", ")}
    >
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pad.l} x2={w - pad.r} y1={y(g)} y2={y(g)} stroke="#c9d7d5" strokeDasharray={g === 0 ? "" : "3 4"} />
          <text x={pad.l - 8} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#5b7176">
            {g}
            {suffix}
          </text>
        </g>
      ))}
      {area && <path d={area} fill="rgba(45,124,128,0.14)" />}
      {d && <path d={d} fill="none" stroke="#2d7c80" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}
      {points.map((v, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(v)} r="5" fill="#12313a" />
          <text x={x(i)} y={y(v) - 10} textAnchor="middle" fontSize="12" fontWeight="700" fill="#12313a">
            {v}
            {suffix}
          </text>
          <text x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="#5b7176">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}
