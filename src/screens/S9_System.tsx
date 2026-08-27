import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTwin } from "../context/TwinContext";

function StatusDot({ status }: { status: string }) {
  const color = status === "live" ? "var(--state-nominal)" : status === "drifting" ? "var(--state-caution)" : status === "stale" ? "var(--state-warning)" : "var(--state-critical)";
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

// Latency histogram data
const LATENCY_HIST = Array.from({ length: 20 }, (_, i) => ({
  ms: i * 10,
  count: Math.round(Math.exp(-((i - 5) ** 2) / 8) * 40 + Math.random() * 5),
}));

export default function S9_System() {
  const { sensors, calibrateSensor, activeAirframe } = useTwin();
  const [busStats, setBusStats] = useState({ frameRate: 2000, errors: 3, pktLoss: 0.4, latencyMs: 142 });

  useEffect(() => {
    const t = setInterval(() => {
      setBusStats((p) => ({
        frameRate: Math.round(1990 + (Math.random() - 0.5) * 40),
        errors: p.errors + (Math.random() > 0.9 ? 1 : 0),
        pktLoss: parseFloat((0.3 + Math.random() * 0.3).toFixed(2)),
        latencyMs: Math.round(135 + (Math.random() - 0.5) * 20),
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const live = sensors.filter((s) => s.status === "live").length;
  const drifting = sensors.filter((s) => s.status === "drifting").length;

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* Left: Bus + Link health */}
      <div className="flex flex-col gap-2" style={{ width: 260, flexShrink: 0 }}>
        <div className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
          BUS & LINK INTEGRITY · {activeAirframe.tail}
        </div>

        {/* CAN Bus stats */}
        <div className="panel p-3">
          <div className="label-xs mb-2" style={{ fontSize: 10, color: "var(--text-primary)" }}>
            CAN BUS / SOCKETCAN
          </div>
          {[
            { label: "FRAME RATE", val: `${busStats.frameRate.toLocaleString()} fps`, ok: busStats.frameRate > 1800 },
            { label: "CAN ERRORS", val: String(busStats.errors), ok: busStats.errors < 10 },
            { label: "PKT LOSS", val: `${busStats.pktLoss}%`, ok: busStats.pktLoss < 1 },
            { label: "LATENCY", val: `${busStats.latencyMs} ms`, ok: busStats.latencyMs < 200 },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1" style={{ borderBottom: "1px solid var(--table-border)" }}>
              <span className="label-xs" style={{ fontSize: 10 }}>{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium" style={{ fontSize: 12, color: s.ok ? "var(--state-nominal)" : "var(--state-caution)" }}>
                  {s.val}
                </span>
                <StatusDot status={s.ok ? "live" : "drifting"} />
              </div>
            </div>
          ))}
        </div>

        {/* ECU / FADEC */}
        <div className="panel p-3">
          <div className="label-xs mb-2" style={{ fontSize: 10, color: "var(--text-primary)" }}>
            ECU / FADEC LINK
          </div>
          {[
            { label: "ECU LINK", val: "CONNECTED", status: "live" },
            { label: "FADEC STATE", val: "CLOSED LOOP", status: "live" },
            { label: "ECU VERSION", val: "v2.4.1", status: "live" },
            { label: "HEARTBEAT", val: "50 Hz", status: "live" },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1" style={{ borderBottom: "1px solid var(--table-border)" }}>
              <span className="label-xs" style={{ fontSize: 10 }}>{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium" style={{ fontSize: 11, color: "var(--state-nominal)" }}>
                  {s.val}
                </span>
                <StatusDot status={s.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Edge/Cloud split */}
        <div className="panel p-3">
          <div className="label-xs mb-2" style={{ fontSize: 10, color: "var(--text-primary)" }}>
            COMPUTE TOPOLOGY
          </div>
          <div className="flex gap-2 mb-2">
            <div className="flex-1 raised p-2 text-center">
              <div className="label-xs" style={{ fontSize: 9 }}>EDGE (ONBOARD)</div>
              <div className="font-mono font-bold" style={{ fontSize: 18, color: "var(--state-advisory)" }}>72%</div>
            </div>
            <div className="flex-1 raised p-2 text-center">
              <div className="label-xs" style={{ fontSize: 9 }}>CLOUD (GCS)</div>
              <div className="font-mono font-bold" style={{ fontSize: 18, color: "var(--twin-predicted)" }}>28%</div>
            </div>
          </div>
          <div style={{ height: 6, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg,var(--state-advisory),var(--twin-predicted))", borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Center: Sensor status + drift detector + Calibration Actions */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
            PER-SENSOR TELEMETRY MATRIX & RECALIBRATION
          </span>
          <div className="flex gap-3">
            <span className="font-mono text-xs text-[var(--state-nominal)] font-semibold">{live} NOMINAL</span>
            <span className="font-mono text-xs text-[var(--state-caution)] font-semibold">{drifting} DRIFTING</span>
            <span className="font-mono text-xs text-[var(--state-critical)]">0 FAILED</span>
          </div>
        </div>

        <div className="panel flex-1 overflow-auto">
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {["SENSOR ID", "NAME", "STATUS", "RESIDUAL", "DRIFT BAR", "ACTION"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", fontSize: 9, whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensors.map((s) => {
                const isDrifting = s.status === "drifting";
                const isHigh = Math.abs(s.residual) > 5;
                return (
                  <tr key={s.id} style={{ background: isDrifting ? "rgba(245,179,53,0.06)" : undefined }}>
                    <td className="font-mono text-xs font-semibold text-[var(--state-advisory)]" style={{ padding: "6px 8px" }}>
                      {s.id}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--text-primary)", padding: "6px 8px" }}>{s.name}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <div className="flex items-center gap-1.5">
                        <StatusDot status={s.status} />
                        <span
                          className="font-mono font-bold"
                          style={{
                            fontSize: 10,
                            color: s.status === "live" ? "var(--state-nominal)" : s.status === "drifting" ? "var(--state-caution)" : "var(--state-critical)",
                          }}
                        >
                          {s.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <span
                        className="font-mono font-bold"
                        style={{ fontSize: 12, color: isHigh ? "var(--state-warning)" : "var(--state-nominal)" }}
                      >
                        {s.residual > 0 ? "+" : ""}{s.residual.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      <div style={{ height: 4, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden", width: 90 }}>
                        <div
                          style={{
                            width: `${Math.min(100, (s.residual / 45) * 100)}%`,
                            height: "100%",
                            background: isHigh ? "var(--state-warning)" : isDrifting ? "var(--state-caution)" : "var(--state-nominal)",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {isDrifting || isHigh ? (
                        <button
                          onClick={() => calibrateSensor(s.id)}
                          className="font-display font-semibold text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-[var(--state-nominal)]"
                          style={{ background: "rgba(0,192,139,0.15)", color: "var(--state-nominal)", border: "1px solid var(--state-nominal)40" }}
                        >
                          RECALIBRATE / ZERO
                        </button>
                      ) : (
                        <span className="label-xs" style={{ fontSize: 9, color: "var(--text-muted)" }}>
                          CALIBRATED ✓
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Key insight */}
        <div
          className="flex items-center gap-2 p-3 rounded"
          style={{ background: "rgba(61,169,252,0.06)", border: "1px solid var(--table-selected)" }}
        >
          <span style={{ fontSize: 16, color: "var(--state-advisory)" }}>ℹ</span>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
            <strong style={{ color: "var(--state-advisory)" }}>Digital Twin Hardware-in-the-Loop:</strong> If both CHT & EGT residuals spike simultaneously with injection quantity changes, the system attributes the event to physical combustion rather than sensor instrumentation drift.
          </p>
        </div>
      </div>

      {/* Right: Telemetry Histogram */}
      <div className="flex flex-col gap-2" style={{ width: 230, flexShrink: 0 }}>
        <div className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
          BUS LATENCY DISTRIBUTION
        </div>
        <div className="panel p-2" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={LATENCY_HIST} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
              <XAxis dataKey="ms" tick={{ fill: "var(--text-muted)", fontSize: 8, fontFamily: "IBM Plex Mono" }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
              <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", fontSize: 11 }} />
              <Bar dataKey="count" fill="var(--state-advisory)" opacity={0.75} radius={[1, 1, 0, 0]} name="Packets" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel p-3 flex flex-col gap-1">
          <div className="label-xs" style={{ fontSize: 10, color: "var(--text-primary)" }}>
            TELEMETRY LINK STATS
          </div>
          {[
            { label: "P50 LATENCY", val: "42 ms" },
            { label: "P95 LATENCY", val: "118 ms" },
            { label: "P99 LATENCY", val: "187 ms" },
            { label: "PACKET LOSS", val: `${busStats.pktLoss}%` },
            { label: "INGESTION", val: "20 Hz" },
          ].map((s) => (
            <div key={s.label} className="flex justify-between py-1" style={{ borderBottom: "1px solid var(--table-border)" }}>
              <span className="label-xs" style={{ fontSize: 9 }}>{s.label}</span>
              <span className="font-mono font-medium" style={{ fontSize: 11, color: "var(--text-primary)" }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
