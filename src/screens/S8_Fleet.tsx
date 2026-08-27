import React, { useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import HealthRing from "../components/shared/HealthRing";
import { useTwin, Airframe } from "../context/TwinContext";

function ehiColor(v: number) {
  if (v >= 90) return "var(--state-nominal)";
  if (v >= 75) return "var(--state-caution)";
  if (v >= 60) return "var(--state-warning)";
  return "var(--state-critical)";
}

function phaseColor(p: string) {
  if (p === "GROUNDED" || p === "MAINTENANCE") return "var(--state-critical)";
  if (p === "SURVEILLANCE" || p === "CRUISE") return "var(--state-nominal)";
  return "var(--text-secondary)";
}

export default function S8_Fleet() {
  const { fleet, activeAirframe, switchAirframe, navigateToScreen } = useTwin();
  const [filter, setFilter] = useState<string>("ALL");

  const sortedFleet = [...fleet].sort((a, b) => a.ehi - b.ehi);

  const filteredFleet = filter === "ALL"
    ? sortedFleet
    : filter === "LIVE"
    ? sortedFleet.filter((a) => a.live)
    : filter === "GROUNDED"
    ? sortedFleet.filter((a) => a.phase === "GROUNDED" || a.phase === "MAINTENANCE")
    : sortedFleet;

  const scatterData = fleet.map((a) => ({
    x: a.engineHours,
    y: a.ehi,
    tail: a.tail,
    color: ehiColor(a.ehi),
  }));

  const handleSelectAirframe = (tail: string) => {
    switchAirframe(tail);
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden p-2">
      {/* Fleet summary strip */}
      <div className="flex gap-2">
        {[
          { label: "TOTAL AIRFRAMES", val: fleet.length, sub: "in fleet inventory", color: "var(--text-primary)" },
          { label: "AIRBORNE NOW", val: fleet.filter((a) => a.live).length, sub: "active sorties", color: "var(--state-nominal)" },
          {
            label: "GROUNDED / MAINTENANCE",
            val: fleet.filter((a) => a.phase === "GROUNDED" || a.phase === "MAINTENANCE").length,
            sub: "unserviceable airframes",
            color: "var(--state-critical)",
          },
          {
            label: "FLEET MEAN EHI",
            val: (fleet.reduce((s, a) => s + a.ehi, 0) / fleet.length).toFixed(1),
            sub: "/ 100 benchmark",
            color: "var(--state-caution)",
          },
          {
            label: "FLEET MIN EHI",
            val: Math.min(...fleet.map((a) => a.ehi)).toFixed(1),
            sub: "TB-215 · CRITICAL WEAR",
            color: "var(--state-critical)",
          },
          {
            label: "OPEN FAULTS",
            val: fleet.reduce((s, a) => s + a.openFaults, 0),
            sub: "across all airframes",
            color: "var(--state-warning)",
          },
        ].map((s) => (
          <div key={s.label} className="panel p-2.5 flex-1">
            <div className="label-xs" style={{ fontSize: 9 }}>{s.label}</div>
            <div className="font-mono font-bold" style={{ fontSize: 20, color: s.color, lineHeight: 1.2 }}>
              {s.val}
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-1 min-h-0">
        {/* Aircraft cards grid */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
                AIRFRAME FLEET HEALTH (CLICK TO SWITCH ACTIVE AIRFRAME)
              </span>
              <span className="label-xs" style={{ fontSize: 9, color: "var(--state-advisory)" }}>
                ACTIVE: {activeAirframe.tail}
              </span>
            </div>

            <div className="flex gap-1">
              {["ALL", "LIVE", "GROUNDED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="font-mono px-2 py-0.5 rounded cursor-pointer"
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

          <div className="grid gap-2 overflow-y-auto" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
            {filteredFleet.map((ac) => {
              const isActive = ac.tail === activeAirframe.tail;
              return (
                <div
                  key={ac.tail}
                  onClick={() => handleSelectAirframe(ac.tail)}
                  className="panel p-3 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    borderLeft: `3px solid ${ehiColor(ac.ehi)}`,
                    border: isActive ? `1px solid var(--state-advisory)` : "1px solid var(--stroke-hairline)",
                    background: isActive ? "var(--table-selected)" : "var(--bg-panel)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <HealthRing value={ac.ehi} size={64} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold" style={{ fontSize: 16, color: "var(--text-primary)" }}>
                          {ac.tail}
                        </span>
                        <div
                          className="twin-pulse"
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: ac.live ? "var(--state-nominal)" : "var(--text-muted)",
                            display: "inline-block",
                          }}
                        />
                        <span className="label-xs" style={{ fontSize: 9, color: ac.live ? "var(--state-nominal)" : "var(--text-muted)" }}>
                          {ac.live ? "LIVE" : "IDLE"}
                        </span>
                        {isActive && (
                          <span className="label-xs font-mono ml-auto" style={{ fontSize: 8, color: "var(--state-advisory)", background: "var(--state-advisory)20", padding: "1px 4px", borderRadius: 2 }}>
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="label-xs" style={{ fontSize: 9, color: "var(--text-muted)" }}>
                        {ac.platform}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: phaseColor(ac.phase) }} />
                        <span className="font-mono" style={{ fontSize: 11, color: phaseColor(ac.phase) }}>
                          {ac.phase}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 raised p-1 text-center">
                      <div className="label-xs" style={{ fontSize: 8 }}>RUL</div>
                      <div className="font-mono font-bold" style={{ fontSize: 12, color: ehiColor(ac.ehi) }}>
                        {ac.rul}h
                      </div>
                    </div>
                    <div className="flex-1 raised p-1 text-center">
                      <div className="label-xs" style={{ fontSize: 8 }}>FAULTS</div>
                      <div
                        className="font-mono font-bold"
                        style={{
                          fontSize: 12,
                          color: ac.openFaults > 5 ? "var(--state-critical)" : ac.openFaults > 2 ? "var(--state-warning)" : "var(--state-caution)",
                        }}
                      >
                        {ac.openFaults}
                      </div>
                    </div>
                    <div className="flex-1 raised p-1 text-center">
                      <div className="label-xs" style={{ fontSize: 8 }}>HOURS</div>
                      <div className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        {ac.engineHours.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Scatter Plot */}
        <div className="panel p-3 flex flex-col" style={{ width: 320, flexShrink: 0 }}>
          <div className="label-xs mb-1" style={{ color: "var(--text-primary)", fontSize: 10 }}>
            FLEET WEAR CORRELATION (ENGINE HOURS vs EHI)
          </div>
          <div style={{ flex: 1, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
                <XAxis type="number" dataKey="x" name="Hours" unit="h" tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "IBM Plex Mono" }} domain={[600, 3500]} />
                <YAxis type="number" dataKey="y" name="EHI" domain={[40, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload || !payload[0]) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", padding: "6px 8px", fontSize: 10, fontFamily: "IBM Plex Mono" }}>
                        <div style={{ color: "var(--state-advisory)", fontWeight: "bold" }}>{d.tail}</div>
                        <div>Hours: {d.x}h</div>
                        <div>EHI: {d.y}</div>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={65} stroke="var(--state-critical)" strokeDasharray="3 3" label={{ value: "MIN OP EHI", fill: "var(--state-critical)", fontSize: 8 }} />
                <Scatter name="Fleet" data={scatterData} fill="var(--state-advisory)" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="label-xs text-center" style={{ fontSize: 9, color: "var(--text-muted)" }}>
            Click an airframe to monitor its live telemetry twin
          </div>
        </div>
      </div>
    </div>
  );
}
