import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import ConfidenceBar from "../components/shared/ConfidenceBar";
import SeverityChip from "../components/shared/SeverityChip";
import { useTwin } from "../context/TwinContext";
import { COMPONENTS_RUL } from "../data/mockData";

export default function S4_Prognostics() {
  const { activeAirframe, activeInjectedFaults, navigateToScreen } = useTwin();
  const [selectedScenario, setSelectedScenario] = useState<"nominal" | "high" | "eco">("nominal");
  const [selectedComponent, setSelectedComponent] = useState<string>("Fuel Injector #3");

  const hasCyl3Fault = activeInjectedFaults.includes("cyl3_injector");

  // Dynamic component RUL adjustments based on aircraft and active faults
  const components = COMPONENTS_RUL.map((c) => {
    let hours = Math.round((c.hoursRemaining * activeAirframe.rul) / 142);
    let status = c.status;
    let rate = c.degradationRate;

    if (c.name.includes("Injector") && hasCyl3Fault) {
      hours = Math.min(hours, 38);
      status = "warning";
      rate = 2.1;
    }
    return { ...c, hoursRemaining: hours, status, degradationRate: rate };
  });

  // Dynamic RUL Projection curves with scenario multipliers
  const scenarioMultiplier = selectedScenario === "high" ? 1.4 : selectedScenario === "eco" ? 0.7 : 1.0;

  const projectionData = Array.from({ length: 60 }, (_, i) => {
    const t = i - 15; // -15 past, +45 future
    const past = i < 15;
    const historical = past ? 100 - i * 0.8 : undefined;
    const degradationSpeed = 0.85 * scenarioMultiplier;
    const nominalMean = Math.max(0, 87.4 - (i > 15 ? (i - 15) * degradationSpeed : 0));
    const upper = Math.min(100, nominalMean + (past ? 0 : (i - 15) * 0.25));
    const lower = Math.max(0, nominalMean - (past ? 0 : (i - 15) * 0.25));

    return {
      t: `${t >= 0 ? "+" : ""}${t}h`,
      historical,
      nominalMean: Math.round(nominalMean),
      upper: Math.round(upper),
      lower: Math.round(lower),
    };
  });

  const abortRisk = hasCyl3Fault ? 24 : 11;

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* Left: Component RUL Table */}
      <div className="flex flex-col gap-2" style={{ width: 320, flexShrink: 0 }}>
        <div className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
          COMPONENT RUL TABLE · {activeAirframe.tail}
        </div>

        <div className="panel flex-1 overflow-auto">
          <table className="data-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                {["COMPONENT", "RUL h", "RUL cyc", "DEG/hr", "CONF"].map((h) => (
                  <th key={h} style={{ padding: "5px 6px", fontSize: 9 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {components.map((c) => {
                const isSelected = selectedComponent === c.name;
                return (
                  <tr
                    key={c.name}
                    onClick={() => setSelectedComponent(c.name)}
                    style={{
                      cursor: "pointer",
                      background: isSelected ? "var(--table-selected" : "transparent",
                    }}
                  >
                    <td style={{ fontSize: 11, color: isSelected ? "var(--text-primary)" : "var(--text-secondary)", padding: "5px 6px", fontFamily: "Inter" }}>
                      {c.name}
                    </td>
                    <td>
                      <span
                        className="font-mono font-bold"
                        style={{
                          fontSize: 13,
                          color: c.status === "warning" ? "var(--state-warning)" : c.status === "caution" ? "var(--state-caution)" : "var(--state-nominal)",
                        }}
                      >
                        {c.hoursRemaining}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                      {c.cyclesRemaining}
                    </td>
                    <td className="font-mono" style={{ fontSize: 11, color: c.degradationRate > 1.5 ? "var(--state-warning)" : "var(--state-caution)" }}>
                      {c.degradationRate}
                    </td>
                    <td>
                      <ConfidenceBar value={c.confidence} label={false} width={45} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mission Reliability Card */}
        <div className="inferred-card">
          <div className="label-xs mb-2" style={{ fontSize: 10, color: "var(--text-primary)" }}>
            MISSION RELIABILITY & ABORT METRIC
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div>
              <div className="label-xs" style={{ fontSize: 9 }}>ABORT PROBABILITY</div>
              <span
                className="font-mono font-bold"
                style={{ fontSize: 26, color: abortRisk > 20 ? "var(--state-warning)" : "var(--state-nominal)" }}
              >
                {abortRisk}%
              </span>
            </div>
            <div className="flex flex-col items-center px-3" style={{ borderLeft: "1px solid var(--stroke-hairline)" }}>
              <div className="label-xs" style={{ fontSize: 9 }}>RISK LEVEL</div>
              <SeverityChip severity={abortRisk > 20 ? "caution" : "nominal"} label={abortRisk > 20 ? "ELEVATED" : "LOW"} size="md" />
            </div>
          </div>

          <div className="label-xs mb-1" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
            DOMINANT FAILURE RISKS
          </div>
          <div className="flex flex-col gap-1">
            {[
              { name: "Injector Clogging (Cyl 3)", prob: hasCyl3Fault ? 68 : 12, col: "var(--state-warning)" },
              { name: "Thermal Exceedance (>215°C)", prob: hasCyl3Fault ? 34 : 8, col: "var(--state-caution)" },
              { name: "Propeller Vibration Harmonic", prob: 9, col: "var(--state-nominal)" },
            ].map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>{r.name}</span>
                  <span className="font-mono font-semibold" style={{ color: r.col, fontSize: 10 }}>{r.prob}%</span>
                </div>
                <div style={{ height: 3, background: "var(--bg-raised)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${r.prob}%`, height: "100%", background: r.col }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: RUL Projection Chart & Scenario Control */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
              REMAINING USEFUL LIFE TRAJECTORY · {selectedComponent}
            </span>
            <div className="label-xs" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
              TBO LIMIT: 300 HOURS · CURRENT PREDICTED FLEET WEAR
            </div>
          </div>

          {/* Scenario selector tabs */}
          <div className="flex items-center gap-1.5 panel p-1">
            <span className="label-xs mr-1" style={{ fontSize: 9, color: "var(--text-muted)" }}>SCENARIO:</span>
            {[
              { id: "eco", label: "ECO PATROL (70% PWR)" },
              { id: "nominal", label: "NOMINAL ISR (88% PWR)" },
              { id: "high", label: "DASH / HIGH STRESS (96% PWR)" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id as any)}
                className="font-mono text-[10px] px-2 py-1 rounded cursor-pointer transition-all"
                style={{
                  background: selectedScenario === s.id ? "var(--state-advisory)" : "var(--bg-raised)",
                  color: selectedScenario === s.id ? "var(--bg-base)" : "var(--text-secondary)",
                  fontWeight: selectedScenario === s.id ? 700 : 500,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projection Area Chart */}
        <div className="panel p-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>
                HEALTH DEGRADATION & 90% CONFIDENCE BOUNDS
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div style={{ width: 12, height: 2, background: "var(--state-nominal)" }} />
                  <span className="label-xs" style={{ fontSize: 9 }}>HISTORICAL</span>
                </div>
                <div className="flex items-center gap-1">
                  <div style={{ width: 12, height: 2, background: "var(--state-advisory)" }} />
                  <span className="label-xs" style={{ fontSize: 9 }}>PREDICTED MEAN</span>
                </div>
                <div className="flex items-center gap-1">
                  <div style={{ width: 12, height: 8, background: "rgba(61,169,252,0.15)" }} />
                  <span className="label-xs" style={{ fontSize: 9 }}>90% CI BAND</span>
                </div>
              </div>
            </div>
            <div className="label-xs font-mono" style={{ color: "var(--twin-predicted)" }}>
              MODEL CONFIDENCE: 91%
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
                <XAxis dataKey="t" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                <YAxis domain={[40, 105]} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                />
                <ReferenceLine y={65} stroke="var(--state-critical)" strokeDasharray="4 2" label={{ value: "MAINTENANCE MANDATORY THRESHOLD (EHI 65)", fill: "var(--state-critical)", fontSize: 9 }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(61,169,252,0.15)" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-panel)" />
                <Area type="monotone" dataKey="historical" stroke="var(--state-nominal)" strokeWidth={2} fill="none" dot={false} />
                <Area type="monotone" dataKey="nominalMean" stroke="var(--state-advisory)" strokeWidth={2} fill="none" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick maintenance action button */}
        <div className="flex gap-2">
          <button
            onClick={() => navigateToScreen("maintenance")}
            className="flex-1 panel p-2.5 flex items-center justify-between cursor-pointer hover:border-[var(--state-advisory)] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16 }}>⚙️</span>
              <div className="text-left">
                <div className="font-display font-semibold text-xs text-[var(--text-primary)]">
                  VIEW PREVENTIVE MAINTENANCE SCHEDULE
                </div>
                <div className="label-xs" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                  Schedule replacement of {selectedComponent} before TBO expiration
                </div>
              </div>
            </div>
            <span className="font-mono text-xs text-[var(--state-advisory)]">GOTO S7 →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
