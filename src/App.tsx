import React, { useState, useEffect } from "react";
import { TwinProvider, useTwin, Screen } from "./context/TwinContext";
import AuthLogin from "./screens/AuthLogin";
import ClassificationStrip from "./components/ClassificationStrip";
import CommandBar from "./components/CommandBar";
import MissionPhaseStrip from "./components/MissionPhaseStrip";
import AlertDock from "./components/AlertDock";
import NavRail from "./components/NavRail";
import FaultInjectorDrawer from "./components/FaultInjectorDrawer";

import S1_LiveTwin from "./screens/S1_LiveTwin";
import S2_Health from "./screens/S2_Health";
import S3_FaultCentre from "./screens/S3_FaultCentre";
import S4_Prognostics from "./screens/S4_Prognostics";
import S5_Simulation from "./screens/S5_Simulation";
import S6_Replay from "./screens/S6_Replay";
import S7_Maintenance from "./screens/S7_Maintenance";
import S8_Fleet from "./screens/S8_Fleet";
import S9_System from "./screens/S9_System";
import S10_Report from "./screens/S10_Report";

const SCREEN_TITLES: Record<Screen, string> = {
  fleet: "FLEET OVERVIEW · AIRFRAME READINESS & HEALTH",
  "live-twin": "LIVE TWIN · DIGITAL TWIN TELEMETRY DELTA",
  health: "HEALTH & SUBSYSTEM DIAGNOSTICS · DEGRADATION WATERFALL",
  faults: "FAULT CENTRE · XAI EXPLAINABILITY & OPERATOR TRIAGE",
  prognostics: "PROGNOSTICS · REMAINING USEFUL LIFE (RUL)",
  simulation: "SIMULATION · WHAT-IF MISSION ANALYSIS",
  replay: "MISSION REPLAY & EVENT SCRUBBER",
  maintenance: "MAINTENANCE ADVISORY & SPARES INVENTORY",
  reports: "POST-MISSION PROPULSION BRIEFING REPORT",
  system: "SYSTEM & SENSOR INTEGRITY · CALIBRATION",
};

const SCREEN_ORDER: Screen[] = [
  "fleet",
  "live-twin",
  "health",
  "faults",
  "prognostics",
  "simulation",
  "replay",
  "maintenance",
  "reports",
  "system",
];

function MainApp() {
  const {
    user,
    activeScreen,
    navigateToScreen,
    activeAirframe,
    toastMessage,
    toggleStreaming,
    toggleSound,
  } = useTwin();

  const [navExpanded, setNavExpanded] = useState(false);
  const [faultDrawerOpen, setFaultDrawerOpen] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < SCREEN_ORDER.length) {
          navigateToScreen(SCREEN_ORDER[idx]);
        }
      } else if (e.key === "0") {
        navigateToScreen(SCREEN_ORDER[9]);
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        toggleStreaming();
      } else if (e.key.toLowerCase() === "m") {
        toggleSound();
      } else if (e.key.toLowerCase() === "f") {
        setFaultDrawerOpen((p) => !p);
      } else if (e.key === "Escape") {
        setFaultDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigateToScreen, toggleStreaming, toggleSound]);

  // If officer is not logged in, render classified defense login screen
  if (!user) {
    return <AuthLogin />;
  }

  const ScreenComponent = {
    fleet: S8_Fleet,
    "live-twin": S1_LiveTwin,
    health: S2_Health,
    faults: S3_FaultCentre,
    prognostics: S4_Prognostics,
    simulation: S5_Simulation,
    replay: S6_Replay,
    maintenance: S7_Maintenance,
    reports: S10_Report,
    system: S9_System,
  }[activeScreen];

  return (
    <div
      className="flex flex-col select-none"
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Classification banner */}
      <ClassificationStrip />

      {/* Global Command Bar */}
      <CommandBar onOpenFaultInjector={() => setFaultDrawerOpen(true)} />

      {/* Mission Phase Progression Bar */}
      <MissionPhaseStrip />

      {/* Screen Title & Breadcrumb bar */}
      <div
        className="flex items-center px-4 gap-2.5"
        style={{
          height: 32,
          background: "var(--bg-panel)",
          borderBottom: "2px solid var(--stroke-medium)",
          borderTop: "1px solid var(--stroke-hairline)",
          flexShrink: 0,
        }}
      >
        <div className="twin-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--state-advisory)" }} />
        <span className="font-display font-semibold text-xs tracking-wider text-text-primary">
          {SCREEN_TITLES[activeScreen]}
        </span>
        <div style={{ flex: 1 }} />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-text-secondary">
            AIRFRAME: <strong className="text-state-advisory">{activeAirframe.tail}</strong> · {activeAirframe.platform}
          </span>
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-stroke-hairline text-text-muted"
          >
            CLEARANCE: L-{user.clearanceLevel} · {user.rank}
          </span>
        </div>
      </div>

      {/* Main Workspace (NavRail + Active Screen) */}
      <div className="flex flex-1 min-h-0">
        <NavRail
          active={activeScreen}
          onNavigate={(s) => navigateToScreen(s)}
          expanded={navExpanded}
          onToggle={() => setNavExpanded((p) => !p)}
        />
        <div className="flex-1 min-w-0 overflow-hidden bg-bg-base">
          <ScreenComponent />
        </div>
      </div>

      {/* Reactive Bottom Alert Dock */}
      <AlertDock />

      {/* Interactive Fault Injector Drawer */}
      <FaultInjectorDrawer isOpen={faultDrawerOpen} onClose={() => setFaultDrawerOpen(false)} />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          className="fixed top-16 right-6 z-50 px-4 py-2.5 rounded shadow-2xl font-mono text-xs font-semibold flex items-center gap-2 animate-bounce bg-bg-raised border border-state-advisory text-text-primary"
          style={{
            boxShadow: "0 4px 24px rgba(61,169,252,0.3)",
          }}
        >
          <span>🛰️</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TwinProvider>
      <MainApp />
    </TwinProvider>
  );
}
