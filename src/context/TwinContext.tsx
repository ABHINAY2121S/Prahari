import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  MISSION,
  PHASES,
  TELEMETRY_BASE,
  TWIN_PREDICTED,
  HEALTH,
  FAULTS as INITIAL_FAULTS,
  ALERTS as INITIAL_ALERTS,
  COMPONENTS_RUL as INITIAL_RUL,
  FLEET_AIRCRAFT as INITIAL_FLEET,
  MAINTENANCE_ITEMS as INITIAL_MAINTENANCE,
  SENSORS as INITIAL_SENSORS,
  jitter
} from "../data/mockData";
import { playAlertBeep, playSuccessChime, playTacticalClick, setSoundEnabled } from "../utils/audio";

export type Screen =
  | "fleet"
  | "live-twin"
  | "health"
  | "faults"
  | "prognostics"
  | "simulation"
  | "replay"
  | "maintenance"
  | "reports"
  | "system";

export type FaultStatus = "OPEN" | "ACKNOWLEDGED" | "CONFIRMED" | "FALSE_POSITIVE" | "DEFERRED" | "RESOLVED";

export type AppTheme = "tactical-dark" | "gov-light";

export interface OfficerProfile {
  serviceId: string;
  name: string;
  rank: string;
  designation: string;
  clearanceLevel: 1 | 2 | 3; // 1: Tech, 2: Propulsion Officer, 3: Commander
  unit: string;
  station: string;
  authenticatedAt?: string;
}

export interface Airframe {
  tail: string;
  platform: string;
  phase: string;
  ehi: number;
  rul: number;
  openFaults: number;
  live: boolean;
  engineHours: number;
  engine?: string;
  engineSN?: string;
}

export interface TelemetryData {
  rpm: number;
  torque: number;
  power: number;
  throttle: number;
  fuelFlow: number;
  fuelPressure: number;
  cht: [number, number, number, number];
  egt: [number, number, number, number];
  oilPressure: number;
  oilTemp: number;
  oilLevel: number;
  coolantTemp: number;
  intakePressure: number;
  intakeTemp: number;
  vibrationRMS: number;
  vibrationFreq: number;
  injTiming: number;
  injQuantity: number;
  batteryV: number;
  batteryI: number;
  alternatorV: number;
  alternatorI: number;
}

export interface ChartPoint {
  t: number;
  rpm: number;
  rpmPred: number;
  egt3: number;
  egt3Pred: number;
  cht3: number;
  cht3Pred: number;
  oilP: number;
  oilPPred: number;
  vib: number;
}

export interface AlertItem {
  id: string;
  severity: "critical" | "warning" | "caution" | "advisory";
  time: string;
  subsystem: string;
  message: string;
  confidence: number;
  acknowledged: boolean;
  dismissed?: boolean;
}

export interface MaintenanceItem {
  id: string;
  action: string;
  component: string;
  urgency: string;
  downtime: string;
  spares: { part: string; pn: string; stock: string; qtyAvailable: number }[];
  sourcefault?: string;
  confidence: number;
  completed?: boolean;
}

export const DEMO_PROFILES: OfficerProfile[] = [
  {
    serviceId: "DRDO-ADE-8841",
    name: "Sqn Ldr Vikram Sharma",
    rank: "Squadron Leader",
    designation: "Chief Propulsion Specialist",
    clearanceLevel: 3,
    unit: "Aeronautical Development Establishment (DRDO)",
    station: "Bengaluru C2 Ground Station",
  },
  {
    serviceId: "IAF-TAC-4019",
    name: "Flt Lt Ananya Rao",
    rank: "Flight Lieutenant",
    designation: "Propulsion Diagnostic Officer",
    clearanceLevel: 2,
    unit: "UAV Squadron 115 'Prahari'",
    station: "Air Force Station Tambaram",
  },
  {
    serviceId: "DRDO-GTD-1022",
    name: "JWO R. K. Nair",
    rank: "Junior Warrant Officer",
    designation: "Ground Telemetry Technician",
    clearanceLevel: 1,
    unit: "Ground Flight Test Directorate",
    station: "Aero Engine Test Facility",
  },
];

interface TwinContextType {
  activeScreen: Screen;
  navigateToScreen: (s: Screen, faultId?: string) => void;
  
  // Theme & Auth
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (t: AppTheme) => void;
  user: OfficerProfile | null;
  login: (profile: OfficerProfile) => void;
  logout: () => void;
  
  soundOn: boolean;
  toggleSound: () => void;
  
  // Fleet & Airframe
  fleet: Airframe[];
  activeAirframe: Airframe;
  switchAirframe: (tail: string) => void;
  
  // Mission & Phase
  missionPhase: string;
  missionPhases: typeof PHASES;
  setMissionPhase: (phaseId: string) => void;
  armMode: boolean;
  toggleArmMode: () => void;
  
  // Streaming & Live Telemetry
  isStreaming: boolean;
  streamSpeed: number;
  toggleStreaming: () => void;
  setStreamSpeed: (speed: number) => void;
  telemetry: TelemetryData;
  twinPredicted: typeof TWIN_PREDICTED;
  chartHistory: ChartPoint[];
  
  // Injected Faults
  activeInjectedFaults: string[];
  injectFault: (faultType: string) => void;
  clearInjectedFaults: () => void;
  
  // Faults & Triage
  faults: typeof INITIAL_FAULTS;
  activeFaultId: string | null;
  setActiveFaultId: (id: string | null) => void;
  setFaultStatus: (faultId: string, status: FaultStatus) => void;
  
  // Alerts
  alerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  acknowledgeAllAlerts: () => void;
  
  // Maintenance
  maintenanceItems: MaintenanceItem[];
  executeMaintenance: (id: string) => void;
  
  // Sensors
  sensors: typeof INITIAL_SENSORS;
  calibrateSensor: (id: string) => void;
  
  // Toast notification
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const TwinContext = createContext<TwinContextType | null>(null);

export const TwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state with localStorage persistence
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("prahari_theme") : null;
    return (saved as AppTheme) || "tactical-dark";
  });

  // User Auth state with localStorage persistence
  const [user, setUser] = useState<OfficerProfile | null>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("prahari_user") : null;
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return DEMO_PROFILES[0]; // Default logged in as Sqn Ldr for quick start
  });

  const [activeScreen, setActiveScreen] = useState<Screen>("live-twin");
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [armMode, setArmMode] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Airframes
  const [fleet, setFleet] = useState<Airframe[]>(INITIAL_FLEET);
  const [activeTail, setActiveTail] = useState<string>("TB-207");
  
  // Mission Phase
  const [missionPhase, setMissionPhaseState] = useState<string>("SURVEILLANCE");
  const [missionPhases, setMissionPhases] = useState(PHASES);
  
  // Live Telemetry
  const [telemetry, setTelemetry] = useState<TelemetryData>({ ...TELEMETRY_BASE });
  const [activeInjectedFaults, setActiveInjectedFaults] = useState<string[]>(["cyl3_injector"]);
  
  // Chart historical buffer
  const [chartHistory, setChartHistory] = useState<ChartPoint[]>(() =>
    Array.from({ length: 35 }, (_, i) => ({
      t: i,
      rpm: 2412 + (Math.random() - 0.5) * 15,
      rpmPred: 2400,
      egt3: 648 + (i > 15 ? (i - 15) * 1.8 : 0) + (Math.random() - 0.5) * 3,
      egt3Pred: 648 + (Math.random() - 0.5) * 2,
      cht3: 196 + (i > 15 ? (i - 15) * 1.2 : 0) + (Math.random() - 0.5) * 2,
      cht3Pred: 196,
      oilP: 4.8 + (Math.random() - 0.5) * 0.1,
      oilPPred: 5.1,
      vib: 2.4 + (Math.random() - 0.5) * 0.2,
    }))
  );
  
  // Faults, Alerts, Maintenance, Sensors
  const [faults, setFaults] = useState(INITIAL_FAULTS);
  const [activeFaultId, setActiveFaultId] = useState<string | null>(INITIAL_FAULTS[0].id);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(() =>
    INITIAL_MAINTENANCE.map((m) => ({
      ...m,
      spares: m.spares.map((s) => ({
        ...s,
        qtyAvailable: parseInt(s.stock.match(/\d+/)?.[0] || "5", 10),
      })),
      completed: false,
    }))
  );
  
  const [sensors, setSensors] = useState(INITIAL_SENSORS);

  // Apply theme to document body
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("theme-tactical-dark", "theme-gov-light");
      document.documentElement.classList.add(`theme-${theme}`);
      localStorage.setItem("prahari_theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((t: AppTheme) => {
    setThemeState(t);
    playTacticalClick();
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "tactical-dark" ? "gov-light" : "tactical-dark";
      playTacticalClick();
      return next;
    });
  }, []);

  const login = useCallback((profile: OfficerProfile) => {
    const withDate = { ...profile, authenticatedAt: new Date().toISOString() };
    setUser(withDate);
    localStorage.setItem("prahari_user", JSON.stringify(withDate));
    playSuccessChime();
    setToastMessage(`🇮🇳 ACCESS GRANTED: ${profile.rank} ${profile.name} (CLEARANCE L-${profile.clearanceLevel})`);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("prahari_user");
    playTacticalClick();
  }, []);

  // Active Airframe Computed
  const activeAirframe = useMemo(() => {
    const found = fleet.find((a) => a.tail === activeTail);
    return (
      found || {
        tail: "TB-207",
        platform: "TAPAS-BH-201",
        phase: "SURVEILLANCE",
        ehi: 87.4,
        rul: 142,
        openFaults: 3,
        live: true,
        engineHours: 812,
        engine: "DRDO-AD180",
        engineSN: "SN 0143",
      }
    );
  }, [fleet, activeTail]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) playTacticalClick();
      return next;
    });
  }, []);

  const toggleArmMode = useCallback(() => {
    setArmMode((prev) => {
      const next = !prev;
      if (next) {
        playAlertBeep("warning");
        showToast("⚠️ ARM MODE ENGAGED — AUTONOMOUS FADEC OVERRIDE ACTIVE");
      } else {
        playTacticalClick();
        showToast("ℹ️ ARM MODE DISARMED — MANUAL TELEMETRY LOGGING ONLY");
      }
      return next;
    });
  }, [showToast]);

  const toggleStreaming = useCallback(() => {
    setIsStreaming((prev) => {
      playTacticalClick();
      return !prev;
    });
  }, []);

  const navigateToScreen = useCallback((s: Screen, faultId?: string) => {
    playTacticalClick();
    setActiveScreen(s);
    if (faultId) {
      setActiveFaultId(faultId);
    }
  }, []);

  const switchAirframe = useCallback(
    (tail: string) => {
      playTacticalClick();
      setActiveTail(tail);
      const target = fleet.find((f) => f.tail === tail);
      if (target) {
        showToast(`🛰️ SWITCHED TO PLATFORM ${target.platform} · TAIL ${target.tail}`);
        if (target.phase) {
          setMissionPhaseState(target.phase);
        }
      }
    },
    [fleet, showToast]
  );

  const setMissionPhase = useCallback(
    (phaseId: string) => {
      playTacticalClick();
      setMissionPhaseState(phaseId);
      setMissionPhases((prev) =>
        prev.map((p) => ({
          ...p,
          current: p.id === phaseId,
        }))
      );
      showToast(`✈️ MISSION PHASE UPDATED: ${phaseId}`);
    },
    [showToast]
  );

  const injectFault = useCallback(
    (faultType: string) => {
      playAlertBeep("critical");
      setActiveInjectedFaults((prev) => (prev.includes(faultType) ? prev : [...prev, faultType]));
      
      if (faultType === "cyl3_injector") {
        showToast("🚨 INJECTED FAULT: Cylinder 3 Injector Clogging (+45°C EGT Delta)");
      } else if (faultType === "oil_pressure_drop") {
        showToast("🚨 INJECTED FAULT: Oil Pump Seal Leak (−1.4 bar Oil Pressure)");
      } else if (faultType === "vibration_harmonic") {
        showToast("🚨 INJECTED FAULT: Propeller Dynamic Imbalance (+1.8 mm/s Vibration)");
      } else if (faultType === "sensor_drift") {
        showToast("🚨 INJECTED FAULT: CHT-03 Thermocouple Sensor Drift");
        setSensors((prev) =>
          prev.map((s) => (s.id === "CHT-03" ? { ...s, status: "drifting", residual: 18.5 } : s))
        );
      }
    },
    [showToast]
  );

  const clearInjectedFaults = useCallback(() => {
    playSuccessChime();
    setActiveInjectedFaults([]);
    showToast("✅ CLEARED INJECTED FAULTS: Telemetry Restored to Nominal Baseline");
    setSensors((prev) =>
      prev.map((s) => (s.id === "CHT-03" || s.id === "EGT-03" ? { ...s, status: "live", residual: 0.8 } : s))
    );
  }, [showToast]);

  const setFaultStatus = useCallback(
    (faultId: string, status: FaultStatus) => {
      playTacticalClick();
      setFaults((prev) =>
        prev.map((f) => (f.id === faultId ? { ...f, status } : f))
      );
      if (status === "CONFIRMED") {
        playAlertBeep("warning");
        showToast(`📋 FAULT ${faultId} CONFIRMED: Work Order Queued in Maintenance`);
      } else if (status === "FALSE_POSITIVE") {
        playSuccessChime();
        showToast(`🛡️ FAULT ${faultId} MARKED FALSE POSITIVE: Digital Twin Model Feedback Logged`);
      } else if (status === "DEFERRED") {
        showToast(`⏳ FAULT ${faultId} DEFERRED: Threshold Relaxed for Sortie Duration`);
      }
    },
    [showToast]
  );

  const acknowledgeAlert = useCallback((id: string) => {
    playTacticalClick();
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const dismissAlert = useCallback((id: string) => {
    playTacticalClick();
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const acknowledgeAllAlerts = useCallback(() => {
    playSuccessChime();
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    showToast("✓ ALL ALERTS ACKNOWLEDGED");
  }, [showToast]);

  const executeMaintenance = useCallback(
    (id: string) => {
      playSuccessChime();
      setMaintenanceItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              completed: true,
              spares: item.spares.map((sp) => ({
                ...sp,
                qtyAvailable: Math.max(0, sp.qtyAvailable - 1),
                stock: `IN STOCK (×${Math.max(0, sp.qtyAvailable - 1)})`,
              })),
            };
          }
          return item;
        })
      );
      setFleet((prev) =>
        prev.map((a) =>
          a.tail === activeTail
            ? { ...a, ehi: Math.min(100, a.ehi + 4.5), rul: a.rul + 30, openFaults: Math.max(0, a.openFaults - 1) }
            : a
        )
      );
      showToast(`⚙️ WORK ORDER ${id} EXECUTED: Spares deducted & health indices updated!`);
    },
    [activeTail, showToast]
  );

  const calibrateSensor = useCallback(
    (id: string) => {
      playSuccessChime();
      setSensors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "live", residual: 0.1 } : s))
      );
      showToast(`🎯 SENSOR ${id} RECALIBRATED & ZEROED: Residual within 0.1%`);
    },
    [showToast]
  );

  // Live simulation telemetry loop
  useEffect(() => {
    if (!isStreaming) return;
    const intervalMs = Math.max(200, 1500 / streamSpeed);

    const interval = setInterval(() => {
      const hasCyl3Fault = activeInjectedFaults.includes("cyl3_injector");
      const hasOilFault = activeInjectedFaults.includes("oil_pressure_drop");
      const hasVibFault = activeInjectedFaults.includes("vibration_harmonic");

      setTelemetry((prev) => {
        const nextCht: [number, number, number, number] = [
          jitter(prev.cht[0], 0.005),
          jitter(prev.cht[1], 0.005),
          hasCyl3Fault ? jitter(224, 0.015) : jitter(197, 0.005),
          jitter(prev.cht[3], 0.005),
        ];
        const nextEgt: [number, number, number, number] = [
          jitter(prev.egt[0], 0.004),
          jitter(prev.egt[1], 0.004),
          hasCyl3Fault ? jitter(692, 0.012) : jitter(648, 0.004),
          jitter(prev.egt[3], 0.004),
        ];

        return {
          ...prev,
          rpm: jitter(prev.rpm, 0.004),
          torque: jitter(prev.torque, 0.005),
          power: jitter(prev.power, 0.005),
          throttle: jitter(prev.throttle, 0.002),
          fuelFlow: jitter(prev.fuelFlow, 0.008),
          fuelPressure: jitter(prev.fuelPressure, 0.005),
          cht: nextCht,
          egt: nextEgt,
          oilPressure: hasOilFault ? jitter(3.4, 0.01) : jitter(4.8, 0.006),
          oilTemp: hasOilFault ? jitter(118, 0.005) : jitter(104, 0.003),
          coolantTemp: jitter(prev.coolantTemp, 0.004),
          vibrationRMS: hasVibFault ? jitter(4.2, 0.03) : jitter(2.4, 0.02),
          batteryV: jitter(prev.batteryV, 0.002),
          batteryI: jitter(prev.batteryI, 0.01),
          alternatorV: jitter(prev.alternatorV, 0.002),
          alternatorI: jitter(prev.alternatorI, 0.01),
        };
      });

      setChartHistory((prev) => {
        const last = prev[prev.length - 1] || { t: 0, egt3: 648, cht3: 196 };
        const nextPoint: ChartPoint = {
          t: last.t + 1,
          rpm: jitter(2412, 0.008),
          rpmPred: 2400 + (Math.random() - 0.5) * 8,
          egt3: hasCyl3Fault ? last.egt3 * 0.95 + jitter(692, 0.01) * 0.05 : jitter(648, 0.005),
          egt3Pred: 648 + (Math.random() - 0.5) * 2,
          cht3: hasCyl3Fault ? last.cht3 * 0.95 + jitter(224, 0.01) * 0.05 : jitter(196, 0.005),
          cht3Pred: 196,
          oilP: hasOilFault ? jitter(3.4, 0.01) : jitter(4.8, 0.006),
          oilPPred: 5.1,
          vib: hasVibFault ? jitter(4.2, 0.02) : jitter(2.4, 0.02),
        };
        return [...prev.slice(-49), nextPoint];
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, activeInjectedFaults]);

  const value = useMemo(
    () => ({
      activeScreen,
      navigateToScreen,
      theme,
      toggleTheme,
      setTheme,
      user,
      login,
      logout,
      soundOn,
      toggleSound,
      fleet,
      activeAirframe,
      switchAirframe,
      missionPhase,
      missionPhases,
      setMissionPhase,
      armMode,
      toggleArmMode,
      isStreaming,
      streamSpeed,
      toggleStreaming,
      setStreamSpeed,
      telemetry,
      twinPredicted: TWIN_PREDICTED,
      chartHistory,
      activeInjectedFaults,
      injectFault,
      clearInjectedFaults,
      faults,
      activeFaultId,
      setActiveFaultId,
      setFaultStatus,
      alerts,
      acknowledgeAlert,
      dismissAlert,
      acknowledgeAllAlerts,
      maintenanceItems,
      executeMaintenance,
      sensors,
      calibrateSensor,
      toastMessage,
      showToast,
    }),
    [
      activeScreen,
      navigateToScreen,
      theme,
      toggleTheme,
      setTheme,
      user,
      login,
      logout,
      soundOn,
      toggleSound,
      fleet,
      activeAirframe,
      switchAirframe,
      missionPhase,
      missionPhases,
      setMissionPhase,
      armMode,
      toggleArmMode,
      isStreaming,
      streamSpeed,
      toggleStreaming,
      setStreamSpeed,
      telemetry,
      chartHistory,
      activeInjectedFaults,
      injectFault,
      clearInjectedFaults,
      faults,
      activeFaultId,
      setFaultStatus,
      alerts,
      acknowledgeAlert,
      dismissAlert,
      acknowledgeAllAlerts,
      maintenanceItems,
      executeMaintenance,
      sensors,
      calibrateSensor,
      toastMessage,
      showToast,
    ]
  );

  return <TwinContext.Provider value={value}>{children}</TwinContext.Provider>;
};

export const useTwin = () => {
  const context = useContext(TwinContext);
  if (!context) {
    throw new Error("useTwin must be used within a TwinProvider");
  }
  return context;
};
