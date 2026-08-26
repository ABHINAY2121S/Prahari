import React, { useState } from "react";
import { useTwin } from "../context/TwinContext";

export default function S10_Report() {
  const { activeAirframe, faults, showToast } = useTwin();
  const [pushed, setPushed] = useState(false);
  const [signedOff, setSignedOff] = useState(false);
  const [officerNotes, setOfficerNotes] = useState(
    "Sustained CHT and EGT deviation on Cylinder 3 observed during phase 6. Random Forest classifier identified partial fuel injector clogging. Work order M-047 issued for ground crew before next sortie clearance."
  );

  const handlePrint = () => {
    window.print();
  };

  const handlePushToFleet = () => {
    setPushed(true);
    showToast(`✓ REPORT ISR-2026-0418 COMMITTED TO DRDO FLEET DATABASE (${activeAirframe.tail})`);
  };

  const PHASE_TABLE = [
    { phase: "TAXI / TAKEOFF", duration: "12 min", avgRPM: 2250, avgCHT: 178, peakCHT: 192, ehiDelta: -0.2, events: 0 },
    { phase: "CLIMB", duration: "42 min", avgRPM: 2680, avgCHT: 201, peakCHT: 214, ehiDelta: -1.1, events: 0 },
    { phase: "CRUISE", duration: "75 min", avgRPM: 2420, avgCHT: 199, peakCHT: 207, ehiDelta: -0.9, events: 1 },
    { phase: "SURVEILLANCE", duration: "3h 41m", avgRPM: 2412, avgCHT: 207, peakCHT: 221, ehiDelta: -4.3, events: faults.length },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden p-2 gap-2">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <span className="label-xs" style={{ color: "#E8EEF6", fontSize: 10 }}>
          POST-MISSION PROPULSION BRIEFING REPORT · AIRFRAME {activeAirframe.tail}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setSignedOff(!signedOff)}
            className="font-display font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer"
            style={{
              fontSize: 11,
              background: signedOff ? "rgba(0,192,139,0.15)" : "#18202C",
              color: signedOff ? "#00C08B" : "#8CA0B8",
              border: `1px solid ${signedOff ? "#00C08B50" : "#243040"}`,
            }}
          >
            {signedOff ? "✓ SIGNED & CERTIFIED" : "✍ DIGITAL SIGN-OFF"}
          </button>

          <button
            onClick={handlePrint}
            className="font-display font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer hover:bg-white/10"
            style={{
              fontSize: 11,
              background: "rgba(255,153,51,0.15)",
              color: "#FF9933",
              border: "1px solid #FF993350",
              letterSpacing: "0.04em",
            }}
            title="Open browser print / PDF export"
          >
            ⬇ PRINT / EXPORT PDF
          </button>

          <button
            onClick={handlePushToFleet}
            className="font-display font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer"
            style={{
              fontSize: 11,
              background: pushed ? "rgba(0,192,139,0.15)" : "#3DA9FC",
              color: pushed ? "#00C08B" : "#080B10",
              border: `1px solid ${pushed ? "#00C08B50" : "transparent"}`,
              letterSpacing: "0.04em",
            }}
          >
            {pushed ? "✓ COMMITTED TO FLEET DB" : "↑ PUSH TO FLEET DATABASE"}
          </button>
        </div>
      </div>

      {/* Report body — A4-proportioned scrollable */}
      <div className="flex-1 overflow-y-auto scrollable">
        <div
          className="mx-auto"
          style={{
            maxWidth: 780,
            background: "#101620",
            border: "1px solid #243040",
            borderRadius: 6,
            padding: "36px 44px",
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: "2px solid #FF9933", paddingBottom: 12, marginBottom: 20 }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-bold" style={{ fontSize: 22, color: "#FF9933", letterSpacing: "0.08em" }}>
                  PRAHARI-DT PROPULSION REPORT
                </div>
                <div className="font-display font-semibold" style={{ fontSize: 15, color: "#E8EEF6", marginTop: 2 }}>
                  AERONAUTICAL DEVELOPMENT ESTABLISHMENT (DRDO)
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-[#FF7A2F] font-bold">RESTRICTED // OFFICIAL DEFENSE USE</div>
                <div className="font-mono text-xs text-[#8CA0B8]">DATE: 2026-04-18 · SORTIE 07:42:19</div>
              </div>
            </div>
          </div>

          {/* Mission header */}
          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {[
              { label: "MISSION ID", val: "ISR-2026-0418" },
              { label: "PLATFORM / TAIL", val: `${activeAirframe.platform} / ${activeAirframe.tail}` },
              { label: "ENGINE SERIAL", val: `${activeAirframe.engine || "DRDO-AD180"} · ${activeAirframe.engineSN || "SN 0143"}` },
              { label: "MISSION PROFILE", val: "Maritime Reconnaissance (EO/IR + SAR)" },
              { label: "ENGINE HOURS", val: `${activeAirframe.engineHours} Operating Hours` },
              { label: "STATUS", val: activeAirframe.ehi > 80 ? "SERVICEABLE" : "DEGRADED - MAINT REQUIRED" },
            ].map((f) => (
              <div key={f.label} style={{ borderBottom: "1px solid #243040", paddingBottom: 6 }}>
                <div className="label-xs" style={{ fontSize: 9 }}>{f.label}</div>
                <div className="font-mono text-xs text-[#E8EEF6] font-medium">{f.val}</div>
              </div>
            ))}
          </div>

          {/* Health delta */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "#E8EEF6" }}>
              ENGINE HEALTH INDEX — DEPARTURE vs RECOVERY
            </div>
            <div className="flex gap-4">
              {[
                { label: "EHI AT TAKEOFF", val: "92.2", color: "#00C08B" },
                { label: "EHI AT RECOVERY", val: `${activeAirframe.ehi}`, color: activeAirframe.ehi > 80 ? "#00C08B" : "#F5B335" },
                { label: "SORTIE DELTA", val: `−${(92.2 - activeAirframe.ehi).toFixed(1)} pts`, color: "#FF7A2F" },
                { label: "DEGRADATION RATE", val: "0.62 pts/hr", color: "#F5B335" },
              ].map((s) => (
                <div key={s.label} className="raised p-3 flex-1 text-center">
                  <div className="label-xs" style={{ fontSize: 9 }}>{s.label}</div>
                  <div className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase performance table */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "#E8EEF6" }}>
              SORTIE PHASE-WISE PERFORMANCE SUMMARY
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["PHASE", "DURATION", "AVG RPM", "AVG CHT", "PEAK CHT", "EHI DELTA", "EVENTS"].map((h) => (
                    <th key={h} style={{ background: "#18202C", color: "#8CA0B8", fontSize: 10, padding: "6px 8px", textAlign: "left", border: "1px solid #243040" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PHASE_TABLE.map((row) => (
                  <tr key={row.phase}>
                    <td style={{ fontFamily: "Barlow Semi Condensed", fontWeight: 600, fontSize: 12, color: "#E8EEF6", padding: "6px 8px", border: "1px solid #1a2233" }}>
                      {row.phase}
                    </td>
                    <td className="font-mono text-xs text-[#8CA0B8]" style={{ padding: "6px 8px", border: "1px solid #1a2233" }}>{row.duration}</td>
                    <td className="font-mono text-xs text-[#E8EEF6]" style={{ padding: "6px 8px", border: "1px solid #1a2233" }}>{row.avgRPM}</td>
                    <td className="font-mono text-xs text-[#E8EEF6]" style={{ padding: "6px 8px", border: "1px solid #1a2233" }}>{row.avgCHT}°C</td>
                    <td className="font-mono text-xs text-[#FF7A2F]" style={{ padding: "6px 8px", border: "1px solid #1a2233" }}>{row.peakCHT}°C</td>
                    <td className="font-mono text-xs text-[#F5B335]" style={{ padding: "6px 8px", border: "1px solid #1a2233" }}>{row.ehiDelta}</td>
                    <td className="font-mono text-xs text-[#E8EEF6]" style={{ padding: "6px 8px", border: "1px solid #1a2233" }}>{row.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Faults list */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "#E8EEF6" }}>
              ACTIVE FAULTS DETECTED DURING SORTIE
            </div>
            {faults.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid #1a2233" }}>
                <span className="font-mono text-xs text-[#3DA9FC] font-semibold w-16">{f.id}</span>
                <span className="text-xs text-[#E8EEF6] flex-1">{f.type}</span>
                <span className="font-mono text-[10px] text-[#FF7A2F]">{f.severity.toUpperCase()}</span>
                <span className="font-mono text-xs text-[#7B61FF]">{f.confidence}% CONF</span>
                <span className="label-xs text-[10px] text-[#00C08B]">{f.status}</span>
              </div>
            ))}
          </div>

          {/* Officer remarks editor */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "#E8EEF6" }}>
              PROPULSION OFFICER OBSERVATIONS & CLEARANCE NOTES
            </div>
            <textarea
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded font-mono text-xs text-[#E8EEF6] focus:outline-none focus:border-[#3DA9FC]"
              style={{ background: "#18202C", border: "1px solid #243040", resize: "vertical" }}
            />
          </div>

          {/* Certification block */}
          <div style={{ borderTop: "1px solid #243040", paddingTop: 20 }}>
            <div className="label-xs mb-3" style={{ fontSize: 11, color: "#E8EEF6" }}>
              PROPULSION OFFICER CERTIFICATION & CLEARANCE
            </div>
            <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="h-10 border-b border-[#546678] flex items-center justify-center">
                  {signedOff && (
                    <span className="font-mono text-xs text-[#00C08B] font-bold tracking-widest">
                      ✓ DIGITALLY CERTIFIED · SQN LDR V. SHARMA · DRDO/ADE
                    </span>
                  )}
                </div>
                <div className="label-xs mt-1" style={{ fontSize: 9 }}>
                  SQN LDR V. SHARMA · PROPULSION SPECIALIST
                </div>
                <div className="font-mono text-[10px] text-[#546678]">
                  Timestamp: {signedOff ? "2026-04-18 14:42:00Z" : "PENDING"}
                </div>
              </div>

              <div>
                <div className="h-10 border-b border-[#546678] flex items-center justify-center">
                  {pushed && (
                    <span className="font-mono text-xs text-[#3DA9FC] font-bold tracking-widest">
                      ✓ ARCHIVED IN FLEET DATABASE
                    </span>
                  )}
                </div>
                <div className="label-xs mt-1" style={{ fontSize: 9 }}>
                  WG CDR R. NAIR · CHIEF TECHNICAL OFFICER
                </div>
                <div className="font-mono text-[10px] text-[#546678]">
                  Database ID: DB-DRDO-2026-90412
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
