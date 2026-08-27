import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import TelemetryTile from "../components/shared/TelemetryTile";
import HealthRing from "../components/shared/HealthRing";
import ConfidenceBar from "../components/shared/ConfidenceBar";
import { useTwin } from "../context/TwinContext";
import { generateSparkline } from "../data/mockData";

function EngineSchematic({
  cht,
  egt,
  selectedCyl,
  onSelectCyl,
}: {
  cht: [number, number, number, number];
  egt: [number, number, number, number];
  selectedCyl: number;
  onSelectCyl: (cyl: number) => void;
}) {
  const cylState = cht.map((c, i) => {
    const deviation = c - 197;
    if (deviation > 20 || egt[i] - 648 > 30) return "var(--state-warning)";
    if (deviation > 10) return "var(--state-caution)";
    return "rgba(0,192,139,0.35)";
  });

  return (
    <svg viewBox="0 0 320 220" style={{ width: "100%", maxHeight: 220, display: "block" }}>
      {/* Background */}
      <rect width="320" height="220" fill="var(--bg-panel)" rx="4" />

      {/* Crankshaft */}
      <rect x="10" y="170" width="300" height="8" fill="var(--bg-raised)" rx="2" stroke="var(--stroke-hairline)" strokeWidth="1" />
      <text x="160" y="178" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="Inter">
        CRANKSHAFT
      </text>

      {/* Connecting rods */}
      {[0, 1, 2, 3].map((i) => {
        const cx = 46 + i * 58;
        return (
          <g key={i}>
            <line x1={cx + 4} y1="150" x2={cx + 4} y2="170" stroke="var(--stroke-hairline)" strokeWidth="4" strokeLinecap="round" />
            <circle cx={cx + 4} cy="170" r="4" fill="var(--bg-raised)" stroke="var(--stroke-hairline)" strokeWidth="1" />
          </g>
        );
      })}

      {/* 4 Cylinders (Clickable to isolate) */}
      {[0, 1, 2, 3].map((i) => {
        const cx = 22 + i * 58;
        const isHot = cht[i] > 215 || egt[i] > 675;
        const isSelected = selectedCyl === i + 1;

        return (
          <g
            key={i}
            onClick={() => onSelectCyl(i + 1)}
            style={{ cursor: "pointer" }}
            className="group"
          >
            {/* Selection outline */}
            {isSelected && (
              <rect
                x={cx - 4}
                y="74"
                width="44"
                height="80"
                fill="none"
                stroke="var(--state-advisory)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                rx="4"
              />
            )}

            {/* Cylinder block */}
            <rect
              x={cx}
              y="90"
              width="36"
              height="60"
              fill={cylState[i]}
              stroke={isSelected ? "var(--state-advisory)" : "var(--stroke-hairline)"}
              strokeWidth="1"
              rx="2"
            />
            {/* Piston */}
            <rect x={cx + 5} y="120" width="26" height="18" fill="var(--bg-raised)" stroke="var(--stroke-hairline)" strokeWidth="1" rx="1" />
            {/* Cylinder head */}
            <rect x={cx - 2} y="78" width="40" height="14" fill="var(--bg-raised)" stroke="var(--stroke-hairline)" strokeWidth="1" rx="2" />
            {/* Combustion chamber */}
            <rect
              x={cx + 5}
              y="90"
              width="26"
              height="14"
              fill={isHot ? "rgba(255,122,47,0.4)" : "rgba(0,192,139,0.15)"}
            />
            {/* Valves */}
            <line x1={cx + 12} y1="78" x2={cx + 12} y2="92" stroke="var(--state-advisory)" strokeWidth="2" />
            <line x1={cx + 24} y1="78" x2={cx + 24} y2="92" stroke={isHot ? "var(--state-warning)" : "var(--state-caution)"} strokeWidth="2" />

            {/* CHT readout */}
            <text
              x={cx + 18}
              y="68"
              textAnchor="middle"
              fill={isHot ? "var(--state-warning)" : isSelected ? "var(--state-advisory)" : "var(--text-primary)"}
              fontSize="9"
              fontFamily="IBM Plex Mono"
              fontWeight="600"
            >
              {Math.round(cht[i])}°C
            </text>

            {/* Cylinder number */}
            <text
              x={cx + 18}
              y="115"
              textAnchor="middle"
              fill={isSelected ? "var(--state-advisory)" : "var(--text-secondary)"}
              fontSize="8"
              fontFamily="Inter"
              fontWeight="600"
            >
              CYL{i + 1}
            </text>

            {/* Alert indicator */}
            {isHot && (
              <circle cx={cx + 36} cy="80" r="4" fill="var(--state-warning)">
                <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Intake manifold */}
      <path d="M22,78 Q160,50 298,78" fill="none" stroke="var(--state-advisory)" strokeWidth="2" opacity="0.5" />
      <text x="160" y="46" textAnchor="middle" fill="var(--state-advisory)" fontSize="8" fontFamily="Inter" opacity="0.8">
        COMMON RAIL INJECTION SYSTEM (CLICK CYLINDER TO ISOLATE)
      </text>

      {/* Fluid system readouts */}
      <rect x="10" y="188" width="80" height="14" fill="var(--bg-raised)" stroke="var(--stroke-hairline)" strokeWidth="1" rx="2" />
      <text x="50" y="198" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="Inter">
        OIL 4.8 bar
      </text>

      <rect x="230" y="188" width="80" height="14" fill="var(--bg-raised)" stroke="var(--stroke-hairline)" strokeWidth="1" rx="2" />
      <text x="270" y="198" textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="Inter">
        FUEL 4.2 bar
      </text>

      {/* Header labels */}
      <text x="10" y="14" fill="var(--text-secondary)" fontSize="9" fontFamily="Barlow Semi Condensed" fontWeight="600">
        DRDO-AD180 · 4-CYLINDER AERO-DIESEL
      </text>
      <text x="310" y="14" textAnchor="end" fill="var(--text-muted)" fontSize="8" fontFamily="IBM Plex Mono">
        ISOLATION: CYL {selectedCyl}
      </text>
    </svg>
  );
}

function TwinSyncBar({ ehi }: { ehi: number }) {
  return (
    <div className="panel p-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="twin-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--twin-predicted)" }} />
        <span className="label-xs">TWIN SYNC</span>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col">
          <span className="label-xs" style={{ fontSize: 9 }}>LATENCY</span>
          <span className="font-mono" style={{ fontSize: 13, color: "var(--twin-predicted)" }}>142 ms</span>
        </div>
        <div style={{ width: 1, background: "var(--stroke-hairline)" }} />
        <div className="flex flex-col">
          <span className="label-xs" style={{ fontSize: 9 }}>MODEL CONF</span>
          <span className="font-mono" style={{ fontSize: 13, color: "var(--twin-predicted)" }}>91%</span>
        </div>
        <div style={{ width: 1, background: "var(--stroke-hairline)" }} />
        <div className="flex flex-col">
          <span className="label-xs" style={{ fontSize: 9 }}>INGEST RATE</span>
          <span className="font-mono" style={{ fontSize: 13, color: "var(--text-secondary)" }}>20 Hz</span>
        </div>
        <div style={{ width: 1, background: "var(--stroke-hairline)" }} />
        <div className="flex flex-col">
          <span className="label-xs" style={{ fontSize: 9 }}>HEALTH</span>
          <span className="font-mono" style={{ fontSize: 13, color: ehi > 80 ? "var(--state-nominal)" : "var(--state-caution)" }}>
            EHI {ehi}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function S1_LiveTwin() {
  const { telemetry, twinPredicted, chartHistory, activeAirframe, navigateToScreen } = useTwin();
  const [selectedCyl, setSelectedCyl] = useState<number>(3);

  const sparkRpm = generateSparkline(telemetry.rpm, 20, 0.01);
  const sparkCht = generateSparkline(telemetry.cht[selectedCyl - 1], 20, 0.02);
  const sparkEgt = generateSparkline(telemetry.egt[selectedCyl - 1], 20, 0.02);
  const sparkOil = generateSparkline(telemetry.oilPressure, 20, 0.02);
  const sparkFuel = generateSparkline(telemetry.fuelFlow, 20, 0.02);
  const sparkVib = generateSparkline(telemetry.vibrationRMS, 20, 0.04);
  const sparkBat = generateSparkline(telemetry.batteryV, 20, 0.005);

  const egtDelta = Math.round(telemetry.egt[selectedCyl - 1] - twinPredicted.egt[selectedCyl - 1]);
  const chtDelta = Math.round(telemetry.cht[selectedCyl - 1] - twinPredicted.cht[selectedCyl - 1]);

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* LEFT — Physical Telemetry Column */}
      <div className="flex flex-col gap-1.5 overflow-y-auto scrollable" style={{ width: 220, flexShrink: 0 }}>
        <div className="label-xs px-1" style={{ color: "var(--text-primary)", fontSize: 10, letterSpacing: "0.1em" }}>
          PHYSICAL TELEMETRY · 20 HZ
        </div>

        {/* Rotational */}
        <div className="label-xs" style={{ fontSize: 9 }}>ROTATIONAL</div>
        <TelemetryTile label="ENGINE RPM" value={Math.round(telemetry.rpm)} unit="RPM" sparkline={sparkRpm} rangeMin={2200} rangeMax={2700} sensorId="RPM-01" />
        <TelemetryTile label="TORQUE" value={Math.round(telemetry.torque)} unit="Nm" rangeMin={400} rangeMax={550} />
        <TelemetryTile label="SHAFT POWER" value={Math.round(telemetry.power)} unit="kW" rangeMin={100} rangeMax={160} />
        <TelemetryTile label="THROTTLE" value={Math.round(telemetry.throttle)} unit="%" rangeMin={60} rangeMax={100} />

        {/* Thermal */}
        <div className="label-xs mt-1" style={{ fontSize: 9 }}>THERMAL (ISOLATED: CYL {selectedCyl})</div>
        <TelemetryTile
          label={`CHT CYL ${selectedCyl}`}
          value={Math.round(telemetry.cht[selectedCyl - 1])}
          unit="°C"
          sparkline={sparkCht}
          rangeMin={170}
          rangeMax={230}
          state={telemetry.cht[selectedCyl - 1] > 215 ? "warning" : telemetry.cht[selectedCyl - 1] > 207 ? "caution" : "nominal"}
          predicted={twinPredicted.cht[selectedCyl - 1]}
          sensorId={`CHT-0${selectedCyl}`}
        />
        <TelemetryTile
          label={`EGT CYL ${selectedCyl}`}
          value={Math.round(telemetry.egt[selectedCyl - 1])}
          unit="°C"
          sparkline={sparkEgt}
          rangeMin={600}
          rangeMax={720}
          state={telemetry.egt[selectedCyl - 1] > 675 ? "warning" : telemetry.egt[selectedCyl - 1] > 660 ? "caution" : "nominal"}
          predicted={twinPredicted.egt[selectedCyl - 1]}
          sensorId={`EGT-0${selectedCyl}`}
        />
        <TelemetryTile label="COOLANT TEMP" value={Math.round(telemetry.coolantTemp)} unit="°C" rangeMin={80} rangeMax={110} />

        {/* Fluid */}
        <div className="label-xs mt-1" style={{ fontSize: 9 }}>FLUID & LUBRICATION</div>
        <TelemetryTile label="OIL PRESSURE" value={telemetry.oilPressure.toFixed(1)} unit="bar" sparkline={sparkOil} rangeMin={3} rangeMax={7} state={telemetry.oilPressure < 4.0 ? "warning" : "nominal"} predicted={twinPredicted.oilPressure} sensorId="OIL-P" />
        <TelemetryTile label="OIL TEMP" value={Math.round(telemetry.oilTemp)} unit="°C" rangeMin={80} rangeMax={130} sensorId="OIL-T" />
        <TelemetryTile label="FUEL FLOW" value={telemetry.fuelFlow.toFixed(1)} unit="L/h" sparkline={sparkFuel} rangeMin={20} rangeMax={50} sensorId="FUEL-F" />

        {/* Mechanical & Electrical */}
        <div className="label-xs mt-1" style={{ fontSize: 9 }}>DYNAMICS & POWER</div>
        <TelemetryTile label="VIBRATION RMS" value={telemetry.vibrationRMS.toFixed(1)} unit="mm/s" sparkline={sparkVib} rangeMin={0} rangeMax={5} state={telemetry.vibrationRMS > 3.5 ? "caution" : "nominal"} predicted={twinPredicted.vibrationRMS} />
        <TelemetryTile label="BATTERY VOLT" value={telemetry.batteryV.toFixed(1)} unit="V" sparkline={sparkBat} rangeMin={24} rangeMax={30} sensorId="BAT-V" />
      </div>

      {/* CENTER — The Digital Twin & Interactive SVG */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10, letterSpacing: "0.1em" }}>
            DIGITAL TWIN RESIDUAL MODEL · AIRFRAME {activeAirframe.tail}
          </span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCyl(c)}
                className="font-mono text-xs px-2 py-0.5 rounded cursor-pointer transition-colors"
                style={{
                  background: selectedCyl === c ? "var(--table-selected)" : "var(--bg-raised)",
                  color: selectedCyl === c ? "var(--state-advisory)" : "var(--text-secondary)",
                  border: `1px solid ${selectedCyl === c ? "var(--state-advisory)" : "var(--stroke-hairline)"}`,
                }}
              >
                CYL {c}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Engine Schematic */}
        <div className="panel p-2" style={{ flexShrink: 0 }}>
          <EngineSchematic
            cht={telemetry.cht}
            egt={telemetry.egt}
            selectedCyl={selectedCyl}
            onSelectCyl={setSelectedCyl}
          />
        </div>

        {/* Measured vs Predicted Chart */}
        <div className="panel p-3 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>
                MEASURED vs TWIN-PREDICTED · CYL {selectedCyl}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div style={{ width: 14, height: 2, background: "var(--state-warning)" }} />
                  <span className="label-xs" style={{ fontSize: 9 }}>MEASURED</span>
                </div>
                <div className="flex items-center gap-1">
                  <div style={{ width: 14, height: 1, background: "var(--twin-predicted)", borderTop: "1px dashed var(--twin-predicted)" }} />
                  <span className="label-xs" style={{ fontSize: 9 }}>TWIN PREDICTED</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-xs" style={{ fontSize: 9 }}>EGT RESIDUAL</span>
              <span
                className="font-mono"
                style={{
                  fontSize: 13,
                  color: egtDelta > 30 ? "var(--state-warning)" : egtDelta > 15 ? "var(--state-caution)" : "var(--state-nominal)",
                  fontWeight: 600,
                }}
              >
                {egtDelta > 0 ? `+${egtDelta}°C` : `${egtDelta}°C`} ({chtDelta > 0 ? `+${chtDelta}°C CHT` : `${chtDelta}°C CHT`})
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--stroke-hairline)" />
                <XAxis dataKey="t" hide />
                <YAxis domain={[620, 720]} tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                  labelStyle={{ color: "var(--text-muted)" }}
                  itemStyle={{ color: "var(--text-primary)" }}
                />
                <Area
                  type="monotone"
                  dataKey="egt3Pred"
                  stroke="var(--twin-predicted)"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  fill="rgba(123,97,255,0.12)"
                  name="Twin Model"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="egt3"
                  stroke="var(--state-warning)"
                  strokeWidth={2}
                  dot={false}
                  name={`Measured CYL ${selectedCyl}`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Twin Sync Bar */}
        <TwinSyncBar ehi={activeAirframe.ehi} />
      </div>

      {/* RIGHT — Intelligence & Diagnostic Panel */}
      <div className="flex flex-col gap-2 overflow-y-auto scrollable" style={{ width: 230, flexShrink: 0 }}>
        <div className="label-xs" style={{ color: "var(--twin-predicted)", fontSize: 10, letterSpacing: "0.1em" }}>
          INFERRED AI INTELLIGENCE
        </div>

        {/* ENGINE HEALTH INDEX */}
        <div className="inferred-card">
          <div className="flex items-center justify-between mb-2">
            <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>ENGINE HEALTH INDEX</span>
            <span className="label-xs" style={{ fontSize: 9, background: "rgba(123,97,255,0.15)", color: "var(--twin-predicted)", padding: "1px 4px", borderRadius: 3 }}>
              LIVE EHI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <HealthRing value={activeAirframe.ehi} size={110} />
            <div className="flex flex-col gap-1">
              <div>
                <div className="label-xs" style={{ fontSize: 9 }}>STATUS</div>
                <span
                  className="font-mono font-bold"
                  style={{
                    fontSize: 13,
                    color: activeAirframe.ehi > 80 ? "var(--state-nominal)" : activeAirframe.ehi > 65 ? "var(--state-caution)" : "var(--state-critical)",
                  }}
                >
                  {activeAirframe.ehi > 80 ? "NOMINAL" : activeAirframe.ehi > 65 ? "DEGRADED" : "CRITICAL"}
                </span>
              </div>
              <div>
                <div className="label-xs" style={{ fontSize: 9 }}>CONFIDENCE</div>
                <ConfidenceBar value={91} />
              </div>
            </div>
          </div>
        </div>

        {/* ANOMALY SCORE */}
        <div className="inferred-card">
          <div className="flex items-center justify-between mb-1.5">
            <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>ANOMALY DETECTOR</span>
            <span className="label-xs" style={{ fontSize: 9, background: "rgba(123,97,255,0.15)", color: "var(--twin-predicted)", padding: "1px 4px", borderRadius: 3 }}>
              LSTM
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-mono" style={{ fontSize: 24, color: "var(--state-caution)", fontWeight: 600 }}>
              0.34
            </span>
            <span className="label-xs">/ 1.00 THRESH: 0.45</span>
          </div>
          <div className="relative">
            <div style={{ height: 6, background: "var(--bg-raised)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: "34%", height: "100%", background: "linear-gradient(90deg,var(--state-nominal),var(--state-caution))", borderRadius: 3 }} />
            </div>
            <div style={{ position: "absolute", left: "45%", top: -2, width: 2, height: 10, background: "var(--state-warning)" }} />
          </div>
          <div className="mt-2">
            <button
              onClick={() => navigateToScreen("faults")}
              className="w-full font-mono text-xs py-1 rounded cursor-pointer hover:bg-white/10"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--state-advisory)40", color: "var(--state-advisory)" }}
            >
              OPEN FAULT CENTRE →
            </button>
          </div>
        </div>

        {/* RUL Card */}
        <div className="inferred-card">
          <div className="flex items-center justify-between mb-2">
            <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 11 }}>REMAINING USEFUL LIFE</span>
            <span className="label-xs" style={{ fontSize: 9, color: "var(--twin-predicted)" }}>PROGNOSTICS</span>
          </div>
          <div className="flex gap-4 mb-2">
            <div>
              <div className="label-xs" style={{ fontSize: 9 }}>HOURS</div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono" style={{ fontSize: 22, color: "var(--text-primary)", fontWeight: 600 }}>
                  {activeAirframe.rul}
                </span>
                <span className="label-xs">h</span>
              </div>
            </div>
            <div>
              <div className="label-xs" style={{ fontSize: 9 }}>OPEN FAULTS</div>
              <div className="flex items-baseline gap-1">
                <span
                  className="font-mono"
                  style={{
                    fontSize: 22,
                    color: activeAirframe.openFaults > 3 ? "var(--state-critical)" : "var(--state-warning)",
                    fontWeight: 600,
                  }}
                >
                  {activeAirframe.openFaults}
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-1.5 p-1.5 rounded cursor-pointer hover:bg-white/5"
            style={{ background: "rgba(0,192,139,0.1)", border: "1px solid rgba(0,192,139,0.3)" }}
            onClick={() => navigateToScreen("prognostics")}
          >
            <span style={{ color: "var(--state-nominal)", fontSize: 12 }}>✓</span>
            <span className="font-display font-semibold" style={{ fontSize: 11, color: "var(--state-nominal)" }}>
              RUL SUFFICIENT FOR MISSION
            </span>
          </div>
        </div>

        {/* Environment context */}
        <div className="raised p-2">
          <div className="label-xs mb-1" style={{ fontSize: 9, fontStyle: "italic" }}>
            ATMOSPHERIC CONTEXT
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { l: "ALT", v: "5,180 m" },
              { l: "OAT", v: "−8°C" },
              { l: "P_AMB", v: "540 hPa" },
              { l: "HUM", v: "38%" },
              { l: "IAS", v: "142 kt" },
            ].map((e) => (
              <div key={e.l} className="flex flex-col">
                <span className="label-xs" style={{ fontSize: 8 }}>{e.l}</span>
                <span className="font-mono" style={{ fontSize: 10, color: "var(--text-secondary)" }}>{e.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
