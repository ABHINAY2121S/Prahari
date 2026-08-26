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
      style={{ height: 72, background: "#101620", borderTop: "1px solid #243040", flexShrink: 0 }}
    >
      {/* Counter and ACK ALL */}
      <div
        className="flex flex-col items-center justify-center gap-1 px-3 shrink-0"
        style={{ borderRight: "1px solid #243040", height: "100%", minWidth: 120 }}
      >
        <div className="flex items-center justify-between w-full">
          <span className="label-xs" style={{ fontSize: 9, color: "#8CA0B8" }}>
            ALERT DOCK
          </span>
          {counts.unackTotal > 0 && (
            <button
              onClick={acknowledgeAllAlerts}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded cursor-pointer hover:bg-white/10"
              style={{ background: "#18202C", color: "#00C08B", border: "1px solid #00C08B40" }}
              title="Acknowledge all alerts"
            >
              ACK ALL
            </button>
          )}
        </div>

        <div className="flex gap-1.5">
          {counts.critical > 0 && (
            <span className="font-mono font-bold" style={{ fontSize: 10, color: "#FF3B4E" }}>
              {counts.critical} CRIT
            </span>
          )}
          <span className="font-mono font-bold" style={{ fontSize: 10, color: counts.warning > 0 ? "#FF7A2F" : "#546678" }}>
            {counts.warning} WARN
          </span>
          <span className="font-mono font-bold" style={{ fontSize: 10, color: counts.caution > 0 ? "#F5B335" : "#546678" }}>
            {counts.caution} CAUT
          </span>
        </div>
      </div>

      {/* Alert stream */}
      <div className="flex gap-2 overflow-x-auto flex-1 items-center py-1.5" style={{ height: "100%" }}>
        {activeAlerts.length === 0 ? (
          <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "#00C08B" }}>
            <span>✓</span> NO ACTIVE ALERTS · ALL SUBSYSTEMS NOMINAL
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col gap-1 px-2.5 py-1.5 rounded shrink-0 transition-all"
              style={{
                background: alert.acknowledged ? "#121822" : "#18202C",
                border: `1px solid ${
                  alert.acknowledged
                    ? "#243040"
                    : alert.severity === "critical"
                    ? "#FF3B4E"
                    : alert.severity === "warning"
                    ? "#FF7A2F60"
                    : "#F5B33560"
                }`,
                opacity: alert.acknowledged ? 0.6 : 1,
                maxWidth: 290,
                minWidth: 240,
              }}
            >
              <div className="flex items-center gap-2">
                <SeverityChip severity={alert.severity} size="sm" />
                <span className="font-mono" style={{ fontSize: 10, color: "#546678" }}>
                  {alert.time}
                </span>
                <span className="label-xs" style={{ fontSize: 9, color: "#8CA0B8" }}>
                  {alert.subsystem}
                </span>
                <span className="font-mono ml-auto font-medium" style={{ fontSize: 10, color: "#7B61FF" }}>
                  {alert.confidence}%
                </span>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="font-mono text-[10px] text-[#546678] hover:text-[#E8EEF6] cursor-pointer ml-1"
                  title="Dismiss alert"
                >
                  ✕
                </button>
              </div>

              <p
                style={{
                  fontSize: 11,
                  color: "#E8EEF6",
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
                    className="font-mono px-2 py-0.5 rounded cursor-pointer hover:bg-white/10"
                    style={{ fontSize: 9, background: "#243040", color: "#E8EEF6", border: "1px solid #3a4f6a" }}
                  >
                    ACK
                  </button>
                  <button
                    onClick={() => navigateToScreen("faults", "F-0043")}
                    className="font-mono px-2 py-0.5 rounded cursor-pointer hover:bg-[#3DA9FC]/20"
                    style={{
                      fontSize: 9,
                      background: "rgba(61,169,252,0.15)",
                      color: "#3DA9FC",
                      border: "1px solid #3DA9FC50",
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
