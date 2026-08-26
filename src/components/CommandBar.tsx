import React, { useState } from "react";
import { useTwin } from "../context/TwinContext";

interface Props {
  onOpenFaultInjector: () => void;
}

function StatusPill({ label, value, color }: { label: string; value: string; color?: string }) {
  const { theme } = useTwin();
  const defaultColor = theme === "gov-light" ? "#334155" : "#8CA0B8";

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded"
      style={{
        background: theme === "gov-light" ? "#F1F5F9" : "#18202C",
        border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
      }}
    >
      <span className="label-xs" style={{ fontSize: 9 }}>{label}</span>
      <span className="font-mono font-bold" style={{ fontSize: 11, color: color || defaultColor }}>{value}</span>
    </div>
  );
}

export default function CommandBar({ onOpenFaultInjector }: Props) {
  const {
    activeAirframe,
    fleet,
    switchAirframe,
    armMode,
    toggleArmMode,
    isStreaming,
    streamSpeed,
    toggleStreaming,
    setStreamSpeed,
    soundOn,
    toggleSound,
    telemetry,
    theme,
    toggleTheme,
    user,
    logout,
  } = useTwin();

  const [platformOpen, setPlatformOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <div
      className="flex items-center px-4 gap-4 relative justify-between select-none"
      style={{
        height: 56,
        background: theme === "gov-light" ? "#FFFFFF" : "#101620",
        borderBottom: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
        boxShadow: theme === "gov-light" ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
      }}
    >
      <div className="flex items-center gap-3.5">
        {/* Platform selector */}
        <div className="relative">
          <button
            onClick={() => setPlatformOpen(!platformOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors hover:border-[#3DA9FC]"
            style={{
              background: theme === "gov-light" ? "#F8FAFC" : "#18202C",
              border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
            }}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 10 }}>🇮🇳</span>
                <span className="font-display font-semibold" style={{ fontSize: 13, color: theme === "gov-light" ? "#0F172A" : "#E8EEF6" }}>
                  {activeAirframe.platform}
                </span>
                <span className="font-mono font-bold text-xs text-[#3DA9FC]">
                  {activeAirframe.tail}
                </span>
              </div>
              <span className="font-mono text-[9px]" style={{ color: theme === "gov-light" ? "#64748B" : "#546678" }}>
                {activeAirframe.engine || "DRDO-AD180"} · EHI {activeAirframe.ehi}
              </span>
            </div>
            <span style={{ color: "#546678", fontSize: 10 }}>▾</span>
          </button>

          {platformOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-50 rounded shadow-2xl"
              style={{
                background: theme === "gov-light" ? "#FFFFFF" : "#18202C",
                border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
                minWidth: 240,
              }}
            >
              <div
                className="p-2 border-b label-xs text-[9px]"
                style={{
                  borderColor: theme === "gov-light" ? "#E2E8F0" : "#243040",
                  color: theme === "gov-light" ? "#64748B" : "#8CA0B8",
                }}
              >
                ACTIVE AIRFRAME (FLEET SYNC)
              </div>
              {fleet.map((ac) => (
                <div
                  key={ac.tail}
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#3DA9FC]/10"
                  style={{
                    borderBottom: `1px solid ${theme === "gov-light" ? "#E2E8F0" : "#243040"}`,
                    background: ac.tail === activeAirframe.tail ? "rgba(61,169,252,0.12)" : "transparent",
                  }}
                  onClick={() => {
                    switchAirframe(ac.tail);
                    setPlatformOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 10 }}>🇮🇳</span>
                    <div>
                      <div className="font-display font-semibold text-xs" style={{ color: theme === "gov-light" ? "#0F172A" : "#E8EEF6" }}>
                        {ac.tail}
                      </div>
                      <div className="font-mono text-[9px]" style={{ color: theme === "gov-light" ? "#64748B" : "#546678" }}>
                        {ac.platform} · {ac.phase}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: ac.ehi > 80 ? "#00C08B" : ac.ehi > 65 ? "#F5B335" : "#FF3B4E" }}
                    >
                      EHI {ac.ehi}
                    </span>
                    <div className="label-xs text-[8px]" style={{ color: ac.live ? "#00C08B" : "#546678" }}>
                      {ac.live ? "● LIVE" : "IDLE"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 28, background: theme === "gov-light" ? "#CBD5E1" : "#243040" }} />

        {/* Mission block */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs" style={{ color: theme === "gov-light" ? "#0F172A" : "#E8EEF6" }}>
              ISR-2026-0418
            </span>
            <span className="font-mono text-[9px]" style={{ color: theme === "gov-light" ? "#64748B" : "#8CA0B8" }}>
              Maritime ISR · EO/IR + SAR
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="label-xs text-[9px]" style={{ color: theme === "gov-light" ? "#64748B" : "#546678" }}>T+ ELAPSED</span>
            <span className="font-mono font-bold text-xs" style={{ color: theme === "gov-light" ? "#0F172A" : "#E8EEF6" }}>
              07:42:19
            </span>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: theme === "gov-light" ? "#CBD5E1" : "#243040" }} />

        {/* Live status indicators */}
        <div className="flex items-center gap-2">
          <StatusPill label="RPM" value={`${Math.round(telemetry.rpm)}`} />
          <StatusPill label="CHT 3" value={`${Math.round(telemetry.cht[2])}°C`} color={telemetry.cht[2] > 215 ? "#FF7A2F" : "#00C08B"} />
          <StatusPill label="OIL P" value={`${telemetry.oilPressure.toFixed(1)} bar`} color={telemetry.oilPressure < 4.0 ? "#FF7A2F" : "#00C08B"} />
        </div>
      </div>

      {/* Right Action & Control Suite */}
      <div className="flex items-center gap-2">
        {/* Stream Play/Pause and Speed */}
        <div
          className="flex items-center rounded overflow-hidden"
          style={{
            background: theme === "gov-light" ? "#F1F5F9" : "#18202C",
            border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
          }}
        >
          <button
            onClick={toggleStreaming}
            className="px-2 py-1 font-mono text-xs flex items-center gap-1 cursor-pointer hover:bg-black/5"
            style={{ color: isStreaming ? "#00C08B" : "#FF7A2F" }}
            title="Toggle real-time telemetry stream (Space)"
          >
            <span>{isStreaming ? "⏸ PAUSE" : "▶ STREAM"}</span>
          </button>

          <div style={{ width: 1, height: 18, background: theme === "gov-light" ? "#CBD5E1" : "#243040" }} />

          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => setStreamSpeed(spd)}
              className="px-1.5 py-1 font-mono text-xs cursor-pointer hover:bg-black/5"
              style={{
                background: streamSpeed === spd ? "rgba(61,169,252,0.2)" : "transparent",
                color: streamSpeed === spd ? "#3DA9FC" : theme === "gov-light" ? "#64748B" : "#546678",
                fontWeight: streamSpeed === spd ? "bold" : "normal",
              }}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Fault Injector Button */}
        <button
          onClick={onOpenFaultInjector}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer transition-transform active:scale-95 shadow-sm"
          style={{
            background: "rgba(255,122,47,0.15)",
            border: "1px solid rgba(255,122,47,0.5)",
            color: "#FF7A2F",
          }}
          title="Inject real-time engine faults (F)"
        >
          <span style={{ fontSize: 11 }}>⚡</span>
          <span className="font-display font-semibold text-xs tracking-wider">
            INJECT FAULT
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="px-2.5 py-1.5 rounded cursor-pointer flex items-center gap-1 transition-all"
          style={{
            background: theme === "gov-light" ? "#F1F5F9" : "#18202C",
            border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
            color: theme === "gov-light" ? "#0F172A" : "#3DA9FC",
          }}
          title="Toggle between Gov National Light and Tactical Dark mode"
        >
          <span style={{ fontSize: 12 }}>{theme === "gov-light" ? "🌙" : "☀️"}</span>
          <span className="font-display font-semibold text-xs">
            {theme === "gov-light" ? "TACTICAL DARK" : "GOV LIGHT"}
          </span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSound}
          className="px-2 py-1.5 rounded cursor-pointer flex items-center justify-center"
          style={{
            background: theme === "gov-light" ? "#F1F5F9" : "#18202C",
            border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
            color: soundOn ? "#3DA9FC" : "#546678",
            fontSize: 13,
          }}
          title={soundOn ? "Mute tactical sound (M)" : "Unmute tactical sound (M)"}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>

        {/* Arm Mode */}
        <button
          onClick={toggleArmMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer transition-all"
          style={{
            background: armMode ? "#FF3B4E" : theme === "gov-light" ? "#F1F5F9" : "#18202C",
            border: `1px solid ${armMode ? "#FF3B4E" : theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
            color: armMode ? "#FFFFFF" : theme === "gov-light" ? "#475569" : "#8CA0B8",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: armMode ? "#FFFFFF" : "#546678",
            }}
          />
          <span className="font-display font-bold text-xs tracking-wider">
            {armMode ? "ARMED" : "DISARMED"}
          </span>
        </button>

        {/* Officer User Profile & Logout */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer hover:border-[#3DA9FC]"
              style={{
                background: theme === "gov-light" ? "#F8FAFC" : "#18202C",
                border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
              }}
            >
              <div className="flex flex-col text-left">
                <span className="font-display font-semibold text-xs" style={{ color: theme === "gov-light" ? "#0F172A" : "#E8EEF6" }}>
                  {user.rank}
                </span>
                <span className="label-xs text-[8px] text-[#FF9933]">
                  CLEARANCE L-{user.clearanceLevel}
                </span>
              </div>
              <span style={{ fontSize: 9, color: "#64748B" }}>▾</span>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded shadow-2xl p-3"
                style={{
                  background: theme === "gov-light" ? "#FFFFFF" : "#18202C",
                  border: `1px solid ${theme === "gov-light" ? "#CBD5E1" : "#243040"}`,
                  minWidth: 220,
                }}
              >
                <div className="border-b pb-2 mb-2" style={{ borderColor: theme === "gov-light" ? "#E2E8F0" : "#243040" }}>
                  <div className="font-display font-bold text-xs" style={{ color: theme === "gov-light" ? "#0F172A" : "#E8EEF6" }}>
                    {user.name}
                  </div>
                  <div className="font-mono text-[9px] text-[#3DA9FC]">{user.serviceId}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{user.unit}</div>
                </div>
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full font-display font-semibold py-1.5 rounded text-xs text-center cursor-pointer transition-colors"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    color: "#DC2626",
                    border: "1px solid rgba(220,38,38,0.3)",
                  }}
                >
                  🚪 RESTRICTED LOGOUT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
