interface Props {
  value: number;
  label?: boolean;
  width?: number;
}

export default function ConfidenceBar({ value, label = true, width }: Props) {
  const color = value >= 85 ? "var(--state-nominal)" : value >= 70 ? "var(--state-caution)" : "var(--state-warning)";
  return (
    <div className="flex items-center gap-2" style={width ? { width } : undefined}>
      <div className="confidence-bar flex-1" style={{ height: 4 }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
      {label && (
        <span className="font-mono" style={{ fontSize: 11, color, minWidth: 30 }}>{value}%</span>
      )}
    </div>
  );
}
