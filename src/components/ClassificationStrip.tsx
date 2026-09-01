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
          className="twin-pulse"
          style={{
            width: 7,
            height: 7,
            background: "var(--accent-india)",
            borderRadius: "50%",
          }}
        />
        <span
          className="px-1.5 py-0.5 rounded font-bold tracking-wider"
          style={{
            background: "rgba(217, 119, 6, 0.12)",
            color: "var(--accent-india)",
            border: "1px solid rgba(217, 119, 6, 0.35)",
            fontSize: 9,
          }}
        >
          RESTRICTED
        </span>
        <span style={{ color: "var(--text-command-muted)" }}>—</span>
        <span style={{ color: "var(--text-command)", fontWeight: 600 }}>DRDO / ADE</span>
        <span style={{ color: "var(--text-command-muted)" }}>·</span>
        <span style={{ color: "var(--text-command-secondary)" }}>PROPULSION DIGITAL TWIN C2</span>
      </div>
      <span style={{ color: "var(--twin-predicted)", fontWeight: 700, letterSpacing: "0.08em" }}>
        PRAHARI-DT v1.0
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--state-nominal)" }} />
          <span style={{ color: "var(--text-command-secondary)" }}>UTC {utc}</span>
        </div>
        <span style={{ color: "var(--border-command)" }}>|</span>
        <span style={{ color: "var(--text-command-secondary)" }}>IST {ist}</span>
        <span style={{ color: "var(--border-command)" }}>|</span>
        <span
          className="px-1.5 py-0.2 rounded font-mono"
          style={{
            background: "var(--bg-command-control)",
            border: "1px solid var(--border-command)",
            color: "var(--text-command-muted)",
            fontSize: 9,
          }}
        >
          SESSION: OFFR-7214
        </span>
      </div>
    </div>
  );
}
