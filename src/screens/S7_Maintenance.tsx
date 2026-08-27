import React from "react";
import { useTwin } from "../context/TwinContext";

const URGENCY_COLOR: Record<string, string> = {
  "BEFORE NEXT SORTIE": "var(--state-critical)",
  "WITHIN 25 HRS": "var(--state-warning)",
  SCHEDULED: "var(--state-caution)",
};

const LOGBOOK = [
  { date: "2026-04-18", type: "Telemetry", desc: "Digital twin anomaly F-0043 flagged on Cylinder 3", icon: "⬟", color: "var(--state-warning)" },
  { date: "2026-03-28", type: "Maintenance", desc: "Oil change — MIL-PRF-7808 20L top-up & filter clean", icon: "⚙", color: "var(--state-advisory)" },
  { date: "2026-02-14", type: "Fault", desc: "Sensor drift — CHT Cyl 2 (resolved & recalibrated)", icon: "⬟", color: "var(--state-caution)" },
  { date: "2026-01-09", type: "Maintenance", desc: "Injector set replacement (all 4 cylinders)", icon: "⚙", color: "var(--state-advisory)" },
  { date: "2025-11-22", type: "Maintenance", desc: "Piston ring inspection — within spec", icon: "⚙", color: "var(--state-advisory)" },
  { date: "2025-10-05", type: "Fault", desc: "Overheating trend — Cyl 3 (resolved)", icon: "⬟", color: "var(--state-caution)" },
  { date: "2025-08-30", type: "Install", desc: "Engine installed — SN 0143 new build acceptance", icon: "◈", color: "var(--state-nominal)" },
];

export default function S7_Maintenance() {
  const { maintenanceItems, executeMaintenance, activeAirframe } = useTwin();

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* Left: Work items */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
            AI-GENERATED MAINTENANCE ADVISORY · AIRFRAME {activeAirframe.tail}
          </span>
          <div className="flex items-center gap-2">
            <span className="label-xs" style={{ fontSize: 9, color: "var(--text-muted)" }}>
              ENGINE {activeAirframe.engine || "DRDO-AD180"} · {activeAirframe.engineHours} HRS · 842 CYCLES
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto flex-1">
          {maintenanceItems.map((item) => {
            const isCompleted = item.completed;
            const borderCol = isCompleted ? "var(--state-nominal)" : URGENCY_COLOR[item.urgency] || "var(--stroke-hairline)";

            return (
              <div
                key={item.id}
                className="panel p-3 transition-all"
                style={{
                  borderLeft: `3px solid ${borderCol}`,
                  background: isCompleted ? "rgba(0,192,139,0.04)" : "var(--bg-panel)",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-mono px-2 py-0.5 rounded font-bold"
                        style={{
                          fontSize: 10,
                          background: isCompleted ? "var(--state-nominal)20" : URGENCY_COLOR[item.urgency] + "20",
                          color: isCompleted ? "var(--state-nominal)" : URGENCY_COLOR[item.urgency],
                          border: `1px solid ${isCompleted ? "var(--state-nominal)40" : URGENCY_COLOR[item.urgency] + "40"}`,
                        }}
                      >
                        {isCompleted ? "COMPLETED & VERIFIED" : item.urgency}
                      </span>
                      <span className="font-mono text-xs text-[var(--state-advisory)]">{item.id}</span>
                      <span className="font-mono text-xs text-[var(--twin-predicted)]">CONFIDENCE: {item.confidence}%</span>
                    </div>
                    <h3 className="font-display font-semibold" style={{ fontSize: 14, color: "var(--text-primary)", margin: 0 }}>
                      {item.action}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        Component: <span className="font-mono text-[var(--text-primary)]">{item.component}</span>
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        Est. Downtime: <span className="font-mono text-[var(--text-primary)]">{item.downtime}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-2 border-t" style={{ borderColor: "var(--stroke-hairline)" }}>
                  {/* Spares */}
                  <div className="flex-1">
                    <div className="label-xs mb-1" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                      REQUIRED SPARE PARTS & STOCK
                    </div>
                    {item.spares.map((s) => (
                      <div key={s.pn} className="flex items-center gap-2">
                        <span style={{ fontSize: 11, color: "var(--text-primary)" }}>{s.part}</span>
                        <span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                          {s.pn}
                        </span>
                        <span
                          className="font-mono font-semibold"
                          style={{
                            fontSize: 10,
                            color: s.qtyAvailable > 0 ? "var(--state-nominal)" : "var(--state-critical)",
                            background: s.qtyAvailable > 0 ? "rgba(0,192,139,0.1)" : "rgba(255,59,78,0.1)",
                            padding: "1px 6px",
                            borderRadius: 3,
                          }}
                        >
                          {s.stock}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Evidence trail */}
                  <div style={{ width: 180 }}>
                    <div className="label-xs mb-1" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                      AI ANOMALY EVIDENCE
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--state-warning)" }}>
                        ⬟ {item.sourcefault || "F-0043"}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>→ Residual +41°C</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => executeMaintenance(item.id)}
                    disabled={isCompleted}
                    className="font-display font-semibold px-4 py-1.5 rounded cursor-pointer transition-all"
                    style={{
                      fontSize: 11,
                      background: isCompleted ? "rgba(0,192,139,0.15)" : "var(--accent-india)",
                      color: isCompleted ? "var(--state-nominal)" : "var(--bg-base)",
                      border: isCompleted ? "1px solid var(--state-nominal)" : "none",
                    }}
                  >
                    {isCompleted ? "✓ WORK ORDER EXECUTED (SPARES DEDUCTED)" : "EXECUTE WORK ORDER & DEDUCT PART"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Engine logbook */}
      <div className="flex flex-col gap-2" style={{ width: 290, flexShrink: 0 }}>
        <div className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
          DIGITAL ENGINE LOGBOOK · {activeAirframe.tail}
        </div>

        <div className="panel p-3 flex flex-col gap-1">
          {[
            { label: "ENGINE OPERATING HOURS", val: `${activeAirframe.engineHours} h` },
            { label: "ENGINE CYCLES", val: "842" },
            { label: "INSTALL DATE", val: "2025-08-30" },
            { label: "LAST OVERHAUL", val: "N/A (factory build)" },
            { label: "TIME BEFORE OVERHAUL (TBO)", val: "1,500 h" },
            { label: "NEXT OVERHAUL DUE", val: `~${Math.max(0, 1500 - activeAirframe.engineHours)} h` },
          ].map((r) => (
            <div key={r.label} className="flex justify-between items-center py-1" style={{ borderBottom: "1px solid var(--table-border)" }}>
              <span className="label-xs" style={{ fontSize: 9 }}>{r.label}</span>
              <span className="font-mono font-medium" style={{ fontSize: 11, color: "var(--text-primary)" }}>{r.val}</span>
            </div>
          ))}
        </div>

        <div className="label-xs" style={{ fontSize: 9, marginTop: 4, color: "var(--text-secondary)" }}>
          SERVICE HISTORY TIMELINE
        </div>
        <div className="panel p-2 flex-1 overflow-y-auto">
          <div className="relative pl-5">
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 1, background: "var(--stroke-hairline)" }} />
            {LOGBOOK.map((entry, i) => (
              <div key={i} className="relative mb-3">
                <div
                  style={{
                    position: "absolute",
                    left: -15,
                    top: 2,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: entry.color,
                  }}
                />
                <div className="font-mono" style={{ fontSize: 9, color: "var(--text-muted)" }}>
                  {entry.date}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-primary)" }}>{entry.desc}</div>
                <span
                  className="label-xs font-mono"
                  style={{
                    fontSize: 8,
                    color: entry.color,
                    background: entry.color + "20",
                    padding: "1px 4px",
                    borderRadius: 2,
                  }}
                >
                  {entry.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
