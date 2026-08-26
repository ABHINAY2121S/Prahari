interface Props {
  value: number;
  label?: boolean;
  width?: number;
}

export default function ConfidenceBar({ value, label = true, width }: Props) {
  const color = value >= 85 ? "#00C08B" : value >= 70 ? "#F5B335" : "#FF7A2F";
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
