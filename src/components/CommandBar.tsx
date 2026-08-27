import React, { useState, useEffect } from "react";

import { useTwin } from "../context/TwinContext";



interface Props {

  onOpenFaultInjector: () => void;

}



function StatusPill({ label, value, color = "var(--text-secondary)" }: { label: string; value: string; color?: string }) {

  return (

    <div

      className="flex items-center gap-1.5 px-2 py-1 rounded"

      style={{

        background: "var(--bg-raised)",

        border: "1px solid var(--stroke-hairline)",

      }}

    >

      <span className="label-xs" style={{ fontSize: 9 }}>{label}</span>

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



  const toggleTheme = () => {

    const nextTheme = theme === 'light' ? 'dark' : 'light';

    setTheme(nextTheme);

    try {

      localStorage.setItem('theme', nextTheme);

    } catch (e) {}

    document.documentElement.setAttribute('data-theme', nextTheme);

  };



  const [platformOpen, setPlatformOpen] = useState(false);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);



  return (

    <div

      className="flex items-center px-4 gap-4 relative justify-between select-none"

      style={{

        height: 56,

        background: "var(--bg-panel)",

        borderBottom: "1px solid var(--stroke-hairline)",

      }}

    >

      <div className="flex items-center gap-3.5">

        {/* Platform selector */}

        <div className="relative">

          <button

            onClick={() => setPlatformOpen(!platformOpen)}

            className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors hover:border-[var(--state-advisory)]"

            style={{

              background: "var(--bg-raised)",

              border: "1px solid var(--stroke-hairline)",

            }}

          >

            <div className="flex flex-col items-start">

              <div className="flex items-center gap-1.5">

                <span style={{ fontSize: 10 }}>🇮🇳</span>

                <span className="font-display font-semibold" style={{ fontSize: 13, color: "var(--text-primary)" }}>

                  {activeAirframe.platform}

                </span>

                <span className="font-mono font-bold text-xs text-[var(--state-advisory)]">

                  {activeAirframe.tail}

                </span>

              </div>

              <span className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>

                {activeAirframe.engine || "DRDO-AD180"} · EHI {activeAirframe.ehi}

              </span>

            </div>

            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>▾</span>

          </button>



          {platformOpen && (

            <div

              className="absolute left-0 top-full mt-1 z-50 rounded shadow-2xl"

              style={{

                background: "var(--bg-raised)",

                border: "1px solid var(--stroke-hairline)",

                minWidth: 240,

              }}

            >

              <div

                className="p-2 border-b label-xs text-[9px]"

                style={{

                  borderColor: "var(--stroke-hairline)",

                  color: "var(--text-secondary)",

                }}

              >

                ACTIVE AIRFRAME (FLEET SYNC)

              </div>

              {fleet.map((ac) => (

                <div

                  key={ac.tail}

                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--state-advisory)]/10"

                  style={{

                    borderBottom: "1px solid var(--stroke-hairline)",

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

                      <div className="font-display font-semibold text-xs" style={{ color: "var(--text-primary)" }}>

                        {ac.tail}

                      </div>

                      <div className="font-mono text-[9px]" style={{ color: "var(--text-muted)" }}>

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

            <span className="font-mono font-bold text-xs" style={{ color: "var(--text-primary)" }}>

              ISR-2026-0418

            </span>

            <span className="font-mono text-[9px]" style={{ color: "var(--text-secondary)" }}>

              Maritime ISR · EO/IR + SAR

            </span>

          </div>

          <div className="flex flex-col items-center">

            <span className="label-xs text-[9px]" style={{ color: "var(--text-command-muted)" }}>T+ ELAPSED</span>

            <span className="font-mono font-bold text-xs" style={{ color: "var(--text-primary)" }}>

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

            background: "var(--bg-raised)",

            border: "1px solid var(--stroke-hairline)",

          }}

        >

          <button

            onClick={toggleStreaming}

            className="px-2 py-1 font-mono text-xs flex items-center gap-1 cursor-pointer hover:bg-white/5"

            style={{ color: isStreaming ? "var(--state-nominal)" : "var(--state-warning)" }}

            title="Toggle real-time telemetry stream (Space)"

          >

            <span>{isStreaming ? "⏸ PAUSE" : "▶ STREAM"}</span>

          </button>



          <div style={{ width: 1, height: 18, background: "var(--border-command)" }} />



          {[1, 2, 5].map((spd) => (

            <button

              key={spd}

              onClick={() => setStreamSpeed(spd)}

              className="px-1.5 py-1 font-mono text-xs cursor-pointer hover:bg-white/5"

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

          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer transition-transform active:scale-95 shadow-sm"

          style={{

            background: "rgba(194,65,12,0.15)",

            border: "1px solid rgba(194,65,12,0.5)",

            color: "var(--state-warning)",

          }}

          title="Inject real-time engine faults (F)"

        >

          <span style={{ fontSize: 11 }}>⚡</span>

          <span className="font-display font-semibold text-xs tracking-wider">

            INJECT FAULT

          </span>

        </button>



        {/* Audio Mute/Unmute */}

        <button

          onClick={toggleSound}

          className="px-2 py-1.5 rounded cursor-pointer flex items-center justify-center hover:border-[var(--state-advisory)]"

          style={{

            background: "var(--bg-raised)",

            border: "1px solid var(--stroke-hairline)",

            color: soundOn ? "var(--state-advisory)" : "var(--text-command-muted)",

            fontSize: 13,

          }}

          title={soundOn ? "Mute tactical sound (M)" : "Unmute tactical sound (M)"}

        >

          {soundOn ? "🔊" : "🔇"}

        </button>



        {/* Theme Toggle Button */}

        <button

          onClick={toggleTheme}

          className="px-2 py-1.5 rounded cursor-pointer flex items-center justify-center hover:border-[var(--state-advisory)]"

          style={{

            background: "var(--bg-raised)",

            border: "1px solid var(--stroke-hairline)",

            color: "var(--text-secondary)",

            fontSize: 13,

          }}

          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}

        >

          {theme === "light" ? "🌞" : "☀"}

        </button>



        {/* Arm Mode */}

        <button

          onClick={toggleArmMode}

          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded cursor-pointer transition-all"

          style={{

            background: armMode ? "var(--state-critical)" : "var(--bg-raised)",

            border: `1px solid ${armMode ? "var(--state-critical)" : "var(--stroke-hairline)"}`,

            color: armMode ? "#FFFFFF" : "var(--text-secondary)",

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

                background: "var(--bg-raised)",

                border: "1px solid var(--stroke-hairline)",

              }}

            >

              <div className="flex flex-col text-left">

                <span className="font-display font-semibold text-xs" style={{ color: "var(--text-primary)" }}>

                  {user.rank}

                </span>

                <span className="label-xs text-[8px] text-[var(--accent-india)]">

                  CLEARANCE L-{user.clearanceLevel}

                </span>

              </div>

              <span style={{ fontSize: 9, color: "var(--text-muted)" }}>▾</span>

            </button>



            {profileMenuOpen && (

              <div

                className="absolute right-0 top-full mt-1 z-50 rounded shadow-2xl p-3"

                style={{

                  background: "var(--bg-raised)",

                  border: "1px solid var(--stroke-hairline)",

                  minWidth: 220,

                }}

              >

                <div className="border-b pb-2 mb-2" style={{ borderColor: "var(--stroke-hairline)" }}>

                  <div className="font-display font-bold text-xs" style={{ color: "var(--text-primary)" }}>

                    {user.name}

                  </div>

                  <div className="font-mono text-[9px] text-[var(--state-advisory)]">{user.serviceId}</div>

                  <div className="text-[10px] text-slate-400 mt-0.5">{user.unit}</div>

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

