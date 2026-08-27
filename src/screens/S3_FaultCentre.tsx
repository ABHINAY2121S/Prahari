import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import SeverityChip from "../components/shared/SeverityChip";
import ConfidenceBar from "../components/shared/ConfidenceBar";
import { useTwin, FaultStatus } from "../context/TwinContext";

export default function S3_FaultCentre() {
  const { faults, activeFaultId, setActiveFaultId, setFaultStatus, navigateToScreen } = useTwin();
  const [filter, setFilter] = useState("ALL");

  const filters = ["ALL", "OPEN", "ACKNOWLEDGED", "CONFIRMED", "FALSE_POSITIVE", "DEFERRED", "CLOSED"];
  const filtered = filter === "ALL" ? faults : faults.filter((f) => f.status === filter);

  const selected = faults.find((f) => f.id === activeFaultId) || faults[0] || filtered[0];

  const featureChartData = selected.features.map((f) => ({
    name: f.name,
    value: f.positive ? Math.abs(f.value) : -Math.abs(f.value),
    abs: Math.abs(f.value),
  }));

  // Evidence chart - anomalous window
  const evidenceData = Array.from({ length: 60 }, (_, i) => {
    const anomaly = i >= 38 && i <= 55;
    const base = selected.subsystem === "COMBUSTION" ? 648 : selected.subsystem === "THERMAL" ? 197 : 2.0;
    const noise = (Math.random() - 0.5) * (anomaly ? 12 : 4);
    const drift = anomaly
      ? (i - 38) * (selected.subsystem === "COMBUSTION" ? 1.8 : selected.subsystem === "THERMAL" ? 0.6 : 0.04)
      : 0;
    return { t: i, val: Math.round(base + noise + drift), anomaly };
  });

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* LEFT — Fault Register */}
      <div className="flex flex-col gap-2" style={{ width: 380, flexShrink: 0 }}>
        <div className="flex items-center justify-between">
          <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
            FAULT REGISTER ({faults.length} TOTAL)
          </span>
          <div className="flex gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="font-mono px-1.5 py-0.5 rounded cursor-pointer"
                style={{
                  fontSize: 9,
                  background: filter === f ? "var(--table-selected)" : "var(--bg-raised)",
                  color: filter === f ? "var(--state-advisory)" : "var(--text-muted)",
                  border: `1px solid ${filter === f ? "var(--state-advisory)40" : "var(--stroke-hairline)"}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="panel overflow-auto flex-1">
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {["TIME", "SUBSYS", "FAULT TYPE", "SEV", "CONF", "STATUS"].map((h) => (
                  <th key={h} style={{ padding: "5px 6px", fontSize: 9 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((fault) => (
                <tr
                  key={fault.id}
                  onClick={() => setActiveFaultId(fault.id)}
                  className={selected.id === fault.id ? "selected" : ""}
                  style={{
                    cursor: "pointer",
                    background: selected.id === fault.id ? "var(--table-selected" : "transparent",
                  }}
                >
                  <td className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)", padding: "5px 6px" }}>
                    {fault.time}
                  </td>
                  <td style={{ padding: "5px 6px" }}>
                    <span className="label-xs" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                      {fault.subsystem}
                    </span>
                  </td>
                  <td style={{ padding: "5px 6px", fontSize: 11, color: "var(--text-primary)" }}>
                    {fault.type}
                  </td>
                  <td style={{ padding: "5px 6px" }}>
                    <SeverityChip severity={fault.severity as any} size="sm" />
                  </td>
                  <td className="font-mono" style={{ fontSize: 11, color: "var(--twin-predicted)", padding: "5px 6px" }}>
                    {fault.confidence}%
                  </td>
                  <td style={{ padding: "5px 6px" }}>
                    <span
                      className="label-xs font-mono font-bold"
                      style={{
                        fontSize: 9,
                        color:
                          fault.status === "OPEN"
                            ? "var(--state-warning)"
                            : fault.status === "CONFIRMED"
                            ? "var(--state-critical)"
                            : fault.status === "FALSE_POSITIVE"
                            ? "var(--state-nominal)"
                            : fault.status === "DEFERRED"
                            ? "var(--state-caution)"
                            : "var(--text-muted)",
                      }}
                    >
                      {fault.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT — Explainability & Triage Workspace */}
      <div className="flex flex-col gap-2 flex-1 min-w-0 overflow-y-auto">
        {/* Selected Fault Header */}
        <div
          className="panel p-3 flex items-center justify-between"
          style={{ borderLeft: `3px solid ${selected.severity === "warning" ? "var(--state-warning)" : "var(--state-caution)"}` }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold" style={{ fontSize: 12, color: "var(--state-advisory)" }}>
                {selected.id}
              </span>
              <SeverityChip severity={selected.severity as any} />
              <span className="label-xs" style={{ color: "var(--text-secondary)" }}>
                {selected.subsystem}
              </span>
              <span className="label-xs" style={{ color: "var(--text-muted)" }}>
                PHASE: {selected.phase}
              </span>
            </div>
            <div className="font-display font-bold" style={{ fontSize: 18, color: "var(--text-primary)" }}>
              {selected.type}
            </div>
          </div>

          {/* Triage Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFaultStatus(selected.id, "CONFIRMED")}
              className="font-display font-semibold px-3 py-1.5 rounded cursor-pointer transition-all"
              style={{
                fontSize: 11,
                background: selected.status === "CONFIRMED" ? "var(--state-critical)" : "var(--bg-raised)",
                color: selected.status === "CONFIRMED" ? "#FFFFFF" : "var(--state-warning)",
                border: "1px solid var(--state-warning)60",
              }}
              title="Confirm fault and queue for maintenance"
            >
              {selected.status === "CONFIRMED" ? "✓ CONFIRMED (QUEUED)" : "CONFIRM FAULT"}
            </button>

            <button
              onClick={() => setFaultStatus(selected.id, "FALSE_POSITIVE")}
              className="font-display font-semibold px-3 py-1.5 rounded cursor-pointer transition-all"
              style={{
                fontSize: 11,
                background: selected.status === "FALSE_POSITIVE" ? "var(--state-nominal)" : "var(--bg-raised)",
                color: selected.status === "FALSE_POSITIVE" ? "#FFFFFF" : "var(--state-nominal)",
                border: "1px solid var(--state-nominal)60",
              }}
              title="Mark as false positive and log model feedback"
            >
              {selected.status === "FALSE_POSITIVE" ? "✓ FALSE POSITIVE" : "FALSE POSITIVE"}
            </button>

            <button
              onClick={() => setFaultStatus(selected.id, "DEFERRED")}
              className="font-display font-semibold px-3 py-1.5 rounded cursor-pointer transition-all"
              style={{
                fontSize: 11,
                background: selected.status === "DEFERRED" ? "var(--state-caution)" : "var(--bg-raised)",
                color: selected.status === "DEFERRED" ? "var(--bg-base)" : "var(--state-caution)",
                border: "1px solid var(--state-caution)60",
              }}
            >
              DEFER
            </button>
          </div>
        </div>

        {/* Natural language explanation */}
        <div className="inferred-card">
          <div className="label-xs mb-1" style={{ color: "var(--twin-predicted)", fontSize: 10 }}>
            AI EXPLAINABILITY RATIONALE (XAI ENGINE)
          </div>
          <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
            "{selected.rationale}"
          </p>
          <div className="flex gap-4 mt-2 pt-2 border-t" style={{ borderColor: "var(--stroke-hairline)" }}>
            <div>
              <span className="label-xs" style={{ fontSize: 8 }}>ALGORITHM:</span>
              <span className="font-mono text-xs text-[var(--text-primary)] ml-1">{selected.algorithm}</span>
            </div>
            <div>
              <span className="label-xs" style={{ fontSize: 8 }}>PRECISION:</span>
              <span className="font-mono text-xs text-[var(--state-nominal)] ml-1">{selected.precision}</span>
            </div>
            <div>
              <span className="label-xs" style={{ fontSize: 8 }}>RECALL:</span>
              <span className="font-mono text-xs text-[var(--state-nominal)] ml-1">{selected.recall}</span>
            </div>
            <div>
              <span className="label-xs" style={{ fontSize: 8 }}>TRAINING WINDOW:</span>
              <span className="font-mono text-xs text-[var(--text-secondary)] ml-1">{selected.trainingWindow}</span>
            </div>
          </div>
        </div>

        {/* SHAP Feature Importance & Evidence Chart */}
        <div className="grid grid-cols-2 gap-2 flex-1 min-h-[220px]">
          {/* Feature Importance Bar Chart */}
          <div className="panel p-3 flex flex-col">
            <div className="label-xs mb-2" style={{ color: "var(--text-primary)", fontSize: 11 }}>
              FEATURE IMPORTANCE (SHAP VALUES)
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={featureChartData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
                <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "var(--text-secondary)", fontSize: 9, fontFamily: "Inter" }} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                />
                <ReferenceLine x={0} stroke="var(--text-muted)" />
                <Bar dataKey="value" radius={[0, 2, 2, 0]}>
                  {featureChartData.map((f, i) => (
                    <Cell key={i} fill={f.value > 0 ? "var(--state-warning)" : "var(--state-advisory)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Evidence Window Chart */}
          <div className="panel p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>
                TELEMETRY EVIDENCE WINDOW (T-60s)
              </span>
              <span className="label-xs" style={{ color: "var(--state-warning)", fontSize: 9 }}>
                ● ANOMALOUS DRIFT WINDOW
              </span>
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={evidenceData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
                <XAxis dataKey="t" tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                />
                <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                  {evidenceData.map((d, i) => (
                    <Cell key={i} fill={d.anomaly ? "var(--state-warning)" : "var(--stroke-hairline)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick link to Maintenance if confirmed */}
        {selected.status === "CONFIRMED" && (
          <div
            className="p-2.5 rounded flex items-center justify-between cursor-pointer hover:bg-white/5"
            style={{ background: "rgba(255,122,47,0.1)", border: "1px solid var(--state-warning)50" }}
            onClick={() => navigateToScreen("maintenance")}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 14 }}>⚙️</span>
              <span className="font-display font-semibold text-xs text-[var(--state-warning)]">
                MAINTENANCE WORK ORDER ACTIVE · VIEW RECOMMENDED PARTS & PROCEDURE →
              </span>
            </div>
            <span className="font-mono text-xs text-[var(--text-primary)]">GOTO S7 MAINTENANCE</span>
          </div>
        )}
      </div>
    </div>
  );
}
