'use client';

import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { STATUS_MAP, PRIORITY_MAP } from '@/lib/mock-data';

export function Pill({ status, dark }: { status: keyof typeof STATUS_MAP, dark: boolean }) {
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  const c = dark ? cfg.dark : cfg.light;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

export function PriorityDot({ priority, dark }: { priority: keyof typeof PRIORITY_MAP, dark: boolean }) {
  const color = dark ? PRIORITY_MAP[priority]?.dark : PRIORITY_MAP[priority]?.light;
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: priority === "critical" ? `0 0 6px ${color}` : "none", flexShrink: 0 }} />;
}

export function SLABar({ reportedAt, slaHours, compact, dark }: { reportedAt: number, slaHours: number, compact?: boolean, dark: boolean }) {
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

export function SLARing({ reportedAt, slaHours, dark, size = 52 }: { reportedAt: number, slaHours: number, dark: boolean, size?: number }) {
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

export function ScoreRing({ score, dark, size = 44 }: { score: number, dark: boolean, size?: number }) {
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
