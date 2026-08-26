import React, { useState } from "react";
import { useTwin, DEMO_PROFILES, OfficerProfile } from "../context/TwinContext";

export default function AuthLogin() {
  const { login } = useTwin();
  const [activeTab, setActiveTab] = useState<"credentials" | "smartcard">("credentials");
  
  const [serviceId, setServiceId] = useState("DRDO-ADE-8841");
  const [password, setPassword] = useState("••••••••••••");
  const [captchaInput, setCaptchaInput] = useState("7K9X");
  const [captchaCode, setCaptchaCode] = useState("7K9X");
  const [clearanceLevel, setClearanceLevel] = useState<1 | 2 | 3>(3);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let res = "";
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(res);
    setCaptchaInput("");
  };

  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setError("SECURITY CAPTCHA MISMATCH. PLEASE TRY AGAIN.");
      refreshCaptcha();
      return;
    }

    setIsVerifying(true);
    setError(null);

    setTimeout(() => {
      setIsVerifying(false);
      const profile: OfficerProfile = {
        serviceId: serviceId.trim() || "DRDO-ADE-8841",
        name: clearanceLevel === 3 ? "Sqn Ldr Vikram Sharma" : clearanceLevel === 2 ? "Flt Lt Ananya Rao" : "JWO R. K. Nair",
        rank: clearanceLevel === 3 ? "Squadron Leader" : clearanceLevel === 2 ? "Flight Lieutenant" : "Junior Warrant Officer",
        designation: clearanceLevel === 3 ? "Chief Propulsion Specialist" : clearanceLevel === 2 ? "Diagnostic Officer" : "Ground Telemetry Tech",
        clearanceLevel,
        unit: "Aeronautical Development Establishment (DRDO)",
        station: "Bengaluru C2 Ground Station",
      };
      login(profile);
    }, 800);
  };

  const handleQuickDemoLogin = (profile: OfficerProfile) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      login(profile);
    }, 400);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen relative p-4 select-none"
      style={{
        background: "#080B10",
        color: "#E8EEF6",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top National Strip */}
      <div className="fixed top-0 left-0 right-0 h-1.5 flex z-50">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main Login Card */}
      <div
        className="panel max-w-xl w-full mx-auto p-6 sm:p-8 flex flex-col gap-5 relative z-10 shadow-2xl"
        style={{
          background: "#101620",
          border: "1px solid #243040",
          borderRadius: 8,
        }}
      >
        {/* DRDO & Ministry of Defence Crest Header */}
        <div className="flex flex-col items-center text-center border-b pb-4" style={{ borderColor: "#243040" }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span style={{ fontSize: 24 }}>🇮🇳</span>
            <div className="h-6 w-px bg-slate-600 opacity-40 mx-1" />
            <span className="font-mono text-xs font-bold text-[#FF9933] tracking-widest">DRDO // ADE</span>
          </div>

          <h2 className="font-display font-bold text-lg tracking-wider text-[#E8EEF6]">
            GOVERNMENT OF INDIA · MINISTRY OF DEFENCE
          </h2>
          <div className="font-display font-semibold text-xs tracking-widest text-[#FF9933]" style={{ marginTop: 2 }}>
            AERONAUTICAL DEVELOPMENT ESTABLISHMENT (ADE)
          </div>

          <div
            className="font-mono font-bold text-sm tracking-widest mt-3 px-3 py-1 rounded"
            style={{
              background: "rgba(61,169,252,0.1)",
              color: "#3DA9FC",
              border: "1px solid rgba(61,169,252,0.3)",
            }}
          >
            PRAHARI-DT · DIGITAL TWIN TELEMETRY GATEWAY
          </div>
        </div>

        {/* Official Secrets Warning */}
        <div
          className="p-2.5 rounded flex items-start gap-2.5"
          style={{
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.25)",
          }}
        >
          <span style={{ color: "#DC2626", fontSize: 14 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: 10, color: "#FF7A2F", lineHeight: 1.4 }}>
            <strong>RESTRICTED MILITARY SYSTEM:</strong> Unauthorized access or tampering is strictly prohibited under the <em>Official Secrets Act (1923)</em> &amp; <em>IT Act (2000)</em>. All network sessions and telemetry queries are cryptographically logged.
          </p>
        </div>

        {/* Tabs: Credentials vs Smart Card */}
        <div className="flex rounded p-1" style={{ background: "#18202C", border: "1px solid #243040" }}>
          <button
            type="button"
            onClick={() => setActiveTab("credentials")}
            className="flex-1 py-1.5 font-display font-semibold text-xs rounded transition-all cursor-pointer"
            style={{
              background: activeTab === "credentials" ? "#101620" : "transparent",
              color: activeTab === "credentials" ? "#3DA9FC" : "#8CA0B8",
            }}
          >
            OFFICER SERVICE CREDENTIALS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("smartcard")}
            className="flex-1 py-1.5 font-display font-semibold text-xs rounded transition-all cursor-pointer"
            style={{
              background: activeTab === "smartcard" ? "#101620" : "transparent",
              color: activeTab === "smartcard" ? "#3DA9FC" : "#8CA0B8",
            }}
          >
            SMART CARD / TOKEN
          </button>
        </div>

        {activeTab === "credentials" ? (
          <form onSubmit={handleCredentialSubmit} className="flex flex-col gap-3.5">
            {error && (
              <div className="p-2 rounded bg-red-500/10 border border-red-500/40 text-red-500 font-mono text-xs text-center">
                {error}
              </div>
            )}

            <div>
              <label className="label-xs block mb-1" style={{ fontSize: 10 }}>
                DEFENSE SERVICE NUMBER / OFFICER ID
              </label>
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded font-mono text-xs focus:outline-none focus:border-[#3DA9FC]"
                style={{
                  background: "#18202C",
                  border: "1px solid #243040",
                  color: "#E8EEF6",
                }}
                placeholder="e.g. DRDO-ADE-8841"
              />
            </div>

            <div>
              <label className="label-xs block mb-1" style={{ fontSize: 10 }}>
                SECURITY ACCESS PASSCODE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded font-mono text-xs focus:outline-none focus:border-[#3DA9FC]"
                style={{
                  background: "#18202C",
                  border: "1px solid #243040",
                  color: "#E8EEF6",
                }}
              />
            </div>

            <div>
              <label className="label-xs block mb-1" style={{ fontSize: 10 }}>
                SECURITY CLEARANCE LEVEL
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 1, label: "LEVEL 1", desc: "Technician" },
                  { level: 2, label: "LEVEL 2", desc: "Propulsion Officer" },
                  { level: 3, label: "LEVEL 3", desc: "Squadron Cmdr" },
                ].map((l) => (
                  <button
                    key={l.level}
                    type="button"
                    onClick={() => setClearanceLevel(l.level as any)}
                    className="p-2 rounded text-center cursor-pointer transition-all"
                    style={{
                      background: clearanceLevel === l.level ? "rgba(61,169,252,0.15)" : "#18202C",
                      border: `1px solid ${clearanceLevel === l.level ? "#3DA9FC" : "#243040"}`,
                    }}
                  >
                    <div className="font-mono font-bold text-xs" style={{ color: clearanceLevel === l.level ? "#3DA9FC" : "#E8EEF6" }}>
                      {l.label}
                    </div>
                    <div className="label-xs text-[9px]" style={{ color: "#8CA0B8" }}>
                      {l.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Captcha */}
            <div>
              <label className="label-xs block mb-1" style={{ fontSize: 10 }}>
                DEFENSE INTRANET SECURITY CAPTCHA
              </label>
              <div className="flex gap-2">
                <div
                  className="px-4 py-2 rounded font-mono font-bold text-sm tracking-widest flex items-center justify-center select-none"
                  style={{
                    background: "#243040",
                    color: "#FF9933",
                    letterSpacing: "0.25em",
                    fontStyle: "italic",
                    textDecoration: "line-through",
                  }}
                >
                  {captchaCode}
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                  maxLength={4}
                  required
                  placeholder="Enter code"
                  className="w-32 px-3 py-2 rounded font-mono text-xs uppercase focus:outline-none focus:border-[#3DA9FC]"
                  style={{
                    background: "#18202C",
                    border: "1px solid #243040",
                    color: "#E8EEF6",
                  }}
                />
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="px-3 py-2 rounded font-mono text-xs cursor-pointer hover:bg-slate-500/10"
                  style={{ border: "1px solid #243040" }}
                  title="Refresh Captcha"
                >
                  ↻
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full mt-2 font-display font-bold py-2.5 rounded text-xs tracking-wider cursor-pointer transition-all shadow-md"
              style={{
                background: "#FF9933",
                color: "#080B10",
              }}
            >
              {isVerifying ? "AUTHENTICATING WITH DRDO SECURE KEY..." : "AUTHENTICATE & ENTER C2 GATEWAY →"}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-[#3DA9FC]/10 border border-[#3DA9FC]/30 text-[#3DA9FC]">
              💳
            </div>
            <div className="font-display font-semibold text-sm">
              INSERT DEFENSE HARDWARE TOKEN / CAC SMART CARD
            </div>
            <div className="text-xs text-slate-400 max-w-xs">
              Place your PKI-enabled DRDO smart card into the terminal reader to automatically decrypt telemetry access keys.
            </div>
            <button
              onClick={() => handleQuickDemoLogin(DEMO_PROFILES[0])}
              className="mt-2 font-display font-bold px-6 py-2 rounded text-xs bg-[#3DA9FC] text-[#080B10] cursor-pointer"
            >
              SIMULATE SMART CARD INSERTION (SQN LDR)
            </button>
          </div>
        )}

        {/* Quick Demo Autofill Profiles */}
        <div className="border-t pt-4" style={{ borderColor: "#243040" }}>
          <div className="label-xs mb-2 text-center" style={{ fontSize: 9, color: "#8CA0B8" }}>
            ONE-CLICK DEMO AUTHENTICATION (FOR EVALUATION / PRESENTATION)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_PROFILES.map((p) => (
              <button
                key={p.serviceId}
                onClick={() => handleQuickDemoLogin(p)}
                className="p-2 rounded text-left cursor-pointer transition-all hover:border-[#3DA9FC]"
                style={{
                  background: "#18202C",
                  border: "1px solid #243040",
                }}
              >
                <div className="font-display font-semibold text-xs truncate text-[#E8EEF6]">
                  {p.name}
                </div>
                <div className="label-xs text-[9px] text-[#FF9933]">{p.rank}</div>
                <div className="font-mono text-[9px] text-[#8CA0B8]">
                  CLEARANCE: LEVEL-{p.clearanceLevel}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="mt-4 font-mono text-[10px] text-center text-[#546678]">
        PRAHARI-DT SECURE NODE // DRDO-ADE-GCS-NET · ENCRYPTION: AES-256-GCM · IP: 10.142.18.4
      </div>
    </div>
  );
}
