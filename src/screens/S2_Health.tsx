import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import HealthRing from "../components/shared/HealthRing";
import { useTwin } from "../context/TwinContext";

const BASE_SUBSYSTEMS = [
  { id: "combustion", label: "COMBUSTION", baseIndex: 81, trend: -1.2, params: ["EGT Cyl3 +41°C", "Inj Qty +2mm³", "Misfire 0.3%"] },
  { id: "thermal", label: "THERMAL", baseIndex: 85, trend: -0.6, params: ["CHT Cyl3 +25°C", "Coolant +2°C", "EGT spread 48°C"] },
  { id: "lubrication", label: "LUBRICATION", baseIndex: 92, trend: -0.3, params: ["Oil P −0.3bar", "Oil T +5°C", "Level 82%"] },
  { id: "fuel", label: "FUEL", baseIndex: 94, trend: 0.1, params: ["Flow nominal", "Pressure OK", "Inj qty OK"] },
  { id: "mechanical", label: "MECHANICAL", baseIndex: 88, trend: -0.5, params: ["Vib +0.5mm/s", "Freq 147Hz", "Bearing OK"] },
  { id: "electrical", label: "ELECTRICAL", baseIndex: 96, trend: 0.0, params: ["Battery 27.8V", "Alt nominal", "No faults"] },
  { id: "sensors", label: "SENSOR INTEGRITY", baseIndex: 97, trend: 0.0, params: ["All sensors live", "No drift", "FADEC OK"] },
];

function cellColor(val: number, nominal: number, thresh: number) {
  const dev = Math.abs(val - nominal);
  const range = Math.abs(thresh - nominal);
  if (val >= thresh) return "#FF7A2F";
  if (dev > range * 0.6) return "#F5B335";
  return "transparent";
}

export default function S2_Health() {
  const { activeAirframe, telemetry, activeInjectedFaults } = useTwin();
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>("combustion");

  const hasCyl3Fault = activeInjectedFaults.includes("cyl3_injector");
  const hasOilFault = activeInjectedFaults.includes("oil_pressure_drop");
  const hasVibFault = activeInjectedFaults.includes("vibration_harmonic");

  const subsystems = BASE_SUBSYSTEMS.map((sub) => {
    let index = Math.min(100, Math.round((sub.baseIndex * activeAirframe.ehi) / 87.4));
    if (sub.id === "combustion" && hasCyl3Fault) index = Math.min(index, 72);
    if (sub.id === "lubrication" && hasOilFault) index = Math.min(index, 68);
    if (sub.id === "mechanical" && hasVibFault) index = Math.min(index, 74);

    const color = index > 90 ? "#00C08B" : index > 80 ? "#F5B335" : "#FF7A2F";
    return { ...sub, index, color };
  });

  const waterfallData = [
    { name: "PERFECT", value: 100, fill: "#243040" },
    { name: "COMBUSTION", value: hasCyl3Fault ? -12.4 : -8.3, fill: "#FF7A2F" },
    { name: "THERMAL", value: -2.1, fill: "#F5B335" },
    { name: "MECHANICAL", value: hasVibFault ? -4.5 : -1.4, fill: "#F5B335" },
    { name: "LUBRICATION", value: hasOilFault ? -6.2 : -0.8, fill: "#8CA0B8" },
    { name: "FUEL", value: 0, fill: "#243040" },
    { name: "ELECTRICAL", value: 0, fill: "#243040" },
    { name: "SENSORS", value: 0, fill: "#243040" },
    { name: "CURRENT EHI", value: activeAirframe.ehi, fill: "#3DA9FC" },
  ];

  const cylinderMatrix = [
    { param: "CHT (°C)", vals: telemetry.cht.map((v) => Math.round(v)), nominal: [190, 195, 190, 190], thresh: 215 },
    { param: "EGT (°C)", vals: telemetry.egt.map((v) => Math.round(v)), nominal: [645, 648, 648, 643], thresh: 675 },
    { param: "INJ QTY (mm³)", vals: [28, 28, hasCyl3Fault ? 31 : 28, 28], nominal: [28, 28, 28, 28], thresh: 30 },
    { param: "MISFIRES", vals: [0, 0, hasCyl3Fault ? 4 : 0, 0], nominal: [0, 0, 0, 0], thresh: 2 },
  ];

  return (
    <div className="flex gap-2 h-full overflow-hidden p-2">
      {/* Left: Subsystem health list */}
      <div className="flex flex-col gap-2" style={{ width: 300, flexShrink: 0, overflowY: "auto" }}>
        <div className="label-xs" style={{ color: "#E8EEF6", fontSize: 10 }}>
          SUBSYSTEM HEALTH INDICES · {activeAirframe.tail}
        </div>

        <div className="flex items-center gap-3 mb-1 panel p-2.5">
          <HealthRing value={activeAirframe.ehi} size={64} />
          <div>
            <div className="label-xs" style={{ fontSize: 10 }}>COMPOSITE EHI</div>
            <div
              className="font-mono"
              style={{
                fontSize: 20,
                color: activeAirframe.ehi > 80 ? "#00C08B" : activeAirframe.ehi > 65 ? "#F5B335" : "#FF3B4E",
                fontWeight: 600,
              }}
            >
              {activeAirframe.ehi} / 100
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: "#F5B335" }}>
              −0.8 pts/hr degradation
            </div>
          </div>
        </div>

        {subsystems.map((sub) => {
          const isSelected = selectedSubsystem === sub.id;
          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubsystem(sub.id)}
              className="panel p-2.5 cursor-pointer transition-all hover:border-[#3DA9FC]"
              style={{
                borderLeft: isSelected ? `3px solid ${sub.color}` : "1px solid #243040",
                background: isSelected ? "rgba(61,169,252,0.06)" : "#101620",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="label-xs" style={{ fontSize: 10, color: isSelected ? "#E8EEF6" : "#8CA0B8" }}>
                  {sub.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono" style={{ fontSize: 13, color: sub.color, fontWeight: 600 }}>
                    {sub.index}
                  </span>
                  <span className="font-mono" style={{ fontSize: 10, color: sub.trend < 0 ? "#F5B335" : "#00C08B" }}>
                    {sub.trend > 0 ? "+" : ""}{sub.trend}/hr
                  </span>
                </div>
              </div>
              <div style={{ height: 6, background: "#18202C", borderRadius: 3, marginBottom: 4, overflow: "hidden" }}>
                <div style={{ width: `${sub.index}%`, height: "100%", background: sub.color, borderRadius: 3, transition: "width 0.3s" }} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {sub.params.map((p) => (
                  <span key={p} style={{ fontSize: 10, color: "#546678" }}>
                    · {p}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Center: EHI Waterfall + Cylinder Matrix */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* EHI Waterfall */}
        <div className="panel p-3" style={{ height: "46%" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="label-xs" style={{ color: "#E8EEF6", fontSize: 11 }}>
              EHI WATERFALL — CONTRIBUTION TO DEGRADATION FROM 100
            </span>
            <span className="label-xs" style={{ fontSize: 9, color: "#8CA0B8" }}>
              ACTIVE AIRFRAME: {activeAirframe.tail}
            </span>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={waterfallData} margin={{ top: 8, right: 8, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#243040" />
              <XAxis dataKey="name" tick={{ fill: "#546678", fontSize: 9, fontFamily: "IBM Plex Mono" }} angle={-25} textAnchor="end" />
              <YAxis domain={[-15, 105]} tick={{ fill: "#546678", fontSize: 10, fontFamily: "IBM Plex Mono" }} />
              <Tooltip
                contentStyle={{ background: "#18202C", border: "1px solid #243040", fontSize: 11, fontFamily: "IBM Plex Mono" }}
                cursor={{ fill: "rgba(61,169,252,0.05)" }}
              />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {waterfallData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cylinder Matrix */}
        <div className="panel p-3 flex-1 flex flex-col justify-between">
          <div className="label-xs mb-2" style={{ color: "#E8EEF6", fontSize: 11 }}>
            LIVE PER-CYLINDER COMPARISON MATRIX
          </div>
          <div className="overflow-auto">
            <table className="data-table" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ background: "#18202C", color: "#8CA0B8", fontSize: 10, padding: "6px 12px", textAlign: "left", border: "1px solid #243040" }}>
                    PARAMETER
                  </th>
                  {[1, 2, 3, 4].map((c) => (
                    <th key={c} style={{ background: "#18202C", color: "#8CA0B8", fontSize: 10, padding: "6px 16px", textAlign: "center", border: "1px solid #243040" }}>
                      CYL {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cylinderMatrix.map((row) => (
                  <tr key={row.param}>
                    <td style={{ color: "#8CA0B8", fontSize: 11, padding: "6px 12px", border: "1px solid #1a2233", fontFamily: "Inter" }}>
                      {row.param}
                    </td>
                    {row.vals.map((val, ci) => {
                      const bg = cellColor(val, row.nominal[ci], row.thresh);
                      return (
                        <td
                          key={ci}
                          style={{
                            fontFamily: "IBM Plex Mono",
                            fontSize: 13,
                            fontWeight: 600,
                            textAlign: "center",
                            padding: "6px 16px",
                            background: bg,
                            color: bg !== "transparent" ? (bg === "#FF7A2F" ? "#FF7A2F" : "#F5B335") : "#E8EEF6",
                            border: "1px solid #1a2233",
                          }}
                        >
                          {val}
                          {bg !== "transparent" && ci === 2 && (
                            <span style={{ marginLeft: 4, fontSize: 9 }}>▲</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="label-xs" style={{ fontSize: 9 }}>LEGEND:</span>
            <div className="flex items-center gap-1">
              <div style={{ width: 10, height: 10, background: "#FF7A2F", borderRadius: 2 }} />
              <span className="label-xs" style={{ fontSize: 9, color: "#FF7A2F" }}>ABOVE THRESHOLD</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: 10, height: 10, background: "#F5B335", borderRadius: 2 }} />
              <span className="label-xs" style={{ fontSize: 9, color: "#F5B335" }}>DEVIATION &gt;60%</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: 10, height: 10, background: "transparent", border: "1px solid #243040", borderRadius: 2 }} />
              <span className="label-xs" style={{ fontSize: 9 }}>NOMINAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: 30-day trends */}
      <div className="flex flex-col gap-2" style={{ width: 200, flexShrink: 0, overflowY: "auto" }}>
        <div className="label-xs" style={{ color: "#E8EEF6", fontSize: 10 }}>30-DAY TREND SPARKLINES</div>
        {subsystems.map((sub) => {
          const trend = Array.from({ length: 30 }, (_, i) => {
            const val = sub.index + (i - 29) * Math.abs(sub.trend) / 3 + (Math.random() - 0.5) * 3;
            return Math.max(50, Math.min(100, val));
          });
          const min = Math.min(...trend), max = Math.max(...trend) || 1;
          const path = trend.map((v, i) => {
            const x = (i / 29) * 160;
            const y = 28 - ((v - min) / (max - min || 1)) * 24;
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          }).join(" ");

          return (
            <div key={sub.id} className="panel p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="label-xs" style={{ fontSize: 9, color: "#8CA0B8" }}>{sub.label}</span>
                <span className="font-mono font-semibold" style={{ fontSize: 11, color: sub.color }}>{sub.index}</span>
              </div>
              <svg width={160} height={30}>
                <path d={path} stroke={sub.color} strokeWidth={1.5} fill="none" opacity={0.85} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}
