export const MISSION = {
  id: "ISR-2026-0418",
  type: "Maritime ISR",
  elapsed: "07:42:19",
  payload: "EO/IR + SAR",
  phase: "SURVEILLANCE",
  phaseIndex: 6,
  platform: "TAPAS-BH-201",
  tail: "TB-207",
  engine: "DRDO-AD180",
  engineSN: "SN 0143",
  altitude: 5180,
  airspeed: 142,
  lat: 19.07,
  lon: 72.87,
  oat: -8,
  ambientPressure: 540,
  humidity: 38,
};

export const PHASES = [
  { id: "PARKED", elapsed: "0:32" },
  { id: "PRE-FLIGHT", elapsed: "0:18" },
  { id: "TAXI", elapsed: "0:08" },
  { id: "TAKEOFF", elapsed: "0:04" },
  { id: "CLIMB", elapsed: "0:42" },
  { id: "CRUISE", elapsed: "1:15" },
  { id: "SURVEILLANCE", elapsed: "3:41", current: true, progress: 0.72 },
  { id: "RETURN", planned: "1:30" },
  { id: "DESCENT", planned: "0:25" },
  { id: "LANDING", planned: "0:06" },
  { id: "POST-LANDING", planned: "0:08" },
  { id: "SHUTDOWN", planned: "0:05" },
  { id: "HANGAR", planned: "" },
];

export const TELEMETRY_BASE = {
  rpm: 2412,
  torque: 478,
  power: 134,
  throttle: 88,
  fuelFlow: 31.4,
  fuelPressure: 4.2,
  cht: [197, 203, 221, 196],
  egt: [648, 655, 689, 641],
  oilPressure: 4.8,
  oilTemp: 104,
  oilLevel: 82,
  coolantTemp: 91,
  intakePressure: 1.9,
  intakeTemp: 58,
  vibrationRMS: 2.4,
  vibrationFreq: 147,
  injTiming: -12.5,
  injQuantity: 28,
  batteryV: 27.8,
  batteryI: 42,
  alternatorV: 28.1,
  alternatorI: 68,
};

export const TWIN_PREDICTED = {
  rpm: 2398,
  torque: 471,
  power: 132,
  fuelFlow: 30.8,
  cht: [194, 198, 196, 194],
  egt: [643, 648, 648, 638],
  oilPressure: 5.1,
  coolantTemp: 89,
  vibrationRMS: 1.9,
};

export const HEALTH = {
  ehi: 87.4,
  ehiTrend: -0.8,
  anomalyScore: 0.34,
  anomalyThreshold: 0.45,
  rulHours: 142,
  rulCycles: 96,
  rulMissionSufficient: true,
  modelConfidence: 91,
  syncLatency: 142,
  ingestRate: "20 Hz",
  lastRetrain: "2026-04-17 06:00Z",
  subsystems: {
    combustion: { index: 81, trend: -1.2, params: ["EGT Cyl 3 +41°C", "Inj Qty Cyl 3 +2mm³", "Misfire rate 0.3%"] },
    thermal: { index: 85, trend: -0.6, params: ["CHT Cyl 3 +25°C vs model", "Coolant +2°C", "EGT spread 48°C"] },
    lubrication: { index: 92, trend: -0.3, params: ["Oil Pressure −0.3 bar", "Oil Temp +5°C", "Oil Level 82%"] },
    fuel: { index: 94, trend: 0.1, params: ["Fuel Flow nominal", "Fuel Pressure nominal", "Injector qty within spec"] },
    mechanical: { index: 88, trend: -0.5, params: ["Vibration +0.5mm/s vs model", "Dominant freq 147Hz", "Bearing temp nominal"] },
    electrical: { index: 96, trend: 0.0, params: ["Battery 27.8V nominal", "Alternator nominal", "No faults"] },
    sensorIntegrity: { index: 97, trend: 0.0, params: ["All sensors live", "No drift detected", "FADEC link OK"] },
  },
};

export const FAULT_PROBABILITIES = [
  { name: "Injector Abnormality", prob: 62, state: "warning" },
  { name: "Combustion Instability", prob: 31, state: "caution" },
  { name: "Cooling Degradation", prob: 18, state: "caution" },
];

export const FAULTS = [
  {
    id: "F-0043",
    time: "07:38:12",
    subsystem: "COMBUSTION",
    type: "Injector Abnormality",
    severity: "warning",
    confidence: 87,
    phase: "SURVEILLANCE",
    status: "OPEN",
    features: [
      { name: "EGT Cyl 3 Residual", value: 0.82, positive: true },
      { name: "Fuel Inj Qty Cyl 3", value: 0.71, positive: true },
      { name: "CHT Cyl 3 Residual", value: 0.65, positive: true },
      { name: "EGT Spread", value: 0.58, positive: true },
      { name: "RPM Stability", value: -0.22, positive: false },
      { name: "Fuel Pressure", value: -0.14, positive: false },
    ],
    rationale: "EGT on cylinder 3 is 41°C above twin prediction while fuel flow is nominal — consistent with partial injector clogging.",
    algorithm: "Random Forest Classifier",
    trainingWindow: "180 days",
    precision: 0.89,
    recall: 0.84,
  },
  {
    id: "F-0042",
    time: "07:21:04",
    subsystem: "THERMAL",
    type: "Overheating Trend",
    severity: "caution",
    confidence: 73,
    phase: "SURVEILLANCE",
    status: "ACKNOWLEDGED",
    features: [
      { name: "CHT Cyl 3 Residual", value: 0.65, positive: true },
      { name: "EGT Cyl 3 Residual", value: 0.58, positive: true },
      { name: "Coolant Temp Residual", value: 0.31, positive: true },
      { name: "Throttle Setting", value: 0.22, positive: true },
      { name: "Ambient Temp", value: -0.18, positive: false },
      { name: "Oil Temp", value: 0.14, positive: true },
    ],
    rationale: "CHT on cylinder 3 has shown a sustained +0.8°C/min increase over 22 minutes, exceeding phase-envelope upper bound.",
    algorithm: "LSTM Anomaly Detector",
    trainingWindow: "90 days",
    precision: 0.81,
    recall: 0.78,
  },
  {
    id: "F-0041",
    time: "06:55:30",
    subsystem: "VIBRATION",
    type: "Abnormal Vibration Pattern",
    severity: "caution",
    confidence: 68,
    phase: "SURVEILLANCE",
    status: "ACKNOWLEDGED",
    features: [
      { name: "Vibration RMS Residual", value: 0.54, positive: true },
      { name: "Dominant Freq Shift", value: 0.49, positive: true },
      { name: "RPM", value: -0.12, positive: false },
      { name: "Engine Load", value: 0.38, positive: true },
      { name: "Bearing Temp", value: 0.18, positive: true },
      { name: "Phase Envelope Deviation", value: 0.22, positive: true },
    ],
    rationale: "Vibration RMS is +0.5 mm/s above twin prediction at current RPM. Dominant frequency shifted 6 Hz — consistent with minor propeller imbalance.",
    algorithm: "FFT + SVM Classifier",
    trainingWindow: "60 days",
    precision: 0.76,
    recall: 0.71,
  },
  {
    id: "F-0040",
    time: "05:12:18",
    subsystem: "LUBRICATION",
    type: "Lubrication Issue",
    severity: "caution",
    confidence: 61,
    phase: "CRUISE",
    status: "CLOSED",
    features: [
      { name: "Oil Pressure Residual", value: 0.47, positive: true },
      { name: "Oil Temp Residual", value: 0.39, positive: true },
      { name: "Oil Level", value: 0.28, positive: true },
      { name: "Engine Hours", value: 0.21, positive: true },
      { name: "Ambient Pressure", value: -0.15, positive: false },
      { name: "Power Setting", value: 0.18, positive: true },
    ],
    rationale: "Oil pressure 0.3 bar below model prediction at current power setting and ambient conditions. Possible minor seal weep.",
    algorithm: "Gradient Boost Regressor",
    trainingWindow: "120 days",
    precision: 0.79,
    recall: 0.74,
  },
];

export const ALERTS = [
  {
    id: "A-001",
    severity: "warning",
    time: "07:38:12",
    subsystem: "COMBUSTION",
    message: "Injector clogging detected on Cylinder 3 — EGT +41°C above model prediction",
    confidence: 87,
    acknowledged: false,
  },
  {
    id: "A-002",
    severity: "caution",
    time: "07:21:04",
    subsystem: "THERMAL",
    message: "CHT Cylinder 3 sustained upward trend — exceeds phase envelope upper bound",
    confidence: 73,
    acknowledged: false,
  },
  {
    id: "A-003",
    severity: "caution",
    time: "07:05:51",
    subsystem: "VIBRATION",
    message: "Vibration RMS +0.5 mm/s above twin baseline — dominant freq shift detected",
    confidence: 68,
    acknowledged: true,
  },
  {
    id: "A-004",
    severity: "advisory",
    time: "06:50:00",
    subsystem: "PROGNOSTICS",
    message: "Engine Health Index degradation rate 0.8 pts/hr — projected EHI at sortie end: 81.2",
    confidence: 91,
    acknowledged: true,
  },
  {
    id: "A-005",
    severity: "advisory",
    time: "06:30:12",
    subsystem: "LUBRICATION",
    message: "Oil pressure trending 0.3 bar below model — monitor over next 30 min",
    confidence: 61,
    acknowledged: true,
  },
];

export const COMPONENTS_RUL = [
  { name: "Fuel Injector #3", hoursRemaining: 38, cyclesRemaining: 24, degradationRate: 2.1, confidence: 87, status: "warning" },
  { name: "Piston Rings", hoursRemaining: 312, cyclesRemaining: 210, degradationRate: 0.3, confidence: 92, status: "nominal" },
  { name: "Turbocharger", hoursRemaining: 520, cyclesRemaining: 350, degradationRate: 0.2, confidence: 88, status: "nominal" },
  { name: "Oil Pump", hoursRemaining: 180, cyclesRemaining: 122, degradationRate: 0.5, confidence: 85, status: "nominal" },
  { name: "Alternator", hoursRemaining: 640, cyclesRemaining: 430, degradationRate: 0.1, confidence: 94, status: "nominal" },
  { name: "Main Bearings", hoursRemaining: 890, cyclesRemaining: 600, degradationRate: 0.1, confidence: 90, status: "nominal" },
];

export const FLEET_AIRCRAFT = [
  { tail: "TB-201", platform: "TAPAS-BH-201", phase: "SURVEILLANCE", ehi: 87.4, rul: 142, openFaults: 3, live: true, engineHours: 1284 },
  { tail: "TB-203", platform: "TAPAS-BH-201", phase: "MAINTENANCE", ehi: 71.2, rul: 58, openFaults: 7, live: false, engineHours: 2104 },
  { tail: "TB-207", platform: "TAPAS-BH-201", phase: "HANGAR", ehi: 94.8, rul: 298, openFaults: 1, live: false, engineHours: 812 },
  { tail: "TB-209", platform: "TAPAS-BH-201", phase: "CRUISE", ehi: 82.1, rul: 108, openFaults: 4, live: true, engineHours: 1671 },
  { tail: "TB-211", platform: "TAPAS-BH-201", phase: "PRE-FLIGHT", ehi: 91.3, rul: 224, openFaults: 2, live: false, engineHours: 994 },
  { tail: "TB-215", platform: "TAPAS-BH-201", phase: "GROUNDED", ehi: 58.7, rul: 22, openFaults: 11, live: false, engineHours: 3218 },
];

export const MAINTENANCE_ITEMS = [
  {
    id: "M-047",
    action: "Replace fuel injector on cylinder 3",
    component: "Fuel Injector #3",
    urgency: "BEFORE NEXT SORTIE",
    downtime: "4 hrs",
    spares: [{ part: "Fuel Injector Assy", pn: "DRDO-FI-003", stock: "IN STOCK (×6)" }],
    sourcefault: "F-0043",
    confidence: 87,
  },
  {
    id: "M-046",
    action: "Inspect cylinder 3 combustion chamber for carbon deposits",
    component: "Combustion Chamber — Cyl 3",
    urgency: "WITHIN 25 HRS",
    downtime: "6 hrs",
    spares: [{ part: "Gasket Set", pn: "DRDO-GS-012", stock: "IN STOCK (×3)" }],
    sourceault: "F-0043",
    confidence: 81,
  },
  {
    id: "M-045",
    action: "Top up engine oil and inspect for seal weep at main gallery",
    component: "Lubrication System",
    urgency: "WITHIN 25 HRS",
    downtime: "1.5 hrs",
    spares: [{ part: "Engine Oil MIL-PRF-7808", pn: "DRDO-OIL-01", stock: "IN STOCK (×20L)" }],
    sourcealt: "F-0040",
    confidence: 73,
  },
  {
    id: "M-044",
    action: "Propeller dynamic balance check and re-torque attachment hardware",
    component: "Propeller Assembly",
    urgency: "SCHEDULED",
    downtime: "2 hrs",
    spares: [{ part: "Lock Tabs", pn: "DRDO-LT-009", stock: "IN STOCK (×12)" }],
    sourcefault: "F-0041",
    confidence: 68,
  },
];

export const SENSORS = [
  { id: "RPM-01", name: "Engine RPM Sensor", status: "live", lastValid: "NOW", residual: 0.6 },
  { id: "CHT-01", name: "CHT Cyl 1", status: "live", lastValid: "NOW", residual: 1.2 },
  { id: "CHT-02", name: "CHT Cyl 2", status: "live", lastValid: "NOW", residual: 2.1 },
  { id: "CHT-03", name: "CHT Cyl 3", status: "drifting", lastValid: "NOW", residual: 11.4 },
  { id: "CHT-04", name: "CHT Cyl 4", status: "live", lastValid: "NOW", residual: 0.9 },
  { id: "EGT-01", name: "EGT Cyl 1", status: "live", lastValid: "NOW", residual: 1.8 },
  { id: "EGT-02", name: "EGT Cyl 2", status: "live", lastValid: "NOW", residual: 2.4 },
  { id: "EGT-03", name: "EGT Cyl 3", status: "drifting", lastValid: "NOW", residual: 41.2 },
  { id: "EGT-04", name: "EGT Cyl 4", status: "live", lastValid: "NOW", residual: 1.1 },
  { id: "OIL-P", name: "Oil Pressure", status: "live", lastValid: "NOW", residual: 3.1 },
  { id: "OIL-T", name: "Oil Temperature", status: "live", lastValid: "NOW", residual: 1.4 },
  { id: "FUEL-F", name: "Fuel Flow Meter", status: "live", lastValid: "NOW", residual: 0.8 },
  { id: "FUEL-P", name: "Fuel Pressure", status: "live", lastValid: "NOW", residual: 1.2 },
  { id: "VIB-01", name: "Vibration Sensor", status: "live", lastValid: "NOW", residual: 4.2 },
  { id: "BAT-V", name: "Battery Voltage", status: "live", lastValid: "NOW", residual: 0.3 },
  { id: "ALT-V", name: "Alternator Voltage", status: "live", lastValid: "NOW", residual: 0.4 },
];

export function generateSparkline(base: number, count = 20, variance = 0.03): number[] {
  const data: number[] = [];
  let val = base;
  for (let i = 0; i < count; i++) {
    val = val + (Math.random() - 0.5) * base * variance;
    data.push(val);
  }
  return data;
}

export function jitter(base: number, pct = 0.01): number {
  return base + (Math.random() - 0.5) * base * pct;
}
