import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTwin } from "../context/TwinContext";

interface SimParams {
  altitude: number;
  oat: number;
  humidity: number;
  throttle: number;
  payload: number;
  duration: number;
}

const PRESETS: { label: string; params: SimParams }[] = [
  { label: "HIGH ALTITUDE ISR", params: { altitude: 7200, oat: -18, humidity: 20, throttle: 92, payload: 320, duration: 18 } },
  { label: "ENDURANCE 24H", params: { altitude: 4500, oat: -5, humidity: 45, throttle: 72, payload: 280, duration: 24 } },
  { label: "HOT & HIGH DESERT", params: { altitude: 5500, oat: 12, humidity: 65, throttle: 95, payload: 350, duration: 12 } },
  { label: "RAPID INTERCEPT DASH", params: { altitude: 3000, oat: 15, humidity: 55, throttle: 100, payload: 300, duration: 6 } },
];

function computeSim(p: SimParams) {
  const altFactor = 1 + (p.altitude - 5000) / 15000;
  const oatFactor = 1 + (p.oat + 8) / 200;
  const throttleFactor = p.throttle / 88;
  const baseCHT = 197 * altFactor * oatFactor * throttleFactor;
  const baseEGT = 648 * altFactor * oatFactor * throttleFactor;
  const fuelFlow = 31.4 * throttleFactor * (1 + (p.altitude > 6000 ? 0.05 : 0));
  const ehiEnd = Math.max(40, 87.4 - p.duration * 0.9 * throttleFactor * altFactor);
  const rulConsumed = p.duration * 1.1 * throttleFactor;
  const chtExceed = baseCHT > 225;
  const feasible = !chtExceed && ehiEnd > 65;

  const curve = Array.from({ length: 30 }, (_, i) => {
    const t = (i / 29) * p.duration;
    const drift = i * 0.3 * throttleFactor * altFactor;
    return {
      t: t.toFixed(1),
      cht: Math.round(baseCHT + drift + (Math.random() - 0.5) * 3),
      egt: Math.round(baseEGT + drift * 1.4 + (Math.random() - 0.5) * 5),
      chtBaseline: Math.round(197 + drift * 0.6),
      egtBaseline: Math.round(648 + drift * 0.9),
    };
  });

  return { baseCHT, baseEGT, fuelFlow, ehiEnd, rulConsumed, chtExceed, feasible, curve };
}

export default function S5_Simulation() {
  const { showToast, navigateToScreen } = useTwin();
  const [params, setParams] = useState<SimParams>({
    altitude: 5180,
    oat: -8,
    humidity: 38,
    throttle: 88,
    payload: 310,
    duration: 12,
  });
  const [sim, setSim] = useState(() => computeSim(params));

  useEffect(() => {
    const t = setTimeout(() => setSim(computeSim(params)), 100);
    return () => clearTimeout(t);
  }, [params]);

  const sliders: { key: keyof SimParams; label: string; min: number; max: number; unit: string }[] = [
    { key: "altitude", label: "ALTITUDE", min: 0, max: 7500, unit: "m" },
    { key: "oat", label: "OUTSIDE AIR TEMP (OAT)", min: -20, max: 50, unit: "°C" },
    { key: "humidity", label: "RELATIVE HUMIDITY", min: 0, max: 100, unit: "%" },
    { key: "throttle", label: "THROTTLE SETTING", min: 30, max: 100, unit: "%" },
    { key: "payload", label: "PAYLOAD MASS", min: 100, max: 450, unit: "kg" },
    { key: "duration", label: "SORTIE DURATION", min: 1, max: 30, unit: "h" },
  ];

  const applySimulationToLive = () => {
    showToast(`⚡ APPLIED SIMULATION: Altitude ${params.altitude}m · Throttle ${params.throttle}%`);
    navigateToScreen("live-twin");
  };

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* Left: Parameter Console */}
      <div className="flex flex-col gap-2" style={{ width: 290, flexShrink: 0 }}>
        <div className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
          WHAT-IF SIMULATION CONSOLE
        </div>

        {/* Presets */}
        <div className="flex flex-col gap-1">
          <div className="label-xs" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
            MISSION PROFILE PRESETS
          </div>
          <div className="grid grid-cols-2 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setParams(p.params)}
                className="font-display font-semibold px-2 py-1.5 rounded text-left hover:border-[var(--state-advisory)] transition-colors"
                style={{
                  fontSize: 10,
                  background: "var(--bg-raised)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--stroke-hairline)",
                  cursor: "pointer",
                  letterSpacing: "0.03em",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="panel p-3 flex flex-col gap-3 flex-1 overflow-y-auto">
          {sliders.map((s) => (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="label-xs" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {s.label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold" style={{ fontSize: 14, color: "var(--state-advisory)" }}>
                    {params[s.key]}
                  </span>
                  <span className="label-xs" style={{ fontSize: 10 }}>{s.unit}</span>
                </div>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                value={params[s.key]}
                onChange={(e) => setParams((prev) => ({ ...prev, [s.key]: parseFloat(e.target.value) }))}
                style={{
                  width: "100%",
                  accentColor: "var(--state-advisory)",
                  height: 4,
                  background: "var(--bg-raised)",
                  cursor: "pointer",
                }}
              />
              <div className="flex justify-between">
                <span className="label-xs" style={{ fontSize: 8, color: "var(--text-muted)" }}>{s.min} {s.unit}</span>
                <span className="label-xs" style={{ fontSize: 8, color: "var(--text-muted)" }}>{s.max} {s.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={applySimulationToLive}
          className="font-display font-bold py-2 rounded text-xs cursor-pointer"
          style={{ background: "var(--state-advisory)", color: "var(--bg-base)", letterSpacing: "0.05em" }}
        >
          APPLY PROFILE TO MISSION ENGINE →
        </button>
      </div>

      {/* Right: Predicted Response */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Verdict Banner */}
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded"
          style={{
            background: sim.feasible ? "rgba(0,192,139,0.12)" : "rgba(255,59,78,0.15)",
            border: `1px solid ${sim.feasible ? "rgba(0,192,139,0.5)" : "rgba(255,59,78,0.5)"}`,
          }}
        >
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 22, color: sim.feasible ? "var(--state-nominal)" : "var(--state-critical)" }}>
              {sim.feasible ? "✓" : "⬟"}
            </span>
            <div>
              <div className="font-display font-bold" style={{ fontSize: 16, color: sim.feasible ? "var(--state-nominal)" : "var(--state-critical)", letterSpacing: "0.05em" }}>
                {sim.feasible ? "MISSION FEASIBLE · ALL OPERATIONAL ENVELOPES RESPECTED" : "MISSION HIGH RISK · THERMAL LIMIT BREACH PREDICTED"}
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: sim.feasible ? "var(--text-secondary)" : "var(--state-warning)" }}>
                Predicted Peak CHT: {Math.round(sim.baseCHT)}°C (Limit: 225°C) · End EHI: {sim.ehiEnd.toFixed(1)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="label-xs" style={{ fontSize: 9 }}>DIGITAL TWIN CONFIDENCE</div>
            <div className="font-mono font-bold" style={{ fontSize: 15, color: "var(--twin-predicted)" }}>94.2%</div>
          </div>
        </div>

        {/* Predicted curves */}
        <div className="panel p-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>
              PREDICTED CHT & EGT PROFILE OVER {params.duration} HOURS
            </span>
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <div style={{ width: 12, height: 2, background: "var(--state-warning)" }} />
                <span className="label-xs" style={{ fontSize: 9 }}>SIMULATED CHT</span>
              </div>
              <div className="flex items-center gap-1">
                <div style={{ width: 12, height: 1, background: "var(--state-warning)", borderTop: "1px dashed var(--state-warning)" }} />
                <span className="label-xs" style={{ fontSize: 9 }}>BASELINE CHT</span>
              </div>
              <div className="flex items-center gap-1">
                <div style={{ width: 12, height: 2, background: "var(--state-advisory)" }} />
                <span className="label-xs" style={{ fontSize: 9 }}>SIMULATED EGT</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sim.curve} margin={{ top: 8, right: 20, left: -10, bottom: 4 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
                <XAxis dataKey="t" tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "IBM Plex Mono" }}
                  label={{ value: "Mission Hours (h)", position: "insideBottom", offset: -2, fill: "var(--text-muted)", fontSize: 10 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <ReferenceLine y={225} stroke="var(--state-critical)" strokeDasharray="4 2" label={{ value: "CHT CEILING", fill: "var(--state-critical)", fontSize: 9 }} />
                <ReferenceLine y={690} stroke="var(--state-critical)" strokeDasharray="4 2" label={{ value: "EGT CEILING", fill: "var(--state-critical)", fontSize: 9 }} />
                <Line type="monotone" dataKey="chtBaseline" stroke="var(--state-warning)" strokeWidth={1} strokeDasharray="4 2" dot={false} name="CHT Baseline" />
                <Line type="monotone" dataKey="cht" stroke="var(--state-warning)" strokeWidth={2} dot={false} name="CHT Simulated" />
                <Line type="monotone" dataKey="egt" stroke="var(--state-advisory)" strokeWidth={2} dot={false} name="EGT Simulated" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="flex gap-2">
          {[
            { label: "TOTAL FUEL BURN", val: `${(sim.fuelFlow * params.duration).toFixed(0)} L`, sub: `${sim.fuelFlow.toFixed(1)} L/h avg`, color: "var(--text-secondary)" },
            { label: "PEAK CHT", val: `${Math.round(sim.baseCHT)}°C`, sub: sim.chtExceed ? "EXCEEDS ENVELOPE" : "Within limits", color: sim.chtExceed ? "var(--state-critical)" : "var(--state-nominal)" },
            { label: "END SORTIE EHI", val: sim.ehiEnd.toFixed(1), sub: `Delta: −${(87.4 - sim.ehiEnd).toFixed(1)} pts`, color: sim.ehiEnd > 75 ? "var(--state-caution)" : "var(--state-warning)" },
            { label: "RUL CONSUMPTION", val: `${sim.rulConsumed.toFixed(0)} h`, sub: `For ${params.duration}h sortie`, color: "var(--text-secondary)" },
          ].map((m) => (
            <div key={m.label} className="panel p-2.5 flex-1">
              <div className="label-xs" style={{ fontSize: 9 }}>{m.label}</div>
              <div className="font-mono font-bold" style={{ fontSize: 16, color: m.color }}>{m.val}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
