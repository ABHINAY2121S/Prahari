import React from "react";
import { Screen, useTwin } from "../context/TwinContext";

interface NavItem {
  id: Screen;
  label: string;
  icon: string;
  badgeKey?: "fleet" | "live-twin" | "faults" | "maintenance" | "alerts";
}

interface Props {
  active: Screen;
  onNavigate: (s: Screen) => void;
  expanded: boolean;
  onToggle: () => void;
}

const ITEMS: NavItem[] = [
  { id: "fleet",       label: "Fleet Overview",       icon: "◈", badgeKey: "fleet" },
  { id: "live-twin",   label: "Live Twin (Delta)",    icon: "⬡", badgeKey: "live-twin" },
  { id: "health",      label: "Health Diagnostics",   icon: "◎" },
  { id: "faults",      label: "Fault Centre (XAI)",   icon: "⬟", badgeKey: "faults" },
  { id: "prognostics", label: "Prognostics & RUL",    icon: "⟳" },
  { id: "simulation",  label: "Simulation (What-If)", icon: "⊙" },
  { id: "replay",      label: "Mission Replay",       icon: "▶" },
  { id: "maintenance", label: "Maintenance Advisory",icon: "⚙", badgeKey: "maintenance" },
  { id: "reports",     label: "Post-Mission Report",  icon: "≡" },
  { id: "system",      label: "System & Sensors",     icon: "⊞" },
];

export default function NavRail({ active, onNavigate, expanded, onToggle }: Props) {
  const { faults, maintenanceItems, activeAirframe, fleet } = useTwin();

  const openFaultsCount = faults.filter((f) => f.status === "OPEN").length;
  const pendingMaintenanceCount = maintenanceItems.filter((m) => !m.completed).length;
  const groundedFleetCount = fleet.filter((a) => a.phase === "GROUNDED" || a.phase === "MAINTENANCE").length;

  const getBadgeCount = (key?: string) => {
    if (key === "faults") return openFaultsCount;
    if (key === "maintenance") return pendingMaintenanceCount;
    if (key === "fleet") return groundedFleetCount;
    if (key === "live-twin") return activeAirframe.openFaults > 0 ? activeAirframe.openFaults : undefined;
    return undefined;
  };

  const w = expanded ? 192 : 56;

  return (
    <div
      className="flex flex-col select-none"
      style={{
        width: w,
        background: "var(--bg-nav)",
        borderRight: "1px solid var(--stroke-hairline)",
        transition: "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center cursor-pointer hover:text-[var(--text-primary)] transition-colors"
        style={{
          height: 40,
          borderBottom: "1px solid var(--stroke-hairline)",
          background: "transparent",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
        title={expanded ? "Collapse Navigation Rail" : "Expand Navigation Rail"}
      >
        {expanded ? "◀ COLLAPSE" : "▶"}
      </button>

      {/* Nav items */}
      <div className="flex flex-col flex-1 py-1">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          const badge = getBadgeCount(item.badgeKey);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center relative cursor-pointer group"
              style={{
                height: 44,
                padding: expanded ? "0 14px" : "0",
                justifyContent: expanded ? "flex-start" : "center",
                gap: 10,
                background: isActive ? "rgba(216,228,240,0.12)" : "transparent",
                borderLeft: isActive ? "3px solid var(--state-advisory)" : "3px solid transparent",
                transition: "background 0.15s, border-color 0.15s",
              }}
              title={item.label}
            >
              <span
                style={{
                  fontSize: 16,
                  color: isActive ? "var(--state-advisory)" : "var(--text-secondary)",
                  width: 20,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>

              {expanded && (
                <span
                  className="font-display"
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </span>
              )}

              {badge !== undefined && badge > 0 && (
                <div
                  className="font-mono font-bold"
                  style={{
                    position: expanded ? "static" : "absolute",
                    top: expanded ? undefined : 6,
                    right: expanded ? undefined : 6,
                    marginLeft: expanded ? "auto" : undefined,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: item.id === "faults" ? "var(--state-warning)" : item.id === "fleet" ? "var(--state-critical)" : "var(--state-advisory)",
                    color: "var(--bg-base)",
                    fontSize: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {badge}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Tier legend */}
      <div
        className="flex flex-col gap-1 p-2.5"
        style={{ borderTop: "1px solid var(--stroke-hairline)", background: "var(--bg-raised)" }}
      >
        {expanded ? (
          <>
            <span className="label-xs" style={{ fontSize: 9, color: "var(--text-muted)" }}>
              TELEMETRY DATA TIERS
            </span>
            {[
              { label: "RAW SENSOR", color: "var(--text-primary)" },
              { label: "CONTEXT BASELINE", color: "var(--text-secondary)" },
              { label: "AI DIGITAL TWIN", color: "var(--twin-predicted)" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <div style={{ width: 6, height: 6, background: t.color, borderRadius: 1, flexShrink: 0 }} />
                <span className="label-xs" style={{ fontSize: 9, color: "var(--text-muted)" }}>
                  {t.label}
                </span>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-1">
            {["var(--text-primary)", "var(--text-secondary)", "var(--twin-predicted)"].map((c, i) => (
              <div key={i} style={{ width: 6, height: 6, background: c, borderRadius: 1 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export type { Screen };
