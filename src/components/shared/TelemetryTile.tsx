import { useMemo } from "react";

type State = "nominal" | "caution" | "warning" | "critical" | "stale" | "advisory";

interface Props {
  label: string;
  value: string | number;
  unit: string;
  sparkline?: number[];
  rangeMin?: number;
  rangeMax?: number;
  state?: State;
  predicted?: number;
  sensorId?: string;
  tier?: 1 | 2 | 3;
}

const STATE_COLORS: Record<State, string> = {
  nominal: "#00C08B",
  advisory: "#3DA9FC",
  caution: "#F5B335",
  warning: "#FF7A2F",
  critical: "#FF3B4E",
  stale: "#546678",
};

export default function TelemetryTile({ label, value, unit, sparkline, rangeMin, rangeMax, state = "nominal", predicted, sensorId, tier = 1 }: Props) {
  const stateColor = STATE_COLORS[state];

  const sparkPath = useMemo(() => {
    if (!sparkline || sparkline.length < 2) return "";
    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;
    const w = 60, h = 24;
    return sparkline
      .map((v, i) => {
        const x = (i / (sparkline.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  }, [sparkline]);

  const rangePercent = useMemo(() => {
    if (rangeMin === undefined || rangeMax === undefined) return null;
    const num = parseFloat(String(value));
    return Math.max(0, Math.min(100, ((num - rangeMin) / (rangeMax - rangeMin)) * 100));
  }, [value, rangeMin, rangeMax]);

  const tierStyle: Record<number, string> = {
    1: "border-l-0",
    2: "italic opacity-90",
    3: "border-l-2",
  };

  return (
    <div
      className={`panel relative p-2 flex flex-col gap-1 ${state === "stale" ? "opacity-60" : ""}`}
      style={{
        borderLeftColor: tier === 3 ? "#7B61FF" : undefined,
        background: tier === 2 ? "#18202C" : "#101620",
      }}
    >
      {sensorId && (
        <span className="absolute top-1 right-1 label-xs" style={{ color: "#546678", fontSize: 9 }}>{sensorId}</span>
      )}
      <div className="label-xs">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="font-mono live-value" style={{ fontSize: 20, fontWeight: 500, color: stateColor, fontVariantNumeric: "tabular-nums" }}>
          {typeof value === "number" ? value.toFixed(value < 10 ? 1 : 0) : value}
        </span>
        <span className="label-xs" style={{ fontSize: 11 }}>{unit}</span>
        {predicted !== undefined && (
          <span className="font-mono ml-1" style={{ fontSize: 11, color: "#7B61FF" }}>
            ↔ {typeof predicted === "number" ? predicted.toFixed(predicted < 10 ? 1 : 0) : predicted}
          </span>
        )}
      </div>
      {sparkPath && (
        <svg width={60} height={24} style={{ display: "block" }}>
          <path d={sparkPath} stroke={stateColor} strokeWidth={1.2} fill="none" opacity={0.8} />
        </svg>
      )}
      {rangePercent !== null && (
        <div className="range-bar">
          <div
            className="range-bar-fill"
            style={{ width: `${rangePercent}%`, background: stateColor }}
          />
        </div>
      )}
      {state === "stale" && (
        <div className="label-xs" style={{ color: "#546678" }}>STALE</div>
      )}
    </div>
  );
}
