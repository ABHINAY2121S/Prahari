# PRAHARI-DT — Figma Master Prompt
### AI-Enabled Real-Time Digital Twin for Aero-Piston Engines in MALE UAVs
**Reference platform:** TAPAS-BH-201 + DRDO 180 HP aero-diesel engine
**Persona in view:** DRDO Ground Control Station officer (propulsion / mission-reliability desk)

---

## HOW TO USE THIS FILE

| Section | Use it for |
|---|---|
| **PART 1 — Master Prompt** | Paste whole into Figma Make / Figma AI / v0 / Claude to generate the full product. Best single-shot result. |
| **PART 2 — Screen Prompts** | Paste one at a time if the tool truncates or you want tighter control per screen. |
| **PART 3 — Data Map** | The exact field-to-widget mapping. Use when a screen looks empty or generic. |
| **PART 4 — Guardrails** | Paste at the end of any prompt to kill generic SaaS-dashboard output. |

> Codename options if you don't want "PRAHARI": **CHAKSHU-DT**, **DRISHTI-PROP**, **VAJRA-TWIN**. Keep one and use it consistently on every frame — it makes the deck look like a product, not a college project.

---

# PART 1 — THE MASTER PROMPT

Copy everything between the lines.

---

You are a senior product designer specialising in defence-grade mission-critical control room software. Design a complete, high-fidelity, production-ready UI system in Figma for **PRAHARI-DT**, an AI-enabled real-time Digital Twin platform that monitors, predicts and simulates the health of aero-piston engines fitted to MALE (Medium Altitude Long Endurance) UAVs.

## 1. WHO IS LOOKING AT THIS SCREEN

The primary user is a **DRDO Ground Control Station officer at the propulsion & mission-reliability desk**. He is watching a 24-hour ISR sortie on a 1920×1080 console, 1.5 m away, in a dim control room, alongside a flight-control operator and a payload operator. He is not reading — he is *scanning*. He must answer four questions in under three seconds:

1. Is the engine going to survive this mission?
2. If not, how long do I have?
3. What exactly is degrading, and why does the AI think so?
4. What do I tell the crew and the maintenance bay?

Secondary users: propulsion engineer (post-flight forensics), maintenance NCO (work orders), fleet reliability officer (multi-aircraft trends).

**Design consequence:** every screen must lead with a verdict, then the evidence, then the raw numbers. Never make him assemble the verdict himself from gauges.

## 2. THE ONE IDEA THAT MAKES THIS A DIGITAL TWIN, NOT A DASHBOARD

The signature element of this entire product is the **TWIN DELTA**: for every critical parameter, the physics-based virtual engine predicts an expected value, and the real engine reports a measured value. The gap between them — the residual — is the earliest evidence of degradation, long before any threshold is crossed.

Render this everywhere as a paired visual language:
- A **ghost line / hollow marker** = twin-predicted value
- A **solid line / filled marker** = live measured value
- A **filled residual band** between them, coloured by how far outside the model's confidence envelope the drift has gone

The hero of the primary screen is a **side-by-side split: PHYSICAL ENGINE vs VIRTUAL ENGINE**, with a live-syncing "TWIN SYNC" indicator between them showing sync latency in ms, model confidence %, and the current residual magnitude. If a judge looks at only one frame of this deck, this is the frame that must explain the whole project.

## 3. VISUAL DIRECTION

Not a consumer SaaS dashboard. Not a neon "cyberpunk cockpit". The reference world is **instrumented test-cell telemetry**: aviation ground-support equipment, engine test-rig recorders, and Indian defence documentation. Dense, calm, instrument-like, unemotional. Colour appears only when it carries meaning.

**Palette (use exactly these tokens):**

| Token | Hex | Use |
|---|---|---|
| `bg/base` | `#080B10` | App background |
| `bg/panel` | `#101620` | Cards, panels |
| `bg/raised` | `#18202C` | Nested blocks, table headers |
| `stroke/hairline` | `#243040` | 1px dividers, panel borders |
| `text/primary` | `#E8EEF6` | Values, headings |
| `text/secondary` | `#8CA0B8` | Labels, units |
| `text/muted` | `#546678` | Metadata, timestamps |
| `state/nominal` | `#00C08B` | Healthy |
| `state/advisory` | `#3DA9FC` | Informational / AI suggestion |
| `state/caution` | `#F5B335` | Trend deviation, watch item |
| `state/warning` | `#FF7A2F` | Confirmed degradation |
| `state/critical` | `#FF3B4E` | Mission-affecting fault |
| `twin/predicted` | `#7B61FF` | Virtual engine model output |
| `accent/india` | `#FF9933` | Classification banner accent, primary CTA only |

Never use green and red as the only differentiator — every state also carries a distinct icon shape and a text label, so it survives colour-blindness and a projector.

**Typography:**
- Display / headings: **Barlow Semi Condensed** (600) — condensed, technical, fits long parameter names in narrow columns
- Body / labels: **Inter** (400/500)
- All numerals, telemetry values, IDs, timestamps: **IBM Plex Mono** (500), tabular figures on, so digits don't jitter as values update

Type scale: 40 / 28 / 20 / 16 / 14 / 12 / 11. Primary telemetry values 28–40px. Labels 11px uppercase, 0.08em letter-spacing. Units always 60% size of the value, in `text/secondary`, never the same weight as the number.

**Layout:** 12-column grid, 1920×1080 artboard, 32px outer margin, 20px gutter, 8px base spacing unit. Border radius 6px on panels, 4px on chips, 0px on data tables. Elevation is expressed by background lightness and hairline strokes only — no drop shadows, no glassmorphism, no gradients except the residual band fills.

**Motion:** restrained. Values cross-fade over 200ms rather than counting up. The twin-sync pulse is the only continuous animation on screen — a 1Hz breathing dot. Critical alerts flash twice then hold steady; they never blink forever, because a permanently blinking screen is ignored within a minute.

## 4. GLOBAL FRAME — PRESENT ON EVERY SCREEN

**A. Classification strip (top, 24px, full width)**
Left: `RESTRICTED — DRDO / ADE` on `accent/india` hairline. Centre: `PRAHARI-DT v1.0`. Right: UTC and IST clocks in mono, plus `SESSION: OFFR-ID`.

**B. Command bar (72px)**
- Platform selector (dropdown, left): flag glyph + `TAPAS-BH-201` + `TAIL: TB-207` + engine `DRDO-AD180 / SN 0143`. Dropdown lists the benchmark platforms so the framework reads as platform-agnostic: `MQ-1C Gray Eagle`, `MQ-1 Predator`, `IAI Heron`, `Hermes 900`, `Orion/Inokhodets`. Mark TAPAS as `PRIMARY`, the rest as `BENCHMARK MODEL`.
- Mission block: `MISSION ID: ISR-2026-0418` · `TYPE: Maritime ISR` · `T+ 07:42:19` · `PAYLOAD: EO/IR + SAR`
- Right cluster of small status pills, each with icon + label + value:
  `LINK: SATCOM 98%` · `TELEMETRY: 20 Hz` · `TWIN SYNC: 142 ms` · `DATA AUTH: VERIFIED` · `EDGE: ONBOARD` · `ARM/DISARM` toggle for advisory mode

**C. Left navigation rail (72px collapsed, 232px expanded)**
Icon + label, in this order, with a live badge showing open item count:
`Fleet` · `Live Twin` · `Health` · `Faults` · `Prognostics` · `Simulation` · `Replay` · `Maintenance` · `Reports` · `System Integrity`

**D. Mission phase strip (56px, directly under command bar, full width)**
A horizontal 13-step state machine, always visible, because every threshold and every model in this system is phase-dependent:
`PARKED → PRE-FLIGHT → TAXI → TAKEOFF → CLIMB → CRUISE → SURVEILLANCE → RETURN → DESCENT → LANDING → POST-LANDING → SHUTDOWN → HANGAR`
Completed phases filled and dimmed with elapsed time beneath; current phase filled in `state/nominal` with a progress fill and elapsed timer; future phases hairline outline with planned duration. Under the current phase, a one-line "phase envelope" readout: `EXPECTED: 2400±60 RPM · 92±6% LOAD · CHT 185–205°C`.

**E. Alert dock (bottom, 88px, full width)**
Newest-first horizontal stream of alert cards. Each card: severity glyph, timestamp (mono), subsystem, one-line plain-language statement, confidence %, and two buttons — `ACKNOWLEDGE` and `INSPECT`. Acknowledged alerts drop opacity and move right. Show a counter: `3 CRITICAL · 5 WARNING · 12 CAUTION`.

## 5. THE THREE-TIER DATA LANGUAGE

Every value on screen belongs to exactly one of three tiers, and the tier is visually encoded so the officer always knows whether he is looking at a fact, a condition, or an inference. Apply this consistently — it is the intellectual spine of the design.

| Tier | What it is | Visual encoding |
|---|---|---|
| **① RAW** — sensor/ECU truth | RPM, torque, power, throttle, fuel flow, fuel pressure, CHT, EGT, oil pressure/temp/level, intake pressure/temp, coolant temp, vibration RMS & frequency, injection timing & quantity, battery V/I, alternator V/I | Solid mono numerals, square-cornered tiles, hairline border, no fill. A tiny sensor-ID tag in the corner. |
| **② CONTEXT** — what the aircraft and sky are doing | Altitude, airspeed, ground speed, vertical speed, lat/lon, heading, pitch/roll/yaw, OAT, ambient pressure, humidity, mission phase, mission type, payload, planned altitude/RPM/throttle, waypoint | Slightly recessed `bg/raised` tiles, italic label, always paired with the raw value it modifies. |
| **③ INTELLIGENCE** — what the twin computed | Engine Health Index, anomaly score, fault probability, degradation rate, estimated RUL, model confidence, risk score, maintenance recommendation | Rounded 6px cards with a 2px left accent bar in `twin/predicted`, a `MODEL` chip naming the algorithm, and a mandatory confidence bar. Never shown without confidence. |

Include a small persistent legend in the bottom-left of the left rail: three swatches labelled `RAW · CONTEXT · INFERRED`. Judges who don't know the domain will understand the whole product from this legend alone.

## 6. SCREENS TO DESIGN (each a separate 1920×1080 frame)

### S1 — LIVE TWIN (primary screen, design this most carefully)
Three-column split.
- **Left (3 cols) — PHYSICAL:** vertical stack of raw telemetry tiles grouped by subsystem: Rotational (RPM, torque, power, throttle), Thermal (CHT ×4 cylinders, EGT ×4, coolant, oil temp), Fluid (oil pressure, oil level, fuel flow, fuel pressure), Mechanical (vibration RMS, dominant frequency), Electrical (battery V/I, alternator V/I), Combustion (injection timing, injection quantity). Each tile: label, live mono value, unit, 40px sparkline of the last 5 minutes, and a hairline range bar showing where the value sits inside its phase envelope.
- **Centre (6 cols) — THE TWIN:** a schematic cutaway of the 4-cylinder aero-diesel, drawn as clean vector line art in `stroke/hairline`, with each subsystem region tintable by health state. Cylinders individually shaded by their CHT/EGT deviation. Below it, the hero chart: **Measured vs Twin-Predicted**, a 3-parameter overlay (selectable) with the residual band filled, and a `RESIDUAL: +4.2σ` readout. Below that, the `TWIN SYNC` bar: sync latency, model confidence, ingestion rate, last model retrain timestamp.
- **Right (3 cols) — INTELLIGENCE:** the four verdict cards, stacked: **ENGINE HEALTH INDEX** (large radial, 0–100, with a 90-minute trend arrow and a "loses 0.8 pts/hr at current load" line), **ANOMALY SCORE** (0–1 with live threshold line), **FAULT PROBABILITY** (top 3 candidate faults with % bars), **REMAINING USEFUL LIFE** (hours + flight cycles, with a confidence interval band and "sufficient for this mission: YES/NO" verdict chip).

### S2 — HEALTH & SUBSYSTEM DIAGNOSTICS
Break the composite EHI into its contributing subsystem indices — Combustion, Thermal, Lubrication, Fuel, Mechanical/Vibration, Electrical, Sensor Integrity — each as a horizontal bar with current value, 30-day trend sparkline, and the three raw parameters driving it. Include a per-cylinder comparison matrix (CHT, EGT, injection quantity, misfire count per cylinder) — a heat-tinted 4×4 table is the fastest way to spot one bad cylinder. Add an EHI waterfall showing exactly which subsystem cost how many points from 100.

### S3 — FAULT CENTRE (detection + explainability)
Left: filterable fault register, columns `TIME · SUBSYSTEM · FAULT TYPE · SEVERITY · CONFIDENCE · PHASE · STATUS`. The eight fault classes required: **misfire, injector abnormality, cooling degradation, lubrication issue, sensor drift/failure, combustion instability, overheating trend, abnormal vibration pattern**.
Right: the **EXPLAINABILITY panel** for the selected fault — this is what separates you from every other team. Show: (a) horizontal contribution bars for the top 6 features that drove the classification, signed and ranked; (b) the evidence chart with the anomalous window shaded; (c) the physics rationale in one plain sentence, e.g. *"EGT on cylinder 3 is 41°C above twin prediction while fuel flow is nominal — consistent with partial injector clogging."*; (d) model card: algorithm name, training window, precision/recall, confidence; (e) the operator's disposition controls — `CONFIRM FAULT` / `MARK FALSE POSITIVE` / `DEFER`, because a labelled false positive feeds retraining and that closes the AI loop visibly.

### S4 — PROGNOSTICS (RUL & degradation)
Full-width RUL projection chart: historical health, present moment marker, and forward projection as a widening confidence cone, with three mission-load scenarios (light ISR / nominal / high-load) as separate cones. Horizontal threshold lines for `MAINTENANCE DUE`, `MISSION-LIMITING`, `NO-DISPATCH`. Left panel: per-component RUL table (piston rings, injectors, turbo, oil pump, alternator, bearings) each with hours remaining, cycles remaining, degradation rate, and confidence. Right panel: **Mission Reliability Score** — probability of completing the current mission profile without a propulsion-related abort, with the top three contributing risks listed.

### S5 — SIMULATION / WHAT-IF
Left: a parameter console the officer manipulates — altitude (0–7,500 m), OAT (−20 to +50 °C), humidity, throttle setting, payload mass, mission duration, and four preset buttons: `HIGH ALTITUDE`, `ENDURANCE 24H`, `HOT & HIGH`, `RAPID THROTTLE TRANSIENT`. Right: the twin's predicted response — CHT/EGT rise curves, fuel burn, power available vs required, projected EHI at mission end, projected RUL consumed, and a large verdict banner: `MISSION FEASIBLE — 94% CONFIDENCE` or `NOT RECOMMENDED — CHT EXCEEDS LIMIT AT T+16:20`. Include a comparison mode showing baseline vs simulated side by side.

### S6 — MISSION REPLAY
A full-width scrubbable timeline of a completed sortie: phase bands along the top, event markers (fault, alert, anomaly, waypoint, throttle transient) pinned to the track, and transport controls with 1× / 4× / 16× / 64× speeds and frame-step. Above it, a synchronised triple view: the engine schematic at that instant, a multi-parameter strip chart with a playhead, and a small map with the flight track and the aircraft's position at the playhead. Add a `JUMP TO ANOMALY` chip row so the engineer never scrubs blindly.

### S7 — MAINTENANCE ADVISORY
AI-generated, prioritised work items. Each card: recommended action, target component, urgency (`BEFORE NEXT SORTIE` / `WITHIN 25 HRS` / `SCHEDULED`), estimated downtime, spares required with stock status, the evidence trail linking back to the fault that generated it, and `RAISE WORK ORDER` / `SCHEDULE` / `DISMISS WITH REASON` actions. Include an engine logbook timeline: engine hours, cycles, installation date, past faults, past component replacements.

### S8 — FLEET OVERVIEW
Grid of aircraft cards, one per airframe, each showing tail number, platform, current phase, EHI ring, RUL hours, open fault count, and a live/idle indicator. Sortable by health ascending — the sick aircraft rises to the top. Add a fleet-level strip: total available airframes, aircraft grounded by propulsion, fleet mean EHI, and a comparative EHI-vs-engine-hours scatter that identifies outlier engines.

### S9 — SYSTEM & DATA INTEGRITY
Because a digital twin is only as trustworthy as its inputs. Show CAN bus / SocketCAN frame rate and error counters, per-sensor status (live / drifting / stale / failed) with last-valid timestamps, ECU/FADEC link state, telemetry packet loss and latency histogram, edge-vs-cloud compute split, model version and last retrain, and data authenticity/signature verification. Include a `SENSOR DRIFT` detector view comparing each sensor against the twin's expected value — sensor faults and engine faults look identical until you separate them here, and showing that you know this will land with technical judges.

### S10 — POST-MISSION REPORT
A printable A4-proportioned layout: mission header, phase-wise engine performance summary table, health at start vs end, faults raised and dispositions, RUL consumed this sortie, exceedances log, maintenance actions generated, and a signature block for the propulsion officer. Include the `EXPORT PDF` and `PUSH TO FLEET DATABASE` actions.

## 7. COMPONENT LIBRARY TO BUILD (as Figma components with variants)

`TelemetryTile` (variants: nominal/caution/warning/critical/stale; with & without sparkline) · `TwinComparisonChart` · `HealthRing` (sizes 64/120/200) · `ConfidenceBar` · `SeverityChip` (5 states, each with a distinct glyph) · `PhaseStep` (past/current/future) · `AlertCard` (5 severities × acknowledged/unacknowledged) · `FeatureContributionBar` (positive/negative) · `RULProjectionCone` · `ModelCard` · `StatusPill` · `SubsystemBar` · `CylinderMatrixCell` · `DataTable` (dense, 32px rows, mono numerals) · `EmptyState` · `DegradedLinkBanner`.

Define these states for every data component and show them on a dedicated States frame: `live`, `stale (>3s old)`, `sensor failed`, `model low-confidence (<70%)`, `link degraded`, `no data`. A defence system is judged on how it behaves when things break — designing the broken states is the credibility move.

## 8. DELIVERABLES

1. Cover frame with product name, problem statement ID, team name, and the primary/benchmark platform strip
2. Design tokens frame (colour, type, spacing, iconography)
3. Component library frame
4. Component states frame
5. Screens S1–S10 at 1920×1080
6. A 1440×900 responsive variant of S1 for a laptop-based portable GCS
7. A prototype flow wiring: Fleet → Live Twin → Fault Centre → Prognostics → Maintenance → Report, so the demo can be clicked start to finish in 90 seconds

---

# PART 2 — INDIVIDUAL SCREEN PROMPTS

Use these if the tool truncates the master prompt. Prefix each with: *"Continue the PRAHARI-DT design system already established — same palette, Barlow Semi Condensed / Inter / IBM Plex Mono, 1920×1080, classification strip + command bar + mission phase strip + alert dock on every frame."*

**S1:** "Design the Live Twin screen: 3-col physical telemetry stack (28 raw parameters grouped into Rotational, Thermal, Fluid, Mechanical, Electrical, Combustion), 6-col centre with a vector 4-cylinder aero-diesel schematic tinted by subsystem health plus a measured-vs-predicted overlay chart with a filled residual band and a TWIN SYNC bar, 3-col right with Engine Health Index radial, anomaly score, top-3 fault probabilities, and RUL with confidence interval."

**S2:** "Design the Health & Diagnostics screen: seven subsystem health bars with trend sparklines, an EHI waterfall from 100 down to current, and a 4-cylinder × 4-parameter heat-tinted comparison matrix."

**S3:** "Design the Fault Centre: left a dense fault register table, right an explainability panel with signed feature-contribution bars, an evidence chart with the anomalous window shaded, a one-sentence physics rationale, a model card with precision/recall, and confirm / false-positive / defer controls."

**S4:** "Design the Prognostics screen: a full-width RUL projection with three widening confidence cones for light/nominal/high mission load, threshold lines for maintenance-due and no-dispatch, a per-component RUL table, and a mission reliability score panel."

**S5:** "Design the Simulation screen: left a what-if parameter console with altitude, OAT, humidity, throttle, payload, duration and four mission presets; right the twin's predicted CHT/EGT curves, fuel burn, projected end-of-mission EHI and RUL consumed, with a large feasibility verdict banner."

**S6:** "Design the Mission Replay screen: scrubbable timeline with phase bands and event markers, transport controls at 1×/4×/16×/64×, and a synchronised engine schematic, strip chart with playhead, and flight-track map."

**S7:** "Design the Maintenance Advisory screen: prioritised AI-generated work item cards with urgency, downtime, spares stock, evidence trail back to the source fault, and raise-work-order actions, plus an engine logbook timeline."

**S8:** "Design the Fleet Overview: airframe cards sorted by ascending health, each with tail number, phase, EHI ring, RUL and open faults, plus a fleet summary strip and an EHI-vs-engine-hours outlier scatter."

**S9:** "Design the System & Data Integrity screen: CAN bus frame rate and error counters, per-sensor status list with drift detection against twin-predicted values, ECU/FADEC link state, packet loss histogram, edge/cloud split, and model version with data-authenticity verification."

**S10:** "Design the Post-Mission Report as a printable A4 layout with phase-wise performance table, health delta, fault dispositions, RUL consumed, exceedances log and an officer signature block."

---

# PART 3 — DATA-TO-WIDGET MAP

Give this to the tool whenever a screen comes back looking empty or generic.

| Field | Tier | Screen | Widget | Sample value |
|---|---|---|---|---|
| rpm | ① | S1, S6 | TelemetryTile + envelope bar | `2,412 RPM` |
| torque / power | ① | S1 | TelemetryTile | `478 Nm` / `134 kW` |
| throttle | ① | S1, S5 | TelemetryTile + planned overlay | `88 %` |
| fuel_flow / fuel_pressure | ① | S1 | TelemetryTile + twin residual | `31.4 L/h` / `4.2 bar` |
| cht (×4 cyl) | ① | S1, S2 | Cylinder matrix, heat-tinted | `197 °C` |
| egt (×4 cyl) | ① | S1, S2 | Cylinder matrix + residual | `648 °C` |
| oil_pressure / temp / level | ① | S1 | TelemetryTile group | `4.8 bar` / `104 °C` / `82 %` |
| intake_pressure / temp | ① | S1 | TelemetryTile | `1.9 bar` / `58 °C` |
| coolant_temperature | ① | S1, S2 | TelemetryTile | `91 °C` |
| vibration_rms / frequency | ① | S1, S3 | Tile + FFT mini-spectrum | `2.4 mm/s` / `147 Hz` |
| injection_timing / quantity | ① | S1, S2 | Tile + per-cylinder | `−12.5° BTDC` / `28 mm³` |
| battery / alternator V & I | ① | S1, S9 | Electrical tile group | `27.8 V / 42 A` |
| altitude, airspeed, VS | ② | Command bar, S5, S6 | Context strip | `5,180 m` / `142 kt` |
| lat / lon / heading | ② | S6 | Map marker | `19.07 N, 72.87 E` |
| pitch / roll / yaw | ② | S6 | Attitude mini-widget | `+2.1° / −0.4°` |
| OAT / ambient_pressure / humidity | ② | S1, S5 | Environment tile row | `−8 °C` / `540 hPa` |
| mission_phase | ② | Global strip | PhaseStep ×13 | `SURVEILLANCE` |
| mission_id / type / payload | ② | Command bar | Mission block | `ISR-2026-0418` |
| planned_altitude / rpm / throttle | ② | S1, S5 | Ghost overlay on actual | dashed reference |
| engine_health_index | ③ | S1, S2, S8 | HealthRing + waterfall | `87.4 / 100` |
| anomaly_score | ③ | S1, S3 | Score + threshold line | `0.34` |
| fault_probability | ③ | S1, S3 | Ranked % bars | `Injector 62%` |
| degradation_rate | ③ | S2, S4 | Trend + slope readout | `0.8 pts/hr` |
| estimated_rul | ③ | S1, S4, S8 | Cone + hours/cycles | `142 h / 96 cyc` |
| confidence | ③ | everywhere ③ appears | ConfidenceBar | `91 %` |
| risk_score | ③ | S4 | Mission reliability panel | `LOW — 0.06` |
| fault_type / timestamp | — | S3 | Fault register row | `Misfire — Cyl 3` |
| maintenance_action / component | — | S7 | Work item card | `Replace injector #3` |
| engine_hours / cycles / install date | — | S7 | Logbook timeline | `1,284 h` |

---

# PART 4 — GUARDRAILS (append to any prompt)

Do **not** produce:
- A generic analytics dashboard with four KPI cards on top and two chart cards below
- Purple-to-blue gradients, glassmorphism, drop shadows, or rounded 16px+ cards
- Emoji as icons, or decorative illustrations of drones
- Donut charts where a value and a threshold would be clearer
- Any inferred number without an adjacent confidence indicator
- Lorem ipsum, `--`, or `0` placeholders — populate every field with plausible aero-diesel values in correct units
- Light mode as the default
- An interface that only shows the healthy state

Do **ensure**:
- Every screen answers a decision, and the decision is stated in words at the top of the panel
- Units are always present and always visually subordinate to the number
- Every AI output shows its algorithm, its confidence, and its evidence
- Mission phase context is visible at all times, because thresholds move with phase
- Degraded, stale and failed states are designed, not assumed away
- The physical-vs-virtual comparison is unmistakable to someone who has never heard the term "digital twin"