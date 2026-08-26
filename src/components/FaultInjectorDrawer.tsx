import React from "react";
import { useTwin } from "../context/TwinContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function FaultInjectorDrawer({ isOpen, onClose }: Props) {
  const { activeInjectedFaults, injectFault, clearInjectedFaults } = useTwin();

  if (!isOpen) return null;

  const FAULT_OPTIONS = [
    {
      id: "cyl3_injector",
      title: "Cylinder 3 Injector Clog",
      subsystem: "COMBUSTION",
      desc: "Simulates partial blockage: EGT jumps +41°C, CHT rises +25°C on Cyl 3.",
      sev: "WARNING",
      sevColor: "#FF7A2F",
    },
    {
      id: "oil_pressure_drop",
      title: "Oil Pump Seal Leakage",
      subsystem: "LUBRICATION",
      desc: "Simulates gallery pressure loss: Oil P drops from 4.8 to 3.4 bar, Oil Temp spikes.",
      sev: "CAUTION",
      sevColor: "#F5B335",
    },
    {
      id: "vibration_harmonic",
      title: "Propeller Dynamic Imbalance",
      subsystem: "MECHANICAL",
      desc: "Simulates harmonic resonance: Vibration RMS rises to 4.2 mm/s at 147 Hz.",
      sev: "CAUTION",
      sevColor: "#F5B335",
    },
    {
      id: "sensor_drift",
      title: "CHT-03 Thermocouple Drift",
      subsystem: "SENSORS",
      desc: "Simulates instrumentation degradation: Sensor residual increases to 18.5%.",
      sev: "ADVISORY",
      sevColor: "#3DA9FC",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="panel p-5 max-w-xl w-full mx-4 flex flex-col gap-4"
        style={{
          background: "#101620",
          border: "1px solid #3DA9FC",
          boxShadow: "0 0 30px rgba(61,169,252,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "#243040" }}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18, color: "#FF7A2F" }}>⚡</span>
            <div>
              <span className="font-display font-bold text-base" style={{ color: "#E8EEF6", letterSpacing: "0.05em" }}>
                IN-FLIGHT FAULT INJECTION CONSOLE
              </span>
              <div className="label-xs" style={{ fontSize: 9, color: "#8CA0B8" }}>
                TEST DIGITAL TWIN ANOMALY DETECTION & REAL-TIME ML ISOLATION
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs px-2 py-1 rounded hover:bg-white/10"
            style={{ color: "#8CA0B8", background: "#18202C", border: "1px solid #243040" }}
          >
            ✕ ESC
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {FAULT_OPTIONS.map((opt) => {
            const isActive = activeInjectedFaults.includes(opt.id);
            return (
              <div
                key={opt.id}
                className="p-3 rounded flex items-center justify-between"
                style={{
                  background: isActive ? "rgba(255,122,47,0.08)" : "#18202C",
                  border: `1px solid ${isActive ? opt.sevColor : "#243040"}`,
                }}
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-sm" style={{ color: "#E8EEF6" }}>
                      {opt.title}
                    </span>
                    <span
                      className="label-xs font-mono px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: 8,
                        background: `${opt.sevColor}20`,
                        color: opt.sevColor,
                        border: `1px solid ${opt.sevColor}40`,
                      }}
                    >
                      {opt.subsystem} · {opt.sev}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: "#8CA0B8", lineHeight: 1.3 }}>
                    {opt.desc}
                  </div>
                </div>

                <button
                  onClick={() => injectFault(opt.id)}
                  disabled={isActive}
                  className="font-display font-semibold px-3 py-1.5 rounded text-xs shrink-0 cursor-pointer"
                  style={{
                    background: isActive ? "#FF7A2F20" : "#FF7A2F",
                    color: isActive ? "#FF7A2F" : "#080B10",
                    border: `1px solid ${isActive ? "#FF7A2F" : "transparent"}`,
                  }}
                >
                  {isActive ? "⚡ INJECTED (ACTIVE)" : "INJECT FAULT"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#243040" }}>
          <button
            onClick={clearInjectedFaults}
            className="font-display font-semibold px-3 py-1.5 rounded text-xs cursor-pointer"
            style={{
              background: "rgba(0,192,139,0.15)",
              color: "#00C08B",
              border: "1px solid #00C08B50",
            }}
          >
            ✓ RESTORE NOMINAL BASELINE
          </button>
          <button
            onClick={onClose}
            className="font-display font-semibold px-4 py-1.5 rounded text-xs cursor-pointer"
            style={{
              background: "#3DA9FC",
              color: "#080B10",
            }}
          >
            CLOSE CONSOLE
          </button>
        </div>
      </div>
    </div>
  );
}
