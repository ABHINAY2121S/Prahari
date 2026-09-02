import React, { useState, useEffect } from "react";

import { useTwin } from "../context/TwinContext";



interface Props {

  onOpenFaultInjector: () => void;

}



function StatusPill({ label, value, color = "var(--text-command)" }: { label: string; value: string; color?: string }) {

  return (

    <div

      className="flex items-center gap-1.5 px-2.5 py-1 rounded"

      style={{

        background: "var(--bg-command-control)",

        border: "1px solid var(--border-command)",

        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",

      }}

    >

      <span className="label-xs" style={{ fontSize: 9, color: "var(--text-command-muted)" }}>{label}</span>

      <span className="font-mono font-bold" style={{ fontSize: 11, color }}>{value}</span>

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

    user,

    logout,

  } = useTwin();



  

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  const [showNightModePrompt, setShowNightModePrompt] = useState<boolean>(() => {
    try {
      const dismissed = localStorage.getItem('prahari_night_prompt_dismissed');
      const savedTheme = localStorage.getItem('theme');
      return !dismissed && savedTheme !== 'dark';
    } catch {
      return true;
    }
  });

  const dismissNightModePrompt = () => {
    setShowNightModePrompt(false);
    try {
      localStorage.setItem('prahari_night_prompt_dismissed', 'true');
    } catch (e) {}
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
      localStorage.setItem('prahari_night_prompt_dismissed', 'true');
    } catch (e) {}
    setShowNightModePrompt(false);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleSwitchToNightOps = () => {
    if (theme === 'light') {
      toggleTheme();
    } else {
      dismissNightModePrompt();
    }
  };



  const [platformOpen, setPlatformOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);



  return (

    <div

      className="flex items-center px-4 gap-4 relative justify-between select-none"

      style={{

        height: 56,

        background: "var(--bg-command)",

        borderBottom: "1px solid var(--border-command)",

      }}

    >

      <div className="flex items-center gap-3.5">

        {/* Platform selector */}

        <div className="relative">

          <button

            onClick={() => setPlatformOpen(!platformOpen)}

            className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors hover:border-[var(--state-advisory)]"

            style={{

              background: "var(--bg-command-control)",

              border: "1px solid var(--border-command)",

            }}

          >

            <div className="flex flex-col items-start">

              <div className="flex items-center gap-1.5">

                <span style={{ fontSize: 10 }}>🇮🇳</span>

                <span className="font-display font-semibold" style={{ fontSize: 13, color: "var(--text-command)" }}>

                  {activeAirframe.platform}

                </span>

                <span className="font-mono font-bold text-xs text-[var(--state-advisory)]">

                  {activeAirframe.tail}

                </span>

              </div>

              <span className="font-mono text-[9px]" style={{ color: "var(--text-command-muted)" }}>

                {activeAirframe.engine || "DRDO-AD180"} · EHI {activeAirframe.ehi}

              </span>

            </div>

            <span style={{ color: "var(--text-command-muted)", fontSize: 10 }}>▾</span>

          </button>



          {platformOpen && (

            <div

              className="absolute left-0 top-full mt-1 z-50 rounded shadow-2xl"

              style={{

                background: "var(--bg-command-control)",

                border: "1px solid var(--border-command)",

                minWidth: 240,

              }}

            >

              <div

                className="p-2 border-b label-xs text-[9px]"

                style={{

                  borderColor: "var(--border-command)",

                  color: "var(--text-command-secondary)",

                }}

              >

                ACTIVE AIRFRAME (FLEET SYNC)

              </div>

              {fleet.map((ac) => (

                <div

                  key={ac.tail}

                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--state-advisory)]/10"

                  style={{

                    borderBottom: "1px solid var(--border-command)",

                    background: ac.tail === activeAirframe.tail ? "var(--table-selected)" : "transparent",

                  }}

                  onClick={() => {

                    switchAirframe(ac.tail);

                    setPlatformOpen(false);

                  }}

                >

                  <div className="flex items-center gap-2">

                    <span style={{ fontSize: 10 }}>🇮🇳</span>

                    <div>

                      <div className="font-display font-semibold text-xs" style={{ color: "var(--text-command)" }}>

                        {ac.tail}

                      </div>

                      <div className="font-mono text-[9px]" style={{ color: "var(--text-command-muted)" }}>

                        {ac.platform} · {ac.phase}

                      </div>

                    </div>

                  </div>

                  <div className="text-right">

                    <span

                      className="font-mono text-xs font-bold"

                      style={{ color: ac.ehi > 80 ? "var(--state-nominal)" : ac.ehi > 65 ? "var(--state-caution)" : "var(--state-critical)" }}

                    >

                      EHI {ac.ehi}

                    </span>

                    <div className="label-xs text-[8px]" style={{ color: ac.live ? "var(--state-nominal)" : "var(--text-muted)" }}>

                      {ac.live ? "● LIVE" : "IDLE"}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>



        <div style={{ width: 1, height: 28, background: "var(--border-command)" }} />



        {/* Mission block */}

        <div className="flex items-center gap-3">

          <div className="flex flex-col">

            <span className="font-mono font-bold text-xs" style={{ color: "var(--text-command)" }}>

              ISR-2026-0418

            </span>

            <span className="font-mono text-[9px]" style={{ color: "var(--text-command-secondary)" }}>

              Maritime ISR · EO/IR + SAR

            </span>

          </div>

          <div className="flex flex-col items-center">

            <span className="label-xs text-[9px]" style={{ color: "var(--text-command-muted)" }}>T+ ELAPSED</span>

            <span className="font-mono font-bold text-xs" style={{ color: "var(--text-command)" }}>

              07:42:19

            </span>

          </div>

        </div>



        <div style={{ width: 1, height: 28, background: "var(--border-command)" }} />



        {/* Live status indicators */}

        <div className="flex items-center gap-2">

          <StatusPill label="RPM" value={`${Math.round(telemetry.rpm)}`} color="var(--text-primary)" />

          <StatusPill label="CHT 3" value={`${Math.round(telemetry.cht[2])}°C`} color={telemetry.cht[2] > 215 ? "var(--state-warning)" : "var(--state-nominal)"} />

          <StatusPill label="OIL P" value={`${telemetry.oilPressure.toFixed(1)} bar`} color={telemetry.oilPressure < 4.0 ? "var(--state-warning)" : "var(--state-nominal)"} />

        </div>

      </div>



      {/* Right Action & Control Suite */}

      <div className="flex items-center gap-2">

        {/* Stream Play/Pause and Speed */}
        <div
          className="flex items-center rounded overflow-hidden"
          style={{
            background: "var(--bg-command-control)",
            border: "1px solid var(--border-command)",
          }}
        >
          <button
            onClick={toggleStreaming}
            className="px-2 py-1 font-mono text-xs flex items-center gap-1 cursor-pointer transition-colors hover:bg-[var(--bg-command-control-hover)]"
            style={{ color: isStreaming ? "var(--state-nominal)" : "var(--state-warning)", fontWeight: 600 }}
            title="Toggle real-time telemetry stream (Space)"
          >
            <span>{isStreaming ? "⏸ PAUSE" : "▶ STREAM"}</span>
          </button>

          <div style={{ width: 1, height: 18, background: "var(--border-command)" }} />

          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => setStreamSpeed(spd)}
              className="px-1.5 py-1 font-mono text-xs cursor-pointer transition-colors hover:bg-[var(--bg-command-control-hover)]"
              style={{
                background: streamSpeed === spd ? "var(--table-selected)" : "transparent",
                color: streamSpeed === spd ? "var(--state-advisory)" : "var(--text-command-muted)",
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer transition-all active:scale-95 shadow-sm hover:brightness-105"
          style={{
            background: "rgba(194,65,12,0.12)",
            border: "1px solid var(--state-warning)",
            color: "var(--state-warning)",
          }}
          title="Inject real-time engine faults (F)"
        >
          <span style={{ fontSize: 11 }}>⚡</span>
          <span className="font-display font-bold text-xs tracking-wider">
            INJECT FAULT
          </span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={toggleSound}
          className="px-2 py-1.5 rounded cursor-pointer flex items-center justify-center hover:border-[var(--state-advisory)]"
          style={{
            background: "var(--bg-command-control)",
            border: "1px solid var(--border-command)",
            color: soundOn ? "var(--state-advisory)" : "var(--text-command-muted)",
            fontSize: 13,
          }}
          title={soundOn ? "Mute tactical sound (M)" : "Unmute tactical sound (M)"}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>

        {/* Tactical Ops Mode Toggle with Onboarding Pop-up */}
        <div className="relative">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-all hover:border-[var(--state-advisory)] ${
              showNightModePrompt && theme === "light"
                ? "ring-2 ring-[var(--accent-india)] shadow-md animate-pulse"
                : ""
            }`}
            style={{
              background: "var(--bg-command-control)",
              border: "1px solid var(--border-command)",
              color: "var(--text-command-secondary)",
            }}
            title={`Switch to ${theme === "light" ? "Night Ops (Dark)" : "Daylight Ops (Light)"} Mode`}
          >
            <span style={{ fontSize: 12 }}>{theme === "light" ? "🌙" : "☀️"}</span>
            <span className="font-mono text-[9px] font-bold tracking-wider">
              {theme === "light" ? "NIGHT OPS" : "DAY OPS"}
            </span>
          </button>

          {/* Tactical Night Ops Pop-up Advisory */}
          {showNightModePrompt && theme === "light" && (
            <div
              className="absolute right-0 top-full mt-2.5 z-50 rounded-lg p-3 shadow-2xl flex flex-col gap-2"
              style={{
                width: 275,
                background: "var(--bg-panel)",
                border: "1px solid var(--accent-india)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25), 0 0 16px rgba(230,81,0,0.2)",
              }}
            >
              {/* Arrow pointing up to the button */}
              <div
                className="absolute -top-1.5 right-6 w-3 h-3 rotate-45"
                style={{
                  background: "var(--bg-panel)",
                  borderLeft: "1px solid var(--accent-india)",
                  borderTop: "1px solid var(--accent-india)",
                }}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="twin-pulse"
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-india)" }}
                  />
                  <span className="font-mono font-bold text-[10px] tracking-wider text-[var(--accent-india)]">
                    TACTICAL ADVISORY
                  </span>
                </div>
                <button
                  onClick={dismissNightModePrompt}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer px-1 -mr-1 leading-none"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
                For tactical / night mode, toggle to <strong className="text-[var(--accent-india)]">Night Ops mode</strong>.
              </p>

              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleSwitchToNightOps}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-bold font-mono tracking-wider cursor-pointer transition-all hover:brightness-110 active:scale-95 text-white"
                  style={{
                    background: "var(--accent-india)",
                    boxShadow: "0 2px 8px rgba(230,81,0,0.3)",
                  }}
                >
                  <span>🌙</span>
                  <span>TOGGLE NIGHT OPS</span>
                </button>
                <button
                  onClick={dismissNightModePrompt}
                  className="py-1.5 px-2.5 rounded text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                  style={{
                    border: "1px solid var(--stroke-hairline)",
                    background: "var(--bg-command-control)",
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Arm Mode */}
        <button
          onClick={toggleArmMode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer transition-all"
          style={{
            background: armMode ? "var(--state-critical)" : "var(--bg-command-control)",
            border: `1px solid ${armMode ? "var(--state-critical)" : "var(--border-command)"}`,
            color: armMode ? "#FFFFFF" : "var(--text-command-secondary)",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: armMode ? "#FFFFFF" : "var(--text-muted)",
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer hover:border-[var(--state-advisory)]"
              style={{
                background: "var(--bg-command-control)",
                border: "1px solid var(--border-command)",
              }}
            >
              <div className="flex flex-col text-left">
                <span className="font-display font-semibold text-xs" style={{ color: "var(--text-command)" }}>
                  {user.rank}
                </span>
                <span className="label-xs text-[8px] text-[var(--accent-india)]">
                  CLEARANCE L-{user.clearanceLevel}
                </span>
              </div>
              <span style={{ fontSize: 9, color: "var(--text-command-muted)" }}>▾</span>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded shadow-2xl p-3"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--stroke-hairline)",
                  minWidth: 230,
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.12), 0 8px 10px -6px rgba(0,0,0,0.08)",
                }}
              >
                <div className="border-b pb-2 mb-2" style={{ borderColor: "var(--stroke-hairline)" }}>
                  <div className="font-display font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                    {user.name}
                  </div>
                  <div className="font-mono text-[9px] text-[var(--state-advisory)]">{user.serviceId}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--text-secondary)" }}>{user.unit}</div>
                </div>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    logout();
                  }}
                  className="w-full font-display font-semibold py-1.5 rounded text-xs text-center cursor-pointer transition-colors"
                  style={{
                    background: "rgba(220,38,38,0.08)",
                    color: "var(--state-critical)",
                    border: "1px solid rgba(220,38,38,0.25)",
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

