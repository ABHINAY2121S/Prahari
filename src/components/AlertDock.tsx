import React from "react";
import { useTwin, Screen } from "../context/TwinContext";
import SeverityChip from "./shared/SeverityChip";

export default function AlertDock() {
  const { alerts, acknowledgeAlert, dismissAlert, acknowledgeAllAlerts, navigateToScreen } = useTwin();

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const counts = {
    critical: activeAlerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    warning: activeAlerts.filter((a) => a.severity === "warning" && !a.acknowledged).length,
    caution: activeAlerts.filter((a) => a.severity === "caution" && !a.acknowledged).length,
    unackTotal: activeAlerts.filter((a) => !a.acknowledged).length,
  };

  return (
    <div
      className="flex items-center gap-2 px-3 select-none"
      style={{ height: 72, background: "var(--bg-panel)", borderTop: "1px solid var(--stroke-hairline)", flexShrink: 0 }}
    >
      {/* Counter and ACK ALL */}
      <div
        className="flex flex-col items-center justify-center gap-1 px-3 shrink-0"
        style={{ borderRight: "1px solid var(--stroke-hairline)", height: "100%", minWidth: 120 }}
      >
        <div className="flex items-center justify-between w-full">
          <span className="label-xs" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
            ALERT DOCK
          </span>
          {counts.unackTotal > 0 && (
            <button
              onClick={acknowledgeAllAlerts}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-colors hover:bg-[var(--state-nominal)] hover:text-white"
              style={{ background: "var(--bg-raised)", color: "var(--state-nominal)", border: "1px solid var(--state-nominal)" }}
              title="Acknowledge all alerts"
            >
              ACK ALL
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {counts.critical > 0 && (
            <span className="font-mono font-bold" style={{ fontSize: 10, color: "var(--state-critical)" }}>
              {counts.critical} CRIT
            </span>
          )}
          <span className="font-mono font-bold" style={{ fontSize: 10, color: counts.warning > 0 ? "var(--state-warning)" : "var(--text-muted)" }}>
            {counts.warning} WARN
          </span>
          <span className="font-mono font-bold" style={{ fontSize: 10, color: counts.caution > 0 ? "var(--state-caution)" : "var(--text-muted)" }}>
            {counts.caution} CAUT
          </span>
        </div>
      </div>

      {/* Alert stream */}
      <div className="flex gap-2 overflow-x-auto flex-1 items-center py-1.5" style={{ height: "100%" }}>
        {activeAlerts.length === 0 ? (
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "var(--state-nominal)" }}>
            <span>✓</span> NO ACTIVE ALERTS · ALL SUBSYSTEMS NOMINAL
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-1 px-2.5 py-1.5 rounded shrink-0 transition-all"
              style={{
                background: alert.acknowledged ? "var(--bg-base)" : "var(--bg-panel)",
                border: "1px solid var(--stroke-hairline)",
                borderLeft: `3px solid ${
                  alert.acknowledged
                    ? "var(--stroke-hairline)"
                    : alert.severity === "critical"
                    ? "var(--state-critical)"
                    : alert.severity === "warning"
                    ? "var(--state-warning)"
                    : alert.severity === "caution"
                    ? "var(--state-caution)"
                    : "var(--state-advisory)"
                }`,
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
                opacity: alert.acknowledged ? 0.6 : 1,
                maxWidth: 290,
                minWidth: 240,
              }}
            >
              <div className="flex items-center gap-2">
                <SeverityChip severity={alert.severity} size="sm" />
                <span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {alert.time}
                </span>
                <span className="label-xs" style={{ fontSize: 9, color: "var(--text-secondary)" }}>
                  {alert.subsystem}
                </span>
                <span className="font-mono ml-auto font-semibold" style={{ fontSize: 10, color: "var(--twin-predicted)" }}>
                  {alert.confidence}%
                </span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer ml-1"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  margin: 0,
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={alert.message}
              >
                {alert.message}
              </p>

              {!alert.acknowledged && (
                <div className="flex gap-1.5 pt-0.5">
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="font-mono px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-[var(--bg-raised)]"
                    style={{ fontSize: 9, background: "var(--bg-raised)", color: "var(--text-primary)", border: "1px solid var(--stroke-hairline)" }}
                  >
                    ACK
                  </button>
                  <button
                    onClick={() => navigateToScreen("faults", "F-0043")}
                    className="font-mono px-2 py-0.5 rounded cursor-pointer transition-colors hover:bg-[var(--state-advisory)] hover:text-white"
                    style={{
                      fontSize: 9,
                      background: "rgba(29, 78, 216, 0.10)",
                      color: "var(--state-advisory)",
                      border: "1px solid var(--state-advisory)",
                    }}
                  >
                    INSPECT XAI →
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
