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
        <span className="label-xs" style={{ color: "var(--text-primary)", fontSize: 10 }}>
          POST-MISSION PROPULSION BRIEFING REPORT · AIRFRAME {activeAirframe.tail}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setSignedOff(!signedOff)}
            className="font-display font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer"
            style={{
              fontSize: 11,
              background: signedOff ? "rgba(0,192,139,0.15)" : "var(--bg-raised)",
              color: signedOff ? "var(--state-nominal)" : "var(--text-secondary)",
              border: `1px solid ${signedOff ? "var(--state-nominal)50" : "var(--stroke-hairline)"}`,
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
              color: "var(--accent-india)",
              border: "1px solid var(--accent-india)50",
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
              background: pushed ? "rgba(0,192,139,0.15)" : "var(--state-advisory)",
              color: pushed ? "var(--state-nominal)" : "var(--bg-base)",
              border: `1px solid ${pushed ? "var(--state-nominal)50" : "transparent"}`,
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
            background: "var(--bg-panel)",
            border: "1px solid var(--stroke-hairline)",
            borderRadius: 6,
            padding: "36px 44px",
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: "2px solid var(--accent-india)", paddingBottom: 12, marginBottom: 20 }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-bold" style={{ fontSize: 22, color: "var(--accent-india)", letterSpacing: "0.08em" }}>
                  PRAHARI-DT PROPULSION REPORT
                </div>
                <div className="font-display font-semibold" style={{ fontSize: 15, color: "var(--text-primary)", marginTop: 2 }}>
                  AERONAUTICAL DEVELOPMENT ESTABLISHMENT (DRDO)
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs text-[var(--state-warning)] font-bold">RESTRICTED // OFFICIAL DEFENSE USE</div>
                <div className="font-mono text-xs text-[var(--text-secondary)]">DATE: 2026-04-18 · SORTIE 07:42:19</div>
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
              <div key={f.label} style={{ borderBottom: "1px solid var(--stroke-hairline)", paddingBottom: 6 }}>
                <div className="label-xs" style={{ fontSize: 9 }}>{f.label}</div>
                <div className="font-mono text-xs text-[var(--text-primary)] font-medium">{f.val}</div>
              </div>
            ))}
          </div>

          {/* Health delta */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "var(--text-primary)" }}>
              ENGINE HEALTH INDEX — DEPARTURE vs RECOVERY
            </div>
            <div className="flex gap-4">
              {[
                { label: "EHI AT TAKEOFF", val: "92.2", color: "var(--state-nominal)" },
                { label: "EHI AT RECOVERY", val: `${activeAirframe.ehi}`, color: activeAirframe.ehi > 80 ? "var(--state-nominal)" : "var(--state-caution)" },
                { label: "SORTIE DELTA", val: `−${(92.2 - activeAirframe.ehi).toFixed(1)} pts`, color: "var(--state-warning)" },
                { label: "DEGRADATION RATE", val: "0.62 pts/hr", color: "var(--state-caution)" },
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
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "var(--text-primary)" }}>
              SORTIE PHASE-WISE PERFORMANCE SUMMARY
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["PHASE", "DURATION", "AVG RPM", "AVG CHT", "PEAK CHT", "EHI DELTA", "EVENTS"].map((h) => (
                    <th key={h} style={{ background: "var(--bg-raised)", color: "var(--text-secondary)", fontSize: 10, padding: "6px 8px", textAlign: "left", border: "1px solid var(--stroke-hairline)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PHASE_TABLE.map((row) => (
                  <tr key={row.phase}>
                    <td style={{ fontFamily: "Barlow Semi Condensed", fontWeight: 600, fontSize: 12, color: "var(--text-primary)", padding: "6px 8px", border: "1px solid var(--table-border)" }}>
                      {row.phase}
                    </td>
                    <td className="font-mono text-xs text-[var(--text-secondary)]" style={{ padding: "6px 8px", border: "1px solid var(--table-border)" }}>{row.duration}</td>
                    <td className="font-mono text-xs text-[var(--text-primary)]" style={{ padding: "6px 8px", border: "1px solid var(--table-border)" }}>{row.avgRPM}</td>
                    <td className="font-mono text-xs text-[var(--text-primary)]" style={{ padding: "6px 8px", border: "1px solid var(--table-border)" }}>{row.avgCHT}°C</td>
                    <td className="font-mono text-xs text-[var(--state-warning)]" style={{ padding: "6px 8px", border: "1px solid var(--table-border)" }}>{row.peakCHT}°C</td>
                    <td className="font-mono text-xs text-[var(--state-caution)]" style={{ padding: "6px 8px", border: "1px solid var(--table-border)" }}>{row.ehiDelta}</td>
                    <td className="font-mono text-xs text-[var(--text-primary)]" style={{ padding: "6px 8px", border: "1px solid var(--table-border)" }}>{row.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Faults list */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "var(--text-primary)" }}>
              ACTIVE FAULTS DETECTED DURING SORTIE
            </div>
            {faults.map((f) => (
              <div key={f.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--table-border)" }}>
                <span className="font-mono text-xs text-[var(--state-advisory)] font-semibold w-16">{f.id}</span>
                <span className="text-xs text-[var(--text-primary)] flex-1">{f.type}</span>
                <span className="font-mono text-[10px] text-[var(--state-warning)]">{f.severity.toUpperCase()}</span>
                <span className="font-mono text-xs text-[var(--twin-predicted)]">{f.confidence}% CONF</span>
                <span className="label-xs text-[10px] text-[var(--state-nominal)]">{f.status}</span>
              </div>
            ))}
          </div>

          {/* Officer remarks editor */}
          <div className="mb-6">
            <div className="label-xs mb-2" style={{ fontSize: 11, color: "var(--text-primary)" }}>
              PROPULSION OFFICER OBSERVATIONS & CLEARANCE NOTES
            </div>
            <textarea
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded font-mono text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--state-advisory)]"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--stroke-hairline)", resize: "vertical" }}
            />
          </div>

          {/* Certification block */}
          <div style={{ borderTop: "1px solid var(--stroke-hairline)", paddingTop: 20 }}>
            <div className="label-xs mb-3" style={{ fontSize: 11, color: "var(--text-primary)" }}>
              PROPULSION OFFICER CERTIFICATION & CLEARANCE
            </div>
            <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="h-10 border-b border-[var(--text-muted)] flex items-center justify-center">
                  {signedOff && (
                    <span className="font-mono text-xs text-[var(--state-nominal)] font-bold tracking-widest">
                      ✓ DIGITALLY CERTIFIED · SQN LDR V. SHARMA · DRDO/ADE
                    </span>
                  )}
                </div>
                <div className="label-xs mt-1" style={{ fontSize: 9 }}>
                  SQN LDR V. SHARMA · PROPULSION SPECIALIST
                </div>
                <div className="font-mono text-[10px] text-[var(--text-muted)]">
                  Timestamp: {signedOff ? "2026-04-18 14:42:00Z" : "PENDING"}
                </div>
              </div>

              <div>
                <div className="h-10 border-b border-[var(--text-muted)] flex items-center justify-center">
                  {pushed && (
                    <span className="font-mono text-xs text-[var(--state-advisory)] font-bold tracking-widest">
                      ✓ ARCHIVED IN FLEET DATABASE
                    </span>
                  )}
                </div>
                <div className="label-xs mt-1" style={{ fontSize: 9 }}>
                  WG CDR R. NAIR · CHIEF TECHNICAL OFFICER
                </div>
                <div className="font-mono text-[10px] text-[var(--text-muted)]">
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
