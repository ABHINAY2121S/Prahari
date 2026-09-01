type Severity = "nominal" | "advisory" | "caution" | "warning" | "critical";

interface Props {
  severity: Severity;
  label?: string;
  size?: "sm" | "md";
}

const CONFIG: Record<Severity, { color: string; bg: string; border: string; icon: string; label: string }> = {
  nominal:  { color: "var(--state-nominal)", bg: "rgba(4,120,87,0.12)", border: "rgba(4,120,87,0.3)", icon: "✓", label: "NOMINAL" },
  advisory: { color: "var(--state-advisory)", bg: "rgba(29,78,216,0.10)", border: "rgba(29,78,216,0.3)", icon: "ℹ", label: "ADVISORY" },
  caution:  { color: "var(--state-caution)", bg: "rgba(180,83,9,0.12)", border: "rgba(180,83,9,0.3)", icon: "△", label: "CAUTION" },
  warning:  { color: "var(--state-warning)", bg: "rgba(194,65,12,0.14)", border: "rgba(194,65,12,0.35)", icon: "▲", label: "WARNING" },
  critical: { color: "var(--state-critical)", bg: "rgba(185,28,28,0.14)", border: "rgba(185,28,28,0.35)", icon: "⬟", label: "CRITICAL" },
};

export default function SeverityChip({ severity, label, size = "sm" }: Props) {
  const cfg = CONFIG[severity];
  const px = size === "md" ? "px-2 py-1" : "px-1.5 py-0.5";
  const fs = size === "md" ? 12 : 10;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded ${px} font-mono font-medium`}
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontSize: fs,
        letterSpacing: "0.05em",
      }}
    >
      <span style={{ fontSize: fs - 1 }}>{cfg.icon}</span>
      {label ?? cfg.label}
    </span>
  );
}
