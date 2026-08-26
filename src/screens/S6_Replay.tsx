import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const TOTAL_SECONDS = 7 * 3600 + 42 * 60 + 19; // 7:42:19

const EVENTS = [
  { t: 3600, label: "TAKEOFF", type: "phase", color: "#3DA9FC" },
  { t: 4440, label: "CLIMB START", type: "phase", color: "#3DA9FC" },
  { t: 7200, label: "CRUISE", type: "phase", color: "#3DA9FC" },
  { t: 9600, label: "SURVEILLANCE", type: "phase", color: "#00C08B" },
  { t: 14291, label: "F-0040 LUBRICATION", type: "fault", color: "#F5B335" },
  { t: 18630, label: "F-0041 VIBRATION", type: "fault", color: "#F5B335" },
  { t: 19504, label: "F-0042 CHT TREND", type: "fault", color: "#F5B335" },
  { t: 22292, label: "F-0043 INJECTOR", type: "fault", color: "#FF7A2F" },
  { t: 25800, label: "THROTTLE TRANSIENT", type: "event", color: "#7B61FF" },
  { t: TOTAL_SECONDS - 600, label: "CURRENT", type: "now", color: "#8CA0B8" },
];

// Generate replay chart data (downsampled)
const REPLAY_DATA = Array.from({ length: 200 }, (_, i) => {
  const t = (i / 199) * TOTAL_SECONDS;
  const phase = t < 3600 ? "ground" : t < 4440 ? "takeoff" : t < 7200 ? "climb" : "cruise";
  const load = phase === "ground" ? 0.1 : phase === "takeoff" ? 0.95 : phase === "climb" ? 0.88 : 0.78 + Math.sin(i * 0.1) * 0.05;
  return {
    t,
    rpm: Math.round(phase === "ground" ? 800 : (2200 + load * 400 + (Math.random() - 0.5) * 40)),
    cht3: Math.round(phase === "ground" ? 50 : 170 + load * 60 + (i > 160 ? (i - 160) * 0.8 : 0) + (Math.random() - 0.5) * 4),
    ehi: Math.max(60, 100 - i * 0.08 - (i > 140 ? (i - 140) * 0.15 : 0) + (Math.random() - 0.5) * 1),
  };
});

const SPEEDS = [1, 4, 16, 64];

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function S6_Replay() {
  const [playhead, setPlayhead] = useState(TOTAL_SECONDS - 600);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(16);
  const animRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (playing) {
      const tick = (now: number) => {
        if (lastRef.current !== null) {
          const delta = (now - lastRef.current) / 1000;
          setPlayhead((p) => {
            const next = p + delta * speed;
            if (next >= TOTAL_SECONDS) { setPlaying(false); return TOTAL_SECONDS; }
            return next;
          });
        }
        lastRef.current = now;
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
      return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    } else {
      lastRef.current = null;
    }
  }, [playing, speed]);

  const progress = playhead / TOTAL_SECONDS;
  const currentIdx = Math.floor(progress * (REPLAY_DATA.length - 1));
  const currentData = REPLAY_DATA[currentIdx] || REPLAY_DATA[0];

  const anomalyJumps = EVENTS.filter((e) => e.type === "fault");

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden p-2">
      {/* Top: Jump to anomaly chips */}
      <div className="flex items-center gap-2">
        <span className="label-xs" style={{ fontSize: 9 }}>JUMP TO:</span>
        {anomalyJumps.map((e) => (
          <button
            key={e.t}
            onClick={() => { setPlayhead(e.t); setPlaying(false); }}
            className="font-mono px-2 py-0.5 rounded"
            style={{ fontSize: 10, background: "rgba(245,179,53,0.12)", color: "#F5B335", border: "1px solid #F5B33540", cursor: "pointer" }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="panel p-2" style={{ flexShrink: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="label-xs" style={{ fontSize: 9 }}>MISSION TIMELINE · T+ {formatTime(playhead)}</span>
          <span className="font-mono" style={{ fontSize: 9, color: "#546678" }}>/ {formatTime(TOTAL_SECONDS)}</span>
        </div>
        <div
          className="relative"
          style={{ height: 40, cursor: "pointer" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setPlayhead(pct * TOTAL_SECONDS);
          }}
        >
          {/* Phase bands */}
          {[
            { start: 0, end: 3600, label: "GROUND", color: "#546678" },
            { start: 3600, end: 7200, label: "TAKEOFF/CLIMB", color: "#3DA9FC" },
            { start: 7200, end: 9600, label: "CRUISE", color: "#3DA9FC" },
            { start: 9600, end: TOTAL_SECONDS, label: "SURVEILLANCE", color: "#00C08B" },
          ].map((band) => (
            <div
              key={band.label}
              className="absolute top-0 h-5 flex items-center justify-center"
              style={{
                left: `${(band.start / TOTAL_SECONDS) * 100}%`,
                width: `${((band.end - band.start) / TOTAL_SECONDS) * 100}%`,
                background: band.color + "18",
                borderRight: "1px solid " + band.color + "30",
              }}
            >
              <span style={{ fontSize: 8, color: band.color, fontFamily: "Inter", letterSpacing: "0.06em" }}>{band.label}</span>
            </div>
          ))}

          {/* Event markers */}
          {EVENTS.filter((e) => e.type !== "phase").map((ev) => (
            <div
              key={ev.t}
              className="absolute"
              style={{ left: `${(ev.t / TOTAL_SECONDS) * 100}%`, top: 0, bottom: 0, width: 2, background: ev.color, opacity: 0.8 }}
              title={ev.label}
            />
          ))}

          {/* Progress bar */}
          <div
            className="absolute bottom-0 left-0"
            style={{ height: 16, background: "rgba(61,169,252,0.12)", width: `${progress * 100}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `${progress * 100}%`, width: 2, background: "#E8EEF6" }}
          />
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => setPlayhead(0)}
            className="font-mono px-2 py-0.5 rounded"
            style={{ fontSize: 11, background: "#18202C", color: "#8CA0B8", border: "1px solid #243040", cursor: "pointer" }}
          >⏮</button>
          <button
            onClick={() => setPlaying(!playing)}
            className="font-mono px-3 py-0.5 rounded"
            style={{ fontSize: 11, background: playing ? "rgba(255,59,78,0.12)" : "rgba(0,192,139,0.12)", color: playing ? "#FF3B4E" : "#00C08B", border: `1px solid ${playing ? "#FF3B4E40" : "#00C08B40"}`, cursor: "pointer" }}
          >
            {playing ? "⏸ PAUSE" : "▶ PLAY"}
          </button>
          <button
            onClick={() => setPlayhead(TOTAL_SECONDS)}
            className="font-mono px-2 py-0.5 rounded"
            style={{ fontSize: 11, background: "#18202C", color: "#8CA0B8", border: "1px solid #243040", cursor: "pointer" }}
          >⏭</button>
          <div style={{ width: 1, height: 20, background: "#243040" }} />
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="font-mono px-2 py-0.5 rounded"
              style={{
                fontSize: 10,
                background: speed === s ? "rgba(123,97,255,0.15)" : "#18202C",
                color: speed === s ? "#7B61FF" : "#546678",
                border: `1px solid ${speed === s ? "#7B61FF40" : "#243040"}`,
                cursor: "pointer",
              }}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Three synchronized views */}
      <div className="flex gap-2 flex-1 min-h-0">
        {/* Engine schematic snapshot */}
        <div className="panel p-2 flex flex-col" style={{ width: 200, flexShrink: 0 }}>
          <div className="label-xs mb-1" style={{ fontSize: 9 }}>ENGINE STATE @ PLAYHEAD</div>
          <div className="flex flex-col gap-2 flex-1 justify-center">
            {[
              { label: "RPM", val: currentData.rpm, unit: "RPM", color: "#E8EEF6" },
              { label: "CHT CYL 3", val: Math.round(currentData.cht3), unit: "°C", color: currentData.cht3 > 215 ? "#FF7A2F" : currentData.cht3 > 205 ? "#F5B335" : "#00C08B" },
              { label: "EHI", val: currentData.ehi.toFixed(1), unit: "/ 100", color: currentData.ehi > 75 ? "#F5B335" : "#FF7A2F" },
            ].map((m) => (
              <div key={m.label} className="raised p-2">
                <div className="label-xs" style={{ fontSize: 9 }}>{m.label}</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono" style={{ fontSize: 18, color: m.color, fontWeight: 500 }}>{m.val}</span>
                  <span className="label-xs" style={{ fontSize: 10 }}>{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strip chart */}
        <div className="panel p-2 flex flex-col flex-1 min-w-0">
          <div className="label-xs mb-1" style={{ fontSize: 9 }}>MULTI-PARAMETER STRIP CHART</div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REPLAY_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#243040" />
                <XAxis dataKey="t" hide />
                <YAxis tick={{ fill: "#546678", fontSize: 9, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={{ background: "#18202C", border: "1px solid #243040", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <ReferenceLine x={playhead} stroke="#E8EEF6" strokeWidth={1.5} />
                <Line type="monotone" dataKey="rpm" stroke="#3DA9FC" strokeWidth={1} dot={false} name="RPM" />
                <Line type="monotone" dataKey="cht3" stroke="#FF7A2F" strokeWidth={1.5} dot={false} name="CHT Cyl3" />
                <Line type="monotone" dataKey="ehi" stroke="#00C08B" strokeWidth={1.5} dot={false} name="EHI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flight map placeholder */}
        <div className="panel p-2 flex flex-col" style={{ width: 220, flexShrink: 0 }}>
          <div className="label-xs mb-1" style={{ fontSize: 9 }}>FLIGHT TRACK</div>
          <div className="flex-1 relative" style={{ background: "#18202C", borderRadius: 4 }}>
            <svg width="100%" height="100%" viewBox="0 0 200 160">
              <path d="M20,140 Q80,120 120,80 Q150,50 160,30 Q165,20 162,28 Q158,36 160,30" fill="none" stroke="#3DA9FC" strokeWidth="1.5" opacity="0.6" />
              <circle cx={160 - (1 - progress) * 40} cy={30 + (1 - progress) * 50} r="5" fill="#E8EEF6" />
              <circle cx={160 - (1 - progress) * 40} cy={30 + (1 - progress) * 50} r="3" fill="#3DA9FC" />
              {EVENTS.filter((e) => e.type === "fault").map((e, i) => {
                const ep = e.t / TOTAL_SECONDS;
                return <circle key={i} cx={160 - (1 - ep) * 40} cy={30 + (1 - ep) * 50} r="3" fill={e.color} opacity="0.8" />;
              })}
              <text x="10" y="155" fill="#546678" fontSize="8" fontFamily="IBM Plex Mono">19.07°N 72.87°E</text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
