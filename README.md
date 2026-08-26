# PRAHARI-DT 🛡️
### Digital Twin Telemetry & Predictive Diagnostics for UAV Propulsion Systems
**Aeronautical Development Establishment (DRDO) // Ministry of Defence**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Classification](https://img.shields.io/badge/Security-RESTRICTED-red.svg)](#)

---

## 🇮🇳 Overview

**PRAHARI-DT** is an advanced real-time Digital Twin telemetry, diagnostic, prognostic, and mission intelligence platform engineered for unmanned aerial defense platforms (**TAPAS-BH-201** powered by the **DRDO-AD180** aero-diesel engine).

By executing physics-informed mathematical models in parallel with real-time 20 Hz airborne telemetry, PRAHARI-DT isolates anomalous degradation trends, explains fault root-causes using Explainable AI (SHAP XAI), computes Remaining Useful Life (RUL), and generates actionable maintenance work orders before in-flight catastrophic failures occur.

---

## 🚀 Key Modules & Capabilities

1. **Classified Defense Authentication Gateway**:
   - Official Ministry of Defence & DRDO clearance protocols (Level 1 Technician, Level 2 Propulsion Officer, Level 3 Squadron Commander).
   - Dual authentication (Service ID + CAPTCHA or Hardware Smart Card PKI token).
2. **Gov Dual-Theme System (`☀️ GOV LIGHT` ↔ `🌙 TACTICAL DARK`)**:
   - Official Ministry of Defence clean daylight portal styling.
   - Low-glare C2 nocturnal command room tactical dark mode.
3. **Live Digital Twin Delta (S1)**:
   - Interactive 4-cylinder engine cutaway with live heat mapping and cylinder isolation.
   - Real-time measured vs. twin-predicted residual bands.
4. **Health & Subsystem Diagnostics (S2)**:
   - Composite Engine Health Index (EHI) radial gauge and degradation waterfall decomposition.
   - Per-cylinder cross-comparison matrix.
5. **Fault Centre & Explainable AI (S3)**:
   - Machine learning anomaly detection with SHAP feature importance bars.
   - Operator triage workflow (**Confirm**, **False Positive**, **Defer**).
6. **Prognostics & Remaining Useful Life (S4)**:
   - Component-level RUL countdowns under 3 operational stress profiles (*Eco Patrol*, *Nominal ISR*, *High Stress Dash*).
   - Propulsion abort risk probability meter.
7. **What-If Mission Simulation (S5)**:
   - Real-time parameter tuning (Altitude, Outside Air Temp, Throttle, Payload mass) with instant thermal envelope checking and mission profile injection.
8. **Mission Replay & Scrubber (S6)**:
   - 7.5-hour sortie flight recording with variable playback speeds and anomaly jump bookmarks.
9. **Maintenance Advisory & Warehouse Spares (S7)**:
   - Automated work-order execution that deducts spare parts inventory and restores component RUL.
10. **Fleet Overview & Squadron Radar (S8)**:
    - Multi-airframe switching with "Sickest First" health sorting and fleet wear scatter analysis.
11. **System & Sensor Integrity (S9)**:
    - CAN Bus / FADEC link health and interactive sensor recalibration/zeroing.
12. **Post-Mission Propulsion Report (S10)**:
    - Official briefing report with digital certification stamp, browser PDF export (`window.print()`), and Fleet DB commit action.
13. **In-Flight Fault Injection Tool (`F` key)**:
    - On-demand anomaly triggers (Injector clogging, oil pressure loss, vibration harmonic, sensor drift).

---

## ⌨️ Global Hotkeys

| Key | Action |
|---|---|
| `1` – `9` | Jump directly to Screens 1 through 9 |
| `0` | Jump to Screen 10 (System & Sensor Integrity) |
| `Space` | Pause / Stream real-time telemetry |
| `F` | Toggle In-Flight Fault Injection Console |
| `M` | Mute / Unmute tactical audio feedback |
| `Esc` | Close modals and drawers |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Data Visualization**: Recharts (Dynamic AreaCharts, LineCharts, BarCharts, ScatterCharts)
- **Audio Engine**: Synthesized Web Audio API Oscillators
- **State Management**: Centralized React Context (`TwinProvider`) with `localStorage` persistence

---

## 💻 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/ABHINAY2121S/Prahari.git
cd Prahari
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:8443` (or `http://localhost:5173`) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 📄 License
Restricted — For Evaluation / Educational Demonstrations. All defense trademarks belong to their respective organizations.
