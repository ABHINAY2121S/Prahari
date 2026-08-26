type Severity = "nominal" | "advisory" | "caution" | "warning" | "critical";

interface Props {
  severity: Severity;
  label?: string;
  size?: "sm" | "md";
}

const CONFIG: Record<Severity, { color: string; bg: string; icon: string; label: string }> = {
  nominal:  { color: "#00C08B", bg: "rgba(0,192,139,0.12)",  icon: "✓", label: "NOMINAL" },
  advisory: { color: "#3DA9FC", bg: "rgba(61,169,252,0.12)", icon: "ℹ", label: "ADVISORY" },
  caution:  { color: "#F5B335", bg: "rgba(245,179,53,0.12)", icon: "△", label: "CAUTION" },
  warning:  { color: "#FF7A2F", bg: "rgba(255,122,47,0.12)", icon: "▲", label: "WARNING" },
  critical: { color: "#FF3B4E", bg: "rgba(255,59,78,0.12)",  icon: "⬟", label: "CRITICAL" },
};

export default function SeverityChip({ severity, label, size = "sm" }: Props) {
  const cfg = CONFIG[severity];
  const px = size === "md" ? "px-2 py-1" : "px-1.5 py-0.5";
  const fs = size === "md" ? 12 : 10;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${px} font-mono font-medium`}
      style={{ background: cfg.bg, color: cfg.color, fontSize: fs, letterSpacing: "0.05em" }}
    >
      <span style={{ fontSize: fs - 1 }}>{cfg.icon}</span>
      {label ?? cfg.label}
    </span>
  );
}
