'use client';

import { useState, useEffect } from "react";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const GRIEVANCES = [
  { id: "GRV-2024-001", title: "Major pothole on MG Road", description: "Deep pothole near City Mall, caused 2 bike accidents today", category: "roads", status: "critical", priority: "critical", ward: "Ward 12", zone: "Central Zone", address: "MG Road, Near City Mall", citizen: "Rajesh Kumar", phone: "+91 98765 43210", reportedAt: Date.now() - 12 * 3600000, slaHours: 48, elapsedHours: 12, aiConfidence: 0.95, aiSimilar: 23, urgency: 0.92, rtiGenerated: false, hasAfter: false },
  { id: "GRV-2024-002", title: "Broken sewage line flooding street", description: "Sewage burst, waterlogged for 3 days, health hazard for residents", category: "sanitation", status: "in-progress", priority: "high", ward: "Ward 8", zone: "East Zone", address: "Laxmi Nagar, Block C", citizen: "Priya Sharma", phone: "+91 87654 32109", reportedAt: Date.now() - 28 * 3600000, slaHours: 48, elapsedHours: 28, aiConfidence: 0.88, aiSimilar: 15, urgency: 0.85, rtiGenerated: false, hasAfter: false, assignee: "Suresh Patel" },
  { id: "GRV-2024-003", title: "Street lights out for 2 weeks", description: "Complete darkness on main road, safety concern especially for women", category: "electricity", status: "escalated", priority: "high", ward: "Ward 5", zone: "North Zone", address: "Shakti Nagar Main Road", citizen: "Meera Singh", phone: "+91 76543 21098", reportedAt: Date.now() - 72 * 3600000, slaHours: 48, elapsedHours: 72, aiConfidence: 0.92, aiSimilar: 8, urgency: 0.78, rtiGenerated: true, hasAfter: false, assignee: "Amit Verma", socialShared: true, twitterLikes: 234 },
  { id: "GRV-2024-004", title: "Garbage dump not cleared", description: "Month-old pile attracting stray animals, severe smell for residents", category: "waste", status: "resolved", priority: "medium", ward: "Ward 3", zone: "South Zone", address: "Green Park, Sector B", citizen: "Anil Gupta", phone: "+91 65432 10987", reportedAt: Date.now() - 48 * 3600000, slaHours: 48, elapsedHours: 31.5, aiConfidence: 0.96, aiSimilar: 42, urgency: 0.65, rtiGenerated: false, hasAfter: true, score: 95, assignee: "Vikram Singh" },
  { id: "GRV-2024-005", title: "Water pipeline leak", description: "Potable water being wasted, road surface deteriorating rapidly", category: "water", status: "pending", priority: "high", ward: "Ward 7", zone: "West Zone", address: "Model Town, Near Water Tank", citizen: "Sunita Yadav", phone: "+91 54321 09876", reportedAt: Date.now() - 6 * 3600000, slaHours: 48, elapsedHours: 6, aiConfidence: 0.91, aiSimilar: 18, urgency: 0.88, rtiGenerated: false, hasAfter: false },
  { id: "GRV-2024-006", title: "Broken footpath tiles", description: "Cracked tiles causing falls, elderly residents at risk near market", category: "infrastructure", status: "pending", priority: "medium", ward: "Ward 14", zone: "Central Zone", address: "Andheri Market Road", citizen: "Kavita Mehta", phone: "+91 43210 98765", reportedAt: Date.now() - 3 * 3600000, slaHours: 48, elapsedHours: 3, aiConfidence: 0.89, aiSimilar: 11, urgency: 0.72, rtiGenerated: false, hasAfter: false },
];

const DEPARTMENTS = [
  { id: "DEPT-01", name: "Roads & Infrastructure", head: "Ramesh Sharma", grievances: 420, resolved: 380, sla: 88, active: 40 },
  { id: "DEPT-02", name: "Sanitation & Health", head: "Dr. Priya Menon", grievances: 550, resolved: 490, sla: 82, active: 60 },
  { id: "DEPT-03", name: "Water Works", head: "Er. Rajiv Gupta", grievances: 310, resolved: 295, sla: 92, active: 15 },
  { id: "DEPT-04", name: "Electricity Board", head: "Anil Desai", grievances: 280, resolved: 250, sla: 79, active: 30 },
  { id: "DEPT-05", name: "Solid Waste Mgmt", head: "Vikram Kumar", grievances: 600, resolved: 510, sla: 71, active: 90 },
];

const WARDS = [
  { id: "W-01", name: "Civil Lines", zone: "Central", councillor: "Mrs. Sharma", issues: 45, critical: 2 },
  { id: "W-02", name: "Sadar Bazaar", zone: "Central", councillor: "Mr. Verma", issues: 78, critical: 5 },
  { id: "W-03", name: "Model Town", zone: "North", councillor: "Mrs. Gupta", issues: 32, critical: 1 },
  { id: "W-04", name: "Defence Colony", zone: "South", councillor: "Col. Singh", issues: 24, critical: 0 },
  { id: "W-05", name: "Laxmi Nagar", zone: "East", councillor: "Mr. Yadav", issues: 110, critical: 12 },
];

const STATS = { total: 2847, pending: 456, inProgress: 892, resolved: 1243, escalated: 156, slaCompliance: 78.4, avgResolution: 36.5, satisfaction: 4.2, critical: 23, todayNew: 18, todayResolved: 12 };

const STATUS_MAP = {
  pending:     { label: "Pending",     light: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" }, dark: { bg: "#431407", text: "#FB923C", border: "#7C2D12" } },
  "in-progress":{ label: "In Progress", light: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" }, dark: { bg: "#1E3A5F", text: "#60A5FA", border: "#1E40AF" } },
  resolved:    { label: "Resolved",    light: { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" }, dark: { bg: "#052E16", text: "#4ADE80", border: "#166534" } },
  escalated:   { label: "Escalated",   light: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" }, dark: { bg: "#4C0519", text: "#F87171", border: "#9F1239" } },
  critical:    { label: "Critical",    light: { bg: "#FFF1F2", text: "#9F1239", border: "#FECDD3" }, dark: { bg: "#4C0519", text: "#FB7185", border: "#881337" } },
  verified:    { label: "Verified",    light: { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" }, dark: { bg: "#3B0764", text: "#C084FC", border: "#6B21A8" } },
};

const PRIORITY_MAP = {
  critical: { light: "#DC2626", dark: "#EF4444" },
  high:     { light: "#EA580C", dark: "#F97316" },
  medium:   { light: "#D97706", dark: "#FBBF24" },
  low:      { light: "#16A34A", dark: "#4ADE80" },
};

const CAT_ICONS = { roads: "⬡", sanitation: "◈", water: "◎", electricity: "◉", waste: "◆", infrastructure: "◫", other: "○" };

type GrievanceType = typeof GRIEVANCES[0];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useCountdown(reportedAt: number, slaHours: number) {
  const deadline = reportedAt + slaHours * 3600000;
  const [ms, setMs] = useState(() => deadline - Date.now());
  useEffect(() => {
    const t = setInterval(() => setMs(deadline - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  const breached = ms < 0;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);
  const pct = Math.max(0, Math.min(100, (ms / (slaHours * 3600000)) * 100));
  return { breached, h, m, s, pct, urgent: !breached && h < 6 };
}

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Pill({ status, dark }: { status: keyof typeof STATUS_MAP, dark: boolean }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  const c = dark ? cfg.dark : cfg.light;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

function PriorityDot({ priority, dark }: { priority: keyof typeof PRIORITY_MAP, dark: boolean }) {
  const color = dark ? PRIORITY_MAP[priority]?.dark : PRIORITY_MAP[priority]?.light;
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: priority === "critical" ? `0 0 6px ${color}` : "none", flexShrink: 0 }} />;
}

function SLABar({ reportedAt, slaHours, compact, dark }: { reportedAt: number, slaHours: number, compact?: boolean, dark: boolean }) {
  const { breached, h, m, pct, urgent } = useCountdown(reportedAt, slaHours);
  const barColor = breached ? (dark ? "#EF4444" : "#DC2626") : urgent ? (dark ? "#F97316" : "#EA580C") : (dark ? "#4ADE80" : "#16A34A");
  const textColor = breached ? (dark ? "#EF4444" : "#DC2626") : urgent ? (dark ? "#F97316" : "#EA580C") : (dark ? "#4ADE80" : "#16A34A");

  if (compact) {
    return (
      <span style={{ color: textColor, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 700 }}>
        {breached ? `+${h}h overdue` : `${h}h ${m}m`}
      </span>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: dark ? "#6B7280" : "#9CA3AF", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
          {breached ? "SLA BREACHED" : "SLA DEADLINE"}
        </span>
        <span style={{ color: textColor, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700 }}>
          {breached ? `+${h}h ${m}m` : `${h}h ${m}m`}
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3,
          transition: "width 1s linear",
          boxShadow: `0 0 8px ${barColor}50`
        }} />
        {(urgent || breached) && (
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent 60%, ${barColor}30)`, animation: "pulse 2s infinite" }} />
        )}
      </div>
    </div>
  );
}

// ─── CIRCULAR SLA RING (from Gen 1 style) ────────────────────────────────────
function SLARing({ reportedAt, slaHours, dark, size = 52 }: { reportedAt: number, slaHours: number, dark: boolean, size?: number }) {
  const { breached, h, m, pct, urgent } = useCountdown(reportedAt, slaHours);
  const color = breached ? (dark ? "#EF4444" : "#DC2626") : urgent ? (dark ? "#F97316" : "#EA580C") : (dark ? "#4ADE80" : "#16A34A");
  const trackColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const cx = size / 2, cy = size / 2, r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth="4" />
        {/* Progress */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dasharray 1s linear" }} />
        {/* Glow when urgent/breached */}
        {(urgent || breached) && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="4" opacity="0.2"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transformOrigin: "center", transform: "rotate(-90deg)", filter: "blur(3px)" }} />
        )}
      </svg>
      {/* Center text */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 0
      }}>
        <span style={{ fontSize: size < 60 ? 9 : 11, fontFamily: "'DM Mono', monospace", fontWeight: 700, color, lineHeight: 1 }}>
          {breached ? `+${h}h` : `${h}h`}
        </span>
        <span style={{ fontSize: size < 60 ? 7 : 9, fontFamily: "'DM Mono', monospace", color: dark ? "#6B7280" : "#9CA3AF", lineHeight: 1, marginTop: 1 }}>
          {breached ? "over" : `${m}m`}
        </span>
      </div>
    </div>
  );
}

function ScoreRing({ score, dark, size = 44 }: { score: number, dark: boolean, size?: number }) {
  const color = score >= 80 ? (dark ? "#4ADE80" : "#16A34A") : score >= 50 ? (dark ? "#FBBF24" : "#D97706") : (dark ? "#EF4444" : "#DC2626");
  const r = 16; const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dasharray 0.6s ease" }} />
      <text x="20" y="24" textAnchor="middle" fill={color} fontSize="9" fontFamily="'DM Mono', monospace" fontWeight="700">{score}</text>
    </svg>
  );
}

// ─── LIVE STAT CARD ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon, dark, delay = 0 }: { label: string; value: number | string; sub?: string; accent: string; icon: React.ReactNode; dark: boolean; delay?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);
  const target = typeof value === "number" ? value : parseInt(value as string) || 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setDisplayed(target); clearInterval(t); }
      else setDisplayed(start);
    }, 20);
    return () => clearInterval(t);
  }, [visible, target]);

  // Simulate occasional live updates
  useEffect(() => {
    const t = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 4000 + Math.random() * 8000);
    return () => clearInterval(t);
  }, []);

  const bg = dark ? "#111827" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "20px 22px",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      position: "relative", overflow: "hidden",
      boxShadow: dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.08)"
    }}>
      {/* Accent glow */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `${accent}15`, filter: "blur(30px)", pointerEvents: "none" }} />
      {/* Live pulse ring */}
      {pulse && <div style={{ position: "absolute", inset: 0, border: `1px solid ${accent}40`, borderRadius: 16, animation: "ringPulse 0.6s ease-out forwards", pointerEvents: "none" }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: accent, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {typeof value === "number" ? displayed.toLocaleString() : value}
            {typeof value === "string" && value.endsWith("%") && ""}
          </div>
          {sub && <div style={{ fontSize: 11, color: textSecondary, marginTop: 5 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
      </div>
    </div>
  );
}

// ─── GRIEVANCE CARD ──────────────────────────────────────────────────────────
function GrievanceCard({ g, dark, onClick, index }: { g: GrievanceType; dark: boolean; onClick: (g: GrievanceType) => void; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setEntered(true), 80 * index + 300); return () => clearTimeout(t); }, [index]);

  const bg = dark ? "#111827" : "#FFFFFF";
  const border = dark ? (hovered ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.07)") : (hovered ? "rgba(99,102,241,0.3)" : "rgba(0,0,0,0.07)");
  const textPrimary = dark ? "#F9FAFB" : "#111827";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";
  const breached = g.elapsedHours > g.slaHours;

  return (
    <div
      onClick={() => onClick(g)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "18px 20px",
        cursor: "pointer", position: "relative", overflow: "hidden",
        opacity: entered ? 1 : 0, transform: entered ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
        transition: `opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, box-shadow 0.2s`,
        boxShadow: hovered ? (dark ? "0 8px 30px rgba(0,0,0,0.5)" : "0 8px 30px rgba(0,0,0,0.12)") : (dark ? "0 1px 3px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)")
      }}>

      {/* Critical pulse strip */}
      {(g.status === "critical" || breached) && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: dark ? "#EF4444" : "#DC2626", animation: "shimmer 2s linear infinite", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg, transparent 0%, ${dark ? "#EF4444" : "#DC2626"} 50%, transparent 100%)` }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{CAT_ICONS[g.category as keyof typeof CAT_ICONS] || "○"}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.07em" }}>{g.id}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary, lineHeight: 1.3, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{g.title}</div>
          </div>
        </div>
        <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} dark={dark} />
      </div>

      <p style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.description}</p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <Pill status={g.status as keyof typeof STATUS_MAP} dark={dark} />
        {g.rtiGenerated && (
          <span style={{ background: dark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)", color: dark ? "#A78BFA" : "#7C3AED", border: `1px solid ${dark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)"}`, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>RTI ✓</span>
        )}
        {g.socialShared && (
          <span style={{ background: dark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.1)", color: dark ? "#60A5FA" : "#2563EB", border: `1px solid ${dark ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.2)"}`, padding: "3px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>𝕏 {g.twitterLikes}</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 11, color: textSecondary }}>
        <span>📍</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.address}</span>
        <span style={{ marginLeft: "auto", flexShrink: 0 }}>{g.ward}</span>
      </div>

      {g.aiConfidence && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 10px", background: dark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.05)", borderRadius: 8, border: `1px solid ${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}` }}>
          <span style={{ fontSize: 10, color: dark ? "#818CF8" : "#6366F1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>AI</span>
          <div style={{ flex: 1, height: 3, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${g.aiConfidence * 100}%`, background: dark ? "#818CF8" : "#6366F1", borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: dark ? "#818CF8" : "#6366F1", fontFamily: "'DM Mono', monospace" }}>{Math.round(g.aiConfidence * 100)}%</span>
          <span style={{ fontSize: 10, color: textSecondary }}>{g.aiSimilar} similar</span>
          {g.score != null && <ScoreRing score={g.score} dark={dark} size={32} />}
        </div>
      )}

      {/* Bottom: Ring + bar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} size={52} />
        <div style={{ flex: 1 }}>
          <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} />
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL DRAWER ────────────────────────────────────────────────────────────
function DetailDrawer({ g, dark, onClose }: { g: GrievanceType; dark: boolean; onClose: () => void }) {
  const [tab, setTab] = useState("overview");
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const bg = dark ? "#0F172A" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textPrimary = dark ? "#F9FAFB" : "#111827";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex",
      background: dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
      opacity: visible ? 1 : 0, transition: "opacity 0.25s ease"
    }} onClick={onClose}>
      <div style={{ marginLeft: "auto", width: 480, height: "100%", background: bg, borderLeft: `1px solid ${border}`, overflow: "hidden", display: "flex", flexDirection: "column",
        transform: visible ? "translateX(0)" : "translateX(40px)", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)"
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>{g.id} · {g.ward}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: textPrimary, fontFamily: "'Sora', sans-serif", lineHeight: 1.3 }}>{g.title}</div>
            </div>
            <button onClick={onClose} style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: textSecondary, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Pill status={g.status as keyof typeof STATUS_MAP} dark={dark} />
            <span style={{ fontSize: 11, color: PRIORITY_MAP[g.priority as keyof typeof PRIORITY_MAP]?.[dark ? "dark" : "light"], fontFamily: "'DM Mono', monospace", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} dark={dark} /> {g.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          {["overview", "timeline", "ai audit", "actions"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: "11px 0", background: "none", border: "none",
              borderBottom: tab === t ? `2px solid ${dark ? "#818CF8" : "#6366F1"}` : "2px solid transparent",
              color: tab === t ? (dark ? "#818CF8" : "#6366F1") : textSecondary,
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer", transition: "color 0.15s"
            }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {tab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <SLARing reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} size={64} />
                <div style={{ flex: 1 }}>
                  <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} dark={dark} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[["Citizen", g.citizen], ["Phone", g.phone], ["Zone", g.zone], ["Category", g.category]].map(([k, v]) => (
                  <div key={k} style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${border}` }}>
                    <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 4 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: textPrimary, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${border}` }}>
                <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 6 }}>DESCRIPTION</div>
                <p style={{ fontSize: 13, color: textSecondary, lineHeight: 1.7 }}>{g.description}</p>
              </div>

              <div>
                <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>PHOTO EVIDENCE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {["BEFORE", "AFTER"].map(label => (
                    <div key={label} style={{ aspectRatio: "4/3", borderRadius: 10, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px dashed ${border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <div style={{ fontSize: 22, opacity: 0.2 }}>📷</div>
                      <div style={{ fontSize: 9, color: dark ? "#374151" : "#D1D5DB", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{label}</div>
                      {label === "AFTER" && g.hasAfter && <div style={{ fontSize: 9, color: dark ? "#4ADE80" : "#16A34A", fontFamily: "'DM Mono', monospace" }}>✓ UPLOADED</div>}
                    </div>
                  ))}
                </div>
              </div>

              {g.assignee && (
                <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px", border: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: dark ? "#818CF8" : "#6366F1", flexShrink: 0 }}>
                    {g.assignee.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>ASSIGNED TO</div>
                    <div style={{ fontSize: 13, color: textPrimary, fontWeight: 600, marginTop: 2 }}>{g.assignee}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "ai audit" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: dark ? "rgba(99,102,241,0.07)" : "rgba(99,102,241,0.05)", border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.15)"}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 9, color: dark ? "#818CF8" : "#6366F1", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>BEDROCK AI ANALYSIS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[["Confidence", `${Math.round(g.aiConfidence * 100)}%`], ["Urgency Score", `${Math.round(g.urgency * 100)}%`], ["Similar Issues Nearby", `${g.aiSimilar} in 5km`]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: textSecondary }}>{k}</span>
                      <span style={{ fontSize: 12, color: textPrimary, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: 16, border: `1px solid ${border}` }}>
                <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: 10 }}>VISION AUDIT CRITERIA</div>
                {["Before photo FOV must match After photo exactly", `All detected issues must be resolved in After photo`, "No zoomed-in or partial frame submissions", "Citizen must verify resolution within 24h"].map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ color: dark ? "#818CF8" : "#6366F1", fontSize: 10, marginTop: 2, flexShrink: 0 }}>◆</span>
                    <span style={{ fontSize: 12, color: textSecondary, lineHeight: 1.6 }}>{c}</span>
                  </div>
                ))}
              </div>
              {g.score != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 16, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "14px 16px", border: `1px solid ${border}` }}>
                  <ScoreRing score={g.score} dark={dark} size={52} />
                  <div>
                    <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>RESOLUTION QUALITY</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: g.score >= 80 ? (dark ? "#4ADE80" : "#16A34A") : (dark ? "#FBBF24" : "#D97706"), marginTop: 4 }}>{g.score >= 80 ? "Full repair verified" : "Partial repair"}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "timeline" && (() => {
            // Derive step states from grievance status
            const stepMap: Record<string, number> = {
              pending: 0, "in-progress": 1, escalated: 1,
              resolved: 2, verified: 3, critical: 0,
              PENDING: 0, RESOLUTION_SUBMITTED: 1, PENDING_CITIZEN_VERIFICATION: 2,
              RESOLVED: 3, ESCALATED_DECEPTIVE: 1,
            };
            const currentStep = stepMap[g.status] ?? 0;

            const steps = [
              {
                label: "AI triage completed",
                detail: `${g.aiSimilar > 0 ? g.aiSimilar : 4} issues identified, SLA clock started`,
                time: "Just now",
                state: "done", // always done
              },
              {
                label: "Official repair & upload",
                detail: "Upload After photo to trigger Vision Auditor",
                time: currentStep >= 1 ? "In progress" : "Pending",
                state: currentStep === 1 ? "active" : currentStep > 1 ? "done" : "pending",
              },
              {
                label: "Vision Auditor check",
                detail: "Bedrock compares Before vs After",
                time: currentStep >= 2 ? "In progress" : "Pending",
                state: currentStep === 2 ? "active" : currentStep > 2 ? "done" : "pending",
              },
              {
                label: "Citizen verification",
                detail: "Citizen confirms or disputes resolution",
                time: currentStep >= 3 ? "In progress" : "Pending",
                state: currentStep === 3 ? "active" : currentStep > 3 ? "done" : "pending",
              },
              {
                label: "Ticket closed",
                detail: "Status → RESOLVED",
                time: g.status === "resolved" || g.status === "RESOLVED" ? "Completed" : "Pending",
                state: g.status === "resolved" || g.status === "RESOLVED" ? "done" : "pending",
              },
            ];

            return (
              <div style={{ display: "flex", flexDirection: "column", paddingTop: 4 }}>
                {/* Inline keyframes for ring pulse */}
                <style>{`
                  @keyframes tlRingExpand {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.2); opacity: 0; }
                  }
                  @keyframes tlDotPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                  }
                `}</style>
                {steps.map((step, i) => {
                  const isActive = step.state === "active" || (i === 0); // first is always "just done" = active style
                  const isDone = step.state === "done";
                  const isPending = step.state === "pending";

                  // Colors
                  const dotFill = isDone
                    ? (dark ? "#4ADE80" : "#16A34A")
                    : isActive
                    ? (dark ? "#60A5FA" : "#3B82F6")
                    : "transparent";
                  const dotBorder = isDone
                    ? (dark ? "#4ADE80" : "#16A34A")
                    : isActive
                    ? (dark ? "#60A5FA" : "#3B82F6")
                    : (dark ? "#374151" : "#D1D5DB");
                  const lineColor = isDone || i < currentStep
                    ? (dark ? "#4ADE80" : "#16A34A")
                    : (dark ? "#1F2937" : "#E5E7EB");

                  return (
                    <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < steps.length - 1 ? 0 : 0 }}>
                      {/* Left: dot + connector line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                        {/* Dot with optional pulse ring */}
                        <div style={{ position: "relative", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                          {/* Pulsing outer ring for active steps */}
                          {(isActive) && (
                            <div style={{
                              position: "absolute", width: 16, height: 16, borderRadius: "50%",
                              border: `2px solid ${dotBorder}`,
                              animation: "tlRingExpand 1.8s ease-out infinite",
                              pointerEvents: "none"
                            }} />
                          )}
                          {/* Second ring offset */}
                          {isActive && (
                            <div style={{
                              position: "absolute", width: 16, height: 16, borderRadius: "50%",
                              border: `2px solid ${dotBorder}`,
                              animation: "tlRingExpand 1.8s ease-out 0.6s infinite",
                              pointerEvents: "none"
                            }} />
                          )}
                          {/* Core dot */}
                          <div style={{
                            width: isDone ? 10 : isActive ? 12 : 8,
                            height: isDone ? 10 : isActive ? 12 : 8,
                            borderRadius: "50%",
                            background: dotFill,
                            border: `2px solid ${dotBorder}`,
                            transition: "all 0.3s ease",
                            animation: isActive ? "tlDotPulse 2s ease-in-out infinite" : "none",
                            boxShadow: isActive ? `0 0 8px ${dotBorder}80` : isDone ? `0 0 6px ${dotFill}60` : "none",
                            zIndex: 1,
                          }} />
                          {/* Checkmark for done */}
                          {isDone && (
                            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                                <path d="M1 3.5L2.8 5.5L6 1.5" stroke={dark ? "#0B0F1A" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {/* Connector line */}
                        {i < steps.length - 1 && (
                          <div style={{ width: 2, flex: 1, minHeight: 36, marginTop: 4, marginBottom: 4, background: lineColor, borderRadius: 1, transition: "background 0.3s" }} />
                        )}
                      </div>

                      {/* Right: text */}
                      <div style={{ paddingBottom: i < steps.length - 1 ? 24 : 4, flex: 1 }}>
                        <div style={{ fontSize: 9, color: isActive ? (dark ? "#60A5FA" : "#3B82F6") : isDone ? (dark ? "#4ADE80" : "#16A34A") : textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 3, textTransform: "uppercase" }}>
                          {step.time}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isPending ? (dark ? "#4B5563" : "#9CA3AF") : textPrimary, marginBottom: 3 }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: 11, color: isPending ? (dark ? "#374151" : "#D1D5DB") : textSecondary, lineHeight: 1.5 }}>
                          {step.detail}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {tab === "actions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Upload Repair Proof", icon: "↑", desc: "Submit After photo for Vision Auditor", accent: dark ? "#818CF8" : "#6366F1", primary: true },
                { label: "Generate RTI Request", icon: "📄", desc: "Auto-draft RTI under Section 2(j)(i)", accent: dark ? "#4ADE80" : "#16A34A", primary: false },
                { label: "Share to X (Twitter)", icon: "𝕏", desc: "Post with evidence graphic + SLA breach tag", accent: dark ? "#60A5FA" : "#2563EB", primary: false },
                { label: "Escalate to Commissioner", icon: "!", desc: "Flag as deceptive or unresolved", accent: dark ? "#EF4444" : "#DC2626", danger: true },
              ].map(a => (
                <button key={a.label} style={{
                  background: a.danger ? (dark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.05)") : a.primary ? (dark ? "rgba(129,140,248,0.15)" : "rgba(99,102,241,0.1)") : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                  border: `1px solid ${a.danger ? (dark ? "rgba(239,68,68,0.25)" : "rgba(220,38,38,0.2)") : a.primary ? (dark ? "rgba(129,140,248,0.3)" : "rgba(99,102,241,0.25)") : border}`,
                  borderRadius: 10, padding: "14px 16px", cursor: "pointer", textAlign: "left", width: "100%",
                  display: "flex", gap: 12, alignItems: "center", transition: "all 0.15s"
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.accent, fontFamily: "'Sora', sans-serif" }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function GovernmentDashboard() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("grievances");
  const [selected, setSelected] = useState<GrievanceType | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("urgency");
  const [viewMode, setViewMode] = useState("grid");
  const [notifOpen, setNotifOpen] = useState(false);

  const bg = dark ? "#000000" : "#F1F5F9";
  const surface = dark ? "#111827" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textPrimary = dark ? "#F9FAFB" : "#111827";
  const textSecondary = dark ? "#6B7280" : "#9CA3AF";
  const accent = dark ? "#818CF8" : "#6366F1";

  const filtered = GRIEVANCES.filter(g => {
    const q = search.toLowerCase();
    const matchSearch = !q || g.title.toLowerCase().includes(q) || g.id.toLowerCase().includes(q) || g.citizen.toLowerCase().includes(q) || g.address.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || g.status === filterStatus;
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (sortBy === "urgency") return (b.elapsedHours / b.slaHours) - (a.elapsedHours / a.slaHours);
    if (sortBy === "severity") return ["critical","high","medium","low"].indexOf(a.priority) - ["critical","high","medium","low"].indexOf(b.priority);
    return b.reportedAt - a.reportedAt;
  });

  const NAV = [
    { id: "overview", icon: "⬡", label: "Overview" },
    { id: "grievances", icon: "◈", label: "Grievances" },
    { id: "departments", icon: "◫", label: "Departments" },
    { id: "wards", icon: "📍", label: "Wards" },
    { id: "analytics", icon: "◎", label: "Analytics" },
    { id: "reports", icon: "◆", label: "Reports" },
    { id: "settings", icon: "⊕", label: "Settings" },
  ];

  const NOTIFS = [
    { msg: "5 new critical issues reported", time: "5 min ago", read: false, color: dark ? "#EF4444" : "#DC2626" },
    { msg: "SLA breach: GRV-2024-003", time: "1 hour ago", read: false, color: dark ? "#F97316" : "#EA580C" },
    { msg: "Vision audit completed: 3 grievances", time: "2 hours ago", read: true, color: dark ? "#4ADE80" : "#16A34A" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "'Sora', sans-serif", color: textPrimary, display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ringPulse { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.04)} }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input::placeholder { color: ${textSecondary}; }
        select option { background: ${surface}; color: ${textPrimary}; }
        button:active { transform: scale(0.97); }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{
        width: sidebarOpen ? 220 : 68, flexShrink: 0, background: surface, borderRight: `1px solid ${border}`,
        display: "flex", flexDirection: "column", transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", overflow: "hidden", height: "100vh", position: "sticky", top: 0
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#F97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🛡</div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>CivicSentinel</div>
              <div style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>GOV PORTAL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {NAV.map(n => {
            const isActive = activeNav === n.id;
            return (
              <button key={n.id} onClick={() => setActiveNav(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: 10,
                background: isActive ? (dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)") : "transparent",
                border: `1px solid ${isActive ? (dark ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.2)") : "transparent"}`,
                color: isActive ? accent : textSecondary, cursor: "pointer",
                transition: "all 0.15s", fontSize: 12, fontWeight: isActive ? 700 : 500,
                justifyContent: sidebarOpen ? "flex-start" : "center", overflow: "hidden", whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
                {sidebarOpen && <span>{n.label}</span>}
                {n.id === "grievances" && sidebarOpen && (
                  <span style={{ marginLeft: "auto", background: dark ? "rgba(239,68,68,0.2)" : "rgba(220,38,38,0.1)", color: dark ? "#EF4444" : "#DC2626", fontSize: 9, fontWeight: 700, borderRadius: 99, padding: "1px 6px", fontFamily: "'DM Mono', monospace" }}>23</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${border}`, display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={() => setDark(!dark)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
            background: "transparent", border: "none", color: textSecondary, cursor: "pointer",
            transition: "all 0.15s", fontSize: 12, justifyContent: sidebarOpen ? "flex-start" : "center", overflow: "hidden", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 16 }}>{dark ? "☀️" : "🌙"}</span>
            {sidebarOpen && <span>{dark ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOP BAR */}
        <header style={{ background: surface, borderBottom: `1px solid ${border}`, padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 20 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ 
            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", 
            border: `1px solid ${border}`, 
            color: textSecondary, cursor: "pointer", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            width: 38, height: 38, borderRadius: 10,
            transition: "background 0.15s, color 0.15s", marginRight: 8
          }}
            onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; e.currentTarget.style.color = textPrimary; }}
            onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"; e.currentTarget.style.color = textSecondary; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? (
                <>
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>
          
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em" }}>Grievance Control Center</div>
            <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Live indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: dark ? "rgba(74,222,128,0.08)" : "rgba(22,163,74,0.07)", border: `1px solid ${dark ? "rgba(74,222,128,0.2)" : "rgba(22,163,74,0.2)"}`, borderRadius: 99, padding: "5px 12px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: dark ? "#4ADE80" : "#16A34A", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: dark ? "#4ADE80" : "#16A34A", fontWeight: 700 }}>LIVE</span>
          </div>

          {/* Search - gen 1 style, full width context */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: dark ? "#4B5563" : "#9CA3AF", fontSize: 13, pointerEvents: "none" }}>⊕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, issue, or location..."
              style={{
                background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                border: `1px solid ${search ? (dark ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.4)") : border}`,
                borderRadius: 10, padding: "9px 14px 9px 34px", color: textPrimary, fontSize: 12, outline: "none",
                width: 280, fontFamily: "'Sora', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s",
                boxShadow: search ? `0 0 0 3px ${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}` : "none"
              }} />
            {search && (
              <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: dark ? "#6B7280" : "#9CA3AF", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
            )}
          </div>

          {/* Notif */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${border}`, borderRadius: 10, width: 38, height: 38, cursor: "pointer", color: textSecondary, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              🔔
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: dark ? "#EF4444" : "#DC2626", borderRadius: "50%", border: `2px solid ${surface}`, animation: "pulse 2s infinite" }} />
            </button>
            {notifOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", zIndex: 50, boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.6)" : "0 20px 60px rgba(0,0,0,0.15)", animation: "fadeSlideUp 0.2s ease" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", color: textSecondary }}>NOTIFICATIONS</div>
                {NOTIFS.map((n, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, alignItems: "flex-start", background: n.read ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)") }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: n.color, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: textPrimary }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Commissioner Sharma</div>
              <div style={{ fontSize: 10, color: textSecondary }}>Municipal Corporation</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#F97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 }}>CS</div>
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeNav === "overview" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Overview Dashboard</h2>
              {/* STAT CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <StatCard label="TOTAL GRIEVANCES" value={STATS.total} sub={`+${STATS.todayNew} today`} accent={dark ? "#818CF8" : "#6366F1"} icon="◈" dark={dark} delay={0} />
                <StatCard label="PENDING" value={STATS.pending} sub={`${STATS.inProgress} in progress`} accent={dark ? "#FBBF24" : "#D97706"} icon="⏳" dark={dark} delay={80} />
                <StatCard label="SLA COMPLIANCE" value={`${STATS.slaCompliance}%`} sub={`${STATS.avgResolution}h avg resolution`} accent={dark ? "#4ADE80" : "#16A34A"} icon="◎" dark={dark} delay={160} />
                <StatCard label="ESCALATED / CRITICAL" value={STATS.escalated} sub={`${STATS.critical} critical active`} accent={dark ? "#EF4444" : "#DC2626"} icon="⚡" dark={dark} delay={240} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Critical Issues</h3>
                  {GRIEVANCES.filter(g => g.priority === 'critical' || g.priority === 'high').slice(0, 3).map((g, i) => (
                    <div key={g.id} onClick={() => setSelected(g)} style={{ padding: "12px 0", borderBottom: i < 2 ? `1px solid ${border}` : 'none', cursor: "pointer", display: "flex", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{CAT_ICONS[g.category as keyof typeof CAT_ICONS]}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{g.title}</div>
                        <div style={{ fontSize: 11, color: textSecondary, marginTop: 4 }}>{g.address} · {g.ward}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>System Health</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span>Vision Auditor Uptime</span><span style={{color: dark ? "#4ADE80" : "#16A34A"}}>99.9%</span></div>
                      <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 2 }}><div style={{ width: "99.9%", height: "100%", background: dark ? "#4ADE80" : "#16A34A", borderRadius: 2 }}></div></div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}><span>Bedrock Triage Latency</span><span style={{color: dark ? "#FBBF24" : "#D97706"}}>1.2s</span></div>
                      <div style={{ height: 4, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 2 }}><div style={{ width: "70%", height: "100%", background: dark ? "#FBBF24" : "#D97706", borderRadius: 2 }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeNav === "grievances" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>All Grievances</h2>
              </div>
              {/* TOOLBAR */}
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
                  {["all", "pending", "in-progress", "critical", "escalated", "resolved"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                      background: filterStatus === s ? (dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)") : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                      border: `1px solid ${filterStatus === s ? (dark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.3)") : border}`,
                      color: filterStatus === s ? accent : textSecondary,
                      borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700,
                      fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", transition: "all 0.15s",
                      textTransform: "capitalize"
                    }}>{s === "all" ? "All" : s}</button>
                  ))}
                </div>

                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "7px 12px", color: textSecondary, fontSize: 11, cursor: "pointer", fontFamily: "'DM Mono', monospace", outline: "none" }}>
                  <option value="urgency">Sort: Urgency</option>
                  <option value="severity">Sort: Severity</option>
                  <option value="recent">Sort: Recent</option>
                </select>

                <div style={{ display: "flex", gap: 4 }}>
                  {[["grid", "⊞"], ["list", "☰"]].map(([m, icon]) => (
                    <button key={m} onClick={() => setViewMode(m)} style={{ background: viewMode === m ? (dark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.12)") : "transparent", border: `1px solid ${viewMode === m ? (dark ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.3)") : border}`, color: viewMode === m ? accent : textSecondary, borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>{icon}</button>
                  ))}
                </div>
              </div>

              {/* GRID VIEW */}
              {viewMode === "grid" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {filtered.map((g, i) => (
                    <GrievanceCard key={g.id} g={g} dark={dark} onClick={setSelected} index={i} />
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: textSecondary, fontSize: 14 }}>No grievances match your filter.</div>
                  )}
                </div>
              )}

              {/* LIST VIEW */}
              {viewMode === "list" && (
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 120px 130px 110px 80px", gap: 16, padding: "10px 18px", borderBottom: `1px solid ${border}` }}>
                    {["ISSUE", "STATUS", "WARD", "SLA", "PRIORITY", "SCORE"].map(h => (
                      <div key={h} style={{ fontSize: 9, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{h}</div>
                    ))}
                  </div>
                  {filtered.map((g, i) => (
                    <div key={g.id} onClick={() => setSelected(g)} style={{
                      display: "grid", gridTemplateColumns: "1fr 130px 120px 130px 110px 80px", gap: 16,
                      padding: "14px 18px", borderBottom: `1px solid ${border}`, cursor: "pointer",
                      transition: "background 0.15s", alignItems: "center",
                      animation: `fadeSlideUp 0.3s ease ${i * 50}ms both`
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <div>
                        <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>{g.id}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: textPrimary, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</div>
                      </div>
                      <Pill status={g.status as keyof typeof STATUS_MAP} dark={dark} />
                      <span style={{ fontSize: 12, color: textSecondary }}>{g.ward}</span>
                      <SLABar reportedAt={g.reportedAt} slaHours={g.slaHours} compact dark={dark} />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <PriorityDot priority={g.priority as keyof typeof PRIORITY_MAP} dark={dark} />
                        <span style={{ fontSize: 11, color: PRIORITY_MAP[g.priority as keyof typeof PRIORITY_MAP]?.[dark ? "dark" : "light"], fontFamily: "'DM Mono', monospace", textTransform: "capitalize" }}>{g.priority}</span>
                      </div>
                      {g.score != null ? <ScoreRing score={g.score} dark={dark} size={36} /> : <span style={{ color: dark ? "#374151" : "#E5E7EB", fontSize: 12 }}>—</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeNav === "departments" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Department Performance</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {DEPARTMENTS.map((dept, i) => (
                  <div key={dept.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 20, animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{dept.id}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>{dept.name}</div>
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◫</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>ACTIVE</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 4 }}>{dept.active}</div>
                      </div>
                      <div style={{ background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>RESOLVED</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 4 }}>{dept.resolved}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: `1px solid ${border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: textSecondary }}>HOD: <span style={{ color: textPrimary, fontWeight: 600 }}>{dept.head}</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ScoreRing score={dept.sla} dark={dark} size={28} />
                        <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: textSecondary }}>SLA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === "wards" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Ward Monitoring</h2>
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px 100px", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${border}`, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
                  {["WARD", "ZONE", "COUNCILLOR", "ISSUES", "CRITICAL"].map(h => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: textSecondary, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{h}</div>
                  ))}
                </div>
                {WARDS.map((w, i) => (
                  <div key={w.id} style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px 100px 100px", gap: 16, padding: "16px 20px", borderBottom: `1px solid ${border}`, alignItems: "center", animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
                    <div>
                      <div style={{ fontSize: 10, color: textSecondary, fontFamily: "'DM Mono', monospace" }}>{w.id}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{w.name}</div>
                    </div>
                    <div style={{ fontSize: 13 }}>{w.zone}</div>
                    <div style={{ fontSize: 13, color: textSecondary }}>{w.councillor}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{w.issues}</div>
                    <div>
                      <span style={{ background: w.critical > 5 ? (dark ? "#4C0519" : "#FFF1F2") : (dark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), color: w.critical > 5 ? (dark ? "#FB7185" : "#E11D48") : textSecondary, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace", border: `1px solid ${w.critical > 5 ? (dark ? "#881337" : "#FECDD3") : border}` }}>
                        {w.critical}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === "analytics" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Analytics & Insights</h2>
              <p style={{ fontSize: 14, color: textSecondary, maxWidth: 400 }}>Comprehensive charts and performance metrics powered by AWS QuickSight will be available here.</p>
            </div>
          )}

          {activeNav === "reports" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease" }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Automated Reports</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { title: "Monthly SLA Compliance Report", type: "PDF", date: "Mar 1, 2026" },
                  { title: "Ward-wise Grievance Distribution", type: "CSV", date: "Mar 1, 2026" },
                  { title: "Vision Auditor Success Rates", type: "PDF", date: "Feb 28, 2026" },
                  { title: "Citizen Verification Logs", type: "CSV", date: "Feb 25, 2026" },
                ].map((r, i) => (
                  <div key={i} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", animation: `fadeSlideUp 0.3s ease ${i * 50}ms both` }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: textSecondary, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Generated: {r.date}</div>
                    </div>
                    <button style={{ background: dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)", color: accent, border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
                      Download {r.type}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === "settings" && (
            <div style={{ animation: "fadeSlideUp 0.3s ease", maxWidth: 600 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>System Settings</h2>
              
              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: `1px solid ${border}`, paddingBottom: 12 }}>Escalation Thresholds</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Auto-Generate RTI</div>
                    <div style={{ fontSize: 11, color: textSecondary }}>When SLA breaches by specified hours</div>
                  </div>
                  <select style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}>
                    <option>+24 Hours</option>
                    <option>+48 Hours</option>
                    <option>+72 Hours</option>
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Social Media Pressure</div>
                    <div style={{ fontSize: 11, color: textSecondary }}>Auto-tweet when cluster exceeds threshold</div>
                  </div>
                  <select style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px", color: textPrimary, outline: "none" }}>
                    <option>10 Issues / km²</option>
                    <option>20 Issues / km²</option>
                    <option>50 Issues / km²</option>
                  </select>
                </div>
              </div>

              <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, borderBottom: `1px solid ${border}`, paddingBottom: 12 }}>Vision Auditor</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Strict FOV Matching</div>
                    <div style={{ fontSize: 11, color: textSecondary }}>Require 100% landmark matching for resolution</div>
                  </div>
                  <div style={{ width: 44, height: 24, background: accent, borderRadius: 12, position: "relative", cursor: "pointer" }}>
                    <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, right: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* DRAWER */}
      {selected && <DetailDrawer g={selected} dark={dark} onClose={() => setSelected(null)} />}
    </div>
  );
}