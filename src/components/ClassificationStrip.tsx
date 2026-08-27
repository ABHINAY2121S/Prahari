import { useEffect, useState } from "react";

export default function ClassificationStrip() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const utc = time.toUTCString().slice(17, 25);
  const ist = new Date(time.getTime() + 5.5 * 3600000)
    .toISOString()
    .slice(11, 19);

  return (
    <div
      className="flex items-center justify-between px-4 font-mono"
      style={{
        height: 24,
        background: "var(--bg-command)",
        borderBottom: "1px solid var(--border-command)",
        fontSize: 10,
        letterSpacing: "0.06em",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 8,
            height: 8,
            background: "var(--accent-india)",
            borderRadius: "50%",
          }}
        />
        <span style={{ color: "var(--accent-india)", fontWeight: 600 }}>RESTRICTED</span>
        <span style={{ color: "var(--text-muted)" }}>—</span>
        <span style={{ color: "var(--text-secondary)" }}>DRDO / ADE · PRAHARI-DT</span>
      </div>
      <span style={{ color: "var(--twin-predicted)", fontWeight: 600 }}>PRAHARI-DT v1.0</span>
      <div className="flex items-center gap-3">
        <span style={{ color: "var(--text-secondary)" }}>UTC {utc}</span>
        <span style={{ color: "var(--text-command-muted)" }}>|</span>
        <span style={{ color: "var(--text-secondary)" }}>IST {ist}</span>
        <span style={{ color: "var(--text-command-muted)" }}>|</span>
        <span style={{ color: "var(--text-muted)" }}>SESSION: OFFR-7214</span>
      </div>
    </div>
  );
}
