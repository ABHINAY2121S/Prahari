interface Props {
  value: number;
  size?: number;
  label?: string;
  trend?: number;
}

function stateColor(v: number) {
  if (v >= 90) return "var(--state-nominal)";
  if (v >= 75) return "var(--state-caution)";
  if (v >= 60) return "var(--state-warning)";
  return "var(--state-critical)";
}

export default function HealthRing({ value, size = 120, label, trend }: Props) {
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const fill = (value / 100) * circumference;
  const color = stateColor(value);
  const fontSize = size === 200 ? 36 : size === 120 ? 24 : 14;
  const trendFontSize = size === 200 ? 14 : 12;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--stroke-hairline)" strokeWidth={size === 64 ? 6 : 8} opacity={0.7} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={size === 64 ? 6 : 8}
          strokeDasharray={`${fill} ${circumference - fill}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.4s ease" }}
        />
        <text
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${cx}px ${cy}px`,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize,
            fontWeight: 500,
            fill: color,
          }}
        >
          {value.toFixed(1)}
        </text>
        {trend !== undefined && (
          <text
            x={cx}
            y={cy + fontSize * 0.35 + trendFontSize + 2}
            textAnchor="middle"
            style={{
              transform: "rotate(90deg)",
              transformOrigin: `${cx}px ${cy}px`,
              fontFamily: "'Inter', sans-serif",
              fontSize: trendFontSize,
              fill: trend < 0 ? "var(--state-caution)" : "var(--state-nominal)",
            }}
          >
            {trend > 0 ? "+" : ""}{trend?.toFixed(1)}/hr
          </text>
        )}
      </svg>
      {label && <div className="label-xs text-center" style={{ maxWidth: size }}>{label}</div>}
    </div>
  );
}
