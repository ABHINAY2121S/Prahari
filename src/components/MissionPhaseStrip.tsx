import React from "react";
import { useTwin } from "../context/TwinContext";

const ENVELOPES: Record<string, string> = {
  PARKED: "0 RPM · 0% LOAD · CHT Ambient",
  "PRE-FLIGHT": "800±50 RPM · IDLE · Sensor Integrity Check",
  TAXI: "1200±80 RPM · 25% LOAD · Oil Temp >50°C",
  TAKEOFF: "2680±40 RPM · 100% WOT · CHT 170–210°C",
  CLIMB: "2550±50 RPM · 95% LOAD · CHT 185–215°C",
  CRUISE: "2350±50 RPM · 78±5% LOAD · CHT 180–200°C",
  SURVEILLANCE: "2400±60 RPM · 88±6% LOAD · CHT 185–205°C",
  RETURN: "2380±50 RPM · 82% LOAD · CHT 180–200°C",
  DESCENT: "1600±100 RPM · 30% LOAD · Shock Cooling Guard",
  LANDING: "1400±100 RPM · 40% LOAD · Final Approach",
  "POST-LANDING": "800 RPM · IDLE · 3 min Turbo Cooldown",
  SHUTDOWN: "0 RPM · Master Off · Telemetry Dump",
  HANGAR: "Static · Ground Power · Diagnostic Bus Live",
};

export default function MissionPhaseStrip() {
  const { missionPhase, missionPhases, setMissionPhase } = useTwin();

  const currentIdx = missionPhases.findIndex((p) => p.id === missionPhase);
  const safeIdx = currentIdx >= 0 ? currentIdx : 6;

  return (
    <div
      className="flex items-stretch overflow-hidden select-none"
      style={{ height: 44, background: "var(--bg-panel)", borderBottom: "1px solid var(--stroke-hairline)" }}
    >
      {missionPhases.map((phase, i) => {
        const past = i < safeIdx;
        const current = i === safeIdx;
        const future = i > safeIdx;
        const prog = current ? 0.72 : 0;

        return (
          <div
            key={phase.id}
            onClick={() => setMissionPhase(phase.id)}
            className="relative flex flex-col items-center justify-center flex-1 overflow-hidden cursor-pointer hover:bg-white/5 transition-colors"
            style={{
              background: current ? "rgba(0,192,139,0.08)" : past ? "transparent" : "transparent",
              borderRight: "1px solid var(--stroke-hairline)",
              minWidth: 0,
            }}
            title={`Click to set mission phase to ${phase.id}`}
          >
            {current && (
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{ width: `${prog * 100}%`, background: "rgba(0,192,139,0.12)", pointerEvents: "none" }}
              />
            )}
            <span
              className="font-display font-semibold relative"
              style={{
                fontSize: 9,
                letterSpacing: "0.05em",
                color: current ? "var(--state-nominal)" : past ? "var(--text-muted)" : "var(--text-secondary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0 2px",
                maxWidth: "100%",
              }}
            >
              {phase.id}
            </span>
            {past && phase.elapsed && (
              <span className="font-mono relative" style={{ fontSize: 8, color: "var(--text-muted)" }}>
                {phase.elapsed}
              </span>
            )}
            {current && (
              <div className="flex items-center gap-1 relative">
                <div className="twin-pulse" style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--state-nominal)" }} />
                <span className="font-mono font-bold" style={{ fontSize: 8, color: "var(--state-nominal)" }}>
                  ACTIVE
                </span>
              </div>
            )}
            {future && phase.planned && (
              <span className="font-mono relative" style={{ fontSize: 8, color: "var(--stroke-hairline)" }}>
                {phase.planned}
              </span>
            )}
            {current && i < missionPhases.length - 1 && (
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  borderLeft: "6px solid var(--state-nominal)",
                }}
              />
            )}
          </div>
        );
      })}

      {/* Phase envelope dynamic display */}
      <div
        className="flex items-center px-3 shrink-0"
        style={{ background: "var(--bg-raised)", borderLeft: "1px solid var(--stroke-hairline)", minWidth: 320 }}
      >
        <div>
          <span className="label-xs" style={{ fontSize: 9, color: "var(--text-muted)" }}>
            PHASE ENVELOPE ·{" "}
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--state-advisory)" }}>
            {ENVELOPES[missionPhase] || "2400±60 RPM · 88±6% LOAD · CHT 185–205°C"}
          </span>
        </div>
      </div>
    </div>
  );
}
